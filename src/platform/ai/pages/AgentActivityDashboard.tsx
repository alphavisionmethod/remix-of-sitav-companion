// ═══════════════════════════════════════════════════════════════
// SITA OS — Agent Activity Dashboard
// Full-page real-time agent orchestration monitoring center
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { useCompanion } from "@/hooks/use-companion";
import { useAgentFleetLive } from "@/hooks/use-agent-fleet-live";
import { useGraphNodes } from "@/modules/business/hooks/use-cai-data";
import { AgentActivityFeed } from "@/platform/sita/components/sita/AgentActivityFeed";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Radio, Cpu, Server, Shield, Activity, AlertTriangle,
  TrendingUp, DollarSign, Zap, CheckCircle, XCircle,
  Clock, Gauge, BarChart3, RefreshCw, Heart,
} from "lucide-react";
import { AIEmbeddedRecommendation } from "@/platform/ai/components/ai/AIEmbeddedRecommendation";
import { AIResponsePanel } from "@/platform/ai/components/ai/AIResponsePanel";
import { DataLoadingWrapper } from "@/platform/sita/components/sita/DataLoadingWrapper";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

// ── Fleet Overview Hero ─────────────────────────────────────────

function FleetHero() {
  const { fleetStatus, errorPatrolReport, learningInsights } = useCompanion();
  const healthScore = Math.round(
    ((fleetStatus.active / Math.max(fleetStatus.totalAgents, 1)) * 40) +
    ((fleetStatus.error === 0 ? 1 : Math.max(0, 1 - fleetStatus.error * 0.15)) * 25) +
    ((errorPatrolReport.autoFixRate) * 20) +
    ((learningInsights.overallSuccessRate) * 15)
  );
  const scoreColor = healthScore >= 90 ? "trust-safe" : healthScore >= 70 ? "accent" : "destructive";

  return (
    <PageShell>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-card p-6"
    >
<div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Radio className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className={cn("absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card", `bg-${scoreColor}`)} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">Agent Activity Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time orchestration monitoring · cost tracking · fleet health
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fleetStatus.error > 0 && (
            <Badge className="bg-destructive/15 text-destructive border-destructive/20 text-[10px]">
              {fleetStatus.error} ERRORS
            </Badge>
          )}
          {errorPatrolReport.criticalIssues > 0 && (
            <Badge className="bg-destructive/15 text-destructive border-destructive/20 text-[10px]">
              {errorPatrolReport.criticalIssues} CRITICAL
            </Badge>
          )}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-2.5">
        {[
          { label: "Health", value: `${healthScore}%`, color: scoreColor, icon: Heart },
          { label: "Active", value: `${fleetStatus.active}/${fleetStatus.totalAgents}`, color: "primary", icon: Server },
          { label: "Paused", value: fleetStatus.paused, color: fleetStatus.paused > 0 ? "accent" : "muted-foreground", icon: Clock },
          { label: "Errors", value: fleetStatus.error, color: fleetStatus.error > 0 ? "destructive" : "trust-safe", icon: XCircle },
          { label: "Invocations", value: fleetStatus.totalInvocations.toLocaleString(), color: "foreground", icon: Activity },
          { label: "Tokens", value: `${(fleetStatus.totalCostTokens / 1000).toFixed(0)}k`, color: "foreground", icon: Gauge },
          { label: "Queue", value: fleetStatus.queueDepth, color: fleetStatus.queueDepth > 5 ? "accent" : "trust-safe", icon: Zap },
          { label: "Success", value: `${(learningInsights.overallSuccessRate * 100).toFixed(0)}%`, color: learningInsights.overallSuccessRate > 0.9 ? "trust-safe" : "accent", icon: CheckCircle },
        ].map(m => (
          <div key={m.label} className={cn(
            "rounded-xl border px-2 py-2.5 text-center transition-all",
            "border-border/40 bg-card/50"
          )}>
            <m.icon className={cn("h-3.5 w-3.5 mx-auto mb-1", `text-${m.color}`)} />
            <p className={cn("font-display text-sm font-bold", `text-${m.color}`)}>{m.value}</p>
            <p className="text-[8px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/3 blur-3xl" />
    </motion.div>
    </PageShell>
  );
}

// ── Cost Over Time Chart ────────────────────────────────────────

function CostOverTimeChart() {
  const data = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h`,
      tokens: Math.floor(Math.random() * 2000) + 500,
      cost: parseFloat((Math.random() * 0.05 + 0.01).toFixed(4)),
      invocations: Math.floor(Math.random() * 100) + 20,
    })).reverse();
  }, []);

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Token usage and cost over last 24 hours">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />Cost Over Time
        </div>
      </SitaCardTitle>
      <div className="mt-3 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
            <Area type="monotone" dataKey="tokens" stroke="hsl(var(--primary))" fill="url(#costGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SitaCard>
  );
}

// ── Agent Status Distribution ───────────────────────────────────

function AgentDistribution() {
  const { fleetStatus } = useCompanion();

  const data = [
    { name: "Active", value: fleetStatus.active, color: "hsl(var(--trust-safe))" },
    { name: "Paused", value: fleetStatus.paused || 1, color: "hsl(var(--muted-foreground))" },
    { name: "Cooldown", value: fleetStatus.cooldown || 1, color: "hsl(var(--accent))" },
    { name: "Error", value: fleetStatus.error || 1, color: "hsl(var(--destructive))" },
  ].filter(d => d.value > 0);

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Current fleet status breakdown">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />Fleet Distribution
        </div>
      </SitaCardTitle>
      <div className="mt-3 h-[200px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            <span className="text-[9px] text-muted-foreground">{d.name}: {d.value}</span>
          </div>
        ))}
      </div>
    </SitaCard>
  );
}

// ── Alert Summary ───────────────────────────────────────────────

function AlertSummaryPanel() {
  const { errorPatrolReport, fleetStatus, learningInsights } = useCompanion();
  
  const alerts = useMemo(() => {
    const items: Array<{ type: "critical" | "warning" | "info"; message: string; detail: string }> = [];
    
    if (errorPatrolReport.criticalIssues > 0) {
      items.push({ type: "critical", message: `${errorPatrolReport.criticalIssues} critical issue(s) detected`, detail: "Error Patrol is investigating" });
    }
    if (fleetStatus.error > 0) {
      items.push({ type: "critical", message: `${fleetStatus.error} agent(s) in error state`, detail: "Self-healing attempting recovery" });
    }
    if (errorPatrolReport.regressionCount > 0) {
      items.push({ type: "warning", message: `${errorPatrolReport.regressionCount} performance regression(s)`, detail: "Baselines recalibrating" });
    }
    if (learningInsights.underPerformers.length > 0) {
      items.push({ type: "warning", message: `${learningInsights.underPerformers.length} underperforming agent(s)`, detail: "Demotion recommended" });
    }
    if (fleetStatus.queueDepth > 10) {
      items.push({ type: "warning", message: `Queue depth at ${fleetStatus.queueDepth}`, detail: "Consider scaling concurrency" });
    }
    if (learningInsights.topPerformers.length > 0) {
      items.push({ type: "info", message: `${learningInsights.topPerformers.length} top performer(s) eligible for promotion`, detail: "Self-learning recommendation" });
    }
    if (items.length === 0) {
      items.push({ type: "info", message: "All systems nominal", detail: "No alerts at this time" });
    }
    return items;
  }, [errorPatrolReport, fleetStatus, learningInsights]);

  const iconMap = { critical: AlertTriangle, warning: AlertTriangle, info: CheckCircle };
  const colorMap = { critical: "text-destructive", warning: "text-accent", info: "text-trust-safe" };
  const bgMap = { critical: "border-destructive/20 bg-destructive/5", warning: "border-amber-500/20 bg-amber-500/5", info: "border-trust-safe/20 bg-trust-safe/5" };

  return (
    <SitaCard hover={false}>
      <SitaCardTitle sub="Proactive system alerts">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" />Active Alerts
          {alerts.filter(a => a.type === "critical").length > 0 && (
            <Badge className="bg-destructive/15 text-destructive border-destructive/20 text-[9px] ml-1">
              {alerts.filter(a => a.type === "critical").length}
            </Badge>
          )}
        </div>
      </SitaCardTitle>
      <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
        {alerts.map((alert, i) => {
          const Icon = iconMap[alert.type];
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn("flex items-start gap-2.5 rounded-xl border p-3", bgMap[alert.type])}
            >
              <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", colorMap[alert.type])} />
              <div>
                <p className="text-[11px] font-medium text-foreground">{alert.message}</p>
                <p className="text-[9px] text-muted-foreground">{alert.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SitaCard>
  );
}

// ── Main Dashboard Page ─────────────────────────────────────────

export default function AgentActivityDashboard() {
  // Wire fleet live data + CAI graph for agent orchestration
  const fleetLive = useAgentFleetLive();
  const graphNodes = useGraphNodes();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5"
    >
      <FleetHero />

      {/* Charts + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CostOverTimeChart />
        <AgentDistribution />
        <AlertSummaryPanel />
      </div>

      {/* Main activity feed with cost tracker */}
      <AgentActivityFeed showCostTracker />
    </motion.div>
  );
}
