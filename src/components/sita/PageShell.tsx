// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Shell
// Lightweight wrapper for standalone pages not inside DomainAppShell.
// Enforces consistent max-width, padding, spacing, and entrance animation.
// ═══════════════════════════════════════════════════════════════

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type PageWidth = "narrow" | "standard" | "wide" | "full";

const WIDTH_MAP: Record<PageWidth, string> = {
  narrow: "max-w-3xl",
  standard: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-[1400px]",
};

interface PageShellProps {
  children: ReactNode;
  width?: PageWidth;
  className?: string;
  /** Skip entrance animation */
  instant?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const PageShell = ({ children, width = "wide", className, instant }: PageShellProps) => {
  if (instant) {
    return (
      <div className={cn("mx-auto space-y-6 p-4 md:p-6", WIDTH_MAP[width], className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("mx-auto space-y-6 p-4 md:p-6", WIDTH_MAP[width], className)}
    >
      {children}
    </motion.div>
  );
};

/** Animated section for stagger entrance */
export const PageSection = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 16 } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);