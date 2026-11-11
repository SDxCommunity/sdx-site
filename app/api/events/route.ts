import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, getUpcomingEvents, getPastEvents } from '@/lib/luma-api';
import { getSdxIcsEvents } from '@/lib/luma-ics';
import { ProcessedEvent, LumaEventsResponse } from '@/types/luma';
import lumaEventsData from '@/data/events.json';

type Filter = 'all' | 'upcoming' | 'past';

/** Where the events came from: the Luma API, the public calendar feed, or the bundled demo list. */
type Source = 'api' | 'ics' | 'demo';

// Helper function to get location string from event
const getEventLocation = (event: any): string => {
  if (event.geo_address_json?.formatted_address) {
    return event.geo_address_json.formatted_address;
  }
  return 'Location TBD';
};

// Process the bundled demo data, the last fallback
const processLumaEventsFallback = (lumaData: LumaEventsResponse): ProcessedEvent[] => {
  const now = new Date();
  return lumaData.entries.map((entry) => {
    const event = entry.event;
    return {
      id: event.api_id,
      title: event.name,
      description: event.description,
      startDate: event.start_at,
      endDate: event.end_at,
      location: getEventLocation(event),
      eventUrl: event.url,
      coverUrl: event.cover_url,
      isUpcoming: new Date(event.start_at) > now,
      tags: event.tags.map((tag) => tag.name),
      timezone: event.timezone,
      meetingUrl: event.meeting_url || undefined,
      zoomMeetingUrl: event.zoom_meeting_url || undefined,
    };
  });
};

/** Applies the filter and limit the API applies: upcoming soonest first, the rest newest first. */
function applyFilter(events: ProcessedEvent[], filter: Filter, limit: number): ProcessedEvent[] {
  const now = new Date();
  const fresh = events.map((event) => ({ ...event, isUpcoming: new Date(event.startDate) > now }));
  if (filter === 'upcoming') {
    return fresh
      .filter((event) => event.isUpcoming)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, limit);
  }
  const sorted = fresh.sort((a, b) => b.startDate.localeCompare(a.startDate));
  return (filter === 'past' ? sorted.filter((event) => !event.isUpcoming) : sorted).slice(0, limit);
}

/** Without the API: the public calendar feed first, then the bundled demo list. */
async function fallbackEvents(filter: Filter, limit: number): Promise<{ events: ProcessedEvent[]; source: Source }> {
  const feed = await getSdxIcsEvents();
  if (feed) return { events: applyFilter(feed, filter, limit), source: 'ics' };
  const demo = processLumaEventsFallback(lumaEventsData as LumaEventsResponse);
  return { events: applyFilter(demo, filter, limit), source: 'demo' };
}

function respond(events: ProcessedEvent[], source: Source) {
  return NextResponse.json({
    success: true,
    data: events,
    count: events.length,
    usingFallback: source !== 'api',
    source,
  });
}

// GET /api/events - Fetch events from Lu.ma
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filterParam = searchParams.get('filter');
  const filter: Filter = filterParam === 'upcoming' || filterParam === 'past' ? filterParam : 'all';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    if (!process.env.LUMA_API_KEY) {
      console.log('No LUMA_API_KEY configured, using the public calendar feed');
      const { events, source } = await fallbackEvents(filter, limit);
      return respond(events, source);
    }

    let events: ProcessedEvent[];
    switch (filter) {
      case 'upcoming':
        events = await getUpcomingEvents(limit);
        break;
      case 'past':
        events = await getPastEvents(limit);
        break;
      case 'all':
      default:
        events = await getAllEvents(limit);
        break;
    }
    return respond(events, 'api');
  } catch (error) {
    console.error('Error fetching events from Lu.ma API, falling back to the calendar feed:', error);

    try {
      const { events, source } = await fallbackEvents(filter, limit);
      return respond(events, source);
    } catch (fallbackError) {
      console.error('Error processing fallback data:', fallbackError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch events',
          message: 'Both API and fallback data failed',
        },
        { status: 500 }
      );
    }
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
