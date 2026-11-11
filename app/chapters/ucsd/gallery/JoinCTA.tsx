'use client'

import React from 'react';
import Link from 'next/link';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';
import AsciiButton from '@/app/components/AsciiButton';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionButton from '@/app/components/motion/MotionButton';
import styles from './gallery.module.css';

const DISCORD = 'https://discord.gg/Y7ME6kQAye';

export default function JoinCTA() {
  return (
    <section
      id="join"
      className="relative overflow-hidden border-t border-white/5 min-h-[100svh] flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center"
    >
      <PrismaticCanvas intensity="medium" />
      <div className={`absolute inset-0 pointer-events-none ${styles.grain}`} aria-hidden="true" />

      <MotionSection className="relative z-10 max-w-3xl mx-auto w-full">
        <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight mb-10 prismatic-glow">
          Start building.
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <MotionButton>
            <Link href={DISCORD} target="_blank" className="block">
              <AsciiButton>Join us</AsciiButton>
            </Link>
          </MotionButton>
          <MotionButton>
            <Link
              href="/chapters/ucsd/contact"
              className="btn-outline-glow px-6 py-3 text-xs uppercase tracking-widest rounded-sm block"
            >
              Contact
            </Link>
          </MotionButton>
        </div>
      </MotionSection>
    </section>
  );
}
