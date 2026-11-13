'use client'

import { m, useInView } from 'motion/react';
import { useRef, useContext, useState, useEffect } from 'react';
import { variants, transitions } from '@/lib/motion';
import { TransitionPhaseContext } from '../PageTransition';

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'fadeLeft' | 'scaleIn';
  delay?: number;
  as?: 'div' | 'section';
}

export default function MotionSection({
  children,
  className,
  variant = 'fadeUp',
  delay = 0,
  as = 'div',
}: MotionSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '100px 0px -50px 0px' });
  const phase = useContext(TransitionPhaseContext);
  const [locked, setLocked] = useState(false);

  // Latch: once visible, stay visible forever — never animate back out
  useEffect(() => {
    if (isInView && phase !== 'cover' && !locked) {
      setLocked(true);
    }
  }, [isInView, phase, locked]);

  const Tag = as === 'section' ? m.section : m.div;

  return (
    <Tag
      ref={ref}
      className={className}
      initial="hidden"
      animate={locked ? 'visible' : 'hidden'}
      variants={variants[variant]}
      transition={{ ...transitions.appear, delay }}
    >
      {children}
    </Tag>
  );
}
