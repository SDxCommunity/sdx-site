'use client'

import React, { useEffect, useRef, useState } from 'react';

type AsciiButtonProps = {
  children: React.ReactNode;
  className?: string;
  /** "dark" draws white glyphs on black, for secondary buttons beside a light one. */
  tone?: 'light' | 'dark';
  /** Replaces the default label padding, for example to make a square icon button. */
  contentClassName?: string;
};

const TONES = {
  light: {
    fill: 'white',
    glyph: 'rgba(0, 0, 0, 0.18)',
    glyphHover: 'rgba(0, 0, 0, 0.18)',
    container: 'bg-white',
    text: 'text-black',
    shadow: '0 0 15px rgba(255,255,255,0.5), 0 0 35px rgba(255,255,255,0.25), 0 0 70px rgba(255,255,255,0.12)',
    shadowHover: '0 0 15px rgba(255,255,255,0.5), 0 0 35px rgba(255,255,255,0.25), 0 0 70px rgba(255,255,255,0.12)',
  },
  dark: {
    fill: 'black',
    glyph: 'rgba(255, 255, 255, 0.16)',
    // On hover the glyphs vanish to plain black while the outline and glow brighten.
    glyphHover: 'rgba(255, 255, 255, 0)',
    container: 'bg-black outline outline-1 -outline-offset-1 outline-white/20 hover:outline-white/50 transition-[outline-color,box-shadow] duration-200',
    text: 'text-white',
    shadow: '0 0 12px rgba(255,255,255,0.14), 0 0 30px rgba(255,255,255,0.06)',
    shadowHover: '0 0 15px rgba(255,255,255,0.35), 0 0 35px rgba(255,255,255,0.15), 0 0 70px rgba(255,255,255,0.08)',
  },
};

const AsciiButton: React.FC<AsciiButtonProps> = ({
  children,
  className = '',
  tone = 'light',
  contentClassName = 'px-8 py-3',
}) => {
  const colors = TONES[tone];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  // Cached container size — refreshed by ResizeObserver instead of a
  // getBoundingClientRect() layout read inside the 60fps tick loop.
  const sizeRef = useRef({ w: 0, h: 0 });
  // Two-way visibility: this button can be scrolled far out of view (e.g.
  // the hero CTA while dwelling at the footer) while its rAF loop keeps
  // running — pause the actual draw work when that happens.
  const visibleRef = useRef(true);
  const [hovered, setHovered] = useState(false);
  // Read by the draw loop, so a hover change does not restart the effect.
  const hoveredRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chars = '.`-\'_,^:;=><+!*/?)s(d{x}[S]D|X#%&@';
    const fontSize = 14;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.ceil(rect.width * dpr);
      canvas.height = Math.ceil(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    let ro: ResizeObserver | null = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => resize());
      ro.observe(container);
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(
        entries => {
          visibleRef.current = entries.some(entry => entry.isIntersecting);
        },
        { threshold: 0 }
      );
      intersectionObserver.observe(container);
    }

    const tick = () => {
      // Tab is backgrounded, or the button has scrolled out of view —
      // nothing is visible, so skip the work but keep the rAF chain alive
      // (cheap) so it resumes automatically the moment either clears.
      if (document.hidden || !visibleRef.current) { rafRef.current = requestAnimationFrame(tick); return; }

      const w = sizeRef.current.w;
      const h = sizeRef.current.h;
      if (w === 0 || h === 0) { rafRef.current = requestAnimationFrame(tick); return; }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.scale(dpr, dpr);

      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px "Space Mono", monospace`;
      ctx.fillStyle = hoveredRef.current ? colors.glyphHover : colors.glyph;
      ctx.textBaseline = 'top';

      const charW = ctx.measureText('@').width || fontSize * 0.6;
      const cols = Math.ceil(w / charW) + 1;
      const rows = Math.ceil(h / fontSize) + 1;
      const t = performance.now() * 0.001;

      for (let r = 0; r < rows; r++) {
        let line = '';
        for (let c = 0; c < cols; c++) {
          const colPhase = Math.sin(c * 1.7) * 2;
          const val = Math.sin(r * 0.5 - t * 6 + colPhase) * 0.5 + 0.5;
          const idx = Math.floor(val * (chars.length - 1));
          line += chars[idx];
        }
        ctx.fillText(line, 0, r * fontSize);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      if (ro) ro.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
    };
  }, [colors]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-sm ${colors.container} ${className}`}
      style={{ boxShadow: hovered ? colors.shadowHover : colors.shadow }}
      onMouseEnter={() => {
        hoveredRef.current = true;
        setHovered(true);
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        setHovered(false);
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 rounded-sm"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-hidden="true"
      />
      <span className={`relative z-10 block text-xs uppercase tracking-widest font-bold ${colors.text} ${contentClassName}`}>
        {children}
      </span>
    </div>
  );
};

export default AsciiButton;
