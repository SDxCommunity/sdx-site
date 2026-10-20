import media from './media';
import { UCSD_LUMA_PAST } from './links';

/** SDx @ UC San Diego Luma calendar — verified calendar_api_id */
const UCSD_CALENDAR_API_ID = 'cal-KkffVW3dzHMQmAx';

/**
 * The calendar's public subscription feed (iCalendar). It lists every past and
 * upcoming event in one response. The JSON `calendar/get-items` endpoint used
 * before started answering 429 to every caller in October 2026, and it also left
 * out some events, such as the fall Kickoff.
 */
const UCSD_ICS_URL = `https://api.lu.ma/ics/get?entity=calendar&id=${UCSD_CALENDAR_API_ID}`;

/** Sets the dot size and shade on the timeline: major > feature > regular. */
export type UcsdEventKind = 'major' | 'feature' | 'regular';

export type UcsdEvent = {
  id: string;
  title: string;
  kind: UcsdEventKind;
  /** ISO start time */
  date: string;
  endDate: string | null;
  timezone: string;
  /** Full https://luma.com/<slug> link */
  url: string;
  cover: string | null;
  location: string | null;
};

/**
 * Events that are not on the UCSD Luma calendar but belong on the timeline.
 * An entry with a real Luma event id is dropped when the feed returns it.
 * Dates are ISO start times.
 */
const EXTRA_EVENTS: UcsdEvent[] = [
  {
    // Run with YC, not on the UCSD Luma calendar. Noon Pacific keeps the shown date right.
    id: 'extra-yc-fireside-2026-02-01',
    title: 'YC Fireside & Office Hours',
    kind: 'major',
    date: '2026-02-01T20:00:00.000Z',
    endDate: null,
    timezone: 'America/Los_Angeles',
    url: UCSD_LUMA_PAST,
    cover: null,
    location: 'UC San Diego',
  },
];

const CHAPTER_NAME = String.raw`(?:SDx\s*@\s*UC San Diego|SDxUCSD|SDx)`;
const JOINER = String.raw`(?:[-–—:]|x|×|<>)`;

/**
 * Drops the chapter name from Luma titles. "SDx @ UC San Diego - Tom Zheng Fireside"
 * becomes "Tom Zheng Fireside", "SDxUCSD x Vyra (YC F26) Fireside Chat" becomes
 * "Vyra (YC F26) Fireside Chat", and "Telora <> SDxUCSD" becomes "Telora".
 * A bare "SDx @ UC San Diego" is the weekly Builder Day.
 */
export function cleanEventTitle(raw: string): string {
  const title = raw
    .replace(new RegExp(String.raw`^\s*${CHAPTER_NAME}\b`, 'i'), '')
    .replace(new RegExp(String.raw`\s*${JOINER}\s*${CHAPTER_NAME}\s*$`, 'i'), '')
    .replace(new RegExp(String.raw`^\s*${JOINER}\s+`, 'i'), '')
    .replace(/^\s*[-–—:]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return title || 'Builder Day';
}

/** Big events: hackathons, YC events, and headline partner events. Add a partner name here to promote it. */
const MAJOR_EVENT = /hack|\bYC\b|Y Combinator|Telora/i;

export function eventKind(title: string): UcsdEventKind {
  if (MAJOR_EVENT.test(title)) return 'major';
  if (title === 'Builder Day' || /lunch|dinner|meet\b/i.test(title)) return 'regular';
  return 'feature';
}

function withExtras(events: UcsdEvent[], filter: 'upcoming' | 'past'): UcsdEvent[] {
  const now = new Date().toISOString();
  const extras = EXTRA_EVENTS.filter((e) => (filter === 'upcoming' ? e.date >= now : e.date < now));
  const known = new Set(events.map((e) => e.id));
  return [...events, ...extras.filter((e) => !known.has(e.id))];
}

/** Undoes iCalendar text escaping: backslash before n (a line break), a comma, a semicolon, or a backslash. */
function unescapeIcs(value: string): string {
  return value.replace(/\\([nN,;\\])/g, (_, ch) => (ch === 'n' || ch === 'N' ? '\n' : ch));
}

/** 20261102T180000Z or 20261102 to an ISO string. */
function icsDateToIso(value: string): string | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', se = '00'] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${se}.000Z`;
}

