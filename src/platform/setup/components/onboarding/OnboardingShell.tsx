// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding Shell (canonical primitive)
// ═══════════════════════════════════════════════════════════════
// Page chrome wrapper for any onboarding ceremony screen.
// Provides consistent max-width, vertical rhythm, and optional
// right-side reveal panel slot. Pure layout — no business logic.
// ═══════════════════════════════════════════════════════════════

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export interface OnboardingShellProps {
  children: ReactNode;
  rightPanel?: ReactNode;
  density?: "compact" | "comfortable";
  className?: string;
}

export function OnboardingShell({
  children,
  rightPanel,
  density = "comfortable",
  className = "",
}: OnboardingShellProps) {
  const spacing = density === "compact" ? "space-y-4" : "space-y-6";

  if (rightPanel) {
    return (
      <div className={`grid lg:grid-cols-[1fr_320px] gap-8 ${className}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={spacing}
        >
          {children}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="sticky top-8 space-y-4">{rightPanel}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`${spacing} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default OnboardingShell;
