/**
 * Colors for the footer's ASCII fire, one per glyph from sparsest (top) to densest
 * (bottom). Kept apart from FooterCanvas so chapter themes can build their own
 * without pulling the lazy-loaded canvas into the first bundle.
 */

/** Spells a ramp out from [color, glyph count] bands. */
export function fireRamp(bands: ReadonlyArray<readonly [string, number]>): string[] {
  return bands.flatMap(([color, count]) => Array<string>(count).fill(color));
}

/** The main site's rainbow: blue (sparse/top) → orange (dense/bottom). */
export const DEFAULT_FIRE_COLORS = fireRamp([
  ['#035593', 5], // blue — sparsest
  ['#11BBCD', 7], // cyan
  ['#03C661', 7], // green
  ['#fac205', 10], // yellow
  ['#fc5715', 7], // orange — densest
]);
