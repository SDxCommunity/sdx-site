'use client'

import React, { useEffect, useRef, useState } from 'react';
import { m, useScroll, useTransform } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import BackgroundEffects from '@/app/components/BackgroundEffects';
import MetaballCanvas from '@/app/components/MetaballCanvas';
import SpecStrip from './SpecStrip';
import JoinRow from './JoinRow';
import { SDSU_HERO_TINT } from '../lib/theme';
import styles from './Hero.module.css';

const TITLE = 'SDxSDSU';
/** Time per typed letter */
const STEP_S = 0.07;
const FIRST_LETTER_S = 0.2;
/** The subhead and buttons follow once the title is typed out. */
const TYPED_S = FIRST_LETTER_S + TITLE.length * STEP_S;

export default function Hero() {
  const copyRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const contentOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const contentY = useTransform(scrollY, [0, 480], [0, -56]);
  const fieldOpacity = useTransform(scrollY, [0, 900], [1, 0.5]);

  // The blob field shows only on the first screen; below it a black cover hides it.
  // Its animated cells and goo filter still cost every frame while any part of the
  // hero is on screen, which made the sections below lag. Skip rendering the field
  // once the first screen has scrolled away.
  const firstScreenRef = useRef<HTMLDivElement>(null);
  const [fieldOn, setFieldOn] = useState(true);
  useEffect(() => {
    const el = firstScreenRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    // The top margin turns the field back on just before it scrolls into view.
    const io = new IntersectionObserver(([entry]) => setFieldOn(entry.isIntersecting), {
      rootMargin: '64px 0px 0px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative flex flex-col overflow-hidden">
      <div ref={firstScreenRef} className="pointer-events-none absolute inset-x-0 top-0 h-[100svh]" aria-hidden="true" />

      {/* ── Background: the site's blob field, cut into red diamonds for SDSU ── */}
      <m.div
        className="absolute inset-0 w-screen overflow-hidden"
        style={{ opacity: fieldOpacity, contentVisibility: fieldOn ? 'visible' : 'hidden' }}
        aria-hidden="true"
      >
        <BackgroundEffects />
        <MetaballCanvas
          bottomFade="none"
          clearAround={copyRef}
          cellShape="diamond"
          asciiPattern="diamond"
          tint={SDSU_HERO_TINT}
        />
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
          {/* Headline — typed out letter by letter, SDSU outlined per chapter naming */}
          <h1
            aria-label="SDxSDSU"
            className={`relative font-display text-[clamp(3.25rem,12.5vw,10.5rem)] leading-[0.95] tracking-tight select-none ${styles.glow}`}
          >
            {TITLE.split('').map((ch, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`${styles.letter} ${i === TITLE.length - 1 ? styles.last : ''} ${
                  i < 3 ? 'text-white' : 'text-outline'
                }`}
                style={
                  {
                    '--letter-delay': `${(FIRST_LETTER_S + i * STEP_S).toFixed(3)}s`,
                    '--step': `${STEP_S}s`,
                  } as React.CSSProperties
                }
              >
                {ch}
              </span>
            ))}
          </h1>

          {/* Subhead — the chapter's own line from its LinkedIn page */}
          <m.p
            className="relative mt-8 max-w-xl text-base md:text-lg leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_SOFT, delay: TYPED_S }}
          >
            <span className="text-white/70">the home for AI builders, creatives, and founders at San Diego State.</span>
          </m.p>

          {/* CTA row */}
          <m.div
            className="relative mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_SOFT, delay: TYPED_S + 0.15 }}
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
