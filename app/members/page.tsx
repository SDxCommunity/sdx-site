'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Linkedin, Github, Twitter, ChevronDown, ChevronUp } from 'lucide-react';
import SectionHeader from '@/app/components/SectionHeader';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import MotionButton from '@/app/components/motion/MotionButton';
import AsciiButton from '@/app/components/AsciiButton';

const spotlightMembers = require('../../data/members.json');

interface MemberCardProps {
  member: typeof spotlightMembers[0];
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const testimonialLimit = 150;
  const shouldTruncate = member.testimonial && member.testimonial.length > testimonialLimit;
  const displayedTestimonial = shouldTruncate && !isExpanded
    ? member.testimonial.substring(0, testimonialLimit) + '...'
    : member.testimonial;

  return (
    <Card className="h-full">
      <CardHeader className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/[0.04] flex items-center justify-center overflow-hidden">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={member.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : (
            <span className="text-lg font-display text-white/40">
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          )}
          <span className="text-lg font-display text-white/40 hidden">
            {member.name.split(' ').map((n: string) => n[0]).join('')}
          </span>
        </div>
        <CardTitle className="text-base">{member.name}</CardTitle>
        {member.title && <p className="text-sm text-white/40">{member.title}</p>}
        {member.company && <Badge variant="secondary" className="w-fit mx-auto mt-1">{member.company}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        {member.bio && (
          <p className="text-sm text-white/40 leading-relaxed">{member.bio}</p>
        )}

        {member.testimonial && (
          <div className="bg-white/[0.02] p-3 rounded-lg">
            <blockquote className="text-xs italic text-white/30 text-left leading-relaxed">
              &quot;{displayedTestimonial}&quot;
            </blockquote>
            {shouldTruncate && (
              <button
                className="w-full mt-2 text-xs uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors duration-200 flex items-center justify-center gap-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>More <ChevronDown className="w-3 h-3" /></>}
              </button>
            )}
          </div>
        )}

        {member.skills && member.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 3).map((skill: string, index: number) => (
              <Badge key={index} variant="outline">{skill}</Badge>
            ))}
            {member.skills.length > 3 && (
              <Badge variant="outline">+{member.skills.length - 3}</Badge>
            )}
          </div>
        )}

        <div className="flex gap-1 justify-center pt-1">
          {member.linkedin && (
            <Link href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 text-white/20 hover:text-white transition-colors duration-200">
              <Linkedin className="w-3.5 h-3.5" />
            </Link>
          )}
          {member.github && (
            <Link href={member.github} target="_blank" rel="noopener noreferrer" className="p-1.5 text-white/20 hover:text-white transition-colors duration-200">
              <Github className="w-3.5 h-3.5" />
            </Link>
          )}
          {member.twitter && (
            <Link href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 text-white/20 hover:text-white transition-colors duration-200">
              <Twitter className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function MembersPage() {
  const featuredMembers = spotlightMembers;

  return (
    <main className="relative pt-24 px-4 sm:px-6 lg:px-8">
      {/* Ghosted letterform */}
      <div className="absolute left-0 top-0 bottom-0 w-[50vw] overflow-hidden" aria-hidden="true">
        <div className="absolute -left-[20%] top-[40%] -translate-y-1/2 font-display text-[45vw] ghosted-letterform -rotate-90 whitespace-nowrap">
          SDx
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-12 relative z-[1]">
        <SectionHeader
          title="Featured Members"
          subtitle="The people shipping real things in San Diego. Engineers, founders, and operators building at the cutting edge."
          badge="Community"
        />

        {/* Stats */}
        <MotionSection delay={0.1} className="flex flex-wrap items-center gap-4 md:gap-8 mb-16">
          <div className="bg-white/10 rounded-sm px-4 py-2 text-center">
            <span className="block text-xl md:text-2xl font-bold text-white/90">3000+</span>
            <span className="block text-xs uppercase tracking-widest text-white/40 mt-0.5">Builders</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10" />
          <div className="bg-white/10 rounded-sm px-4 py-2 text-center">
            <span className="block text-xl md:text-2xl font-bold text-white/90">{featuredMembers.length}</span>
            <span className="block text-xs uppercase tracking-widest text-white/40 mt-0.5">Featured</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10" />
          <div className="bg-white/10 rounded-sm px-4 py-2 text-center">
            <span className="block text-xl md:text-2xl font-bold text-white/90">50+</span>
            <span className="block text-xs uppercase tracking-widest text-white/40 mt-0.5">Projects</span>
          </div>
        </MotionSection>

        {/* Members Grid */}
        <MotionGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {featuredMembers.map((member: typeof spotlightMembers[0]) => (
            <MotionCard key={member.id}>
              <MemberCard member={member} />
            </MotionCard>
          ))}
        </MotionGrid>

      </div>

      {/* CTA — full width, break out of parent padding */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden border-t border-white/5 pt-16 pb-16 text-center">
        <PrismaticCanvas intensity="subtle" />
        <MotionSection className="relative z-10 px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-white mb-3 prismatic-glow-sm">Come build.</h2>
          <p className="text-sm text-white/40 mb-6 max-w-md mx-auto">
            Join 3000+ builders shipping real things in San Diego.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MotionButton className="inline-block">
              <Link href="https://lu.ma/sdx" target="_blank" className="block">
                <AsciiButton>Join Community</AsciiButton>
              </Link>
            </MotionButton>
            <MotionButton className="inline-block">
              <Link
                href="https://discord.gg/Y7ME6kQAye"
                target="_blank"
                className="block btn-secondary px-6 py-2 text-xs uppercase tracking-widest rounded-sm transition-shadow duration-200"
              >
                Discord
              </Link>
            </MotionButton>
          </div>
        </MotionSection>
      </div>
    </main>
  );
}
