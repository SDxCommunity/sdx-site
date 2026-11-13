'use client'

import React from 'react';
import Image from 'next/image';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import SectionTitle from '@/app/components/SectionTitle';
import { Count } from '@/app/components/StatStrip';

const stats = [
  { value: 3000, suffix: '+', label: 'builders' },
  { value: 50, suffix: '+', label: 'events hosted' },
  { value: 15, suffix: '+', label: 'startups built' },
];

/** Add a photo by setting `image` to a path under /public, for example '/programs/paper-club.jpg'. */
const programs: { name: string; desc: string; image?: string }[] = [
  {
    name: 'Fireside Chats',
    desc: 'Founders and operators talk candidly about what they built and what they learned.',
    image: '/programs/fireside-chats.jpg',
  },
  { name: 'Demo Days', desc: 'Builders show what they made and get real feedback.', image: '/programs/demo-days.jpg' },
  { name: 'Hackathons', desc: 'Full-day build events with sponsor credits and prizes.', image: '/programs/hackathons.jpg' },
  {
    name: 'Flagship Events',
    desc: 'Our biggest nights of the year, with the whole San Diego builder community in one room.',
    image: '/programs/flagship-events.jpg',
  },
];

/** Fine stripes hold the place of a photo that has not been added yet. */
const STRIPES = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 7px)';

/** What the main community does: the city-wide numbers and the four kinds of event. */
export default function WhatWeDo() {
  return (
    <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <MotionSection className="lg:col-span-6">
            <SectionTitle>What we do</SectionTitle>
            <p className="mt-6 max-w-xl text-lg md:text-xl leading-relaxed text-white/75">
              SDx brings San Diego&apos;s builders together: students, engineers, researchers, and founders. We run
              events across the city all year, and our campus chapters run their own.
            </p>
          </MotionSection>

          <MotionSection delay={0.08} className="lg:col-span-6">
            <dl className="grid grid-cols-3 divide-x divide-white/15 rounded-xl border border-white/25 bg-white/[0.02] py-7 md:py-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse items-center px-2 text-center">
                  <dt className="mt-2 text-xs sm:text-sm text-white/55">{stat.label}</dt>
                  <dd className="font-display text-[1.35rem] sm:text-[2rem] lg:text-[2.25rem] leading-none tracking-tight whitespace-nowrap bg-gradient-to-r from-[#8fe3ec] via-[#c8b8ff] to-[#ffb9a0] bg-clip-text text-transparent">
                    <Count to={stat.value} suffix={stat.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          </MotionSection>
        </div>

        <MotionGrid className="mt-14 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10" staggerDelay={0.06}>
          {programs.map((program) => (
            <MotionCard key={program.name} enableHover={false}>
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02]"
                style={program.image ? undefined : { backgroundImage: STRIPES }}
              >
                {program.image && (
                  <Image
                    src={program.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <h3 className="mt-5 font-display text-2xl text-white tracking-tight">{program.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{program.desc}</p>
            </MotionCard>
          ))}
        </MotionGrid>
      </div>
    </section>
  );
}
