'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import { m, AnimatePresence } from 'motion/react';
import { Palette, Copy, Image, Loader2 } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface LogoContextMenuProps {
  children: React.ReactNode;
}

// Cached font base64
let fontB64Cache: string | null = null;
async function getFontBase64(): Promise<string> {
  if (fontB64Cache) return fontB64Cache;
  const res = await fetch('/fonts/tiposka/Tiposka-Regular.ttf');
  const buf = await res.arrayBuffer();
  fontB64Cache = btoa(new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), ''));
  return fontB64Cache;
}

function buildSvgWithFont(text: string, fontB64: string, fill = 'white'): string {
  const fontSize = 380;
  const width = Math.ceil(fontSize * text.length * 0.65 + 100);
  const height = Math.ceil(fontSize * 1.2 + 80);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @font-face {
        font-family: 'Tiposka';
        src: url('data:font/truetype;base64,${fontB64}') format('truetype');
      }
    </style>
  </defs>
  <text x="50" y="${Math.ceil(fontSize * 0.9 + 40)}" font-family="Tiposka" font-size="${fontSize}" fill="${fill}">${text}</text>
</svg>`;
}

export default function LogoContextMenu({ children }: LogoContextMenuProps) {
  // A chapter subdomain rewrites relative paths into the chapter, where /brand does not
  // exist. There the Brand link names the main domain.
  const segments = useSelectedLayoutSegments();
  const onChapterSite = segments[0] === 'chapters' && (segments[1] === 'ucsd' || segments[1] === 'sdsu');
  const brandHref = onChapterSite ? 'https://www.sdx.community/brand' : '/brand';
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [copied, setCopied] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setCopied(null);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 280);
    const y = Math.min(e.clientY, window.innerHeight - 200);
    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => close();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('scroll', handleClose, { passive: true });
    window.addEventListener('resize', handleClose);
    document.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('scroll', handleClose);
      window.removeEventListener('resize', handleClose);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, close]);

  // ── Copy as PNG: build font-embedded SVG, render to canvas, export ──
  const copyAsPng = async () => {
    setCopied('copying-png');
    try {
      const fontB64 = await getFontBase64();
      const svg = buildSvgWithFont('SDx', fontB64);

      const encoded = btoa(unescape(encodeURIComponent(svg)));
      const dataUri = `data:image/svg+xml;base64,${encoded}`;

      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth * 2;
          canvas.height = img.naturalHeight * 2;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(async (blob) => {
            if (!blob) { resolve(); return; }
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ]);
              setCopied('png');
              setTimeout(() => { setCopied(null); close(); }, 1200);
            } catch {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sdx-logo.png';
              a.click();
              URL.revokeObjectURL(url);
              setCopied('png');
              setTimeout(() => { setCopied(null); close(); }, 1200);
            }
            resolve();
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = dataUri;
      });
    } catch {
      setCopied(null);
    }
  };

  // ── Copy as SVG: embed Tiposka font so it's self-contained ──
  const copyAsSvg = async () => {
    setCopied('copying-svg');
    try {
      const fontB64 = await getFontBase64();
      const svg = buildSvgWithFont('SDx', fontB64);
      await navigator.clipboard.writeText(svg);
      setCopied('svg');
      setTimeout(() => { setCopied(null); close(); }, 1200);
    } catch {
      setCopied('svg');
      setTimeout(() => { setCopied(null); close(); }, 1200);
    }
  };

  const menu = (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9999998]"
            onClick={close}
            onContextMenu={(e) => { e.preventDefault(); close(); }}
          />

          <m.div
            ref={menuRef}
            className="fixed z-[9999999] w-[240px] bg-black border border-white/20 rounded-lg overflow-hidden shadow-2xl"
            style={{ left: position.x, top: position.y }}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.2 }}
          >
            <Link
              href={brandHref}
              onClick={close}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] transition-colors duration-150"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Brand</p>
                <p className="text-xs text-white/40">Assets, colors, and guides.</p>
              </div>
            </Link>

            <div className="h-px bg-white/[0.08]" />

            <div className="flex px-2 py-2 gap-1">
              <button
                onClick={copyAsPng}
                disabled={!!copied}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.06] rounded transition-colors duration-150 disabled:pointer-events-none"
              >
                {copied === 'copying-png' ? (
                  <><Loader2 className="w-3 h-3 animate-spin" />Copying</>
                ) : copied === 'png' ? (
                  <>Copied!</>
                ) : (
                  <><Image className="w-3 h-3" />PNG</>
                )}
              </button>
              <div className="w-px bg-white/[0.08]" />
              <button
                onClick={copyAsSvg}
                disabled={!!copied}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.06] rounded transition-colors duration-150 disabled:pointer-events-none"
              >
                {copied === 'copying-svg' ? (
                  <><Loader2 className="w-3 h-3 animate-spin" />Copying</>
                ) : copied === 'svg' ? (
                  <>Copied!</>
                ) : (
                  <><Copy className="w-3 h-3" />SVG</>
                )}
              </button>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div onContextMenu={handleContextMenu} className="inline-flex">
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(menu, document.body)}
    </>
  );
}
