'use client'

import React, { useState, useCallback, useRef } from 'react';
import { m } from 'motion/react';
import { Copy, Check, Download, Loader2 } from 'lucide-react';
import PageHeader from '@/app/components/PageHeader';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import { Card, CardContent } from '@/components/ui/card';

// ── Shared font fetcher (cached) ──────────────────────────

let fontB64Cache: string | null = null;
async function getFontBase64(): Promise<string> {
  if (fontB64Cache) return fontB64Cache;
  const res = await fetch('/fonts/tiposka/Tiposka-Regular.ttf');
  const buf = await res.arrayBuffer();
  fontB64Cache = btoa(new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), ''));
  return fontB64Cache;
}

function makeSvg(text: string, fontSize = 380, fill = 'white'): string {
  // Placeholder — will be replaced with font-embedded version at copy time
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 400" width="1000" height="400">
  <text x="50" y="320" font-family="Tiposka, sans-serif" font-size="${fontSize}" fill="${fill}">${text}</text>
</svg>`;
}

async function makeSvgWithFont(text: string, fontSize = 380, fill = 'white'): Promise<string> {
  const fontB64 = await getFontBase64();
  // Estimate width based on character count
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

// ── Brand colors ──────────────────────────────────────────

const coreColors = [
  { name: 'White', hex: '#FFFFFF', hsl: '0 0% 100%', dark: true },
  { name: 'Black', hex: '#000000', hsl: '0 0% 0%' },
];

const brandColors = [
  { name: 'Red', hex: '#D92C2D' },
  { name: 'Orange', hex: '#FC5715' },
  { name: 'Yellow', hex: '#FAC205' },
  { name: 'Green', hex: '#03C661' },
  { name: 'Cyan', hex: '#11BBCD' },
  { name: 'Blue', hex: '#035593' },
];

// ── Copy SVG button (fetches font, embeds it, then copies) ──

function CopySvgButton({ text, label = 'Copy SVG' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleCopy = useCallback(async () => {
    setState('loading');
    try {
      const svg = await makeSvgWithFont(text);
      await navigator.clipboard.writeText(svg);
    } catch {
      // fallback without embedded font
      const svg = makeSvg(text);
      try { await navigator.clipboard.writeText(svg); } catch { /* noop */ }
    }
    setState('done');
    setTimeout(() => setState('idle'), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={state === 'loading'}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-sm transition-all duration-200 disabled:pointer-events-none"
    >
      {state === 'loading' ? (
        <><Loader2 className="w-3 h-3 animate-spin" />Copying</>
      ) : state === 'done' ? (
        <><Check className="w-3 h-3" />Copied</>
      ) : (
        <><Copy className="w-3 h-3" />{label}</>
      )}
    </button>
  );
}

// ── Color swatch ──────────────────────────────────────────

function ColorSwatch({ name, hex, hsl, dark }: { name: string; hex: string; hsl?: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      /* noop */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [hex]);

  return (
    <button onClick={handleCopy} className="group text-left">
      <div
        className="w-full aspect-[3/2] rounded-sm border border-white/10 mb-2 relative overflow-hidden transition-all duration-200 group-hover:border-white/20"
        style={{ backgroundColor: hex }}
      >
        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${dark ? 'bg-black/20' : 'bg-white/20'}`}>
          {copied ? (
            <Check className={`w-4 h-4 ${dark ? 'text-black' : 'text-white'}`} />
          ) : (
            <Copy className={`w-4 h-4 ${dark ? 'text-black' : 'text-white'}`} />
          )}
        </div>
      </div>
      <p className="text-xs font-bold text-white">{name}</p>
      <p className="text-xs text-white/55 font-mono">{hex}</p>
      {hsl && <p className="text-xs text-white/30 font-mono">{hsl}</p>}
    </button>
  );
}

// ── Logo preview card ──────────────────────────────────────

