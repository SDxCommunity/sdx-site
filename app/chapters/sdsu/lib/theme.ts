/**
 * What sets the SDSU chapter's look apart from UCSD's. SDSU's colors are red and
 * black, so its effects lean warm where UCSD's run the full SDx spectrum.
 */

/** Multiplied over the white hero blobs: a soft rose at the edges, white toward the center. */
export const SDSU_HERO_TINT =
  'radial-gradient(ellipse 80% 70% at 50% 48%, #ffffff 0%, #fbeaeb 40%, #eeb4b7 75%, #e29a9e 100%)';

/** Palette for the mouse-reactive color fields (stats bar, upcoming events, closing CTA). */
export const SDSU_PALETTE = 'warm' as const;
