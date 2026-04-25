// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding Progress (canonical primitive)
// ═══════════════════════════════════════════════════════════════
// Phase / step indicator for ceremony screens.
// Renders chapter pips + numeric position; respects semantic tokens.
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";

export interface OnboardingProgressProps {
  steps: readonly string[];
  currentIndex: number;
  variant?: "dots" | "chips";
  className?: string;
}

export function OnboardingProgress({
  steps,
  currentIndex,
  variant = "dots",
  className = "",
}: OnboardingProgressProps) {
  if (variant === "chips") {
    return (
      <div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 text-[10px] text-muted-foreground ${className}`}>
        {steps.map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`p-2.5 rounded-lg border ${
              i === currentIndex
                ? "bg-primary/10 border-primary/30 text-foreground"
                : i < currentIndex
                  ? "bg-card/70 border-border/40 text-foreground/70"
                  : "bg-card/40 border-border/30"
            }`}
          >
            <span className="text-primary font-semibold">{i + 1}.</span> {label}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {steps.map((label, i) => (
        <div
          key={label}
          aria-label={label}
          className={`h-1.5 rounded-full transition-all ${
            i === currentIndex
              ? "w-6 bg-primary"
              : i < currentIndex
                ? "w-3 bg-primary/60"
                : "w-3 bg-muted"
          }`}
        />
      ))}
      <span className="ml-2 text-[10px] text-muted-foreground tabular-nums">
        {currentIndex + 1} / {steps.length}
      </span>
    </div>
  );
}

export default OnboardingProgress;
