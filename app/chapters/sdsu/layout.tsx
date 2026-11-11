import type { Metadata } from 'next';

export const metadata: Metadata = {
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
