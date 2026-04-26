// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Autopilot Workspace
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/platform/sita/components/sita/domain-shared/ModuleAdvisorInsight";
import { SitaTabs, KPITile } from "@/platform/sita/components/sita/SitaComponents";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, RefreshCw, Zap,
  Target, ArrowUpRight, Clock, CheckCircle, XCircle, BarChart3, Shield,
  Search, Users, FileText, Inbox, Activity
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import {
  detectLeakage, suggestRecoveryActions, rankOpportunities, computeRecoveredValueSummary,
  computeAutopilotSummary, type LeakageItem, type RecoveredValueEntry, type RankedOpportunity
} from "@/lib/domain-engines/revenue-autopilot";
import { useRevenueLeaksData, useRecoveredValuesData, useRawOpportunities } from "@/hooks/use-business-data";

// ── Severity Colors ─────────────────────────────────────────────

const severityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-amber-500/10 text-amber-600",
  medium: "bg-accent/10 text-accent",
  low: "bg-secondary text-muted-foreground",
};

// ── Sub-Pages ───────────────────────────────────────────────────

interface SubPageProps {
  leakage: LeakageItem[];
  recoveryActions: ReturnType<typeof suggestRecoveryActions>;
  recovered: RecoveredValueEntry[];
  opportunities: RankedOpportunity[];
  summary: ReturnType<typeof computeAutopilotSummary>;
}

const LeakageRadar = ({ leakage, summary }: Pick<SubPageProps, "leakage" | "summary">) => {
  return (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KPITile label="Total Leakage Detected" value={`$${Math.round(summary.totalLeakageDetected).toLocaleString()}`} sub="Across all sources" trend="down" />
      <KPITile label="Recoverable" value={`$${Math.round(summary.totalRecoverable).toLocaleString()}`} sub={`${leakage.filter(l => l.recoverable).length} items`} />
      <KPITile label="Critical Items" value={String(leakage.filter(l => l.severity === "critical").length)} sub="Need immediate action" trend="down" />
      <KPITile label="Health Score" value={`${summary.healthScore}/100`} sub="Revenue health" trend="up" />
    </div>
    <div className="space-y-2">
      {leakage.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <SitaCard className="p-4" hover>
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <AlertTriangle className={`h-5 w-5 ${item.severity === "critical" ? "text-destructive" : item.severity === "high" ? "text-amber-500" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{item.entityName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${severityColors[item.severity]}`}>{item.severity}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">{item.type.replace(/-/g, " ")}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.suggestedAction}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">${item.estimatedValue.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{item.daysSinceLastAction}d inactive</p>
              </div>
              <button className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors shrink-0">
                Recover
              </button>
            </div>
          </SitaCard>
        </motion.div>
      ))}
      {leakage.length === 0 && (
        <SitaCard className="p-6 text-center">
          <Activity className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No revenue leaks detected</p>
          <p className="text-xs text-muted-foreground mt-1">Your revenue flow is healthy.</p>
        </SitaCard>
      )}
    </div>
  </div>
  );
};

