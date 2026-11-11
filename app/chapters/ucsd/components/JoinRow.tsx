'use client'

import React from 'react';
import SharedJoinRow from '@/app/components/JoinRow';
import { InstagramIcon, LinkedInIcon } from '@/app/components/SocialIcons';
import { UCSD_INSTAGRAM, UCSD_JOIN, UCSD_LINKEDIN } from '../lib/links';

/** Join us, flanked by square Instagram and LinkedIn buttons. */
export default function JoinRow({ className = '' }: { className?: string }) {
  return (
    <SharedJoinRow
      className={className}
      join={{ href: UCSD_JOIN, label: 'Join us' }}
      left={{ href: UCSD_INSTAGRAM, label: 'SDx at UCSD on Instagram', icon: <InstagramIcon className="h-4 w-4" /> }}
      right={{ href: UCSD_LINKEDIN, label: 'SDx at UCSD on LinkedIn', icon: <LinkedInIcon className="h-4 w-4" /> }}
    />
  );
}
