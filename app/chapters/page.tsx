'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Mail } from 'lucide-react';
import SectionHeader from '@/app/components/SectionHeader';
import ChapterName from '@/app/components/ChapterName';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import MotionButton from '@/app/components/motion/MotionButton';
import AsciiButton from '@/app/components/AsciiButton';

const chapters = [
  {
    id: "ucsd",
    name: "SDxUCSD",
    university: "UC San Diego",
    location: "San Diego, CA",
    status: "active",
    memberCount: "50+",
    founded: "2024",
    founder: "Dhruv Kanetkar",
    description: "The flagship chapter. An invite-only community where the best UCSD students building with AI share their latest experiments and projects.",
    href: "/chapters/ucsd",
    contactEmail: "ucsd@sdx.community",
  },
  {
    id: "sdsu",
    name: "SDxSDSU",
    university: "San Diego State University",
    location: "San Diego, CA",
    status: "active",
    memberCount: "New",
    founded: "2026",
    founder: "Matt Attardo",
    description: "Expanding SDx's presence with SDSU's vibrant student community. Builder-first programming for Aztec engineers and creators.",
    href: "/chapters/sdsu",
    contactEmail: "hello@sdx.community",
  },
];

const plannedChapters = [
  {
    name: "SDxUSD",
    university: "University of San Diego",
    description: "Planned launch 2026 or 2027. Bringing SDx to USD's campus community.",
  },
];

export default function ChaptersPage() {
  return (
    <main className="relative pt-24 px-4 sm:px-6 lg:px-8">
      {/* Ghosted letterform */}
      <div className="absolute right-0 top-0 bottom-0 w-[50vw] overflow-hidden" aria-hidden="true">
        <div className="absolute -right-[20%] top-[30%] -translate-y-1/2 font-display text-[40vw] ghosted-letterform rotate-90 whitespace-nowrap">
          SDx
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-12 relative z-[1]">
        <SectionHeader
          title="Chapters"
          subtitle="SDx university chapters bring builders together on campus. Same energy, same values, local community."
          badge="University"
        />

        {/* Active Chapters */}
        <div className="mb-16">
          <h2 className="font-display text-2xl text-white mb-6">Active</h2>
          <MotionGrid className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map(chapter => (
              <MotionCard key={chapter.id}>
                <Link href={chapter.href !== '#' ? chapter.href : `mailto:${chapter.contactEmail}`} className="block group">
                  <Card className="h-full transition-colors duration-200 group-hover:border-white/20">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <CardTitle className="text-3xl md:text-4xl"><ChapterName name={chapter.name} /></CardTitle>
                          <p className="text-sm text-white/40 mt-0.5">{chapter.university}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-sdx-teal" />
                          <span className="text-xs uppercase tracking-widest text-white/30">Active</span>
                        </div>
                      </div>

                      <p className="text-sm text-white/40 leading-relaxed mb-4">{chapter.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">{chapter.memberCount} members</Badge>
                        <Badge variant="outline">Founded {chapter.founded}</Badge>
                        <Badge variant="outline">{chapter.founder}</Badge>
                      </div>

                      <div className="mt-auto flex items-center justify-end gap-3">
                        {chapter.href !== '#' && (
                          <span className="btn-secondary px-4 py-1.5 text-xs uppercase tracking-widest rounded-sm">
                            Learn more &rarr;
                          </span>
                        )}
                        <span
                          onClick={(e) => { e.preventDefault(); window.location.href = `mailto:${chapter.contactEmail}`; }}
                          className="btn-secondary px-4 py-1.5 text-xs uppercase tracking-widest rounded-sm flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Contact
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </MotionCard>
            ))}
          </MotionGrid>
        </div>

        {/* Planned */}
        <div className="mb-16">
          <h2 className="font-display text-2xl text-white mb-6">Planned</h2>
          <MotionGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plannedChapters.map((chapter, index) => (
              <MotionCard key={index}>
                <Card className="opacity-60">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <CardTitle className="text-3xl md:text-4xl"><ChapterName name={chapter.name} /></CardTitle>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">{chapter.description}</p>
                  </CardContent>
                </Card>
              </MotionCard>
            ))}
          </MotionGrid>
        </div>

        {/* Why Join */}
        <div className="mb-16">
          <h2 className="font-display text-2xl text-white mb-6">Why join a chapter</h2>
          <MotionGrid className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Build on campus', desc: 'Peer community for learning and building together. Lower the barrier to entry for first-time builders.' },
              { title: 'Events & demos', desc: 'Chapter-specific Hack Days, demo sessions, and Paper Club discussions.' },
              { title: 'Pipeline to SDx', desc: 'Connect to the broader ecosystem. Mentors, events, partners, and a reason to stay in San Diego after graduation.' },
            ].map((item) => (
              <MotionCard key={item.title}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </MotionCard>
            ))}
          </MotionGrid>
        </div>

      </div>

      {/* Start a Chapter CTA — full width, break out of parent padding */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 relative overflow-hidden border-t border-white/5 pt-16 pb-16 text-center">
        <PrismaticCanvas intensity="subtle" />
        <MotionSection className="relative z-10 px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-white mb-3 prismatic-glow-sm">Start a chapter.</h2>
          <p className="text-sm text-white/40 mb-6 max-w-md mx-auto">
            Interested in bringing SDx to your university? We&apos;re looking for builders who want to lead.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MotionButton className="inline-block">
              <Link href="mailto:hello@sdx.community?subject=Start a New Chapter" className="block">
                <AsciiButton>Start a Chapter</AsciiButton>
              </Link>
            </MotionButton>
            <MotionButton className="inline-block">
              <Link
                href="https://lu.ma/sdx"
                target="_blank"
                className="block btn-secondary px-6 py-2 text-xs uppercase tracking-widest rounded-sm transition-shadow duration-200"
              >
                Join Main Community
              </Link>
            </MotionButton>
          </div>
        </MotionSection>
      </div>
    </main>
  );
}
