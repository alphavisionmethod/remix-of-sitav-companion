// ═══════════════════════════════════════════════════════════════
// SITA OS — PageTransition
// Universal route transition wrapper using AnimatePresence
// ═══════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// ── Transition presets ────────────────────────────────────────

const DRILL_DOWN_SEGMENTS = new Set(["mission", "owner", "business", "money", "concierge", "admin", "revenue-office"]);

function getTransitionVariants(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const root = segments[0] || "home";
  const depth = segments.length;

  // Drill-down sub-page: slide in from right
  if (depth > 1 && DRILL_DOWN_SEGMENTS.has(root)) {
    return {
      initial: { opacity: 0, x: 24, scale: 0.98, filter: "blur(6px)" },
      animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
      exit: { opacity: 0, x: -16, scale: 0.99, filter: "blur(3px)" },
      transition: { type: "spring" as const, mass: 0.6, stiffness: 140, damping: 18 },
    };
  }

  // Top-level: scale + fade
  return {
    initial: { opacity: 0, y: 12, scale: 0.97, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: -6, scale: 0.99, filter: "blur(4px)" },
    transition: { type: "spring" as const, mass: 0.5, stiffness: 130, damping: 17 },
  };
}

// Reduced-motion fallback: simple opacity fade
const REDUCED_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

// ── Component ─────────────────────────────────────────────────

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  /** Override the location key used for AnimatePresence (default: pathname) */
  transitionKey?: string;
}

export function PageTransition({ children, className, transitionKey }: PageTransitionProps) {
  const location = useLocation();
  const reduced = useReducedMotion();
  const key = transitionKey ?? location.pathname;
  const variants = reduced ? REDUCED_MOTION : getTransitionVariants(location.pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={variants.transition}
        className={cn("p-3 sm:p-4 md:p-6", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
