'use client'

import React, { useCallback, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { GeistSerif } from 'geist/font/serif';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import Portrait from './Portrait';
import { Bullets, Links, iconButton } from './ProfileParts';
import type { Alum } from './people';

/**
 * The full profile in the dialog. The dialog has one fixed size, so the controls
 * stay put for every person; long lists scroll. The links sit in the bottom-left
 * corner and the arrows in the bottom-right, at the same inset as the close button.
 */
function Profile({ person, onStep }: { person: Alum; onStep: (delta: number) => void }) {
  return (
    <div className="flex h-full flex-col md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="relative h-52 shrink-0 overflow-hidden bg-white/[0.02] md:h-full">
        <Portrait person={person} className="absolute inset-0 h-full w-full" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col px-6 pt-6 md:px-10 md:pt-10">
          <Dialog.Title className="shrink-0 pr-10 text-3xl md:text-5xl text-white tracking-tight leading-[1.05]">
            {person.name}
          </Dialog.Title>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-4">
            <Bullets person={person} />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 p-4">
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
          <Dialog.Overlay className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
            {/* The dialog renders in a portal outside the page, so it sets the page font itself */}
            <Dialog.Content
              aria-describedby={undefined}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') step(1);
                if (e.key === 'ArrowLeft') step(-1);
              }}
              className={`${GeistSerif.className} relative h-[min(40rem,calc(100svh-2rem))] w-full max-w-4xl overflow-hidden rounded-lg border border-white/10 bg-black duration-150 md:h-[min(34rem,calc(100svh-2rem))] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95`}
            >
              <Profile person={people[shown]} onStep={step} />
              <Dialog.Close aria-label="Close" className={`absolute right-4 top-4 bg-black/60 ${iconButton}`}>
                <X className="h-4 w-4" strokeWidth={1.75} />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
