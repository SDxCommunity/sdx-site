import HomeHero from './components/home/HomeHero';
import WhatWeDo from './components/home/WhatWeDo';
import HomeEvents from './components/home/HomeEvents';
import Network from './components/home/Network';
import AsciiDrift from './components/AsciiDrift';
import ClosingCta from './components/ClosingCta';
import SdxJoinRow from './components/SdxJoinRow';

export default function Home() {
  return (
    <main className="relative">
      <HomeHero />
      {/* One ASCII field runs behind both sections, so there is no seam between them */}
      <div className="relative">
        <AsciiDrift />
        <WhatWeDo />
        <HomeEvents />
      </div>
      <Network />
      <ClosingCta
        heading="Come build."
        sub={<>You don&apos;t need to know how to code to join SDx. You need to want to learn.</>}
      >
        <SdxJoinRow track="cta" />
      </ClosingCta>
    </main>
  );
}
