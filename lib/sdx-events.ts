import type { ProcessedEvent } from '@/types/luma';
import type { TimelineItem, TimelineKind } from '@/app/components/EventTimeline';

/** The recurring event series on the main calendar, used for the archive filter and the home collage. */
export type Series = 'paper-club' | 'ai-coffee' | 'hack-days' | 'other';

export const SERIES_LABELS: Record<Series, string> = {
  'paper-club': 'Paper Club',
  'ai-coffee': 'AI Coffee',
  'hack-days': 'Hack Days',
  other: 'Other',
};

/** Each series' color, for dots and tiles that have no cover. */
export const SERIES_ACCENT: Record<Series, string> = {
  'paper-club': '#11BBCD',
  'ai-coffee': '#FAC205',
  'hack-days': '#FC5715',
  other: '#03C661',
};

export function eventSeries(title: string): Series {
  if (/paper club/i.test(title)) return 'paper-club';
  if (/ai coffee/i.test(title)) return 'ai-coffee';
  if (/hack/i.test(title)) return 'hack-days';
  return 'other';
}

/** Emoji such as the lobsters in "🦞 OpenClaw SD: Showcase 🦞". Built at runtime: the `u` flag needs an ES2015 target. */
const EMOJI = new RegExp('\\p{Extended_Pictographic}\\uFE0F?', 'gu');

/**
 * Tidies Luma titles for small boxes: drops emoji and the "SDx" prefix of a
 * series name, and joins series and topic with a middle dot. "SDx Paper Club -
 * DeepSeek R1" becomes "Paper Club · DeepSeek R1".
 */
export function cleanTitle(raw: string): string {
  return raw
    .replace(EMOJI, '')
    .replace(/^\s*(?:SDx|AI)\s+(?=(?:Paper|Hack|Hacker)\b)/i, '')
    .replace(/\s+[-–—]\s+/, ' · ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Big events get the bright dot on the timeline; the weekly-ish AI Coffee gets the small one. */
const MAJOR_EVENT = /hackathon|\bYC\b|Y Combinator|showcase|summit|kickoff|demo day/i;

export function eventKind(title: string): TimelineKind {
  if (MAJOR_EVENT.test(title)) return 'major';
  if (/ai coffee/i.test(title)) return 'regular';
  return 'feature';
}

export function toTimelineItem(event: ProcessedEvent): TimelineItem {
  const title = cleanTitle(event.title);
  return {
    id: event.id,
    title,
    kind: eventKind(title),
    date: event.startDate,
    endDate: event.endDate || null,
    timezone: event.timezone || 'America/Los_Angeles',
    url: event.eventUrl,
  };
}

/** "Sep 26, 2025" in the event's own time zone. */
export function formatEventDate(event: ProcessedEvent): string {
  return new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: event.timezone || 'America/Los_Angeles',
  });
}
