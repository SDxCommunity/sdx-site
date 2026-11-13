'use client'

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSelectedLayoutSegments } from 'next/navigation';
import type { FooterTheme } from './FooterCanvas';
import { sendGAEvent } from '@next/third-parties/google';
import MotionSection from '@/app/components/motion/MotionSection';
import { DiscordIcon, InstagramIcon, LinkedInIcon, TwitterIcon } from '@/app/components/SocialIcons';

// FooterCanvas is a client-only canvas effect below the fold on first
// load — split it out of the main layout chunk.
const FooterCanvas = dynamic(() => import('./FooterCanvas'), { ssr: false });

const headingClass = 'text-sm font-bold text-white mb-4';

const socials = [
  { href: 'https://discord.gg/Rkgyzx2ykV', label: 'Join our Discord', ga: 'footer-discord', Icon: DiscordIcon },
  { href: 'https://twitter.com/SDxCommunity', label: 'Follow us on Twitter', ga: 'footer-twitter', Icon: TwitterIcon },
  { href: 'https://linkedin.com/company/sdxcommunity', label: 'Connect on LinkedIn', ga: 'footer-linkedin', Icon: LinkedInIcon },
  { href: 'https://instagram.com/sdxcommunity', label: 'Follow us on Instagram', ga: 'footer-instagram', Icon: InstagramIcon },
];

const Footer: React.FC = () => {
  // Route segments see the rewritten route on chapter subdomains; the pathname does not.
  const segments = useSelectedLayoutSegments();
  const theme: FooterTheme =
    segments[0] === 'chapters' && (segments[1] === 'ucsd' || segments[1] === 'sdsu') ? segments[1] : 'main';

  const handleLinkClick = (linkUrl: string, label: string) => {
    sendGAEvent('clicked', { link_url: linkUrl, label });
  };

  return (
    <footer className="relative pt-16 overflow-hidden">
      {/* Remount on a theme change, so the canvas rebuilds in the new colors */}
      <FooterCanvas key={theme} theme={theme} />

      <MotionSection className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="font-display text-2xl text-white tracking-tight mb-4 inline-block">SDx</span>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              San Diego&apos;s builder-first technology community.
            </p>
            <div className="flex gap-3 mt-4">
              {socials.map(({ href, label, ga, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  aria-label={label}
                  onClick={() => handleLinkClick(href, ga)}
                  className="text-white/60 hover:text-white transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={headingClass}>Navigate</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/events', label: 'Events' },
                { href: '/chapters', label: 'Chapters' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className={headingClass}>Community</h3>
            <ul className="space-y-2">
              {[
                { href: 'https://lu.ma/sdx', label: 'Events Calendar', external: true },
                { href: 'https://discord.gg/Rkgyzx2ykV', label: 'Discord', external: true },
                { href: 'mailto:hello@sdx.community', label: 'Contact', external: false },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    className="text-sm text-white/70 hover:text-white transition-colors duration-200"
                    onClick={() => link.external && handleLinkClick(link.href, `footer-${link.label.toLowerCase()}`)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
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
