// ═══════════════════════════════════════════════════════════════
// SITA OS — Owner Mode: Plain-English Founder Control Room
// Layer 1: The simplest, safest, most calming admin surface
// All 16 required sections embedded as tabs/cards
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdminPageHeader, TrustRibbon, SafeModeBanner, QuickActionsDock, StatusBadge } from "@/platform/sita/components/sita/admin";
import {
  useWhatMattersNow, useMissionControlSummary, useFounderCostSummary,
  useTrustSummary, useRecoverySummary, useConnectorSummaries, useAITeamSummary,
  useIncidentSummaries, useSystemActivity,
} from "@/platform/mission-control/hooks/use-mission-control-views";
import {
  AlertTriangle, DollarSign, Shield, Heart, Wifi, Sparkles, Eye,
  Rocket, Package, Cpu, Settings, RotateCcw, BarChart3, Gauge,
  CheckCircle, ChevronRight, Lightbulb, Target, Play, TrendingUp,
  Clock, Users, Undo2, FileSearch,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// ── Section: What Matters Now ───────────────────────────────────
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
      ) : items.slice(0, 8).map((item, i) => (
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

// ── Section: Revenue Summary ────────────────────────────────────
function RevenueSummary() {
  const metrics = [
    { label: "Monthly Revenue", value: "$112K", trend: "+18%", up: true },
    { label: "Annual Run Rate", value: "$1.34M", trend: "+12%", up: true },
    { label: "Pipeline Value", value: "$1.2M", trend: "23 deals", up: true },
    { label: "Churn Risk", value: "$234K", trend: "5 accounts", up: false },
  ];
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="What's making money">Revenue</SitaCardTitle>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl bg-secondary/30 p-3">
            <p className="font-display text-lg font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
            <p className={cn("text-[10px] mt-0.5", m.up ? "text-trust-safe" : "text-accent")}>{m.trend}</p>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Cost Summary ───────────────────────────────────────
function CostSummary() {
  const cost = useFounderCostSummary();
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="What's costing you">Costs & AI Spend</SitaCardTitle>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">AI Budget Used</span>
          <span className={cn("font-display text-sm font-bold", cost.budgetUtilization > 80 ? "text-accent" : "text-foreground")}>{cost.budgetUtilization}%</span>
        </div>
        <Progress value={cost.budgetUtilization} className="h-2" />
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className="font-display text-sm font-bold text-foreground">${cost.totalCostToday.toFixed(2)}</p>
            <p className="text-[9px] text-muted-foreground">Today</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className="font-display text-sm font-bold text-foreground">${cost.dailyBudget.toFixed(2)}</p>
            <p className="text-[9px] text-muted-foreground">Budget</p>
          </div>
          <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
            <p className={cn("font-display text-sm font-bold", cost.anomalyCount > 0 ? "text-accent" : "text-foreground")}>{cost.anomalyCount}</p>
            <p className="text-[9px] text-muted-foreground">Anomalies</p>
          </div>
        </div>
        {cost.topSpenders.slice(0, 3).map(s => (
          <div key={s.name} className="flex items-center justify-between text-[11px] rounded-lg bg-secondary/20 px-3 py-1.5">
            <span className="text-muted-foreground">{s.name}</span>
            <span className="text-foreground font-medium">{s.tokens.toLocaleString()} tokens · ${s.cost.toFixed(3)}</span>
          </div>
        ))}
        {cost.recommendations.map((r, i) => (
          <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <Lightbulb className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {r}
          </p>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Risk Summary ───────────────────────────────────────
function RiskSummary() {
  const incidents = useIncidentSummaries();
  const recovery = useRecoverySummary();
  const openInc = incidents.filter(i => i.status !== "resolved");
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="What needs caution">Risk Overview</SitaCardTitle>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Open Incidents", value: openInc.length, warn: openInc.length > 0 },
            { label: "Stuck Workflows", value: recovery.stuckWorkflows, warn: recovery.stuckWorkflows > 0 },
            { label: "Degraded Services", value: recovery.degradedServices, warn: recovery.degradedServices > 0 },
          ].map(m => (
            <div key={m.label} className="rounded-lg bg-secondary/30 p-2.5 text-center">
              <p className={cn("font-display text-lg font-bold", m.warn ? "text-accent" : "text-foreground")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        {openInc.slice(0, 3).map(inc => (
          <div key={inc.id} className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/15 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{inc.title}</p>
              <p className="text-[10px] text-muted-foreground">{inc.severity} · {inc.affectedModules.join(", ")}</p>
            </div>
            <StatusBadge status={inc.status} size="xs" />
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Trust & Health ─────────────────────────────────────
function TrustHealth() {
  const trust = useTrustSummary();
  const summary = useMissionControlSummary();
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="System trust posture">Trust & Health</SitaCardTitle>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className={cn("h-7 w-7", trust.posture === "verified" ? "text-trust-safe" : "text-accent")} />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground">{summary.systemScore}</p>
            <p className="text-[10px] text-muted-foreground">System Score · Trust: <StatusBadge status={trust.posture} size="xs" /></p>
          </div>
        </div>
        {[
          { label: "Policy Confidence", value: trust.policyConfidence },
          { label: "Proof Completeness", value: trust.proofCompleteness },
          { label: "Verification Health", value: trust.verificationHealth },
          { label: "Rollback Readiness", value: trust.rollbackReadiness },
        ].map(m => (
          <div key={m.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">{m.label}</span>
              <span className={cn("font-semibold", m.value >= 90 ? "text-trust-safe" : m.value >= 70 ? "text-foreground" : "text-accent")}>{m.value}%</span>
            </div>
            <Progress value={m.value} className="h-1.5" />
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Incidents Plain Language ────────────────────────────
function IncidentsPlainLanguage() {
  const incidents = useIncidentSummaries();
  const navigate = useNavigate();
  const open = incidents.filter(i => i.status !== "resolved");
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub={`${open.length} open, ${incidents.length - open.length} resolved`}>Incidents</SitaCardTitle>
      <div className="mt-4 space-y-2">
        {open.length === 0 ? (
          <div className="rounded-lg bg-trust-verified/5 border border-trust-verified/15 p-4 text-center">
            <CheckCircle className="h-5 w-5 text-trust-safe mx-auto mb-2" />
            <p className="text-xs text-trust-safe font-medium">No active incidents</p>
          </div>
        ) : open.map(inc => (
          <div key={inc.id} className="flex items-center gap-3 rounded-xl border border-accent/15 bg-accent/5 p-3 cursor-pointer hover:bg-accent/8 transition-colors"
            onClick={() => navigate(`/mission/incidents/${inc.id}`)}
          >
            <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{inc.title}</p>
              <p className="text-[10px] text-muted-foreground">{inc.recoveryStatus} · {inc.affectedModules.join(", ")}</p>
            </div>
            <StatusBadge status={inc.severity} size="xs" />
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Connectors Plain English ───────────────────────────
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
        {healthy.slice(0, 4).map(c => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg bg-secondary/20 px-3 py-2 cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => navigate(`/mission/connectors/${c.id}`)}
          >
            <Wifi className="h-4 w-4 text-trust-safe shrink-0" />
            <span className="text-xs text-foreground">{c.name}</span>
            <StatusBadge status="healthy" size="xs" className="ml-auto" />
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Rollout & Safety Controls ──────────────────────────
function RolloutControls() {
  const summary = useMissionControlSummary();
  const [safeMode, setSafeMode] = useState(summary.safeModeActive);

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Deployment safety">Rollout & Safe Mode</SitaCardTitle>
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
          <div className="flex items-center gap-3">
            <Shield className={cn("h-5 w-5", safeMode ? "text-accent" : "text-muted-foreground")} />
            <div>
              <p className="text-xs font-semibold text-foreground">Global Safe Mode</p>
              <p className="text-[10px] text-muted-foreground">{safeMode ? "High-risk automation paused" : "All systems normal"}</p>
            </div>
          </div>
          <Switch checked={safeMode} onCheckedChange={setSafeMode} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Version", value: summary.releaseSummary.currentVersion },
            { label: "Canary", value: `${summary.releaseSummary.canaryHealth}%`, ok: summary.releaseSummary.canaryHealth >= 90 },
            { label: "Ring", value: summary.releaseSummary.ringStatus },
          ].map(m => (
            <div key={m.label} className="rounded-lg bg-secondary/30 p-2.5 text-center">
              <p className={cn("font-display text-sm font-bold", "ok" in m && !m.ok ? "text-accent" : "text-foreground")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </SitaCard>
  );
}

// ── Section: AI Team ────────────────────────────────────────────
function AITeamPlainEnglish() {
  const team = useAITeamSummary();
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub={`${team.totalAgents} agents working`}>Your AI Team</SitaCardTitle>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Healthy", value: team.healthyCount, color: "text-trust-safe" },
            { label: "Degraded", value: team.degradedCount, color: team.degradedCount > 0 ? "text-accent" : "text-foreground" },
            { label: "Paused", value: team.pausedCount, color: "text-muted-foreground" },
          ].map(m => (
            <div key={m.label} className="rounded-lg bg-secondary/30 p-2.5 text-center">
              <p className={cn("font-display text-lg font-bold", m.color)}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2">
          <span className="text-[11px] text-muted-foreground">Governance</span>
          <StatusBadge status={team.governanceState} showIcon size="xs" />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2">
          <span className="text-[11px] text-muted-foreground">24h Token Usage</span>
          <span className="text-xs font-mono text-foreground">{team.totalTokens24h.toLocaleString()}</span>
        </div>
      </div>
    </SitaCard>
  );
}

// ── Section: Preview Before Publish ─────────────────────────────
function PreviewBeforePublish() {
  const [previewing, setPreviewing] = useState(false);
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="See changes before they go live">Preview Before Publish</SitaCardTitle>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg bg-secondary/20 p-4 text-center">
          <FileSearch className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No pending changes to preview</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Changes will appear here before going live</p>
        </div>
        <button
          onClick={() => setPreviewing(!previewing)}
          className="w-full rounded-lg border border-border py-2 text-[11px] text-muted-foreground hover:bg-secondary transition-colors"
        >
          <Eye className="h-3 w-3 inline mr-1" /> {previewing ? "Close Preview" : "Open Change Preview"}
        </button>
      </div>
    </SitaCard>
  );
}

// ── Section: Undo Last Admin Change ─────────────────────────────
function UndoLastChange() {
  const changes = [
    { id: "ch-1", action: "Updated AI budget to $5/day", time: "2 hours ago", reversible: true },
    { id: "ch-2", action: "Enabled Plaid connector", time: "5 hours ago", reversible: true },
    { id: "ch-3", action: "Changed pricing tier", time: "1 day ago", reversible: false },
  ];
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Reverse recent admin changes">Undo Changes</SitaCardTitle>
      <div className="mt-4 space-y-2">
        {changes.map(c => (
          <div key={c.id} className="flex items-center gap-3 rounded-lg bg-secondary/20 px-3 py-2.5">
            <Undo2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">{c.action}</p>
              <p className="text-[10px] text-muted-foreground">{c.time}</p>
            </div>
            {c.reversible ? (
              <button className="text-[10px] font-medium text-primary hover:underline">Undo</button>
            ) : (
              <span className="text-[10px] text-muted-foreground/50">Not reversible</span>
            )}
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Platform Maturity ──────────────────────────────────
function PlatformMaturity() {
  const maturity = [
    { area: "Core Platform", score: 92, status: "production" },
    { area: "Trust & Proof", score: 88, status: "beta" },
    { area: "AI Workforce", score: 75, status: "alpha" },
    { area: "Connectors", score: 81, status: "production" },
    { area: "Owner Controls", score: 70, status: "alpha" },
    { area: "Policy Engine", score: 85, status: "beta" },
    { area: "Replay & Recovery", score: 65, status: "alpha" },
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
                <StatusBadge status={m.status} size="xs" />
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

// ── Section: Simple Advisor Config ──────────────────────────────
function SimpleAdvisorConfig() {
  const advisors = [
    { name: "Money Advisor", autonomy: "draft", healthy: true },
    { name: "Business Advisor", autonomy: "execute", healthy: true },
    { name: "Concierge Advisor", autonomy: "approval", healthy: false },
  ];
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Quick advisor adjustments">Advisor Config</SitaCardTitle>
      <div className="mt-4 space-y-2">
        {advisors.map(a => (
          <div key={a.name} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", a.healthy ? "bg-trust-safe" : "bg-accent")} />
              <span className="text-xs text-foreground">{a.name}</span>
            </div>
            <StatusBadge status={a.autonomy} size="xs" />
          </div>
        ))}
        <button className="w-full rounded-lg border border-border py-2 text-[11px] text-muted-foreground hover:bg-secondary transition-colors mt-2">
          <Settings className="h-3 w-3 inline mr-1" /> Advanced Config →
        </button>
      </div>
    </SitaCard>
  );
}

// ── Section: Simple Pack Editor ─────────────────────────────────
function SimplePackEditor() {
  const packs = [
    { name: "Business Starter", status: "active", users: 12 },
    { name: "Finance Pro", status: "active", users: 8 },
    { name: "Family Pack", status: "draft", users: 0 },
  ];
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Quick pack overview">Pack Controls</SitaCardTitle>
      <div className="mt-4 space-y-2">
        {packs.map(p => (
          <div key={p.name} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground">{p.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{p.users} users</span>
              <StatusBadge status={p.status} size="xs" />
            </div>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Simple Pricing Editor ──────────────────────────────
function SimplePricingEditor() {
  const tiers = [
    { name: "Starter", price: "$29/mo", active: true },
    { name: "Professional", price: "$79/mo", active: true },
    { name: "Enterprise", price: "Custom", active: true },
  ];
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Current pricing tiers">Pricing</SitaCardTitle>
      <div className="mt-4 space-y-2">
        {tiers.map(t => (
          <div key={t.name} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5">
            <span className="text-xs font-medium text-foreground">{t.name}</span>
            <span className="text-xs font-mono text-muted-foreground">{t.price}</span>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Section: Recent Activity ────────────────────────────────────
function RecentActivity() {
  const activity = useSystemActivity();
  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Latest system events">Recent Activity</SitaCardTitle>
      <div className="mt-4 space-y-1">
        {activity.slice(0, 6).map(evt => (
          <div key={evt.id} className="flex items-center gap-3 rounded-lg px-3 py-1.5 hover:bg-secondary/20 transition-colors">
            <div className={cn("h-2 w-2 rounded-full shrink-0",
              evt.severity === "error" ? "bg-destructive" : evt.severity === "warning" ? "bg-accent" : evt.severity === "success" ? "bg-trust-safe" : "bg-primary/50"
            )} />
            <span className="text-[11px] text-foreground flex-1 truncate">{evt.event}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{new Date(evt.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Owner Mode Page — 8 tabs covering all 16 sections
// ═══════════════════════════════════════════════════════════════
export default function OwnerModePage() {
  const [tab, setTab] = useState("now");
  const summary = useMissionControlSummary();

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {/* Safe Mode Banner */}
      <SafeModeBanner />

      {/* Hero Header */}
      <AdminPageHeader icon={Sparkles} title="Your Control Room" subtitle="Everything important about your business, in plain English">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-5">
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
      </AdminPageHeader>

      {/* Trust Ribbon */}
      <TrustRibbon />

      {/* Tabs — 8 tabs for all 16 sections */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5 flex-wrap">
          {[
            { value: "now", label: "What Matters", icon: AlertTriangle },
            { value: "money", label: "Money", icon: DollarSign },
            { value: "risk", label: "Risk & Trust", icon: Shield },
            { value: "health", label: "Health", icon: Heart },
            { value: "controls", label: "Controls", icon: Settings },
            { value: "config", label: "Config", icon: Cpu },
            { value: "maturity", label: "Maturity", icon: Target },
            { value: "activity", label: "Activity", icon: Eye },
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
              <IncidentsPlainLanguage />
            </div>
          </TabsContent>

          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrustHealth />
              <ConnectorsPlainEnglish />
              <AITeamPlainEnglish />
              <RecentActivity />
            </div>
          </TabsContent>

          <TabsContent value="controls">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RolloutControls />
              <PreviewBeforePublish />
              <UndoLastChange />
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-foreground mb-3">Quick Navigation</p>
              <QuickActionsDock compact />
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SimpleAdvisorConfig />
              <SimplePackEditor />
              <SimplePricingEditor />
            </div>
          </TabsContent>

          <TabsContent value="maturity">
            <PlatformMaturity />
          </TabsContent>

          <TabsContent value="activity">
            <RecentActivity />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
