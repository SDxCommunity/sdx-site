import React from 'react';

/** The section heading used across the site: large Tiposka, sentence case, soft glow. */
export default function SectionTitle({
  children,
  as: Tag = 'h2',
  className = '',
}: {
  children: React.ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
}) {
  return (
    <Tag
      className={`font-display text-3xl md:text-5xl text-white tracking-tight leading-[1.08] prismatic-glow-sm ${className}`}
    >
      {children}
    </Tag>
  );
}
