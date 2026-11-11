import type { Transition, Variants } from 'motion/react';

// Global easing constants
// Hero cube bezier: cubic-bezier(1, 0, 0.31, 1.39) — elastic overshoot
export const EASE_OVERSHOOT: [number, number, number, number] = [1, 0, 0.31, 1.39];

// Softer expo-out for everyday UI
export const EASE_SOFT: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Transition presets
export const transitions: Record<string, Transition> = {
  appear: {
    duration: 1.0,
    ease: EASE_SOFT,
  },
  hover: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },
  buttonHover: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
  },
  stagger: {
    staggerChildren: 0.08,
    delayChildren: 0.15,
  },
  heroEntrance: {
    duration: 1.2,
    ease: EASE_SOFT,
  },
};

// Animation variants
export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  staggerContainer: {
    hidden: {},
    visible: {
      transition: transitions.stagger,
    },
  },
} as const;
