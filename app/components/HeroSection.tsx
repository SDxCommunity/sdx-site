'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sendGAEvent } from '@next/third-parties/google';
import { m } from 'motion/react';
import { transitions } from '@/lib/motion';
import BackgroundEffects from './BackgroundEffects';
import MetaballCanvas from './MetaballCanvas';
import PrismaticCanvas from './PrismaticCanvas';
import AsciiButton from './AsciiButton';
import MotionSection from './motion/MotionSection';
import MotionGrid from './motion/MotionGrid';
import MotionCard from './motion/MotionCard';
import MotionButton from './motion/MotionButton';

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

const eventTypes = [
  {
    name: 'Paper Club',
    description: 'Deep dives into fundamental ML research. Come prepared to debate.',
  },
  {
    name: 'AI Coffee',
    description: 'Open discussion on the latest in AI. Practitioner-level signal.',
  },
  {
    name: 'Hack Days',
    description: 'Show up, build something real, demo what you made.',
  },
  {
    name: 'Hackathons',
    description: 'Full-day build events with sponsor credits and prizes.',
  },
  {
    name: 'Executive Roundtables',
    description: 'Peer-level AI implementation exchange for senior leaders.',
  },
];

const metrics = [
  { value: '3000+', label: 'builders' },
  { value: '50+', label: 'events' },
  { value: '15+', label: 'startups' },
];

