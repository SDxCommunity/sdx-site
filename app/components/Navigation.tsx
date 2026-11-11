'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';
import { m } from 'motion/react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import AsciiButton from './AsciiButton';
import MotionButton from './motion/MotionButton';
import LogoContextMenu from './LogoContextMenu';
import { UCSD_JOIN } from '@/app/chapters/ucsd/lib/links';
import { SDSU_JOIN } from '@/app/chapters/sdsu/lib/links';

/** Chapters with their own subdomain, and where each one's Join button goes. */
const CHAPTER_JOIN: Record<string, string> = { ucsd: UCSD_JOIN, sdsu: SDSU_JOIN };

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/members', label: 'Members' },
  { href: '/chapters', label: 'Chapters' },
];

const MAIN_JOIN_URL = 'https://lu.ma/sdx';

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Route segments reflect the matched route, so they are right on the server even when
  // ucsd.sdx.community rewrites "/" to /chapters/ucsd. Each chapter site (UCSD, SDSU) gets
  // a short bar with only the logo and a Join button that opens the chapter's Luma page.
  const segments = useSelectedLayoutSegments();
  const chapterJoin = segments[0] === 'chapters' ? CHAPTER_JOIN[segments[1] ?? ''] : undefined;
  const onChapterSite = chapterJoin !== undefined;
  const joinHref = chapterJoin ?? MAIN_JOIN_URL;

  // The UCSD people lookbook fills the screen, so it has no top bar.
  if (segments[1] === 'ucsd' && segments[2] === 'people') return null;

  const handleLinkClick = (linkUrl: string) => {
    sendGAEvent('clicked', { link_url: linkUrl });
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 backdrop-blur-md z-50 ${
        onChapterSite ? 'bg-black/30' : 'bg-black/90 border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between ${onChapterSite ? 'h-14' : 'h-20'}`}>
          {/* Logo */}
          <LogoContextMenu>
            <Link href="/" className="flex-shrink-0 group relative" onClick={() => handleLinkClick('/')}>
              <m.span
                className={`font-display ${onChapterSite ? 'text-3xl' : 'text-4xl'} tracking-tight flex relative`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {['S', 'D', 'x'].map((letter, i) => (
                  <span key={letter} className="relative inline-block">
                    {/* Filled — visible by default, fades out on hover */}
                    <span
                      className="group-hover:opacity-0 transition-opacity duration-200"
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      {letter}
                    </span>
                    {/* Outlined — hidden by default, fades in on hover */}
                    <span
                      className="absolute inset-0 text-outline opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      {letter}
                    </span>
                  </span>
                ))}
              </m.span>
            </Link>
          </LogoContextMenu>

          {/* Desktop Navigation — in flow on tablets, absolutely centered from lg so it never overlaps the CTAs */}
          <div className={`${onChapterSite ? 'hidden' : 'hidden md:flex'} items-center gap-1 lg:absolute lg:left-1/2 lg:-translate-x-1/2`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                className="px-3 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className={`${onChapterSite ? 'flex' : 'hidden md:flex'} items-center gap-3`}>
            <Link
              href="/executives"
              onClick={() => handleLinkClick('/executives')}
              className={`${onChapterSite ? 'hidden' : ''} px-3 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-200`}
            >
              Executives
            </Link>
            {onChapterSite ? (
              <MotionButton>
                <Link
                  href={joinHref}
                  target="_blank"
                  onClick={() => handleLinkClick(joinHref)}
                  className="block"
                >
                  <AsciiButton contentClassName="px-6 py-2">Join</AsciiButton>
                </Link>
              </MotionButton>
            ) : (
              <Link
                href={joinHref}
                target="_blank"
                onClick={() => handleLinkClick(joinHref)}
                className="block"
              >
                <AsciiButton>Join</AsciiButton>
              </Link>
            )}
          </div>

          {/* Mobile menu */}
          <div className={onChapterSite ? 'hidden' : 'md:hidden'}>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="p-2 text-white/60 hover:text-white transition-colors duration-200">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open main menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-black border-white/5 p-0">
                <div className="flex flex-col pt-12">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => handleLinkClick(link.href)}
                      className="px-6 py-3 text-xs uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-white/5 my-2" />
                  <Link
                    href="/executives"
                    onClick={() => handleLinkClick('/executives')}
                    className="px-6 py-3 text-xs uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors duration-200"
                  >
                    Executives
                  </Link>
                  <div className="px-6 pt-4">
                    <Link
                      href={joinHref}
                      target="_blank"
                      onClick={() => handleLinkClick(joinHref)}
                      className="block"
                    >
                      <AsciiButton>Join</AsciiButton>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {/* Holographic line separator */}
      {!onChapterSite && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </nav>
  );
};

export default Navigation;
