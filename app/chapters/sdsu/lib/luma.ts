/**
 * SDSU chapter events from two Luma iCalendar feeds:
 * - the SDxSDSU account's own calendar, which holds the Build Days and hackathons
 * - the main SDx calendar, which holds a few SDSU events, such as the fall Kickoff
 */
const SDSU_CALENDAR_ICS = 'https://api.lu.ma/ics/get?entity=calendar&id=cal-x04FwB1kCpH0kRE';
const MAIN_CALENDAR_ICS = 'https://api.lu.ma/ics/get?entity=calendar&id=cal-V10NR2qI5uuUnOH';

/** Picks the SDSU events out of the main SDx calendar. */
const SDSU_TITLE = /SDSU|San Diego State/i;

/** Sets the dot size and shade on the timeline: major > feature > regular. */
export type SdsuEventKind = 'major' | 'feature' | 'regular';

export type SdsuEvent = {
  id: string;
  title: string;
  kind: SdsuEventKind;
  /** ISO start time */
  date: string;
  endDate: string | null;
  timezone: string;
  /** Full https://luma.com/<slug> link */
  url: string;
  location: string | null;
};

const CHAPTER_NAME = String.raw`(?:SDx\s*@\s*(?:San Diego State(?: University)?|SDSU)|SDxSDSU|SDx)`;
const JOINER = String.raw`(?:[-–—:]|x|×|<>)`;

/**
 * Drops the chapter name from Luma titles: "SDxSDSU Voice Agent Hackathon" becomes
 * "Voice Agent Hackathon", and "Daytona x SDxSDSU" becomes "Daytona".
 */
export function cleanEventTitle(raw: string): string {
  const title = raw
    .replace(new RegExp(String.raw`^\s*${CHAPTER_NAME}\b`, 'i'), '')
    .replace(new RegExp(String.raw`\s*${JOINER}\s*${CHAPTER_NAME}\s*$`, 'i'), '')
    .replace(new RegExp(String.raw`^\s*${JOINER}\s+`, 'i'), '')
    .replace(/^\s*[-–—:]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return title || 'Build Day';
}

export function eventKind(title: string): SdsuEventKind {
  if (/hack|\bYC\b|Y Combinator/i.test(title)) return 'major';
  if (/build day|lunch|dinner|meet\b/i.test(title)) return 'regular';
  return 'feature';
}

/** Past events the timeline shows when the chapter's feed fails. Copied from Luma on 2026-11-11. */
const FALLBACK_PAST: SdsuEvent[] = [
  {
    id: 'evt-4cLD5BPhj85wsto',
    title: 'Voice Agent Hackathon',
    kind: 'major',
    date: '2026-11-08T20:00:00.000Z',
    endDate: '2026-11-09T02:00:00.000Z',
    timezone: 'America/Los_Angeles',
    url: 'https://luma.com/uan97kyo',
    location: 'Engineering & Interdisciplinary Science (EIS)',
  },
  {
    id: 'evt-bVwAgm2elCWbr7l',
    title: 'Build Day',
    kind: 'regular',
    date: '2026-10-26T00:30:00.000Z',
    endDate: null,
    timezone: 'America/Los_Angeles',
    url: 'https://luma.com/mkr83tug',
    location: 'Engineering & Interdisciplinary Science (EIS)',
  },
  {
    id: 'evt-5bw7BM0tZTBcAks',
    title: 'Build Day',
    kind: 'regular',
    date: '2026-10-12T00:00:00.000Z',
    endDate: null,
    timezone: 'America/Los_Angeles',
    url: 'https://luma.com/mz23d5pm',
    location: 'Engineering & Interdisciplinary Science (EIS)',
  },
  {
    id: 'evt-iwJ0cH2EeVr8oGH',
    title: 'Kickoff',
    kind: 'feature',
    date: '2026-09-13T23:00:00.000Z',
    endDate: null,
    timezone: 'America/Los_Angeles',
    url: 'https://luma.com/sdxsdsukickoff',
    location: 'SDSU ZIP Launchpad (Zahn Innovation Platform)',
  },
];

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

/** Parses a Luma feed into events, skipping cancelled ones. `keep` filters on the raw title. */
export function parseLumaIcs(ics: string, keep: (summary: string) => boolean = () => true): SdsuEvent[] {
  // Unfold lines: a line break followed by a space or tab continues the previous line.
  const text = ics.replace(/\r?\n[ \t]/g, '');
  const events: SdsuEvent[] = [];

  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const field = (name: string) => {
      const m = block.match(new RegExp(`^${name}(?:;[^:\\r\\n]*)?:(.*)$`, 'm'));
      return m ? unescapeIcs(m[1].trim()) : '';
    };

    if (field('STATUS').toUpperCase() === 'CANCELLED') continue;
    const id = field('UID').replace(/@.*$/, '');
    const summary = field('SUMMARY');
    const date = icsDateToIso(field('DTSTART'));
    if (!id || !summary || !date || !keep(summary)) continue;

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
      location: field('LOCATION').split(',')[0] || null,
    });
  }

  return events;
}

async function fetchFeed(url: string, keep?: (summary: string) => boolean): Promise<SdsuEvent[] | null> {
  try {
    const res = await fetch(url, {
      headers: { accept: 'text/calendar' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return parseLumaIcs(await res.text(), keep);
  } catch {
    return null;
  }
}

/**
 * Last good result. `next.revalidate` does not cache in `next dev`, so without this
 * every page load costs two calls. When a call fails, the last good list beats the
 * bundled fallback.
 */
const MEMO_TTL_MS = 10 * 60 * 1000;
let memo: { at: number; events: SdsuEvent[] } | null = null;

async function fetchCalendar(): Promise<SdsuEvent[] | null> {
  if (memo && Date.now() - memo.at < MEMO_TTL_MS) return memo.events;

  const [own, main] = await Promise.all([
    fetchFeed(SDSU_CALENDAR_ICS),
    fetchFeed(MAIN_CALENDAR_ICS, (summary) => SDSU_TITLE.test(summary)),
  ]);
  // The chapter's own feed is the source of truth. Without it, keep the last good list.
  if (own === null || own.length === 0) return memo?.events ?? null;

  const seen = new Set(own.map((e) => e.id));
  const events = [...own, ...(main ?? []).filter((e) => !seen.has(e.id))];
  memo = { at: Date.now(), events };
  return events;
}

/**
 * Upcoming or past events, plus whether the bundled fallback (rather than the
 * live Luma feeds) was used. The /api/chapters/sdsu/events route returns both.
 * An event stays upcoming until it ends.
 */
export async function getSdsuEventsWithFallbackStatus(
  filter: 'upcoming' | 'past'
): Promise<{ events: SdsuEvent[]; fallback: boolean }> {
  const all = await fetchCalendar();
  const now = new Date().toISOString();
  const isUpcoming = (e: SdsuEvent) => (e.endDate ?? e.date) >= now;

  if (filter === 'upcoming') {
    return {
      events: (all ?? []).filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date)),
      fallback: all === null,
    };
  }

  const resolved = all === null ? FALLBACK_PAST : all.filter((e) => !isUpcoming(e));
  return {
    events: [...resolved].sort((a, b) => b.date.localeCompare(a.date)),
    fallback: all === null,
  };
}
