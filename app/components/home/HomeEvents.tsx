'use client'

import React from 'react';
import MotionSection from '@/app/components/motion/MotionSection';
import SectionTitle from '@/app/components/SectionTitle';
import ArrowLink from '@/app/components/ArrowLink';
import EventAgenda from '@/app/components/EventAgenda';
import { useSdxEvents } from '@/lib/useSdxEvents';

/** The home page's events, from the main SDx Luma calendar. */
export default function HomeEvents() {
  const { events, loading } = useSdxEvents();

  return (
    <section className="relative py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <MotionSection className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionTitle>Events</SectionTitle>
          <ArrowLink href="/events">See all events</ArrowLink>
        </MotionSection>

        <MotionSection delay={0.08} className="mt-10">
          <EventAgenda events={events} loading={loading} maxPast={5} />
        </MotionSection>
      </div>
    </section>
  );
}
