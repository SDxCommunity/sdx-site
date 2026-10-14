'use client'

import React, { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';
import media from '../lib/media';

const stats = [
  { value: media.stats.attendees, suffix: '+', label: 'attendees hosted' },
  { value: media.stats.events, suffix: '+', label: 'events run' },
  { value: media.stats.hackathons, suffix: '+', label: 'hackathons organized' },
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
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
      {/* Same mouse-reactive color field as the closing "Start building" section */}
      <div className="relative overflow-hidden rounded-sm border border-white/10 bg-black">
        <PrismaticCanvas intensity="medium" />
        {/* Text ignores the pointer so mouse moves reach the canvas underneath */}
        <div className="pointer-events-none relative z-10 grid grid-cols-3 divide-x divide-white/10 py-7 md:py-9">
          {stats.map((stat) => (
            <div key={stat.label} className="px-2 sm:px-6 md:px-10 text-center">
              <span className="block font-display text-xl sm:text-3xl md:text-5xl text-white/90 tracking-tight">
                <Count to={stat.value} suffix={stat.suffix} />
              </span>
              <span className="block mt-2 text-xs sm:text-sm md:text-base text-white/60">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