const HeroSection: React.FC = () => {
  const handleLinkClick = (linkUrl: string, label: string) => {
    sendGAEvent('clicked', { link_url: linkUrl, label });
  };

  return (
    <>
      {/* Section 1: Hero */}
      <div className="relative min-h-screen">
        {/* Full-bleed canvas layer — outside the flex/padding context */}
        <div className="absolute inset-0 w-screen overflow-hidden">
          <BackgroundEffects />
          <MetaballCanvas />
        </div>

        {/* Content layer */}
        <section className="relative z-10 min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-8">

          {/* Hero copy + CTAs — centered vertically with fixed padding */}
          <div className="relative z-10 max-w-5xl mx-auto text-center flex-1 flex flex-col items-center justify-center max-h-[75vh] pt-16">
            <m.h1
              className="font-display text-6xl md:text-8xl lg:text-9xl text-white tracking-tight mb-6 prismatic-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...transitions.heroEntrance, delay: 0.2 }}
            >
              Build here.
            </m.h1>
            <m.p
              className="text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...transitions.appear, delay: 0.4 }}
            >
              San Diego&apos;s builder-first technology community.
            </m.p>

            <m.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...transitions.appear, delay: 0.5 }}
            >
              <MotionButton>
                <Link
                  href="https://lu.ma/sdx"
                  target="_blank"
                  onClick={() => handleLinkClick('https://lu.ma/sdx', 'hero-cta')}
                  className="block"
                >
                  <AsciiButton>Start Building</AsciiButton>
                </Link>
              </MotionButton>
              <MotionButton>
                <Link
                  href="/executives"
                  onClick={() => handleLinkClick('/executives', 'hero-exec')}
                  className="btn-outline-glow px-6 py-3 text-xs uppercase tracking-widest rounded-sm block"
                >
                  Executive Network &rarr;
                </Link>
              </MotionButton>
            </m.div>

            {/* Metrics bar */}
            <m.div
              className="flex flex-wrap items-center justify-center gap-4 md:gap-8 lg:gap-12"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transitions.appear, delay: 0.6 }}
            >
              {metrics.map((metric, i) => (
                <React.Fragment key={metric.label}>
                  {i > 0 && <div className="hidden md:block w-px h-8 bg-white/10" />}
                  <div className="bg-white/10 rounded-sm px-4 py-2 text-center">
                    <span className="block text-xl md:text-2xl font-bold text-white/90">{metric.value}</span>
                    <span className="block text-xs uppercase tracking-widest text-white/40 mt-0.5">{metric.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </m.div>
          </div>

          {/* Partners — in normal flow, below the hero content */}
          <div className="relative z-10 w-full py-4">
            <p className="text-xs uppercase tracking-widest text-white/40 text-center mb-4">Partners</p>
            <div
              className="overflow-hidden w-full"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, white 8%, white 92%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, white 8%, white 92%, transparent 100%)',
              }}
            >
              <div className="animate-marquee flex w-max">
                {[partnerLogos, partnerLogos].map((set, setIndex) => (
                  <div key={setIndex} className="flex shrink-0">
                    {set.map((logo, index) => (
                      <div key={index} className="flex items-center justify-center mx-6">
                        <Image
                          src={logo.src}
                          alt={logo.alt}
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

        </section>
      </div>

      {/* Section 2: Event Types */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        {/* Ghosted letterform */}
        <div className="absolute right-0 top-0 bottom-0 w-[70vw] md:w-[50vw] overflow-hidden" aria-hidden="true">
          <div className="absolute -right-[10%] md:-right-[20%] top-1/2 -translate-y-1/2 font-display text-[80vw] md:text-[40vw] ghosted-letterform rotate-90 whitespace-nowrap">
            SDx
          </div>
        </div>
        <div className="max-w-6xl mx-auto relative z-[1]">
          <MotionSection className="mb-12">
            <span className="text-xs uppercase tracking-widest text-white/30">What we do</span>
            <h2 className="font-display text-3xl md:text-4xl text-white mt-2 prismatic-glow-sm">
              Where builders build.
            </h2>
          </MotionSection>

          <MotionGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTypes.map((event) => (
              <MotionCard key={event.name}>
                <div
                  className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-lg p-6
                    hover:border-white/[0.15] hover:shadow-glow-white
                    transition-[border-color,box-shadow] duration-300 ease-out h-full"
                >
                  <h3 className="text-base font-bold text-white mb-2">{event.name}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{event.description}</p>
                </div>
              </MotionCard>
            ))}
          </MotionGrid>

          <MotionSection className="mt-8">
            <Link href="/events" className="inline-block">
              <span className="btn-outline-glow px-5 py-2 text-xs uppercase tracking-widest rounded-sm inline-block">
                See all events &rarr;
              </span>
            </Link>
          </MotionSection>
        </div>
      </section>

      {/* Section 3: Community Proof */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        {/* Ghosted letterform */}
        <div className="absolute left-0 top-0 bottom-0 w-[70vw] md:w-[50vw] overflow-hidden" aria-hidden="true">
          <div className="absolute -left-[10%] md:-left-[20%] top-1/2 -translate-y-1/2 font-display text-[80vw] md:text-[40vw] ghosted-letterform -rotate-90 whitespace-nowrap">
            SDx
          </div>
        </div>
        <div className="max-w-6xl mx-auto relative z-[1]">
          <MotionGrid className="grid grid-cols-1 md:grid-cols-3 gap-12" staggerDelay={0.12}>
            <MotionCard enableHover={false}>
              <span className="text-xs uppercase tracking-widest text-white/30">Chapters</span>
              <h3 className="font-display text-2xl text-white mt-2 mb-4">University chapters</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-4">
                SDx extends into campus communities, bringing builders together before they even graduate.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sdx-teal" />
                  <span className="text-sm text-white/60">SDx<span className="text-outline">UCSD</span> — Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sdx-blue" />
                  <span className="text-sm text-white/60">SDx<span className="text-outline">SDSU</span> — Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="text-sm text-white/40">SDx<span className="text-outline">USD</span> — Planned</span>
                </div>
              </div>
              <Link href="/chapters" className="inline-block mt-4">
                <span className="btn-outline-glow px-4 py-1.5 text-xs uppercase tracking-widest rounded-sm inline-block">
                  Explore chapters &rarr;
                </span>
              </Link>
            </MotionCard>

            <MotionCard enableHover={false}>
              <span className="text-xs uppercase tracking-widest text-white/30">Community</span>
              <h3 className="font-display text-2xl text-white mt-2 mb-4">Who we work with</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-4">
                Connected to the organizations that matter. Y Combinator, OpenAI, Anthropic, Qualcomm, Supabase, Vercel, Replit, and the university systems across San Diego.
              </p>
              <Link href="/members" className="inline-block">
                <span className="btn-outline-glow px-4 py-1.5 text-xs uppercase tracking-widest rounded-sm inline-block">
                  Meet the builders &rarr;
                </span>
              </Link>
            </MotionCard>

            <MotionCard enableHover={false}>
              <span className="text-xs uppercase tracking-widest text-white/30">Leadership</span>
              <h3 className="font-display text-2xl text-white mt-2 mb-4">Executive Network</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-4">
                Peer-level AI implementation exchange for C-suite leaders. Real experience, shared openly.
              </p>
              <Link href="/executives" className="inline-block">
                <span className="btn-outline-glow px-4 py-1.5 text-xs uppercase tracking-widest rounded-sm inline-block">
                  Learn more &rarr;
                </span>
              </Link>
            </MotionCard>
          </MotionGrid>
        </div>
      </section>

      {/* Section 4: Final CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <PrismaticCanvas intensity="subtle" />
        <MotionSection className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 prismatic-glow">
            Come build.
          </h2>
          <p className="text-base text-white/50 mb-10 max-w-md mx-auto">
            You don&apos;t need to know how to code to join SDx. You need to want to learn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MotionButton>
              <Link
                href="https://lu.ma/sdx"
                target="_blank"
                onClick={() => handleLinkClick('https://lu.ma/sdx', 'cta-luma')}
                className="block"
              >
                <AsciiButton>Join on Lu.ma</AsciiButton>
              </Link>
            </MotionButton>
            <MotionButton>
              <Link
                href="https://discord.gg/Y7ME6kQAye"
                target="_blank"
                onClick={() => handleLinkClick('https://discord.gg/Y7ME6kQAye', 'cta-discord')}
                className="btn-outline-glow px-6 py-3 text-xs uppercase tracking-widest rounded-sm block"
              >
                Join Discord
              </Link>
            </MotionButton>
          </div>
          <MotionButton className="inline-block mt-6">
            <Link
              href="/executives"
              onClick={() => handleLinkClick('/executives', 'cta-exec')}
              className="btn-outline-glow px-4 py-2 text-xs uppercase tracking-widest rounded-sm block"
            >
              Executive Network &rarr;
            </Link>
          </MotionButton>
        </MotionSection>
      </section>
    </>
  );
};

export default HeroSection;
