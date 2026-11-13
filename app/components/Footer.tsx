'use client'

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSelectedLayoutSegments } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';
import MotionSection from '@/app/components/motion/MotionSection';
import type { FooterTheme } from './FooterCanvas';

// FooterCanvas is a client-only canvas effect below the fold on first
// load — split it out of the main layout chunk.
const FooterCanvas = dynamic(() => import('./FooterCanvas'), { ssr: false });

const MAIN_SITE = 'https://www.sdx.community';
const CONTACT_EMAIL = 'hello@sdx.community';

const headingClass = 'text-sm font-bold text-white mb-4';
const linkClass = 'text-white/70 hover:text-white transition-colors duration-200';

const Footer: React.FC = () => {
  const segments = useSelectedLayoutSegments();
  const onChapterSite = segments[0] === 'chapters' && (segments[1] === 'ucsd' || segments[1] === 'sdsu');
  // Each chapter's ASCII fire takes its own colors and cell shape; the main site keeps the rainbow
  const theme: FooterTheme = onChapterSite ? (segments[1] as FooterTheme) : 'main';

  // The UCSD people lookbook stands alone, with no footer.
  if (onChapterSite && segments[1] === 'ucsd' && segments[2] === 'people') return null;

  // The footer always leads to the main SDx site. A chapter subdomain rewrites relative
  // paths into the chapter, so there the links name the main domain. On the main site
  // they stay relative and keep the page transition.
  const mainHref = (path: string) => (onChapterSite ? `${MAIN_SITE}${path}` : path);

  const handleLinkClick = (linkUrl: string, label: string) => {
    sendGAEvent('clicked', { link_url: linkUrl, label });
  };

  return (
    <footer className="relative pt-16 overflow-hidden">
      {/* The canvas hands its colors to a worker once, so a new theme remounts it */}
      <FooterCanvas key={theme} theme={theme} />

      <MotionSection className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
        {/* On desktop, row 1 sets SDx, Navigate, and Community on one baseline.
            Row 2 starts the tagline, Events, and Calendar on one line. */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-x-8">
          <span className="font-display text-2xl text-white tracking-tight mb-4 md:col-span-2 md:col-start-1 md:row-start-1 md:self-baseline">
            SDx
          </span>

          <div className="md:col-span-2 md:col-start-1 md:row-start-2">
            <p className="text-sm text-white/70">
              San Diego&apos;s builder-first technology community.
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                href="https://discord.gg/Y7ME6kQAye"
                target="_blank"
                aria-label="Join our Discord"
                onClick={() => handleLinkClick('https://discord.gg/Y7ME6kQAye', 'footer-discord')}
                className="text-white/60 hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                </svg>
              </Link>
              <Link
                href="https://x.com/SDxCommunity"
                target="_blank"
                aria-label="Follow us on X"
                onClick={() => handleLinkClick('https://x.com/SDxCommunity', 'footer-twitter')}
                className="text-white/60 hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </Link>
              <Link
                href="https://linkedin.com/company/sdxcommunity"
                target="_blank"
                aria-label="Connect on LinkedIn"
                onClick={() => handleLinkClick('https://linkedin.com/company/sdxcommunity', 'footer-linkedin')}
                className="text-white/60 hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
              <Link
                href="https://instagram.com/sdxcommunity"
                target="_blank"
                aria-label="Follow us on Instagram"
                onClick={() => handleLinkClick('https://instagram.com/sdxcommunity', 'footer-instagram')}
                className="text-white/60 hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </Link>
            </div>
          </div>

          <h3 className={`${headingClass} mt-8 md:mt-0 md:col-start-3 md:row-start-1 md:self-baseline`}>Navigate</h3>
          <ul className="space-y-2 text-sm md:col-start-3 md:row-start-2">
            {[
              { href: mainHref('/'), label: 'Home' },
              { href: mainHref('/events'), label: 'Events' },
              { href: mainHref('/chapters'), label: 'Chapters' },
            ].map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className={`${headingClass} mt-8 md:mt-0 md:col-start-4 md:row-start-1 md:self-baseline`}>Community</h3>
          <ul className="space-y-2 text-sm md:col-start-4 md:row-start-2">
            {[
              { href: 'https://lu.ma/sdx', label: 'Calendar' },
              { href: 'https://discord.gg/Y7ME6kQAye', label: 'Discord' },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  target="_blank"
                  className={linkClass}
                  onClick={() => handleLinkClick(link.href, `footer-${link.label.toLowerCase()}`)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {/* A plain anchor: the app router's Link swallows mailto: clicks. */}
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 flex items-center gap-3">
          <span className="text-xs text-white tracking-wider">&copy; {new Date().getFullYear()} SDx.</span>
          <span className="inline-flex items-center bg-white text-black font-bold text-xs tracking-wider pl-1 pr-1">
            Build here.<span className="animate-blink ml-0.5">|</span>
          </span>
        </div>
      </MotionSection>
    </footer>
  );
};

export default Footer;
