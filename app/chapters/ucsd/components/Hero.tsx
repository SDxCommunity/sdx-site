'use client'

import React, { useRef } from 'react';
import { m, useScroll, useTransform } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import BackgroundEffects from '@/app/components/BackgroundEffects';
import MetaballCanvas from '@/app/components/MetaballCanvas';
import SpecStrip from './SpecStrip';
import JoinRow from './JoinRow';
import styles from './Hero.module.css';

const TITLE = 'SDxUCSD';

export default function Hero() {
  const d = (_stingerDelay: number, navDelay: number) => navDelay;

  const copyRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const contentOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const contentY = useTransform(scrollY, [0, 480], [0, -56]);
  const fieldOpacity = useTransform(scrollY, [0, 900], [1, 0.5]);

  return (
    <section className="relative flex flex-col overflow-hidden">
      {/* ── Background layer — matches the home page hero treatment ── */}
      <m.div className="absolute inset-0 w-screen overflow-hidden" style={{ opacity: fieldOpacity }} aria-hidden="true">
        <BackgroundEffects />
        <MetaballCanvas bottomFade="none" clearAround={copyRef} />
        {/*
          Mirrors the top bar: the blobs fade out over the last 3.5rem of the first
          screen (the bar's height) and stay black below it.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[calc(100svh-3.5rem)]"
          style={{ background: 'linear-gradient(to bottom, transparent, black 3.5rem)' }}
        />
      </m.div>

      {/* ── Hero copy — fills the first screen so the stats start below the fold ── */}
      <m.div
        className="relative z-10 min-h-[100svh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 pb-8"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* The blob field clears an area around this block, so blobs wrap the copy */}
        <div ref={copyRef} className="flex flex-col items-center">
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
            <span className="text-white/70">the home for UCSD&apos;s most ambitious builders and founders.</span>
          </m.p>

          {/* CTA row */}
          <m.div
            className="relative mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: EASE_SOFT, delay: d(3.05, 0.65) }}
          >
            <JoinRow />
          </m.div>
        </div>
      </m.div>

      {/* Stats — just below the fold, fading in on the first scroll */}
      <m.div
        className="relative z-10 pt-10 md:pt-14 pb-16 md:pb-20"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.0, ease: EASE_SOFT }}
      >
        <SpecStrip />
      </m.div>
    </section>
  );
}
