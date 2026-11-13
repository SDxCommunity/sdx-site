'use client'

import { m, useInView } from 'motion/react';
import { useRef, useContext, useState, useEffect } from 'react';
import { TransitionPhaseContext } from '../PageTransition';

interface MotionGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export default function MotionGrid({
  children,
  className,
  staggerDelay = 0.06,
}: MotionGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '100px 0px -50px 0px' });
  const phase = useContext(TransitionPhaseContext);
  const [locked, setLocked] = useState(false);

  // Latch: once visible, stay visible forever
  useEffect(() => {
    if (isInView && phase !== 'cover' && !locked) {
      setLocked(true);
    }
  }, [isInView, phase, locked]);

  return (
    <m.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={locked ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0,
          },
        },
      }}
    >
      {children}
    </m.div>
  );
}
