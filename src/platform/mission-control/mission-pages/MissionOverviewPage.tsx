// ═══════════════════════════════════════════════════════════════
// SITA OS — Advanced Operations Overview
// Deep operational KPIs, workflow health map, connector reliability
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { useMissionControlSummary, useTrustSummary, useFounderCostSummary, useRecoverySummary, useDiagnosticsSummary } from "@/hooks/use-mission-control-views";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Shield, Activity, Wifi, AlertTriangle, DollarSign,
  Cpu, Zap, CheckCircle, RefreshCw, Eye, Database, Rocket,
  Heart, Target, Lock, Server, BarChart3,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function MissionOverviewPage() {
  const navigate = useNavigate();
  const summary = useMissionControlSummary();
  const trust = useTrustSummary();
  const cost = useFounderCostSummary();
  const recovery = useRecoverySummary();
  const diagnostics = useDiagnosticsSummary();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
<button onClick={() => navigate("/mission-control")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Mission Control Home
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-card p-6"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <BarChart3 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Advanced Operations Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Deep operational telemetry · workflow health · connector reliability · trust posture
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "System Score", value: `${summary.systemScore}`, icon: Cpu, ok: summary.systemScore >= 90 },
            { label: "Trust Posture", value: trust.posture, icon: Shield, ok: trust.posture === "verified" },
            { label: "Verification", value: `${trust.verificationHealth}%`, icon: CheckCircle, ok: trust.verificationHealth >= 95 },
            { label: "Budget Used", value: `${summary.costSummary.utilization}%`, icon: DollarSign, ok: summary.costSummary.utilization < 80 },
            { label: "Recovery Queue", value: `${recovery.stuckWorkflows + recovery.failedWorkflows}`, icon: RefreshCw, ok: recovery.stuckWorkflows === 0 },
          ].map(m => (
            <div key={m.label} className={cn("rounded-xl border px-3 py-2.5 text-center", m.ok ? "border-border bg-card/50" : "border-accent/20 bg-accent/5")}>
              <m.icon className={cn("h-4 w-4 mx-auto mb-1", m.ok ? "text-muted-foreground" : "text-accent")} />
              <p className={cn("font-display text-sm font-bold", m.ok ? "text-foreground" : "text-accent")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Workflow Health */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Running / Stuck / Failed">Workflow Health</SitaCardTitle>
          <div className="mt-4 space-y-3">
            {[
              { label: "Running", value: summary.workflowsSummary.running, color: "trust-safe" },
              { label: "Stuck", value: summary.workflowsSummary.stuck, color: "accent" },
              { label: "Failed", value: summary.workflowsSummary.failed, color: "destructive" },
            ].map(w => (
              <div key={w.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", `bg-${w.color}`)} />
                  <span className="text-xs text-muted-foreground">{w.label}</span>
                </div>
                <span className="font-display text-sm font-bold text-foreground">{w.value}</span>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Connector Reliability */}
        <SitaCard hover={false}>
          <SitaCardTitle sub={`${summary.connectorsSummary.connected}/${summary.connectorsSummary.total} online`}>Connector Reliability</SitaCardTitle>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Avg Health</span>
              <span className={cn("font-display text-sm font-bold", summary.connectorsSummary.avgHealth >= 80 ? "text-trust-safe" : "text-accent")}>
                {summary.connectorsSummary.avgHealth}/100
              </span>
            </div>
            <Progress value={summary.connectorsSummary.avgHealth} className="h-2" />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{summary.connectorsSummary.degraded} degraded</span>
              <span>{summary.connectorsSummary.disconnected} disconnected</span>
            </div>
          </div>
        </SitaCard>

        {/* Trust Metrics */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Proof & verification health">Trust Metrics</SitaCardTitle>
          <div className="mt-4 space-y-2">
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

        {/* Cost by Module */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Token spend distribution">Cost by Module</SitaCardTitle>
          <div className="mt-4 space-y-2">
            {cost.byModule.map(m => {
              const pct = Math.round((m.tokens / cost.totalTokensToday) * 100);
              return (
                <div key={m.module} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 truncate">{m.module}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-full rounded-full bg-primary/50" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </SitaCard>

        {/* Diagnostics Summary */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="System diagnostics">Support Diagnostics</SitaCardTitle>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/30 p-3 text-center">
              <p className="font-display text-lg font-bold text-foreground">{diagnostics.recentFailures}</p>
              <p className="text-[9px] text-muted-foreground">Recent Failures</p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3 text-center">
              <p className="font-display text-lg font-bold text-foreground">{diagnostics.connectorTimeouts}</p>
              <p className="text-[9px] text-muted-foreground">Timeouts</p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3 text-center">
              <p className="font-display text-lg font-bold text-foreground">{diagnostics.authAnomalies}</p>
              <p className="text-[9px] text-muted-foreground">Auth Anomalies</p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3 text-center">
              <p className="font-display text-lg font-bold text-foreground">{diagnostics.correlationIds.length}</p>
              <p className="text-[9px] text-muted-foreground">Correlation IDs</p>
            </div>
          </div>
          {diagnostics.exportReady && (
            <button className="mt-3 w-full rounded-lg border border-border py-2 text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
              <Database className="h-3 w-3 inline mr-1" /> Export Diagnostic Bundle
            </button>
          )}
        </SitaCard>

        {/* Release Status */}
        <SitaCard hover={false}>
          <SitaCardTitle sub={summary.releaseSummary.currentVersion}>Release Status</SitaCardTitle>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Ring</span>
              <Badge variant="outline" className="text-[10px]">{summary.releaseSummary.ringStatus}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Canary Health</span>
              <span className={cn("font-display text-sm font-bold", summary.releaseSummary.canaryHealth >= 90 ? "text-trust-safe" : "text-accent")}>
                {summary.releaseSummary.canaryHealth}%
              </span>
            </div>
          </div>
        </SitaCard>
      </div>
    </div>
  );
}
