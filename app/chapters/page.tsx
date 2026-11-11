'use client'

import React from 'react';
import Link from 'next/link';
import PageHeader from '@/app/components/PageHeader';
import SectionTitle from '@/app/components/SectionTitle';
import ArrowLink from '@/app/components/ArrowLink';
import ChapterName from '@/app/components/ChapterName';
import ClosingCta from '@/app/components/ClosingCta';
import AsciiButton from '@/app/components/AsciiButton';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import MotionButton from '@/app/components/motion/MotionButton';
import { SDX_EMAIL, SDX_LUMA } from '@/lib/links';

type Chapter = {
  id: string;
  name: string;
  university: string;
  memberCount: string;
  founded: string;
  founder: string;
  description: string;
  /** The chapter's own page, when it has one. */
  href?: string;
  contactEmail: string;
  /** Color of the glow in the card's corner. */
  accent: string;
};

const chapters: Chapter[] = [
  {
    id: 'ucsd',
    name: 'SDxUCSD',
    university: 'UC San Diego',
    memberCount: '50+',
    founded: '2024',
    founder: 'Dhruv Kanetkar',
    description:
      'The flagship chapter. An invite-only community where the best UCSD students building with AI share their latest experiments and projects.',
    href: '/chapters/ucsd',
    contactEmail: 'ucsd@sdx.community',
    accent: 'rgba(17,187,205,0.16)',
  },
  {
    id: 'sdsu',
    name: 'SDxSDSU',
    university: 'San Diego State University',
    memberCount: 'New',
    founded: '2026',
    founder: 'Matt Attardo',
    description:
      "Expanding SDx's presence with SDSU's vibrant student community. Builder-first programming for Aztec engineers and creators.",
    contactEmail: SDX_EMAIL,
    accent: 'rgba(3,85,147,0.28)',
  },
];

const plannedChapters = [
  {
    name: 'SDxUSD',
    university: 'University of San Diego',
    description: "Planned launch 2026 or 2027. Bringing SDx to USD's campus community.",
  },
];

const reasons = [
  {
    n: '01',
    color: '#D92C2D',
    title: 'Build on campus',
    desc: 'Peer community for learning and building together. Lower the barrier to entry for first-time builders.',
  },
  {
    n: '02',
    color: '#FAC205',
    title: 'Events and demos',
    desc: 'Chapter-specific Hack Days, demo sessions, and Paper Club discussions.',
  },
  {
    n: '03',
    color: '#11BBCD',
    title: 'Pipeline to SDx',
    desc: 'Connect to the broader ecosystem. Mentors, events, partners, and a reason to stay in San Diego after graduation.',
  },
];

function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-black p-7 md:p-9 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/25">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 70% 60% at 100% 0%, ${chapter.accent}, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col">
        <h3 className="font-display text-5xl md:text-6xl text-white tracking-tight leading-none">
          <ChapterName name={chapter.name} />
        </h3>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:text-base text-white/55">
          {chapter.university}
          <span className="inline-flex items-center gap-2 text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-sdx-teal" aria-hidden="true" />
            Active
          </span>
        </p>

        <p className="mt-6 text-sm md:text-base leading-relaxed text-white/70">{chapter.description}</p>

        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-5 text-sm">
          <div>
            <dt className="text-white/45">Members</dt>
            <dd className="mt-1 text-white/85">{chapter.memberCount}</dd>
          </div>
          <div>
            <dt className="text-white/45">Founded</dt>
            <dd className="mt-1 text-white/85">{chapter.founded}</dd>
          </div>
          <div>
            <dt className="text-white/45">Founder</dt>
            <dd className="mt-1 text-white/85">{chapter.founder}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
          {chapter.href && <ArrowLink href={chapter.href}>Visit {chapter.name}</ArrowLink>}
          <ArrowLink href={`mailto:${chapter.contactEmail}`}>Contact</ArrowLink>
        </div>
      </div>
    </article>
  );
}

export default function ChaptersPage() {
  return (
    <main className="relative">
      <PageHeader
        title="Chapters"
        subtitle="SDx university chapters bring builders together on campus. Same energy, same values, local community."
      />

      {/* Active chapters */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-14 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <MotionGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapters.map((chapter) => (
              <MotionCard key={chapter.id} enableHover={false}>
                <ChapterCard chapter={chapter} />
              </MotionCard>
            ))}
          </MotionGrid>

          {/* Planned */}
          <MotionGrid className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {plannedChapters.map((chapter) => (
              <MotionCard key={chapter.name} enableHover={false}>
                <article className="flex h-full flex-col rounded-lg border border-dashed border-white/15 p-7 md:p-9">
                  <h3 className="font-display text-4xl md:text-5xl text-white/80 tracking-tight leading-none">
                    <ChapterName name={chapter.name} />
                  </h3>
                  <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:text-base text-white/50">
                    {chapter.university}
                    <span className="inline-flex items-center gap-2 text-white/55">
                      <span className="h-1.5 w-1.5 rounded-full border border-dashed border-white/60" aria-hidden="true" />
                      Planned
                    </span>
                  </p>
                  <p className="mt-6 text-sm md:text-base leading-relaxed text-white/60">{chapter.description}</p>
                </article>
              </MotionCard>
            ))}
          </MotionGrid>
        </div>
      </section>

      {/* Why join */}
      <section className="relative py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <MotionSection>
            <SectionTitle>Why join a chapter</SectionTitle>
          </MotionSection>

          <MotionGrid className="mt-10 border-t border-white/[0.06]" staggerDelay={0.06}>
            {reasons.map((reason) => (
              <MotionCard key={reason.n} enableHover={false}>
                <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_minmax(0,1fr)_minmax(0,28rem)] items-baseline gap-x-4 md:gap-x-8 gap-y-1 py-5 md:py-6 border-b border-white/[0.06]">
                  <span className="font-mono text-[10px] md:text-xs font-bold" style={{ color: reason.color }}>
                    {reason.n}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl text-white/90 tracking-tight">{reason.title}</h3>
                  <p className="col-start-2 md:col-start-3 text-sm md:text-base leading-relaxed text-white/60">
                    {reason.desc}
                  </p>
                </div>
              </MotionCard>
            ))}
          </MotionGrid>
        </div>
      </section>

      <ClosingCta
        heading="Start a chapter."
        sub="Want to bring SDx to your university? We're looking for builders who want to lead."
      >
        <div className="flex flex-col items-center gap-6">
          <MotionButton className="inline-block">
            <Link href={`mailto:${SDX_EMAIL}?subject=Start a New Chapter`} className="block">
              <AsciiButton>Start a chapter</AsciiButton>
            </Link>
          </MotionButton>
          <ArrowLink href={SDX_LUMA}>Join the main community</ArrowLink>
        </div>
      </ClosingCta>
    </main>
  );
}
