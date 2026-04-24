// ═══════════════════════════════════════════════════════════════
// SITA OS — Mission Control (Premium Rebuild)
// Two-layer system: Owner Mode (calm) + Advanced Ops (deep)
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, createContext, useContext } from "react";
import { useOSRuntime, type OSRuntime } from "@/hooks/useOSRuntime";
import { useNavigate } from "react-router-dom";
import { useMissionControlLive } from "@/hooks/use-mission-control-data";
import { useControlMode, useWhatMattersNow, useMissionControlSummary, useSystemActivity } from "@/hooks/use-mission-control-views";
import { useAdminIncidents, useFleetHealth, useTrustCenter } from "@/hooks/use-admin-data";
import { useMissionGoals } from "@/hooks/use-mission-data";
import { AdminSpendChart } from "@/components/sita/AdminSpendChart";
import { AnimatedProgressRing } from "@/components/sita/AnimatedProgressRing";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import {
  AgentCard, IncidentCard, ConnectorHealthCard, WorkflowRecoveryCard,
  CostAnomalyCard, PolicyAnomalyCard, ReleaseSafetyCard, SafeModeCard,
  PermissionsCard,
} from "@/components/sita/MissionControlComponents";
import { advisors, recommendations, internalAgents, incidents, connectorHealth, stuckWorkflows, costAnomalies, policyAnomalies, releaseSafety, approvals, safeMode, type SafeModeState } from "@/hooks/useAdvisorMissionControl";
import { cn } from "@/lib/utils";
import { useFraudSentinel, useGovernanceSimulator } from "@/contexts/SitaKernelContext";
import type { TrustState, ExecutionEnvelope, WorkflowState, DiagnosticBundle } from "@/packages/contracts";
import type { ConnectorFreshnessPolicy } from "@/packages/policy-contracts";
import type { ReceiptRow, SyncLogRow, TenantFirewallLogRow, CapabilityRow } from "@/packages/database-schemas";
import { AgentActivityFeed } from "@/components/sita/AgentActivityFeed";
import { SelfHealingDashboard } from "@/components/sita/SelfHealingDashboard";
import { SelfLearningDashboard } from "@/components/sita/SelfLearningDashboard";
import { AgentControlPanel } from "@/components/sita/AgentControlPanel";
import { PredictiveAnalysisDashboard } from "@/components/sita/PredictiveAnalysisDashboard";
import { AgentAuditLog } from "@/components/sita/AgentAuditLog";
import { ComplianceDashboard } from "@/components/sita/ComplianceDashboard";
import { BCPDRDashboard } from "@/components/sita/BCPDRDashboard";
import { CABWorkflow } from "@/components/sita/CABWorkflow";
import { AgentCommunicationGraph } from "@/components/sita/AgentCommunicationGraph";
import { SelfHealingNotifications } from "@/components/sita/SelfHealingNotifications";
import PlatformTruthDashboard from "./PlatformTruthDashboard";
import { useTokenUsages } from "@/hooks/use-domain-data";


import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import {
  Server, Shield, Activity, Wifi, AlertTriangle, DollarSign, Rocket,
  Lock, RotateCcw, Clock, Eye, CheckCircle, Cpu, Zap, FileText,
  ShieldAlert, Users, GitBranch, Database, RefreshCw, Loader2,
  Brain, Gauge, TrendingUp, TrendingDown, Play, Pause, Radio,
  Search, ChevronRight, ArrowRight, ArrowDown, XCircle, BarChart3,
  Layers, History, Rewind, Settings, Power, WifiOff, Heart,
  Target, ClipboardList, Network, BellRing,
}from "lucide-react";

// ── Admin Data Context ───────────────────────────────────────────────────────
interface MCAdminData {
  adminIncidents: any;
  fleetHealth: any;
  trustCenter: any;
  runtime: OSRuntime | null;
}
const MCAdminCtx = createContext<MCAdminData>({ adminIncidents: null, fleetHealth: null, trustCenter: null, runtime: null });
export function useMCAdmin() { return useContext(MCAdminCtx); }

// ── System Pulse — Mac-like Hero ────────────────────────────────────────────

