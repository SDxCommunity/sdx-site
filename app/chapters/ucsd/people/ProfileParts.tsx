import React from 'react';
import ArrowLink from '@/app/components/ArrowLink';
import type { Alum } from './people';

function Section({ title, lines, tone }: { title: string; lines: string[]; tone: string }) {
  return (
    <section>
      <h3 className="text-sm text-white/45">{title}</h3>
      <ul className={`mt-2 space-y-1.5 pl-4 ${tone}`}>
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" aria-hidden="true" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Currently" first, then "Previously", each an indented list with a dot per line. */
export function Bullets({ person }: { person: Alum }) {
  return (
    <div className="space-y-6 text-sm md:text-base leading-relaxed">
      <Section title="Currently" lines={person.current} tone="text-white/90" />
      {person.previously.length > 0 && <Section title="Previously" lines={person.previously} tone="text-white/70" />}
    </div>
  );
}

/** LinkedIn and website links. A GitHub profile is labeled as one. */
export function Links({ person }: { person: Alum }) {
  if (!person.linkedin && !person.website) return null;
  const websiteLabel = person.website?.includes('github.com') ? 'GitHub' : 'Website';

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {person.linkedin && <ArrowLink href={person.linkedin}>LinkedIn</ArrowLink>}
      {person.website && <ArrowLink href={person.website}>{websiteLabel}</ArrowLink>}
    </div>
  );
}
