'use client'

import React, { useMemo } from 'react';
import Image from 'next/image';
import { m } from 'motion/react';
import MotionSection from '@/app/components/motion/MotionSection';
import SectionTitle from '@/app/components/SectionTitle';
import { useSdxEvents } from '@/lib/useSdxEvents';
import { cleanTitle, eventSeries, formatEventDate, type Series } from '@/lib/sdx-events';
import { SDX_LUMA } from '@/lib/links';

const programs = [
  { name: 'Paper Club', desc: 'Deep dives into fundamental ML research. Come prepared to debate.' },
  { name: 'AI Coffee', desc: 'Open discussion on the latest in AI. Practitioner-level signal.' },
  { name: 'Hack Days', desc: 'Show up, build something real, demo what you made.' },
  { name: 'Hackathons', desc: 'Full-day build events with sponsor credits and prizes.' },
  { name: 'Executive Roundtables', desc: 'Peer-level AI implementation exchange for senior leaders.' },
];

/** One tile per series, showing that series' newest Luma cover. */
const TILES: { series: Series; title: string; accent: string; rotate: string }[] = [
  { series: 'paper-club', title: 'Paper Club', accent: '#11BBCD', rotate: '1.2deg' },
  { series: 'ai-coffee', title: 'AI Coffee', accent: '#FAC205', rotate: '-0.8deg' },
  { series: 'hack-days', title: 'Hack Days', accent: '#FC5715', rotate: '-1.5deg' },
  { series: 'other', title: 'Flagship events', accent: '#03C661', rotate: '1.6deg' },
];

const STRIPES = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 7px)';

export default function WhatWeDo() {
  const { events } = useSdxEvents();

  const tiles = useMemo(
    () =>
      TILES.map((tile) => {
        // Events arrive newest first; prefer the newest one with a cover.
        const inSeries = events.filter((event) => eventSeries(event.title) === tile.series);
        return { ...tile, event: inSeries.find((event) => event.coverUrl) ?? inSeries[0] ?? null };
      }),
    [events]
  );

  return (
    <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(17,187,205,0.12), transparent 60%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(217,44,45,0.08), transparent 55%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-[1] max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Text column — vertically centered against the collage */}
          <div className="lg:col-span-5 flex flex-col lg:h-full lg:justify-center">
            <MotionSection>
              <SectionTitle>What we do</SectionTitle>
              <ul className="mt-8 space-y-4 text-sm md:text-base text-white/70 leading-relaxed max-w-md list-disc pl-5 marker:text-white/40">
                {programs.map((program) => (
                  <li key={program.name}>
                    <span className="font-bold text-white">{program.name}.</span> {program.desc}
                  </li>
                ))}
              </ul>
            </MotionSection>
          </div>

          {/* Collage — the newest Luma cover from each series */}
          <div className="lg:col-span-7 flex lg:h-full">
            <MotionSection delay={0.08} className="w-full">
              <div className="grid grid-cols-2 gap-5 sm:gap-7">
                {tiles.map((tile) => {
                  const event = tile.event;
                  const cover = event?.coverUrl || null;
                  const caption = event ? `${formatEventDate(event)} · ${cleanTitle(event.title)}` : 'See the calendar';

                  return (
                    <m.a
                      key={tile.series}
                      href={event?.eventUrl ?? SDX_LUMA}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${tile.title}: ${caption}, on Luma`}
                      className="group relative block aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)] transition-[border-color,box-shadow] duration-300"
                      initial={false}
                      style={{ rotate: tile.rotate }}
                      whileHover={{ y: -8, rotate: tile.rotate.startsWith('-') ? '-2.6deg' : '2.6deg' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                      {cover ? (
                        <>
                          {/* The cover is the event's own artwork, so it carries the name */}
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 320px, 50vw"
                            className="object-cover opacity-90 transition-[opacity,transform] duration-500 group-hover:opacity-100 group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <p className="line-clamp-2 text-xs sm:text-sm text-white/85">{caption}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `radial-gradient(ellipse at 30% 20%, ${tile.accent}44 0%, transparent 55%), ${STRIPES}`,
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                          <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
                            <h3 className="font-display text-xl sm:text-2xl text-white tracking-tight leading-snug">
                              {tile.title}
                            </h3>
                            <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-white/55">{caption}</p>
                          </div>
                        </>
                      )}
                    </m.a>
                  );
                })}
              </div>
            </MotionSection>
          </div>
        </div>
      </div>
    </section>
  );
}
