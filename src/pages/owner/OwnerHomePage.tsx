// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Owner Home
// Richer KPI strip, pulse, trust, approvals, AI team, rollout
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useMissionControlSummary, useFounderCostSummary, useTrustSummary,
  useConnectorSummaries, useAITeamSummary, useIncidentSummaries,
  useWhatMattersNow, useRecoverySummary,
} from "@/hooks/use-mission-control-views";
import {
  Activity, Shield, DollarSign, Wifi, Users, Cpu, AlertTriangle,
  CheckCircle, TrendingUp, Heart, Gauge, Rocket, BarChart3, Eye,
  ChevronRight, Zap, Target, CreditCard, Package,
} from "lucide-react";

const kpiCard = (icon: React.ElementType, label: string, value: string, sub: string, color: string) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 p-3.5">
    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", color)}>
      {(() => { const I = icon; return <I className="h-5 w-5" />; })()}
    </div>
    <div>
      <p className="font-display text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-[10px] text-primary">{sub}</p>
    </div>
  </div>
);

export default function OwnerHomePage() {
  const navigate = useNavigate();
  const summary = useMissionControlSummary();
  const cost = useFounderCostSummary();
  const trust = useTrustSummary();
  const connectors = useConnectorSummaries();
  const aiTeam = useAITeamSummary();
  const incidents = useIncidentSummaries();
  const matters = useWhatMattersNow();
  const recovery = useRecoverySummary();

  const healthScore = Math.round((trust.verificationHealth + trust.proofCompleteness + (connectors.filter(c => c.status === "connected").length / Math.max(connectors.length, 1)) * 100) / 3);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Gauge className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Owner Dashboard</h1>
            <p className="text-sm text-muted-foreground">Advanced operating view — full system awareness</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", healthScore >= 90 ? "bg-trust-verified/10 text-trust-safe" : healthScore >= 70 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive")}>
              Health {healthScore}%
            </Badge>
            <button onClick={() => navigate("/owner-mode")}
              className="rounded-lg bg-secondary/50 px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >Switch to Simple Mode</button>
          </div>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {kpiCard(DollarSign, "Monthly Revenue", "$112K", "+18% MoM", "bg-trust-verified/10 text-trust-safe")}
        {kpiCard(CreditCard, "Daily Spend", `$${cost.totalCostToday.toFixed(2)}`, `${cost.budgetUtilization}% of budget`, "bg-accent/10 text-accent")}
        {kpiCard(Shield, "Trust Posture", trust.posture, trust.approvalHealth, "bg-primary/10 text-primary")}
        {kpiCard(Wifi, "Connectors", `${connectors.filter(c => c.status === "connected").length}/${connectors.length}`, "connected", "bg-primary/10 text-primary")}
        {kpiCard(AlertTriangle, "Incidents", `${incidents.filter(i => i.severity === "critical").length}`, "critical active", "bg-destructive/10 text-destructive")}
        {kpiCard(Cpu, "AI Agents", `${aiTeam.healthyCount}/${aiTeam.totalAgents}`, "healthy", "bg-sita-gold/10 text-sita-gold")}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* What Matters Now */}
        <SitaCard hover={false} className="lg:col-span-2">
          <SitaCardTitle sub="Prioritized by urgency and impact">What Matters Now</SitaCardTitle>
          <div className="mt-3 space-y-2">
            {matters.slice(0, 5).map((item) => (
              <div key={item.id} onClick={() => item.actionRoute && navigate(item.actionRoute)}
                className={cn("flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:shadow-sm transition-all",
                  item.urgency === "critical" ? "border-destructive/20 bg-destructive/5" :
                  item.urgency === "high" ? "border-accent/20 bg-accent/5" : "border-border bg-card/50"
                )}
              >
                <div className={cn("h-2 w-2 rounded-full shrink-0",
                  item.urgency === "critical" ? "bg-destructive" : item.urgency === "high" ? "bg-accent" : "bg-primary"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Quick Actions */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Common owner actions">Quick Actions</SitaCardTitle>
          <div className="mt-3 space-y-2">
            {[
              { label: "Review approvals", icon: CheckCircle, route: "/owner/approvals", count: summary.incidentsSummary.open },
              { label: "Trust center", icon: Shield, route: "/owner/trust", count: 0 },
              { label: "System health", icon: Heart, route: "/owner/health", count: 0 },
              { label: "AI team status", icon: Cpu, route: "/owner/ai-team", count: aiTeam.stuckTasks },
              { label: "Recovery center", icon: Zap, route: "/mission-control", count: recovery.failedWorkflows },
              { label: "View pulse", icon: BarChart3, route: "/owner/pulse", count: 0 },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.route)}
                className="flex items-center gap-3 w-full rounded-xl border border-border/50 bg-card/50 p-3 hover:bg-secondary/30 transition-all text-left"
              >
                <a.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground flex-1">{a.label}</span>
                {a.count > 0 && <Badge variant="outline" className="text-[9px] bg-destructive/10 text-destructive">{a.count}</Badge>}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        </SitaCard>
      </div>

      {/* Bottom row: Cost + Connector + Rollout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SitaCard hover={false}>
          <SitaCardTitle sub="Spend awareness">Cost Summary</SitaCardTitle>
          <div className="mt-3 space-y-2">
            {cost.byModule.slice(0, 3).map(m => (
              <div key={m.module} className="flex justify-between text-xs"><span className="text-muted-foreground">{m.module}</span><span className="font-medium text-foreground">${m.cost.toFixed(2)}</span></div>
            ))}
            <Progress value={cost.budgetUtilization} className="h-1.5 mt-2" />
            <p className="text-[10px] text-muted-foreground">{cost.budgetUtilization}% of daily budget used</p>
          </div>
        </SitaCard>

        <SitaCard hover={false}>
          <SitaCardTitle sub="Integration health">Connectors</SitaCardTitle>
          <div className="mt-3 space-y-2">
            {connectors.slice(0, 4).map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", c.status === "connected" ? "bg-trust-safe" : c.status === "degraded" ? "bg-accent" : "bg-destructive")} />
                <span className="text-xs text-foreground flex-1">{c.name}</span>
                <Badge variant="outline" className="text-[9px]">{c.status}</Badge>
              </div>
            ))}
          </div>
        </SitaCard>

        <SitaCard hover={false}>
          <SitaCardTitle sub="Deployment state">Rollout</SitaCardTitle>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" /><span className="text-xs text-foreground">Canary at {summary.releaseSummary.canaryHealth}%</span></div>
            <Progress value={summary.releaseSummary.canaryHealth} className="h-1.5" />
            <div className="text-[10px] text-muted-foreground">{summary.releaseSummary.currentVersion} — {summary.releaseSummary.ringStatus}</div>
            <div className="flex items-center gap-2 text-[10px]"><CheckCircle className="h-3 w-3 text-trust-safe" /><span className="text-muted-foreground">All health checks passing</span></div>
          </div>
        </SitaCard>
      </div>
    </div>
  );
}
