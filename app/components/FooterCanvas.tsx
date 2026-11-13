'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useCanvasSettings } from './CanvasSettingsContext';
import { buildFireWorkerSource, resolveSpaceMonoFontUrl, supportsOffscreenCanvas } from './footerFireWorker';
import { DEFAULT_FIRE_COLORS } from './footerFireColors';

type FooterCanvasProps = {
  className?: string;
  /** One color per fire glyph, sparsest to densest. A chapter passes its accent here. */
  fireColors?: readonly string[];
};

const FooterCanvas: React.FC<FooterCanvasProps> = ({ className = '', fireColors: customFireColors }) => {
  const { settings } = useCanvasSettings();
  const rootRef = useRef<HTMLDivElement>(null);
  // The footer sits below the fold on first load — don't spin up the grid
  // build + rAF/mouse-tracking engine until it's about to scroll into view.
  const [isNear, setIsNear] = useState(false);
  const gooRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement[]>([]);
  // Parallel plain-number arrays for per-cell home position + current/
  // last-written mouse offset — avoids per-frame dataset (DOM attribute)
  // reads/writes and their string parsing.
  const homeXRef = useRef<number[]>([]);
  const homeYRef = useRef<number[]>([]);
  const offXRef = useRef<number[]>([]);
  const offYRef = useRef<number[]>([]);
  const lastWriteXRef = useRef<number[]>([]);
  const lastWriteYRef = useRef<number[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const smoothMouseRef = useRef({ x: -1000, y: -1000 });
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const built = useRef(false);
  // Cached container size — refreshed by the existing ResizeObserver
  // instead of a getBoundingClientRect() layout read inside the 60fps tick.
  const sizeRef = useRef({ w: 0, h: 0 });
  // Two-way visibility: separate from `isNear` (one-way mount gate) — this
  // tracks whether the footer is CURRENTLY on screen so the rAF loop can
  // stop doing real work when scrolled back out of view.
  const footerVisibleRef = useRef(false);
  // Fire-rendering Worker (OffscreenCanvas path) — null when unsupported or
  // not yet created. A canvas can only be transferred to a worker once, so
  // offscreenTransferredRef guards against a second transfer attempt if
  // this effect re-runs on the same DOM node (e.g. React 18 strict-mode
  // dev double-invoke). terminateTimeoutRef defers actual worker.terminate()
  // by a tick so a strict-mode phantom cleanup-then-remount can cancel it
  // and reuse the live worker instead of trying to re-transfer.
  const workerRef = useRef<Worker | null>(null);
  const offscreenTransferredRef = useRef(false);
  const terminateTimeoutRef = useRef<number | null>(null);

  const opacity = settings.footerOpacity;
  const blur = settings.footerBlur;
  const contrast = settings.footerContrast;
  const threshold = settings.footerThreshold;
  const cellSize = settings.footerCellSize;
  const mouseRadius = 280;
  const mouseStrength = 120;
  const mouseLag = 0.85;

  // Single source of truth for the fire glyph size — shared by the
  // main-thread fallback path below and the worker source generated for
  // the OffscreenCanvas path, so the two can never drift apart.
  const charFontSize = 11;

  // Characters ordered by density: sparse → dense
  const fireChars = ' .`-\'_,^:;~=><+!?*/\\)s(d{x}[S]D|X#%&@';

  const fireColors = customFireColors ?? DEFAULT_FIRE_COLORS;

  // Simple seeded noise for fire turbulence
  const noiseTable = useRef<Float32Array | null>(null);
  if (!noiseTable.current) {
    const t = new Float32Array(512);
    for (let i = 0; i < 512; i++) t[i] = Math.random();
    noiseTable.current = t;
  }
  const noise = (x: number, y: number): number => {
    const t = noiseTable.current!;
    const ix = ((Math.floor(x) % 256) + 256) % 256;
    const iy = ((Math.floor(y) % 256) + 256) % 256;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const a = t[ix + (iy & 255)];
    const b = t[(ix + 1) % 256 + (iy & 255)];
    const c = t[ix + ((iy + 1) & 255)];
    const d = t[(ix + 1) % 256 + ((iy + 1) & 255)];
    const lx1 = a + (b - a) * fx;
    const lx2 = c + (d - c) * fx;
    return lx1 + (lx2 - lx1) * fy;
  };

  const buildGrid = () => {
    const el = gooRef.current;
    const root = rootRef.current;
    if (!el || !root) return;

    while (el.firstChild) el.removeChild(el.firstChild);
    cellsRef.current = [];
    homeXRef.current = [];
    homeYRef.current = [];
    offXRef.current = [];
    offYRef.current = [];
    lastWriteXRef.current = [];
    lastWriteYRef.current = [];

    const sr = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const rect = root.getBoundingClientRect();
    const w = rect.width || 1200;
    const h = rect.height || 600;
    const gap = cellSize + 12;
    const cols = Math.ceil(w / gap) + 2;
    const rows = Math.ceil(h / gap) + 2;
    const offsetX = (w - (cols - 1) * gap) / 2;
    const offsetY = (h - (rows - 1) * gap) / 2;

    const frag = document.createDocumentFragment();
    let css = '';
    let idx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const s = r * cols + c + 7;
        // Density: thick at bottom, thinning toward top
        const rowNorm = r / (rows - 1);
        const spawnChance = rowNorm * rowNorm * settings.footerDensity;
        if (sr(s) > spawnChance) continue;

        const cx = offsetX + c * gap;
        const cy = offsetY + r * gap;

        const wp = [];
        for (let i = 0; i < 4; i++) {
          const angle = Math.floor(sr(s + 10 + i * 3) * 4);
          const dirs = [[1, -1], [-1, -1], [1, 1], [-1, 1]];
          const [dx, dy] = dirs[angle];
          const dist = 8 + sr(s + 11 + i * 3) * 14;
          wp.push({ x: Math.round(dx * dist), y: Math.round(dy * dist) });
        }

        const dur = 8 + sr(s + 3) * 10;
        const delay = sr(s + 4) * 6;

        const div = document.createElement('div');
        Object.assign(div.style, {
          position: 'absolute',
          left: `${cx}px`,
          top: `${cy}px`,
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          background: 'white',
          borderRadius: '0%',
          transform: 'translate(-50%, -50%)',
          translate: '0px 0px',
          willChange: 'transform, translate',
          animation: `fd${idx} ${dur.toFixed(1)}s cubic-bezier(1,0,0.31,1.39) ${delay.toFixed(1)}s infinite`,
        });

        css += `@keyframes fd${idx}{
  0%,100%{transform:translate(-50%,-50%)}
  18%{transform:translate(calc(-50% + ${wp[0].x}px),calc(-50% + ${wp[0].y}px))}
  25%{transform:translate(calc(-50% + ${Math.round(wp[0].x * 0.2)}px),calc(-50% + ${Math.round(wp[0].y * 0.2)}px))}
  43%{transform:translate(calc(-50% + ${wp[1].x}px),calc(-50% + ${wp[1].y}px))}
  50%{transform:translate(calc(-50% + ${Math.round(wp[1].x * 0.2)}px),calc(-50% + ${Math.round(wp[1].y * 0.2)}px))}
  68%{transform:translate(calc(-50% + ${wp[2].x}px),calc(-50% + ${wp[2].y}px))}
  75%{transform:translate(calc(-50% + ${Math.round(wp[2].x * 0.2)}px),calc(-50% + ${Math.round(wp[2].y * 0.2)}px))}
  93%{transform:translate(calc(-50% + ${wp[3].x}px),calc(-50% + ${wp[3].y}px))}
}\n`;

        frag.appendChild(div);
        cellsRef.current.push(div);
        homeXRef.current.push(cx);
        homeYRef.current.push(cy);
        offXRef.current.push(0);
        offYRef.current.push(0);
        lastWriteXRef.current.push(0);
        lastWriteYRef.current.push(0);
        idx++;
      }
    }

    css += `@media(prefers-reduced-motion:reduce){div[style*="animation"]{animation:none!important}}\n`;

    const style = document.createElement('style');
    style.textContent = css;
    el.appendChild(style);
    el.appendChild(frag);
  };

  // Detect when the footer is about to scroll into view before doing any
  // of the expensive grid-building / rAF work below.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isNear) return;
    const root = rootRef.current;
    if (!root) return;

    const doBuild = () => {
      const rect = root.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      workerRef.current?.postMessage({ type: 'resize', w: rect.width, h: rect.height });
      if (rect.height > 10) {
        buildGrid();
      }
    };

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        sizeRef.current = { w: width, h: height };
        workerRef.current?.postMessage({ type: 'resize', w: width, h: height });
      }
      built.current = false;
      doBuild();
    });
    ro.observe(root);

    // Multiple attempts — footer may not have laid out on first frame
    requestAnimationFrame(doBuild);
    setTimeout(doBuild, 100);
    setTimeout(doBuild, 500);

    return () => {
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNear, cellSize, settings.footerDensity]);

  // Two-way visibility gate: once mounted, track whether the footer is
  // CURRENTLY on screen so the rAF loop can stop doing real work when the
  // user scrolls back away from it (unlike `isNear` above, which is a
  // one-shot mount trigger and intentionally never re-fires).
  useEffect(() => {
    if (!isNear) return;
    const root = rootRef.current;

    // Forward the combined (tab-hidden OR footer-offscreen) visibility
    // state to the fire worker so its own rAF loop can stop drawing —
    // worker rAF may throttle on a hidden tab anyway, but this makes the
    // pause explicit rather than relying on that.
    const syncWorkerPause = () => {
      const shouldPause = document.hidden || !footerVisibleRef.current;
      workerRef.current?.postMessage({ type: shouldPause ? 'pause' : 'resume' });
    };
    document.addEventListener('visibilitychange', syncWorkerPause);

    if (!root || typeof IntersectionObserver === 'undefined') {
      footerVisibleRef.current = true;
      syncWorkerPause();
      return () => document.removeEventListener('visibilitychange', syncWorkerPause);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        footerVisibleRef.current = entries.some((entry) => entry.isIntersecting);
        syncWorkerPause();
      },
      { threshold: 0 }
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncWorkerPause);
    };
  }, [isNear]);

  // Mouse interaction + ASCII fire rendering
  useEffect(() => {
    if (!isNear) return;
    const container = rootRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!container || !asciiCanvas) return;

    // When OffscreenCanvas is available, a separate effect transfers this
    // canvas to a Worker that owns the fire atlas build + per-frame draw
    // entirely off this thread. This effect then does cell physics only —
    // never touching asciiCanvas.getContext()/.width/.height, since calling
    // getContext() even once on a canvas permanently pins its rendering
    // context type and would make a later transferControlToOffscreen()
    // throw InvalidStateError. When unsupported, this is the original
    // main-thread atlas path, kept exactly as it was (also the SSR-safe /
    // no-JS-worker-support fallback).
    const useWorker = supportsOffscreenCanvas(asciiCanvas);

    const onDocMove = (e: MouseEvent) => {
      // Skip the layout read entirely while scrolled out of view — the
      // footer can't be under the cursor anyway.
      if (!footerVisibleRef.current) {
        mouseRef.current = { x: -1000, y: -1000 };
        return;
      }
      const rect = container.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      } else {
        mouseRef.current = { x: -1000, y: -1000 };
      }
    };
    document.addEventListener('mousemove', onDocMove);

    const fontString = `${charFontSize}px "Space Mono", monospace`;
    const fireCharsLen = fireChars.length;
    const fireColorsLen = fireColors.length;

    // Per-frame invariants, recomputed only when the canvas size actually
    // changes (or once the webfont finishes loading) — never inside the
    // hot per-character loop below.
    let charWidth = 0;
    let cols = 0;
    let rows = 0;
    let colPhase: Float32Array = new Float32Array(0);
    let heightNormByRow: Float32Array = new Float32Array(0);
    let atlas: { canvas: HTMLCanvasElement; cellW: number; cellH: number } | null = null;
    let metricsDirty = true;

    // Some glyphs in this font paint ink outside their nominal advance
    // box under textBaseline 'top' — e.g. ')' has a negative
    // actualBoundingBoxLeft (ink starts left of x). Each atlas slot gets
    // generous left/top margins so that ink is never clipped by the
    // neighboring slot's source-crop boundary.
    const LEFT_PAD = charFontSize;
    const TOP_PAD = charFontSize;

    // Pre-render each fireChars[i] (skipping space) in its fixed
    // fireColors[i] color to an offscreen strip, using the identical font/
    // baseline fillText would have used. Each glyph gets a generously
    // padded slot (cellW/cellH) so antialiasing/ink overflow from one
    // glyph can never bleed into a neighboring slot's source pixels.
    const buildAtlas = (measuredCharWidth: number) => {
      const cellW = LEFT_PAD + Math.ceil(measuredCharWidth) + charFontSize;
      const cellH = TOP_PAD + Math.ceil(charFontSize * 2);
      const atlasCanvas = document.createElement('canvas');
      atlasCanvas.width = Math.max(1, cellW * fireCharsLen);
      atlasCanvas.height = cellH;
      const actx = atlasCanvas.getContext('2d');
      if (!actx) return null;
      actx.font = fontString;
      actx.textBaseline = 'top';
      for (let i = 0; i < fireCharsLen; i++) {
        const glyph = fireChars[i];
        if (glyph === ' ') continue;
        actx.fillStyle = fireColors[Math.min(i, fireColorsLen - 1)];
        actx.fillText(glyph, i * cellW + LEFT_PAD, TOP_PAD);
      }
      return { canvas: atlasCanvas, cellW, cellH };
    };

    // Recomputes charWidth/cols/rows/colPhase/heightNormByRow + rebuilds
    // the glyph atlas. Called from the resize-detection block in tick(),
    // not every frame.
    const recomputeMetrics = (ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
      ctx.font = fontString;
      charWidth = ctx.measureText('@').width || charFontSize * 0.6;
      cols = Math.ceil(cw / charWidth) + 5;
      rows = Math.ceil(ch / charFontSize) + 2;

      const cp = new Float32Array(cols);
      for (let c = 0; c < cols; c++) {
        cp[c] = Math.sin(c * 2.1 + 0.5) * 3 + Math.sin(c * 0.7 + 1.3) * 5;
      }
      colPhase = cp;

      const hn = new Float32Array(rows);
      for (let r = 0; r < rows; r++) {
        hn[r] = (r * charFontSize) / ch; // 0 at top, 1 at bottom
      }
      heightNormByRow = hn;

      atlas = buildAtlas(charWidth);
    };

    // "Space Mono" may not be loaded yet when the atlas is first built —
    // fillText would silently fall back to monospace metrics until then,
    // so mirror that by rebuilding once the font finishes loading. Only
    // relevant to the main-thread fallback path — the worker resolves and
    // loads the font itself (see the worker-setup effect below).
    if (!useWorker && typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.load(`${charFontSize}px "Space Mono"`).catch(() => {});
      document.fonts.ready
        .then(() => {
          metricsDirty = true;
        })
        .catch(() => {});
    }

    const tick = () => {
      // Tab is backgrounded, or the footer has scrolled out of view —
      // nothing is visible, so skip the work but keep the rAF chain alive
      // (cheap) so it resumes automatically the moment either clears.
      if (document.hidden || !footerVisibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const w = sizeRef.current.w;
      const h = sizeRef.current.h;

      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Mouse interaction — same as hero
      const target = mouseRef.current;
      const smooth = smoothMouseRef.current;
      smooth.x += (target.x - smooth.x) * mouseLag;
      smooth.y += (target.y - smooth.y) * mouseLag;

      const cells = cellsRef.current;
      const homeX = homeXRef.current;
      const homeY = homeYRef.current;
      const offX = offXRef.current;
      const offY = offYRef.current;
      const lastWriteX = lastWriteXRef.current;
      const lastWriteY = lastWriteYRef.current;

      for (let i = 0; i < cells.length; i++) {
        const hx = homeX[i];
        const hy = homeY[i];
        const ddx = hx - smooth.x;
        const ddy = hy - smooth.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);

        let targetOffX = 0;
        let targetOffY = 0;
        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * mouseStrength;
          targetOffX = -(ddx / dist) * force;
          targetOffY = -(ddy / dist) * force;
        }

        const curOffX = offX[i];
        const curOffY = offY[i];
        const newOffX = curOffX + (targetOffX - curOffX) * 0.08;
        const newOffY = curOffY + (targetOffY - curOffY) * 0.08;
        offX[i] = newOffX;
        offY[i] = newOffY;

        // Skip the style write once the offset has settled to within a
        // sub-pixel epsilon of what's already rendered — avoids needless
        // compositor work (and possible filter-layer re-raster) for the
        // vast majority of cells, which sit at rest most of the time.
        if (Math.abs(newOffX - lastWriteX[i]) > 0.02 || Math.abs(newOffY - lastWriteY[i]) > 0.02) {
          cells[i].style.translate = `${newOffX}px ${newOffY}px`;
          lastWriteX[i] = newOffX;
          lastWriteY[i] = newOffY;
        }
      }

      // Draw ASCII fire — procedural, scrolling upward. Main-thread fallback
      // only: when useWorker is true, the fire worker owns this canvas
      // entirely (transferred via transferControlToOffscreen()) and calling
      // getContext()/.width/.height here would throw.
      if (!useWorker) {
        const cw = Math.ceil(w);
        const ch = Math.ceil(h);
        const ctx = asciiCanvas.getContext('2d');
        if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }

        if (asciiCanvas.width !== cw || asciiCanvas.height !== ch) {
          asciiCanvas.width = cw;
          asciiCanvas.height = ch;
          metricsDirty = true;
        }

        if (metricsDirty) {
          recomputeMetrics(ctx, cw, ch);
          metricsDirty = false;
        }

        // Black background essential for multiply blend
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, cw, ch);

        if (atlas) {
          const { canvas: atlasCanvas, cellW, cellH } = atlas;
          const t = performance.now() * 0.001;
          const maxCharIdx = fireCharsLen - 1;

          // Draw character by character — the destination position is the
          // same fractional (c*charWidth, py) the original fillText path
          // used as its text-draw origin, offset by -LEFT_PAD/-TOP_PAD so
          // that the padded atlas slot's glyph origin lands exactly there.
          // Each glyph is now a single drawImage blit from the pre-colored
          // atlas instead of a fillStyle switch + fillText call.
          for (let r = 0; r < rows; r++) {
            const py = r * charFontSize;
            const heightNorm = heightNormByRow[r];
            const scroll = r * 0.4 + t * 8;

            for (let c = 0; c < cols; c++) {
              const cPhase = colPhase[c];

              const v1 = Math.sin(scroll + cPhase) * 0.5 + 0.5;
              const v2 = Math.sin(scroll * 2.3 + cPhase * 0.7 + 10) * 0.25 + 0.25;
              const v3 = Math.sin(scroll * 4.1 + cPhase * 0.3 + 20) * 0.125 + 0.125;
              const combined = v1 + v2 + v3;

              const intensity = combined * heightNorm * 0.85;
              const charIdx = Math.min(maxCharIdx, Math.floor(intensity * fireCharsLen));

              if (fireChars[charIdx] === ' ') continue; // skip spaces for performance

              ctx.drawImage(atlasCanvas, charIdx * cellW, 0, cellW, cellH, c * charWidth - LEFT_PAD, py - TOP_PAD, cellW, cellH);
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onDocMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isNear, mouseRadius, mouseStrength, mouseLag, cellSize, opacity]);

  // OffscreenCanvas fire worker — feature-detected setup, teardown, and the
  // transfer-once guard. Kept as its own effect (deps: [isNear] only) so it
  // never re-runs for reasons unrelated to first mount (e.g. settings
  // changes to cellSize/opacity above) — re-running would try to transfer
  // an already-transferred canvas and throw.
  useEffect(() => {
    if (!isNear) return;
    const asciiCanvas = asciiCanvasRef.current;
    if (!asciiCanvas) return;

    // A pending termination from a just-prior cleanup in this same tick
    // (see scheduleTerminate below) — cancel it rather than let the worker
    // die, since we're about to reuse it.
    if (terminateTimeoutRef.current !== null) {
      window.clearTimeout(terminateTimeoutRef.current);
      terminateTimeoutRef.current = null;
    }

    const scheduleTerminate = () => {
      // Deferred by a tick: React 18 strict-mode dev double-invokes
      // mount/cleanup/mount synchronously on first mount. If a subsequent
      // setup cancels this before it fires, the live worker (and its
      // one-time canvas transfer) is reused instead of trying — and
      // failing — to transfer the same canvas a second time.
      terminateTimeoutRef.current = window.setTimeout(() => {
        workerRef.current?.terminate();
        workerRef.current = null;
        terminateTimeoutRef.current = null;
      }, 0);
    };

    if (workerRef.current) {
      // Worker from a not-yet-cancelled prior cleanup is still alive —
      // nothing else to do.
      return scheduleTerminate;
    }

    if (!supportsOffscreenCanvas(asciiCanvas)) return;

    if (offscreenTransferredRef.current) {
      // This canvas was already transferred once, to a worker that has
      // since actually been terminated (a real unmount, not a strict-mode
      // phantom one) — it can never be transferred again. Nothing to
      // recover; leave the last frame in place.
      return;
    }

    let fontUrl: string | null = null;
    try {
      fontUrl = resolveSpaceMonoFontUrl();
    } catch {
      fontUrl = null;
    }

    const offscreen = asciiCanvas.transferControlToOffscreen();
    offscreenTransferredRef.current = true;

    const workerSrc = buildFireWorkerSource({ charFontSize, fireChars, fireColors });
    const blobUrl = URL.createObjectURL(new Blob([workerSrc], { type: 'text/javascript' }));
    const worker = new Worker(blobUrl);
    URL.revokeObjectURL(blobUrl);
    workerRef.current = worker;

    worker.onerror = (err) => {
      // eslint-disable-next-line no-console
      console.error('[FooterCanvas] fire worker error', err);
    };
    worker.onmessage = (ev: MessageEvent) => {
      if (ev.data?.type === 'fontLoaded' || ev.data?.type === 'fontFailed') {
        const flag = (window as unknown as { __sdxFooterFire?: Record<string, unknown> }).__sdxFooterFire;
        if (flag) flag.fontStatus = ev.data.type;
      }
    };

    const { w, h } = sizeRef.current;
    worker.postMessage({ type: 'init', canvas: offscreen, w, h, fontUrl }, [offscreen]);
    worker.postMessage({ type: document.hidden || !footerVisibleRef.current ? 'pause' : 'resume' });

    // Debug hook for verifying font-URL resolution (e.g. from a headless
    // browser check) without spamming the console on every page load.
    if (typeof window !== 'undefined') {
      (window as unknown as { __sdxFooterFire?: unknown }).__sdxFooterFire = {
        supported: true,
        fontUrlResolvedAtInit: !!fontUrl,
      };
    }

    // Font stylesheet may not have been parsed yet at mount time — retry
    // once document.fonts.ready resolves, same trigger the main-thread
    // fallback path uses.
    if (!fontUrl && typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready
        .then(() => {
          const resolved = resolveSpaceMonoFontUrl();
          if (resolved) worker.postMessage({ type: 'font', url: resolved });
        })
        .catch(() => {});
    }

    return scheduleTerminate;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNear]);

  return (
    <div
      ref={rootRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* SVG Goo Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo-footer">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${threshold}`}
            />
          </filter>
        </defs>
      </svg>

      {/* Background grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize + 12}px ${cellSize + 12}px`,
          backgroundPosition: 'center center',
        }}
      />

      {/* Compositing layers */}
      <div className="absolute inset-0" style={{ isolation: 'isolate' }}>
        {/* Goo-filtered blobs on black background */}
        <div className="absolute inset-0 bg-black">
          <div
            ref={gooRef}
            className="absolute inset-0"
            style={{ filter: 'url(#goo-footer)', opacity }}
          />
        </div>

        {/* ASCII fire on top — multiply blend clips it to the white blob areas */}
        <canvas
          ref={asciiCanvasRef}
          className="absolute top-0 left-0"
          style={{ mixBlendMode: 'multiply', width: '100%', height: '100%' }}
        />
      </div>

      {/* Top fade — gentle, lets most of the fire through */}
      <div
        className="absolute inset-x-0 top-0 h-[40%] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
      />

      {/* Side fades */}
      <div
        className="absolute inset-y-0 left-0 w-[10%] pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[10%] pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 100%)' }}
      />
    </div>
  );
};

export default FooterCanvas;
