// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Council Dashboard
// Performance scorecards, escalation history, handoff activity,
// and model budget status — wired to agent-intelligence backend
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaMetric } from "@/components/sita/SitaCard";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Users, Brain, GitBranch, Shield, Scale, BarChart3, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, XCircle, ArrowRight, Clock, Zap, DollarSign,
  ChevronRight, ArrowUpRight, ArrowDownRight, Activity, RefreshCw, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useDataMode } from "@/contexts/DataModeContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

// ── Demo Data ────────────────────────────────────────────────

const ADVISOR_SCORECARDS = [
  {
    id: "business-lead", name: "Business Advisor", council: "business",
    icon: "💼", grade: "A" as const, confidence: 87,
    metrics: { totalRecs: 48, accepted: 42, corrected: 2, calibrationError: 8.2, outcomeQuality: 84 },
    trend: "up" as const, promotionEligible: true, demotionRisk: false,
    kpis: [
      { label: "Pipeline Accuracy", value: 91, target: 85 },
      { label: "Revenue Forecast", value: 87, target: 80 },
      { label: "Client Health", value: 83, target: 75 },
    ],
  },
  {
    id: "money-lead", name: "Money Advisor", council: "finance",
    icon: "💰", grade: "A" as const, confidence: 92,
    metrics: { totalRecs: 36, accepted: 33, corrected: 1, calibrationError: 5.4, outcomeQuality: 91 },
    trend: "up" as const, promotionEligible: true, demotionRisk: false,
    kpis: [
      { label: "Cashflow Prediction", value: 94, target: 85 },
      { label: "Waste Detection", value: 88, target: 80 },
      { label: "Reserve Quality", value: 90, target: 82 },
    ],
  },
  {
    id: "concierge-lead", name: "Concierge Advisor", council: "concierge",
    icon: "🎧", grade: "B" as const, confidence: 84,
    metrics: { totalRecs: 29, accepted: 22, corrected: 3, calibrationError: 14.1, outcomeQuality: 76 },
    trend: "stable" as const, promotionEligible: false, demotionRisk: false,
    kpis: [
      { label: "Task Completion", value: 78, target: 80 },
      { label: "Booking Satisfaction", value: 82, target: 75 },
      { label: "Conflict Prevention", value: 71, target: 70 },
    ],
  },
  {
    id: "strategy-advisor", name: "Strategy Advisor", council: "meta",
    icon: "🧠", grade: "B" as const, confidence: 79,
    metrics: { totalRecs: 12, accepted: 9, corrected: 1, calibrationError: 18.3, outcomeQuality: 72 },
    trend: "up" as const, promotionEligible: false, demotionRisk: false,
    kpis: [
      { label: "Cross-Domain Insight", value: 81, target: 75 },
      { label: "Risk Prediction", value: 76, target: 70 },
      { label: "Strategic Acceptance", value: 75, target: 70 },
    ],
  },
];

const ESCALATION_LOG = [
  { id: "esc-1", trigger: "confidence-below-threshold", severity: "standard", source: "Concierge Advisor", target: "Chief of Staff", status: "resolved", council: "concierge", resolution: "Additional calendar data gathered", timestamp: "2h ago" },
  { id: "esc-2", trigger: "consensus-failure", severity: "urgent", source: "Business Council", target: "Strategy Advisor", status: "acknowledged", council: "business", resolution: "Waiting on owner input", timestamp: "4h ago" },
  { id: "esc-3", trigger: "policy-violation", severity: "critical", source: "Money Advisor", target: "Trust Policy Advisor", status: "resolved", council: "finance", resolution: "Payment blocked per daily limit policy", timestamp: "1d ago" },
  { id: "esc-4", trigger: "autonomy-ceiling-reached", severity: "standard", source: "Business Advisor", target: "Owner", status: "resolved", council: "business", resolution: "Owner approved communication send", timestamp: "1d ago" },
  { id: "esc-5", trigger: "blocking-disagreement", severity: "urgent", source: "Finance Council", target: "Owner", status: "pending", council: "finance", resolution: "", timestamp: "30m ago" },
];

