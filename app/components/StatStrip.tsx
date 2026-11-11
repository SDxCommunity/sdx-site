'use client'

import React, { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import PrismaticCanvas from '@/app/components/PrismaticCanvas';

export type Stat = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  /** Digits after the decimal point, for values such as $4.2M. */
  decimals?: number;
};

function Count({ to, prefix = '', suffix = '', decimals = 0 }: Omit<Stat, 'label' | 'value'> & { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE_SOFT,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  const shown =
    decimals > 0
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString('en-US');

  return (
    <span ref={ref}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/**
 * Count-up stats on the mouse-reactive color field. Three stats sit in one row;
 * four stats sit in a 2x2 grid on phones and one row from md.
 */
export default function StatStrip({
  stats,
  className = 'max-w-4xl mx-auto px-4',
}: {
  stats: Stat[];
  /** Width and padding of the outer wrapper. */
  className?: string;
}) {
  const four = stats.length === 4;

  return (
    <div className={`relative z-10 w-full ${className}`}>
      <div className="relative overflow-hidden rounded-sm border border-white/10 bg-black">
        <PrismaticCanvas intensity="medium" />
        {/* Text ignores the pointer so mouse moves reach the canvas underneath */}
        <div
          className={`pointer-events-none relative z-10 grid ${
            four ? 'grid-cols-2 gap-y-6 md:grid-cols-4 md:gap-y-0 md:divide-x' : 'grid-cols-3 divide-x'
          } divide-white/10 py-7 md:py-9`}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-2 sm:px-6 md:px-10 text-center ${four && i % 2 === 1 ? 'border-l border-white/10' : ''}`}
            >
              <span className="block font-display text-xl sm:text-3xl md:text-5xl text-white/90 tracking-tight">
                <Count to={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
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
