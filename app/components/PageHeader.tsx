'use client'

import React from 'react';
import { m } from 'motion/react';
import { EASE_SOFT } from '@/lib/motion';
import AsciiDrift from '@/app/components/AsciiDrift';
import StaggerTitle from '@/app/components/StaggerTitle';

/** Soft color pools behind the header, in the brand palette. */
const GLOWS = {
  full: 'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(17,187,205,0.12), transparent 60%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(217,44,45,0.08), transparent 55%)',
  cool: 'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(17,187,205,0.14), transparent 60%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(3,198,97,0.08), transparent 55%)',
  warm: 'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(252,87,21,0.12), transparent 60%), radial-gradient(ellipse 40% 40% at 10% 80%, rgba(250,194,5,0.08), transparent 55%)',
};

type PageHeaderProps = {
  title: string;
  /** Letters from this index on render as outlines, for chapter names. */
  outlineFrom?: number;
  subtitle?: React.ReactNode;
  tone?: keyof typeof GLOWS;
  /** Actions under the subtitle, such as an ArrowLink. */
  children?: React.ReactNode;
  /** A link on the title's line, just after the title. */
  aside?: React.ReactNode;
  /** "md" sets a smaller title. */
  size?: 'lg' | 'md';
};

const TITLE_SIZES = {
  lg: 'text-[clamp(2.75rem,9vw,6.5rem)]',
  md: 'text-[clamp(2.5rem,7vw,5rem)]',
};

/**
 * The header for every inner page: a letter-staggered title over a faint ASCII
 * drift field, with the same soft color pools as the chapter home.
 */
export default function PageHeader({
  title,
  outlineFrom,
  subtitle,
  tone = 'full',
  children,
  aside,
  size = 'lg',
}: PageHeaderProps) {
  const heading = (
    <StaggerTitle
      text={title}
      outlineFrom={outlineFrom}
      delay={0.05}
      step={0.035}
      className={`font-display ${TITLE_SIZES[size]} leading-[0.95] tracking-tight text-white prismatic-glow select-none`}
    />
  );

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-36 md:pt-44 pb-14 md:pb-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: GLOWS[tone] }}
        aria-hidden="true"
      />
      <AsciiDrift />

      <div className="relative z-[1] max-w-6xl mx-auto">
        {aside ? (
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
            {heading}
            <m.div
              className="shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              {aside}
            </m.div>
          </div>
        ) : (
          heading
        )}

        {subtitle && (
          <m.p
            className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-white/70"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_SOFT, delay: 0.12 }}
          >
            {subtitle}
          </m.p>
        )}

        {children && (
          <m.div
            className="mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_SOFT, delay: 0.18 }}
          >
            {children}
          </m.div>
        )}
      </div>
    </section>
  );
}
