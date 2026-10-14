'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import MotionSection from '@/app/components/motion/MotionSection';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';
import { UCSD_LUMA, UCSD_LUMA_PAST } from '../lib/links';

type UcsdEventKind = 'major' | 'feature' | 'regular';

type UcsdEventItem = {
  id: string;
  title: string;
  kind?: UcsdEventKind;
  date: string;
  endDate: string | null;
  timezone: string;
  url: string;
  cover: string | null;
  location: string | null;
};

/** Vertical center of the timeline dots, so the track lines pass through them. */
const TRACK_TOP = 'top-[10px]';

function formatDate(iso: string, timeZone: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  });
}

/**
 * Horizontal timeline. Time runs right to left: upcoming events sit left of the
 * "Today" marker, past events run to the right from newest to oldest.
 */
export default function PastEvents({ compact = false }: { compact?: boolean }) {
  const [upcoming, setUpcoming] = useState<UcsdEventItem[]>([]);
  const [past, setPast] = useState<UcsdEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [upcomingRes, pastRes] = await Promise.all([
          fetch('/api/chapters/ucsd/events?filter=upcoming').then((r) => r.json()),
          fetch('/api/chapters/ucsd/events?filter=past').then((r) => r.json()),
        ]);
        if (cancelled) return;
        setUpcoming(Array.isArray(upcomingRes?.events) ? upcomingRes.events : []);
        setPast(Array.isArray(pastRes?.events) ? pastRes.events : []);
      } catch {
        if (!cancelled) {
          setUpcoming([]);
          setPast([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Latest first on both sides, so the soonest upcoming event sits next to "Today".
  const upcomingDesc = useMemo(
    () => [...upcoming].sort((a, b) => b.date.localeCompare(a.date)),
    [upcoming]
  );
  const pastDesc = useMemo(() => {
    const sorted = [...past].sort((a, b) => b.date.localeCompare(a.date));
    return compact ? sorted.slice(0, 12) : sorted;
  }, [past, compact]);

  return (
    <section className="relative py-14 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <MotionSection>
          <h2 className="font-display text-3xl md:text-5xl text-white tracking-tight leading-[1.08] prismatic-glow-sm">
            Events
          </h2>
          <a
            href={UCSD_LUMA}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-white/50 underline underline-offset-4 decoration-white/20 hover:text-white/85 hover:decoration-white/40 transition-colors"
          >
            See all events on Luma
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          </a>
        </MotionSection>

        <MotionSection delay={0.08} className="mt-10">
          {loading ? (
            <div className="h-24 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b border-white/20" />
            </div>
          ) : (
            <div
              className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 overflow-x-auto pb-4 [mask-image:linear-gradient(to_right,black_88%,transparent)]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
            >
              <ol className="flex items-stretch w-max pt-2">
                {/* Upcoming: dashed track, since these dates have not happened yet */}
                <li className="relative flex">
                  <span
                    className={`absolute ${TRACK_TOP} left-0 right-0 border-t border-dashed border-white/25`}
                    aria-hidden="true"
                  />
                  {upcomingDesc.length === 0 ? (
                    <ul className="flex">
                      <TimelineSlot
                        href={UCSD_LUMA}
                        variant="featured"
                        dot={<span className="block h-2.5 w-2.5 rounded-full border border-dashed border-white/50 bg-black" />}
                      >
                        <span className="font-display text-lg text-white/85 tracking-tight group-hover:text-white transition-colors">
                          More events
                          <br />
                          coming soon
                        </span>
                      </TimelineSlot>
                    </ul>
                  ) : (
                    <ul className="flex">
                      {upcomingDesc.map((event) => (
                        <TimelineEvent key={event.id} event={event} variant="featured" />
                      ))}
                    </ul>
                  )}
                </li>

                <TodayMarker />

                {/* Past: solid track that fades toward older events */}
                <li className="relative flex">
                  <span
                    className={`absolute ${TRACK_TOP} left-0 right-0 h-px bg-gradient-to-r from-white/35 via-white/15 to-white/5`}
                    aria-hidden="true"
                  />
                  <ul className="flex">
                    {pastDesc.map((event) => (
                      <TimelineEvent key={event.id} event={event} />
                    ))}
                    <TimelineSlot
                      href={UCSD_LUMA_PAST}
                      variant="archive"
                      dot={<span className="block h-2.5 w-2.5 rounded-full border border-white/30 bg-black" />}
                    >
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-white/45 group-hover:text-white/80 transition-colors">
                        All past events
                        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                    </TimelineSlot>
                    {/* Room to scroll the last box clear of the right-edge fade */}
                    <li className="w-40 shrink-0" aria-hidden="true" />
                  </ul>
                </li>
              </ol>
            </div>
          )}
        </MotionSection>
      </div>
    </section>
  );
}

function TodayMarker() {
  return (
    <li className="relative w-48 shrink-0 flex justify-center" aria-label="Today">
      {/* Both tracks run into the marker so the line reads as continuous */}
      <span className={`absolute ${TRACK_TOP} left-0 w-1/2 border-t border-dashed border-white/25`} aria-hidden="true" />
      <span className={`absolute ${TRACK_TOP} right-0 w-1/2 h-px bg-white/35`} aria-hidden="true" />
      <span className="absolute -top-2 h-11 left-1/2 w-px -translate-x-1/2 bg-white/80" aria-hidden="true" />
      <span className="relative z-10 mt-9 h-fit rounded-sm border border-white/60 bg-black px-2 py-1 text-xs text-white">
        Today
      </span>
    </li>
  );
}

/**
 * Box styles. "featured" (upcoming events and the "coming soon" placeholder) is
 * 1.5x wider and taller and sits on the same color field as the hero stats bar.
 * "archive" (the link to every past event) is grey with faint diagonal stripes.
 */
type SlotVariant = 'default' | 'featured' | 'archive';

const ARCHIVE_STRIPES =
  'repeating-linear-gradient(135deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 7px)';

/** One stop on the timeline: a dot on the track, a short stem, then a box. */
function TimelineSlot({
  href,
  dot,
  variant = 'default',
  children,
}: {
  href: string;
  dot: React.ReactNode;
  variant?: SlotVariant;
  children: React.ReactNode;
}) {
  const featured = variant === 'featured';
  const archive = variant === 'archive';

  return (
    <li className={`relative shrink-0 px-2 ${featured ? 'w-72' : 'w-48'}`}>
      <a href={href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center">
        <span className="relative z-10 flex h-5 items-center justify-center transition-transform duration-300 group-hover:scale-125">
          {dot}
        </span>
        <span className="h-4 w-px bg-white/15 group-hover:bg-white/35 transition-colors" aria-hidden="true" />
        <span
          className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-sm border border-white/10 px-4 py-3.5 text-center transition-[border-color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-white/30 ${
            featured ? 'h-[11.25rem] bg-black' : archive ? 'h-[7.5rem] bg-neutral-950' : 'h-[7.5rem] bg-black/70'
          }`}
          style={archive ? { backgroundImage: ARCHIVE_STRIPES } : undefined}
        >
          {featured && <PrismaticCanvas intensity="medium" />}
          {/* Text ignores the pointer so mouse moves reach the color field underneath */}
          <span className="pointer-events-none relative z-10 flex flex-col items-center">{children}</span>
        </span>
      </a>
    </li>
  );
}

const DOT_BY_KIND: Record<UcsdEventKind, string> = {
  major: 'h-3.5 w-3.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.55)]',
  feature: 'h-2.5 w-2.5 bg-white/70',
  regular: 'h-2 w-2 bg-white/35',
};

function TimelineEvent({ event, variant = 'default' }: { event: UcsdEventItem; variant?: SlotVariant }) {
  const tz = event.timezone || 'America/Los_Angeles';
  const kind = event.kind ?? 'regular';

  return (
    <TimelineSlot
      href={event.url}
      variant={variant}
      dot={<span className={`block rounded-full ${DOT_BY_KIND[kind]}`} />}
    >
      <time dateTime={event.date} className="text-sm tabular-nums text-white/45 group-hover:text-white/65 transition-colors">
        {formatDate(event.date, tz)}
      </time>
      <span
        className={`mt-1 block font-display text-base tracking-tight leading-snug group-hover:text-white transition-colors ${
          kind === 'major' ? 'text-white' : 'text-white/75'
        }`}
      >
        {event.title}
      </span>
    </TimelineSlot>
  );
}
