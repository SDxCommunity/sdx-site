'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import PageHeader from '@/app/components/PageHeader';
import SectionTitle from '@/app/components/SectionTitle';
import ArrowLink from '@/app/components/ArrowLink';
import ClosingCta from '@/app/components/ClosingCta';
import AsciiButton from '@/app/components/AsciiButton';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import MotionButton from '@/app/components/motion/MotionButton';
import { cleanTitle, eventSeries, SERIES_ACCENT, SERIES_LABELS, type Series } from '@/lib/sdx-events';
import { CHAPTER_LABELS, type NetworkEvent } from '@/lib/sdx-calendars';
import { SDX_LUMA } from '@/lib/links';

type Filter = 'all' | Series;
const FILTERS: Filter[] = ['all', 'paper-club', 'ai-coffee', 'hack-days', 'other'];

const STRIPES = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 7px)';

/** Archive tiles shown before "Show more". */
const PAGE = 12;

/**
 * A date part in the event's time zone. Node and browsers pick different
 * narrow spaces before "PM", so plain spaces keep server and client HTML equal.
 */
function inZone(event: NetworkEvent, iso: string, options: Intl.DateTimeFormatOptions) {
  return new Date(iso)
    .toLocaleString('en-US', { ...options, timeZone: event.timezone })
    .replace(/[   ]/g, ' ');
}

/** "4:30 – 8:30 PM", or "12:00 PM – Nov 9, 6:00 PM" when the event runs past midnight. */
function timeRange(event: NetworkEvent) {
  const time: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const start = inZone(event, event.startDate, time);
  if (!(event.endDate > event.startDate)) return start;
  const day = (iso: string) => inZone(event, iso, { year: 'numeric', month: 'numeric', day: 'numeric' });
  if (day(event.startDate) !== day(event.endDate)) {
    return `${start} – ${inZone(event, event.endDate, { month: 'short', day: 'numeric', ...time })}`;
  }
  const end = inZone(event, event.endDate, time);
  // Both in the afternoon: "4:30 – 8:30 PM".
  const period = start.slice(-2);
  return period === end.slice(-2) ? `${start.slice(0, -3)} – ${end}` : `${start} – ${end}`;
}

/** The chapter name, unless the title already says it. Main-calendar events get none. */
function chapterTag(event: NetworkEvent) {
  if (event.chapter === 'sdx') return null;
  const label = CHAPTER_LABELS[event.chapter];
  return new RegExp(label, 'i').test(event.title) ? null : label;
}

/** A quiet tile in the series color, for the rare event whose cover did not load. */
function CoverFallback({ event }: { event: NetworkEvent }) {
  const series = eventSeries(event.title);
  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{ backgroundImage: `radial-gradient(ellipse at 30% 20%, ${SERIES_ACCENT[series]}38 0%, transparent 60%), ${STRIPES}` }}
    >
      <span className="text-center font-display text-xl sm:text-2xl text-white/75 tracking-tight">
        {series === 'other' ? 'SDx' : SERIES_LABELS[series]}
      </span>
    </div>
  );
}

