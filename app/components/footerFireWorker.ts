// Shared pieces for FooterCanvas's OffscreenCanvas fire-rendering worker.
//
// A Worker can't import the app's TS/JSX modules or share closures with the
// main thread, so its source has to be a self-contained string (wrapped in
// a Blob URL). Generating that string here — from the exact same
// charFontSize/fireChars/fireColors values FooterCanvas's main-thread
// fallback path uses — keeps the worker's copy of those constants from
// drifting out of sync with a hand-maintained duplicate.

export interface FireWorkerParams {
  charFontSize: number;
  fireChars: string;
  fireColors: string[];
}

export function supportsOffscreenCanvas(canvas: HTMLCanvasElement): boolean {
  return (
    typeof OffscreenCanvas !== 'undefined' &&
    typeof canvas.transferControlToOffscreen === 'function'
  );
}

// Resolves the actual, hashed woff2 URL next/font/google generated for
// Space Mono by scanning @font-face rules in document.stylesheets — a
// FontFace object (document.fonts) doesn't expose the URL it was
// constructed from, so the CSSOM is the only place to find it. Cross-origin
// stylesheets throw on .cssRules access; skip those rather than let one
// bad sheet abort the whole scan.
//
// next/font/google does NOT register the family under the literal name
// "Space Mono" — it mangles it to something like "__Space_Mono_e8b655" (a
// per-build hash) to scope it, plus a separate "..._Fallback_..." local()
// entry. Matching has to tolerate that mangling (strip quotes/underscores/
// hyphens, look for "spacemono" as a substring) rather than an exact name.
// next/font also splits each weight into several @font-face rules by
// unicode-range (language subsets); this picks the weight-400/normal-style
// rule whose range covers basic Latin (U+00-FF, i.e. plain ASCII) — the
// only glyphs the fire atlas ever draws — falling back to the first
// weight-400 match, then any match, if that specific one isn't found.
export function resolveSpaceMonoFontUrl(): string | null {
  if (typeof document === 'undefined') return null;

  const isSpaceMono = (rule: CSSFontFaceRule) => {
    const family = rule.style.getPropertyValue('font-family').replace(/["']/g, '');
    const normalized = family.toLowerCase().replace(/[_\-\s]/g, '');
    return normalized.includes('spacemono') && !normalized.includes('fallback');
  };
  const extractUrl = (rule: CSSFontFaceRule): string | null => {
    const src = rule.style.getPropertyValue('src');
    const match = src.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
    if (!match) return null;
    try {
      return new URL(match[1], document.baseURI).href;
    } catch {
      return match[1];
    }
  };

  const candidates: CSSFontFaceRule[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule && isSpaceMono(rule) && extractUrl(rule)) {
        candidates.push(rule);
      }
    }
  }
  if (candidates.length === 0) return null;

  const isWeight400 = (rule: CSSFontFaceRule) => {
    const weight = rule.style.getPropertyValue('font-weight');
    return weight === '' || weight === '400' || weight === 'normal';
  };
  const isNormalStyle = (rule: CSSFontFaceRule) => {
    const style = rule.style.getPropertyValue('font-style');
    return style === '' || style === 'normal';
  };
  const coversBasicLatin = (rule: CSSFontFaceRule) => {
    const range = rule.style.getPropertyValue('unicode-range').toLowerCase();
    return range.includes('u+0-ff') || range.includes('u+0-24f');
  };

  const weight400 = candidates.filter((r) => isWeight400(r) && isNormalStyle(r));
  const best =
    weight400.find(coversBasicLatin) ??
    weight400[0] ??
    candidates.find(coversBasicLatin) ??
    candidates[0];

  return extractUrl(best);
}

