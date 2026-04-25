// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Financial Boundary Monitor
// ═══════════════════════════════════════════════════════════════

import { HeroCard, StatusCard } from "@/components/sita/cards";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Shield, AlertTriangle, Eye, CreditCard, ArrowLeftRight, FileQuestion, Landmark, TrendingDown } from "lucide-react";

interface BoundarySignal {
  id: string; type: string; severity: "critical" | "high" | "medium" | "low";
  title: string; description: string; amount?: number; recommendation: string;
}

const FinancialBoundaryMonitor = () => {
  const signals = useMemo<BoundarySignal[]>(() => [
    { id: "b1", type: "blur", severity: "high", title: "Household/Business Finance Blur", description: "3 transactions crossed personal/business boundaries. $1,240 unresolved.", amount: 1240, recommendation: "Classify each transaction. Enable auto-classification rules." },
    { id: "b2", type: "leakage", severity: "medium", title: "Budget Leakage — Dining", description: "Dining exceeded envelope by $180 for 3 consecutive months.", amount: 180, recommendation: "Increase dining envelope by $150/mo." },
    { id: "b3", type: "orphan", severity: "medium", title: "Orphan Obligations", description: "2 recurring charges ($45/mo, $29/mo) have no budget category.", amount: 74, recommendation: "Assign to budget categories." },
    { id: "b4", type: "purposeless", severity: "low", title: "Purposeless Money Movement", description: "3 transfers totaling $2,800 with no linked purpose.", amount: 2800, recommendation: "Tag transfers with purposes." },
    { id: "b5", type: "drain", severity: "high", title: "Large Unexplained Cash Drain", description: "ATM withdrawals $650 this month — 2.3x average.", amount: 650, recommendation: "Log cash spending or switch to tracked methods." },
    { id: "b6", type: "drift", severity: "medium", title: "Reimbursement Drift", description: "$890 unreimbursed business expenses for 45+ days.", amount: 890, recommendation: "Submit reimbursement requests immediately." },
    { id: "b7", type: "credit-dependency", severity: "high", title: "Hidden Credit Dependency", description: "$4,200 revolving balance for 3 months suggests structural dependency.", amount: 4200, recommendation: "Build 1-month expense buffer." },
    { id: "b8", type: "unplanned", severity: "medium", title: "Obligations Not in Plans", description: "Insurance ($2,400) and registration ($380) due in 60 days, not budgeted.", amount: 2780, recommendation: "Create sinking fund allocations." },
  ], []);

  const criticalCount = signals.filter(s => s.severity === "critical" || s.severity === "high").length;
  const totalExposure = signals.reduce((sum, s) => sum + (s.amount || 0), 0);
  const integrityScore = Math.max(0, 100 - (criticalCount * 15) - (signals.length * 3));

  const typeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      blur: <ArrowLeftRight className="h-4 w-4" />, leakage: <TrendingDown className="h-4 w-4" />,
      orphan: <FileQuestion className="h-4 w-4" />, purposeless: <Eye className="h-4 w-4" />,
      drain: <AlertTriangle className="h-4 w-4" />, drift: <ArrowLeftRight className="h-4 w-4" />,
      "credit-dependency": <CreditCard className="h-4 w-4" />, unplanned: <Landmark className="h-4 w-4" />,
    };
    return icons[type] || <Shield className="h-4 w-4" />;
  };

  const sevStatus = (sev: string) => sev === "critical" || sev === "high" ? "down" as const : sev === "medium" ? "degraded" as const : "healthy" as const;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageTruthBanner />

      <HeroCard
        title="FINANCIAL BOUNDARY MONITOR"
        metric={`${integrityScore}/100`}
        subtitle={`${criticalCount} high-priority signals · $${totalExposure.toLocaleString()} exposure`}
        accentFrom={integrityScore >= 80 ? "hsl(152 55% 48%)" : integrityScore >= 60 ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)"}
        accentTo="hsl(265 55% 58%)"
        icon={<Shield className="h-5 w-5 text-[hsl(265_55%_58%)]" />}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatusCard label="Integrity Score" status={integrityScore >= 80 ? "healthy" : integrityScore >= 60 ? "degraded" : "down"} lastChecked={`${integrityScore}/100`} icon={<Shield className="h-3.5 w-3.5" />} />
        <StatusCard label="Active Signals" status="degraded" lastChecked={`${signals.length} (${criticalCount} high)`} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
        <StatusCard label="Total Exposure" status="down" lastChecked={`$${totalExposure.toLocaleString()}`} icon={<TrendingDown className="h-3.5 w-3.5" />} />
        <StatusCard label="Boundary Types" status="degraded" lastChecked={`${new Set(signals.map(s => s.type)).size} categories`} icon={<Eye className="h-3.5 w-3.5" />} />
      </div>

      {/* Integrity Ring */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-6 flex items-center justify-center gap-6">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-[hsl(0_0%_15%)]" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={integrityScore >= 80 ? "hsl(152 55% 48%)" : integrityScore >= 60 ? "hsl(38 85% 58%)" : "hsl(0 70% 55%)"}
              strokeWidth="8" strokeLinecap="round" strokeDasharray={`${integrityScore * 2.51} 251`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-display text-2xl font-bold">{integrityScore}</p>
          </div>
        </div>
        <div className="text-left">
          <p className="font-display text-lg font-bold">Financial Integrity</p>
          <p className="text-sm text-muted-foreground">
            {integrityScore >= 80 ? "Boundaries well-maintained" : integrityScore >= 60 ? "Some boundaries need attention" : "Multiple violations detected"}
          </p>
        </div>
      </div>

      {/* Signal Cards */}
      <div className="grid gap-3 lg:grid-cols-2">
        {signals.map(signal => (
          <div key={signal.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <div className="flex items-start gap-3">
              <div className="rounded-lg p-2 bg-[hsl(0_0%_100%/0.04)]">{typeIcon(signal.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display text-sm font-semibold">{signal.title}</p>
                  <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${signal.severity === "high" ? "bg-[hsl(0_70%_55%/0.1)] text-[hsl(0_70%_55%)]" : "bg-[hsl(38_85%_58%/0.1)] text-[hsl(38_85%_58%)]"}`}>
                    {signal.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{signal.description}</p>
                {signal.amount && <p className="text-xs font-semibold text-foreground mb-2">Exposure: ${signal.amount.toLocaleString()}</p>}
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5">
                  <p className="text-xs text-primary">💡 {signal.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModuleAdvisorInsight
        advisorName="Financial Boundary Advisor"
        domain="finance"
        insight={`Integrity score: ${integrityScore}/100. ${criticalCount} high-priority violations. Total exposure: $${totalExposure.toLocaleString()}. Resolve credit dependency and cash drains first.`}
        confidence={82}
      />
    </motion.div>
  );
};

export default FinancialBoundaryMonitor;
