'use client'

import React, { useMemo } from 'react';
import MotionSection from '@/app/components/motion/MotionSection';
import SectionTitle from '@/app/components/SectionTitle';
import ArrowLink from '@/app/components/ArrowLink';
import EventTimeline from '@/app/components/EventTimeline';
import { useSdxEvents } from '@/lib/useSdxEvents';
import { toTimelineItem } from '@/lib/sdx-events';
import { SDX_LUMA } from '@/lib/links';

/** The home page's events: the same timeline as the chapter home, fed by the main calendar. */
export default function HomeEvents() {
  const { events, loading } = useSdxEvents();

  const { upcoming, past } = useMemo(
    () => ({
      upcoming: events.filter((event) => event.isUpcoming).map(toTimelineItem),
      past: events.filter((event) => !event.isUpcoming).map(toTimelineItem),
    }),
    [events]
  );

  return (
    <section className="relative py-14 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <MotionSection>
          <SectionTitle>Events</SectionTitle>
          <ArrowLink href="/events" className="mt-5">
            See all events
          </ArrowLink>
        </MotionSection>

        <MotionSection delay={0.08} className="mt-10">
          <EventTimeline
            upcoming={upcoming}
            past={past}
            loading={loading}
            calendarHref={SDX_LUMA}
            archiveHref="/events"
            archiveLabel="All events"
            maxPast={12}
          />
        </MotionSection>
      </div>
    </section>
  );
}
