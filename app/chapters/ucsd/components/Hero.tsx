'use client'

import React from 'react';
import Link from 'next/link';
import { m, useScroll, useTransform } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import BackgroundEffects from '@/app/components/BackgroundEffects';
import MetaballCanvas from '@/app/components/MetaballCanvas';
import AsciiButton from '@/app/components/AsciiButton';
import MotionButton from '@/app/components/motion/MotionButton';
import SpecStrip from './SpecStrip';
import { UCSD_JOIN_FORM } from '../lib/links';
import styles from './Hero.module.css';

const TITLE = 'SDxUCSD';

export default function Hero() {
  const d = (_stingerDelay: number, navDelay: number) => navDelay;

  const { scrollY } = useScroll();
  const contentOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const contentY = useTransform(scrollY, [0, 480], [0, -56]);
  const fieldOpacity = useTransform(scrollY, [0, 640], [1, 0.15]);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── Background layer — matches the home page hero treatment ── */}
      <m.div className="absolute inset-0 w-screen overflow-hidden" style={{ opacity: fieldOpacity }} aria-hidden="true">
        <BackgroundEffects />
        <MetaballCanvas />
      </m.div>

      {/* ── Hero copy ── */}
      <m.div
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-8"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Headline — letter-staggered, UCSD outlined per chapter naming */}
        <h1
          aria-label="SDxUCSD"
          className="relative font-display text-[clamp(3.25rem,12.5vw,10.5rem)] leading-[0.95] tracking-tight prismatic-glow select-none"
        >
          {TITLE.split('').map((ch, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`${styles.letter} ${i < 3 ? 'text-white' : 'text-outline'}`}
              style={{ '--letter-delay': `${(0.2 + i * 0.055).toFixed(3)}s` } as React.CSSProperties}
            >
              {ch}
            </span>
          ))}
        </h1>

        {/* Subhead */}
        <m.p
          className="relative mt-8 max-w-xl text-base md:text-lg leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: EASE_SOFT, delay: d(2.85, 0.5) }}
        >
          <span className="text-white/70">The home for UCSD&apos;s most ambitious builders and founders.</span>
        </m.p>

        {/* CTA row */}
        <m.div
          className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: EASE_SOFT, delay: d(3.05, 0.65) }}
        >
          <MotionButton>
            <Link href={UCSD_JOIN_FORM} target="_blank" rel="noopener noreferrer" className="block">
              <AsciiButton>Join us</AsciiButton>
            </Link>
          </MotionButton>
        </m.div>
      </m.div>

      {/* Stats — pinned at the bottom edge of the hero viewport */}
      <m.div
        className="relative z-10 pb-10 md:pb-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: EASE_SOFT, delay: d(3.2, 0.8) }}
      >
        <SpecStrip />
      </m.div>
    </section>
  );
}
