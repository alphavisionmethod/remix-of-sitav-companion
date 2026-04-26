import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useDataMode } from "@/contexts/DataModeContext";
import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Heart, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Users, ArrowRight, Activity, ShieldAlert, CheckCircle2
} from "lucide-react";
import {
  type CustomerLifecycleStage,
  type CustomerLifecycleRecord,
  type CustomerHealthScore,
  type CustomerHealthDimension,
  type ChurnPrediction,
  type ChurnPredictionInput,
  LIFECYCLE_TRANSITIONS,
  computeHealthGrade,
  computeOverallHealth,
  computeChurnRisk,
  getAvailableTransitions,
} from "@/domains/business";

// ── Stage colors ────────────────────────────────────────────
const STAGE_STYLES: Record<CustomerLifecycleStage, { bg: string; text: string; ring: string }> = {
  prospect:   { bg: "bg-slate-500/15",  text: "text-slate-400",  ring: "ring-slate-500/30" },
  lead:       { bg: "bg-blue-500/15",   text: "text-blue-400",   ring: "ring-blue-500/30" },
  qualified:  { bg: "bg-indigo-500/15", text: "text-indigo-400", ring: "ring-indigo-500/30" },
  onboarding: { bg: "bg-violet-500/15", text: "text-violet-400", ring: "ring-violet-500/30" },
  active:     { bg: "bg-green-500/15",  text: "text-green-400",  ring: "ring-green-500/30" },
  expansion:  { bg: "bg-emerald-500/15",text: "text-emerald-400",ring: "ring-emerald-500/30" },
  "at-risk":  { bg: "bg-amber-500/15",  text: "text-amber-400",  ring: "ring-amber-500/30" },
  churning:   { bg: "bg-orange-500/15", text: "text-orange-400", ring: "ring-orange-500/30" },
  churned:    { bg: "bg-red-500/15",    text: "text-red-400",    ring: "ring-red-500/30" },
  "win-back": { bg: "bg-cyan-500/15",   text: "text-cyan-400",   ring: "ring-cyan-500/30" },
  dormant:    { bg: "bg-gray-500/15",   text: "text-gray-400",   ring: "ring-gray-500/30" },
};

const ALL_STAGES: CustomerLifecycleStage[] = [
  "prospect", "lead", "qualified", "onboarding", "active", "expansion", "at-risk", "churning", "churned", "win-back", "dormant",
];

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-400", B: "text-blue-400", C: "text-amber-400", D: "text-orange-400", F: "text-red-400",
};

const TREND_ICONS = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

