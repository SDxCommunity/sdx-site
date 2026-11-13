import type { Metadata } from 'next';

export const metadata: Metadata = {
  // The chapter lives at sdsu.sdx.community, so its canonical URL and preview image name that host.
  metadataBase: new URL('https://sdsu.sdx.community'),
  alternates: { canonical: '/' },
  title: {
    default: 'SDxSDSU',
    template: '%s · SDxSDSU',
  },
  description:
    'The home for AI builders, creatives, and founders at San Diego State University. SDx chapter at SDSU.',
};

export default function SDSUChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
