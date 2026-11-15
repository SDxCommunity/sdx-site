/**
 * Pre-drawn glyphs for the ASCII canvases.
 *
 * Safari keeps memory for every distinct string passed to fillText. The ASCII effects
 * draw fresh strings every frame, so on an iPhone the tab's memory grew by about 30 MB
 * a second until iOS killed the page. These effects stamp glyphs from a small atlas
 * with drawImage instead, which holds memory flat.
 */

export type GlyphAtlas = {
  canvas: HTMLCanvasElement;
  /** Advance width of one glyph, in CSS pixels. */
  charWidth: number;
  /** Slot size in CSS pixels. Each slot pads its glyph so ink that overhangs is not clipped. */
  cellW: number;
  cellH: number;
  pad: number;
  scale: number;
  /** Slot index for each glyph, keyed by character. Spaces have no slot. */
  slots: Map<string, number>;
};

/** Draws each glyph once, in one color, at the canvas's pixel scale. */
export function buildGlyphAtlas(glyphs: string, fontSize: number, color: string, scale = 1): GlyphAtlas | null {
  const font = `${fontSize}px "Space Mono", monospace`;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.font = font;
  const charWidth = ctx.measureText('@').width || fontSize * 0.6;
  const pad = fontSize;
  const cellW = pad + Math.ceil(charWidth) + fontSize;
  const cellH = pad + fontSize * 2;

  const unique = Array.from(new Set(Array.from(glyphs))).filter((ch) => ch !== ' ');
  canvas.width = Math.max(1, Math.ceil(cellW * unique.length * scale));
  canvas.height = Math.ceil(cellH * scale);
  // Resizing the canvas resets its state.
  ctx.scale(scale, scale);
  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;

  const slots = new Map<string, number>();
  unique.forEach((ch, i) => {
    slots.set(ch, i);
    ctx.fillText(ch, i * cellW + pad, pad);
  });
  return { canvas, charWidth, cellW, cellH, pad, scale, slots };
}

/** Stamps one glyph with its top-left at (x, y), as fillText with textBaseline 'top' would. */
export function drawGlyph(ctx: CanvasRenderingContext2D, atlas: GlyphAtlas, ch: string, x: number, y: number) {
  const slot = atlas.slots.get(ch);
  if (slot === undefined) return;
  const { canvas, cellW, cellH, pad, scale } = atlas;
  ctx.drawImage(canvas, slot * cellW * scale, 0, cellW * scale, cellH * scale, x - pad, y - pad, cellW, cellH);
}

/** One glyph's ink as pixel offsets from its top-left, with coverage from 0 to 255. */
type GlyphMask = { dx: Int16Array; dy: Int16Array; a: Uint8Array };

export type GlyphMasks = {
  /** Advance width of one glyph, in pixels. */
  charWidth: number;
  /** Subpixel positions each glyph is drawn at, so fractional advances stay even. */
  phases: number;
  /** Mask for glyph i at phase p sits at i * phases + p. */
  masks: GlyphMask[];
};

/**
 * White glyph masks for a canvas drawn at one pixel per CSS pixel. A large field paints them
 * into one pixel buffer, which costs far less than one drawImage per glyph.
 */
export function buildGlyphMasks(glyphs: string, fontSize: number, phases = 4): GlyphMasks | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = `${fontSize}px "Space Mono", monospace`;
  const charWidth = ctx.measureText('@').width || fontSize * 0.6;
  const pad = fontSize;
  const cellW = pad + Math.ceil(charWidth) + fontSize;
  const cellH = pad + fontSize * 2;
  canvas.width = cellW;
  canvas.height = cellH;

  const masks: GlyphMask[] = [];
  for (const ch of Array.from(glyphs)) {
    for (let p = 0; p < phases; p++) {
      ctx.clearRect(0, 0, cellW, cellH);
      ctx.font = `${fontSize}px "Space Mono", monospace`;
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'white';
      ctx.fillText(ch, pad + p / phases, pad);
      const data = ctx.getImageData(0, 0, cellW, cellH).data;
      const dx: number[] = [];
      const dy: number[] = [];
      const a: number[] = [];
      for (let y = 0; y < cellH; y++) {
        for (let x = 0; x < cellW; x++) {
          const alpha = data[(y * cellW + x) * 4 + 3];
          if (alpha === 0) continue;
          dx.push(x - pad);
          dy.push(y - pad);
          a.push(alpha);
        }
      }
      masks.push({ dx: Int16Array.from(dx), dy: Int16Array.from(dy), a: Uint8Array.from(a) });
    }
  }
  return { charWidth, phases, masks };
}

/** Paints glyph `index` with its top-left at (x, y) into an opaque black RGBA buffer. Brighter ink wins. */
export function paintGlyphMask(
  pixels: Uint32Array, width: number, height: number, set: GlyphMasks, index: number, x: number, y: number,
) {
  const ix = Math.floor(x);
  let phase = Math.round((x - ix) * set.phases);
  let left = ix;
  if (phase === set.phases) {
    phase = 0;
    left += 1;
  }
  const { dx, dy, a } = set.masks[index * set.phases + phase];
  for (let k = 0; k < a.length; k++) {
    const px = left + dx[k];
    const py = y + dy[k];
    if (px < 0 || py < 0 || px >= width || py >= height) continue;
    const i = py * width + px;
    const v = a[k];
    // Grey on black: every channel carries the coverage, and alpha stays opaque.
    if ((pixels[i] & 0xff) < v) pixels[i] = 0xff000000 | (v << 16) | (v << 8) | v;
  }
}
