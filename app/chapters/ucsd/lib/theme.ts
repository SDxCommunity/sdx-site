import { fireRamp } from '@/app/components/footerFireColors';

/**
 * What sets the UCSD chapter's look apart from SDSU's. UCSD's colors are blue and
 * gold. Blue leads and gold is the smaller accent. Like SDSU's rose, the tints stay
 * soft and the color fields stay bright.
 */

/**
 * Multiplied over the white hero blobs: soft blue across most of the field, soft gold
 * at the right edge, white around the title.
 */
export const UCSD_HERO_TINT =
  'radial-gradient(ellipse 45% 40% at 50% 48%, #ffffff 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(110deg, #84b0ec 0%, #a9c8f2 35%, #d6e5f8 60%, #fcf1d4 80%, #f0d68a 92%, #e6be55 100%)';

/** Colors for the mouse-reactive color fields (stats bar, upcoming events, closing CTA). */
export const UCSD_FIELDS = ['#035593', '#1f7fc4', '#3a8fd9', '#FAC205'] as const;

/** The footer's ASCII fire: mostly blue, with gold only in the densest glyphs. */
export const UCSD_FOOTER_FIRE = fireRamp([
  ['#035593', 7],
  ['#1f7fc4', 9],
  ['#84b0ec', 10],
  ['#f0d68a', 5],
  ['#FAC205', 5],
]);
