// ═══════════════════════════════════════════════════════════════
// User App — Pulse Summary Strip
// Compact daily pulse overview for user app header
// ═══════════════════════════════════════════════════════════════

import { Activity, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PulseSummaryStripProps {
  alertCount?: number;
  pendingApprovals?: number;
  portfolioChange?: number;
}

export function PulseSummaryStrip({
  alertCount = 0,
  pendingApprovals = 0,
  portfolioChange = 0,
}: PulseSummaryStripProps) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {alertCount > 0 && (
        <span className="flex items-center gap-1 text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          {alertCount} alert{alertCount > 1 ? "s" : ""}
        </span>
      )}
      {pendingApprovals > 0 && (
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-blue-400" />
          {pendingApprovals} pending
        </span>
      )}
      <span className="flex items-center gap-1">
        <TrendingUp className={`h-3 w-3 ${portfolioChange >= 0 ? "text-emerald-400" : "text-destructive"}`} />
        {portfolioChange >= 0 ? "+" : ""}{portfolioChange.toFixed(1)}%
      </span>
      <span className="flex items-center gap-1">
        <Activity className="h-3 w-3 text-primary/60" />
        All systems normal
      </span>
    </div>
  );
}