// ── Demo data ───────────────────────────────────────────────
function createDemoCustomers(): CustomerLifecycleRecord[] {
  const now = new Date();
  const ago = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
  const ahead = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

  const mkHealth = (dims: CustomerHealthDimension[]): CustomerHealthScore => {
    const overall = computeOverallHealth(dims);
    return { customerId: "", overallScore: overall, grade: computeHealthGrade(overall), dimensions: dims, computedAt: now.toISOString(), nextReviewAt: ahead(7) };
  };

  const customers: CustomerLifecycleRecord[] = [
    {
      customerId: "cust-001", currentStage: "active", stageEnteredAt: ago(45),
      stageHistory: [
        { stage: "prospect", enteredAt: ago(180), exitedAt: ago(150), durationDays: 30 },
        { stage: "lead", enteredAt: ago(150), exitedAt: ago(120), durationDays: 30 },
        { stage: "qualified", enteredAt: ago(120), exitedAt: ago(90), durationDays: 30 },
        { stage: "onboarding", enteredAt: ago(90), exitedAt: ago(45), durationDays: 45 },
      ],
      healthScore: mkHealth([
        { name: "Engagement", score: 88, weight: 0.3, signals: ["daily-login", "feature-adoption"], trend: "improving" },
        { name: "Revenue", score: 92, weight: 0.25, signals: ["upsell-complete", "on-time-payments"], trend: "stable" },
        { name: "Communication", score: 75, weight: 0.2, signals: ["bi-weekly-calls"], trend: "stable" },
        { name: "Satisfaction", score: 85, weight: 0.15, signals: ["nps-9", "csat-4.5"], trend: "improving" },
        { name: "Support", score: 90, weight: 0.1, signals: ["low-ticket-volume"], trend: "stable" },
      ]),
      assignedAdvisor: "business-advisor", nextCheckIn: ahead(3), lifetimeValueCents: 4500000, tags: ["enterprise", "high-value"],
    },
    {
      customerId: "cust-002", currentStage: "at-risk", stageEnteredAt: ago(10),
      stageHistory: [
        { stage: "lead", enteredAt: ago(200), exitedAt: ago(170), durationDays: 30 },
        { stage: "active", enteredAt: ago(60), exitedAt: ago(10), durationDays: 50 },
      ],
      healthScore: mkHealth([
        { name: "Engagement", score: 32, weight: 0.3, signals: ["login-declining", "feature-drop"], trend: "declining" },
        { name: "Revenue", score: 60, weight: 0.25, signals: ["late-payment"], trend: "declining" },
        { name: "Communication", score: 25, weight: 0.2, signals: ["no-response-14-days"], trend: "declining" },
        { name: "Satisfaction", score: 40, weight: 0.15, signals: ["nps-4"], trend: "declining" },
        { name: "Support", score: 30, weight: 0.1, signals: ["high-ticket-volume", "escalations"], trend: "declining" },
      ]),
      churnPrediction: {
        customerId: "cust-002", churnProbability: 0.72, predictedAt: now.toISOString(), modelVersion: "v2.1",
        riskFactors: [
          { factor: "engagement-drop", impact: 0.3, description: "Login frequency dropped 60% in 14 days" },
          { factor: "support-escalations", impact: 0.25, description: "3 escalated tickets in last week" },
          { factor: "champion-departure", impact: 0.17, description: "Primary contact left organization" },
        ],
        suggestedActions: ["Schedule executive check-in", "Offer dedicated support session", "Prepare retention package"],
      },
      assignedAdvisor: "business-advisor", nextCheckIn: ahead(1), lifetimeValueCents: 1800000, tags: ["mid-market", "at-risk"],
    },
    {
      customerId: "cust-003", currentStage: "expansion", stageEnteredAt: ago(15),
      stageHistory: [
        { stage: "qualified", enteredAt: ago(120), exitedAt: ago(90), durationDays: 30 },
        { stage: "active", enteredAt: ago(90), exitedAt: ago(15), durationDays: 75 },
      ],
      healthScore: mkHealth([
        { name: "Engagement", score: 95, weight: 0.3, signals: ["power-user", "api-integration"], trend: "improving" },
        { name: "Revenue", score: 88, weight: 0.25, signals: ["upsell-interest"], trend: "improving" },
        { name: "Communication", score: 90, weight: 0.2, signals: ["weekly-sync"], trend: "stable" },
        { name: "Satisfaction", score: 92, weight: 0.15, signals: ["nps-10", "referral-given"], trend: "improving" },
        { name: "Support", score: 95, weight: 0.1, signals: ["self-service-mostly"], trend: "stable" },
      ]),
      assignedAdvisor: "business-advisor", nextCheckIn: ahead(5), lifetimeValueCents: 7200000, tags: ["enterprise", "expansion", "advocate"],
    },
    {
      customerId: "cust-004", currentStage: "churning", stageEnteredAt: ago(5),
      stageHistory: [
        { stage: "active", enteredAt: ago(200), exitedAt: ago(30), durationDays: 170 },
        { stage: "at-risk", enteredAt: ago(30), exitedAt: ago(5), durationDays: 25 },
      ],
      healthScore: mkHealth([
        { name: "Engagement", score: 10, weight: 0.3, signals: ["no-login-30-days"], trend: "declining" },
        { name: "Revenue", score: 20, weight: 0.25, signals: ["cancellation-request"], trend: "declining" },
        { name: "Communication", score: 5, weight: 0.2, signals: ["unresponsive"], trend: "declining" },
        { name: "Satisfaction", score: 15, weight: 0.15, signals: ["nps-1"], trend: "declining" },
        { name: "Support", score: 10, weight: 0.1, signals: ["complaint-filed"], trend: "declining" },
      ]),
      churnPrediction: {
        customerId: "cust-004", churnProbability: 0.94, predictedAt: now.toISOString(), modelVersion: "v2.1",
        riskFactors: [
          { factor: "cancellation-request", impact: 0.4, description: "Formal cancellation submitted" },
          { factor: "zero-engagement", impact: 0.3, description: "No activity for 30 days" },
          { factor: "competitor-switch", impact: 0.24, description: "Competitor mentioned in last call" },
        ],
        suggestedActions: ["Executive save call", "Offer 3-month discount", "Collect exit feedback"],
      },
      assignedAdvisor: "business-advisor", nextCheckIn: ahead(0), lifetimeValueCents: 2400000, tags: ["mid-market", "save-attempt"],
    },
    {
      customerId: "cust-005", currentStage: "onboarding", stageEnteredAt: ago(7),
      stageHistory: [
        { stage: "prospect", enteredAt: ago(60), exitedAt: ago(40), durationDays: 20 },
        { stage: "lead", enteredAt: ago(40), exitedAt: ago(20), durationDays: 20 },
        { stage: "qualified", enteredAt: ago(20), exitedAt: ago(7), durationDays: 13 },
      ],
      healthScore: mkHealth([
        { name: "Engagement", score: 70, weight: 0.3, signals: ["onboarding-in-progress"], trend: "improving" },
        { name: "Revenue", score: 100, weight: 0.25, signals: ["first-payment-received"], trend: "stable" },
        { name: "Communication", score: 85, weight: 0.2, signals: ["responsive-to-onboarding"], trend: "improving" },
        { name: "Satisfaction", score: 80, weight: 0.15, signals: ["positive-feedback"], trend: "improving" },
        { name: "Support", score: 75, weight: 0.1, signals: ["setup-questions"], trend: "stable" },
      ]),
      assignedAdvisor: "concierge-advisor", nextCheckIn: ahead(2), lifetimeValueCents: 0, tags: ["new-customer", "smb"],
    },
  ];

  // Fix customerId on health scores
  customers.forEach(c => { c.healthScore.customerId = c.customerId; });
  return customers;
}

