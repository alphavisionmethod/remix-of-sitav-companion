// ═══════════════════════════════════════════════════════════════
// SITA OS — Microinteraction Engine Package
// Complete animation system for premium OS feel
// ═══════════════════════════════════════════════════════════════

import type { Transition, Variants } from "framer-motion";

export type InteractionType = "enter" | "exit" | "hover" | "press" | "drag" | "focus" | "success" | "error" | "loading";

export interface MicroInteraction {
  id: string;
  type: InteractionType;
  variants: Variants;
  transition: Transition;
}

// ── Timing Constants ─────────────────────────────────────────

export const TIMING = {
  instant: 50,
  fast: 150,
  normal: 250,
  slow: 400,
  dramatic: 600,
  // Specific interaction timings
  hover: 80,
  click: 120,
  menuOpen: 180,
  windowOpen: 280,
  windowClose: 220,
  modalPresent: 300,
  toastEnter: 250,
} as const;

// ── Easing Presets ───────────────────────────────────────────

export const EASING = {
  smooth: [0.25, 0.1, 0.25, 1.0] as const,
  snappy: [0.2, 0.0, 0.0, 1.0] as const,
  bounce: [0.34, 1.56, 0.64, 1.0] as const,
  decelerate: [0.0, 0.0, 0.2, 1.0] as const,
  accelerate: [0.4, 0.0, 1.0, 1.0] as const,
  sharp: [0.4, 0.0, 0.6, 1.0] as const,
} as const;

// ── Premium Spring Presets ───────────────────────────────────

export const springs = {
  gentle: { type: "spring" as const, damping: 25, stiffness: 200 },
  snappy: { type: "spring" as const, damping: 20, stiffness: 300 },
  bouncy: { type: "spring" as const, damping: 15, stiffness: 400 },
  stiff: { type: "spring" as const, damping: 30, stiffness: 500 },
  window: { type: "spring" as const, damping: 28, stiffness: 350 },
  dock: { type: "spring" as const, damping: 18, stiffness: 450 },
  modal: { type: "spring" as const, damping: 26, stiffness: 280 },
} as const;

// ── Card Interactions ────────────────────────────────────────

export const cardVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
  hover: { y: -2, boxShadow: "0 8px 30px -12px hsl(265 55% 58% / 0.2)" },
  tap: { scale: 0.98 },
};

// ── Page Transitions ─────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export const pageTransition: Transition = { duration: TIMING.normal / 1000, ease: EASING.smooth as unknown as number[] };

// ── Stagger Children ─────────────────────────────────────────

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// ── Panel Slide ──────────────────────────────────────────────

export const panelSlide: Variants = {
  initial: { x: "100%", opacity: 0.8 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0.5 },
};

// ── Notification Pop ─────────────────────────────────────────

export const notificationPop: Variants = {
  initial: { opacity: 0, scale: 0.8, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: -10 },
};

// ── Trust State Pulse ────────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════
// WINDOW ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const windowOpen: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
};

export const windowClose: Variants = {
  animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.95, y: 6, filter: "blur(2px)" },
};

export const windowMinimize: Variants = {
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.5, y: 100 },
};

export const windowMaximize: Variants = {
  initial: { borderRadius: 12 },
  animate: { borderRadius: 0 },
};

export const windowTransition: Transition = { ...springs.window, duration: TIMING.windowOpen / 1000 };

// ═══════════════════════════════════════════════════════════════
// MENU ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const menuOpen: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
};

export const menuItemHover: Variants = {
  initial: { backgroundColor: "transparent" },
  hover: { backgroundColor: "hsl(265 55% 58% / 0.08)" },
};

export const menuTransition: Transition = { duration: TIMING.menuOpen / 1000, ease: EASING.snappy as unknown as number[] };

// ═══════════════════════════════════════════════════════════════
// DOCK ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const dockBounce: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -16, 0, -8, 0, -3, 0],
    transition: { duration: 0.8, times: [0, 0.2, 0.4, 0.55, 0.7, 0.85, 1] },
  },
};

export const dockMagnify: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.3, y: -6 },
};

export const dockLaunch: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: { duration: 0.6, repeat: 2, ease: "easeInOut" },
  },
};

export const dockTransition: Transition = springs.dock;

// ═══════════════════════════════════════════════════════════════
// MODAL ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const modalPresent: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalTransition: Transition = { ...springs.modal, duration: TIMING.modalPresent / 1000 };

// ═══════════════════════════════════════════════════════════════
// TOAST ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const toastEnter: Variants = {
  initial: { opacity: 0, x: 50, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
};

export const toastExit: Variants = {
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 80, scale: 0.9 },
};

export const toastTransition: Transition = { ...springs.snappy, duration: TIMING.toastEnter / 1000 };

// ═══════════════════════════════════════════════════════════════
// STATE TRANSITIONS
// ═══════════════════════════════════════════════════════════════

export const successPulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0px hsl(152 55% 48% / 0)",
      "0 0 0 6px hsl(152 55% 48% / 0.2)",
      "0 0 0 0px hsl(152 55% 48% / 0)",
    ],
    transition: { duration: 0.6 },
  },
};

export const errorShake: Variants = {
  animate: {
    x: [0, -6, 6, -4, 4, -2, 0],
    transition: { duration: 0.4 },
  },
};

export const loadingBreath: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [0.98, 1, 0.98],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

// ═══════════════════════════════════════════════════════════════
// GESTURE FEEDBACK
// ═══════════════════════════════════════════════════════════════

export const dragPickup: Variants = {
  initial: { scale: 1, boxShadow: "0 0 0 0px hsl(265 55% 58% / 0)" },
  drag: { scale: 1.03, boxShadow: "0 12px 40px -8px hsl(265 55% 58% / 0.25)", zIndex: 999 },
};

export const dragDrop: Variants = {
  drag: { scale: 1.03 },
  animate: { scale: 1 },
};

export const snapFeedback: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 0.99, 1],
    transition: { duration: 0.3 },
  },
};
