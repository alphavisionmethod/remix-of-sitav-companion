// ═══════════════════════════════════════════════════════════════
// Spending Category Detail Pane — Right panel for SpendingPulse
// ═══════════════════════════════════════════════════════════════

import { ArrowUpRight, ArrowDownRight, AlertTriangle, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpendingCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  thisWeek: number;
  lastWeek: number;
  average: number;
  transactions: number;
  flagged: boolean;
  flagReason?: string;
}

interface SpendingCategoryPaneProps {
  category: SpendingCategory | null;
}

export function SpendingCategoryPane({ category }: SpendingCategoryPaneProps) {
  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Select a category</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Click a spending category for detailed analysis</p>
      </div>
    );
  }

  const CatIcon = category.icon;
  const pctChange = category.average > 0 ? ((category.thisWeek - category.average) / category.average * 100) : 0;
  const weekOverWeek = category.lastWeek > 0 ? ((category.thisWeek - category.lastWeek) / category.lastWeek * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="rounded-xl border border-border/30 bg-[hsl(0_0%_100%/0.03)] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-secondary/50 p-3">
            <CatIcon className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">{category.name}</h3>
            <p className="text-xs text-muted-foreground">{category.transactions} transactions this week</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">This Week</p>
            <p className="text-2xl font-bold text-foreground">${category.thisWeek}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Week</p>
            <p className="text-2xl font-bold text-muted-foreground">${category.lastWeek}</p>
          </div>
        </div>

        {/* Trend Indicators */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">vs Last Week</span>
            <span className={cn("flex items-center gap-1 font-medium", weekOverWeek > 10 ? "text-destructive" : weekOverWeek < -5 ? "text-chart-2" : "text-foreground")}>
              {weekOverWeek > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {weekOverWeek >= 0 ? "+" : ""}{weekOverWeek.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">vs 90-day Average</span>
            <span className={cn("flex items-center gap-1 font-medium", pctChange > 15 ? "text-destructive" : pctChange < -5 ? "text-chart-2" : "text-foreground")}>
              {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(0)}% (avg ${category.average})
            </span>
          </div>
        </div>

        {/* Spending Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Spend vs Average</span>
            <span>{Math.round((category.thisWeek / Math.max(category.average, 1)) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", pctChange > 15 ? "bg-destructive" : pctChange < -5 ? "bg-chart-2" : "bg-primary")}
              style={{ width: `${Math.min(100, (category.thisWeek / Math.max(category.average, 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flag Alert */}
      {category.flagged && category.flagReason && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground">Spending Alert</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{category.flagReason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
