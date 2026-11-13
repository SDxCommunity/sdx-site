'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { Github, Linkedin, Twitter } from 'lucide-react';

export type Person = {
  id: string;
  name: string;
  title?: string | null;
  company?: string | null;
  photoUrl?: string | null;
  bio?: string | string[] | null;
  testimonial?: string | null;
  skills?: string[] | null;
  additionalRoles?: string[] | null;
  linkedin?: string | null;
  github?: string | null;
  twitter?: string | null;
};

const QUOTE_LIMIT = 180;

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

/** A member or executive: portrait, name, role, then whatever the profile has. */
export default function PersonCard({ person }: { person: Person }) {
  const [expanded, setExpanded] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  const role = [person.title, person.company].filter(Boolean).join(' · ');
  const quote = person.testimonial ?? '';
  const longQuote = quote.length > QUOTE_LIMIT;
  const shownQuote = longQuote && !expanded ? `${quote.slice(0, QUOTE_LIMIT).trimEnd()}…` : quote;
  const showPhoto = Boolean(person.photoUrl) && !photoFailed;

  const links = [
    { href: person.linkedin, label: 'LinkedIn', Icon: Linkedin },
    { href: person.github, label: 'GitHub', Icon: Github },
    { href: person.twitter, label: 'X', Icon: Twitter },
  ].filter((link): link is { href: string; label: string; Icon: typeof Linkedin } => Boolean(link.href));

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] transition-[border-color,box-shadow] duration-300 group-hover:border-white/20 group-hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)]">
        {showPhoto ? (
          <Image
            src={person.photoUrl as string}
            alt={person.name}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 30% 20%, rgba(17,187,205,0.18) 0%, transparent 55%), repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 7px)',
            }}
          >
            <span className="font-display text-6xl text-white/30">{initials(person.name)}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <h3 className="mt-5 font-display text-2xl text-white tracking-tight">{person.name}</h3>
      {role && <p className="mt-1 text-sm text-white/55">{role}</p>}

      {Array.isArray(person.bio) ? (
        <ul className="mt-4 space-y-2 text-sm text-white/70 leading-relaxed list-disc pl-5 marker:text-white/40">
          {person.bio.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : (
        person.bio && <p className="mt-4 text-sm text-white/70 leading-relaxed">{person.bio}</p>
      )}

      {person.additionalRoles && person.additionalRoles.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-white/55">
          {person.additionalRoles.map((extra) => (
            <li key={extra}>{extra}</li>
          ))}
        </ul>
      )}

      {quote && (
        <blockquote className="mt-4 border-l border-white/15 pl-4 text-sm italic leading-relaxed text-white/60">
          &ldquo;{shownQuote}&rdquo;
          {longQuote && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              className="ml-2 not-italic text-white/45 underline underline-offset-4 decoration-white/20 hover:text-white/85 transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </blockquote>
      )}

      {person.skills && person.skills.length > 0 && (
        <p className="mt-4 text-xs leading-relaxed text-white/40">{person.skills.join(' · ')}</p>
      )}

      {links.length > 0 && (
        <div className="mt-auto flex gap-1 pt-4 -ml-1.5">
          {links.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${person.name} on ${label}`}
              className="p-1.5 text-white/40 hover:text-white transition-colors duration-200"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
