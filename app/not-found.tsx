'use client'

import React, { useRef } from 'react';
import Link from 'next/link';
import { m } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import BackgroundEffects from '@/app/components/BackgroundEffects';
import MetaballCanvas from '@/app/components/MetaballCanvas';
import AsciiButton from '@/app/components/AsciiButton';
import MotionButton from '@/app/components/motion/MotionButton';
import StaggerTitle from '@/app/components/StaggerTitle';

export default function NotFound() {
  const copyRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-[100svh]">
      {/* Full-bleed canvas layer — same as the home hero, wrapping the copy */}
      <div className="absolute inset-0 w-screen overflow-hidden" aria-hidden="true">
        <BackgroundEffects showLetterforms={false} />
        <MetaballCanvas bottomFade="none" clearAround={copyRef} />
      </div>

      <section className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-14">
        <div ref={copyRef} className="flex flex-col items-center text-center">
          <StaggerTitle
            text="404"
            className="font-display text-[clamp(6rem,20vw,12rem)] leading-none tracking-tight text-white prismatic-glow select-none"
          />
          <m.p
            className="mt-6 max-w-md text-base md:text-lg leading-relaxed text-white/70"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: EASE_SOFT, delay: 0.4 }}
          >
            This page doesn&apos;t exist yet.
            <br />
            Maybe you should build it.
          </m.p>
          <m.div
            className="mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: EASE_SOFT, delay: 0.55 }}
          >
            <MotionButton>
              <Link href="/" className="block">
                <AsciiButton>Go home</AsciiButton>
              </Link>
            </MotionButton>
          </m.div>
        </div>
      </section>
    </div>
  );
}