// ── Lifecycle Pipeline ──────────────────────────────────────
function LifecyclePipeline({ customers, onSelect, selectedId }: { customers: CustomerLifecycleRecord[]; onSelect: (id: string) => void; selectedId: string | null }) {
  const stageCounts = useMemo(() => {
    const m: Record<string, number> = {};
    ALL_STAGES.forEach(s => m[s] = 0);
    customers.forEach(c => m[c.currentStage]++);
    return m;
  }, [customers]);

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {ALL_STAGES.map((stage) => {
        const style = STAGE_STYLES[stage];
        const count = stageCounts[stage];
        return (
          <div key={stage} className="flex flex-col items-center min-w-[80px]">
            <div className={`w-full rounded-lg px-2 py-2 text-center ${style.bg} ring-1 ${style.ring}`}>
              <p className={`text-lg font-bold ${style.text}`}>{count}</p>
              <p className="text-[9px] text-muted-foreground capitalize mt-0.5">{stage.replace("-", " ")}</p>
            </div>
            {stage !== "dormant" && <ArrowRight className="h-3 w-3 text-muted-foreground/40 mt-1" />}
          </div>
        );
      })}
    </div>
  );
}

// ── Health Dimension Bar ────────────────────────────────────
function DimensionBar({ dim }: { dim: CustomerHealthDimension }) {
  const TrendIcon = TREND_ICONS[dim.trend];
  const trendColor = dim.trend === "improving" ? "text-green-400" : dim.trend === "declining" ? "text-red-400" : "text-muted-foreground";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground">{dim.name}</span>
        <div className="flex items-center gap-1.5">
          <TrendIcon className={`h-3 w-3 ${trendColor}`} />
          <span className="text-xs font-mono text-foreground">{dim.score}</span>
        </div>
      </div>
      <Progress value={dim.score} className="h-1.5" />
    </div>
  );
}