/** Parses the Luma feed into events, skipping cancelled ones. */
export function parseLumaIcs(ics: string): UcsdEvent[] {
  // Unfold lines: a line break followed by a space or tab continues the previous line.
  const text = ics.replace(/\r?\n[ \t]/g, '');
  const events: UcsdEvent[] = [];

  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const field = (name: string) => {
      const m = block.match(new RegExp(`^${name}(?:;[^:\\r\\n]*)?:(.*)$`, 'm'));
      return m ? unescapeIcs(m[1].trim()) : '';
    };

    if (field('STATUS').toUpperCase() === 'CANCELLED') continue;
    const id = field('UID').replace(/@.*$/, '');
    const summary = field('SUMMARY');
    const date = icsDateToIso(field('DTSTART'));
    if (!id || !summary || !date) continue;

    // The description starts "Get up-to-date information at: https://luma.com/<slug>".
    const link = field('DESCRIPTION').match(/https:\/\/(?:luma\.com|lu\.ma)\/(?!event\/)[A-Za-z0-9-]+/);
    const title = cleanEventTitle(summary);

    events.push({
      id,
      title,
      kind: eventKind(title),
      date,
      endDate: icsDateToIso(field('DTEND')),
      timezone: 'America/Los_Angeles',
      url: link ? link[0].replace('https://lu.ma/', 'https://luma.com/') : `https://luma.com/event/${id}`,
      cover: null,
      location: field('LOCATION').split(',')[0] || null,
    });
  }

  return events;
}

/**
 * Last good feed. `next.revalidate` does not cache in `next dev`, so without this
 * every page load costs a call. When a call fails, the last good list beats the
 * bundled fallback.
 */
const MEMO_TTL_MS = 10 * 60 * 1000;
let memo: { at: number; events: UcsdEvent[] } | null = null;

async function fetchCalendar(): Promise<UcsdEvent[] | null> {
  if (memo && Date.now() - memo.at < MEMO_TTL_MS) return memo.events;
  const events = await fetchCalendarUncached();
  if (events === null) return memo?.events ?? null;
  memo = { at: Date.now(), events };
  return events;
}

async function fetchCalendarUncached(): Promise<UcsdEvent[] | null> {
  try {
    const res = await fetch(UCSD_ICS_URL, {
      headers: { accept: 'text/calendar' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const events = parseLumaIcs(await res.text());
    return events.length > 0 ? events : null;
  } catch {
    return null;
  }
}

function fallbackPastEvents(): UcsdEvent[] {
  return media.past.map((event) => ({
    id: event.id,
    title: cleanEventTitle(event.title),
    kind: eventKind(cleanEventTitle(event.title)),
    date: event.date,
    endDate: null,
    timezone: event.timezone || 'America/Los_Angeles',
    url: event.url,
    cover: null,
    location: null,
  }));
}

/**
 * Upcoming or past events, plus whether the bundled fallback (rather than the
 * live Luma feed) was used — consumed by the /api/chapters/ucsd/events route.
 * An event stays upcoming until it ends.
 */
export async function getUcsdEventsWithFallbackStatus(
  filter: 'upcoming' | 'past'
): Promise<{ events: UcsdEvent[]; fallback: boolean }> {
  const all = await fetchCalendar();
  const now = new Date().toISOString();
  const isUpcoming = (e: UcsdEvent) => (e.endDate ?? e.date) >= now;

  if (filter === 'upcoming') {
    return {
      events: withExtras((all ?? []).filter(isUpcoming), 'upcoming').sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
      fallback: all === null,
    };
  }

  const resolved = all === null ? fallbackPastEvents() : all.filter((e) => !isUpcoming(e));
  return {
    events: withExtras(resolved, 'past').sort((a, b) => b.date.localeCompare(a.date)),
    fallback: all === null,
  };
}
