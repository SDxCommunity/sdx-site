import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

type ArrowLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

/**
 * The site's secondary action: a quiet underlined text link with an arrow.
 * Links that leave the site open in a new tab and point up and to the right.
 */
export default function ArrowLink({ href, children, className = '', onClick }: ArrowLinkProps) {
  const external = /^https?:\/\//.test(href);
  const Icon = external ? ArrowUpRight : ArrowRight;

  return (
    <Link
      href={href}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex items-center gap-1.5 text-sm text-white/50 underline underline-offset-4 decoration-white/20 hover:text-white/85 hover:decoration-white/40 transition-colors ${className}`}
    >
      {children}
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}
