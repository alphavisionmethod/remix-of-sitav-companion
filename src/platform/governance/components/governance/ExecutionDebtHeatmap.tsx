// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Debt Heatmap
// Visual heatmap of execution debt across workflow families
// and categories. Data from ExecutionDebtEngine.
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { useExecutionDebtLedger, useExecutionDebtHeatmap } from "@/hooks/use-meta-governance";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutionDebtCategory } from "@/packages/contracts";

const CATEGORY_LABELS: Record<ExecutionDebtCategory, string> = {
  stuck_workflow: "Stuck",
  manual_fallback: "Manual Fallback",
  operator_override: "Override",
  partial_completion: "Partial",
  connector_retry: "Retry",
  repeated_replay: "Replay",
  repeated_recovery: "Recovery",
  manual_degradation: "Degraded",
  approval_ping_pong: "Ping-Pong",
  dependency_blocking: "Blocked",
  broken_automation: "Broken Auto",
  unresolved_failure: "Unresolved",
  high_time_in_state: "Slow State",
  aging_queue: "Aging Queue",
  incident_linked_failure: "Incident",
};

function heatColor(value: number): string {
  if (value === 0) return "bg-muted/30";
  if (value <= 2) return "bg-trust-safe/20 border-trust-safe/30";
  if (value <= 5) return "bg-accent/20 border-accent/30";
  if (value <= 10) return "bg-urgency-high/20 border-urgency-high/30";
  return "bg-urgency-critical/30 border-urgency-critical/40";
}

function heatText(value: number): string {
  if (value === 0) return "text-muted-foreground/50";
  if (value <= 2) return "text-trust-safe";
  if (value <= 5) return "text-accent";
  if (value <= 10) return "text-urgency-high";
  return "text-urgency-critical";
}

export function ExecutionDebtHeatmap() {
  const { ledger, debtScore, boardroomSection } = useExecutionDebtLedger();
  const heatmap = useExecutionDebtHeatmap();

  // Build heatmap grid: workflows × categories
  const workflows = [...new Set(ledger.map(r => r.workflowFamily))].slice(0, 8);
  const categories = Object.keys(CATEGORY_LABELS) as ExecutionDebtCategory[];

  const getCellCount = (wf: string, cat: ExecutionDebtCategory) =>
    ledger.filter(r => r.workflowFamily === wf && r.category === cat).length;

  return (
    <SitaCard hover={false} className="space-y-4">
      <div className="flex items-center justify-between">
        <SitaCardTitle sub="Execution friction across workflow families">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Execution Debt Heatmap
          </span>
        </SitaCardTitle>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-mono",
            debtScore > 0.6 ? "border-urgency-critical/40 text-urgency-critical" :
            debtScore > 0.3 ? "border-accent/40 text-accent" :
            "border-trust-safe/40 text-trust-safe"
          )}
        >
          Debt: {(debtScore * 100).toFixed(0)}%
        </Badge>
      </div>

      {workflows.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-trust-safe" />
          No execution debt detected
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="flex gap-1 mb-1">
              <div className="w-24 shrink-0" />
              {categories.map(cat => (
                <Tooltip key={cat}>
                  <TooltipTrigger asChild>
                    <div className="flex-1 min-w-[32px]">
                      <p className="text-[9px] font-medium text-muted-foreground truncate text-center -rotate-45 origin-bottom-left h-12 flex items-end">
                        {CATEGORY_LABELS[cat].slice(0, 6)}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{CATEGORY_LABELS[cat]}</TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Rows */}
            {workflows.map((wf, wi) => (
              <motion.div
                key={wf}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: wi * 0.03 }}
                className="flex gap-1 mb-1"
              >
                <div className="w-24 shrink-0 flex items-center">
                  <p className="text-[10px] font-medium text-muted-foreground truncate">{wf}</p>
                </div>
                {categories.map(cat => {
                  const count = getCellCount(wf, cat);
                  return (
                    <Tooltip key={cat}>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "flex-1 min-w-[32px] h-7 rounded border flex items-center justify-center transition-colors",
                          heatColor(count)
                        )}>
                          {count > 0 && (
                            <span className={cn("text-[10px] font-mono font-bold", heatText(count))}>
                              {count}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">{wf}</p>
                        <p className="text-xs">{CATEGORY_LABELS[cat]}: {count} issues</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Heatmap summary from engine */}
      {heatmap.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {heatmap.slice(0, 5).map((h, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {h.category.replace(/_/g, " ")}: {h.count} ({h.domain})
            </Badge>
          ))}
        </div>
      )}
    </SitaCard>
  );
}

export default ExecutionDebtHeatmap;
