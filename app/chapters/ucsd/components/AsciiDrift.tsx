'use client'

import React, { useEffect, useRef } from 'react';

// Light to dense: the blob edge gets the light glyphs, the core gets the dense ones.
const GLYPHS = '.:-=+*#';
const FONT_SIZE = 14;
const FPS = 24;
/** Field value at the blob edge. Below it a cell stays empty. */
const THRESHOLD = 1;
/** Field value where the densest glyph starts. */
const CORE = 2.6;

type Ball = { x: number; y: number; r: number; ax: number; ay: number; fx: number; fy: number; phase: number };

/** Seeded so the layout is stable across renders and reloads. */
function makeBalls(w: number, h: number): Ball[] {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  // About one blob per 160k px², so a tall section gets more of them.
  const count = Math.max(6, Math.round((w * h) / 160_000));
  return Array.from({ length: count }, () => ({
    x: rand() * w,
    y: rand() * h,
    r: 70 + rand() * 90,
    ax: 60 + rand() * 120,
    ay: 40 + rand() * 90,
    fx: 0.04 + rand() * 0.06,
    fy: 0.03 + rand() * 0.05,
    phase: rand() * Math.PI * 2,
  }));
}

/**
 * Faint ASCII metaballs. Each blob drifts on a slow loop; where blobs meet,
 * their fields add up and they merge like liquid.
 */
export default function AsciiDrift({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let size = { w: 0, h: 0 };
    let balls: Ball[] = [];
    let visible = true;
    let raf = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      size = { w: rect.width, h: rect.height };
      balls = makeBalls(rect.width, rect.height);
      canvas.width = Math.ceil(rect.width * dpr);
      canvas.height = Math.ceil(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const { w, h } = size;
      if (w === 0 || h === 0) return;
      const t = now / 1000;
      const pos = balls.map((b) => ({
        x: b.x + Math.sin(t * b.fx * Math.PI * 2 + b.phase) * b.ax,
        y: b.y + Math.cos(t * b.fy * Math.PI * 2 + b.phase) * b.ay,
        r2: b.r * b.r,
      }));

      ctx.clearRect(0, 0, w, h);
      ctx.font = `${FONT_SIZE}px "Space Mono", monospace`;
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'top';
      const charW = ctx.measureText('@').width || FONT_SIZE * 0.6;
      const cols = Math.ceil(w / charW);
      const rows = Math.ceil(h / FONT_SIZE);

      for (let r = 0; r < rows; r++) {
        const py = r * FONT_SIZE + FONT_SIZE / 2;
        let line = '';
        for (let c = 0; c < cols; c++) {
          const px = c * charW + charW / 2;
          let field = 0;
          for (const p of pos) {
            const dx = px - p.x;
            const dy = py - p.y;
            field += p.r2 / (dx * dx + dy * dy + 1);
          }
          if (field < THRESHOLD) {
            line += ' ';
          } else {
            const k = Math.min(1, (field - THRESHOLD) / (CORE - THRESHOLD));
            line += GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(k * GLYPHS.length))];
          }
        }
        ctx.fillText(line, 0, r * FONT_SIZE);
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || !visible || now - last < 1000 / FPS) return;
      last = now;
      draw(now);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(container);

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    });
    io.observe(container);

    // Reduced motion: one still frame.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(0);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        opacity: 0.12,
        maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
