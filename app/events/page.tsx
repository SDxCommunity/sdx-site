'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import PageHeader from '@/app/components/PageHeader';
import SectionTitle from '@/app/components/SectionTitle';
import ArrowLink from '@/app/components/ArrowLink';
import EventTimeline from '@/app/components/EventTimeline';
import ClosingCta from '@/app/components/ClosingCta';
import AsciiButton from '@/app/components/AsciiButton';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import MotionButton from '@/app/components/motion/MotionButton';
import { useSdxEvents } from '@/lib/useSdxEvents';
import {
  cleanTitle,
  eventSeries,
  formatEventDate,
  SERIES_LABELS,
  toTimelineItem,
  type Series,
} from '@/lib/sdx-events';
import { SDX_LUMA } from '@/lib/links';
import type { ProcessedEvent } from '@/types/luma';

type Program = { n: string; color: string; name: string; desc: string; series?: Series; href?: string };

const programs: Program[] = [
  { n: '01', color: '#D92C2D', name: 'Paper Club', desc: 'Deep dives into fundamental ML research. Come prepared to debate.', series: 'paper-club' },
  { n: '02', color: '#FC5715', name: 'AI Coffee', desc: 'Open discussion on the latest in AI. Practitioner-level signal.', series: 'ai-coffee' },
  { n: '03', color: '#FAC205', name: 'Hack Days', desc: 'Show up, build something real, demo what you made.', series: 'hack-days' },
  { n: '04', color: '#03C661', name: 'Hackathons', desc: 'Full-day build events with sponsor credits and prizes.', series: 'hack-days' },
  { n: '05', color: '#11BBCD', name: 'Executive Roundtables', desc: 'Peer-level AI implementation exchange for senior leaders.', href: '/executives' },
];

type Filter = 'all' | Series;
const FILTERS: Filter[] = ['all', 'paper-club', 'ai-coffee', 'hack-days', 'other'];

/** Accent behind archive tiles that have no cover image. */
const SERIES_ACCENT: Record<Series, string> = {
  'paper-club': '#11BBCD',
  'ai-coffee': '#FAC205',
  'hack-days': '#FC5715',
  other: '#03C661',
};

const STRIPES = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 7px)';

/** Archive tiles shown before "Show more". */
const PAGE = 12;

function ProgramRow({ program, onSelect }: { program: Program; onSelect: (series: Series) => void }) {
  const Icon = program.href ? ArrowRight : ArrowDown;
  const body = (
    <>
      <span className="font-mono text-[10px] md:text-xs font-bold" style={{ color: program.color }}>
        {program.n}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-2xl md:text-3xl text-white/85 tracking-tight transition-all duration-300 group-hover:text-white group-hover:translate-x-1.5">
          {program.name}
        </span>
        <span className="mt-1 block text-sm text-white/55 leading-snug md:hidden">{program.desc}</span>
      </span>
      <span className="flex items-center gap-8 self-center">
        <span className="hidden md:block max-w-[300px] text-sm text-white/55 leading-snug text-right">{program.desc}</span>
        <Icon
          className="h-3.5 w-3.5 text-white/40 md:text-white/60 md:opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-white"
          aria-hidden="true"
        />
      </span>
    </>
  );
  // The row bleeds past the column on both sides, so the hover band frames the text.
  const rowClass =
    'group grid w-[calc(100%+1rem)] md:w-[calc(100%+1.5rem)] grid-cols-[auto_1fr_auto] items-baseline gap-x-4 md:gap-x-8 py-4 md:py-5 border-b border-white/[0.06] text-left transition-colors duration-300 hover:bg-white/[0.02] px-2 md:px-3 -mx-2 md:-mx-3';

  if (program.href) {
    return (
      <Link href={program.href} className={rowClass}>
        {body}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={rowClass}
      onClick={() => program.series && onSelect(program.series)}
      aria-label={`${program.name}: show past events`}
    >
      {body}
    </button>
  );
}

function ArchiveTile({ event }: { event: ProcessedEvent }) {
  const series = eventSeries(event.title);
  const title = cleanTitle(event.title);

  return (
    <a href={event.eventUrl} target="_blank" rel="noopener noreferrer" className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] transition-[border-color,transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)]">
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-90 transition-[opacity,transform] duration-500 group-hover:opacity-100 group-hover:scale-[1.04]"
          />
        ) : (
          // No cover in the public feed: a quiet tile in the series color.
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            style={{
              backgroundImage: `radial-gradient(ellipse at 30% 20%, ${SERIES_ACCENT[series]}38 0%, transparent 60%), ${STRIPES}`,
            }}
          >
            <span className="text-center font-display text-xl sm:text-2xl text-white/75 tracking-tight">
              {series === 'other' ? 'SDx' : SERIES_LABELS[series]}
            </span>
          </div>
        )}
      </div>
      <time dateTime={event.startDate} className="mt-3 block text-sm tabular-nums text-white/45">
        {formatEventDate(event)}
      </time>
      <h3 className="mt-1 line-clamp-2 font-display text-base md:text-lg leading-snug tracking-tight text-white/85 transition-colors group-hover:text-white">
        {title}
      </h3>
    </a>
  );
}

