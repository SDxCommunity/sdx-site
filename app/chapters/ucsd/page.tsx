'use client'

import React from 'react';
import Hero from './components/Hero';
import About from './components/About';
import PastEvents from './components/PastEvents';
import StartBuilding from './components/StartBuilding';
import AsciiDrift from './components/AsciiDrift';

export default function UCSDChapterPage() {
  return (
    <main className="relative">
      <Hero />
      {/* One ASCII field runs behind both sections, so there is no seam between them */}
      <div className="relative">
        <AsciiDrift />
        <About />
        <PastEvents compact />
      </div>
      <StartBuilding />
    </main>
  );
}
