// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Mode: Plain-English Founder Control Room
// The simplest, safest, most calming admin surface
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useWhatMattersNow, useMissionControlSummary, useFounderCostSummary,
  useTrustSummary, useRecoverySummary, useConnectorSummaries, useAITeamSummary,
  useIncidentSummaries,
} from "@/hooks/use-mission-control-views";
import {
  AlertTriangle, DollarSign, Shield, Heart, Wifi, TrendingUp, Eye,
  Rocket, Package, Cpu, Settings, RotateCcw, BarChart3, Sparkles,
  CheckCircle, XCircle, Pause, Play, ChevronRight, Gauge, Users,
  CreditCard, Lightbulb, Target,
} from "lucide-react";

// ── What Matters Now ────────────────────────────────────────────
function WhatMattersNow() {
  const items = useWhatMattersNow();
  const navigate = useNavigate();
  const urgencyDot: Record<string, string> = { critical: "bg-destructive", high: "bg-accent", medium: "bg-primary", low: "bg-muted-foreground", info: "bg-primary/50" };
  const urgencyBg: Record<string, string> = { critical: "border-destructive/20 bg-destructive/5", high: "border-accent/20 bg-accent/5", medium: "border-primary/15 bg-primary/3", low: "border-border bg-card/50", info: "border-border bg-card/30" };

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-trust-verified/20 bg-trust-verified/5 p-8 text-center">
          <CheckCircle className="h-8 w-8 text-trust-safe mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Everything looks good</p>
          <p className="text-xs text-muted-foreground mt-1">No urgent items need your attention right now</p>
        </div>
      ) : items.slice(0, 6).map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
          className={cn("flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer hover:shadow-sm transition-all", urgencyBg[item.urgency])}
          onClick={() => item.actionRoute && navigate(item.actionRoute)}
        >
          <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", urgencyDot[item.urgency])} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
          </div>
          {item.actionLabel && <span className="text-[10px] font-medium text-primary shrink-0">{item.actionLabel} →</span>}
        </motion.div>
      ))}
    </div>
  );
}