const RecoveryEngine = ({ recoveryActions, summary }: Pick<SubPageProps, "recoveryActions" | "summary">) => {
  return (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">
      <KPITile label="Active Recoveries" value={String(summary.activeRecoveryActions)} sub="In progress" />
      <KPITile label="Suggested Actions" value={String(recoveryActions.length)} sub="Ready to launch" />
      <KPITile label="Approval Required" value={String(recoveryActions.filter(r => r.approvalRequired).length)} sub="Need your OK" />
    </div>
    <div className="space-y-2">
      {recoveryActions.map((action, i) => (
        <motion.div key={action.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <SitaCard className="p-4" hover>
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground capitalize">{action.type.replace(/-/g, " ")}</p>
                <p className="text-[11px] text-muted-foreground">Est. recovery: ${Math.round(action.estimatedRecovery).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {action.approvalRequired && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-600 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Approval needed
                  </span>
                )}
                <button className="rounded-lg gradient-sita px-3 py-1 text-[10px] font-semibold text-primary-foreground">
                  Launch
                </button>
              </div>
            </div>
          </SitaCard>
        </motion.div>
      ))}
      {recoveryActions.length === 0 && (
        <SitaCard className="p-6 text-center">
          <CheckCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No recovery actions queued</p>
          <p className="text-xs text-muted-foreground mt-1">Detected leaks will surface recovery suggestions here.</p>
        </SitaCard>
      )}
    </div>
  </div>
);

};

const OpportunitiesRanked = ({ opportunities }: Pick<SubPageProps, "opportunities">) => {
  return (
  <div className="space-y-4">
    <div className="space-y-2">
      {opportunities.map((opp, i) => (
        <motion.div key={opp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <SitaCard className="p-4" hover>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl gradient-sita text-primary-foreground text-sm font-bold shrink-0">
                {opp.compositeScore}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{opp.name}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="capitalize">{opp.source}</span>
                  <span>{Math.round(opp.probability * 100)}% prob</span>
                  <span>{opp.cashImpactDays}d to cash</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">${opp.estimatedValue.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{opp.suggestedAction}</p>
              </div>
            </div>
          </SitaCard>
        </motion.div>
      ))}
      {opportunities.length === 0 && (
        <SitaCard className="p-6 text-center">
          <Target className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No ranked opportunities</p>
          <p className="text-xs text-muted-foreground mt-1">Open deals and pipeline items will be ranked here.</p>
        </SitaCard>
      )}
    </div>
  </div>
);

};

const RecoveredValueLedger = ({ recovered }: Pick<SubPageProps, "recovered">) => {
  const summary = computeRecoveredValueSummary(recovered);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KPITile label="Total Recovered" value={`$${summary.totalRecovered.toLocaleString()}`} sub="All time" trend="up" />
        <KPITile label="Last 30 Days" value={`$${summary.last30Days.toLocaleString()}`} sub={`Trend: ${summary.trend}`} trend={summary.trend === "up" ? "up" : "down"} />
        <KPITile label="Categories" value={String(Object.keys(summary.byCategory).length)} sub="Active recovery types" />
      </div>
      <div className="space-y-2">
        {recovered.map((entry, i) => (
          <motion.div key={entry.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <SitaCard className="p-4" hover>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{entry.description}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{entry.category.replace(/-/g, " ")}</p>
                </div>
                <p className="text-sm font-bold text-primary shrink-0">+${entry.amount.toLocaleString()}</p>
              </div>
            </SitaCard>
          </motion.div>
        ))}
        {recovered.length === 0 && (
          <SitaCard className="p-6 text-center">
            <DollarSign className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No recovered revenue logged yet</p>
          </SitaCard>
        )}
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────

const RevenueAutopilot = () => {
  const { primaryMode } = useBusinessProfile();
  const autopilotLabel = primaryMode === "ecommerce" ? "Sales Autopilot" : primaryMode === "agency" ? "Growth Engine" : primaryMode === "employee-based" ? "Workflow Engine" : "Revenue Autopilot";
  const { data: leaksData } = useRevenueLeaksData();
  const { data: recoveredData } = useRecoveredValuesData();
  const { data: oppsData } = useRawOpportunities();
  const [activeTab, setActiveTab] = useState("leakage");

  // ── Derive live data through engines ───────────────────────────
  const leakage = useMemo<LeakageItem[]>(() => {
    const input = (leaksData ?? {}) as Parameters<typeof detectLeakage>[0];
    return detectLeakage({
      leads: input?.leads ?? [],
      quotes: input?.quotes ?? [],
      invoices: input?.invoices ?? [],
      customers: input?.customers ?? [],
      bookings: input?.bookings ?? [],
      subscriptions: input?.subscriptions ?? [],
    });
  }, [leaksData]);

  const recoveryActions = useMemo(() => suggestRecoveryActions(leakage), [leakage]);
  const recovered = useMemo<RecoveredValueEntry[]>(() => Array.isArray(recoveredData) ? recoveredData as RecoveredValueEntry[] : [], [recoveredData]);
  const opportunities = useMemo<RankedOpportunity[]>(() => rankOpportunities(Array.isArray(oppsData) ? oppsData as never[] : []), [oppsData]);
  const summary = useMemo(() => computeAutopilotSummary(leakage, recoveryActions, recovered), [leakage, recoveryActions, recovered]);

  const tabs = [
    { key: "leakage", label: "Leakage Radar" },
    { key: "recovery", label: "Recovery Engine" },
    { key: "opportunities", label: "Opportunities" },
    { key: "recovered", label: "Recovered Value" },
  ];

   return (
    <div className="space-y-6">
      <PageTruthBanner />
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary flex items-center gap-1">
          <Zap className="h-3 w-3" /> Autopilot Active
        </span>
      </div>
      <SitaTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {activeTab === "leakage" && <LeakageRadar leakage={leakage} summary={summary} />}
      {activeTab === "recovery" && <RecoveryEngine recoveryActions={recoveryActions} summary={summary} />}
      {activeTab === "opportunities" && <OpportunitiesRanked opportunities={opportunities} />}
      {activeTab === "recovered" && <RecoveredValueLedger recovered={recovered} />}

      <ModuleAdvisorInsight
        advisorName="Revenue Recovery AI"
        domain="business"
        insight={leakage.length === 0
          ? "No active revenue leaks detected. Continue monitoring stale leads, aging quotes, and overdue invoices."
          : `$${Math.round(summary.totalLeakageDetected).toLocaleString()} in detectable leakage across ${leakage.length} item${leakage.length === 1 ? "" : "s"}. Recoverable: $${Math.round(summary.totalRecoverable).toLocaleString()}.`
        }
        confidence={leakage.length === 0 ? 60 : 90}
      />
    </div>
  );
};

export default RevenueAutopilot;
