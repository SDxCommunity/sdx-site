'use client'

import React, { useRef } from 'react';
import Image from 'next/image';
import { m, useScroll, useTransform } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import BackgroundEffects from '@/app/components/BackgroundEffects';
import MetaballCanvas from '@/app/components/MetaballCanvas';
import StaggerTitle from '@/app/components/StaggerTitle';
import StatStrip from '@/app/components/StatStrip';
import SdxJoinRow from '@/app/components/SdxJoinRow';

const partnerLogos: { src: string; alt: string; className?: string }[] = [
  { src: '/sponsors/cadre.png', alt: 'Cadre' },
  { src: '/sponsors/anthropic.png', alt: 'Anthropic' },
  { src: '/sponsors/elevenlabs.svg', alt: 'ElevenLabs' },
  { src: '/sponsors/hf.png', alt: 'Hugging Face' },
  { src: '/sponsors/openai.png', alt: 'OpenAI' },
  { src: '/sponsors/qualcomm.png', alt: 'Qualcomm' },
  { src: '/sponsors/replit.png', alt: 'Replit' },
  { src: '/sponsors/vercel.png', alt: 'Vercel' },
  { src: '/sponsors/ucsd.png', alt: 'UCSD' },
  { src: '/sponsors/groq.svg', alt: 'Groq', className: 'w-16 h-10 object-contain' },
  { src: '/sponsors/modal.svg', alt: 'Modal' },
  { src: '/sponsors/yc.svg', alt: 'Y Combinator' },
];

const stats = [
  { value: 3000, suffix: '+', label: 'builders' },
  { value: 50, suffix: '+', label: 'events hosted' },
  { value: 15, suffix: '+', label: 'startups built' },
];

function Partners() {
  return (
    <div className="mt-14 md:mt-16">
      <p className="mb-5 text-center text-sm text-white/50">Partners</p>
      <div
        className="overflow-hidden w-full"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, white 8%, white 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, white 8%, white 92%, transparent 100%)',
        }}
      >
        <div className="animate-marquee flex w-max">
          {[partnerLogos, partnerLogos].map((set, setIndex) => (
            <div key={setIndex} className="flex shrink-0" aria-hidden={setIndex === 1 ? true : undefined}>
              {set.map((logo) => (
                <div key={logo.alt} className="flex items-center justify-center mx-6">
                  <Image
                    src={logo.src}
                    alt={setIndex === 1 ? '' : logo.alt}
                    width={96}
                    height={48}
                    className={logo.className || 'w-24 h-12 object-contain'}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Home hero: the same blob field, title rise, and stats strip as the chapter home. */
export default function HomeHero() {
  const copyRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const contentOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const contentY = useTransform(scrollY, [0, 480], [0, -56]);
  const fieldOpacity = useTransform(scrollY, [0, 900], [1, 0.5]);

  return (
    <section className="relative flex flex-col overflow-hidden">
      {/* ── Background layer ── */}
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
          <StaggerTitle
            text="Build here."
            className="relative font-display text-[clamp(3.25rem,11vw,9.5rem)] leading-[0.95] tracking-tight text-white prismatic-glow select-none"
          />

          <m.p
            className="relative mt-8 max-w-xl text-base md:text-lg leading-relaxed text-white/70"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: EASE_SOFT, delay: 0.5 }}
          >
            San Diego&apos;s builder-first technology community.
          </m.p>

          <m.div
            className="relative mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: EASE_SOFT, delay: 0.65 }}
          >
            <SdxJoinRow track="hero" />
          </m.div>
        </div>
      </m.div>

      {/* Stats and partners — just below the fold, fading in on the first scroll */}
      <m.div
        className="relative z-10 pt-10 md:pt-14 pb-16 md:pb-20"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.0, ease: EASE_SOFT }}
      >
        <StatStrip stats={stats} />
        <Partners />
      </m.div>
    </section>
  );
}
