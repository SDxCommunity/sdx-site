import { parseLumaIcs, SDX_CALENDAR_API_ID } from '@/lib/luma-ics';

/** Which calendar an event belongs to: the main SDx calendar or a chapter's. */
export type Chapter = 'sdx' | 'ucsd' | 'sdsu';

export const CHAPTER_LABELS: Record<Chapter, string> = {
  sdx: 'SDx',
  ucsd: 'UCSD',
  sdsu: 'SDSU',
};

/** One event on the events page, from any SDx calendar on Luma. */
export type NetworkEvent = {
  id: string;
  title: string;
  chapter: Chapter;
  startDate: string;
  endDate: string;
  timezone: string;
  location: string | null;
  eventUrl: string;
  /** The cover image from the Luma event page. */
  coverUrl: string | null;
  /** A few sentences from the Luma description. Upcoming events only. */
  summary: string;
  /** True until the event ends. */
  isUpcoming: boolean;
};

/** Chapter calendars come first, so an event on two calendars keeps its chapter. */
const CALENDARS: { chapter: Chapter; id: string }[] = [
  { chapter: 'ucsd', id: 'cal-KkffVW3dzHMQmAx' },
  // SDxSDSU has no public calendar: its events sit on the chapter account's personal calendar.
  { chapter: 'sdsu', id: 'cal-x04FwB1kCpH0kRE' },
  { chapter: 'sdx', id: SDX_CALENDAR_API_ID },
];

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/** Some chapter events, such as the SDSU Kickoff, sit on the main calendar. */
function chapterFromTitle(title: string): Chapter | null {
  if (/SDSU|San Diego State/i.test(title)) return 'sdsu';
  if (/UCSD|UC San Diego/i.test(title)) return 'ucsd';
  return null;
}

/** One calendar's events from its public iCalendar feed, or null when the feed is down. */
async function fetchCalendar(id: string) {
  try {
    const res = await fetch(`https://api.lu.ma/ics/get?entity=calendar&id=${id}`, {
      headers: { accept: 'text/calendar' },
      next: { revalidate: 10 * 60 },
    });
    if (!res.ok) return null;
    const events = parseLumaIcs(await res.text());
    return events.length > 0 ? events : null;
  } catch {
    return null;
  }
}

type Detail = { coverUrl: string | null; summary: string; timezone: string | null; address: string | null };

type MirrorNode = { type?: string; text?: string; content?: MirrorNode[] };

/** The text of each paragraph in a Luma description, which Luma sends as a ProseMirror doc. */
function paragraphs(node: MirrorNode | null | undefined, out: string[] = []): string[] {
  if (!node) return out;
  if (node.type === 'paragraph' || node.type === 'heading') {
    const text = (node.content ?? [])
      .map((child) => (child.type === 'hard_break' ? ' ' : child.text ?? ''))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) out.push(text);
    return out;
  }
  (node.content ?? []).forEach((child) => paragraphs(child, out));
  return out;
}

/** Emoji, built at runtime: the `u` flag needs an ES2015 target. */
const EMOJI = new RegExp('\\p{Extended_Pictographic}\\uFE0F?', 'gu');

const squash = (text: string) => text.replace(EMOJI, '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * The first two full sentences of prose in a description. Descriptions often
 * open with the title again and a date-and-place line, which the page already shows.
 */
function summarize(blocks: string[], title: string): string {
  const name = squash(title);
  const prose = blocks.map((block) => block.replace(EMOJI, '').trim()).filter((block) => block && squash(block) !== name);
  const sentences = prose.filter((block) => block.length >= 60 && /[.!?)"”]$/.test(block));
  return (sentences.length > 0 ? sentences : prose).slice(0, 2).join(' ');
}

/** The last good detail per event. `next.revalidate` does not cache in `next dev`. */
const detailMemo = new Map<string, { at: number; detail: Detail }>();

/** The cover, description, and time zone from the Luma event page's data. */
async function fetchDetail(id: string, title: string, upcoming: boolean): Promise<Detail | null> {
  const ttl = upcoming ? HOUR : DAY;
  const hit = detailMemo.get(id);
  if (hit && Date.now() - hit.at < ttl * 1000) return hit.detail;

  try {
    const res = await fetch(`https://api.lu.ma/event/get?event_api_id=${id}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: ttl },
    });
    if (!res.ok) return hit?.detail ?? null;
    const json = await res.json();
    const event = json?.event ?? {};
    const detail: Detail = {
      coverUrl: typeof event.cover_url === 'string' && event.cover_url ? event.cover_url : null,
      summary: summarize(paragraphs(json?.description_mirror), title),
      timezone: typeof event.timezone === 'string' ? event.timezone : null,
      address: event.geo_address_json?.address ?? null,
    };
    detailMemo.set(id, { at: Date.now(), detail });
    return detail;
  } catch {
    return hit?.detail ?? null;
  }
}

/** Runs `fn` over `items`, at most `size` at a time, so Luma sees a few requests at once. */
async function mapPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      out[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return out;
}

/**
 * Every event on the main SDx, SDxUCSD, and SDxSDSU calendars, newest first, each with
 * its Luma cover. `ok` is false when every calendar feed failed.
 */
export async function getNetworkEvents(): Promise<{ events: NetworkEvent[]; ok: boolean }> {
  const feeds = await Promise.all(CALENDARS.map((calendar) => fetchCalendar(calendar.id)));
  const now = Date.now();

  const seen = new Set<string>();
  const merged = CALENDARS.flatMap((calendar, index) =>
    (feeds[index] ?? [])
      .filter((event) => {
        if (seen.has(event.id)) return false;
        seen.add(event.id);
        return true;
      })
      .map((event) => ({
        event,
        chapter: calendar.chapter === 'sdx' ? chapterFromTitle(event.title) ?? 'sdx' : calendar.chapter,
        upcoming: new Date(event.endDate).getTime() > now,
      }))
  );

  const details = await mapPool(merged, 6, ({ event, upcoming }) => fetchDetail(event.id, event.title, upcoming));

  const events: NetworkEvent[] = merged.map(({ event, chapter, upcoming }, index) => {
    const detail = details[index];
    const location = event.location && event.location !== 'Location TBD' ? event.location : detail?.address ?? null;
    return {
      id: event.id,
      title: event.title,
      chapter,
      startDate: event.startDate,
      endDate: event.endDate,
      timezone: detail?.timezone || event.timezone,
      location,
      eventUrl: event.eventUrl,
      coverUrl: detail?.coverUrl ?? null,
      summary: upcoming ? detail?.summary ?? '' : '',
      isUpcoming: upcoming,
    };
  });

  events.sort((a, b) => b.startDate.localeCompare(a.startDate));
  return { events, ok: feeds.some(Boolean) };
}
