'use client'

import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * "cover" while the grid sweeps in, "reveal" while it sweeps out over the new page.
 * Sections hold their entrance animations until the cover is gone.
 */
export type TransitionPhase = 'idle' | 'cover' | 'reveal';
export const TransitionPhaseContext = createContext<TransitionPhase>('idle');

const CELL = 56;
const GAP = 6;
const STEP = CELL + GAP;
const RADIUS = CELL * 0.22;
/** The sweep in. The next page loads while it runs. */
const COVER_MS = 180;
/** The sweep out, over the new page. */
const REVEAL_MS = 240;
/** How long one cell takes to grow or shrink. The rest of each sweep is the diagonal stagger. */
const CELL_MS = 110;
/** Cells that start white. */
const WHITE_SHARE = 0.06;
/**
 * If the next page is still loading this long after the cover, the grid lifts onto plain
 * black instead of waiting, so the wipe never runs much past half a second.
 */
const MAX_HOLD_MS = 80;
/** The fade from black onto a page that arrived after the grid lifted. */
const FADE_MS = 160;
/** Show the page anyway if it has not arrived by then. */
const MAX_WAIT_MS = 8000;
/**
 * The longest step one frame may advance the wipe. A long task, such as the new page
 * rendering, then pauses the wipe instead of skipping it.
 */
const MAX_FRAME_MS = 34;

type Cell = { x: number; y: number; order: number };
/**
 * cover: the grid sweeps in. hold: the grid waits briefly for the page. reveal: the grid sweeps
 * off the new page. lift: the grid sweeps off onto black, because the page is late. wait: black
 * until the page arrives. fade: the black fades off the new page.
 */
type Mode = 'idle' | 'cover' | 'hold' | 'reveal' | 'lift' | 'wait' | 'fade';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn = (t: number) => t * t * t;

/** The grid, ordered on the diagonal from the bottom-left corner. */
function buildCells(w: number, h: number): Cell[] {
  const cols = Math.ceil(w / STEP) + 1;
  const rows = Math.ceil(h / STEP) + 1;
  const offsetX = (w - (cols * STEP - GAP)) / 2;
  const offsetY = (h - (rows * STEP - GAP)) / 2;
  const maxDiag = Math.max(1, cols + rows - 2);
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ x: offsetX + c * STEP, y: offsetY + r * STEP, order: (rows - 1 - r + c) / maxDiag });
    }
  }
  return cells;
}

