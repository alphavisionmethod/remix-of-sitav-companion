// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovered Value Ledger & Score Page
// Shows measurable value SITA has created
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Zap, CheckCircle2, Target, BarChart3,
  Star, ArrowRight, Shield, Clock, Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOSRuntime } from "@/hooks/useOSRuntime";
import { useCountUpFormatted } from "@/hooks/useCountUp";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import HierarchyHint from "@/modules/business/components/business/shared/HierarchyHint";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

// ── Seed demo recovered values ─────────────────────────────────
function useDemoRecoveries() {
  const { engines } = useOSRuntime();

  return useMemo(() => {
    // Detect some leakage signals
    const signals = [
      engines.revenue.detectLeakage({ type: "stale_lead", domain: "business", title: "Sarah Chen — no follow-up in 12 days", description: "Warm lead with $8,500 potential", estimatedValue: 8500, currency: "USD", confidence: 0.82, source: "CRM sync", entityId: "lead-sarah", relatedRecords: [{ type: "contact", id: "c-sarah" }], suggestedAction: "Send re-engagement email", assignedAdvisor: "business-advisor" }),
      engines.revenue.detectLeakage({ type: "overdue_invoice", domain: "finance", title: "Invoice #1042 — 15 days overdue", description: "Client: Bloom Studio, Amount: $4,200", estimatedValue: 4200, currency: "USD", confidence: 0.95, source: "QuickBooks sync", entityId: "inv-1042", relatedRecords: [{ type: "invoice", id: "inv-1042" }], suggestedAction: "Send payment reminder", assignedAdvisor: "money-advisor" }),
      engines.revenue.detectLeakage({ type: "subscription_waste", domain: "finance", title: "Analytics Pro — unused 90 days", description: "Monthly: $89/mo, no logins since Jan", estimatedValue: 1068, currency: "USD", confidence: 0.98, source: "Expense scan", relatedRecords: [{ type: "subscription", id: "sub-analytics" }], suggestedAction: "Cancel subscription", assignedAdvisor: "money-advisor" }),
      engines.revenue.detectLeakage({ type: "underused_capacity", domain: "business", title: "30% calendar availability this week", description: "Revenue-generating slots going unfilled", estimatedValue: 3200, currency: "USD", confidence: 0.65, source: "Calendar analysis", relatedRecords: [{ type: "schedule", id: "cal-week" }], suggestedAction: "Open up booking slots", assignedAdvisor: "business-advisor" }),
      engines.revenue.detectLeakage({ type: "cold_repeat_customer", domain: "business", title: "TechVentures — no reorder in 6 months", description: "Last purchase: $12,000. Historically quarterly buyer", estimatedValue: 12000, currency: "USD", confidence: 0.7, source: "CRM pattern detection", relatedRecords: [{ type: "customer", id: "cust-techv" }], suggestedAction: "Schedule check-in call", assignedAdvisor: "business-advisor" }),
    ];

    // Mark some as recovered
    engines.revenue.markRecovered(signals[0].id, { type: "stale_lead", domain: "business", title: "Sarah Chen re-engaged", recoveredAmount: 8500, currency: "USD", method: "Auto follow-up email", advisorId: "business-advisor", proofId: "proof-sarah", effortLevel: "trivial", automationLevel: "fully_automatic" });
    engines.revenue.markRecovered(signals[2].id, { type: "subscription_waste", domain: "finance", title: "Analytics Pro canceled", recoveredAmount: 1068, currency: "USD", method: "One-click cancel", advisorId: "money-advisor", proofId: "proof-sub", effortLevel: "trivial", automationLevel: "advisor_guided" });

    // Record outcomes
    engines.revenue.recordOutcome({ type: "revenue_recovered", title: "Stale lead converted", value: 8500, currency: "USD", domain: "business", advisorId: "business-advisor", proofId: "proof-sarah", userAcknowledged: true });
    engines.revenue.recordOutcome({ type: "waste_removed", title: "Unused subscription canceled", value: 1068, currency: "USD", domain: "finance", advisorId: "money-advisor", proofId: "proof-sub", userAcknowledged: true });
    engines.revenue.recordOutcome({ type: "fee_avoided", title: "Late payment fee prevented", value: 150, currency: "USD", domain: "finance", advisorId: "money-advisor", proofId: "proof-fee", userAcknowledged: false });

    return {
      stats: engines.revenue.getStats(),
      rankings: engines.revenue.rankOpportunities(),
      ledger: engines.revenue.getLedger("this_month"),
      outcomeSummary: engines.revenue.getOutcomeSummary(),
    };
  }, [engines.revenue]);
}

