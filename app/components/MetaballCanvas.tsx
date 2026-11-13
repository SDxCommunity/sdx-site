'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useCanvasSettings } from './CanvasSettingsContext';

type MetaballCanvasProps = {
  className?: string;
  /** "none" drops the built-in bottom fade, for a hero that draws its own. */
  bottomFade?: 'tall' | 'none';
  /**
   * Clears the blobs around this element instead of a fixed center ellipse, so they
   * wrap the hero copy on every side with a soft, uneven edge.
   */
  clearAround?: React.RefObject<HTMLElement>;
  /**
   * "diamond" turns every cell 45°, so the blobs grow faceted edges. "x" cuts each cell into
   * an x and thins the field. The main site uses x; the chapters keep squares and diamonds.
   */
  cellShape?: 'square' | 'diamond' | 'x';
  /** The ASCII texture inside the blobs: a circular "swirl" or concentric "diamond" rings. */
  asciiPattern?: 'swirl' | 'diamond';
  /**
   * A CSS color or gradient multiplied over the white blobs, which tints them.
   * "prismatic" washes them in soft, slowly shifting colors instead.
   */
  tint?: string;
};

/** An x inside the cell box. The arms are thick enough to survive the goo blur. */
const X_CLIP =
  'polygon(0 30%, 30% 0, 50% 20%, 70% 0, 100% 30%, 80% 50%, 100% 70%, 70% 100%, 50% 80%, 30% 100%, 0 70%, 20% 50%)';

