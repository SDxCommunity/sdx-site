'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelectedLayoutSegments } from 'next/navigation';

const INITIAL_CELLS = [
  { x: '12%', y: '20%', d: '0.0s' },
  { x: '85%', y: '15%', d: '0.1s' },
  { x: '25%', y: '75%', d: '0.2s' },
  { x: '70%', y: '80%', d: '0.15s' },
  { x: '8%', y: '50%', d: '0.05s' },
  { x: '92%', y: '45%', d: '0.25s' },
  { x: '40%', y: '12%', d: '0.08s' },
  { x: '55%', y: '88%', d: '0.18s' },
  { x: '30%', y: '40%', d: '0.12s' },
  { x: '75%', y: '35%', d: '0.22s' },
  { x: '18%', y: '65%', d: '0.3s' },
  { x: '60%', y: '60%', d: '0.1s' },
];

const Stinger: React.FC = () => {
  const [phase, setPhase] = useState<'building' | 'built' | 'exit' | 'done'>('building');
  const [cells, setCells] = useState(INITIAL_CELLS);
  const overlayRef = useRef<HTMLDivElement>(null);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);

  const handleTransitionEnd = useCallback(() => {
    if (phase === 'exit') {
      setPhase('done');
    }
  }, [phase]);

  // Lock scrolling during stinger
  useEffect(() => {
    if (phase !== 'done') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  useEffect(() => {
    // "building..." → "built."
    const builtTimer = setTimeout(() => setPhase('built'), 1400);
    // Start slide-away
    const exitTimer = setTimeout(() => setPhase('exit'), 2200);

    return () => {
      clearTimeout(builtTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  // Spawn new squares over time
  useEffect(() => {
    if (phase === 'exit' || phase === 'done') {
      if (spawnRef.current) clearInterval(spawnRef.current);
      return;
    }

    let count = 0;
    spawnRef.current = setInterval(() => {
      count++;
      if (count > 25) {
        if (spawnRef.current) clearInterval(spawnRef.current);
        return;
      }
      setCells(prev => [
        ...prev,
        {
          x: `${5 + Math.random() * 90}%`,
          y: `${5 + Math.random() * 90}%`,
          d: '0s', // pop in immediately
        },
      ]);
    }, 80);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      ref={overlayRef}
      onTransitionEnd={handleTransitionEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: phase === 'exit' ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.8s cubic-bezier(0.7, 0, 0.3, 1)',
      }}
    >
      {/* Metaball squares */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <filter id="goo-stinger">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -15"
              />
            </filter>
          </defs>
        </svg>
        <div className="absolute inset-0 opacity-[0.08]" style={{ filter: 'url(#goo-stinger)' }}>
          {cells.map((cell, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: cell.x,
                top: cell.y,
                width: 42,
                height: 42,
                background: 'white',
                borderRadius: '0%',
                transform: 'translate(-50%, -50%) scale(0)',
                animation: `stinger-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${cell.d} forwards`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Center text */}
      <div className="relative z-10 text-center">
        <div className="font-display text-4xl md:text-6xl text-white tracking-tight overflow-hidden">
          {phase === 'building' && (
            <span
              className="inline-block"
              style={{ animation: 'stinger-text 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              building
              <span
                className="inline-block"
                style={{ animation: 'stinger-dots 1.4s ease-in-out infinite' }}
              >...</span>
            </span>
          )}
          {(phase === 'built' || phase === 'exit') && (
            <span
              className="inline-block"
              style={{ animation: 'stinger-text 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              built.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * The "building... built." intro on first load. The UCSD chapter skips it.
 * Route segments, not the pathname, identify the chapter: ucsd.sdx.community
 * rewrites "/" to /chapters/ucsd, and only the segments see the rewritten route.
 */
const LoadingStinger: React.FC = () => {
  const segments = useSelectedLayoutSegments();
  if (segments[0] === 'chapters' && segments[1] === 'ucsd') return null;
  return <Stinger />;
};

export default LoadingStinger;
