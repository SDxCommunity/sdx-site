'use client'

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// ColorBends pulls in three.js (a WebGL renderer with its own rAF loop).
// Load it lazily so the three.js chunk never lands in a page's initial
// bundle, and only mount it once this canvas is about to scroll into view.
const ColorBends = dynamic(() => import('@/components/ColorBends'), { ssr: false });

interface PrismaticCanvasProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'vivid';
  palette?: 'full' | 'cool' | 'warm';
  /** Exact colors for the field. Overrides `palette` when set. */
  colors?: readonly string[];
  glitchFrequency?: 'none' | 'rare' | 'occasional';
}

const INTENSITY_CONFIG = {
  subtle:  { opacity: 0.45 },
  medium:  { opacity: 0.65 },
  vivid:   { opacity: 0.85 },
};

const PALETTE_COLORS = {
  full: ['#d92c2d', '#fc5715', '#fac205', '#03C661', '#11BBCD', '#035593'],
  cool: ['#03C661', '#11BBCD', '#035593'],
  warm: ['#d92c2d', '#fc5715', '#fac205'],
};

const PrismaticCanvas: React.FC<PrismaticCanvasProps> = ({
  className = '',
  intensity = 'subtle',
  palette = 'full',
  colors: customColors,
}) => {
  const config = INTENSITY_CONFIG[intensity];
  const colors = customColors ?? PALETTE_COLORS[palette];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

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
      { rootMargin: '600px 0px' }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ opacity: config.opacity }}
    >
      {isNear && (
        <ColorBends
          className=""
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          rotation={45}
          speed={0.4}
          colors={colors as any}
          transparent={false}
          autoRotate={1}
          scale={1.6}
          frequency={1.3}
          warpStrength={0}
          mouseInfluence={1}
          parallax={0}
          noise={0}
        />
      )}
    </div>
  );
};

export default PrismaticCanvas;
