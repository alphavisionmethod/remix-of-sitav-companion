// ═══════════════════════════════════════════════════════════════
// SITA OS — ModuleAdvisorInsight
// Compact inline advisor card for module-level intelligence
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Brain, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface ModuleAdvisorInsightProps {
  advisorName: string;
  domain: "business" | "finance" | "concierge";
  insight: string;
  confidence?: number;
  actions?: { label: string; onClick: () => void }[];
  linkedItems?: string[];
  className?: string;
}

const DOMAIN_ACCENT: Record<string, string> = {
  business: "hsl(265 55% 58%)",
  finance: "hsl(152 55% 48%)",
  concierge: "hsl(285 55% 55%)",
};

export function ModuleAdvisorInsight({ advisorName, domain, insight, confidence, actions, linkedItems, className }: ModuleAdvisorInsightProps) {
  const accent = DOMAIN_ACCENT[domain] || DOMAIN_ACCENT.business;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-[hsl(0_0%_100%/0.06)] p-4 relative overflow-hidden micro-hover-lift",
        "bg-gradient-to-br from-[hsl(0_0%_10%)] to-[hsl(0_0%_8%)]",
        className
      )}
    >
      {/* Subtle accent glow */}
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ background: `radial-gradient(circle at 100% 0%, ${accent} / 0.08, transparent 70%)` }} />

      <div className="relative flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent} / 0.20, ${accent} / 0.08)` }}>
          <Brain className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-[hsl(0_0%_85%)]">{advisorName}</span>
            {confidence !== undefined && (
              <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full", confidence >= 80 ? "bg-[hsl(152_55%_48%/0.12)] text-[hsl(152_55%_48%)]" : "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)]")}>
                {confidence}%
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-[hsl(0_0%_60%)]">{insight}</p>

          {linkedItems && linkedItems.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {linkedItems.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium" style={{ background: `${accent} / 0.08`, color: accent }}>
                  <ArrowRight className="h-2 w-2" />{item}
                </span>
              ))}
            </div>
          )}

          {actions && actions.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {actions.map((action, i) => (
                <button key={i} onClick={action.onClick} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-[hsl(0_0%_100%/0.06)] hover:bg-[hsl(0_0%_100%/0.10)] text-[hsl(0_0%_75%)] transition-colors micro-press">
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
