'use client'

import React from 'react';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';
import MotionSection from '@/app/components/motion/MotionSection';
import JoinRow from './JoinRow';

export default function StartBuilding() {
  return (
    <section id="join" className="relative py-40 md:py-56 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <PrismaticCanvas intensity="subtle" />

      <MotionSection className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mb-10 prismatic-glow">
          Start building.
        </h2>

        <JoinRow />
      </MotionSection>
    </section>
  );
}
