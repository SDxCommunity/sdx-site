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

/** The club's totals, shown above the grid in the grid's own columns. */
const STATS = [
  { value: '$20M+', label: 'raised' },
  { value: '$1M+', label: 'MRR' },
  { value: '4', label: 'teams sent to YC' },
];

const SHOWN = PEOPLE.filter((person) => !person.hidden);

/** Current members first, then alumni. Each keeps the rank order of people.ts. */
const GROUPS = [
  { title: 'Current', people: SHOWN.filter((person) => !person.alumni) },
  { title: 'Alumni', people: SHOWN.filter((person) => person.alumni) },
];

/** The people lookbook: three stats, then the two grids, set in Geist Serif. No top bar, footer, or intro. */
export default function UCSDPeoplePage() {
  return (
    <main className={`${GeistSerif.className} max-w-5xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-24`}>
      <dl className="mb-12 grid grid-cols-3 gap-x-4 md:mb-16 md:gap-x-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <dt className="order-last mt-2 md:mt-3 text-xs md:text-sm text-white/55 leading-snug">{stat.label}</dt>
            <dd className="text-2xl sm:text-4xl md:text-6xl text-white tracking-tight leading-none">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <PeopleGrid groups={GROUPS} />
    </main>
  );
}
