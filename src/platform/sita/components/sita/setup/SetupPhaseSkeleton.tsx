// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Phase Skeleton (transition placeholder)
// Premium skeleton state shown between phase changes
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SetupPhaseSkeletonProps {
  className?: string;
}

export function SetupPhaseSkeleton({ className }: SetupPhaseSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("w-full max-w-4xl mx-auto space-y-6", className)}
    >
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary/40 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded-md bg-secondary/30 animate-pulse" />
            <div className="h-3 w-72 rounded-md bg-secondary/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-xl border border-border/30 bg-card/30 p-4 space-y-3"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-4 w-32 rounded-md bg-secondary/30 animate-pulse" />
              <div className="h-3 w-full rounded-md bg-secondary/20 animate-pulse" />
              <div className="h-3 w-3/4 rounded-md bg-secondary/15 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border/30 bg-card/30 p-4 space-y-3">
            <div className="h-4 w-24 rounded-md bg-secondary/30 animate-pulse" />
            <div className="h-20 w-full rounded-md bg-secondary/15 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