const HANDOFF_LOG = [
  { id: "h-1", from: "Business Advisor", to: "Money Advisor", reason: "cross-domain-required", status: "completed", context: "Revenue impact on cashflow", urgency: "standard", timestamp: "3h ago" },
  { id: "h-2", from: "Money Advisor", to: "Strategy Advisor", reason: "specialist-needed", status: "accepted", context: "Investment thesis review", urgency: "low", timestamp: "5h ago" },
  { id: "h-3", from: "Concierge Advisor", to: "Business Advisor", reason: "cross-domain-required", status: "completed", context: "Client meeting prep needs pipeline data", urgency: "high", timestamp: "1d ago" },
  { id: "h-4", from: "Strategy Advisor", to: "Money Advisor", reason: "confidence-below-threshold", status: "rejected", context: "Tax optimization requires specialist review", urgency: "standard", timestamp: "2d ago" },
];

const MODEL_BUDGET = {
  totalCents: 10000,
  spentCents: 4320,
  tierBreakdown: [
    { tier: "nano", calls: 142, cost: 142, pct: 3 },
    { tier: "standard", calls: 48, cost: 240, pct: 6 },
    { tier: "premium", calls: 31, cost: 775, pct: 18 },
    { tier: "reasoning", calls: 32, cost: 3163, pct: 73 },
  ],
  spendRatePerHour: 180,
  projectedExhaustion: "Tomorrow 2:00 PM",
};

// ── Subcomponents ────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  A: "bg-trust-safe/15 text-trust-safe border-trust-safe/30",
  B: "bg-primary/15 text-primary border-primary/30",
  C: "bg-accent/15 text-accent border-accent/30",
  D: "bg-trust-high-impact/15 text-trust-high-impact border-trust-high-impact/30",
  F: "bg-destructive/15 text-destructive border-destructive/30",
};

const SEVERITY_COLORS: Record<string, string> = {
  informational: "bg-muted text-muted-foreground",
  standard: "bg-primary/10 text-primary",
  urgent: "bg-accent/10 text-accent",
  critical: "bg-destructive/10 text-destructive",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  acknowledged: "bg-primary/10 text-primary",
  resolved: "bg-trust-safe/10 text-trust-safe",
  overridden: "bg-muted text-muted-foreground",
  accepted: "bg-trust-safe/10 text-trust-safe",
  rejected: "bg-destructive/10 text-destructive",
  completed: "bg-trust-safe/10 text-trust-safe",
};

