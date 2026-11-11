'use client'

import React, { useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import PageHeader from '@/app/components/PageHeader';
import SectionTitle from '@/app/components/SectionTitle';
import ArrowLink from '@/app/components/ArrowLink';
import AsciiButton from '@/app/components/AsciiButton';
import StaggerTitle from '@/app/components/StaggerTitle';
import PersonCard, { type Person } from '@/app/components/PersonCard';
import MotionSection from '@/app/components/motion/MotionSection';
import MotionGrid from '@/app/components/motion/MotionGrid';
import MotionCard from '@/app/components/motion/MotionCard';
import executivesData from '@/data/executives.json';
import { SDX_EMAIL } from '@/lib/links';

const executives = executivesData as (Person & { featured?: boolean })[];
const featuredExecutives = executives.filter((executive) => executive.featured === true);

const pillars = [
  { title: 'Peer roundtables', desc: 'Intimate sessions with fellow executives tackling AI adoption.' },
  { title: 'Off the record', desc: 'Candid conversations in a trusted, closed-door environment.' },
  { title: 'Practical focus', desc: 'Real use cases, real inhibitors, real solutions.' },
  { title: 'Curated network', desc: 'Vetted membership of senior leaders across industries.' },
];

const inputClass =
  'h-11 w-full rounded-sm border border-white/15 bg-black/40 px-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/50 disabled:opacity-50';

function Field({
  id,
  label,
  ...input
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm text-white/70">
        {label}
      </label>
      <input id={id} required className={inputClass} {...input} />
    </div>
  );
}

export default function ExecutivesPage() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/executives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, role }),
      });
      const data = await response.json();
      if (response.ok) {
        sendGAEvent('form_submit', { form_name: 'executives-application', email, company });
        setIsSubmitted(true);
      } else {
        setSubmitError(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="relative min-h-[80svh] flex items-center px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <StaggerTitle
            text="Application submitted."
            className="font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.05] tracking-tight text-white prismatic-glow"
          />
          <p className="mt-6 text-base md:text-lg text-white/70">
            We&apos;ll review your application and get back to you soon.
          </p>
          <ArrowLink href="/" className="mt-8">
            Return home
          </ArrowLink>
        </div>
      </main>
    );
  }

  return (
    <main className="relative">
      <PageHeader
        title="Executive Network"
        tone="warm"
        subtitle="Peer-level AI implementation exchange for C-suite leaders. Real experience, shared openly. Not a conference. Not a vendor pitch."
      >
        <ArrowLink href="#apply">Apply to join</ArrowLink>
      </PageHeader>

      <section className="relative py-10 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* About the network */}
          <MotionSection className="lg:col-span-7">
            <SectionTitle>An executive peer network for AI leaders</SectionTitle>
            <p className="mt-8 max-w-xl text-sm md:text-base leading-relaxed text-white/70">
              The SDx Executive Network brings together C-suite leaders and senior decision-makers navigating AI
              implementation. Small-group roundtables, off-the-record conversations, and direct access to peers who
              are solving the same problems you are. No vendors. No pitches. Just real experience shared openly.
            </p>
            <ul className="mt-8 max-w-xl space-y-4 text-sm md:text-base leading-relaxed text-white/70 list-disc pl-5 marker:text-white/40">
              {pillars.map((pillar) => (
                <li key={pillar.title}>
                  <span className="font-bold text-white">{pillar.title}.</span> {pillar.desc}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-white/45">Limited to 50 executive members.</p>
          </MotionSection>

          {/* Application form */}
          <MotionSection delay={0.08} className="lg:col-span-5">
            <div
              id="apply"
              className="scroll-mt-24 rounded-sm border border-white/10 bg-black/70 p-6 md:p-8 backdrop-blur-md"
            >
              <h2 className="font-display text-3xl text-white tracking-tight">Apply</h2>
              <p className="mt-2 text-sm text-white/55">Join San Diego&apos;s AI executive network.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {submitError && (
                  <p className="rounded-sm border border-destructive/30 bg-destructive/[0.06] px-3 py-2.5 text-sm text-destructive">
                    {submitError}
                  </p>
                )}

                <Field
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <Field
                  id="company"
                  label="Company"
                  type="text"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={isSubmitting}
                />
                <Field
                  id="role"
                  label="Role"
                  type="text"
                  placeholder="Chief AI Officer, VP of AI, CTO"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isSubmitting}
                />

                <button type="submit" disabled={isSubmitting} className="block w-full pt-2 disabled:opacity-50">
                  <AsciiButton contentClassName="px-8 py-3 text-center">
                    {isSubmitting ? 'Submitting…' : 'Apply'}
                  </AsciiButton>
                </button>
              </form>

              <p className="mt-6 text-sm text-white/45">
                Questions?{' '}
                <a
                  href={`mailto:${SDX_EMAIL}`}
                  className="text-white/70 underline underline-offset-4 decoration-white/20 hover:text-white transition-colors"
                >
                  {SDX_EMAIL}
                </a>
              </p>
            </div>
          </MotionSection>
        </div>
      </section>

      {featuredExecutives.length > 0 && (
        <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <MotionSection>
              <SectionTitle>Members</SectionTitle>
            </MotionSection>
            <MotionGrid className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {featuredExecutives.map((executive) => (
                <MotionCard key={executive.id} enableHover={false}>
                  <PersonCard person={executive} />
                </MotionCard>
              ))}
            </MotionGrid>
          </div>
        </section>
      )}
    </main>
  );
}
