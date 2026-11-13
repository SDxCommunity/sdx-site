/**
 * What sets the UCSD chapter's look apart from SDSU's. UCSD's colors are blue and
 * gold, so its effects run blue on one side and gold on the other. Like SDSU's
 * rose, the tints stay soft and the color fields stay bright.
 */

/**
 * Multiplied over the white hero blobs: soft blue from the left, soft gold from the
 * right, white through the middle.
 */
export const UCSD_HERO_TINT =
  'radial-gradient(ellipse 45% 40% at 50% 48%, #ffffff 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(110deg, #84b0ec 0%, #a9c8f2 22%, #e4eefc 42%, #fcf1d4 58%, #f0d68a 78%, #e6be55 100%)';

/** Colors for the mouse-reactive color fields (stats bar, upcoming events, closing CTA). */
export const UCSD_FIELDS = ['#035593', '#1f7fc4', '#FAC205'] as const;
