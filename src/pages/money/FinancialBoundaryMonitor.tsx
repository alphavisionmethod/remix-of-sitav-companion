// ═══════════════════════════════════════════════════════════════
// SITA OS — Money Office: Financial Boundary Monitor
// Cross-domain financial integrity and leakage detection
// ═══════════════════════════════════════════════════════════════

import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { DomainHeader } from "@/components/sita/primitives/DomainHeader";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Shield, AlertTriangle, Eye, CreditCard, ArrowLeftRight, FileQuestion, Landmark, TrendingDown } from "lucide-react";

interface BoundarySignal {
  id: string;
  type: "blur" | "leakage" | "orphan" | "purposeless" | "drain" | "drift" | "credit-dependency" | "unplanned";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  amount?: number;
  recommendation: string;
}

const FinancialBoundaryMonitor = () => {
  const signals = useMemo<BoundarySignal[]>(() => [
    {
      id: "b1",
      type: "blur",
      severity: "high",
      title: "Household/Business Finance Blur",
      description: "3 transactions in the last 30 days crossed personal/business boundaries without classification. $1,240 in unresolved cross-entity spending.",
      amount: 1240,
      recommendation: "Classify each transaction as personal or business. Enable auto-classification rules to prevent future blur.",
    },
    {
      id: "b2",
      type: "leakage",
      severity: "medium",
      title: "Budget Leakage — Dining Category",
      description: "Dining spending exceeded envelope by $180 for 3 consecutive months. Budget boundary is structurally broken.",
      amount: 180,
      recommendation: "Increase dining envelope by $150/mo or add a 'social dining' sub-category to separate business meals.",
    },
    {
      id: "b3",
      type: "orphan",
      severity: "medium",
      title: "Orphan Obligations Detected",
      description: "2 recurring charges ($45/mo, $29/mo) have no budget category assignment. They bypass all envelope controls.",
      amount: 74,
      recommendation: "Assign these recurring charges to budget categories so they are tracked and controlled.",
    },
    {
      id: "b4",
      type: "purposeless",
      severity: "low",
      title: "Purposeless Money Movement",
      description: "3 transfers between checking accounts totaling $2,800 in the last 60 days with no linked goal or allocation purpose.",
      amount: 2800,
      recommendation: "Tag transfers with purposes (reserve funding, bill staging, etc.) to maintain financial clarity.",
    },
    {
      id: "b5",
      type: "drain",
      severity: "high",
      title: "Large Unexplained Cash Drain",
      description: "ATM/cash withdrawals of $650 this month — 2.3x the 6-month average. No receipt or categorization for 80% of withdrawals.",
      amount: 650,
      recommendation: "Log cash spending or switch to tracked payment methods to maintain visibility.",
    },
    {
      id: "b6",
      type: "drift",
      severity: "medium",
      title: "Reimbursement Drift",
      description: "$890 in business expenses paid from personal accounts remain unreimbursed for 45+ days. Average reimbursement lag increasing.",
      amount: 890,
      recommendation: "Submit reimbursement requests immediately. Set a 14-day reimbursement policy.",
    },
    {
      id: "b7",
      type: "credit-dependency",
      severity: "high",
      title: "Hidden Credit Dependency",
      description: "Credit card balance carried forward 3 consecutive months. $4,200 revolving balance suggests structural dependency on credit float.",
      amount: 4200,
      recommendation: "Build a 1-month expense buffer to eliminate credit float dependency. Consider switching to Debt Attack mode.",
    },
    {
      id: "b8",
      type: "unplanned",
      severity: "medium",
      title: "Obligations Not Reflected in Plans",
      description: "Annual insurance premium ($2,400) and vehicle registration ($380) due in 60 days are not in any budget or sinking fund.",
      amount: 2780,
      recommendation: "Create sinking fund allocations for these known annual obligations.",
    },
  ], []);

  const criticalCount = signals.filter(s => s.severity === "critical" || s.severity === "high").length;
  const totalExposure = signals.reduce((sum, s) => sum + (s.amount || 0), 0);
  const integrityScore = Math.max(0, 100 - (criticalCount * 15) - (signals.length * 3));

  const severityColor = (sev: string) => {
    if (sev === "critical") return "text-destructive bg-destructive/10 border-destructive/20";
    if (sev === "high") return "text-urgency-high bg-urgency-high/10 border-urgency-high/20";
    if (sev === "medium") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-muted-foreground bg-secondary/40 border-border";
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "blur": return <ArrowLeftRight className="h-4 w-4" />;
      case "leakage": return <TrendingDown className="h-4 w-4" />;
      case "orphan": return <FileQuestion className="h-4 w-4" />;
      case "purposeless": return <Eye className="h-4 w-4" />;
      case "drain": return <AlertTriangle className="h-4 w-4" />;
      case "drift": return <ArrowLeftRight className="h-4 w-4" />;
      case "credit-dependency": return <CreditCard className="h-4 w-4" />;
      case "unplanned": return <Landmark className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DomainHeader domain="money" title="Financial Boundary Monitor" subtitle="Cross-domain financial integrity and leakage detection" />
      <DemoModeBadge />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Integrity Score" value={`${integrityScore}/100`} icon={Shield} sub={integrityScore >= 80 ? "Strong" : integrityScore >= 60 ? "Needs attention" : "Weak"} />
        <KPITile label="Active Signals" value={signals.length} icon={AlertTriangle} sub={`${criticalCount} high priority`} />
        <KPITile label="Total Exposure" value={`$${totalExposure.toLocaleString()}`} icon={TrendingDown} sub="Across all signals" />
        <KPITile label="Boundary Types" value={new Set(signals.map(s => s.type)).size} icon={Eye} sub="Categories detected" />
      </div>

      {/* Integrity Score Ring */}
      <SitaCard hover={false} className="p-6 text-center">
        <div className="flex items-center justify-center gap-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-muted" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor"
                className={integrityScore >= 80 ? "text-trust-verified" : integrityScore >= 60 ? "text-amber-500" : "text-destructive"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${integrityScore * 2.51} 251`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <p className={`font-display text-2xl font-bold ${integrityScore >= 80 ? "text-trust-verified" : integrityScore >= 60 ? "text-amber-500" : "text-destructive"}`}>{integrityScore}</p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
            </div>
          </div>
          <div className="text-left">
            <p className="font-display text-lg font-bold">Financial Integrity</p>
            <p className="text-sm text-muted-foreground">
              {integrityScore >= 80 ? "Boundaries are well-maintained" : integrityScore >= 60 ? "Some boundaries need attention" : "Multiple boundary violations detected"}
            </p>
          </div>
        </div>
        <TrustBadge level={integrityScore >= 80 ? "verified" : integrityScore >= 60 ? "review" : "degraded"} />
      </SitaCard>

      {/* Signal Cards */}
      <SitaSectionHeader title="Boundary Signals" />
      <div className="grid gap-3 lg:grid-cols-2">
        {signals.map(signal => (
          <SitaCard key={signal.id} hover className="p-4">
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 ${severityColor(signal.severity)}`}>
                {typeIcon(signal.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display text-sm font-semibold">{signal.title}</p>
                  <span className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded ${severityColor(signal.severity)}`}>
                    {signal.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{signal.description}</p>
                {signal.amount && (
                  <p className="text-xs font-semibold text-foreground mb-2">Exposure: ${signal.amount.toLocaleString()}</p>
                )}
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-2.5">
                  <p className="text-xs text-primary">💡 {signal.recommendation}</p>
                </div>
              </div>
            </div>
          </SitaCard>
        ))}
      </div>

      {/* Advisor */}
      <LiveAdvisorCard
        advisor="money"
        intent="boundary_integrity"
        context={{ integrity_score: integrityScore, signal_count: signals.length, exposure: totalExposure }}
        demoName="Financial Boundary Advisor"
        demoRole="Cross-Domain Integrity Intelligence"
        demoConfidence="High"
        demoRecommendation={`Integrity score: ${integrityScore}/100. ${criticalCount} high-priority boundary violations requiring attention. Total exposure: $${totalExposure.toLocaleString()}. Priority: resolve credit dependency and unexplained cash drains first.`}
        demoReasoning="Analysis of transaction flows, budget adherence, cross-entity patterns, obligation coverage, and credit utilization trends."
      />
    </motion.div>
  );
};

export default FinancialBoundaryMonitor;
