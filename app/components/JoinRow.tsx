'use client'

import React from 'react';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import AsciiButton from '@/app/components/AsciiButton';
import MotionButton from '@/app/components/motion/MotionButton';

/** A link in the row. When `ga` is set, a click sends a GA "clicked" event with that label. */
export type RowLink = { href: string; label: string; ga?: string };
export type IconLink = RowLink & { icon: React.ReactNode };

type JoinRowProps = {
  join: RowLink;
  left?: IconLink;
  right?: IconLink;
  className?: string;
};

const track = (link: RowLink) =>
  link.ga ? () => sendGAEvent('clicked', { link_url: link.href, label: link.ga }) : undefined;

function IconButton({ link }: { link: IconLink }) {
  return (
    <MotionButton>
      <Link
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={link.label}
        onClick={track(link)}
        className="block"
      >
        <AsciiButton tone="dark" contentClassName="flex h-10 w-10 items-center justify-center">
          {link.icon}
        </AsciiButton>
      </Link>
    </MotionButton>
  );
}

/** The primary join button, flanked by square social buttons. */
export default function JoinRow({ join, left, right, className = '' }: JoinRowProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {left && <IconButton link={left} />}
      <MotionButton>
        <Link href={join.href} target="_blank" rel="noopener noreferrer" onClick={track(join)} className="block">
          <AsciiButton>{join.label}</AsciiButton>
        </Link>
      </MotionButton>
      {right && <IconButton link={right} />}
    </div>
  );
}
