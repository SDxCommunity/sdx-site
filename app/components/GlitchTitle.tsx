'use client'

import React, { useEffect, useRef, useState } from 'react';
import StaggerTitle from '@/app/components/StaggerTitle';

/** A slice of the title, cut out at the pointer and shifted sideways. Positions are percentages of the title box. */
type Tear = { id: number; top: number; height: number; left: number; width: number; shift: number };

/** A new tear at most this often while the pointer moves. */
const TEAR_EVERY_MS = 110;
/** The tear heals this long after the pointer stops. */
const HEAL_MS = 100;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** The letters as inline blocks, built like StaggerTitle's, so every copy lines up with the title. */
function Letters({ text }: { text: string }) {
  return (
    <span className="inline-block whitespace-nowrap">
      {Array.from(text).map((ch, i) => (
        <span key={i} className="inline-block">
          {ch}
        </span>
      ))}
    </span>
  );
}

/**
 * The home title: plain bright white. Where the pointer moves over it, a thin slice
 * jitters sideways for a moment.
 */
export default function GlitchTitle({ text, className = '' }: { text: string; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lastTear = useRef(0);
  const healTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tears, setTears] = useState<Tear[]>([]);

  useEffect(() => () => {
    if (healTimer.current) clearTimeout(healTimer.current);
  }, []);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !rootRef.current) return;
    const now = performance.now();
    if (now - lastTear.current < TEAR_EVERY_MS) return;
    lastTear.current = now;

    const rect = rootRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const height = 3 + Math.random() * 4;
    const width = 10 + Math.random() * 12;
    setTears([
      {
        id: now,
        top: clamp(y - height / 2 + (Math.random() - 0.5) * 3, 0, 100 - height),
        height,
        left: clamp(x - width / 2, 0, 100 - width),
        width,
        shift: (Math.random() < 0.5 ? -1 : 1) * (0.005 + Math.random() * 0.008),
      },
    ]);

    if (healTimer.current) clearTimeout(healTimer.current);
    healTimer.current = setTimeout(() => setTears([]), HEAL_MS);
  };

  return (
    <div
      ref={rootRef}
      className={`relative isolate ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTears([])}
    >
      <StaggerTitle text={text} step={0.08} className="relative text-white title-bright" />

      {tears.map((tear) => (
        <span
          key={tear.id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 text-white"
          style={{
            clipPath: `inset(${tear.top}% ${100 - tear.left - tear.width}% ${100 - tear.top - tear.height}% ${tear.left}%)`,
          }}
        >
          {/* No fill behind the slice: the shifted copy overlaps the title, so it reads as a faint jitter */}
          <span
            className="inline-block title-bright"
            style={{ transform: `translateX(${tear.shift}em)` }}
          >
            <Letters text={text} />
          </span>
        </span>
      ))}
    </div>
  );
}