// ── Churn Risk Card ─────────────────────────────────────────
function ChurnRiskCard({ prediction }: { prediction: ChurnPrediction }) {
  const riskPct = Math.round(prediction.churnProbability * 100);
  const riskLevel = riskPct >= 80 ? "critical" : riskPct >= 60 ? "high" : riskPct >= 30 ? "medium" : "low";
  const riskColors = { critical: "text-red-400 bg-red-500/15", high: "text-orange-400 bg-orange-500/15", medium: "text-amber-400 bg-amber-500/15", low: "text-green-400 bg-green-500/15" };

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Churn Risk
          </CardTitle>
          <Badge className={`${riskColors[riskLevel]} border-none text-xs`}>{riskLevel} — {riskPct}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={riskPct} className="h-2" />
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk Factors</p>
          {prediction.riskFactors.map((rf, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-foreground">{rf.description}</p>
                <p className="text-muted-foreground">Impact: {Math.round(rf.impact * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Suggested Actions</p>
          {prediction.suggestedActions.map((action, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-foreground">
              <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
              {action}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Customer Card ───────────────────────────────────────────
function CustomerCard({ record, selected, onClick }: { record: CustomerLifecycleRecord; selected: boolean; onClick: () => void }) {
  const style = STAGE_STYLES[record.currentStage];
  const grade = record.healthScore.grade;
  const ltv = (record.lifetimeValueCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Card
        className={`cursor-pointer transition-all ${selected ? "ring-2 ring-primary" : "hover:border-primary/30"}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg}`}>
                <span className={`text-sm font-bold ${style.text}`}>{grade}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{record.customerId}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={`text-[9px] ${style.bg} ${style.text} border-none`}>
                    {record.currentStage.replace("-", " ")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">LTV {ltv}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${GRADE_COLORS[grade]}`}>{record.healthScore.overallScore}</p>
              <p className="text-[10px] text-muted-foreground">health</p>
            </div>
          </div>
          {record.churnPrediction && record.churnPrediction.churnProbability > 0.3 && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>Churn risk: {Math.round(record.churnPrediction.churnProbability * 100)}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Live data loader ────────────────────────────────────────
function useLiveCustomerHealth(): { data: CustomerLifecycleRecord[] | null; loading: boolean } {
  const [data, setData] = useState<CustomerLifecycleRecord[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [custResult, twinResult] = await Promise.all([
          fromTable("customers").select("id, name, status, health_score, lifetime_revenue, last_contact_at, created_at, relationship_type"),
          fromTable("digital_twins").select("id, entity_type, entity_id, twin_data, health_score, churn_probability, trend, segment"),
        ]);

        const customers = (custResult.data ?? []) as never[];
        const twins = (twinResult.data ?? []) as never[];
        const twinsByEntity = new Map<string, any>();
        twins.forEach((t: any) => { if (t.entity_type === "customer") twinsByEntity.set(t.entity_id, t); });

        const now = new Date();
        const ago = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
        const ahead = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

        const records: CustomerLifecycleRecord[] = customers.map((c: any) => {
          const twin = twinsByEntity.get(c.id);
          const healthNum = twin?.health_score ?? c.health_score ?? 50;
          const churnProb = twin?.churn_probability ?? 0;
          const trend = twin?.trend ?? "stable";

          // Map customer status to lifecycle stage
          const stageMap: Record<string, CustomerLifecycleStage> = {
            active: "active", "at-risk": "at-risk", churned: "churned", prospect: "prospect",
            lead: "lead", onboarding: "onboarding", expansion: "expansion",
          };
          const currentStage: CustomerLifecycleStage = stageMap[c.status] ?? "active";

          const dims: CustomerHealthDimension[] = [
            { name: "Engagement", score: Math.min(100, healthNum + 5), weight: 0.3, signals: [], trend },
            { name: "Revenue", score: Math.min(100, Math.round((c.lifetime_revenue ?? 0) / 10000)), weight: 0.25, signals: [], trend: "stable" },
            { name: "Communication", score: c.last_contact_at ? Math.max(10, 100 - Math.round((Date.now() - new Date(c.last_contact_at).getTime()) / 86400000 * 5)) : 30, weight: 0.2, signals: [], trend },
            { name: "Satisfaction", score: healthNum, weight: 0.15, signals: [], trend },
            { name: "Support", score: Math.min(100, healthNum + 10), weight: 0.1, signals: [], trend: "stable" },
          ];

          const overallScore = computeOverallHealth(dims);
          const healthScore: CustomerHealthScore = {
            customerId: c.id, overallScore, grade: computeHealthGrade(overallScore),
            dimensions: dims, computedAt: now.toISOString(), nextReviewAt: ahead(7),
          };

          const churnPrediction: ChurnPrediction | undefined = churnProb > 0.2 ? {
            customerId: c.id, churnProbability: churnProb, predictedAt: now.toISOString(), modelVersion: "v2.1",
            riskFactors: [
              { factor: "health-score-low", impact: churnProb * 0.5, description: `Health score is ${healthNum}` },
              { factor: "engagement-trend", impact: churnProb * 0.3, description: `Trend: ${trend}` },
            ],
            suggestedActions: churnProb > 0.6 ? ["Schedule executive check-in", "Prepare retention offer"] : ["Monitor closely"],
          } : undefined;

          const daysSinceCreated = Math.round((Date.now() - new Date(c.created_at).getTime()) / 86400000);

          return {
            customerId: c.id, currentStage, stageEnteredAt: ago(Math.min(daysSinceCreated, 30)),
            stageHistory: [], healthScore, churnPrediction,
            assignedAdvisor: "business-advisor", nextCheckIn: ahead(7),
            lifetimeValueCents: (c.lifetime_revenue ?? 0) * 100, tags: [twin?.segment ?? c.relationship_type ?? "customer"].filter(Boolean),
          };
        });

        if (!cancelled) { setData(records); setLoading(false); }
      } catch (err) {
        console.error("[CustomerHealth] Failed to load live data:", err);
        if (!cancelled) { setData(null); setLoading(false); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

// ── Main Dashboard ──────────────────────────────────────────
export function CustomerHealthDashboard() {
  const { isDemoMode } = useDataMode();
  const demoCustomers = useMemo(() => createDemoCustomers(), []);
  const { data: liveCustomers, loading } = useLiveCustomerHealth();

  // Use demo data in demo mode, or if live load fails fall back to demo
  const customers = isDemoMode ? demoCustomers : (liveCustomers ?? demoCustomers);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (customers.length > 0 && !selectedId) setSelectedId(customers[0].customerId);
  }, [customers, selectedId]);

  const selected = customers.find(c => c.customerId === selectedId) ?? null;

  const avgHealth = customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.healthScore.overallScore, 0) / customers.length) : 0;
  const atRiskCount = customers.filter(c => ["at-risk", "churning", "churned"].includes(c.currentStage)).length;
  const expandCount = customers.filter(c => c.currentStage === "expansion").length;

  if (!isDemoMode && loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading customer health data…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{customers.length}</p><p className="text-xs text-muted-foreground">Total Customers</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10"><Heart className="h-5 w-5 text-green-400" /></div>
          <div><p className={`text-2xl font-bold ${GRADE_COLORS[computeHealthGrade(avgHealth)]}`}>{avgHealth}</p><p className="text-xs text-muted-foreground">Avg Health Score</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
          <div><p className="text-2xl font-bold text-red-400">{atRiskCount}</p><p className="text-xs text-muted-foreground">At Risk / Churning</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10"><TrendingUp className="h-5 w-5 text-emerald-400" /></div>
          <div><p className="text-2xl font-bold text-emerald-400">{expandCount}</p><p className="text-xs text-muted-foreground">Expanding</p></div>
        </CardContent></Card>
      </div>

      {/* Lifecycle Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Lifecycle Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LifecyclePipeline customers={customers} onSelect={setSelectedId} selectedId={selectedId} />
        </CardContent>
      </Card>

      {/* Customer List + Detail */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-2">
          {customers.map(c => (
            <CustomerCard key={c.customerId} record={c} selected={selectedId === c.customerId} onClick={() => setSelectedId(c.customerId)} />
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selected ? (
            <>
              {/* Health Score Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Health Score Breakdown</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-bold ${GRADE_COLORS[selected.healthScore.grade]}`}>
                        {selected.healthScore.overallScore}
                      </span>
                      <Badge variant="outline" className={GRADE_COLORS[selected.healthScore.grade]}>
                        Grade {selected.healthScore.grade}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selected.healthScore.dimensions.map((dim, i) => (
                    <DimensionBar key={i} dim={dim} />
                  ))}
                </CardContent>
              </Card>

              {/* Churn Risk */}
              {selected.churnPrediction && (
                <ChurnRiskCard prediction={selected.churnPrediction} />
              )}

              {/* Available Transitions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Available Transitions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getAvailableTransitions(selected.currentStage).map((t, i) => {
                      const toStyle = STAGE_STYLES[t.to];
                      return (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${STAGE_STYLES[t.from].bg} ${STAGE_STYLES[t.from].text} border-none text-[9px]`}>
                              {t.from}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline" className={`${toStyle.bg} ${toStyle.text} border-none text-[9px]`}>
                              {t.to}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{t.trigger}</span>
                            {t.requiresApproval && <Badge variant="outline" className="text-[8px]">Approval</Badge>}
                            {t.automatable && <Badge variant="outline" className="text-[8px] bg-primary/10 text-primary border-none">Auto</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Stage History */}
              {selected.stageHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Stage History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      {selected.stageHistory.map((sh, i) => {
                        const s = STAGE_STYLES[sh.stage];
                        return (
                          <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                            <Badge variant="outline" className={`${s.bg} ${s.text} border-none text-[9px]`}>{sh.stage}</Badge>
                            <span className="text-muted-foreground">{sh.durationDays} days</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Meta */}
              <Card>
                <CardContent className="p-4 grid grid-cols-2 gap-3 text-xs">
                  <div><p className="text-muted-foreground">Advisor</p><p className="text-foreground font-medium">{selected.assignedAdvisor ?? "Unassigned"}</p></div>
                  <div><p className="text-muted-foreground">Next Check-in</p><p className="text-foreground font-medium">{new Date(selected.nextCheckIn).toLocaleDateString()}</p></div>
                  <div><p className="text-muted-foreground">LTV</p><p className="text-foreground font-medium">{(selected.lifetimeValueCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</p></div>
                  <div><p className="text-muted-foreground">Tags</p><div className="flex flex-wrap gap-1 mt-0.5">{selected.tags.map((t, i) => <Badge key={i} variant="secondary" className="text-[9px]">{t}</Badge>)}</div></div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">Select a customer to view details</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerHealthDashboard;
