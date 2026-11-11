'use client'

import React, { useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { GeistSerif } from 'geist/font/serif';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Portrait from './Portrait';
import { Bullets, Links, iconButton } from './ProfileParts';
import type { Alum } from './people';

const titleClass = 'text-3xl md:text-5xl text-white tracking-tight leading-[1.05]';

/**
 * The full profile in the dialog. Every person's text sits in the same grid
 * cell, with all but the open one hidden, so the card always takes the height
 * of the longest profile: nothing scrolls, and the controls never move. The
 * close button, links, and arrows sit in their corners at one inset; the name and
 * lists sit in from the corner with roomier padding.
 */
function Profile({ people, shown, onStep }: { people: Alum[]; shown: number; onStep: (delta: number) => void }) {
  const person = people[shown];

  return (
    <div className="flex flex-col md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="relative h-36 shrink-0 overflow-hidden bg-white/[0.02] md:h-auto">
        <Portrait person={person} className="absolute inset-0 h-full w-full" />
      </div>

      <div className="flex flex-col">
        <div className="grid flex-1 px-6 pt-6 md:px-10 md:pt-10">
          {people.map((p, i) => {
            const active = i === shown;
            return (
              <div
                key={p.slug}
                aria-hidden={active ? undefined : true}
                className={`col-start-1 row-start-1 pb-2 md:pb-6 ${active ? '' : 'invisible'}`}
              >
                {active ? (
                  <Dialog.Title className={titleClass}>{p.name}</Dialog.Title>
                ) : (
                  <p className={titleClass}>{p.name}</p>
                )}
                <div className="mt-3 md:mt-5">
                  <Bullets person={p} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 p-4">
          <Links person={person} />
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => onStep(-1)} aria-label="Previous person" className={iconButton}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button type="button" onClick={() => onStep(1)} aria-label="Next person" className={iconButton}>
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The people lookbook: a three-column grid in rank order. Each card shows a
 * photo, the name, and one current position. A click opens the full profile in
 * a dialog, where the arrow keys step through people. The URL hash names the
 * open person, so a link can open on anyone.
 */
export default function PeopleGrid({ people }: { people: Alum[] }) {
  const [open, setOpen] = useState<number | null>(null);
  // The last person opened stays in the dialog while it fades out.
  const [shown, setShown] = useState(0);

  // Opening or closing also updates the hash. Doing it here, not in an effect,
  // keeps an effect from clearing the hash before the first read of it.
  const show = useCallback(
    (i: number | null) => {
      setOpen(i);
      if (i !== null) setShown(i);
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', i === null ? `${pathname}${search}` : `#${people[i].slug}`);
    },
    [people],
  );

  const step = useCallback(
    (delta: number) => show((shown + delta + people.length) % people.length),
    [people.length, show, shown],
  );

  // Open the person the hash names, and follow later hash links.
  useEffect(() => {
    const fromHash = () => {
      const found = people.findIndex((p) => p.slug === window.location.hash.slice(1));
      show(found >= 0 ? found : null);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [people, show]);

  return (
    <>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12">
        {people.map((person, i) => (
          <li key={person.slug}>
            <button type="button" onClick={() => show(i)} className="group block w-full text-left">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] transition-colors duration-150 group-hover:border-white/25">
                <Portrait
                  person={person}
                  className="absolute inset-0 h-full w-full grayscale transition-[filter,transform] duration-200 group-hover:scale-[1.02] group-hover:grayscale-0"
                />
              </div>
              <p className="mt-3 text-lg md:text-2xl text-white tracking-tight leading-tight">{person.name}</p>
              <p className="mt-1 text-xs md:text-sm text-white/55 leading-snug">{person.headline}</p>
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={open !== null} onOpenChange={(isOpen) => !isOpen && show(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 flex overflow-y-auto bg-black/80 p-4 backdrop-blur-sm duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
            {/* The dialog renders in a portal outside the page, so it sets the page font itself */}
            <Dialog.Content
              aria-describedby={undefined}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') step(1);
                if (e.key === 'ArrowLeft') step(-1);
              }}
              className={`${GeistSerif.className} relative m-auto w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-black duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95`}
            >
              <Profile people={people} shown={shown} onStep={step} />
              {/* A bare X, no box. The padding is hit area only; the glyph's edges sit at the corner inset. */}
              <Dialog.Close
                aria-label="Close"
                className="absolute right-2 top-2 p-2 text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-colors duration-150 hover:text-white"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
                  <path d="M1 1l14 14M15 1L1 15" />
                </svg>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
