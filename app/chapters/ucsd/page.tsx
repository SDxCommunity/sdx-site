'use client'

import React from 'react';
import Hero from './components/Hero';
import About from './components/About';
import PastEvents from './components/PastEvents';
import StartBuilding from './components/StartBuilding';

export default function UCSDChapterPage() {
  return (
    <main className="relative">
      <Hero />
      <About />
      <PastEvents compact />
      <StartBuilding />
    </main>
  );
}
