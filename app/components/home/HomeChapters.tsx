'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import SectionTitle from '@/app/components/SectionTitle';
import ArrowLink from '@/app/components/ArrowLink';
import ChapterName from '@/app/components/ChapterName';

type Shape = 'square' | 'diamond';

type Chapter = {
  name: string;
  school: string;
  href?: string;
  /** A campus photo under /public. Until the file exists, the card shows the chapter's cell pattern. */
  photo: string;
  /** Each chapter's hero cell shape, in its own colors. */
  shape?: Shape;
  colors?: string[];
};

const chapters: Chapter[] = [
  {
    name: 'SDxUCSD',
    school: 'University of California San Diego',
    href: '/chapters/ucsd',
    photo: '/campus/ucsd.jpg',
    shape: 'square',
    colors: ['#2F8FE8', '#2F8FE8', '#2F8FE8', '#FFCD00'],
  },
  {
    name: 'SDxSDSU',
    school: 'San Diego State University',
    href: '/chapters/sdsu',
    photo: '/campus/sdsu.jpg',
    shape: 'diamond',
    colors: ['#E5484D', '#E5484D', '#FF8A8E'],
  },
  { name: 'SDxUSD', school: 'University of San Diego', photo: '/campus/usd.jpg' },
];

const MOTIF_W = 360;
const MOTIF_H = 225;
const MOTIF_STEP = 20;

/** Rounded to three places, so the server and the browser draw the same pattern. */
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
}

/** A patch of the chapter's hero field: its cell shape and colors, densest at the top right. */
function Motif({ shape, colors, seed }: { shape: Shape; colors: string[]; seed: number }) {
  const cells: React.ReactNode[] = [];
  let n = seed * 1000;
  for (let y = MOTIF_STEP / 2; y < MOTIF_H; y += MOTIF_STEP) {
    for (let x = MOTIF_STEP / 2; x < MOTIF_W; x += MOTIF_STEP) {
      const pull = (x / MOTIF_W) * 0.6 + (1 - y / MOTIF_H) * 0.6;
      if (rand(n++) > pull) continue;
      const size = Math.round((5 + rand(n++) * 5) * 10) / 10;
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          fill={colors[Math.floor(rand(n++) * colors.length)]}
          opacity={Math.round((0.25 + rand(n++) * 0.75) * 100) / 100}
          transform={shape === 'diamond' ? `rotate(45 ${x} ${y})` : undefined}
        />
      );
    }
  }
  return (
    <svg
      viewBox={`0 0 ${MOTIF_W} ${MOTIF_H}`}
      preserveAspectRatio="xMaxYMin slice"
      className="absolute inset-0 h-full w-full opacity-70 transition-[opacity,transform] duration-200 group-hover:opacity-100 group-hover:scale-[1.03] origin-top-right"
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}

function ChapterCard({ chapter, index }: { chapter: Chapter; index: number }) {
  const planned = !chapter.href;
  const [photoMissing, setPhotoMissing] = useState(false);

  const body = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/[0.06]">
        {!photoMissing ? (
          <Image
            src={chapter.photo}
            alt={`${chapter.school} campus`}
            fill
            sizes="(min-width: 768px) 360px, 100vw"
            onError={() => setPhotoMissing(true)}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          chapter.shape && chapter.colors && <Motif shape={chapter.shape} colors={chapter.colors} seed={index + 1} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className={`font-display text-3xl md:text-4xl tracking-tight leading-none ${planned ? 'text-white/70' : 'text-white'}`}>
          <ChapterName name={chapter.name} outline="bold" />
        </h3>
        <p className="mt-3 text-sm text-white/55">{chapter.school}</p>
        <p className="mt-auto pt-8 text-sm">
          {planned ? (
            <span className="text-white/45">Planned</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-white/70 transition-colors duration-200 group-hover:text-white">
              Visit
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </span>
          )}
        </p>
      </div>
    </>
  );

  if (planned) {
    // Grayed out a little until the chapter launches.
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 opacity-60 grayscale">{body}</div>
    );
  }
  return (
    <Link
      href={chapter.href!}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.015] transition-colors duration-200 hover:border-white/25"
    >
      {body}
    </Link>
  );
}

/** The three campus chapters. */
export default function HomeChapters() {
  return (
    <section className="relative pt-4 pb-16 md:pt-6 md:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <MotionSection className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionTitle>Chapters</SectionTitle>
          <ArrowLink href="/chapters">All chapters</ArrowLink>
        </MotionSection>

        <MotionGrid className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5" staggerDelay={0.08}>
          {chapters.map((chapter, i) => (
            <MotionCard key={chapter.name} enableHover={false} className="h-full">
              <ChapterCard chapter={chapter} index={i} />
            </MotionCard>
          ))}
        </MotionGrid>
      </div>
    </section>
  );
}