// Builds the fire-rendering Worker's source as a plain-JS string. Mirrors
// FooterCanvas's main-thread fallback (recomputeMetrics/buildAtlas/tick)
// glyph-for-glyph: same padded-atlas-slot approach (LEFT_PAD/TOP_PAD to
// keep negative-ink glyphs like ')' from bleeding across atlas slots), same
// scroll/noise formula for character intensity. Any change to one MUST be
// mirrored in the other.
export function buildFireWorkerSource({ charFontSize, fireChars, fireColors }: FireWorkerParams): string {
  return `
'use strict';
var charFontSize = ${charFontSize};
var fireChars = ${JSON.stringify(fireChars)};
var fireColors = ${JSON.stringify(fireColors)};
var fireCharsLen = fireChars.length;
var fireColorsLen = fireColors.length;
var LEFT_PAD = charFontSize;
var TOP_PAD = charFontSize;

var state = {
  canvas: null,
  ctx: null,
  w: 0,
  h: 0,
  metricsDirty: true,
  paused: false,
  fontFamily: 'monospace',
  fontRequested: false,
  // True while the webfont is still loading, so the first frame is not announced in the fallback font.
  fontPending: false,
  announced: false,
  charWidth: 0,
  cols: 0,
  rows: 0,
  colPhase: new Float32Array(0),
  heightNormByRow: new Float32Array(0),
  atlas: null,
};

function fontString() {
  return charFontSize + 'px "' + state.fontFamily + '", monospace';
}

function buildAtlas(measuredCharWidth) {
  var cellW = LEFT_PAD + Math.ceil(measuredCharWidth) + charFontSize;
  var cellH = TOP_PAD + Math.ceil(charFontSize * 2);
  var atlasCanvas = new OffscreenCanvas(Math.max(1, cellW * fireCharsLen), cellH);
  var actx = atlasCanvas.getContext('2d');
  actx.font = fontString();
  actx.textBaseline = 'top';
  for (var i = 0; i < fireCharsLen; i++) {
    var glyph = fireChars[i];
    if (glyph === ' ') continue;
    actx.fillStyle = fireColors[Math.min(i, fireColorsLen - 1)];
    actx.fillText(glyph, i * cellW + LEFT_PAD, TOP_PAD);
  }
  return { canvas: atlasCanvas, cellW: cellW, cellH: cellH };
}

function recomputeMetrics() {
  var ctx = state.ctx;
  ctx.font = fontString();
  state.charWidth = ctx.measureText('@').width || charFontSize * 0.6;
  state.cols = Math.ceil(state.w / state.charWidth) + 5;
  state.rows = Math.ceil(state.h / charFontSize) + 2;

  var cp = new Float32Array(state.cols);
  for (var c = 0; c < state.cols; c++) {
    cp[c] = Math.sin(c * 2.1 + 0.5) * 3 + Math.sin(c * 0.7 + 1.3) * 5;
  }
  state.colPhase = cp;

  var hn = new Float32Array(state.rows);
  for (var r = 0; r < state.rows; r++) {
    hn[r] = (r * charFontSize) / state.h;
  }
  state.heightNormByRow = hn;

  state.atlas = buildAtlas(state.charWidth);
}

function drawFrame(t) {
  var ctx = state.ctx;
  if (!ctx || state.w === 0 || state.h === 0) return;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, state.w, state.h);
  var atlas = state.atlas;
  if (!atlas) return;
  var atlasCanvas = atlas.canvas, cellW = atlas.cellW, cellH = atlas.cellH;
  var rows = state.rows, cols = state.cols, colPhase = state.colPhase, heightNormByRow = state.heightNormByRow, charWidth = state.charWidth;
  var maxCharIdx = fireCharsLen - 1;

  for (var r = 0; r < rows; r++) {
    var py = r * charFontSize;
    var heightNorm = heightNormByRow[r];
    var scroll = r * 0.4 + t * 8;

    for (var c = 0; c < cols; c++) {
      var cPhase = colPhase[c];
      var v1 = Math.sin(scroll + cPhase) * 0.5 + 0.5;
      var v2 = Math.sin(scroll * 2.3 + cPhase * 0.7 + 10) * 0.25 + 0.25;
      var v3 = Math.sin(scroll * 4.1 + cPhase * 0.3 + 20) * 0.125 + 0.125;
      var combined = v1 + v2 + v3;
      var intensity = combined * heightNorm * 0.85;
      var charIdx = Math.min(maxCharIdx, Math.floor(intensity * fireCharsLen));
      if (fireChars[charIdx] === ' ') continue;
      ctx.drawImage(atlasCanvas, charIdx * cellW, 0, cellW, cellH, c * charWidth - LEFT_PAD, py - TOP_PAD, cellW, cellH);
    }
  }
}

function tick() {
  if (state.canvas && (state.canvas.width !== state.w || state.canvas.height !== state.h)) {
    state.canvas.width = state.w;
    state.canvas.height = state.h;
    state.metricsDirty = true;
  }
  if (!state.paused && state.w > 0 && state.h > 0) {
    if (state.metricsDirty) {
      recomputeMetrics();
      state.metricsDirty = false;
    }
    drawFrame(performance.now() * 0.001);
    if (!state.announced && !state.fontPending) {
      state.announced = true;
      self.postMessage({ type: 'ready' });
    }
  }
  self.requestAnimationFrame(tick);
}

// "Space Mono" may not be resolvable/loaded yet when init happens — draw
// with generic monospace metrics (same fallback the main-thread path uses
// pre-font-load) until this resolves, then rebuild the atlas once it does.
function loadFont(url) {
  if (state.fontRequested) return;
  state.fontRequested = true;
  if (typeof FontFace !== 'function' || !self.fonts) return;
  state.fontPending = true;
  fetch(url)
    .then(function (r) { return r.arrayBuffer(); })
    .then(function (buf) {
      var ff = new FontFace('Space Mono', buf);
      self.fonts.add(ff);
      return ff.load();
    })
    .then(function () {
      state.fontFamily = 'Space Mono';
      state.metricsDirty = true;
      state.fontPending = false;
      self.postMessage({ type: 'fontLoaded' });
    })
    .catch(function (err) {
      state.fontRequested = false; // allow a later 'font' retry to try again
      state.fontPending = false;
      self.postMessage({ type: 'fontFailed', error: String(err) });
    });
}

self.onmessage = function (ev) {
  var msg = ev.data;
  if (msg.type === 'init') {
    state.canvas = msg.canvas;
    state.ctx = state.canvas.getContext('2d');
    state.w = msg.w;
    state.h = msg.h;
    state.metricsDirty = true;
    if (msg.fontUrl) loadFont(msg.fontUrl);
    self.requestAnimationFrame(tick);
  } else if (msg.type === 'resize') {
    if (msg.w !== state.w || msg.h !== state.h) {
      state.w = msg.w;
      state.h = msg.h;
      state.metricsDirty = true;
    }
  } else if (msg.type === 'pause') {
    state.paused = true;
  } else if (msg.type === 'resume') {
    state.paused = false;
  } else if (msg.type === 'font' && msg.url) {
    loadFont(msg.url);
  }
};
`;
}
