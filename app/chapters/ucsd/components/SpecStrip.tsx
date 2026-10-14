'use client'

import React, { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import media from '../lib/media';

const stats = [
  { value: media.stats.attendees, suffix: '+', label: 'Attendees hosted' },
  { value: media.stats.events, suffix: '+', label: 'Events run' },
  { value: media.stats.hackathons, suffix: '+', label: 'Hackathons organized' },
];

function Count({ to, suffix }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE_SOFT,
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

export default function SpecStrip() {
  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
      <div className="grid grid-cols-3 divide-x divide-white/10">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 md:px-6 text-center">
            <span className="block font-display text-2xl md:text-3xl text-white/90 tracking-tight">
              <Count to={stat.value} suffix={stat.suffix} />
            </span>
            <span className="block mt-1.5 text-[10px] uppercase tracking-widest text-white/35">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
