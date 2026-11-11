import type { Metadata } from 'next';
import { GeistSerif } from 'geist/font/serif';
import PeopleGrid from './PeopleGrid';
import { PEOPLE } from './people';

export const metadata: Metadata = {
  title: 'People',
  description: 'Founders, investors, and engineers who came up through SDxUCSD.',
  // Shared by link with investors, not listed in search.
  robots: { index: false, follow: false },
};

/** The people lookbook: only the grid, set in Geist Serif. No top bar, footer, or intro. */
export default function UCSDPeoplePage() {
  return (
    <main className={`${GeistSerif.className} max-w-5xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-24`}>
      <PeopleGrid people={PEOPLE} />
    </main>
  );
}
