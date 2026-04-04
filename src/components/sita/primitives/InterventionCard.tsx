// ═══════════════════════════════════════════════════════════════
// SITA OS — Intervention Card
// "One action that helps across modules" — cross-domain action
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, Clock, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type InterventionUrgency = "now" | "today" | "this-week" | "when-ready";

interface InterventionCardProps {
  title: string;
  description: string;
  impact: string;
  affectedDomains: string[];
  urgency: InterventionUrgency;
  effort: "quick" | "moderate" | "significant";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const URGENCY_STYLES: Record<InterventionUrgency, { label: string; color: string; bg: string }> = {
  now: { label: "Do Now", color: "text-destructive", bg: "bg-destructive/8" },
  today: { label: "Today", color: "text-[hsl(var(--sita-gold))]", bg: "bg-[hsl(var(--sita-gold)/0.08)]" },
  "this-week": { label: "This Week", color: "text-[hsl(var(--state-proposed))]", bg: "bg-[hsl(var(--state-proposed)/0.08)]" },
  "when-ready": { label: "When Ready", color: "text-muted-foreground", bg: "bg-secondary/40" },
};

export const InterventionCard = ({
  title, description, impact, affectedDomains, urgency, effort, actionLabel, onAction, className,
}: InterventionCardProps) => {
  const u = URGENCY_STYLES[urgency];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[hsl(var(--primary)/0.15)] bg-card p-5 card-hover-lift",
        urgency === "now" && "border-destructive/20",
        className
      )}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.4)] to-transparent" />

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
          <Sparkles className="h-4.5 w-4.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-foreground">{title}</h4>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider", u.color, u.bg)}>
              <Clock className="h-2.5 w-2.5" />
              {u.label}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>

          {/* Impact + domains */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-[11px]">
              <Zap className="h-3 w-3 text-[hsl(var(--sita-gold))]" />
              <span className="font-medium text-foreground">{impact}</span>
            </div>
            <div className="flex items-center gap-1">
              {affectedDomains.map(d => (
                <span key={d} className="rounded-full bg-secondary/60 px-1.5 py-px text-[9px] font-medium text-muted-foreground capitalize">
                  {d}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground/60">
              {effort === "quick" ? "~2 min" : effort === "moderate" ? "~10 min" : "~30+ min"}
            </span>
          </div>

          {/* Action */}
          {(actionLabel || onAction) && (
            <Button
              size="sm"
              variant="ghost"
              className="mt-3 h-7 gap-1.5 text-[11px] font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)]"
              onClick={onAction}
            >
              <ShieldCheck className="h-3 w-3" />
              {actionLabel || "Take Action"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