/** One upcoming event: the Luma cover on the left, the details and RSVP on the right. */
function UpcomingEvent({ event, priority }: { event: NetworkEvent; priority: boolean }) {
  const title = cleanTitle(event.title);
  const place = [event.location, chapterTag(event)].filter(Boolean).join(' · ');

  return (
    <article className="grid gap-7 py-10 first:pt-0 last:pb-0 md:grid-cols-12 md:gap-10 md:py-12 lg:gap-14">
      <a
        href={event.eventUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} on Luma`}
        className="group relative block aspect-square overflow-hidden rounded-lg bg-white/[0.03] md:col-span-5"
      >
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1152px) 470px, (min-width: 768px) 40vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <CoverFallback event={event} />
        )}
      </a>

      <div className="flex flex-col md:col-span-7">
        <time dateTime={event.startDate} className="font-display text-5xl md:text-6xl leading-none tracking-tight text-white">
          {inZone(event, event.startDate, { month: 'short', day: 'numeric' })}
        </time>
        <p className="mt-3 text-sm text-white/55">
          {inZone(event, event.startDate, { weekday: 'long' })} · {timeRange(event)}
        </p>

        <h3 className="mt-8 font-display text-2xl md:text-3xl leading-snug tracking-tight text-white" style={{ textWrap: 'balance' }}>
          {title}
        </h3>
        {place && <p className="mt-2 text-sm text-white/45">{place}</p>}
        {event.summary && (
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 line-clamp-5">{event.summary}</p>
        )}

        <div className="mt-8 md:mt-auto md:pt-8">
          <a
            href={event.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors duration-150 hover:bg-white/85"
          >
            RSVP
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

function ArchiveTile({ event }: { event: NetworkEvent }) {
  const tag = chapterTag(event);
  return (
    <a href={event.eventUrl} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] transition-[border-color,transform] duration-200 group-hover:-translate-y-1 group-hover:border-white/20">
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <CoverFallback event={event} />
        )}
      </div>
      <p className="mt-3 text-sm tabular-nums text-white/45">
        <time dateTime={event.startDate}>
          {inZone(event, event.startDate, { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
        {tag && ` · ${tag}`}
      </p>
      <h3 className="mt-1 line-clamp-2 font-display text-base md:text-lg leading-snug tracking-tight text-white/85 transition-colors group-hover:text-white">
        {cleanTitle(event.title)}
      </h3>
    </a>
  );
}

export default function EventsView({ events, failed }: { events: NetworkEvent[]; failed: boolean }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [shown, setShown] = useState(PAGE);

  const upcoming = useMemo(
    () => events.filter((event) => event.isUpcoming).sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [events]
  );
  const past = useMemo(() => events.filter((event) => !event.isUpcoming), [events]);

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { all: past.length, 'paper-club': 0, 'ai-coffee': 0, 'hack-days': 0, other: 0 };
    past.forEach((event) => {
      result[eventSeries(event.title)] += 1;
    });
    return result;
  }, [past]);

  const archive = useMemo(
    () => (filter === 'all' ? past : past.filter((event) => eventSeries(event.title) === filter)),
    [past, filter]
  );

  const pick = (next: Filter) => {
    setFilter(next);
    setShown(PAGE);
  };

  return (
    <main className="relative">
      <PageHeader
        title="Events"
        tone="cool"
        size="md"
        aside={
          <ArrowLink href={SDX_LUMA} className="md:text-base">
            Luma
          </ArrowLink>
        }
      />

      <section className="relative px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto">
          <MotionSection>
            <SectionTitle>Upcoming events</SectionTitle>
          </MotionSection>

          {failed ? (
            <p className="mt-8 text-sm md:text-base text-white/60">
              Events could not load right now. <ArrowLink href={SDX_LUMA}>See them on Luma</ArrowLink>
            </p>
          ) : upcoming.length === 0 ? (
            <p className="mt-8 text-sm md:text-base text-white/60">
              Nothing on the calendar yet. <ArrowLink href={SDX_LUMA}>Follow SDx on Luma</ArrowLink>
            </p>
          ) : (
            <MotionSection delay={0.1} className="mt-10 md:mt-12 divide-y divide-white/[0.08]">
              {upcoming.map((event, index) => (
                <UpcomingEvent key={event.id} event={event} priority={index === 0} />
              ))}
            </MotionSection>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section id="archive" className="relative scroll-mt-20 pb-14 md:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <MotionSection>
              <SectionTitle>Past events</SectionTitle>
            </MotionSection>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3" role="group" aria-label="Filter past events">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => pick(option)}
                  aria-pressed={filter === option}
                  className={`border-b pb-1.5 text-sm transition-colors duration-200 ${
                    filter === option ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/85'
                  }`}
                >
                  {option === 'all' ? 'All' : SERIES_LABELS[option]}
                  <span className="ml-1.5 tabular-nums text-white/35">{counts[option]}</span>
                </button>
              ))}
            </div>

            {archive.length === 0 ? (
              <p className="mt-10 text-sm md:text-base text-white/60">No past events in this series yet.</p>
            ) : (
              <MotionGrid
                key={filter}
                className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
                staggerDelay={0.04}
              >
                {archive.slice(0, shown).map((event) => (
                  <MotionCard key={event.id} enableHover={false}>
                    <ArchiveTile event={event} />
                  </MotionCard>
                ))}
              </MotionGrid>
            )}

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
              {archive.length > shown && (
                <button
                  type="button"
                  onClick={() => setShown((count) => count + PAGE)}
                  className="text-sm text-white/70 underline underline-offset-4 decoration-white/20 hover:text-white hover:decoration-white/40 transition-colors"
                >
                  Show more events
                </button>
              )}
              <ArrowLink href={SDX_LUMA}>Every event on Luma</ArrowLink>
            </div>
          </div>
        </section>
      )}

      <ClosingCta heading="Never miss an event.">
        <MotionButton className="inline-block">
          <Link href={SDX_LUMA} target="_blank" rel="noopener noreferrer" className="block">
            <AsciiButton>Follow on Luma</AsciiButton>
          </Link>
        </MotionButton>
      </ClosingCta>
    </main>
  );
}
