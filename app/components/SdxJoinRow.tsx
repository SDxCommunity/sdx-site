'use client'

import React from 'react';
import JoinRow from '@/app/components/JoinRow';
import { DiscordIcon, LinkedInIcon } from '@/app/components/SocialIcons';
import { SDX_DISCORD, SDX_JOIN, SDX_LINKEDIN } from '@/lib/links';

/** GA labels from the old home buttons, kept so existing reports keep counting. */
const GA_LABELS: Record<string, { join: string; left: string; right: string }> = {
  hero: { join: 'hero-cta', left: 'hero-discord', right: 'hero-linkedin' },
  cta: { join: 'cta-luma', left: 'cta-discord', right: 'cta-linkedin' },
};

/** The main-site join row: the Luma join button between Discord and LinkedIn. */
export default function SdxJoinRow({
  label = 'Start building',
  track,
  className = '',
}: {
  label?: string;
  /** Where the row sits, for GA labels, for example "hero". */
  track?: string;
  className?: string;
}) {
  const ga = track
    ? GA_LABELS[track] ?? { join: `${track}-join`, left: `${track}-discord`, right: `${track}-linkedin` }
    : undefined;

  return (
    <JoinRow
      className={className}
      join={{ href: SDX_JOIN, label, ga: ga?.join }}
      left={{ href: SDX_DISCORD, label: 'SDx on Discord', ga: ga?.left, icon: <DiscordIcon className="h-4 w-4" /> }}
      right={{ href: SDX_LINKEDIN, label: 'SDx on LinkedIn', ga: ga?.right, icon: <LinkedInIcon className="h-4 w-4" /> }}
    />
  );
}
