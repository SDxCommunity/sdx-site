'use client'

import React from 'react';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';
import MotionSection from '@/app/components/motion/MotionSection';

type ClosingCtaProps = {
  heading: string;
  /** One or two short sentences under the heading. */
  sub?: React.ReactNode;
  /** The actions, usually a JoinRow or one AsciiButton. */
  children: React.ReactNode;
  id?: string;
};

/** The closing call to action on every page: a large heading over the color field. */
export default function ClosingCta({ heading, sub, children, id = 'join' }: ClosingCtaProps) {
  return (
    <section id={id} className="relative py-40 md:py-56 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <PrismaticCanvas intensity="subtle" />

      <MotionSection className="relative z-10 max-w-3xl mx-auto text-center">
        <h2
          className={`font-display text-4xl md:text-5xl text-white tracking-tight prismatic-glow ${
            sub ? 'mb-6' : 'mb-10'
          }`}
        >
          {heading}
        </h2>

        {sub && (
          <p className="mx-auto mb-10 max-w-md text-base md:text-lg leading-relaxed text-white/70">{sub}</p>
        )}

        {children}
      </MotionSection>
    </section>
  );
}
