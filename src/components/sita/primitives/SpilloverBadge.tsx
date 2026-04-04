// ═══════════════════════════════════════════════════════════════
// SITA OS — Spillover Badge
// Shows cross-domain impact: life → business, money → family, etc.
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { ArrowRight, AlertTriangle, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SpilloverDomain = "business" | "money" | "concierge" | "household" | "health";

const DOMAIN_COLORS: Record<SpilloverDomain, string> = {
  business: "text-[hsl(var(--primary))]",
  money: "text-[hsl(var(--sita-gold))]",
  concierge: "text-[hsl(var(--trust-safe))]",
  household: "text-[hsl(var(--state-proposed))]",
  health: "text-[hsl(var(--trust-review))]",
};

const DOMAIN_BG: Record<SpilloverDomain, string> = {
  business: "bg-[hsl(var(--primary)/0.08)]",
  money: "bg-[hsl(var(--sita-gold)/0.08)]",
  concierge: "bg-[hsl(var(--trust-safe)/0.08)]",
  household: "bg-[hsl(var(--state-proposed)/0.08)]",
  health: "bg-[hsl(var(--trust-review)/0.08)]",
};

interface SpilloverBadgeProps {
  from: SpilloverDomain;
  to: SpilloverDomain;
  impact: "low" | "medium" | "high";
  description?: string;
  className?: string;
}

export const SpilloverBadge = ({ from, to, impact, description, className }: SpilloverBadgeProps) => {
  const impactColor = impact === "high" ? "text-destructive" : impact === "medium" ? "text-[hsl(var(--trust-review))]" : "text-muted-foreground";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-medium",
            DOMAIN_BG[from], className
          )}>
            {impact === "high" && <AlertTriangle className="h-2.5 w-2.5 text-destructive" />}
            <span className={cn("capitalize", DOMAIN_COLORS[from])}>{from}</span>
            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50" />
            <span className={cn("capitalize", DOMAIN_COLORS[to])}>{to}</span>
            <span className={cn("ml-0.5", impactColor)}>
              {impact === "high" ? "⚠" : impact === "medium" ? "•" : "○"}
            </span>
          </span>
        </TooltipTrigger>
        {description && (
          <TooltipContent>
            <p className="text-xs max-w-[200px]">{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

/** Full spillover card for dashboards */
interface SpilloverCardProps {
  from: SpilloverDomain;
  to: SpilloverDomain;
  impact: "low" | "medium" | "high";
  title: string;
  description: string;
  intervention?: string;
  className?: string;
}

export const SpilloverCard = ({ from, to, impact, title, description, intervention, className }: SpilloverCardProps) => {
  const impactBorder = impact === "high"
    ? "border-destructive/20"
    : impact === "medium"
      ? "border-[hsl(var(--trust-review)/0.2)]"
      : "border-border";

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 card-hover-lift",
      impactBorder, className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2">
            <SpilloverBadge from={from} to={to} impact={impact} />
          </div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <TrendingDown className={cn(
          "h-5 w-5 ml-3",
          impact === "high" ? "text-destructive" : "text-muted-foreground/40"
        )} />
      </div>
      {intervention && (
        <div className="mt-3 rounded-lg bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.12)] p-2.5">
          <p className="text-[11px] font-medium text-[hsl(var(--primary))]">Recommended intervention</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{intervention}</p>
        </div>
      )}
    </div>
  );
};
