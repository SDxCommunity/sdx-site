'use client'

import React from 'react';
import PageHeader from '@/app/components/PageHeader';
import StatStrip from '@/app/components/StatStrip';
import SectionTitle from '@/app/components/SectionTitle';
import ClosingCta from '@/app/components/ClosingCta';
import SdxJoinRow from '@/app/components/SdxJoinRow';
import PersonCard, { type Person } from '@/app/components/PersonCard';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import membersData from '@/data/members.json';

const members = membersData as (Person & { featured?: boolean })[];
const featured = members.filter((member) => member.featured);
const others = members.filter((member) => !member.featured);

/** "A, B, and C" */
function listNames(names: string[]) {
  if (names.length < 3) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export default function MembersPage() {
  return (
    <main className="relative">
      <PageHeader
        title="Members"
        subtitle="The people shipping real things in San Diego. Engineers, founders, and operators building at the cutting edge."
      />

      <section className="relative px-4 sm:px-6 lg:px-8">
        <MotionSection delay={0.1} className="max-w-6xl mx-auto">
          <StatStrip
            className="px-0"
            stats={[
              { value: 3000, suffix: '+', label: 'builders' },
              { value: featured.length, label: 'featured members' },
              { value: 50, suffix: '+', label: 'projects shipped' },
            ]}
          />
        </MotionSection>
      </section>

      <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <MotionSection>
            <SectionTitle>Featured members</SectionTitle>
          </MotionSection>

          <MotionGrid className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {featured.map((member) => (
              <MotionCard key={member.id} enableHover={false}>
                <PersonCard person={member} />
              </MotionCard>
            ))}
          </MotionGrid>

          {others.length > 0 && (
            <MotionSection className="mt-20 border-t border-white/10 pt-8">
              <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/60">
                Also building with us: {listNames(others.map((member) => member.name))}.
              </p>
            </MotionSection>
          )}
        </div>
      </section>

      <ClosingCta heading="Come build." sub="Join 3000+ builders shipping real things in San Diego.">
        <SdxJoinRow track="members" />
      </ClosingCta>
    </main>
  );
}
