import HomeHero from './components/home/HomeHero';
import HomeChapters from './components/home/HomeChapters';
import WhatWeDo from './components/home/WhatWeDo';
import HomeEvents from './components/home/HomeEvents';
import ClosingCta from './components/ClosingCta';
import SdxJoinRow from './components/SdxJoinRow';

export default function Home() {
  return (
    <main className="relative">
      <HomeHero />
      <WhatWeDo />
      <HomeChapters />
      <HomeEvents />
      <ClosingCta heading="Build here.">
        <SdxJoinRow track="cta" />
      </ClosingCta>
    </main>
  );
}
