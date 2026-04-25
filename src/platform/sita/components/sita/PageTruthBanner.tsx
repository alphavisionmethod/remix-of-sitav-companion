// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Truth Banner
// Elegant inline truth indicator: Demo / Live / Partial / Connecting
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Radio, AlertTriangle, Loader2 } from "lucide-react";

type TruthState = "demo" | "live" | "partial" | "connecting" | "degraded";

interface PageTruthBannerProps {
  /** Override auto-detected truth state */
  truthState?: TruthState;
  /** Optional freshness label */
  freshness?: string;
  className?: string;
}

const TRUTH_CONFIG: Record<TruthState, { icon: typeof Database; label: string; color: string; bg: string }> = {
  demo: {
    icon: Database,
    label: "Demo Data",
    color: "text-[hsl(265_55%_68%)]",
    bg: "bg-[hsl(265_55%_58%/0.08)] border-[hsl(265_55%_58%/0.15)]",
  },
  live: {
    icon: Radio,
    label: "Live",
    color: "text-[hsl(152_55%_48%)]",
    bg: "bg-[hsl(152_55%_48%/0.08)] border-[hsl(152_55%_48%/0.15)]",
  },
  partial: {
    icon: AlertTriangle,
    label: "Partial Data",
    color: "text-[hsl(38_85%_58%)]",
    bg: "bg-[hsl(38_85%_58%/0.08)] border-[hsl(38_85%_58%/0.15)]",
  },
  connecting: {
    icon: Loader2,
    label: "Connecting…",
    color: "text-[hsl(210_60%_60%)]",
    bg: "bg-[hsl(210_60%_60%/0.08)] border-[hsl(210_60%_60%/0.15)]",
  },
  degraded: {
    icon: AlertTriangle,
    label: "Degraded",
    color: "text-[hsl(0_70%_60%)]",
    bg: "bg-[hsl(0_70%_55%/0.08)] border-[hsl(0_70%_55%/0.15)]",
  },
};

export function PageTruthBanner({ truthState, freshness, className }: PageTruthBannerProps) {
  const ctx = useRealityModeSafe();
  const state: TruthState = truthState || (ctx.isDemo ? "demo" : "live");
  const config = TRUTH_CONFIG[state];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium tracking-wide",
          config.bg,
          config.color,
          className
        )}
      >
        <Icon className={cn("h-3 w-3", state === "connecting" && "animate-spin")} />
        <span>{config.label}</span>
        {freshness && (
          <>
            <span className="text-[hsl(0_0%_40%)]">·</span>
            <span className="text-[hsl(0_0%_50%)]">{freshness}</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
