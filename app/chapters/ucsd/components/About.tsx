'use client'

import React from 'react';
import Image from 'next/image';
import MotionSection from '@/app/components/motion/MotionSection';
import media from '../lib/media';

export default function About() {
  return (
    <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-t border-white/5 overflow-hidden">
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
              <h2 className="font-display text-3xl md:text-5xl text-white tracking-tight leading-[1.08] prismatic-glow-sm">
                What we do.
              </h2>
              <ul className="mt-5 space-y-3 text-sm md:text-base text-white/50 leading-relaxed max-w-md list-disc pl-5 marker:text-white/30">
                <li>
                  Host builder days to showcase community projects and get feedback
                </li>
                <li>
                  Organize hackathons, fireside chats, and other events with startup founders
                  and industry speakers
                </li>
                <li>
                  Cultivate UCSD&apos;s builder community with fun events (cookouts, builder
                  nights, hikes, etc.)
                </li>
              </ul>
            </MotionSection>
          </div>

          {/* Event collage — Luma covers, title only */}
          <div className="lg:col-span-7 flex lg:h-full">
            <MotionSection delay={0.08} className="w-full">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {media.about.map((tile) => (
                  <div
                    key={tile.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02]"
                    style={{ transform: `rotate(${tile.rotate})` }}
                  >
                    <Image
                      src={tile.cover}
                      alt={tile.title}
                      fill
                      sizes="(min-width: 1024px) 320px, 50vw"
                      className="object-cover opacity-85"
                      onError={(e) => {
                        // Fallback wash if photo not dropped in yet
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(ellipse at 30% 20%, ${tile.accent}44 0%, transparent 55%),
                          linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.35) 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
                      <h4 className="font-display text-xl sm:text-2xl text-white tracking-tight leading-snug">
                        {tile.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </MotionSection>
          </div>
        </div>
      </div>
    </section>
  );
}
