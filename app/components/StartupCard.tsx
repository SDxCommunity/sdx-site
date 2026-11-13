'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

interface StartupCardProps {
  name: string;
  description: string;
  logoUrl?: string;
  founders: string[];
  metrics: {
    funding?: string;
    users?: string;
    revenue?: string;
    githubStars?: string;
  };
  websiteUrl?: string;
  category: string;
}

const METRIC_LABELS: [keyof StartupCardProps['metrics'], string][] = [
  ['funding', 'Funding'],
  ['users', 'Users'],
  ['revenue', 'Revenue'],
  ['githubStars', 'Stars'],
];

/** "A", "A and B", or "A, B, and C" */
function listNames(names: string[]) {
  if (names.length < 3) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

const StartupCard: React.FC<StartupCardProps> = ({
  name,
  description,
  logoUrl,
  founders,
  metrics,
  websiteUrl,
  category,
}) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const shownMetrics = METRIC_LABELS.filter(([key]) => metrics[key]);

  const content = (
    <article className="relative flex h-full flex-col rounded-lg border border-white/10 bg-black p-6 transition-[border-color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:border-white/25">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
          {logoUrl && !logoFailed ? (
            <Image
              src={logoUrl}
              alt={`${name} logo`}
              width={44}
              height={44}
              className="h-full w-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="font-display text-lg text-white/60">{name[0]}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl text-white tracking-tight leading-tight">{name}</h3>
          <p className="mt-0.5 text-sm text-white/50">{category}</p>
        </div>
        {websiteUrl && (
          <ArrowUpRight
            className="ml-auto h-4 w-4 shrink-0 self-start text-white/30 transition-colors group-hover:text-white"
            aria-hidden="true"
          />
        )}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-white/70">{description}</p>

      {founders.length > 0 && (
        <p className="mt-4 text-sm text-white/45">Founded by {listNames(founders)}</p>
      )}

      {shownMetrics.length > 0 && (
        // Pinned to the bottom so metrics line up across a row of cards
        <div className="mt-auto pt-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 text-sm">
            {shownMetrics.map(([key, label]) => (
              <div key={key}>
                <dt className="text-white/45">{label}</dt>
                <dd className="mt-0.5 font-display text-lg text-white/90 tracking-tight">{metrics[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </article>
  );

  if (websiteUrl) {
    return (
      <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="group block h-full">
        {content}
      </a>
    );
  }

  return content;
};

export default StartupCard;
