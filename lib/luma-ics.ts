import type { ProcessedEvent } from '@/types/luma';

/** The main SDx calendar on Luma (lu.ma/sdx). */
export const SDX_CALENDAR_API_ID = 'cal-V10NR2qI5uuUnOH';

/**
 * The calendar's public subscription feed (iCalendar). It needs no API key and
 * lists every past and upcoming event, but it carries no cover images. The
 * events route reads it when LUMA_API_KEY is missing or the API call fails.
 */
const SDX_ICS_URL = `https://api.lu.ma/ics/get?entity=calendar&id=${SDX_CALENDAR_API_ID}`;

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

/** Parses a Luma calendar feed into events, newest first, skipping cancelled ones. */
export function parseLumaIcs(ics: string): ProcessedEvent[] {
  // Unfold lines: a line break followed by a space or tab continues the previous line.
  const text = ics.replace(/\r?\n[ \t]/g, '');
  const now = new Date();
  const events: ProcessedEvent[] = [];

  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const field = (name: string) => {
      const m = block.match(new RegExp(`^${name}(?:;[^:\\r\\n]*)?:(.*)$`, 'm'));
      return m ? unescapeIcs(m[1].trim()) : '';
    };

    if (field('STATUS').toUpperCase() === 'CANCELLED') continue;
    const id = field('UID').replace(/@.*$/, '');
    const title = field('SUMMARY');
    const startDate = icsDateToIso(field('DTSTART'));
    if (!id || !title || !startDate) continue;

    // The description starts "Get up-to-date information at: https://luma.com/<slug>".
    const link = field('DESCRIPTION').match(/https:\/\/(?:luma\.com|lu\.ma)\/(?!event\/)[A-Za-z0-9-]+/);
    // Events without a public address list their own Luma URL as the location.
    const place = field('LOCATION');

    events.push({
      id,
      title,
      description: '',
      startDate,
      endDate: icsDateToIso(field('DTEND')) ?? startDate,
      location: place && !/^https?:\/\//.test(place) ? place.split(',')[0] : 'Location TBD',
      eventUrl: link ? link[0].replace('https://lu.ma/', 'https://luma.com/') : `https://luma.com/event/${id}`,
      coverUrl: '',
      isUpcoming: new Date(startDate) > now,
      tags: [],
      timezone: 'America/Los_Angeles',
    });
  }

  return events.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/**
 * Last good feed. `next.revalidate` does not cache in `next dev`, so without this
 * every page load costs a call. When a call fails, the last good list wins.
 */
const MEMO_TTL_MS = 10 * 60 * 1000;
let memo: { at: number; events: ProcessedEvent[] } | null = null;

/** Every event on the main SDx calendar, newest first, or null when the feed is down. */
export async function getSdxIcsEvents(): Promise<ProcessedEvent[] | null> {
  if (memo && Date.now() - memo.at < MEMO_TTL_MS) return memo.events;

  try {
    const res = await fetch(SDX_ICS_URL, {
      headers: { accept: 'text/calendar' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return memo?.events ?? null;
    const events = parseLumaIcs(await res.text());
    if (events.length === 0) return memo?.events ?? null;
    memo = { at: Date.now(), events };
    return events;
  } catch {
    return memo?.events ?? null;
  }
}
