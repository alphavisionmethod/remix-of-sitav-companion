// ═══════════════════════════════════════════════════════════════
// SITA OS — Progressive Confidence Indicator
// Subtle indicator showing the system's "understanding" of the user.
// Levels: basic → forming → understanding → ready
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export type ConfidenceLevel = "basic" | "forming" | "understanding" | "ready";

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  className?: string;
  /** Show expanded label (default: false — shows compact dot + label) */
  expanded?: boolean;
}

const LEVEL_CONFIG: Record<ConfidenceLevel, {
  label: string;
  shortLabel: string;
  fill: number; // 0-100
  color: string;
  pulseColor: string;
}> = {
  basic:         { label: "Environment: Basic",         shortLabel: "Basic",         fill: 15,  color: "bg-muted-foreground/40",  pulseColor: "bg-muted-foreground/20" },
  forming:       { label: "Environment: Forming",       shortLabel: "Forming",       fill: 40,  color: "bg-primary/50",           pulseColor: "bg-primary/25" },
  understanding: { label: "Environment: Understanding", shortLabel: "Understanding", fill: 70,  color: "bg-primary/70",           pulseColor: "bg-primary/35" },
  ready:         { label: "Environment: Ready",         shortLabel: "Ready",         fill: 100, color: "bg-[hsl(var(--trust-safe))]", pulseColor: "bg-[hsl(var(--trust-safe))]/40" },
};

/**
 * Compute confidence level from phase completion data.
 */
export function computeConfidenceLevel(opts: {
  completedPhases: number;
  totalPhases: number;
  hasIdentity: boolean;
  hasWorldModel: boolean;
  hasAdvisors: boolean;
  hasConnections: boolean;
}): ConfidenceLevel {
  const ratio = opts.completedPhases / Math.max(opts.totalPhases, 1);

  if (ratio >= 0.8 && opts.hasAdvisors && opts.hasConnections) return "ready";
  if (ratio >= 0.5 && opts.hasWorldModel) return "understanding";
  if (ratio >= 0.2 && opts.hasIdentity) return "forming";
  return "basic";
}

export function ConfidenceIndicator({ level, className, expanded }: ConfidenceIndicatorProps) {
  const reduced = useReducedMotion();
  const config = LEVEL_CONFIG[level];

  if (expanded) {
    return (
      <motion.div
        initial={reduced ? {} : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex items-center gap-3", className)}
      >
        {/* Bar */}
        <div className="flex-1 h-1 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${config.fill}%` }}
            transition={{ duration: reduced ? 0 : 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn("h-full rounded-full", config.color)}
          />
        </div>
        {/* Label */}
        <span className="text-[10px] text-muted-foreground font-medium shrink-0">
          {config.shortLabel}
        </span>
      </motion.div>
    );
  }

  // Compact: dot + label
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex items-center gap-1.5", className)}
    >
      <div className="relative">
        <div className={cn("h-2 w-2 rounded-full", config.color)} />
        {level !== "basic" && !reduced && (
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn("absolute inset-0 rounded-full", config.pulseColor)}
          />
        )}
      </div>
      <span className="text-[9px] text-muted-foreground">{config.label}</span>
    </motion.div>
  );
}
