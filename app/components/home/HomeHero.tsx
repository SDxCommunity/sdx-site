'use client'

import React, { useRef } from 'react';
import Image from 'next/image';
import { m, useScroll, useTransform } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import BackgroundEffects from '@/app/components/BackgroundEffects';
import MetaballCanvas from '@/app/components/MetaballCanvas';
import GlitchTitle from '@/app/components/GlitchTitle';
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

/** The partner logos on a loop, with no label. */
function PartnerBanner() {
  return (
    <div
      className="overflow-hidden w-full"
      aria-label="SDx partners"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, white 10%, white 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, white 10%, white 90%, transparent 100%)',
      }}
    >
      <div className="animate-marquee flex w-max">
        {[partnerLogos, partnerLogos].map((set, setIndex) => (
          <div key={setIndex} className="flex shrink-0" aria-hidden={setIndex === 1 ? true : undefined}>
            {set.map((logo) => (
              <div key={logo.alt} className="flex items-center justify-center mx-7">
                <Image
                  src={logo.src}
                  alt={setIndex === 1 ? '' : logo.alt}
                  width={96}
                  height={48}
                  className={`${logo.className || 'w-24 h-12 object-contain'} opacity-70`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Home hero: the SDx name, which glitches under the pointer, over a field of x cells. The partners run along the bottom. */
export default function HomeHero() {
  const copyRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const contentOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const contentY = useTransform(scrollY, [0, 480], [0, -56]);
  const fieldOpacity = useTransform(scrollY, [0, 900], [1, 0.4]);

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* The chapters' cell field, cut into x's and washed in a soft spectrum */}
      <m.div className="absolute inset-0 w-screen overflow-hidden" style={{ opacity: fieldOpacity }} aria-hidden="true">
        <BackgroundEffects />
        <MetaballCanvas bottomFade="none" clearAround={copyRef} cellShape="x" tint="prismatic" />
        {/*
          Dims the cells under the partner logos without blacking them out, so the field still shows
          through. It reaches full black only at the very bottom, so the next section has no seam.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.55) 85%, #000 100%)' }}
        />
      </m.div>

      <m.div
        className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-6"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div ref={copyRef} className="flex flex-col items-center">
          <GlitchTitle
            text="SDx"
            className="font-display text-[clamp(6rem,27vw,17rem)] leading-[0.9] tracking-tight select-none"
          />

          <m.p
            className="relative mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/70"
            style={{ textWrap: 'balance' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_SOFT, delay: 0.45 }}
          >
            the next-gen startup ecosystem for builders in San Diego.
          </m.p>

          <m.div
            className="relative mt-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_SOFT, delay: 0.6 }}
          >
            <SdxJoinRow track="hero" />
          </m.div>
        </div>
      </m.div>

      <m.div
        className="relative z-10 pb-10 md:pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE_SOFT, delay: 0.8 }}
      >
        {/* A slight shadow just under the logos, so they lift off the field */}
        <div
          className="pointer-events-none absolute inset-x-0 -top-4 bottom-2"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,0,0,0.5), transparent 75%)' }}
          aria-hidden="true"
        />
        <div className="relative">
          <PartnerBanner />
        </div>
      </m.div>
    </section>
  );
}
