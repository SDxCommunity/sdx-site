import { fireRamp } from '@/app/components/footerFireColors';

/**
 * What sets the SDSU chapter's look apart from UCSD's. SDSU's colors are red and
 * black, so its effects lean warm where UCSD's run the full SDx spectrum.
 */

/** Multiplied over the white hero blobs: a soft rose at the edges, white toward the center. */
export const SDSU_HERO_TINT =
  'radial-gradient(ellipse 80% 70% at 50% 48%, #ffffff 0%, #fbeaeb 40%, #eeb4b7 75%, #e29a9e 100%)';

/** Palette for the mouse-reactive color fields (stats bar, upcoming events, closing CTA). */
export const SDSU_PALETTE = 'warm' as const;

/** The footer's ASCII fire: deep rose at the sparse top, pale rose at the dense bottom. */
export const SDSU_FOOTER_FIRE = fireRamp([
  ['#7d3238', 5],
  ['#a64a52', 7],
  ['#c9707a', 7],
  ['#e29a9e', 10],
  ['#f4c0c3', 7],
]);
