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
 * Events that are not on the UCSD Luma calendar but belong on the timeline.
 * Dates are ISO start times; a noon-Pacific time keeps the shown date right.
 */
const EXTRA_EVENTS: UcsdEvent[] = [
  {
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

async function fetchLumaItems(period: 'future' | 'past'): Promise<UcsdEvent[] | null> {
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
