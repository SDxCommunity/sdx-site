import React from 'react';

/** The section heading used across the site: large Tiposka, sentence case, soft glow. */
export default function SectionTitle({
  children,
  as: Tag = 'h2',
  className = '',
  size = 'md',
}: {
  children: React.ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
  /** "sm" sets a step smaller, for subsections under a page title. */
  size?: 'sm' | 'md';
}) {
  return (
    <Tag
      className={`font-display ${size === 'sm' ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl'} text-white tracking-tight leading-[1.08] prismatic-glow-sm ${className}`}
    >
      {children}
    </Tag>
  );
}