/**
 * The grid wipe between pages. One canvas draws every cell, so the wipe holds 60fps.
 * The next page starts loading on click, and the grid lifts as soon as it arrives.
 */
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  // The page on screen. It stays on the old page until the grid covers it.
  const [shown, setShown] = useState(children);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPath = useRef(pathname);
  const nextChildren = useRef(children);
  const busy = useRef(false);
  const routeReady = useRef(false);
  const swapped = useRef(false);
  // Time in the current mode, built up from capped frame steps. last is 0 until the mode's first frame.
  const anim = useRef<{ mode: Mode; elapsed: number; last: number; raf: number }>({
    mode: 'idle',
    elapsed: 0,
    last: 0,
    raf: 0,
  });
  const cells = useRef<Cell[]>([]);
  const whites = useRef<Set<number>>(new Set());
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      size.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cells.current = buildCells(w, h);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(anim.current.raf);
      if (safety.current) clearTimeout(safety.current);
    };
  }, []);

  /** Puts the new page under the grid (reveal) or under the black (fade) and starts uncovering it. */
  const beginReveal = useCallback((mode: 'reveal' | 'fade' = 'reveal') => {
    if (safety.current) clearTimeout(safety.current);
    anim.current.mode = mode;
    anim.current.elapsed = 0;
    anim.current.last = 0;
    swapped.current = true;
    setShown(nextChildren.current);
    window.scrollTo(0, 0);
    setPhase('reveal');
  }, []);

  /** The page arrived: uncover it in the way that fits the current mode. */
  const onRouteReady = useCallback(() => {
    routeReady.current = true;
    const mode = anim.current.mode;
    if (mode === 'hold') beginReveal('reveal');
    else if (mode === 'wait') beginReveal('fade');
    // During cover or lift, the frame loop picks it up when that sweep ends.
  }, [beginReveal]);

  /** Draws one frame. Returns false when the wipe is over. */
  const frame = useCallback(
    (now: number) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return false;
      const { w, h, dpr } = size.current;
      const a = anim.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (a.mode === 'idle') return false;

      a.elapsed += a.last ? Math.min(now - a.last, MAX_FRAME_MS) : 0;
      a.last = now;
      let elapsed = a.elapsed;
      const restart = (mode: Mode) => {
        a.mode = mode;
        a.elapsed = 0;
        a.last = now;
        elapsed = 0;
      };

      if (a.mode === 'cover' && elapsed >= COVER_MS) {
        if (routeReady.current) {
          beginReveal('reveal');
          restart('reveal');
        } else {
          restart('hold');
        }
      } else if (a.mode === 'hold' && elapsed >= MAX_HOLD_MS) {
        restart('lift');
      } else if (a.mode === 'lift' && elapsed >= REVEAL_MS) {
        if (routeReady.current) {
          beginReveal('fade');
          restart('fade');
        } else {
          restart('wait');
        }
      } else if ((a.mode === 'reveal' && elapsed >= REVEAL_MS) || (a.mode === 'fade' && elapsed >= FADE_MS)) {
        a.mode = 'idle';
        busy.current = false;
        swapped.current = false;
        setPhase('idle');
        return false;
      }

      const mode = a.mode;
      const backdrop =
        mode === 'cover'
          ? easeOut(clamp01(elapsed / COVER_MS))
          : mode === 'reveal'
            ? 1 - easeIn(clamp01(elapsed / (REVEAL_MS * 0.8)))
            : mode === 'fade'
              ? 1 - clamp01(elapsed / FADE_MS)
              : 1;
      if (backdrop > 0) {
        ctx.fillStyle = `rgba(0,0,0,${backdrop})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (mode === 'wait' || mode === 'fade') return true;

      const span = (mode === 'cover' ? COVER_MS : REVEAL_MS) - CELL_MS;
      const scaleOf = (order: number) => {
        if (mode === 'hold') return 1;
        const p = clamp01((elapsed - order * span) / CELL_MS);
        return mode === 'cover' ? easeOut(p) : 1 - easeIn(p);
      };

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      // Two passes: black cells with a white edge, then the white cells.
      for (const white of [false, true]) {
        ctx.beginPath();
        cells.current.forEach((cell, i) => {
          if (whites.current.has(i) !== white) return;
          const s = scaleOf(cell.order);
          if (s < 0.02) return;
          const side = CELL * s;
          const inset = (CELL - side) / 2;
          if (ctx.roundRect) ctx.roundRect(cell.x + inset, cell.y + inset, side, side, RADIUS * s);
          else ctx.rect(cell.x + inset, cell.y + inset, side, side);
        });
        ctx.fillStyle = white ? '#fff' : '#000';
        ctx.fill();
        if (!white) ctx.stroke();
      }
      return true;
    },
    [beginReveal]
  );

  const startLoop = useCallback(() => {
    const step = (now: number) => {
      anim.current.raf = frame(now) ? requestAnimationFrame(step) : 0;
    };
    if (!anim.current.raf) anim.current.raf = requestAnimationFrame(step);
  }, [frame]);

  // Internal link clicks start the wipe and the navigation together.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest('a');
      if (!link) return;
      if (busy.current) {
        e.preventDefault();
        return;
      }
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (reduceMotion.matches) return;

      const href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#)/.test(href) || link.target === '_blank' || link.hasAttribute('download')) {
        return;
      }
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      e.preventDefault();
      busy.current = true;
      routeReady.current = false;
      swapped.current = false;

      const picked = new Set<number>();
      cells.current.forEach((_, i) => {
        if (Math.random() < WHITE_SHARE) picked.add(i);
      });
      whites.current = picked;

      anim.current.mode = 'cover';
      anim.current.elapsed = 0;
      anim.current.last = 0;
      setPhase('cover');
      startLoop();
      // The wipe scrolls to the top itself, under the grid, so the old page never jumps.
      router.push(url.pathname + url.search + url.hash, { scroll: false });

      safety.current = setTimeout(onRouteReady, MAX_WAIT_MS);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router, startLoop, onRouteReady]);

  // The new page arrived: uncover it once the screen is covered.
  useEffect(() => {
    nextChildren.current = children;
    if (prevPath.current === pathname) {
      if (!busy.current || swapped.current) setShown(children);
      return;
    }
    prevPath.current = pathname;
    if (!busy.current) {
      // Back and forward buttons skip the wipe.
      setShown(children);
      return;
    }
    onRouteReady();
  }, [pathname, children, onRouteReady]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9998] h-full w-full"
        style={{ visibility: phase === 'idle' ? 'hidden' : 'visible' }}
      />
      <TransitionPhaseContext.Provider value={phase}>{shown}</TransitionPhaseContext.Provider>
    </div>
  );
};

export default PageTransition;
