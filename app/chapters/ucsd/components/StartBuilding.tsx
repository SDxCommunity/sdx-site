'use client'

import React from 'react';
import ClosingCta from '@/app/components/ClosingCta';
import JoinRow from './JoinRow';

export default function StartBuilding() {
  return (
    <ClosingCta heading="Start building.">
      <JoinRow />
    </ClosingCta>
  );
}
