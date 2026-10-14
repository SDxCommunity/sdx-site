'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import MotionSection from '@/app/components/motion/MotionSection';
import SectionTag from './SectionTag';
import { UCSD_LUMA } from '../lib/links';

type UcsdEventItem = {
  id: string;
  title: string;
  date: string;
  endDate: string | null;
  timezone: string;
  url: string;
  cover: string | null;
  location: string | null;
};

const ACCENTS = ['#D92C2D', '#FC5715', '#FAC205', '#03C661', '#11BBCD', '#035593'];

function formatDay(iso: string, timeZone: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone,
  });
}

function monthKey(iso: string, timeZone: string) {
  const d = new Date(iso);
  const y = d.toLocaleString('en-US', { year: 'numeric', timeZone });
  const m = d.toLocaleString('en-US', { month: '2-digit', timeZone });
  const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone });
  return { key: `${y}-${m}`, label, sort: `${y}-${m}` };
}

function groupByMonth(events: UcsdEventItem[], direction: 'asc' | 'desc') {
  const map = new Map<string, { label: string; sort: string; events: UcsdEventItem[] }>();

  for (const event of events) {
    const tz = event.timezone || 'America/Los_Angeles';
    const { key, label, sort } = monthKey(event.date, tz);
    if (!map.has(key)) map.set(key, { label, sort, events: [] });
    map.get(key)!.events.push(event);
  }

  const groups = Array.from(map.values()).sort((a, b) =>
    direction === 'desc' ? b.sort.localeCompare(a.sort) : a.sort.localeCompare(b.sort)
  );

  return groups.map((g) => ({
    ...g,
    events: [...g.events].sort((a, b) =>
      direction === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    ),
  }));
}

type MonthGroup = ReturnType<typeof groupByMonth>[number];
type View = 'upcoming' | 'past';

export default function PastEvents({ compact = false }: { compact?: boolean }) {
  const [view, setView] = useState<View>('upcoming');
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

  const displayedPast = useMemo(() => (compact ? past.slice(0, 8) : past), [past, compact]);

  const pastGroups = useMemo(() => groupByMonth(displayedPast, 'desc'), [displayedPast]);
  const upcomingGroups = useMemo(() => groupByMonth(upcoming, 'asc'), [upcoming]);

  const accentFor = (index: number) => ACCENTS[index % ACCENTS.length];

  return (
    <div className="relative">
      <section className="relative py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <SectionTag
            index="001"
            label="The calendar"
            heading={view === 'upcoming' ? 'Upcoming events' : 'Past events'}
            className="mb-4"
          />
          <MotionSection className="mb-10 md:mb-14">
            <div className="flex flex-wrap gap-2">
              {(['upcoming', 'past'] as const).map((v) => {
                const active = view === v;
                const label = loading
                  ? v === 'upcoming' ? 'Upcoming' : 'Past'
                  : v === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-widest rounded-sm transition-colors duration-200 ${
                      active ? 'bg-white text-black' : 'text-white/40 hover:text-white border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </MotionSection>

          <div className="max-w-3xl">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b border-white/20 mx-auto mb-4" />
              <p className="text-xs uppercase tracking-widest text-white/30">Loading events</p>
            </div>
          ) : view === 'upcoming' ? (
            upcoming.length === 0 ? (
              <MotionSection>
                <p className="text-base md:text-lg text-white/45 leading-relaxed">Coming soon.</p>
                <p className="mt-3 text-sm text-white/30 leading-relaxed">
                  New dates drop on{' '}
                  <a
                    href={UCSD_LUMA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/55 underline underline-offset-4 decoration-white/20 hover:text-white/80 hover:decoration-white/40 transition-colors"
                  >
                    Luma
                  </a>
                  .
                </p>
              </MotionSection>
            ) : (
              <EventTimeline groups={upcomingGroups} accentFor={accentFor} />
            )
          ) : (
            <>
              <EventTimeline groups={pastGroups} accentFor={accentFor} />
              <MotionSection delay={0.12} className="mt-12 md:mt-16">
                <a
                  href={UCSD_LUMA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
                >
                  View full calendar on Luma
                  <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                </a>
              </MotionSection>
            </>
          )}
          </div>
        </div>
      </section>
    </div>
  );
}

function EventTimeline({
  groups,
  accentFor,
}: {
  groups: MonthGroup[];
  accentFor: (index: number) => string;
}) {
  let runningIndex = 0;

  return (
    <div className="relative">
      {/* Spine */}
      <div
        className="pointer-events-none absolute left-[0.4rem] md:left-[0.45rem] top-2 bottom-2 w-px bg-gradient-to-b from-white/25 via-white/10 to-transparent"
        aria-hidden="true"
      />

      <div className="space-y-12 md:space-y-14">
        {groups.map((group, gi) => (
          <MotionSection key={group.sort} delay={Math.min(gi * 0.04, 0.2)}>
            <div className="relative pl-8 md:pl-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-5">{group.label}</p>

              <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {group.events.map((event) => {
                  const tz = event.timezone || 'America/Los_Angeles';
                  const accent = accentFor(runningIndex++);

                  return (
                    <li key={event.id}>
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-baseline gap-4 md:gap-6 py-4 transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded-sm"
                      >
                        {/* Timeline node */}
                        <span
                          className="absolute -left-8 md:-left-10 top-[1.35rem] h-2 w-2 rounded-full ring-4 ring-black"
                          style={{ backgroundColor: accent }}
                          aria-hidden="true"
                        />

                        <time
                          dateTime={event.date}
                          className="shrink-0 w-16 md:w-20 text-xs tabular-nums text-white/40 group-hover:text-white/55 transition-colors"
                        >
                          {formatDay(event.date, tz)}
                        </time>

                        <span className="flex-1 min-w-0 font-display text-base md:text-lg text-white/85 tracking-tight group-hover:text-white transition-colors">
                          {event.title}
                        </span>

                        <ExternalLink
                          className="shrink-0 w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors mt-1"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </MotionSection>
        ))}
      </div>
    </div>
  );
}