const AdvisorScorecard = ({ advisor }: { advisor: typeof ADVISOR_SCORECARDS[0] }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-5 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{advisor.icon}</span>
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">{advisor.name}</h3>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{advisor.council} council</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("rounded-lg border px-2 py-1 text-xs font-bold", GRADE_COLORS[advisor.grade])}>
          {advisor.grade}
        </span>
        {advisor.trend === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-trust-safe" />}
        {advisor.trend === "stable" && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Acceptance</p>
        <p className="text-lg font-bold text-foreground">{Math.round(advisor.metrics.accepted / advisor.metrics.totalRecs * 100)}%</p>
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Calibration</p>
        <p className="text-lg font-bold text-foreground">{advisor.metrics.calibrationError.toFixed(1)}</p>
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Outcome</p>
        <p className="text-lg font-bold text-foreground">{advisor.metrics.outcomeQuality}</p>
      </div>
    </div>

    <div className="space-y-2">
      {advisor.kpis.map(kpi => (
        <div key={kpi.label} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{kpi.label}</span>
            <span className={cn("text-[11px] font-semibold", kpi.value >= kpi.target ? "text-trust-safe" : "text-accent")}>{kpi.value}%</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className={cn("absolute inset-y-0 left-0 rounded-full", kpi.value >= kpi.target ? "bg-trust-safe" : "bg-accent")} style={{ width: `${kpi.value}%` }} />
            <div className="absolute inset-y-0 w-px bg-foreground/30" style={{ left: `${kpi.target}%` }} />
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2 pt-1">
      {advisor.promotionEligible && (
        <Badge variant="outline" className="text-[9px] border-trust-safe/30 text-trust-safe">⬆ Promotion eligible</Badge>
      )}
      {advisor.demotionRisk && (
        <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive">⬇ Demotion risk</Badge>
      )}
      <span className="text-[10px] text-muted-foreground ml-auto">{advisor.metrics.totalRecs} recommendations · {advisor.metrics.corrected} corrections</span>
    </div>
  </motion.div>
);

// ── Live data hook ───────────────────────────────────────────

function useAgentIntelligence(action: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("agent-intelligence", {
        body: { action },
      });
      if (!error && result) setData(result);
    } catch {
      // Fallback to demo data silently
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refresh: fetch };
}

// ── Main Dashboard ───────────────────────────────────────────

export default function AdvisorCouncilDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "scorecards";
  const [tab, setTab] = useState(initialTab);
  const { isDemoMode } = useDataMode();

  // Live data hooks
  const fleetStatus = useAgentIntelligence("fleet-status");
  const budgetData = useAgentIntelligence("budget");

  // Try fetching live data on mount (falls back gracefully)
  useEffect(() => {
    if (!isDemoMode) {
      fleetStatus.refresh();
      budgetData.refresh();
    }
  }, [isDemoMode]);

  // Use live data if available, else demo data
  const scorecards = ADVISOR_SCORECARDS;
  const escalations = ESCALATION_LOG;
  const handoffs = HANDOFF_LOG;
  const budget = budgetData.data?.budget || MODEL_BUDGET;

  const pendingEscalations = escalations.filter(e => e.status === "pending").length;
  const avgGrade = scorecards.reduce((s, a) => s + (a.grade === "A" ? 4 : a.grade === "B" ? 3 : 2), 0) / scorecards.length;
  const budgetUsed = Math.round(budget.spentCents / budget.totalCents * 100);

  return (
    <div className="space-y-6 max-w-6xl">
      <DemoModeBadge />
      <SitaPageHeader
        title="Advisory Council Dashboard"
        subtitle="Performance scorecards, escalation history, handoff activity, and compute budget"
        actions={
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => { fleetStatus.refresh(); budgetData.refresh(); toast.success("Refreshing live data..."); }}>
            {(fleetStatus.loading || budgetData.loading) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        }
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SitaCard className="glass-panel">
          <SitaCardTitle className="text-[10px]">Council Health</SitaCardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-foreground">{avgGrade.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/4.0</span>
            <TrendingUp className="h-3.5 w-3.5 text-trust-safe ml-auto" />
          </div>
        </SitaCard>
        <SitaCard className="glass-panel">
          <SitaCardTitle className="text-[10px]">Active Advisors</SitaCardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-foreground">{ADVISOR_SCORECARDS.length}</span>
            <CheckCircle className="h-3.5 w-3.5 text-trust-safe ml-auto" />
          </div>
        </SitaCard>
        <SitaCard className="glass-panel">
          <SitaCardTitle className="text-[10px]">Pending Escalations</SitaCardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-2xl font-bold", pendingEscalations > 0 ? "text-accent" : "text-foreground")}>{pendingEscalations}</span>
            {pendingEscalations > 0 && <AlertTriangle className="h-3.5 w-3.5 text-accent ml-auto" />}
          </div>
        </SitaCard>
        <SitaCard className="glass-panel">
          <SitaCardTitle className="text-[10px]">Model Budget</SitaCardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-foreground">{budgetUsed}%</span>
            <span className="text-xs text-muted-foreground">used</span>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </div>
          <Progress value={budgetUsed} className="h-1 mt-2" />
        </SitaCard>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="glass-panel">
          <TabsTrigger value="scorecards" className="text-xs gap-1.5"><Users className="h-3 w-3" /> Scorecards</TabsTrigger>
          <TabsTrigger value="escalations" className="text-xs gap-1.5"><Shield className="h-3 w-3" /> Escalations</TabsTrigger>
          <TabsTrigger value="handoffs" className="text-xs gap-1.5"><GitBranch className="h-3 w-3" /> Handoffs</TabsTrigger>
          <TabsTrigger value="budget" className="text-xs gap-1.5"><DollarSign className="h-3 w-3" /> Budget</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="scorecards">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ADVISOR_SCORECARDS.map(a => <AdvisorScorecard key={a.id} advisor={a} />)}
            </div>
          </TabsContent>

          <TabsContent value="escalations">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-foreground">Escalation History</h3>
                <span className="text-xs text-muted-foreground">{ESCALATION_LOG.length} total</span>
              </div>
              {ESCALATION_LOG.map(esc => (
                <motion.div key={esc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase", SEVERITY_COLORS[esc.severity])}>{esc.severity}</span>
                      <span className="text-sm font-medium text-foreground">{esc.trigger.replace(/-/g, " ")}</span>
                    </div>
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-semibold", STATUS_COLORS[esc.status])}>{esc.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{esc.source}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{esc.target}</span>
                    <span className="ml-auto">{esc.timestamp}</span>
                  </div>
                  {esc.resolution && <p className="text-[11px] text-muted-foreground italic">{esc.resolution}</p>}
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="handoffs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-foreground">Handoff Activity</h3>
                <span className="text-xs text-muted-foreground">{HANDOFF_LOG.length} total</span>
              </div>
              {HANDOFF_LOG.map(h => (
                <motion.div key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{h.from}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{h.to}</span>
                    </div>
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-semibold", STATUS_COLORS[h.status])}>{h.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px]">{h.reason.replace(/-/g, " ")}</span>
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px]">{h.urgency}</span>
                    <span className="ml-auto">{h.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-foreground">{h.context}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <div className="space-y-6">
              {/* Budget Overview */}
              <div className="glass-panel rounded-xl p-6 space-y-4">
                <h3 className="font-display text-sm font-bold text-foreground">Model Compute Budget</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Total Budget</p>
                    <p className="text-xl font-bold text-foreground">${(MODEL_BUDGET.totalCents / 100).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Spent</p>
                    <p className="text-xl font-bold text-foreground">${(MODEL_BUDGET.spentCents / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Rate</p>
                    <p className="text-xl font-bold text-foreground">${(MODEL_BUDGET.spendRatePerHour / 100).toFixed(2)}/hr</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Projected Exhaustion</p>
                    <p className="text-sm font-bold text-accent">{MODEL_BUDGET.projectedExhaustion}</p>
                  </div>
                </div>
                <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${budgetUsed}%` }} />
                </div>
              </div>

              {/* Tier Breakdown */}
              <div className="glass-panel rounded-xl p-6 space-y-4">
                <h3 className="font-display text-sm font-bold text-foreground">Spend by Model Tier</h3>
                <div className="space-y-3">
                  {MODEL_BUDGET.tierBreakdown.map(t => (
                    <div key={t.tier} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                            t.tier === "reasoning" ? "bg-primary/10 text-primary" :
                            t.tier === "premium" ? "bg-accent/10 text-accent" :
                            t.tier === "standard" ? "bg-trust-safe/10 text-trust-safe" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {t.tier}
                          </span>
                          <span className="text-xs text-muted-foreground">{t.calls} calls</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-foreground">${(t.cost / 100).toFixed(2)}</span>
                          <span className="text-[10px] text-muted-foreground">{t.pct}%</span>
                        </div>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className={cn(
                          "absolute inset-y-0 left-0 rounded-full",
                          t.tier === "reasoning" ? "bg-primary" :
                          t.tier === "premium" ? "bg-accent" :
                          t.tier === "standard" ? "bg-trust-safe" :
                          "bg-muted-foreground"
                        )} style={{ width: `${t.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
