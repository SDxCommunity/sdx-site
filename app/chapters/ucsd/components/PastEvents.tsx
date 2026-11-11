'use client'

import React, { useEffect, useState } from 'react';
import MotionSection from '@/app/components/motion/MotionSection';
import ArrowLink from '@/app/components/ArrowLink';
import EventTimeline, { type TimelineItem } from '@/app/components/EventTimeline';
import { UCSD_LUMA, UCSD_LUMA_PAST } from '../lib/links';

/** The chapter's events on the shared timeline: upcoming left of "Today", past to the right. */
export default function PastEvents({ compact = false }: { compact?: boolean }) {
  const [upcoming, setUpcoming] = useState<TimelineItem[]>([]);
  const [past, setPast] = useState<TimelineItem[]>([]);
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

  return (
    <section className="relative py-14 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <MotionSection>
          <h2 className="font-display text-3xl md:text-5xl text-white tracking-tight leading-[1.08] prismatic-glow-sm">
            Events
          </h2>
          <ArrowLink href={UCSD_LUMA} className="mt-5">
            See all events on Luma
          </ArrowLink>
        </MotionSection>

        <MotionSection delay={0.08} className="mt-10">
          <EventTimeline
            upcoming={upcoming}
            past={past}
            loading={loading}
            calendarHref={UCSD_LUMA}
            archiveHref={UCSD_LUMA_PAST}
            maxPast={compact ? 12 : undefined}
          />
        </MotionSection>
      </div>
    </section>
  );
}
