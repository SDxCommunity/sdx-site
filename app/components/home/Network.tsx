'use client'

import React from 'react';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import SectionTitle from '@/app/components/SectionTitle';
import ArrowLink from '@/app/components/ArrowLink';
import ChapterName from '@/app/components/ChapterName';

const chapters = [
  { name: 'SDxUCSD', status: 'Active', dot: 'bg-sdx-teal' },
  { name: 'SDxSDSU', status: 'Active', dot: 'bg-sdx-blue' },
  { name: 'SDxUSD', status: 'Planned', dot: 'bg-white/20' },
];

function Column({ title, children, link }: { title: string; children: React.ReactNode; link: React.ReactNode }) {
  return (
    <MotionCard enableHover={false} className="flex flex-col border-t border-white/10 pt-6">
      <h3 className="font-display text-2xl text-white tracking-tight">{title}</h3>
      <div className="mt-4 flex-1 text-sm md:text-base text-white/70 leading-relaxed">{children}</div>
      <div className="mt-6">{link}</div>
    </MotionCard>
  );
}

/** Chapters, partners, and the executive network: where SDx reaches past its own events. */
export default function Network() {
  return (
    <section className="relative py-14 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <MotionSection>
          <SectionTitle>Where builders build.</SectionTitle>
        </MotionSection>

        <MotionGrid className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12" staggerDelay={0.12}>
          <Column title="University chapters" link={<ArrowLink href="/chapters">Explore chapters</ArrowLink>}>
            <p>SDx extends into campus communities, bringing builders together before they even graduate.</p>
            <ul className="mt-5 space-y-2.5">
              {chapters.map((chapter) => (
                <li key={chapter.name} className="flex items-center gap-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${chapter.dot}`} aria-hidden="true" />
                  <ChapterName name={chapter.name} className="font-display text-lg text-white tracking-tight" />
                  <span className="text-sm text-white/45">{chapter.status}</span>
                </li>
              ))}
            </ul>
          </Column>

          <Column title="Who we work with" link={<ArrowLink href="/members">Meet the builders</ArrowLink>}>
            <p>
              Connected to the organizations that matter. Y Combinator, OpenAI, Anthropic, Qualcomm, Supabase,
              Vercel, Replit, and the university systems across San Diego.
            </p>
          </Column>

          <Column title="Executive Network" link={<ArrowLink href="/executives">Explore the network</ArrowLink>}>
            <p>Peer-level AI implementation exchange for C-suite leaders. Real experience, shared openly.</p>
          </Column>
        </MotionGrid>
      </div>
    </section>
  );
}
