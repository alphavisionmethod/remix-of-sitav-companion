// ═══════════════════════════════════════════════════════════════
// SITA OS — Why This Result Indicator
// Result reasoning indicator for search results
// Shows why a result was surfaced (recency, relevance, advisor)
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Info, Clock, Star, Sparkles, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";

export type ResultReason = "recent" | "frequent" | "advisor-suggested" | "high-relevance" | "trust-related" | "urgent";

interface WhyThisResultProps {
  reasons: ResultReason[];
  className?: string;
  compact?: boolean;
}

const REASON_META: Record<ResultReason, { icon: typeof Info; label: string; color: string }> = {
  recent: { icon: Clock, label: "Recently accessed", color: "text-muted-foreground" },
  frequent: { icon: TrendingUp, label: "Frequently used", color: "text-muted-foreground" },
  "advisor-suggested": { icon: Sparkles, label: "Advisor suggestion", color: "text-primary" },
  "high-relevance": { icon: Star, label: "High relevance to query", color: "text-[hsl(var(--sita-gold))]" },
  "trust-related": { icon: Shield, label: "Trust-sensitive action", color: "text-[hsl(var(--trust-safe))]" },
  urgent: { icon: Info, label: "Requires attention", color: "text-destructive" },
};

export function WhyThisResult({ reasons, className, compact = true }: WhyThisResultProps) {
  const [expanded, setExpanded] = useState(false);

  if (reasons.length === 0) return null;

  const primary = REASON_META[reasons[0]];
  const PrimaryIcon = primary.icon;

  if (compact && !expanded) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
        className={cn("flex items-center gap-1 text-[9px] opacity-60 hover:opacity-100 transition-opacity", primary.color, className)}
        title="Why this result?"
      >
        <PrimaryIcon className="h-2.5 w-2.5" />
        <span>{primary.label}</span>
      </button>
    );
  }

  return (
    <div
      className={cn("rounded-md bg-muted/40 border border-border/20 p-2 space-y-1", className)}
      onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
    >
      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Why this result</p>
      {reasons.map(reason => {
        const meta = REASON_META[reason];
        const Icon = meta.icon;
        return (
          <div key={reason} className={cn("flex items-center gap-1.5 text-[10px]", meta.color)}>
            <Icon className="h-2.5 w-2.5" />
            <span>{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}