function SystemPulseHero() {
  const { adminIncidents } = useMCAdmin();
  const adminOpenCount = adminIncidents?.summary?.open ?? 0;

  const healthyAgents = internalAgents.filter(a => a.health === "healthy").length;
  const totalAgents = internalAgents.length;
  const openIncidents = adminOpenCount || incidents.filter(i => i.status !== "resolved").length;
  const degradedConnectors = connectorHealth.filter(c => c.status !== "connected").length;
  const stuckWorkflowCount = 0 as number;
  const totalTokens = internalAgents.reduce((s, a) => s + a.costTokens24h, 0);

  const sentinel = useFraudSentinel();

  const fraudSentinel = useMemo(() => {
    sentinel.evaluate({ userId: "demo", timestamp: Date.now(), amount: 28000, isNewRecipient: true, method: "wire", recentTransactionCount: 5, recentTotalAmount: 35000 });
    return sentinel.getSummary();
  }, [sentinel]);

  const systemScore = Math.round(
    ((healthyAgents / totalAgents) * 40) +
    ((openIncidents === 0 ? 1 : Math.max(0, 1 - openIncidents * 0.2)) * 25) +
    ((1 - degradedConnectors / connectorHealth.length) * 20) +
    ((stuckWorkflowCount === 0 ? 1 : 0.5) * 15)
  );

  const scoreColor = systemScore >= 90 ? "trust-verified" : systemScore >= 70 ? "trust-review" : "urgency-high";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-card"
    >
      <div className="relative z-10 p-6">
        {/* Identity row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <Cpu className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className={cn("absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card", `bg-${scoreColor}`)} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">Mission Control</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI team health · system operations · trust oversight
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {safeMode.globalSafeMode && (
              <Badge className="bg-destructive/15 text-destructive border-destructive/20 text-[10px]">SAFE MODE</Badge>
            )}
            {openIncidents > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-semibold text-destructive">{openIncidents} incident{openIncidents > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>

        {/* System Score + Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {/* System Score — large */}
          <div className="col-span-2 md:col-span-1 rounded-xl border border-border bg-card/60 p-3 text-center">
            <div className="relative mx-auto mb-1 h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={`hsl(var(--${scoreColor}))`} strokeWidth="4"
                  strokeDasharray={`${systemScore * 1.76} 176`} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <span className={cn("absolute inset-0 flex items-center justify-center font-display text-lg font-bold", `text-${scoreColor}`)}>
                {systemScore}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">System Health</p>
          </div>

          {/* Metric pills */}
          {[
            { label: "AI Team", value: `${healthyAgents}/${totalAgents}`, sub: "healthy", icon: Server, ok: healthyAgents === totalAgents },
            { label: "Incidents", value: openIncidents.toString(), sub: openIncidents === 0 ? "all clear" : "open", icon: AlertTriangle, ok: openIncidents === 0 },
            { label: "Connectors", value: `${connectorHealth.filter(c => c.status === "connected").length}/${connectorHealth.length}`, sub: "online", icon: Wifi, ok: degradedConnectors === 0 },
            { label: "Workflows", value: stuckWorkflowCount.toString(), sub: stuckWorkflowCount === 0 ? "all running" : "stuck", icon: Activity, ok: stuckWorkflowCount === 0 },
            { label: "Tokens / 24h", value: `${(totalTokens / 1000).toFixed(0)}k`, sub: `~$${(totalTokens * 0.002 / 1000).toFixed(2)}`, icon: DollarSign, ok: true },
            { label: "Fraud", value: fraudSentinel.activeAlerts.toString(), sub: `risk: ${fraudSentinel.riskScore}`, icon: ShieldAlert, ok: fraudSentinel.activeAlerts === 0 },
          ].map(m => (
            <div key={m.label} className={cn(
              "rounded-xl border px-3 py-2.5 text-center transition-all",
              m.ok ? "border-border bg-card/50" : "border-destructive/15 bg-destructive/3"
            )}>
              <m.icon className={cn("h-3.5 w-3.5 mx-auto mb-1", m.ok ? "text-muted-foreground" : "text-destructive")} />
              <p className={cn("font-display text-sm font-bold", m.ok ? "text-foreground" : "text-destructive")}>{m.value}</p>
              <p className="text-[9px] text-muted-foreground">{m.label}</p>
              <p className="text-[9px] text-muted-foreground">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/3 blur-3xl" />
      <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-accent/3 blur-2xl" />
    </motion.div>
  );
}

// ── Quick Actions Strip ─────────────────────────────────────────────────────

function QuickActionsStrip() {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {[
        { label: "Refresh All", icon: RefreshCw },
        { label: "Run Diagnostics", icon: Search },
        { label: "View AI Spend", icon: DollarSign },
        { label: "Replay Last Incident", icon: Rewind },
        { label: "Privacy Controls", icon: Shield },
        { label: "Toggle Safe Mode", icon: ShieldAlert },
      ].map(a => (
        <button key={a.label}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-xs text-foreground transition-all hover:bg-secondary hover:border-primary/20 hover:shadow-sm"
        >
          <a.icon className="h-3.5 w-3.5 text-muted-foreground" />
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ── MC Home ─────────────────────────────────────────────────────────────────

function MCHome() {
  const { adminIncidents: adminData, runtime } = useMCAdmin();
  const adminIncidentList = adminData?.incidents || [];
  const openIncidents = adminIncidentList.length > 0
    ? incidents.map((m, i) => ({ ...m, status: adminIncidentList[i]?.status === "resolved" ? "resolved" as const : m.status })).filter(i => i.status !== "resolved")
    : incidents.filter(i => i.status !== "resolved");
  const degradedAgents = internalAgents.filter(a => a.health !== "healthy");
  const degradedConnectors = connectorHealth.filter(c => c.status !== "connected");

  return (
    <div className="space-y-6">
      {/* Urgent items surface first */}
      {openIncidents.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Active Incidents" subtitle={`${openIncidents.length} requiring attention`} />
          {openIncidents.map(inc => <IncidentCard key={inc.id} incident={inc} />)}
        </div>
      )}

      {degradedAgents.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Agents Needing Attention" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {degradedAgents.map(a => <AgentCard key={a.id} agent={a} />)}
          </div>
        </div>
      )}

      {degradedConnectors.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Degraded Connectors" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {degradedConnectors.map(c => <ConnectorHealthCard key={c.id} connector={c} />)}
          </div>
        </div>
      )}

      {costAnomalies.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Cost Anomalies" />
          {costAnomalies.map(c => <CostAnomalyCard key={c.id} anomaly={c} />)}
        </div>
      )}

      {stuckWorkflows.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Stuck Workflows" />
          {stuckWorkflows.map(w => <WorkflowRecoveryCard key={w.id} workflow={w} />)}
        </div>
      )}

      {/* All clear state */}
      {openIncidents.length === 0 && degradedAgents.length === 0 && degradedConnectors.length === 0 && stuckWorkflows.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-trust-verified/20 bg-trust-verified/5 p-10 text-center"
        >
          <CheckCircle className="h-10 w-10 text-trust-safe mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground font-display">All Systems Healthy</p>
          <p className="text-xs text-muted-foreground mt-1">No incidents, no degraded agents, all connectors operational, all workflows running</p>
        </motion.div>
      )}

      {/* Recent changes */}
      <div className="space-y-3">
        <SitaSectionHeader title="Recent System Activity" subtitle="What changed in the last 24 hours" />
        <div className="space-y-1 border-l-2 border-border/40 ml-3 pl-4">
          {[
            { time: "9:55 AM", event: "Connector Health Agent detected Plaid degradation", type: "warning" as const },
            { time: "8:45 AM", event: "Release Safety Agent approved canary health check", type: "success" as const },
            { time: "6:00 AM", event: "Cost Guardrail Agent flagged premium model overuse", type: "warning" as const },
            { time: "Yesterday", event: "Knowledge Coordinator updated 3 runbooks", type: "info" as const },
            { time: "Yesterday", event: "Workflow Recovery Agent recovered grocery-reorder flow", type: "success" as const },
          ].map((entry, i) => (
            <div key={i} className="flex items-start gap-3 py-2 relative">
              <div className={cn("absolute -left-[1.35rem] top-3 h-2 w-2 rounded-full",
                entry.type === "success" ? "bg-trust-safe" : entry.type === "warning" ? "bg-accent" : "bg-primary/50"
              )} />
              <div>
                <p className="text-xs text-foreground">{entry.event}</p>
                <p className="text-[10px] text-muted-foreground">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 6 — Enterprise Maturity Quick View */}
      {runtime && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Trust Devices */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground font-display">Trust Devices</h4>
            </div>
            {runtime.engines.trustDevice.getDemoDevices().slice(0, 2).map(d => (
              <div key={d.id} className="flex items-center gap-2 py-1.5 text-[11px]">
                <span className={cn("h-2 w-2 rounded-full", d.trustLevel === "secure-enclave" || d.trustLevel === "trusted" ? "bg-trust-safe" : "bg-accent")} />
                <span className="text-foreground flex-1">{d.name}</span>
                <span className="text-muted-foreground">{d.trustScore}%</span>
              </div>
            ))}
          </div>

          {/* Release Safety */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground font-display">Release Safety</h4>
            </div>
            {runtime.engines.releases.getDemoReleases().map(r => (
              <div key={r.id} className="flex items-center gap-2 py-1.5 text-[11px]">
                <Badge variant="outline" className={cn("text-[8px]", r.status === "ga" ? "text-trust-safe" : "text-accent")}>{r.status}</Badge>
                <span className="text-foreground flex-1">{r.version}</span>
                <span className="text-muted-foreground">{r.confidenceScore}%</span>
              </div>
            ))}
          </div>

          {/* Compliance */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-trust-safe" />
              <h4 className="text-xs font-bold text-foreground font-display">Compliance</h4>
            </div>
            {(() => {
              const c = runtime.engines.compliance.getComplianceSummary();
              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-trust-safe font-medium capitalize">{c.overallStatus}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Audit Coverage</span>
                    <span className="text-foreground">{c.auditCoverage}%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Tamper Integrity</span>
                    <span className="text-foreground">{c.tamperEvidenceIntegrity}%</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI Team Registry ────────────────────────────────────────────────────────

function MCAgentTeam() {
  const [view, setView] = useState<"grid" | "list">("grid");

  // Group agents by role category
  const groups = useMemo(() => {
    const categories: Record<string, typeof internalAgents> = {};
    internalAgents.forEach(a => {
      const cat = a.role;
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(a);
    });
    return Object.entries(categories);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/10 bg-primary/3 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground font-display">Internal AI Workforce</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              These are <span className="font-semibold text-foreground">governed internal agents</span> — not customer-facing advisors.
              They handle reliability, security, cost control, data quality, and system health autonomously within defined trust boundaries.
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setView("grid")}
              className={cn("rounded-lg p-1.5 transition-all", view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            ><Layers className="h-3.5 w-3.5" /></button>
            <button onClick={() => setView("list")}
              className={cn("rounded-lg p-1.5 transition-all", view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            ><BarChart3 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </motion.div>

      {/* Agent summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Agents", value: internalAgents.length, color: "primary" },
          { label: "Healthy", value: internalAgents.filter(a => a.health === "healthy").length, color: "trust-safe" },
          { label: "Degraded", value: internalAgents.filter(a => a.health === "degraded").length, color: "accent" },
          { label: "Paused", value: internalAgents.filter(a => a.health === "paused").length, color: "muted-foreground" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-card/50 p-3 text-center">
            <p className={cn("font-display text-lg font-bold", `text-${m.color}`)}>{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {view === "grid" ? (
        groups.map(([role, agents], gi) => (
          <div key={role} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{role}</span>
              <Badge variant="outline" className="text-[9px]">{agents.length}</Badge>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {agents.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (gi * agents.length + i) * 0.03 }}>
                  <AgentCard agent={a} />
                </motion.div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <SitaCard hover={false}>
          <div className="space-y-1">
            {internalAgents.map(a => {
              const hc = a.health === "healthy" ? "trust-safe" : a.health === "degraded" ? "accent" : a.health === "paused" ? "muted-foreground" : "destructive";
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/30 transition-colors">
                  <div className={cn("h-2 w-2 rounded-full", `bg-${hc}`)} />
                  <span className="text-xs font-medium text-foreground w-44 truncate">{a.name}</span>
                  <span className="text-[10px] text-muted-foreground w-28 truncate">{a.role}</span>
                  <span className="text-[10px] text-muted-foreground w-20">{a.autonomyLevel}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div className={cn("h-full rounded-full", `bg-${hc}`)}
                      style={{ width: `${(a.costTokens24h / Math.max(...internalAgents.map(x => x.costTokens24h))) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-16 text-right">{(a.costTokens24h / 1000).toFixed(1)}k</span>
                  <span className="text-[10px] text-muted-foreground w-16 text-right">{a.invocations24h} calls</span>
                </div>
              );
            })}
          </div>
        </SitaCard>
      )}
    </div>
  );
}

// ── Incidents ───────────────────────────────────────────────────────────────

function MCIncidents() {
  const { adminIncidents } = useMCAdmin();
  const adminList = adminIncidents?.incidents || [];
  // Merge admin data onto mock incidents for enriched display
  const incidents = ([] as never[]).map((m: any, idx: number) => {
    const admin = adminList[idx];
    return admin ? { ...m, status: admin.status ?? m.status, severity: admin.severity ?? m.severity } : m;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-accent/10 bg-accent/3 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
            <AlertTriangle className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Incident Review</h3>
            <p className="text-xs text-muted-foreground">
              {adminIncidents?.summary
                ? `${adminIncidents.summary.open} open · ${adminIncidents.summary.resolved} resolved · ${adminIncidents.summary.total} total`
                : "Severity, scope, root cause, timeline, rollback options, and recommended actions"}
            </p>
          </div>
        </div>
      </motion.div>

      {incidents.length > 0 ? (
        <div className="space-y-4">
          {incidents.map((inc, i) => (
            <motion.div key={inc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <IncidentCard incident={inc} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Shield} title="No incidents" description="All systems operating normally" color="trust-verified" />
      )}
    </div>
  );
}

// ── Connectors ──────────────────────────────────────────────────────────────

function MCConnectors() {
  const { fleetHealth } = useMCAdmin();
  const connectors = connectorHealth.map(c => {
    const fleetService = fleetHealth?.services?.find((s: Record<string, any>) => s.name?.toLowerCase().includes(c.name.toLowerCase()));
    return fleetService ? { ...c, healthScore: Math.round(fleetService.uptime ?? c.healthScore) } : c;
  });
  const sorted = [...connectors].sort((a, b) => a.healthScore - b.healthScore);
  const avgScore = Math.round(connectors.reduce((s, c) => s + c.healthScore, 0) / connectors.length);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/10 bg-primary/3 p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-display">Connector Health</h3>
              <p className="text-xs text-muted-foreground">External integrations, sync health, error rates, and impacted workflows</p>
            </div>
          </div>
          <div className="text-center shrink-0">
            <p className={cn("font-display text-2xl font-bold", avgScore >= 80 ? "text-trust-safe" : "text-accent")}>{avgScore}</p>
            <p className="text-[9px] text-muted-foreground">Avg Health</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <ConnectorHealthCard connector={c} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Recovery ────────────────────────────────────────────────────────────────

function MCRecovery() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-accent/10 bg-accent/3 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
            <RefreshCw className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Workflow Recovery</h3>
            <p className="text-xs text-muted-foreground">Stuck and failed workflows with retry, rollback, and human intervention options</p>
          </div>
        </div>
      </motion.div>

      {stuckWorkflows.length > 0 ? (
        <div className="space-y-3">{stuckWorkflows.map(w => <WorkflowRecoveryCard key={w.id} workflow={w} />)}</div>
      ) : (
        <EmptyState icon={Zap} title="All workflows healthy" description="No stuck or failed workflows — everything is running smoothly" color="trust-verified" />
      )}
    </div>
  );
}

// ── Cost & Token Control ────────────────────────────────────────────────────

function MCCosts() {
  const { runtime } = useMCAdmin();
  const tokenEngine = runtime.engines.tokens;
  const { data: tokenUsages = [] } = useTokenUsages();

  // Seed demo usage so the dashboard has data
  const dashboard = useMemo(() => {
    for (const u of tokenUsages) {
      try { tokenEngine.recordUsage(u as never); } catch {}
    }
    return tokenEngine.getDashboard("today");
  }, [tokenEngine, tokenUsages]);

  const modelRoutes = useMemo(() => {
    return tokenEngine.getRoutes();
  }, [tokenEngine]);

  const dailyBudget = 5.00;
  const utilization = Math.round((dashboard.totalSpend / dailyBudget) * 100);

  return (
    <div className="space-y-6">
      {/* Cost Overview — engine-backed */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Cost & Token Control</h3>
            <p className="text-xs text-muted-foreground">Live from TokenGovernanceEngine — model routing, budgets, anomalies</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <MetricBox label="Total Spend" value={`$${dashboard.totalSpend.toFixed(3)}`} />
          <MetricBox label="Forecasted" value={`$${dashboard.forecastedSpend.toFixed(3)}`} accent={dashboard.forecastedSpend > dailyBudget} />
          <MetricBox label="Efficiency" value={`${dashboard.efficiencyScore.toFixed(0)}%`} />
          <MetricBox label="Budget Used" value={`${utilization}%`} accent={utilization > 80} />
        </div>

        {/* Budget bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Daily Budget: ${dailyBudget.toFixed(2)}</span>
            <span className={utilization > 80 ? "text-accent font-semibold" : ""}>${dashboard.totalSpend.toFixed(3)} used</span>
          </div>
          <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(utilization, 100)}%` }} transition={{ duration: 0.8 }}
              className={cn("h-full rounded-full", utilization > 90 ? "bg-destructive" : utilization > 70 ? "bg-accent" : "bg-primary")} />
          </div>
        </div>
      </motion.div>

      {/* Model Routes — from engine */}
      <SitaCard hover={false}>
        <SitaCardTitle sub="Active model routing rules from TokenGovernanceEngine">Model Routing</SitaCardTitle>
        <div className="mt-4 space-y-2">
          {modelRoutes?.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-lg bg-secondary/20 px-3 py-2.5"
            >
              <div className={cn("h-2.5 w-2.5 rounded-full", r.active ? "bg-trust-safe" : "bg-muted")} />
              <span className="text-xs font-semibold text-foreground w-36 truncate">{r.name}</span>
              <Badge variant="outline" className="text-[9px]">{r.tier}</Badge>
              <span className="text-[10px] text-muted-foreground flex-1 truncate">{r.model}</span>
              <span className="text-[10px] font-mono text-muted-foreground w-20 text-right">${r.costPer1kTokens}/1k</span>
              <span className="text-[10px] text-muted-foreground w-14 text-right">{r.latencyMs}ms</span>
            </motion.div>
          ))}
        </div>
      </SitaCard>

      {/* Spend by Domain — from engine dashboard */}
      <SitaCard hover={false}>
        <SitaCardTitle sub="Token spend breakdown by domain">Spend by Domain</SitaCardTitle>
        <div className="mt-4 space-y-2">
          {dashboard.byDomain.map((d, i) => {
            const maxCost = Math.max(...dashboard.byDomain.map(x => x.cost));
            const pct = maxCost > 0 ? (d.cost / maxCost) * 100 : 0;
            return (
              <motion.div key={d.domain} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3"
              >
                <span className="text-[10px] font-display font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                <span className="text-xs text-foreground w-28 truncate capitalize">{d.domain}</span>
                <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="h-full rounded-full bg-primary/60" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-14 text-right">{(d.tokens / 1000).toFixed(1)}k</span>
                <span className="text-[10px] font-mono text-foreground w-16 text-right">${d.cost.toFixed(4)}</span>
              </motion.div>
            );
          })}
        </div>
      </SitaCard>

      {/* Spend by Model — from engine dashboard */}
      <SitaCard hover={false}>
        <SitaCardTitle sub="Cost per model tier">Spend by Model</SitaCardTitle>
        <div className="mt-4 space-y-2">
          {dashboard.byModel.map((m, i) => (
            <motion.div key={m.model} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2"
            >
              <span className="text-xs text-foreground truncate">{m.model}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">{(m.tokens / 1000).toFixed(1)}k tokens</span>
                <span className="text-[10px] font-mono font-medium text-foreground">${m.cost.toFixed(4)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </SitaCard>

      {/* Engine Anomalies — from TokenGovernanceEngine */}
      {dashboard.anomalies.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Token Anomalies" subtitle="Detected by TokenGovernanceEngine" />
          {dashboard.anomalies.map(a => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-accent/20 bg-accent/5 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={cn("text-[9px]", a.severity === "critical" ? "text-destructive" : "text-accent")}>{a.type}</Badge>
                <span className="text-[10px] text-muted-foreground">{new Date(a.detectedAt).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-foreground">{a.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{a.suggestedAction} · Est. waste: ${a.estimatedWaste.toFixed(4)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Trust & Policy ──────────────────────────────────────────────────────────

function MCTrust() {
  const { trustCenter } = useMCAdmin();
  const gov = useGovernanceSimulator();
  const [simResult, setSimResult] = useState<ReturnType<typeof gov.runComplianceAudit> | null>(null);

  const tc = trustCenter;
  const posture = tc?.posture ?? "verified";
  const policyConfidence = tc?.policyConfidence ?? 94;
  const permissionDrifts = tc?.permissionDrifts ?? 0;
  const lastAudit = tc?.lastAudit ? new Date(tc.lastAudit).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "1h ago";

  const runSim = () => {
    const result = gov.runComplianceAudit([
      { domain: "finance", capabilityId: "finance.transfer", riskTier: "high", amount: 8000 },
      { domain: "finance", capabilityId: "finance.budget.update", riskTier: "medium", amount: 500 },
      { domain: "business", capabilityId: "crm.lead.update", riskTier: "low" },
      { domain: "finance", capabilityId: "finance.transfer", riskTier: "critical", amount: 50000 },
      { domain: "connector", capabilityId: "connector.write", riskTier: "medium" },
      { isSimulation: true, domain: "finance", capabilityId: "finance.analyze", riskTier: "low" },
    ]);
    setSimResult(result);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/10 bg-primary/3 p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-display">Trust & Policy Oversight</h3>
              <p className="text-xs text-muted-foreground">
                Posture: {posture} · Policy confidence: {policyConfidence}%
              </p>
            </div>
          </div>
          <SitaButton variant="primary" size="sm" onClick={runSim}>Run Policy Simulation</SitaButton>
        </div>
      </motion.div>

      {/* Trust Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-trust-verified/15 bg-trust-verified/5 p-4 text-center">
          <Shield className="h-5 w-5 text-trust-safe mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-trust-safe">{posture === "verified" || posture === "clean" ? "Clean" : "Review"}</p>
          <p className="text-[10px] text-muted-foreground">Approval Chain</p>
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-center">
          <Lock className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-primary">{permissionDrifts}</p>
          <p className="text-[10px] text-muted-foreground">Permission Drifts</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-4 text-center">
          <Eye className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-foreground">{lastAudit}</p>
          <p className="text-[10px] text-muted-foreground">Last Audit</p>
        </div>
      </div>

      {/* Simulation Results */}
      {simResult && (
        <SitaCard hover={false} className="p-5">
          <SitaCardTitle sub={`${simResult.summary.totalScenarios} scenarios · ${simResult.durationMs}ms`}>
            Compliance Simulation Result
          </SitaCardTitle>
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="text-center">
              <p className="font-display text-xl font-bold text-foreground">{(simResult.summary.overallCompliance * 100).toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">Compliance</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-trust-safe">{simResult.summary.passed}</p>
              <p className="text-[10px] text-muted-foreground">Passed</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-destructive">{simResult.summary.blocked}</p>
              <p className="text-[10px] text-muted-foreground">Blocked</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-accent">{simResult.summary.riskBreaches}</p>
              <p className="text-[10px] text-muted-foreground">Risk Breaches</p>
            </div>
          </div>
          {simResult.summary.recommendations.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recommendations</p>
              {simResult.summary.recommendations.map((r, i) => (
                <p key={i} className="text-xs text-foreground">• {r}</p>
              ))}
            </div>
          )}
          <div className="mt-4 space-y-1">
            {simResult.results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-1.5 text-xs">
                <span className={cn("h-2 w-2 rounded-full shrink-0",
                  r.policyResult.effect === "allow" ? "bg-trust-safe" :
                  r.policyResult.effect === "deny" ? "bg-destructive" : "bg-accent"
                )} />
                <span className="text-foreground flex-1 truncate">{r.label}</span>
                <span className="text-muted-foreground">{r.policyResult.effect}</span>
              </div>
            ))}
          </div>
        </SitaCard>
      )}

      <div className="space-y-2">
        {policyAnomalies.map(p => <PolicyAnomalyCard key={p.id} anomaly={p} />)}
      </div>
    </div>
  );
}

// ── Replay & Rollback Center ────────────────────────────────────────────────

function MCReplayRollback() {
  const rollbackItems = [
    { id: "rb-1", action: "Auto-reply rule for client emails", agent: "Business Advisor", when: "1 week ago", status: "rolled-back" as const, reason: "Reply tone was too aggressive — manual review restored", canReplay: true },
    { id: "rb-2", action: "Plaid sync frequency change (15m → 5m)", agent: "Connector Health Agent", when: "3 days ago", status: "rolled-back" as const, reason: "Caused rate limiting — reverted to 15m interval", canReplay: false },
    { id: "rb-3", action: "Grocery reorder automation", agent: "Concierge Advisor", when: "2 days ago", status: "recovered" as const, reason: "Stuck in executing state — retried successfully", canReplay: true },
  ];

  const replayItems = [
    { id: "rp-1", event: "INC-050: AI latency spike", when: "Today 6:15 AM", duration: "35 min", outcome: "Mitigated via model fallback" },
    { id: "rp-2", event: "Cost spike: boardroom generation", when: "Yesterday", duration: "2 hours", outcome: "Premium model overuse detected" },
    { id: "rp-3", event: "Plaid connector degradation", when: "45 min ago", duration: "Ongoing", outcome: "Under investigation" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-accent/10 bg-accent/3 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
            <Rewind className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Replay & Rollback Center</h3>
            <p className="text-xs text-muted-foreground">Review what happened, why it was rolled back, and replay events to understand impact</p>
          </div>
        </div>
      </motion.div>

      {/* Rollback History */}
      <div className="space-y-3">
        <SitaSectionHeader title="Rollback History" subtitle="Actions that were reversed" />
        {rollbackItems.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card/80 p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.action}</p>
                <p className="text-[11px] text-muted-foreground">{item.agent} · {item.when}</p>
              </div>
              <Badge variant="outline" className={cn("text-[9px]",
                item.status === "rolled-back" ? "bg-accent/10 text-accent border-accent/20" : "bg-trust-verified/10 text-trust-safe border-trust-verified/20"
              )}>{item.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{item.reason}</p>
            <div className="flex items-center gap-2 justify-end">
              {item.canReplay && (
                <button className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
                  <Play className="h-3 w-3" /> Replay
                </button>
              )}
              <button className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-secondary transition-colors">
                <Eye className="h-3 w-3" /> Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Replay Events */}
      <div className="space-y-3">
        <SitaSectionHeader title="Event Replay" subtitle="Step through what happened during incidents" />
        {replayItems.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-xl border border-border bg-card/80 p-4 hover:border-primary/15 transition-all cursor-pointer"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <History className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.event}</p>
              <p className="text-[10px] text-muted-foreground">{item.when} · Duration: {item.duration}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-foreground">{item.outcome}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Releases ────────────────────────────────────────────────────────────────

function MCReleases() {
  return (
    <div className="space-y-6">
      <ReleaseSafetyCard state={releaseSafety} />
    </div>
  );
}

// ── Permissions ─────────────────────────────────────────────────────────────

function MCPermissions() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/10 bg-primary/3 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Autonomy & Permissions</h3>
            <p className="text-xs text-muted-foreground">Current autonomy levels, allowed/blocked actions, and memory scope for each advisor and agent</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer-Facing Advisors</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PermissionsCard name="Business Advisor" level="L4 — Simulate" allowedActions={["observe", "recommend", "draft", "simulate"]} blockedActions={["execute", "delete"]} memoryScope="Business domain + cross-domain context" />
            <PermissionsCard name="Money Advisor" level="L5 — Approval Ready" allowedActions={["observe", "recommend", "simulate", "draft"]} blockedActions={["execute >$500 without approval"]} memoryScope="Finance domain + confidential tier" />
            <PermissionsCard name="Concierge Advisor" level="L4 — Simulate" allowedActions={["observe", "recommend", "draft", "simulate"]} blockedActions={["book without approval", "send communications"]} memoryScope="Household + calendar" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Internal Agents</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {internalAgents.slice(0, 6).map(a => (
              <PermissionsCard key={a.id} name={a.name} level={a.autonomyLevel} allowedActions={a.permissions} blockedActions={["execute", "modify user data"]} memoryScope="System metrics only" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Safe Mode ───────────────────────────────────────────────────────────────

function MCSafeMode() {
  const [state, setState] = useState<SafeModeState>({ ...safeMode });
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-destructive/10 bg-destructive/3 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15">
            <ShieldAlert className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">Safe Mode Controls</h3>
            <p className="text-xs text-muted-foreground">Emergency controls to pause automation, lock domains, or disable execution</p>
          </div>
        </div>
      </motion.div>

      <SafeModeCard state={state} onToggle={(key, value) => setState(s => ({ ...s, [key]: value }))} />
    </div>
  );
}

// ── History ──────────────────────────────────────────────────────────────────

function MCHistory() {
  const entries = [
    { time: "Today 9:55 AM", event: "Connector Health Agent detected Plaid degradation", type: "connector", severity: "warning" as const },
    { time: "Today 8:45 AM", event: "Release Safety Agent approved canary check", type: "release", severity: "success" as const },
    { time: "Today 6:00 AM", event: "Release deployed to staging ring", type: "release", severity: "info" as const },
    { time: "Yesterday", event: "Cost Guardrail Agent flagged premium model overuse", type: "cost", severity: "warning" as const },
    { time: "2 days ago", event: "Connector Health Agent paused Plaid sync (3 failures)", type: "connector", severity: "warning" as const },
    { time: "3 days ago", event: "Security Watch Agent verified no anomalous patterns", type: "security", severity: "success" as const },
    { time: "5 days ago", event: "Workflow Recovery Agent suggested retry for stuck payment", type: "workflow", severity: "info" as const },
    { time: "1 week ago", event: "Business Advisor autonomy upgraded from L3 to L4", type: "permissions", severity: "info" as const },
    { time: "1 week ago", event: "Knowledge Coordinator updated troubleshooting guides", type: "knowledge", severity: "info" as const },
    { time: "2 weeks ago", event: "Money Advisor memory scope expanded to cross-domain", type: "memory", severity: "info" as const },
  ];

  const typeIcon: Record<string, React.ElementType> = {
    release: Rocket, cost: DollarSign, connector: Wifi, security: Shield,
    workflow: RefreshCw, permissions: Lock, knowledge: FileText, memory: Eye,
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/10 bg-primary/3 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground font-display">AI Team History & Changes</h3>
            <p className="text-xs text-muted-foreground">How the system evolved — advisor changes, agent changes, policy changes, and recovery events</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-1 border-l-2 border-border/40 ml-3 pl-4">
        {entries.map((entry, i) => {
          const TypeIcon = typeIcon[entry.type] || Clock;
          return (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 py-2.5 relative"
            >
              <div className={cn("absolute -left-[1.35rem] top-3.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                entry.severity === "success" ? "bg-trust-safe" : entry.severity === "warning" ? "bg-accent" : "bg-primary/50"
              )} />
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/50">
                <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-foreground">{entry.event}</p>
                <p className="text-[10px] text-muted-foreground">{entry.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared Components ───────────────────────────────────────────────────────

function MetricBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl border px-3 py-2.5 text-center", accent ? "border-accent/20 bg-accent/5" : "border-border bg-card/50")}>
      <p className={cn("font-display text-lg font-bold", accent ? "text-accent" : "text-foreground")}>{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, color }: { icon: React.ElementType; title: string; description: string; color?: string }) {
  return (
    <div className={cn("rounded-2xl border p-10 text-center", color ? `border-${color}/20 bg-${color}/5` : "border-dashed border-border bg-card/30")}>
      <Icon className={cn("h-10 w-10 mx-auto mb-3", color ? `text-${color === "trust-verified" ? "trust-safe" : color}` : "text-muted-foreground/30")} />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

// ── Environment Selector + Diagnostics ──────────────────────────────────────

function EnvironmentBar() {
  const [env, setEnv] = useState<"production" | "staging">("production");

  const exportDiagnostics = () => {
    const bundle = {
      timestamp: new Date().toISOString(),
      environment: env,
      agents: internalAgents.map(a => ({ id: a.id, name: a.name, health: a.health, role: a.role })),
      incidents: incidents.map(i => ({ id: i.id, title: i.title, severity: i.severity, status: i.status })),
      connectors: connectorHealth.map(c => ({ id: c.id, name: c.name, status: c.status })),
      costAnomalies: costAnomalies.length,
      stuckWorkflows: stuckWorkflows.length,
      safeMode: safeMode.globalSafeMode,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sita-diagnostics-${env}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/50 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Environment</span>
        <div className="flex rounded-lg border border-border/40 overflow-hidden">
          <button onClick={() => setEnv("production")} className={cn("px-3 py-1 text-[11px] font-medium transition-all", env === "production" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
            Production
          </button>
          <button onClick={() => setEnv("staging")} className={cn("px-3 py-1 text-[11px] font-medium transition-all", env === "staging" ? "bg-amber-500/10 text-amber-500" : "text-muted-foreground hover:text-foreground")}>
            Staging
          </button>
        </div>
        <div className={cn("h-2 w-2 rounded-full", env === "production" ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
      </div>
      <button onClick={exportDiagnostics} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
        <Database className="h-3 w-3" /> Export Diagnostics
      </button>
    </div>
  );
}

// ── What Matters Now — Founder Panel ────────────────────────────────────────

function WhatMattersNowPanel() {
  const items = useWhatMattersNow();
  const navigate = useNavigate();
  if (items.length === 0) return null;
  const urgencyDot: Record<string, string> = { critical: "bg-destructive", high: "bg-accent", medium: "bg-primary", low: "bg-muted-foreground", info: "bg-primary/50" };
  const urgencyBorder: Record<string, string> = { critical: "border-destructive/20 bg-destructive/5", high: "border-accent/20 bg-accent/5", medium: "border-primary/15 bg-primary/3", low: "border-border bg-card/50", info: "border-border bg-card/30" };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/3 via-card to-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15"><AlertTriangle className="h-5 w-5 text-accent" /></div>
        <div><h3 className="text-sm font-bold text-foreground font-display">What Matters Now</h3><p className="text-[11px] text-muted-foreground">{items.length} item{items.length > 1 ? "s" : ""} needing attention</p></div>
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className={cn("flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:shadow-sm transition-all", urgencyBorder[item.urgency])}
            onClick={() => item.actionRoute && navigate(item.actionRoute)}
          >
            <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", urgencyDot[item.urgency])} />
            <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground truncate">{item.title}</p><p className="text-[10px] text-muted-foreground truncate">{item.description}</p></div>
            {item.actionLabel && <span className="text-[10px] font-medium text-primary shrink-0">{item.actionLabel} →</span>}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Mode Toggle ─────────────────────────────────────────────────────────────

function ModeToggle({ mode, setMode }: { mode: "owner" | "advanced"; setMode: (m: "owner" | "advanced") => void }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/20 p-0.5">
      <button onClick={() => setMode("owner")} className={cn("rounded-lg px-4 py-1.5 text-[11px] font-medium transition-all", mode === "owner" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
        <Eye className="h-3 w-3 inline mr-1.5" />Owner
      </button>
      <button onClick={() => setMode("advanced")} className={cn("rounded-lg px-4 py-1.5 text-[11px] font-medium transition-all", mode === "advanced" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
        <Cpu className="h-3 w-3 inline mr-1.5" />Advanced
      </button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function MissionControlPage() {
const [activeTab, setActiveTab] = useState("home");
  const { mode, setMode, isOwner } = useControlMode();
  const navigate = useNavigate();
  const runtime = useOSRuntime();
  const { data: adminIncidents } = useAdminIncidents();
  const { data: fleetHealth } = useFleetHealth();
  const { data: trustCenter } = useTrustCenter();
  const { data: missionGoals } = useMissionGoals();
  const openIncidents = (adminIncidents && typeof adminIncidents === "object" && "summary" in adminIncidents ? (adminIncidents.summary as Record<string, unknown>)?.open as number : undefined) ?? incidents.filter(i => i.status !== "resolved").length;

  const ownerTabs = [
    { value: "home", label: "Home", icon: Cpu },
    { value: "incidents", label: "Incidents", icon: AlertTriangle, badge: openIncidents > 0 ? openIncidents : undefined },
    { value: "connectors", label: "Connectors", icon: Wifi },
    { value: "costs", label: "Costs", icon: DollarSign },
    { value: "trust", label: "Trust", icon: Shield },
    { value: "safe-mode", label: "Safe Mode", icon: ShieldAlert },
    { value: "platform-truth", label: "Platform Truth", icon: Eye },
  ];

  const advancedTabs = [
    { value: "home", label: "Home", icon: Cpu },
    { value: "ai-team", label: "AI Team", icon: Server, badge: internalAgents.length },
    { value: "incidents", label: "Incidents", icon: AlertTriangle, badge: openIncidents > 0 ? openIncidents : undefined },
    { value: "connectors", label: "Connectors", icon: Wifi },
    { value: "recovery", label: "Recovery", icon: RefreshCw },
    { value: "costs", label: "Costs", icon: DollarSign },
    { value: "trust", label: "Trust", icon: Shield },
    { value: "replay", label: "Replay", icon: Rewind },
    { value: "releases", label: "Releases", icon: Rocket },
    { value: "permissions", label: "Permissions", icon: Lock },
    { value: "safe-mode", label: "Safe Mode", icon: ShieldAlert },
    { value: "activity-feed", label: "Activity", icon: Radio },
    { value: "self-healing", label: "Self-Healing", icon: Heart },
    { value: "self-learning", label: "Self-Learning", icon: Brain },
    { value: "control-panel", label: "Control", icon: Power },
    { value: "history", label: "History", icon: History },
    { value: "predictive", label: "Predictive", icon: Target },
    { value: "audit-log", label: "Audit", icon: ClipboardList },
    { value: "compliance", label: "Compliance", icon: Shield },
    { value: "bcpdr", label: "BCP/DR", icon: RotateCcw },
    { value: "cab", label: "CAB", icon: GitBranch },
    { value: "comm-graph", label: "Agent Comms", icon: Network },
    { value: "heal-notify", label: "Heal Alerts", icon: BellRing },
    { value: "platform-truth", label: "Platform Truth", icon: Eye },
  ];

  const tabs = isOwner ? ownerTabs : advancedTabs;

  const mcAdminData = useMemo(() => ({ adminIncidents, fleetHealth, trustCenter, runtime }), [adminIncidents, fleetHealth, trustCenter, runtime]);

  return (
    <MCAdminCtx.Provider value={mcAdminData}>
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
<div className="flex items-center justify-between">
        <ModeToggle mode={mode} setMode={setMode} />
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={() => navigate("/mission/overview")} className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <BarChart3 className="h-3 w-3" /> Ops Overview
            </button>
            <button onClick={() => navigate("/mission/policies/simulate")} className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <Shield className="h-3 w-3" /> Policy Simulator
            </button>
          </div>
        )}
      </div>

      <SystemPulseHero />
      {isOwner && <WhatMattersNowPanel />}
      <EnvironmentBar />
      <QuickActionsStrip />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5 gap-0.5 flex-wrap">
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <t.icon className="h-3 w-3 mr-1.5" />{t.label}
              {t.badge !== undefined && <Badge className={cn("ml-1.5 h-4 px-1 text-[9px]", t.value === "incidents" ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary")}>{t.badge}</Badge>}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-5">
          <TabsContent value="home"><MCHome /></TabsContent>
          <TabsContent value="ai-team"><MCAgentTeam /></TabsContent>
          <TabsContent value="incidents"><MCIncidents /></TabsContent>
          <TabsContent value="connectors"><MCConnectors /></TabsContent>
          <TabsContent value="recovery"><MCRecovery /></TabsContent>
          <TabsContent value="costs"><MCCosts /></TabsContent>
          <TabsContent value="trust"><MCTrust /></TabsContent>
          <TabsContent value="replay"><MCReplayRollback /></TabsContent>
          <TabsContent value="releases"><MCReleases /></TabsContent>
          <TabsContent value="permissions"><MCPermissions /></TabsContent>
          <TabsContent value="safe-mode"><MCSafeMode /></TabsContent>
          <TabsContent value="activity-feed"><AgentActivityFeed /></TabsContent>
          <TabsContent value="self-healing"><SelfHealingDashboard /></TabsContent>
          <TabsContent value="self-learning"><SelfLearningDashboard /></TabsContent>
          <TabsContent value="control-panel"><AgentControlPanel /></TabsContent>
          <TabsContent value="history"><MCHistory /></TabsContent>
          <TabsContent value="predictive"><PredictiveAnalysisDashboard /></TabsContent>
          <TabsContent value="audit-log"><AgentAuditLog /></TabsContent>
          <TabsContent value="compliance"><ComplianceDashboard /></TabsContent>
          <TabsContent value="bcpdr"><BCPDRDashboard /></TabsContent>
          <TabsContent value="cab"><CABWorkflow /></TabsContent>
          <TabsContent value="comm-graph"><AgentCommunicationGraph /></TabsContent>
          <TabsContent value="heal-notify"><SelfHealingNotifications /></TabsContent>
          <TabsContent value="platform-truth"><PlatformTruthDashboard /></TabsContent>
        </div>
      </Tabs>
    </div>
    </MCAdminCtx.Provider>
  );
}