function LogoPreview({ title, description, displayText, className = '' }: { title: string; description: string; displayText: string; className?: string }) {
  return (
    <MotionCard>
      <Card className="group">
        <CardContent className="p-0">
          <div className={`flex items-center justify-center py-12 px-8 border-b border-white/[0.06] ${className}`}>
            <span className="font-display text-7xl text-white tracking-tight">{displayText}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-xs text-white/55">{description}</p>
            </div>
            <CopySvgButton text={displayText} />
          </div>
        </CardContent>
      </Card>
    </MotionCard>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function BrandPage() {
  return (
    <main className="relative">
      <PageHeader
        title="Brand"
        subtitle="Assets, colors, and guidelines for the SDx brand. Right-click the logo in the nav to quick-copy."
      />

      <div className="relative z-[1] px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
        {/* ── Logos ── */}
        <MotionSection className="mb-20">
          <h2 className="font-display text-2xl md:text-3xl text-white tracking-tight mb-3">Logo</h2>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/60 mb-8">
            The SDx wordmark is set in Tiposka. Use the full wordmark as the primary logo. Individual letterforms may be used as marks.
          </p>
          <MotionGrid className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LogoPreview
              title="Full Wordmark"
              description="Primary logo"
              displayText="SDx"
            />
            <LogoPreview
              title="x Lettermark"
              description="Individual mark"
              displayText="x"
            />
          </MotionGrid>
        </MotionSection>

        {/* ── Logo on dark / light ── */}
        <MotionSection className="mb-20" delay={0.1}>
          <h2 className="font-display text-2xl md:text-3xl text-white tracking-tight mb-3">Usage</h2>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/60 mb-8">
            The SDx logo is white on dark. On light backgrounds, invert to black. Maintain clear space equal to the height of the &ldquo;x&rdquo; on all sides.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MotionCard>
              <Card>
                <CardContent className="p-0">
                  <div className="flex items-center justify-center py-12 px-8 bg-black border-b border-white/[0.06] rounded-t-lg">
                    <span className="font-display text-5xl text-white tracking-tight">SDx</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-white/55">White on black &mdash; primary usage</p>
                  </div>
                </CardContent>
              </Card>
            </MotionCard>
            <MotionCard>
              <Card>
                <CardContent className="p-0">
                  <div className="flex items-center justify-center py-12 px-8 bg-white border-b border-white/[0.06] rounded-t-lg">
                    <span className="font-display text-5xl text-black tracking-tight">SDx</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-white/55">Black on white &mdash; inverted</p>
                  </div>
                </CardContent>
              </Card>
            </MotionCard>
          </div>
        </MotionSection>

        {/* ── Colors ── */}
        <MotionSection className="mb-20" delay={0.1}>
          <h2 className="font-display text-2xl md:text-3xl text-white tracking-tight mb-3">Colors</h2>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/60 mb-8">
            Click any swatch to copy the hex value. These colors are never used in a gradient except when producing iridescent or prismatic effects, similar to the footer CTAs.
          </p>

          {/* Core */}
          <h3 className="text-sm font-bold text-white/80 mb-4">Core</h3>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {coreColors.map(c => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>

          {/* Brand palette */}
          <h3 className="text-sm font-bold text-white/80 mb-4">Brand palette</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {brandColors.map(c => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>

          <p className="max-w-2xl text-xs leading-relaxed text-white/45 mt-2">
            These colors are only ever combined as a gradient for iridescent and prismatic effects, like the footer CTAs. Never use them in flat gradients or as standalone accent fills.
          </p>
        </MotionSection>

        {/* ── Typography ── */}
        <MotionSection className="mb-20" delay={0.1}>
          <h2 className="font-display text-2xl md:text-3xl text-white tracking-tight mb-3">Typography</h2>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/60 mb-8">
            Two typefaces. Display for hierarchy, mono for everything else.
          </p>
          <MotionGrid className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MotionCard>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <span className="font-display text-6xl text-white tracking-tight">Aa</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Tiposka</h3>
                  <p className="text-xs text-white/55 mb-3">Display &mdash; headings, logo, brand text</p>
                  <p className="font-display text-lg text-white/60 tracking-tight">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    0123456789
                  </p>
                </CardContent>
              </Card>
            </MotionCard>
            <MotionCard>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <span className="font-mono text-6xl text-white tracking-tight">Aa</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Space Mono</h3>
                  <p className="text-xs text-white/55 mb-3">Body &mdash; text, buttons, UI</p>
                  <p className="font-mono text-lg text-white/60">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    0123456789
                  </p>
                </CardContent>
              </Card>
            </MotionCard>
          </MotionGrid>
        </MotionSection>

        {/* ── Visual Effects ── */}
        <MotionSection className="mb-20" delay={0.1}>
          <h2 className="font-display text-2xl md:text-3xl text-white tracking-tight mb-3">Effects</h2>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/60 mb-8">
            The SDx visual language uses prismatic glows and outlined letterforms. &ldquo;SDx&rdquo; must always be rendered in Tiposka.
          </p>
          <MotionGrid className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MotionCard>
              <Card>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <span className="font-display text-5xl text-white prismatic-glow">SDx</span>
                  <div>
                    <p className="text-xs font-bold text-white text-center">Prismatic Glow</p>
                    <p className="text-xs text-white/55 text-center">Layered white drop-shadows</p>
                  </div>
                </CardContent>
              </Card>
            </MotionCard>
            <MotionCard>
              <Card>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  <span className="font-display text-5xl text-outline">SDx</span>
                  <div>
                    <p className="text-xs font-bold text-white text-center">Outlined</p>
                    <p className="text-xs text-white/55 text-center">Stroke-only letterforms</p>
                  </div>
                </CardContent>
              </Card>
            </MotionCard>
          </MotionGrid>
        </MotionSection>

        {/* ── Guidelines ── */}
        <MotionSection className="mb-20" delay={0.1}>
          <h2 className="font-display text-2xl md:text-3xl text-white tracking-tight mb-3">Guidelines</h2>
          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-white/60 mb-8">
            A few rules to keep the brand consistent.
          </p>
          <MotionGrid className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Do',
                items: [
                  'Always render "SDx" in Tiposka',
                  'Use the full wordmark as the primary logo',
                  'Maintain clear space around the logo',
                  'Use white-on-black as the default treatment',
                  'Set body text in Space Mono',
                  'Only use brand colors in gradients for iridescent or prismatic effects',
                ],
              },
              {
                title: 'Don\'t',
                items: [
                  'Render "SDx" in any font other than Tiposka',
                  'Stretch, rotate, or distort the wordmark',
                  'Use brand colors in flat gradients or as standalone accent fills',
                  'Place the logo on busy or low-contrast backgrounds',
                  'Add effects (shadows, outlines) to the logo beyond prismatic glow',
                  'Use scale transforms on hover interactions',
                ],
              },
            ].map((col) => (
              <MotionCard key={col.title}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-white mb-4">{col.title}</h3>
                    <ul className="space-y-2">
                      {col.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/65">
                          <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${col.title === 'Do' ? 'bg-sdx-teal' : 'bg-red-500'}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </MotionCard>
            ))}
          </MotionGrid>
        </MotionSection>

        {/* ── Download ── */}
        <MotionSection className="mb-12" delay={0.1}>
          <MotionCard>
            <Card className="border-white/10 hover:border-white/20 transition-colors duration-200">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Download Logo SVG</h3>
                  <p className="text-xs text-white/55">Full wordmark in SVG format</p>
                </div>
                <a
                  href="/sdx-logo-white.svg"
                  download="sdx-logo-white.svg"
                  className="flex items-center gap-1.5 btn-secondary px-4 py-2 text-xs uppercase tracking-widest rounded-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </CardContent>
            </Card>
          </MotionCard>
        </MotionSection>

        </div>
      </div>
    </main>
  );
}
