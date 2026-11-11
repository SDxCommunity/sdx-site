'use client'

import React from 'react';
import StatStrip from '@/app/components/StatStrip';
import media from '../lib/media';

const stats = [
  { value: media.stats.attendees, suffix: '+', label: 'attendees hosted' },
  { value: media.stats.events, suffix: '+', label: 'events run' },
  { value: media.stats.hackathons, suffix: '+', label: 'hackathons organized' },
];

export default function SpecStrip() {
  return <StatStrip stats={stats} />;
}
