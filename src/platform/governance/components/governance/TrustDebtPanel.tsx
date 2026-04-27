// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Debt Panel
// Real-time trust debt ledger with severity breakdown, aging,
// and remediation tracking. All data from TrustDebtEngine.
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaMetric } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTrustDebtLedger, useTrustDebtTrend } from "@/platform/governance/hooks/use-meta-governance";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrustDebtRecord, AgingTier, TrustDimension } from "@/packages/contracts";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-urgency-critical bg-urgency-critical/10 border-urgency-critical/30",
  high: "text-urgency-high bg-urgency-high/10 border-urgency-high/30",
  medium: "text-accent bg-accent/10 border-accent/30",
  low: "text-muted-foreground bg-muted/50 border-border",
};

const AGING_COLORS: Record<AgingTier, string> = {
  fresh: "text-trust-safe",
  aging: "text-accent",
  stale: "text-urgency-high",
  critical: "text-urgency-critical",
};

const DIMENSION_LABELS: Record<TrustDimension, string> = {
  policyCompliance: "Policy Compliance",
  proofCompleteness: "Proof Completeness",
  verificationHealth: "Verification Health",
  rollbackReadiness: "Rollback Readiness",
  memoryIntegrity: "Memory Integrity",
  connectorHealth: "Connector Health",
  advisorGovernance: "Advisor Governance",
};

const SeverityBar = ({ label, count, total }: { label: string; count: number; total: number }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground capitalize">{label}</span>
      <span className="font-mono font-semibold text-foreground">{count}</span>
    </div>
    <Progress value={total > 0 ? (count / total) * 100 : 0} className="h-1.5" />
  </div>
);

const DebtRow = ({ record }: { record: TrustDebtRecord }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-start gap-3 rounded-lg border border-border p-3 hover:border-primary/20 transition-colors"
  >
    <div className={cn("mt-0.5 rounded-full p-1", SEVERITY_COLORS[record.severity])}>
      {record.severity === "critical" ? <XCircle className="h-3.5 w-3.5" /> :
       record.severity === "high" ? <AlertTriangle className="h-3.5 w-3.5" /> :
       <Shield className="h-3.5 w-3.5" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm font-medium text-foreground truncate">{record.description}</p>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {record.category.replace(/_/g, " ")}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className={AGING_COLORS[record.aging.tier]}>{record.aging.tier}</span>
        </span>
        <span>{DIMENSION_LABELS[record.trustDimension]}</span>
        <span className="capitalize">{record.remediationStatus.replace(/_/g, " ")}</span>
      </div>
    </div>
    <div className="flex items-center gap-1 text-xs shrink-0">
      {record.trend === "improving" ? <TrendingDown className="h-3 w-3 text-trust-safe" /> :
       record.trend === "degrading" ? <TrendingUp className="h-3 w-3 text-urgency-high" /> : null}
    </div>
  </motion.div>
);

export function TrustDebtPanel() {
  const { ledger, unresolvedCounts, debtScore, boardroomSection } = useTrustDebtLedger();
  const trend = useTrustDebtTrend();

  const totalUnresolved = Object.values(unresolvedCounts).reduce((s, v) => s + v, 0);
  const sorted = [...ledger].sort((a, b) => {
    const sev = { critical: 4, high: 3, medium: 2, low: 1 };
    return (sev[b.severity] || 0) - (sev[a.severity] || 0);
  });

  return (
    <SitaCard hover={false} className="space-y-4">
      <div className="flex items-center justify-between">
        <SitaCardTitle sub="Evidence-backed trust gaps requiring remediation">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Trust Debt Ledger
          </span>
        </SitaCardTitle>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-mono",
            boardroomSection.severity === "critical" ? "border-urgency-critical/40 text-urgency-critical" :
            boardroomSection.severity === "warning" ? "border-accent/40 text-accent" :
            "border-trust-safe/40 text-trust-safe"
          )}
        >
          Score: {(debtScore * 100).toFixed(0)}
        </Badge>
      </div>

      {/* Severity breakdown */}
      <div className="grid grid-cols-4 gap-3">
        <SeverityBar label="Critical" count={unresolvedCounts.critical || 0} total={totalUnresolved || 1} />
        <SeverityBar label="High" count={unresolvedCounts.high || 0} total={totalUnresolved || 1} />
        <SeverityBar label="Medium" count={unresolvedCounts.medium || 0} total={totalUnresolved || 1} />
        <SeverityBar label="Low" count={unresolvedCounts.low || 0} total={totalUnresolved || 1} />
      </div>

      {/* Trend indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>7-day trend:</span>
        <span className={cn(
          "font-semibold",
          trend.direction === "improving" ? "text-trust-safe" :
          trend.direction === "degrading" ? "text-urgency-high" : "text-muted-foreground"
        )}>
          {trend.direction} ({trend.changePercent > 0 ? "+" : ""}{trend.changePercent.toFixed(1)}%)
        </span>
      </div>

      {/* Debt entries */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-trust-safe" />
            No active trust debt
          </div>
        ) : (
          sorted.slice(0, 10).map(r => <DebtRow key={r.id} record={r} />)
        )}
      </div>

      {sorted.length > 10 && (
        <p className="text-xs text-muted-foreground text-center">
          +{sorted.length - 10} more entries
        </p>
      )}
    </SitaCard>
  );
}

export default TrustDebtPanel;
