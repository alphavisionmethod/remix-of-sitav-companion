// ═══════════════════════════════════════════════════════════════
// SITA OS — Outcome Progress
// Outcome-centered progress visualization with blockers and
// recommended next actions
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Target, ArrowRight, AlertTriangle, CheckCircle, Zap, TrendingUp } from "lucide-react";

interface OutcomeProgressProps {
  title: string;
  description?: string;
  progress: number; // 0-100
  blockers?: string[];
  nextAction?: string;
  impact?: "high" | "medium" | "low";
  domain?: "business" | "money" | "concierge" | "cross-domain";
  className?: string;
}

const DOMAIN_ACCENT: Record<string, string> = {
  business: "hsl(var(--primary))",
  money: "hsl(var(--sita-gold))",
  concierge: "hsl(var(--trust-safe))",
  "cross-domain": "hsl(var(--state-proposed))",
};

export const OutcomeProgress = ({
  title, description, progress, blockers, nextAction, impact = "medium", domain = "business", className,
}: OutcomeProgressProps) => {
  const clamped = Math.max(0, Math.min(100, progress));
  const accentColor = DOMAIN_ACCENT[domain] || DOMAIN_ACCENT.business;
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 card-hover-lift", className)}>
      <div className="flex items-start gap-4">
        {/* Progress ring */}
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
            <circle cx="44" cy="44" r="38" stroke="hsl(var(--secondary))" strokeWidth="5" fill="none" />
            <motion.circle
              cx="44" cy="44" r="38"
              stroke={accentColor}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-lg font-bold tabular-nums text-foreground">{clamped}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: accentColor }} />
            <h3 className="text-sm font-bold text-foreground truncate">{title}</h3>
            {impact === "high" && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[hsl(var(--sita-gold)/0.1)] px-1.5 py-px text-[9px] font-semibold text-[hsl(var(--sita-gold))] uppercase tracking-wider">
                <TrendingUp className="h-2.5 w-2.5" /> High Impact
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}

          {/* Blockers */}
          {blockers && blockers.length > 0 && (
            <div className="mt-2.5 space-y-1">
              {blockers.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="h-3 w-3 text-[hsl(var(--trust-review))] flex-shrink-0" />
                  <span className="text-muted-foreground">{b}</span>
                </div>
              ))}
            </div>
          )}

          {/* Next action */}
          {nextAction && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.1)] px-3 py-2">
              <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))] flex-shrink-0" />
              <span className="text-[11px] font-medium text-foreground flex-1">{nextAction}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Compact outcome row for lists */
export const OutcomeRow = ({
  title, progress, nextAction, domain = "business", className,
}: Pick<OutcomeProgressProps, "title" | "progress" | "nextAction" | "domain" | "className">) => {
  const accentColor = DOMAIN_ACCENT[domain] || DOMAIN_ACCENT.business;

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 card-hover-lift", className)}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Target className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentColor }} />
        <span className="text-xs font-semibold text-foreground truncate">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full bg-secondary/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: accentColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-muted-foreground w-7 text-right">{progress}%</span>
      </div>
      {nextAction && (
        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{nextAction}</span>
      )}
    </div>
  );
};
