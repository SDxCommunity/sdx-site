'use client'

import React, { useRef } from 'react';
import Link from 'next/link';
import { m, useInView } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';
import AsciiButton from '@/app/components/AsciiButton';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionButton from '@/app/components/motion/MotionButton';
import { UCSD_EMAIL, UCSD_JOIN_FORM, UCSD_LUMA } from '../lib/links';

/** Judgment-style animated strikethrough — a bar sweeps across on scroll into view. */
function Strike({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });

  return (
    <span ref={ref} className="relative inline-block whitespace-nowrap text-white/40">
      {children}
      <m.span
        aria-hidden="true"
        className="absolute left-0 top-1/2 block h-[0.055em] w-full -translate-y-1/2"
        style={{ backgroundColor: 'rgba(217, 44, 45, 0.75)', originX: 0 }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.7, ease: EASE_SOFT, delay: 0.5 }}
      />
    </span>
  );
}

export default function StartBuilding() {
  return (
    <section id="join" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <PrismaticCanvas intensity="subtle" />

      <MotionSection className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mb-10 prismatic-glow">
          Stop <Strike>waiting</Strike>.
          <br />
          Start shipping.
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <MotionButton>
            <Link
              href={UCSD_JOIN_FORM}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <AsciiButton>Join us</AsciiButton>
            </Link>
          </MotionButton>
        </div>

        {/* Chapter-specific contact + calendar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-widest">
          <a
            href={`mailto:${UCSD_EMAIL}`}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            {UCSD_EMAIL}
          </a>
          <span className="hidden sm:block w-px h-3 bg-white/15" aria-hidden="true" />
          <a
            href={UCSD_LUMA}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            Luma calendar
          </a>
        </div>
      </MotionSection>
    </section>
  );
}
