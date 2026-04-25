// ═══════════════════════════════════════════════════════════════
// SITA OS — Dock Window Preview (W1)
// Mini live preview tooltip when hovering running app icons
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DockWindowPreviewProps {
  title: string;
  appIcon?: string;
  x: number;
  y: number;
}

export function DockWindowPreview({ title, appIcon, x, y }: DockWindowPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "fixed z-[200] pointer-events-none",
        "w-48 rounded-xl overflow-hidden",
        "bg-[hsl(0_0%_100%/0.75)] dark:bg-[hsl(0_0%_0%/0.70)]",
        "backdrop-blur-2xl",
        "border border-[hsl(0_0%_100%/0.25)] dark:border-[hsl(0_0%_100%/0.10)]",
        "shadow-[0_2px_6px_hsl(0_0%_0%/0.08),0_16px_32px_hsl(0_0%_0%/0.15)]"
      )}
      style={{ left: x - 96, bottom: y + 8 }}
    >
      {/* Mini title bar */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)]">
        {appIcon && <span className="text-[10px]">{appIcon}</span>}
        <span className="text-[10px] font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_85%)] truncate">
          {title}
        </span>
      </div>
      {/* Preview content placeholder */}
      <div className="p-2 space-y-1">
        <div className="h-2 w-3/4 rounded-full bg-[hsl(0_0%_50%/0.12)]" />
        <div className="h-2 w-full rounded-full bg-[hsl(0_0%_50%/0.08)]" />
        <div className="h-2 w-1/2 rounded-full bg-[hsl(0_0%_50%/0.08)]" />
        <div className="h-8 w-full rounded-lg bg-[hsl(0_0%_50%/0.05)] mt-1" />
      </div>
    </motion.div>
  );
}
