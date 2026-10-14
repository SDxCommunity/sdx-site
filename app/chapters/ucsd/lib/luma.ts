import media from './media';

/** SDx @ UC San Diego Luma calendar — verified calendar_api_id */
const UCSD_CALENDAR_API_ID = 'cal-KkffVW3dzHMQmAx';

const LUMA_ITEMS_URL = 'https://api.lu.ma/calendar/get-items';

export type UcsdEvent = {
  id: string;
  title: string;
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

function normalizeEntry(entry: LumaEntry): UcsdEvent | null {
  const event = entry?.event;
  if (!event || !event.api_id || !event.name || !event.start_at || !event.url) {
    return null;
  }

  const location =
    event.geo_address_info?.short_address ||
    event.geo_address_info?.city_state ||
    null;

  return {
    id: event.api_id,
    title: event.name,
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
    title: event.title,
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
      events: events === null ? [] : [...events].sort((a, b) => a.date.localeCompare(b.date)),
      fallback: events === null,
    };
  }

  const events = await fetchLumaItems('past');
  const usedFallback = events === null || events.length === 0;
  const resolved = usedFallback ? fallbackPastEvents() : events;

  return {
    events: [...resolved].sort((a, b) => b.date.localeCompare(a.date)),
    fallback: usedFallback,
  };
}