export default function EventsPage() {
  const { events, loading, error, source } = useSdxEvents();
  const [filter, setFilter] = useState<Filter>('all');
  const [shown, setShown] = useState(PAGE);

  const upcoming = useMemo(() => events.filter((event) => event.isUpcoming), [events]);
  const past = useMemo(() => events.filter((event) => !event.isUpcoming), [events]);
  const timeline = useMemo(
    () => ({ upcoming: upcoming.map(toTimelineItem), past: past.map(toTimelineItem) }),
    [upcoming, past]
  );

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

  const showSeries = (series: Series) => {
    pick(series);
    document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="relative">
      <PageHeader
        title="Events"
        tone="cool"
        subtitle="Paper Club, AI Coffee, Hack Days, Hackathons, and more. Show up, build something, learn something."
      >
        <ArrowLink href={SDX_LUMA}>Follow the calendar on Luma</ArrowLink>
      </PageHeader>

      {/* Coming up and the latest few, on the same timeline as the home page */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-14 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <MotionSection delay={0.1}>
            <EventTimeline
              upcoming={timeline.upcoming}
              past={timeline.past}
              loading={loading}
              calendarHref={SDX_LUMA}
              archiveHref="#archive"
              archiveLabel="Browse the archive"
              maxPast={8}
            />
          </MotionSection>
        </div>
      </section>

      {/* Programs */}
      <section className="relative py-14 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <MotionSection>
            <SectionTitle>Programs</SectionTitle>
          </MotionSection>
          <MotionGrid className="mt-10 border-t border-white/[0.06]" staggerDelay={0.06}>
            {programs.map((program) => (
              <MotionCard key={program.n} enableHover={false}>
                <ProgramRow program={program} onSelect={showSeries} />
              </MotionCard>
            ))}
          </MotionGrid>
        </div>
      </section>

      {/* Archive */}
      <section id="archive" className="relative scroll-mt-20 py-14 md:py-16 px-4 sm:px-6 lg:px-8">
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
                  filter === option
                    ? 'border-white text-white'
                    : 'border-transparent text-white/50 hover:text-white/85'
                }`}
              >
                {option === 'all' ? 'All' : SERIES_LABELS[option]}
                <span className="ml-1.5 tabular-nums text-white/35">{counts[option]}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="h-40 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b border-white/20" />
            </div>
          ) : error ? (
            <p className="mt-10 text-sm md:text-base text-white/60">
              Events could not load right now.{' '}
              <ArrowLink href={SDX_LUMA}>See them on Luma</ArrowLink>
            </p>
          ) : archive.length === 0 ? (
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

          {!loading && !error && (
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
              <ArrowLink href={`${SDX_LUMA}?period=past`}>Every past event on Luma</ArrowLink>
            </div>
          )}

          {source === 'demo' && (
            <p className="mt-6 text-sm text-white/40">These are sample events. The live calendar could not load.</p>
          )}
        </div>
      </section>

      <ClosingCta
        heading="Never miss an event."
        sub="Every SDx event lives on Luma. Follow the calendar to hear about the next one."
      >
        <MotionButton className="inline-block">
          <Link href={SDX_LUMA} target="_blank" rel="noopener noreferrer" className="block">
            <AsciiButton>Follow on Luma</AsciiButton>
          </Link>
        </MotionButton>
      </ClosingCta>
    </main>
  );
}
