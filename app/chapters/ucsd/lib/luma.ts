import media from './media';
import { UCSD_LUMA_PAST } from './links';

/** SDx @ UC San Diego Luma calendar — verified calendar_api_id */
const UCSD_CALENDAR_API_ID = 'cal-KkffVW3dzHMQmAx';

const LUMA_ITEMS_URL = 'https://api.lu.ma/calendar/get-items';

/** Sets the dot size and shade on the timeline: major > feature > regular. */
export type UcsdEventKind = 'major' | 'feature' | 'regular';

export type UcsdEvent = {
  id: string;
  title: string;
  kind: UcsdEventKind;
  /** ISO start_at */
  date: string;
  endDate: string | null;
  timezone: string;
  /** Full https://luma.com/<slug> link */
  url: string;
  cover: string | null;
  location: string | null;
};

type LumaGeoAddressInfo = {
  city_state?: string;
  full_address?: string;
  short_address?: string;
};

type LumaEvent = {
  api_id: string;
  name: string;
  start_at: string;
  end_at?: string;
  timezone?: string;
  url: string;
  cover_url?: string;
  geo_address_info?: LumaGeoAddressInfo;
};

type LumaEntry = {
  api_id: string;
  event: LumaEvent;
};

type LumaGetItemsResponse = {
  entries: LumaEntry[];
  has_more: boolean;
};

/**
 * Events the Luma calendar API does not return but that belong on the timeline:
 * ones run off the UCSD calendar, and ones the API has been seen to leave out.
 * An entry with a real Luma api_id is dropped when the API does return it.
 * Dates are ISO start times.
 */
const EXTRA_EVENTS: UcsdEvent[] = [
  {
    // On the UCSD calendar page, but missing from get-items as of 2026-10-14.
    id: 'evt-WtTBtvfTfWC8PLP',
    title: 'Fall Quarter Kickoff',
    kind: 'feature',
    date: '2026-10-04T23:00:00.000Z',
    endDate: null,
    timezone: 'America/Los_Angeles',
    url: 'https://luma.com/sbm57xj6',
    cover: null,
    location: null,
  },
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

/**
 * Drops the chapter prefix from Luma titles. "SDx @ UC San Diego - Tom Zheng Fireside"
 * becomes "Tom Zheng Fireside". A bare "SDx @ UC San Diego" is the weekly Builder Day.
 */
export function cleanEventTitle(raw: string): string {
  const title = raw
    .replace(/^\s*(SDx\s*@\s*UC San Diego|SDxUCSD|SDx)\b/i, '')
    .replace(/^\s*[-–—:]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return title || 'Builder Day';
}

export function eventKind(title: string): UcsdEventKind {
  if (/hack|\bYC\b|Y Combinator/i.test(title)) return 'major';
  if (title === 'Builder Day' || /lunch|dinner|meet\b/i.test(title)) return 'regular';
  return 'feature';
}

function withExtras(events: UcsdEvent[], filter: 'upcoming' | 'past'): UcsdEvent[] {
  const now = new Date().toISOString();
  const extras = EXTRA_EVENTS.filter((e) => (filter === 'upcoming' ? e.date >= now : e.date < now));
  const known = new Set(events.map((e) => e.id));
  return [...events, ...extras.filter((e) => !known.has(e.id))];
}

function normalizeEntry(entry: LumaEntry): UcsdEvent | null {
  const event = entry?.event;
  if (!event || !event.api_id || !event.name || !event.start_at || !event.url) {
    return null;
  }

  const location =
    event.geo_address_info?.short_address ||
    event.geo_address_info?.city_state ||
    null;

  const title = cleanEventTitle(event.name);

  return {
    id: event.api_id,
    title,
    kind: eventKind(title),
    date: event.start_at,
    endDate: event.end_at ?? null,
    timezone: event.timezone || 'America/Los_Angeles',
    url: `https://luma.com/${event.url}`,
    cover: event.cover_url ?? null,
    location,
  };
}

/**
 * Last good response per period. Luma rate-limits quickly, and `next.revalidate`
 * does not cache in `next dev`, so without this every page load costs two calls.
 * When a call fails, the last good list beats the bundled fallback.
 */
const MEMO_TTL_MS = 10 * 60 * 1000;
const memo = new Map<'future' | 'past', { at: number; events: UcsdEvent[] }>();

async function fetchLumaItems(period: 'future' | 'past'): Promise<UcsdEvent[] | null> {
  const cached = memo.get(period);
  if (cached && Date.now() - cached.at < MEMO_TTL_MS) return cached.events;
  const events = await fetchLumaItemsUncached(period);
  if (events === null) return cached?.events ?? null;
  memo.set(period, { at: Date.now(), events });
  return events;
}

async function fetchLumaItemsUncached(period: 'future' | 'past'): Promise<UcsdEvent[] | null> {
  try {
    const url = `${LUMA_ITEMS_URL}?calendar_api_id=${UCSD_CALENDAR_API_ID}&period=${period}&pagination_limit=50`;
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as LumaGetItemsResponse;
    if (!data || !Array.isArray(data.entries)) return null;

    const events = data.entries
      .map(normalizeEntry)
      .filter((e): e is UcsdEvent => e !== null);

    return events;
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
 * Upcoming or past events, plus whether the bundled fallback (rather than
 * the live Luma API) was used — consumed by the /api/chapters/ucsd/events route.
 */
export async function getUcsdEventsWithFallbackStatus(
  filter: 'upcoming' | 'past'
): Promise<{ events: UcsdEvent[]; fallback: boolean }> {
  if (filter === 'upcoming') {
    const events = await fetchLumaItems('future');
    return {
      events: withExtras(events ?? [], 'upcoming').sort((a, b) => a.date.localeCompare(b.date)),
      fallback: events === null,
    };
  }

  const events = await fetchLumaItems('past');
  const usedFallback = events === null || events.length === 0;
  const resolved = usedFallback ? fallbackPastEvents() : events;

  return {
    events: withExtras(resolved, 'past').sort((a, b) => b.date.localeCompare(a.date)),
    fallback: usedFallback,
  };
}
