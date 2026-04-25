// ═══════════════════════════════════════════════════════════════
// SITA OS — Continuation After Restart View
// Premium resume banner shown after interruption/restart/reboot
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { RotateCcw, ArrowRight, Trash2 } from "lucide-react";

interface ContinuationAfterRestartViewProps {
  /** Display name of the user, if available */
  displayName?: string;
  /** Which phase they were on */
  lastPhaseName?: string;
  /** Percentage progress */
  progressPercent?: number;
  /** Resume from where they left off */
  onResume: () => void;
  /** Start over from scratch */
  onRestart: () => void;
}

export function ContinuationAfterRestartView({
  displayName,
  lastPhaseName,
  progressPercent,
  onResume,
  onRestart,
}: ContinuationAfterRestartViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-lg"
    >
      <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl px-6 py-4 shadow-2xl shadow-primary/10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 shrink-0">
          <RotateCcw className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {displayName ? `Welcome back, ${displayName}` : "Welcome back"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {lastPhaseName
              ? `Continue from "${lastPhaseName}"${progressPercent ? ` · ${progressPercent}% complete` : ""}`
              : "Continue where you left off?"}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={onRestart}
            className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5"
            aria-label="Start over"
          >
            <Trash2 className="h-3 w-3" />
            Start Over
          </button>
          <button
            onClick={onResume}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            Continue
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
