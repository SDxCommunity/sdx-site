'use client'

import React, { createContext, useEffect, useState, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const TransitionPhaseContext = createContext<string>('idle');

const CELL_SIZE = 60;
const GAP = 5;
const STEP = CELL_SIZE + GAP;
const BORDER_RADIUS = '22%';
const FILL_STAGGER = 100;
const EXIT_STAGGER = 100;
/** Wait after the fill starts before the route changes. The backdrop covers the page by then. */
const PUSH_DELAY = FILL_STAGGER + 30;
/** Pause on the covered screen before the exit starts. */
const HOLD = 30;
const FEATHER_SIZE = 20;

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<'idle' | 'mounted' | 'fill' | 'hold' | 'exit'>('idle');
  const [frozenChildren, setFrozenChildren] = useState(children);
  const prevPathRef = useRef(pathname);
  const isTransitioning = useRef(false);
  const pendingHref = useRef<string | null>(null);
  const whiteCellsRef = useRef<Set<number>>(new Set());
  const [whiteCount, setWhiteCount] = useState(0);
  const spawnRef = useRef<NodeJS.Timeout | null>(null);
  const [dims, setDims] = useState({ w: 1920, h: 1080 });

  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cells = useMemo(() => {
    const cols = Math.ceil(dims.w / STEP) + 2;
    const rows = Math.ceil(dims.h / STEP) + 2;
    const maxDiag = cols + rows - 2;
    const result: { x: number; y: number; fillDelay: number; exitDelay: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const diag = (rows - 1 - r) + c;
        const norm = diag / maxDiag;

        result.push({
          x: c * STEP - STEP,
          y: r * STEP - STEP,
          fillDelay: norm * FILL_STAGGER,
          exitDelay: norm * EXIT_STAGGER,
        });
      }
    }

    return result;
  }, [dims]);

  // Intercept internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isTransitioning.current) {
        e.preventDefault();
        return;
      }

      const link = (e.target as HTMLElement).closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank'
      ) return;

      if (href === pathname) return;

      e.preventDefault();
      isTransitioning.current = true;
      pendingHref.current = href;

      // Pick which cells are white for this transition
      const whites = new Set<number>();
      for (let j = 0; j < cells.length; j++) {
        if (Math.random() < 0.06) whites.add(j);
      }
      whiteCellsRef.current = whites;

      setFrozenChildren(children);
      setPhase('mounted');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('fill');
        });
      });

      setTimeout(() => {
        if (pendingHref.current) {
          router.push(pendingHref.current);
        }
      }, PUSH_DELAY);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, children, router, cells]);

  // Progressively turn more grid cells white during transition
  useEffect(() => {
    if (phase === 'fill' || phase === 'hold') {
      let count = 0;
      spawnRef.current = setInterval(() => {
        count++;
        if (count > 50) {
          if (spawnRef.current) clearInterval(spawnRef.current);
          return;
        }
        // Flip 2-3 random cells to white each tick
        for (let j = 0; j < 3; j++) {
          const idx = Math.floor(Math.random() * cells.length);
          whiteCellsRef.current.add(idx);
        }
        setWhiteCount(whiteCellsRef.current.size);
      }, 25);
    } else {
      if (spawnRef.current) clearInterval(spawnRef.current);
    }
    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [phase, cells.length]);

  // Handle navigation completion
  useEffect(() => {
    if (prevPathRef.current === pathname) {
      if (!isTransitioning.current) {
        setFrozenChildren(children);
      }
      return;
    }

    prevPathRef.current = pathname;
    setPhase('hold');
    setFrozenChildren(children);
    window.scrollTo(0, 0);

    // Brief hold, then exit animation to reveal new page
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, HOLD);

    // After exit animation completes, go to idle so motion animations fire
    const doneTimer = setTimeout(() => {
      setPhase('idle');
      isTransitioning.current = false;
      pendingHref.current = null;
    }, HOLD + EXIT_STAGGER + 150);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [pathname, children]);

  const showGrid = phase !== 'idle';

  return (
    <div className="relative">
      {showGrid && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
          {/* Solid black backdrop — prevents content bleeding through gaps between squares */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'black',
              opacity: phase === 'fill' || phase === 'hold' ? 1 : 0,
              transition: phase === 'exit' ? 'opacity 150ms ease-out' : 'opacity 100ms ease-out',
            }}
          />
          {/* Feather layer */}
          <div style={{ position: 'absolute', inset: 0 }}>
            {cells.map((cell, i) => {
              const isFilling = phase === 'fill' || phase === 'hold';
              const isExiting = phase === 'exit';

              return (
                <div
                  key={`f${i}`}
                  style={{
                    position: 'absolute',
                    left: cell.x - FEATHER_SIZE,
                    top: cell.y - FEATHER_SIZE,
                    width: CELL_SIZE + FEATHER_SIZE * 2,
                    height: CELL_SIZE + FEATHER_SIZE * 2,
                    background: 'radial-gradient(ellipse at center, black 35%, rgba(0,0,0,0.7) 55%, transparent 75%)',
                    opacity: isFilling ? 1 : 0,
                    transform: isFilling ? 'scale(1)' : isExiting ? 'scale(0.5)' : 'scale(0)',
                    transition: isFilling
                      ? `opacity 80ms ease-out ${cell.fillDelay}ms, transform 120ms cubic-bezier(0.2, 0, 0, 1) ${cell.fillDelay}ms`
                      : isExiting
                        ? `opacity 120ms ease-in ${cell.exitDelay}ms, transform 150ms ease-in ${cell.exitDelay}ms`
                        : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Square layer */}
          <div style={{ position: 'absolute', inset: 0 }}>
            {cells.map((cell, i) => {
              const isFilling = phase === 'fill' || phase === 'hold';
              const isExiting = phase === 'exit';
              const isWhite = whiteCellsRef.current.has(i);

              return (
                <div
                  key={`s${i}`}
                  style={{
                    position: 'absolute',
                    left: cell.x,
                    top: cell.y,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: isWhite ? 'white' : 'black',
                    border: '1px solid white',
                    borderRadius: BORDER_RADIUS,
                    opacity: isFilling ? 1 : 0,
                    transform: isFilling ? 'scale(1)' : isExiting ? 'scale(0.5)' : 'scale(0)',
                    transition: isFilling
                      ? `opacity 80ms ease-out ${cell.fillDelay}ms, transform 120ms cubic-bezier(0.2, 0, 0, 1) ${cell.fillDelay}ms, background-color 250ms ease-out`
                      : isExiting
                        ? `opacity 120ms ease-in ${cell.exitDelay}ms, transform 150ms ease-in ${cell.exitDelay}ms`
                        : 'none',
                  }}
                />
              );
            })}
          </div>

        </div>
      )}

      <TransitionPhaseContext.Provider value={phase}>
        {frozenChildren}
      </TransitionPhaseContext.Provider>
    </div>
  );
};

export default PageTransition;
