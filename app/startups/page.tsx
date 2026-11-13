'use client'

import React, { useState } from 'react';
import StartupCard from '@/app/components/StartupCard';
import startupsData from '@/data/startups.json';
import PageHeader from '@/app/components/PageHeader';
import StatStrip from '@/app/components/StatStrip';
import SectionTitle from '@/app/components/SectionTitle';
import ClosingCta from '@/app/components/ClosingCta';
import SdxJoinRow from '@/app/components/SdxJoinRow';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';

const categories = Array.from(new Set(startupsData.map((startup) => startup.category)));
const statuses = Array.from(new Set(startupsData.map((startup) => startup.status)));

const totalFunding = startupsData.reduce((sum, startup) => {
  if (startup.metrics.funding && startup.metrics.funding !== 'Open Source') {
    const amount = parseFloat(startup.metrics.funding.replace(/[$KM]/g, ''));
    const multiplier = startup.metrics.funding.includes('M') ? 1000000 : 1000;
    return sum + amount * multiplier;
  }
  return sum;
}, 0);

const totalUsers = startupsData.reduce((sum, startup) => {
  if (startup.metrics.users && startup.metrics.users !== 'Open Source') {
    const amount = parseFloat(startup.metrics.users.replace(/[K+]/g, ''));
    return sum + amount * 1000;
  }
  return sum;
}, 0);

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border-b pb-1.5 text-sm transition-colors duration-200 ${
        active ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/85'
      }`}
    >
      {children}
    </button>
  );
}

export default function StartupsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredStartups = startupsData.filter((startup) => {
    const matchesCategory = categoryFilter === 'all' || startup.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || startup.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  return (
    <main className="relative">
      <PageHeader
        title="Startups"
        subtitle="Companies built by SDx community members. From hackathon projects to funded startups."
      />

      <section className="relative px-4 sm:px-6 lg:px-8">
        <MotionSection delay={0.1} className="max-w-6xl mx-auto">
          <StatStrip
            className="px-0"
            stats={[
              { value: startupsData.length, label: 'startups' },
              { value: totalFunding / 1000000, prefix: '$', suffix: 'M', decimals: 1, label: 'funded' },
              { value: Math.round(totalUsers / 1000), suffix: 'K+', label: 'users' },
              { value: categories.length, label: 'industries' },
            ]}
          />
        </MotionSection>
      </section>

      {/* Featured */}
      <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <MotionSection>
            <SectionTitle>Featured</SectionTitle>
          </MotionSection>
          <MotionGrid className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {startupsData.slice(0, 3).map((startup) => (
              <MotionCard key={startup.id} enableHover={false} className="h-full">
                <StartupCard
                  name={startup.name}
                  description={startup.story}
                  logoUrl={startup.logoUrl}
                  founders={startup.founders}
                  metrics={startup.metrics}
                  websiteUrl={startup.websiteUrl}
                  category={startup.category}
                />
              </MotionCard>
            ))}
          </MotionGrid>
        </div>
      </section>

      {/* Directory */}
      <section className="relative pb-14 md:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <MotionSection>
            <SectionTitle>Every startup</SectionTitle>
          </MotionSection>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3" role="group" aria-label="Filter startups">
            <FilterButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>
              All
            </FilterButton>
            {categories.map((category) => (
              <FilterButton
                key={category}
                active={categoryFilter === category}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </FilterButton>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3" role="group" aria-label="Filter by stage">
            {statuses.map((status) => (
              <FilterButton
                key={status}
                active={statusFilter === status}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              >
                {status}
              </FilterButton>
            ))}
          </div>

          <MotionGrid
            key={`${categoryFilter}-${statusFilter}`}
            className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStartups.map((startup) => (
              <MotionCard key={startup.id} enableHover={false} className="h-full">
                <StartupCard
                  name={startup.name}
                  description={startup.description}
                  logoUrl={startup.logoUrl}
                  founders={startup.founders}
                  metrics={startup.metrics}
                  websiteUrl={startup.websiteUrl}
                  category={startup.category}
                />
              </MotionCard>
            ))}
          </MotionGrid>

          {filteredStartups.length === 0 && (
            <p className="mt-10 text-sm md:text-base text-white/60">No startups match these filters.</p>
          )}
        </div>
      </section>

      <ClosingCta heading="Build the next one." sub="Connect with founders, find co-founders, and access our network.">
        <SdxJoinRow track="startups" />
      </ClosingCta>
    </main>
  );
}
