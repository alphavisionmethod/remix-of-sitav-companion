// ═══════════════════════════════════════════════════════════════
// SITA OS — Intent Interpretation Ribbon
// Subtle interpretation line in command surface
// Shows "searching contacts," "preparing action preview," etc.
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Search, Sparkles, Target, FileText, Shield, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type IntentMode = "idle" | "searching" | "interpreting" | "action" | "capture" | "simulation" | "approval";

interface IntentRibbonProps {
  mode: IntentMode;
  query?: string;
  className?: string;
}

const INTENT_META: Record<IntentMode, { icon: typeof Search; label: string; color: string } | null> = {
  idle: null,
  searching: { icon: Search, label: "Searching across your environment…", color: "text-muted-foreground" },
  interpreting: { icon: Sparkles, label: "Interpreting intent…", color: "text-primary" },
  action: { icon: Zap, label: "Preparing action preview…", color: "text-[hsl(var(--trust-safe))]" },
  capture: { icon: FileText, label: "Ready to capture…", color: "text-[hsl(var(--sita-gold))]" },
  simulation: { icon: Target, label: "Preparing simulation…", color: "text-primary" },
  approval: { icon: Shield, label: "Approval context loading…", color: "text-[hsl(var(--sita-gold))]" },
};

function getIntentFromQuery(query: string): IntentMode {
  if (!query.trim()) return "idle";
  const q = query.toLowerCase().trim();
  if (/^(note:|task:|remind|todo:)/.test(q)) return "capture";
  if (/^(simulate|what if|preview)/.test(q)) return "simulation";
  if (/^(approve|deny|review approval)/.test(q)) return "approval";
  if (/^(create|add|new|start|launch|schedule|send|draft|upload|set)/.test(q)) return "action";
  return "searching";
}

export function IntentRibbon({ mode, query, className }: IntentRibbonProps) {
  const resolvedMode = mode === "idle" && query ? getIntentFromQuery(query) : mode;
  const meta = INTENT_META[resolvedMode];

  if (!meta) return null;

  const Icon = meta.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={resolvedMode}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className={cn("flex items-center gap-2 px-3 py-1.5 text-[11px]", meta.color, className)}
      >
        {resolvedMode === "searching" || resolvedMode === "interpreting" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        <span className="font-medium">{meta.label}</span>
      </motion.div>
    </AnimatePresence>
  );
}