const MetaballCanvas: React.FC<MetaballCanvasProps> = ({
  className = '',
  bottomFade = 'tall',
  clearAround,
  cellShape = 'square',
  asciiPattern = 'swirl',
  tint,
}) => {
  const { settings } = useCanvasSettings();
  const rootRef = useRef<HTMLDivElement>(null);
  const gooRef = useRef<HTMLDivElement>(null);
  const centerFadeRef = useRef<HTMLDivElement>(null);
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
  // Cached container size — refreshed by ResizeObserver instead of a
  // getBoundingClientRect() layout read inside the 60fps tick loop.
  const sizeRef = useRef({ w: 0, h: 0 });
  // Two-way visibility: the hero canvas has no lazy-mount gate (it's above
  // the fold on load), but its rAF loop should stop doing real work once
  // scrolled out of view — e.g. while the user is dwelling at the footer.
  const visibleRef = useRef(true);
  // The field stays hidden until the cells exist and the first ASCII frame is drawn,
  // so a refresh never flashes bare white blobs.
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  const opacity = settings.heroOpacity;
  // X cells are larger than squares and sit on the outskirts. Their arms would thin out under the full blur.
  const isX = cellShape === 'x';
  const blur = isX ? Math.min(settings.heroBlur, 6.5) : settings.heroBlur;
  const contrast = settings.heroContrast;
  const threshold = settings.heroThreshold;
  const borderRadius = 0;
  const cellSize = isX ? 72 : settings.heroCellSize;
  const mouseRadius = 280;
  const mouseStrength = 120;
  const mouseLag = 0.85;
  const clearRadius = 0.45;

  const buildGrid = () => {
    const el = gooRef.current;
    if (!el) return;

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

    const rect = el.getBoundingClientRect();
    const w = rect.width || 1200;
    const h = rect.height || 800;
    const gap = cellSize + 12;
    const cols = Math.ceil(w / gap) + 2;
    const rows = Math.ceil(h / gap) + 2;
    const offsetX = (w - (cols - 1) * gap) / 2;
    const offsetY = (h - (rows - 1) * gap) / 2;

    let centerX = w / 2;
    let centerY = h / 2;
    let clearW = w * clearRadius;
    let clearH = h * 0.4;

    const target = clearAround?.current;
    if (target) {
      const t = target.getBoundingClientRect();
      centerX = t.left - rect.left + t.width / 2;
      centerY = t.top - rect.top + t.height / 2;
      // A touch more room than the copy itself, so the blobs sit on the outskirts.
      // X cells keep clear of the middle and gather at the edges.
      clearW = (t.width / 2 + gap) * 1.12;
      clearH = (t.height / 2 + (isX ? gap * 0.5 : gap)) * 1.12;
      if (centerFadeRef.current) {
        centerFadeRef.current.style.background = `radial-gradient(ellipse ${Math.round(clearW * 1.3)}px ${Math.round(clearH * 1.3)}px at ${Math.round(centerX)}px ${Math.round(centerY)}px, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)`;
      }
    }

    const frag = document.createDocumentFragment();
    let css = '';
    let idx = 0;
    // Rotation comes last in each transform, so the cell turns about its own center.
    const rot = cellShape === 'diamond' ? ' rotate(45deg)' : '';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const s = r * cols + c + 7;
        if (sr(s) > (isX ? 0.97 : settings.heroDensity)) continue;

        const cx = offsetX + c * gap;
        const cy = offsetY + r * gap;

        const ex = (cx - centerX) / clearW;
        const ey = (cy - centerY) / clearH;
        const ellipseDist = ex * ex + ey * ey;

        if (target) {
          // Clear inside the ellipse, then thin out over a band past its edge
          // so the boundary looks eroded rather than drawn with a compass.
          if (ellipseDist < 1) continue;
          const band = isX ? 0.8 : 1.2;
          if (ellipseDist < 1 + band && sr(s + 20) > (ellipseDist - 1) / band) continue;
        } else if (ellipseDist < 1) {
          if (ellipseDist < 0.4) continue;
          if (sr(s + 20) > 0.15) continue;
        }

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
          borderRadius: `${borderRadius}%`,
          clipPath: isX ? X_CLIP : '',
          transform: `translate(-50%, -50%)${rot}`,
          translate: '0px 0px',
          willChange: 'transform, translate',
          animation: `md${idx} ${dur.toFixed(1)}s cubic-bezier(1,0,0.31,1.39) ${delay.toFixed(1)}s infinite`,
        });

        css += `@keyframes md${idx}{
  0%,100%{transform:translate(-50%,-50%)${rot}}
  18%{transform:translate(calc(-50% + ${wp[0].x}px),calc(-50% + ${wp[0].y}px))${rot}}
  25%{transform:translate(calc(-50% + ${Math.round(wp[0].x * 0.2)}px),calc(-50% + ${Math.round(wp[0].y * 0.2)}px))${rot}}
  43%{transform:translate(calc(-50% + ${wp[1].x}px),calc(-50% + ${wp[1].y}px))${rot}}
  50%{transform:translate(calc(-50% + ${Math.round(wp[1].x * 0.2)}px),calc(-50% + ${Math.round(wp[1].y * 0.2)}px))${rot}}
  68%{transform:translate(calc(-50% + ${wp[2].x}px),calc(-50% + ${wp[2].y}px))${rot}}
  75%{transform:translate(calc(-50% + ${Math.round(wp[2].x * 0.2)}px),calc(-50% + ${Math.round(wp[2].y * 0.2)}px))${rot}}
  93%{transform:translate(calc(-50% + ${wp[3].x}px),calc(-50% + ${wp[3].y}px))${rot}}
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

  useEffect(() => {
    const root = rootRef.current;
    built.current = false;
    requestAnimationFrame(() => buildGrid());

    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        built.current = false;
        buildGrid();
      }, 200);
    };

    window.addEventListener('resize', onResize);

    // Keep the cached size in sync with actual layout changes (e.g. the
    // hero container resizing) without a per-frame layout read in tick().
    let ro: ResizeObserver | null = null;
    if (root && 'ResizeObserver' in window) {
      ro = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          sizeRef.current = { w: width, h: height };
        }
      });
      ro.observe(root);
    } else if (root) {
      const rect = root.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
    }

    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      if (ro) ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellSize, settings.heroDensity, cellShape]);

  // Two-way visibility gate: stop doing per-frame work while the hero
  // canvas is scrolled out of view (e.g. user dwelling at the footer).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      entries => {
        visibleRef.current = entries.some(entry => entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  // Mouse interaction + ASCII swirl rendering
  useEffect(() => {
    const container = rootRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    if (!container || !asciiCanvas) return;

    const onDocMove = (e: MouseEvent) => {
      // Skip the layout read entirely while scrolled out of view — the
      // canvas can't be under the cursor anyway.
      if (!visibleRef.current) {
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

    const asciiChars = '@#%&*+=-:·.';
    const charFontSize = 11;

    const tick = () => {
      // Tab is backgrounded, or the hero has scrolled out of view — nothing
      // is visible, so skip the work but keep the rAF chain alive (cheap)
      // so it resumes automatically the moment either condition clears.
      if (document.hidden || !visibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const w = sizeRef.current.w;
      const h = sizeRef.current.h;

      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Mouse interaction
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

      // Draw ASCII swirl — use same rect as container for exact match
      const cw = Math.ceil(w);
      const ch = Math.ceil(h);
      if (asciiCanvas.width !== cw || asciiCanvas.height !== ch) {
        asciiCanvas.width = cw;
        asciiCanvas.height = ch;
      }

      const ctx = asciiCanvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }

      // Black background is essential — multiply blend: black × anything = black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, cw, ch);
      ctx.font = `${charFontSize}px "Space Mono", monospace`;
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'top';

      // Measure actual character width once instead of guessing
      const charWidth = ctx.measureText('@').width || charFontSize * 0.6;
      const cols = Math.ceil(cw / charWidth) + 5; // extra buffer
      const rows = Math.ceil(ch / charFontSize) + 2;
      const t = performance.now() * 0.0003;

      for (let r = 0; r < rows; r++) {
        let line = '';
        for (let c = 0; c < cols; c++) {
          const px = c * charWidth;
          const py = r * charFontSize;
          const dx = px - cw / 2;
          const dy = py - ch / 2;
          let wave: number;
          if (asciiPattern === 'diamond') {
            // Diamond rings (equal |dx| + |dy|) that ripple out from the center.
            wave = Math.sin((Math.abs(dx) + Math.abs(dy)) * 0.02 - t * 4) * 0.5 + 0.5;
          } else {
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            wave = Math.sin(dist * 0.015 - t * 3 + angle * 2) * 0.5 + 0.5;
          }
          const idx = Math.floor(wave * (asciiChars.length - 1));
          line += asciiChars[idx];
        }
        ctx.fillText(line, 0, r * charFontSize);
      }

      if (!readyRef.current && cellsRef.current.length > 0) {
        readyRef.current = true;
        setReady(true);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onDocMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [mouseRadius, mouseStrength, mouseLag, cellSize, opacity, asciiPattern]);


  return (
    <div
      ref={rootRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease-out' }}
      aria-hidden="true"
    >
      {/* SVG Goo Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
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

      {/*
        Compositing: goo blobs (white on black bg) + ASCII on top with multiply blend.
        Multiply: white × white = white (ASCII visible where blobs are),
                  black × white = black (ASCII hidden where no blobs).
      */}
      <div className="absolute inset-0" style={{ isolation: 'isolate' }}>
        {/* Goo-filtered blobs on black background */}
        <div className="absolute inset-0 bg-black">
          <div
            ref={gooRef}
            className="absolute inset-0"
            style={{ filter: 'url(#goo)', opacity }}
          />
        </div>

        {/* ASCII swirl on top — multiply blend clips it to the white blob areas */}
        <canvas
          ref={asciiCanvasRef}
          className="absolute top-0 left-0"
          style={{ mixBlendMode: 'multiply', width: '100%', height: '100%' }}
        />

        {/* Multiply again: the white ASCII takes the tint's color, and black stays black */}
        {tint === 'prismatic' ? (
          <div className="prism-wash absolute inset-0" style={{ mixBlendMode: 'multiply' }} />
        ) : tint ? (
          <div className="absolute inset-0" style={{ background: tint, mixBlendMode: 'multiply' }} />
        ) : null}
      </div>

      {/* Radial fade around center */}
      <div
        ref={centerFadeRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 35% at 50% 48%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
        }}
      />

      {/* Bottom fade */}
      {bottomFade === 'tall' && (
        <div
          className="absolute inset-x-0 bottom-0 h-[50%] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, black 75%)' }}
        />
      )}

      {/* Top fade */}
      <div
        className="absolute inset-x-0 top-0 h-[10%] pointer-events-none"
        style={{ background: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 100%)' }}
      />

    </div>
  );
};

export default MetaballCanvas;
