'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSelectedLayoutSegments } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';
import { m } from 'motion/react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import AsciiButton from './AsciiButton';
import MotionButton from './motion/MotionButton';
import LogoContextMenu from './LogoContextMenu';
import { UCSD_JOIN } from '@/app/chapters/ucsd/lib/links';
import { SDX_JOIN } from '@/lib/links';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/members', label: 'Members' },
  { href: '/chapters', label: 'Chapters' },
];

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  // Route segments reflect the matched route, so they are right on the server even when
  // ucsd.sdx.community rewrites "/" to /chapters/ucsd. The UCSD chapter shows only the
  // logo and a Join button that opens the chapter Luma calendar.
  const segments = useSelectedLayoutSegments();
  const onUcsdChapter = segments[0] === 'chapters' && segments[1] === 'ucsd';
  const joinHref = onUcsdChapter ? UCSD_JOIN : SDX_JOIN;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `px-3 py-2 text-sm transition-colors duration-200 ${
      isActive(href) ? 'text-white' : 'text-white/60 hover:text-white'
    }`;

  const handleLinkClick = (linkUrl: string) => {
    sendGAEvent('clicked', { link_url: linkUrl });
    setIsMenuOpen(false);
  };

  const joinButton = (
    <MotionButton>
      <Link href={joinHref} target="_blank" onClick={() => handleLinkClick(joinHref)} className="block">
        <AsciiButton contentClassName="px-6 py-2">Join</AsciiButton>
      </Link>
    </MotionButton>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <LogoContextMenu>
            <Link href="/" className="flex-shrink-0 group relative" onClick={() => handleLinkClick('/')}>
              <m.span
                className="font-display text-3xl tracking-tight flex relative"
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

          {/* Desktop links — in flow on tablets, absolutely centered from lg so they never overlap the actions */}
          {!onUcsdChapter && (
            <div className="hidden md:flex items-center gap-1 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={linkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!onUcsdChapter && (
              <Link
                href="/executives"
                onClick={() => handleLinkClick('/executives')}
                aria-current={isActive('/executives') ? 'page' : undefined}
                className={`hidden md:block ${linkClass('/executives')}`}
              >
                Executives
              </Link>
            )}
            {joinButton}

            {/* Mobile menu */}
            {!onUcsdChapter && (
              <div className="md:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <button className="-mr-2 p-2 text-white/60 hover:text-white transition-colors duration-200">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open main menu</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] bg-black/95 backdrop-blur-md border-white/5 p-0">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <div className="flex flex-col pt-14">
                      {[...navLinks, { href: '/executives', label: 'Executives' }].map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => handleLinkClick(link.href)}
                          aria-current={isActive(link.href) ? 'page' : undefined}
                          className={`px-6 py-3 text-base transition-colors duration-200 hover:bg-white/[0.03] ${
                            isActive(link.href) ? 'text-white' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
