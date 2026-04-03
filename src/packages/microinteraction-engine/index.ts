// ═══════════════════════════════════════════════════════════════
// SITA OS — Microinteraction Engine Package
// ═══════════════════════════════════════════════════════════════

import type { Transition, Variants } from "framer-motion";

export type InteractionType = "enter" | "exit" | "hover" | "press" | "drag" | "focus" | "success" | "error" | "loading";

export interface MicroInteraction {
  id: string;
  type: InteractionType;
  variants: Variants;
  transition: Transition;
}

// Premium spring presets
export const springs = {
  gentle: { type: "spring" as const, damping: 25, stiffness: 200 },
  snappy: { type: "spring" as const, damping: 20, stiffness: 300 },
  bouncy: { type: "spring" as const, damping: 15, stiffness: 400 },
  stiff: { type: "spring" as const, damping: 30, stiffness: 500 },
} as const;

// Card interactions
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
  hover: { y: -2, boxShadow: "0 8px 30px -12px hsl(265 55% 58% / 0.2)" },
  tap: { scale: 0.98 },
};

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export const pageTransition: Transition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] };

// Stagger children
export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// Panel slide
export const panelSlide: Variants = {
  initial: { x: "100%", opacity: 0.8 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0.5 },
};

// Notification pop
export const notificationPop: Variants = {
  initial: { opacity: 0, scale: 0.8, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: -10 },
};

// Trust state pulse
export const trustPulse: Variants = {
  safe: { boxShadow: "0 0 0 0px hsl(152 55% 48% / 0)" },
  alert: {
    boxShadow: [
      "0 0 0 0px hsl(0 65% 52% / 0.3)",
      "0 0 0 8px hsl(0 65% 52% / 0)",
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};
