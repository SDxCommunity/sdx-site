import { ImageResponse } from 'next/og';
import { loadFonts, loadBgImage, OGImage } from '@/lib/og-utils';

export const alt = 'SDxSDSU: the home for AI builders, creatives, and founders at San Diego State.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [fonts, bgSrc] = await Promise.all([loadFonts(), loadBgImage()]);
  return new ImageResponse(
    <OGImage
      title="SDxSDSU"
      subtitle="The home for AI builders, creatives, and founders at San Diego State."
      bgSrc={bgSrc}
    />,
    { ...size, fonts }
  );
}
