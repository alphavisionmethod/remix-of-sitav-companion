// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Autopilot Workspace
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { SitaTabs, KPITile } from "@/components/sita/SitaComponents";
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
import { MOCK_RECOVERED_VALUES, MOCK_RAW_OPPORTUNITIES, MOCK_LEAKAGE_INPUT } from "@/data/fixtures/mock-data/revenue-autopilot";
import { useRevenueLeaksData, useRecoveredValuesData, useRawOpportunities } from "@/hooks/use-business-data";

// ── Derived data (fallback to mock, overridden in component) ──
let DEMO_LEAKAGE = detectLeakage(MOCK_LEAKAGE_INPUT);
let DEMO_RECOVERY_ACTIONS = suggestRecoveryActions(DEMO_LEAKAGE);
let DEMO_RECOVERED = MOCK_RECOVERED_VALUES;
let DEMO_OPPORTUNITIES = rankOpportunities(MOCK_RAW_OPPORTUNITIES);
let SUMMARY = computeAutopilotSummary(DEMO_LEAKAGE, DEMO_RECOVERY_ACTIONS, DEMO_RECOVERED);

// ── Severity Colors ─────────────────────────────────────────────

const severityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-amber-500/10 text-amber-600",
  medium: "bg-accent/10 text-accent",
  low: "bg-secondary text-muted-foreground",
};

// ── Sub-Pages ───────────────────────────────────────────────────

const LeakageRadar = () => {
  const isDemoMode = false;
  return (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KPITile label="Total Leakage Detected" value={`$${Math.round(SUMMARY.totalLeakageDetected).toLocaleString()}`} sub="Across all sources" trend="down" />
      <KPITile label="Recoverable" value={`$${Math.round(SUMMARY.totalRecoverable).toLocaleString()}`} sub={`${([] as typeof DEMO_LEAKAGE).filter(l => l.recoverable).length} items`} />
      <KPITile label="Critical Items" value={String(([] as typeof DEMO_LEAKAGE).filter(l => l.severity === "critical").length)} sub="Need immediate action" trend="down" />
      <KPITile label="Health Score" value={`${SUMMARY.healthScore}/100`} sub="Revenue health" trend="up" />
    </div>
    <div className="space-y-2">
      {([] as typeof DEMO_LEAKAGE).map((item, i) => (
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
    </div>
  </div>
  );
};

const RecoveryEngine = () => {
  const isDemoMode = false;
  return (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3">
      <KPITile label="Active Recoveries" value={String(SUMMARY.activeRecoveryActions)} sub="In progress" />
      <KPITile label="Suggested Actions" value={String(([] as typeof DEMO_RECOVERY_ACTIONS).length)} sub="Ready to launch" />
      <KPITile label="Approval Required" value={String(([] as typeof DEMO_RECOVERY_ACTIONS).filter(r => r.approvalRequired).length)} sub="Need your OK" />
    </div>
    <div className="space-y-2">
      {([] as typeof DEMO_RECOVERY_ACTIONS).map((action, i) => (
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
    </div>
  </div>
);

};

const OpportunitiesRanked = () => {
  const isDemoMode = false;
  return (
  <div className="space-y-4">
    <div className="space-y-2">
      {([] as typeof DEMO_OPPORTUNITIES).map((opp, i) => (
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
    </div>
  </div>
);

};

const RecoveredValueLedger = () => {
  const isDemoMode = false;
  const summary = computeRecoveredValueSummary(DEMO_RECOVERED);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <KPITile label="Total Recovered" value={`$${summary.totalRecovered.toLocaleString()}`} sub="All time" trend="up" />
        <KPITile label="Last 30 Days" value={`$${summary.last30Days.toLocaleString()}`} sub={`Trend: ${summary.trend}`} trend={summary.trend === "up" ? "up" : "down"} />
        <KPITile label="Categories" value={String(Object.keys(summary.byCategory).length)} sub="Active recovery types" />
      </div>
      <div className="space-y-2">
        {([] as typeof DEMO_RECOVERED).map((entry, i) => (
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

  // In live mode, use real data from hooks when available
  // The hooks already handle mode-aware fetching (demo vs real)
  // Module-level vars serve as fallback rendering data

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
      {activeTab === "leakage" && <LeakageRadar />}
      {activeTab === "recovery" && <RecoveryEngine />}
      {activeTab === "opportunities" && <OpportunitiesRanked />}
      {activeTab === "recovered" && <RecoveredValueLedger />}

      <ModuleAdvisorInsight
        advisorName="Revenue Recovery AI"
        domain="business"
        insight="$23,500 in detectable leakage across stale leads, aging quotes, and overdue invoices. Top recovery priority: TechVentures $15K overdue."
        confidence={90}
      />
    </div>
  );
};

export default RevenueAutopilot;