// ── Revenue Summary ─────────────────────────────────────────────
function RevenueSummary() {
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="What's making money">Revenue</SitaCardTitle>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: "Monthly Revenue", value: "$112K", trend: "+18%" },
          { label: "Annual Run Rate", value: "$1.34M", trend: "+12%" },
          { label: "Pipeline Value", value: "$1.2M", trend: "23 deals" },
          { label: "Churn Risk", value: "$234K", trend: "5 accounts" },
        ].map(m => (
          <div key={m.label} className="rounded-xl bg-secondary/30 p-3">
            <p className="font-display text-lg font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
            <p className="text-[10px] text-primary mt-0.5">{m.trend}</p>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Cost Summary ────────────────────────────────────────────────
function CostSummary() {
  const cost = useFounderCostSummary();
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="What's costing you">Costs</SitaCardTitle>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">AI Budget Used</span>
          <span className={cn("font-display text-sm font-bold", cost.budgetUtilization > 80 ? "text-accent" : "text-foreground")}>{cost.budgetUtilization}%</span>
        </div>
        <Progress value={cost.budgetUtilization} className="h-2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className="font-display text-sm font-bold text-foreground">${cost.totalCostToday.toFixed(2)}</p>
            <p className="text-[9px] text-muted-foreground">Today's Spend</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className="font-display text-sm font-bold text-foreground">{cost.anomalyCount}</p>
            <p className="text-[9px] text-muted-foreground">Anomalies</p>
          </div>
        </div>
        {cost.recommendations.map((r, i) => (
          <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {r}
          </p>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Risk Summary ────────────────────────────────────────────────
function RiskSummary() {
  const incidents = useIncidentSummaries();
  const recovery = useRecoverySummary();
  const openInc = incidents.filter(i => i.status !== "resolved");
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="What needs caution">Risk</SitaCardTitle>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className={cn("font-display text-lg font-bold", openInc.length > 0 ? "text-accent" : "text-foreground")}>{openInc.length}</p>
            <p className="text-[9px] text-muted-foreground">Open Incidents</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className={cn("font-display text-lg font-bold", recovery.stuckWorkflows > 0 ? "text-accent" : "text-foreground")}>{recovery.stuckWorkflows}</p>
            <p className="text-[9px] text-muted-foreground">Stuck Workflows</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className="font-display text-lg font-bold text-foreground">{recovery.degradedServices}</p>
            <p className="text-[9px] text-muted-foreground">Degraded</p>
          </div>
        </div>
        {openInc.slice(0, 2).map(inc => (
          <div key={inc.id} className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/15 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{inc.title}</p>
              <p className="text-[10px] text-muted-foreground">{inc.severity} · {inc.affectedModules.join(", ")}</p>
            </div>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Trust & Health ──────────────────────────────────────────────
function TrustHealth() {
  const trust = useTrustSummary();
  const summary = useMissionControlSummary();
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="System trust & health">Trust & Health</SitaCardTitle>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className={cn("h-7 w-7", trust.posture === "verified" ? "text-trust-safe" : "text-accent")} />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground">{summary.systemScore}</p>
            <p className="text-[10px] text-muted-foreground">System Health Score · Trust: {trust.posture}</p>
          </div>
        </div>
        {[
          { label: "Policy Confidence", value: trust.policyConfidence },
          { label: "Proof Completeness", value: trust.proofCompleteness },
          { label: "Rollback Readiness", value: trust.rollbackReadiness },
        ].map(m => (
          <div key={m.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-semibold text-foreground">{m.value}%</span>
            </div>
            <Progress value={m.value} className="h-1.5" />
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Connectors Plain English ────────────────────────────────────
function ConnectorsPlainEnglish() {
  const connectors = useConnectorSummaries();
  const navigate = useNavigate();
  const healthy = connectors.filter(c => c.status === "connected");
  const degraded = connectors.filter(c => c.status !== "connected");

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub={`${healthy.length} healthy, ${degraded.length} need attention`}>Connectors</SitaCardTitle>
      <div className="mt-4 space-y-2">
        {degraded.length === 0 ? (
          <div className="rounded-lg bg-trust-verified/5 border border-trust-verified/15 p-3 text-center">
            <p className="text-xs text-trust-safe font-medium">All connectors healthy ✓</p>
          </div>
        ) : degraded.map(c => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg bg-accent/5 border border-accent/15 px-3 py-2.5 cursor-pointer hover:bg-accent/8 transition-colors"
            onClick={() => navigate(`/mission/connectors/${c.id}`)}
          >
            <Wifi className="h-4 w-4 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{c.name} is {c.status}</p>
              <p className="text-[10px] text-muted-foreground">Health: {c.healthScore}/100 · {c.recommendation || "Monitor"}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        ))}
        {healthy.slice(0, 3).map(c => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg bg-secondary/20 px-3 py-2 cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => navigate(`/mission/connectors/${c.id}`)}
          >
            <Wifi className="h-4 w-4 text-trust-safe shrink-0" />
            <span className="text-xs text-foreground">{c.name}</span>
            <Badge variant="outline" className="text-[9px] ml-auto bg-trust-verified/10 text-trust-safe">healthy</Badge>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Rollout & Safety Controls ───────────────────────────────────
function RolloutControls() {
  const summary = useMissionControlSummary();
  const [safeMode, setSafeMode] = useState(summary.safeModeActive);

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Deployment & safety">Rollout & Safety</SitaCardTitle>
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
          <div className="flex items-center gap-3">
            <Shield className={cn("h-5 w-5", safeMode ? "text-accent" : "text-muted-foreground")} />
            <div>
              <p className="text-xs font-semibold text-foreground">Safe Mode</p>
              <p className="text-[10px] text-muted-foreground">{safeMode ? "Pauses high-risk automation" : "All systems operating normally"}</p>
            </div>
          </div>
          <Switch checked={safeMode} onCheckedChange={setSafeMode} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className="font-display text-sm font-bold text-foreground">{summary.releaseSummary.currentVersion}</p>
            <p className="text-[9px] text-muted-foreground">Current Version</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className={cn("font-display text-sm font-bold", summary.releaseSummary.canaryHealth >= 90 ? "text-trust-safe" : "text-accent")}>
              {summary.releaseSummary.canaryHealth}%
            </p>
            <p className="text-[9px] text-muted-foreground">Canary Health</p>
          </div>
        </div>
      </div>
    </SitaCard>
  );
}

// ── AI Team Plain English ───────────────────────────────────────
function AITeamSummary() {
  const team = useAITeamSummary();
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub={`${team.totalAgents} agents, ${team.healthyCount} healthy`}>AI Team</SitaCardTitle>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-trust-verified/5 p-2.5 text-center">
          <p className="font-display text-lg font-bold text-trust-safe">{team.healthyCount}</p>
          <p className="text-[9px] text-muted-foreground">Healthy</p>
        </div>
        <div className={cn("rounded-lg p-2.5 text-center", team.degradedCount > 0 ? "bg-accent/5" : "bg-secondary/30")}>
          <p className={cn("font-display text-lg font-bold", team.degradedCount > 0 ? "text-accent" : "text-foreground")}>{team.degradedCount}</p>
          <p className="text-[9px] text-muted-foreground">Degraded</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2">
        <span className="text-[11px] text-muted-foreground">Governance</span>
        <Badge variant="outline" className={cn("text-[9px]",
          team.governanceState === "compliant" ? "bg-trust-verified/10 text-trust-safe" : "bg-accent/10 text-accent"
        )}>{team.governanceState}</Badge>
      </div>
    </SitaCard>
  );
}

// ── Platform Maturity ───────────────────────────────────────────
function PlatformMaturity() {
  const maturity = [
    { area: "Core Platform", score: 92, status: "Production" },
    { area: "Trust & Proof", score: 88, status: "Beta" },
    { area: "AI Workforce", score: 75, status: "Alpha" },
    { area: "Connectors", score: 81, status: "Production" },
    { area: "Owner Controls", score: 70, status: "Alpha" },
  ];
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="How mature is the platform">Platform Maturity</SitaCardTitle>
      <div className="mt-4 space-y-2.5">
        {maturity.map(m => (
          <div key={m.area}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-foreground">{m.area}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{m.status}</Badge>
                <span className="text-[10px] font-mono text-muted-foreground">{m.score}%</span>
              </div>
            </div>
            <Progress value={m.score} className="h-1.5" />
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Quick Actions ───────────────────────────────────────────────
function OwnerQuickActions() {
  const navigate = useNavigate();
  const actions = [
    { label: "Advanced Owner Dashboard", route: "/owner", icon: BarChart3 },
    { label: "Mission Control", route: "/mission-control", icon: Cpu },
    { label: "Policy Simulator", route: "/policy-simulator", icon: Shield },
    { label: "Workflow Replay", route: "/workflow-replay", icon: RotateCcw },
    { label: "Observability", route: "/observability", icon: Eye },
    { label: "Users", route: "/users", icon: Users },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {actions.map(a => (
        <button key={a.route} onClick={() => navigate(a.route)}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-card/60 p-3 text-left hover:bg-secondary/50 hover:border-primary/20 transition-all group"
        >
          <a.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs text-foreground group-hover:text-primary transition-colors">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function OwnerModePage() {
  const [tab, setTab] = useState("now");
  const summary = useMissionControlSummary();

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-5">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4 mb-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Your Control Room</h1>
            <p className="text-sm text-muted-foreground">
              Everything important about your business, in plain English
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: "System Health", value: `${summary.systemScore}`, ok: summary.systemScore >= 80, icon: Heart },
            { label: "Open Incidents", value: `${summary.incidentsSummary.open}`, ok: summary.incidentsSummary.open === 0, icon: AlertTriangle },
            { label: "AI Budget", value: `${summary.costSummary.utilization}%`, ok: summary.costSummary.utilization < 80, icon: DollarSign },
            { label: "Trust", value: summary.trustPosture, ok: summary.trustPosture === "verified", icon: Shield },
          ].map(m => (
            <div key={m.label} className={cn("rounded-xl border px-3 py-2.5 text-center", m.ok ? "border-border bg-card/50" : "border-accent/20 bg-accent/5")}>
              <m.icon className={cn("h-4 w-4 mx-auto mb-1", m.ok ? "text-muted-foreground" : "text-accent")} />
              <p className={cn("font-display text-base font-bold", m.ok ? "text-foreground" : "text-accent")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5 flex-wrap">
          {[
            { value: "now", label: "What Matters Now", icon: AlertTriangle },
            { value: "money", label: "Money", icon: DollarSign },
            { value: "risk", label: "Risk & Trust", icon: Shield },
            { value: "health", label: "Health", icon: Heart },
            { value: "controls", label: "Controls", icon: Settings },
            { value: "maturity", label: "Maturity", icon: Target },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <t.icon className="h-3 w-3 mr-1.5" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-5">
          <TabsContent value="now">
            <WhatMattersNow />
          </TabsContent>

          <TabsContent value="money">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RevenueSummary />
              <CostSummary />
            </div>
          </TabsContent>

          <TabsContent value="risk">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RiskSummary />
              <TrustHealth />
            </div>
          </TabsContent>

          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ConnectorsPlainEnglish />
              <AITeamSummary />
            </div>
          </TabsContent>

          <TabsContent value="controls">
            <div className="space-y-4">
              <RolloutControls />
              <OwnerQuickActions />
            </div>
          </TabsContent>

          <TabsContent value="maturity">
            <PlatformMaturity />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
