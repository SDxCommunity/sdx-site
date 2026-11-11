'use client'

import React from 'react';
import Image, { type StaticImageData } from 'next/image';
import { m } from 'motion/react';
import MotionSection from '@/app/components/motion/MotionSection';
import hackathon from '../assets/events/voice-agent-hackathon.jpg';
import kickoff from '../assets/events/kickoff.jpg';
import buildDayOct from '../assets/events/build-day-oct-11.jpg';
import buildDayNov from '../assets/events/build-day-nov-15.jpg';

type Poster = { id: string; title: string; url: string; cover: StaticImageData; rotate: string };

/** The chapter's own Luma covers, saved from Luma on 2026-11-11. Each opens its event. */
const posters: Poster[] = [
  { id: 'hackathon', title: 'Voice Agent Hackathon', url: 'https://luma.com/uan97kyo', cover: hackathon, rotate: '1.2deg' },
  { id: 'kickoff', title: 'SDxSDSU Kickoff', url: 'https://luma.com/sdxsdsukickoff', cover: kickoff, rotate: '-0.8deg' },
  { id: 'build-day-oct', title: 'Build Day, Oct 11', url: 'https://luma.com/mz23d5pm', cover: buildDayOct, rotate: '-1.5deg' },
  { id: 'build-day-nov', title: 'Build Day, Nov 15', url: 'https://luma.com/mrakufv6', cover: buildDayNov, rotate: '1.6deg' },
];

export default function About() {
  return (
    <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(240,150,155,0.08), transparent 60%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(252,87,21,0.05), transparent 55%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-[1] max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Text column — vertically centered against the posters */}
          <div className="lg:col-span-5 flex flex-col lg:h-full lg:justify-center">
            <MotionSection>
              <h2 className="font-display text-3xl md:text-5xl text-white tracking-tight leading-[1.08] prismatic-glow-sm">
                What we do
              </h2>
              <ul className="mt-8 space-y-4 text-sm md:text-base text-white/70 leading-relaxed max-w-md list-disc pl-5 marker:text-[#f0969b]/60">
                <li>
                  Run Build Days at the ZIP Launchpad, where SDSU builders work side by side and
                  share what they are building
                </li>
                <li>
                  Host hack days with AI companies, like the Voice Agent Hackathon with ElevenLabs
                  and Daytona, with $10K+ in credits on the line
                </li>
                <li>Bring in founders who have done it for demo nights and talks</li>
                <li>
                  Connect SDSU students to SDx&apos;s network of 1,000+ builders, executives, and
                  founders across San Diego
                </li>
              </ul>
            </MotionSection>
          </div>

          {/* Event posters — the chapter's own Luma covers, shown as they are */}
          <div className="lg:col-span-7 flex lg:h-full">
            <MotionSection delay={0.08} className="w-full">
              <div className="grid grid-cols-2 gap-5 sm:gap-7">
                {posters.map((poster) => (
                  <m.a
                    key={poster.id}
                    href={poster.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${poster.title} on Luma`}
                    className="group relative block aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-white/25 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow] duration-200"
                    initial={false}
                    style={{ rotate: poster.rotate }}
                    whileHover={{ y: -8, rotate: poster.rotate.startsWith('-') ? '-2.6deg' : '2.6deg' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  >
                    <Image
                      src={poster.cover}
                      alt={poster.title}
                      fill
                      sizes="(min-width: 1024px) 320px, 50vw"
                      className="object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                    />
                  </m.a>
                ))}
              </div>
            </MotionSection>
          </div>
        </div>
      </div>
    </section>
  );
}