// ── Main Page ──────────────────────────────────────────────────
/* Animated score card */
const RecoveredKPI = ({ label, value, color, delay }: { label: string; value: string | number; color: string; delay: number }) => {
  const animated = useCountUpFormatted(value);
  return (
    <PageShell>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-xl border border-border/30 bg-card/60 p-3 text-center"
    >
<p className={cn("text-xl font-bold font-display tabular-nums", color)}>{animated}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </motion.div>
    </PageShell>
  );
};

export default function RecoveredValuePage() {
  const { stats, rankings, ledger, outcomeSummary } = useDemoRecoveries();

  const outcomeIcons: Record<string, typeof DollarSign> = {
    revenue_recovered: DollarSign, waste_removed: Zap, fee_avoided: Shield,
    capacity_filled: Target, time_saved: Clock, opportunity_revived: Star,
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
      <HierarchyHint tier="result" surface="Recovered Value" description="Closed-loop revenue evidence" />
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-sita-gold/15 bg-gradient-to-br from-sita-gold/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sita-gold/15">
            <Award className="h-7 w-7 text-sita-gold" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground font-display">Recovered Value</h1>
            <p className="text-sm text-muted-foreground">Measurable value SITA has created — money recovered, waste removed, opportunities captured</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-3xl font-bold font-display text-sita-gold tabular-nums">{useCountUpFormatted(`$${ledger.totalRecovered.toLocaleString()}`)}</p>
            <p className="text-[10px] text-muted-foreground">Total Recovered</p>
          </div>
        </div>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Detected", value: stats.detected, color: "text-primary" },
          { label: "In Recovery", value: stats.inRecovery, color: "text-accent" },
          { label: "Recovered", value: stats.recovered, color: "text-trust-safe" },
          { label: "Potential Value", value: `$${(stats.totalPotentialValue / 1000).toFixed(1)}k`, color: "text-sita-gold" },
          { label: "Automation Rate", value: `${Math.round(ledger.automatedPercent)}%`, color: "text-primary" },
        ].map((card, i) => (
          <RecoveredKPI key={card.label} label={card.label} value={card.value} color={card.color} delay={i * 0.05} />
        ))}
      </div>

      {/* Outcome Summary */}
      <div className="rounded-xl border border-border/30 bg-card/60 p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <BarChart3 className="h-3 w-3" /> Value by Type
        </h3>
        <div className="space-y-2">
          {Object.entries(outcomeSummary.byType).map(([type, value]) => {
            const Icon = outcomeIcons[type] || DollarSign;
            const pct = outcomeSummary.totalValue > 0 ? (value / outcomeSummary.totalValue) * 100 : 0;
            return (
              <div key={type} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-foreground w-40 capitalize">{type.replace(/_/g, " ")}</span>
                <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    className="h-full rounded-full bg-sita-gold/60" transition={{ duration: 0.6 }} />
                </div>
                <span className="text-[10px] font-mono text-foreground w-16 text-right">${value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Opportunities */}
      <div className="rounded-xl border border-border/30 bg-card/60 p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Target className="h-3 w-3" /> Ranked Opportunities
        </h3>
        {rankings.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-6 w-6 text-trust-safe mx-auto mb-2" />
            <p className="text-sm text-foreground font-semibold">All opportunities addressed</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankings.map((r, i) => (
              <motion.div key={r.opportunityId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl border border-border/20 bg-secondary/10 p-3"
              >
                <span className="text-sm font-bold font-display text-primary w-6 text-center">#{r.rank}</span>
                <div className="flex-1">
                  <p className="text-xs text-foreground font-semibold">{r.opportunityId}</p>
                  <div className="flex gap-3 text-[9px] text-muted-foreground mt-0.5">
                    <span>Value: {(r.factors.value * 100).toFixed(0)}%</span>
                    <span>Urgency: {(r.factors.urgency * 100).toFixed(0)}%</span>
                    <span>Prob: {(r.factors.probability * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-display text-foreground">{(r.score * 100).toFixed(0)}</p>
                  <p className="text-[8px] text-muted-foreground">Score</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Top Recoveries */}
      {ledger.topRecoveries.length > 0 && (
        <div className="rounded-xl border border-trust-safe/15 bg-trust-safe/5 p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Star className="h-3 w-3 text-sita-gold" /> Top Recoveries
          </h3>
          {ledger.topRecoveries.map(r => (
            <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/10 last:border-0">
              <CheckCircle2 className="h-4 w-4 text-trust-safe shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{r.title}</p>
                <p className="text-[10px] text-muted-foreground">{r.method} · {r.automationLevel.replace(/_/g, " ")}</p>
              </div>
              <span className="text-sm font-bold font-display text-trust-safe">${r.recoveredAmount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
