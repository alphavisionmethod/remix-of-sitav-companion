import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState, useMemo } from "react";
import { useOSRuntime } from "@/hooks/useOSRuntime";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useSLOs } from "@/hooks/use-admin-data";
import { useCloudControlPlane } from "@/contexts/SitaKernelContext";
// Engine-backed connector data (replaces @/lib/mocks import)
import {
  createSelfHealingService,
  createImmuneController,
  createFleetHealthService,
  HEALING_CAPABILITY_MAP,
  ESCALATION_RULES,
  DEGRADED_MODES,
} from "@/data/seed/system-status";
import type { Incident, ServiceHealthRecord, QuarantineRecord, CircuitBreakerState } from "@/data/seed/system-status";
import {
  Shield, Activity, Wifi, CheckCircle, AlertTriangle, Clock, Eye, Lock,
  Server, RefreshCw, Zap, Globe, Key, ExternalLink, Gauge,
  HeartPulse, Siren, BugOff, ShieldAlert, Layers, Unplug,
  AlertCircle, ArrowRightLeft, Timer, BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DEMO_ENGINE_CONNECTORS, DEMO_FALLBACK_APPROVALS } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

// ── Initialize services with demo data ──────────────────────────

function useSelfHealingDemo() {
  return useMemo(() => {
    const healingService = createSelfHealingService();
    const immuneController = createImmuneController();
    const fleetHealth = createFleetHealthService();

    // Register fleet services
    fleetHealth.registerService("event-bus", "Event Bus", []);
    fleetHealth.registerService("receipt-service", "Receipt Service", ["event-bus"]);
    fleetHealth.registerService("workflow-engine", "Workflow Engine", ["event-bus", "receipt-service"]);
    fleetHealth.registerService("executor-service", "Executor Service", ["workflow-engine"]);
    fleetHealth.registerService("policy-engine", "Policy Engine", []);
    fleetHealth.registerService("connector-control", "Connector Control", ["event-bus"]);
    fleetHealth.registerService("trust-state", "Trust State Service", ["event-bus"]);
    fleetHealth.registerService("memory-service", "Memory Service", ["event-bus"]);
    fleetHealth.registerService("brain-core", "Brain Core", ["policy-engine", "executor-service", "workflow-engine"]);
    fleetHealth.registerService("advisor-protocol", "Advisor Protocol", ["brain-core", "memory-service"]);
    fleetHealth.registerService("search-fabric", "Search Fabric", ["memory-service"]);
    fleetHealth.registerService("projection-service", "Projection Service", ["event-bus"]);

    // Record some health checks
    fleetHealth.recordHealthCheck("event-bus", true, { uptimePercent: 99.99, avgLatencyMs: 2, p99LatencyMs: 12, errorRate: 0.001, requestsPerMinute: 450 });
    fleetHealth.recordHealthCheck("receipt-service", true, { uptimePercent: 99.95, avgLatencyMs: 8, p99LatencyMs: 45, errorRate: 0.002, requestsPerMinute: 120 });
    fleetHealth.recordHealthCheck("workflow-engine", true, { uptimePercent: 99.9, avgLatencyMs: 15, p99LatencyMs: 80, errorRate: 0.005, requestsPerMinute: 85 });
    fleetHealth.recordHealthCheck("executor-service", true, { uptimePercent: 99.8, avgLatencyMs: 22, p99LatencyMs: 150, errorRate: 0.01, requestsPerMinute: 60 });
    fleetHealth.recordHealthCheck("connector-control", false, { uptimePercent: 95, avgLatencyMs: 200, p99LatencyMs: 800, errorRate: 0.08, requestsPerMinute: 30 });
    fleetHealth.recordHealthCheck("policy-engine", true, { uptimePercent: 100, avgLatencyMs: 1, p99LatencyMs: 5, errorRate: 0, requestsPerMinute: 200 });
    fleetHealth.recordHealthCheck("trust-state", true, { uptimePercent: 99.99, avgLatencyMs: 3, p99LatencyMs: 15, errorRate: 0.001, requestsPerMinute: 100 });
    fleetHealth.recordHealthCheck("brain-core", true, { uptimePercent: 99.7, avgLatencyMs: 45, p99LatencyMs: 300, errorRate: 0.02, requestsPerMinute: 40 });
    fleetHealth.recordHealthCheck("advisor-protocol", true, { uptimePercent: 99.5, avgLatencyMs: 120, p99LatencyMs: 500, errorRate: 0.03, requestsPerMinute: 25 });
    fleetHealth.recordHealthCheck("search-fabric", true, { uptimePercent: 99.8, avgLatencyMs: 35, p99LatencyMs: 180, errorRate: 0.01, requestsPerMinute: 55 });
    fleetHealth.recordHealthCheck("memory-service", true, { uptimePercent: 99.9, avgLatencyMs: 10, p99LatencyMs: 60, errorRate: 0.003, requestsPerMinute: 90 });
    fleetHealth.recordHealthCheck("projection-service", true, { uptimePercent: 99.95, avgLatencyMs: 18, p99LatencyMs: 100, errorRate: 0.004, requestsPerMinute: 70 });

    // Create demo incidents
    healingService.runPipeline({
      title: "Connector sync degraded — Stripe",
      description: "Stripe connector experiencing elevated error rates and sync delays",
      severity: "P2",
      rootCause: "connector-failure",
      affectedServices: ["connector-control"],
      evidence: [{ errorRate: 0.08, lastSuccessfulSync: "12m ago" }],
    });

    healingService.runPipeline({
      title: "Workflow queue backlog detected",
      description: "15 workflows stuck in 'executing' state for >5 minutes",
      severity: "P3",
      rootCause: "workflow-stuck",
      affectedServices: ["workflow-engine"],
      evidence: [{ stuckCount: 15, avgStuckDuration: "7m" }],
    });

    healingService.runPipeline({
      title: "AI model latency spike",
      description: "Model response times exceeded P99 threshold",
      severity: "P2",
      rootCause: "model-routing",
      affectedServices: ["brain-core", "advisor-protocol"],
      evidence: [{ p99LatencyMs: 4200, threshold: 2000 }],
    });

    const resolvedIncident = healingService.detect({
      title: "Cache miss rate elevated",
      description: "Cache miss rate spiked to 45% temporarily",
      severity: "P3",
      rootCause: "cache-failure",
      affectedServices: ["search-fabric"],
    });
    healingService.resolve(resolvedIncident.id, "Cache warmed up after restart");

    // Quarantine a service
    immuneController.quarantine("legacy-connector", "Repeated authentication failures", {
      autoRelease: true,
      autoReleaseAfterMs: 3600_000,
      blockedActions: ["sync", "write"],
    });

    return { healingService, immuneController, fleetHealth };
  }, []);
}

// ── Severity Badge ──────────────────────────────────────────────

const SeverityBadge = ({
  severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    P0: "bg-destructive text-destructive-foreground",
    P1: "bg-destructive/80 text-destructive-foreground",
    P2: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    P3: "bg-muted text-muted-foreground",
    P4: "bg-secondary text-secondary-foreground",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[severity] ?? colors.P4}`}>{severity}</span>;
};

const StateBadgeInline = ({ state }: { state: string }) => {
  const colors: Record<string, string> = {
    detected: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    classified: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    triaging: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    planning: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    healing: "bg-primary/15 text-primary",
    verifying: "bg-primary/15 text-primary",
    resolved: "bg-trust-safe/15 text-trust-safe",
    escalated: "bg-destructive/15 text-destructive",
  };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${colors[state] ?? "bg-secondary text-secondary-foreground"}`}>{state}</span>;
};

// ── Main Component ──────────────────────────────────────────────

const SystemStatus = () => {
  const { listRegions, getTopology, getDemoTopology } = useCloudControlPlane();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: slos } = useSLOs();
  const { healingService, immuneController, fleetHealth } = useSelfHealingDemo();

  const activeTab = (() => {
    if (location.pathname.includes("/self-healing")) return "self-healing";
    if (location.pathname.includes("/incidents")) return "incidents";
    if (location.pathname.includes("/fleet")) return "fleet";
    if (location.pathname.includes("/trust")) return "trust";
    if (location.pathname.includes("/health")) return "health";
    if (location.pathname.includes("/connectors")) return "connectors";
    if (location.pathname.includes("/slos")) return "slos";
    if (location.pathname.includes("/history")) return "history";
    return "overview";
  })();

  const goTo = (key: string) => {
    if (key === "overview") navigate("/system");
    else navigate(`/system/${key}`);
  };

  const connectors = DEMO_ENGINE_CONNECTORS;
  const sloData = (slos || []) as Array<{ service: string; slo: number; current: number; burnRate: string; period: string }>;

  const incidents = healingService.getAllIncidents();
  const activeIncidents = healingService.getActiveIncidents();
  const fleetSummary = fleetHealth.getFleetSummary();
  const allServices = fleetHealth.getAllServices();
  const degradedList = fleetHealth.getDegradedServices();
  const quarantinedList = immuneController.getAllQuarantined();
  const cbStates = healingService.getCircuitBreakerStates();
  const immuneStats = immuneController.getStats();
  const healingStats = healingService.getStats();

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
<SitaPageHeader
        title="System Status"
        subtitle="Trust score, self-healing, fleet health, connector health, and execution history"
        actions={<SitaButton variant="secondary"><RefreshCw className="h-4 w-4" /> Refresh</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="System Trust" value="94%" trend="up" sub="Excellent" icon={Shield} className="gradient-sita-subtle" />
        <KPITile label="Fleet Health" value={`${fleetSummary.avgHealthScore}%`} trend={fleetSummary.avgHealthScore >= 90 ? "up" : "down"} sub={`${fleetSummary.healthy}/${fleetSummary.total} healthy`} icon={HeartPulse} />
        <KPITile label="Active Incidents" value={`${activeIncidents.length}`} sub={activeIncidents.length === 0 ? "All clear" : `${healingStats.bySeverity.P0 + healingStats.bySeverity.P1} critical`} icon={Siren} />
        <KPITile label="Self-Healing" value={`${healingStats.resolved}`} sub={`${healingStats.total} total incidents`} icon={BugOff} />
      </div>

      <SitaTabs
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "self-healing", label: "Self-Healing", count: activeIncidents.length || undefined },
          { key: "incidents", label: "Incidents", count: incidents.length || undefined },
          { key: "fleet", label: "Fleet Health", count: fleetSummary.degraded + fleetSummary.unhealthy || undefined },
          { key: "slos", label: "SLOs", count: sloData.filter(s => s.burnRate !== "normal").length || undefined },
          { key: "connectors", label: "Connectors", count: connectors.length },
          { key: "trust", label: "Trust Score" },
          { key: "history", label: "History" },
        ]}
        active={activeTab}
        onChange={goTo}
      />

      {/* ── Overview Tab ───────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <SitaSectionHeader title="System Health" />
            <SitaCard hover={false} glow className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-sita">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">94%</p>
                  <p className="text-sm text-muted-foreground">Overall System Trust Score</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Data Integrity", value: 97 },
                  { label: "Connector Health", value: 85 },
                  { label: "Execution Reliability", value: 98 },
                  { label: "Model Confidence", value: 91 },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-36">{m.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${m.value}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-8">{m.value}%</span>
                  </div>
                ))}
              </div>
            </SitaCard>

            <SitaSectionHeader title="Active Incidents" />
            {activeIncidents.length > 0 ? activeIncidents.slice(0, 3).map(inc => (
              <SitaCard key={inc.id} hover={false} className="p-3" lane="action">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={inc.severity} />
                      <StateBadgeInline state={inc.state} />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{inc.title}</p>
                    <p className="text-[11px] text-muted-foreground">{inc.affectedServices.join(", ")} · {inc.healAttempts} heal attempts</p>
                  </div>
                </div>
              </SitaCard>
            )) : (
              <SitaCard hover={false} className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-trust-safe" />
                  <p className="text-sm text-foreground">No active incidents</p>
                </div>
              </SitaCard>
            )}
          </div>

          <div className="space-y-4">
            <SitaSectionHeader title="Fleet Status" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Healthy", value: fleetSummary.healthy, color: "text-trust-safe" },
                { label: "Degraded", value: fleetSummary.degraded, color: "text-amber-500" },
                { label: "Unhealthy", value: fleetSummary.unhealthy, color: "text-destructive" },
                { label: "Quarantined", value: quarantinedList.length, color: "text-muted-foreground" },
              ].map(s => (
                <SitaCard key={s.label} hover={false} className="p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </SitaCard>
              ))}
            </div>

            <SitaSectionHeader title="Recent Approvals" />
            {(isDemoMode ? DEMO_FALLBACK_APPROVALS : [] as typeof DEMO_FALLBACK_APPROVALS).map((a, i) => (
              <SitaCard key={i} hover={false} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{a.action}</p>
                    <p className="text-[11px] text-muted-foreground">{a.result} · {a.time}</p>
                  </div>
                  <TrustBadge level={a.trust} size="sm" />
                </div>
              </SitaCard>
            ))}

            <SitaSectionHeader title="Security & Policy" />
            <SitaCard hover={false} className="p-4 gradient-sita-subtle">
              <div className="space-y-3">
                {[
                  { icon: Lock, label: "Encryption", value: "AES-256 at rest" },
                  { icon: Key, label: "API Keys", value: "3 active, 0 exposed" },
                  { icon: Shield, label: "RLS Policies", value: "All tables protected" },
                  { icon: Eye, label: "Audit Logging", value: "Enabled — 30d retention" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <s.icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </SitaCard>
          </div>
        </div>
      )}

      {/* ── Self-Healing Tab ───────────────────────────────────── */}
      {activeTab === "self-healing" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPITile label="Auto-Healed" value={`${healingStats.resolved}`} sub="Successfully recovered" icon={BugOff} />
            <KPITile label="Escalated" value={`${healingStats.escalated}`} sub="Needed human review" icon={ShieldAlert} />
            <KPITile label="Circuit Breakers" value={`${cbStates.filter(c => c.state === "open").length}`} sub={`${cbStates.length} total`} icon={Zap} />
            <KPITile label="Immune Rules" value={`${immuneStats.enabledRuleCount}`} sub={`${immuneStats.ruleCount} defined`} icon={BugOff} />
          </div>

          <SitaSectionHeader title="Healing Pipeline" subtitle="Detection → Classification → Triage → Plan → Heal → Verify → Close" />
          <SitaCard hover={false} className="p-5">
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
              {(["detected", "classified", "triaging", "planning", "healing", "verifying", "resolved"] as const).map((step, i) => {
                const count = healingStats.byState[step] ?? 0;
                return (
                  <div key={step} className="flex items-center gap-1">
                    <div className={`flex flex-col items-center min-w-[70px] ${count > 0 ? "" : "opacity-40"}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${count > 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        {count}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1 capitalize">{step}</span>
                    </div>
                    {i < 6 && <ArrowRightLeft className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </SitaCard>

          <SitaSectionHeader title="Escalation Rules" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ESCALATION_RULES.map(rule => (
              <SitaCard key={rule.severity} hover={false} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <SeverityBadge severity={rule.severity} />
                  <span className="text-xs text-muted-foreground">Autonomy: {rule.autonomyLevel}</span>
                </div>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <p>Auto-heal: {rule.autoHeal ? "Yes" : "No"}</p>
                  <p>Council quorum: {rule.requiresCouncilQuorum ? "Required" : "No"}</p>
                  <p>Human approval: {rule.requiresHumanApproval ? "Required" : "No"}</p>
                  <p>Max attempts: {rule.maxAttempts}</p>
                  {rule.notifyOwner && <p className="text-primary font-medium">Owner notified</p>}
                </div>
              </SitaCard>
            ))}
          </div>

          <SitaSectionHeader title="Healing Capabilities" />
          <div className="grid gap-2 sm:grid-cols-2">
            {HEALING_CAPABILITY_MAP.map(cap => (
              <SitaCard key={cap.capability} hover={false} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{cap.capability.replace(/-/g, " ")}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Detect: {cap.detectionAgent} · Act: {cap.actionAgent}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">{cap.autonomyLevel}</Badge>
                </div>
              </SitaCard>
            ))}
          </div>

          <SitaSectionHeader title="Degraded Modes" />
          <div className="grid gap-2 sm:grid-cols-2">
            {DEGRADED_MODES.map(mode => (
              <SitaCard key={mode.mode} hover={false} className="p-3">
                <p className="text-sm font-medium text-foreground">{mode.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Fallback: {mode.fallbackBehavior.replace(/-/g, " ")}</p>
              </SitaCard>
            ))}
          </div>
        </div>
      )}

      {/* ── Incidents Tab ──────────────────────────────────────── */}
      {activeTab === "incidents" && (
        <div className="space-y-4">
          <SitaSectionHeader title="All Incidents" subtitle={`${incidents.length} total — ${activeIncidents.length} active`} />
          {incidents.length === 0 ? (
            <SitaCard hover={false} className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-trust-safe mx-auto mb-2" />
              <p className="text-sm text-foreground">No incidents recorded</p>
            </SitaCard>
          ) : (
            incidents.map(inc => (
              <SitaCard key={inc.id} hover={false} className="p-4" lane={inc.state === "escalated" ? "action" : undefined}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <SeverityBadge severity={inc.severity} />
                      <StateBadgeInline state={inc.state} />
                      {inc.escalatedTo && (
                        <span className="text-[9px] text-destructive">→ {inc.escalatedTo}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{inc.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Server className="h-3 w-3" />{inc.affectedServices.join(", ")}</span>
                      <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{inc.healAttempts}/{inc.maxHealAttempts} attempts</span>
                      <span className="capitalize">Root cause: {inc.rootCause.replace(/-/g, " ")}</span>
                    </div>

                    {/* Timeline */}
                    <div className="mt-3 pt-2 border-t border-border space-y-1">
                      {inc.timeline.slice(-4).map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 text-[10px]">
                          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${entry.state === "resolved" ? "bg-trust-safe" : entry.state === "escalated" ? "bg-destructive" : "bg-primary"}`} />
                          <span className="text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                          <span className="text-foreground">{entry.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SitaCard>
            ))
          )}
        </div>
      )}

      {/* ── Fleet Health Tab ───────────────────────────────────── */}
      {activeTab === "fleet" && (
        <div className="space-y-4">
          <SitaSectionHeader title="Fleet Health" subtitle={`${fleetSummary.total} services · Avg score: ${fleetSummary.avgHealthScore}%`} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allServices.map(svc => {
              const statusColor: Record<string, string> = {
                healthy: "bg-trust-safe",
                degraded: "bg-amber-500 animate-pulse",
                unhealthy: "bg-destructive animate-pulse",
                quarantined: "bg-muted",
              };
              return (
                <SitaCard key={svc.serviceId} hover={false} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${statusColor[svc.status] ?? "bg-muted"}`} />
                    <p className="text-sm font-semibold text-foreground">{svc.name}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Health Score</span>
                      <span className="font-semibold text-foreground">{svc.healthScore}%</span>
                    </div>
                    <Progress value={svc.healthScore} className="h-1.5" />
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                      <span>Uptime: {svc.metrics.uptimePercent}%</span>
                      <span>Latency: {svc.metrics.avgLatencyMs}ms</span>
                      <span>P99: {svc.metrics.p99LatencyMs}ms</span>
                      <span>Errors: {(svc.metrics.errorRate * 100).toFixed(1)}%</span>
                    </div>
                    {svc.dependencies.length > 0 && (
                      <p className="text-[9px] text-muted-foreground/70 mt-1">
                        Deps: {svc.dependencies.join(", ")}
                      </p>
                    )}
                  </div>
                </SitaCard>
              );
            })}
          </div>

          {degradedList.length > 0 && (
            <>
              <SitaSectionHeader title="Degraded Services" />
              {degradedList.map(d => (
                <SitaCard key={d.serviceId} hover={false} className="p-3" lane="action">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.serviceId}</p>
                      <p className="text-[10px] text-muted-foreground">{d.reason}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Recovery: {d.consecutiveHealthyChecks}/{d.requiredHealthyChecks} consecutive healthy checks
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">Degraded</Badge>
                  </div>
                </SitaCard>
              ))}
            </>
          )}

          {quarantinedList.length > 0 && (
            <>
              <SitaSectionHeader title="Quarantined Services" />
              {quarantinedList.map(q => (
                <SitaCard key={q.serviceId} hover={false} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{q.serviceId}</p>
                      <p className="text-[10px] text-muted-foreground">{q.reason}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Blocked: {q.blockedActions.join(", ")} · Auto-release: {q.autoRelease ? "Yes" : "No"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-destructive border-destructive/30">Quarantined</Badge>
                  </div>
                </SitaCard>
              ))}
            </>
          )}
        </div>
      )}

      {/* SLO Monitoring Tab */}
      {activeTab === "slos" && (
        <div className="space-y-4">
          <SitaSectionHeader title="Service Level Objectives" subtitle="30-day compliance and burn rate monitoring" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sloData.map(s => {
              const compliance = s.current >= s.slo;
              const errorBudgetUsed = s.slo > 0 ? Math.max(0, Math.min(100, ((s.slo - s.current) / (100 - s.slo)) * 100)) : 0;
              return (
                <SitaCard key={s.service} hover={false} className="p-4" lane={s.burnRate === "fast" ? "action" : undefined}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">{s.service}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${compliance ? "bg-trust-safe/10 text-trust-safe" : "bg-destructive/10 text-destructive"}`}>
                      {compliance ? "Met" : "Breached"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Target: {s.slo}%</span>
                      <span className="font-semibold text-foreground">{s.current}%</span>
                    </div>
                    <Progress value={s.current} className="h-2" />
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Error budget used</span>
                      <span className={`font-semibold ${errorBudgetUsed > 80 ? "text-destructive" : errorBudgetUsed > 50 ? "text-amber-500" : "text-trust-safe"}`}>
                        {errorBudgetUsed.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${s.burnRate === "normal" ? "bg-trust-safe" : s.burnRate === "medium" ? "bg-amber-500 animate-pulse" : "bg-destructive animate-pulse"}`} />
                      <span className="text-[10px] text-muted-foreground capitalize">{s.burnRate} burn rate</span>
                    </div>
                  </div>
                  {s.burnRate !== "normal" && (
                    <div className="mt-3 pt-2 border-t border-border">
                      <button className="flex items-center gap-1.5 text-[10px] text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> View runbook
                      </button>
                    </div>
                  )}
                </SitaCard>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "connectors" && (
        <div className="space-y-2">
          {connectors.map((c, i) => (
            <SitaCard key={i} hover={false} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${c.status === "connected" ? "bg-trust-verified" : c.status === "degraded" ? "bg-trust-degraded animate-pulse" : "bg-muted"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Last sync: {c.lastSync} · {c.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrustBadge level={c.status === "connected" ? "verified" : c.status === "degraded" ? "degraded" : "blocked"} size="sm" />
                  <SitaButton variant="ghost" size="sm"><RefreshCw className="h-3 w-3" /></SitaButton>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      {activeTab === "trust" && (
        <div className="space-y-4">
          <SitaCard hover={false} className="p-6">
            <SitaCardTitle>Trust Score Breakdown</SitaCardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Real-time trust dimensions across the operating system</p>
            <div className="mt-5 space-y-4">
              {[
                { name: "Policy Compliance", score: 98, icon: Lock, desc: "All active policies passing validation" },
                { name: "Proof Completeness", score: 96, icon: CheckCircle, desc: "Receipt chain intact, 0 orphaned actions" },
                { name: "Verification Health", score: 92, icon: Shield, desc: "Dual-pass verification active on financial workflows" },
                { name: "Rollback Readiness", score: 100, icon: ArrowRightLeft, desc: "All critical workflows have rollback points" },
                { name: "Memory Integrity", score: 94, icon: Layers, desc: "No contradictions detected, 2 stale entries flagged" },
                { name: "Connector Health", score: 78, icon: Unplug, desc: "1 connector degraded (Stripe sync delay)" },
                { name: "Advisor Governance", score: 97, icon: Eye, desc: "All advisor actions within approval thresholds" },
              ].map((dim) => (
                <div key={dim.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <dim.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{dim.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${dim.score >= 90 ? "text-trust-safe" : dim.score >= 70 ? "text-amber-500" : "text-destructive"}`}>{dim.score}%</span>
                  </div>
                  <Progress value={dim.score} className="h-2" />
                  <p className="text-[11px] text-muted-foreground">{dim.desc}</p>
                </div>
              ))}
            </div>
          </SitaCard>
          <SitaCard hover={false} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Overall Trust Score</p>
                <p className="text-[11px] text-muted-foreground">Weighted average across all dimensions</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-trust-safe">94%</p>
                <TrustBadge level="verified" size="sm" />
              </div>
            </div>
          </SitaCard>
        </div>
      )}

      {activeTab === "health" && (
        <div className="space-y-3">
          {allServices.map((svc) => {
            const latest = svc.metrics;
            const isHealthy = svc.healthScore >= 90;
            const isDegraded = svc.healthScore < 90 && svc.healthScore >= 60;
            return (
              <SitaCard key={svc.serviceId} hover={false} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${isHealthy ? "bg-trust-verified" : isDegraded ? "bg-amber-500 animate-pulse" : "bg-destructive animate-pulse"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{svc.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Uptime {latest.uptimePercent}% · Avg {latest.avgLatencyMs}ms · P99 {latest.p99LatencyMs}ms · {latest.requestsPerMinute} req/min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${latest.errorRate === 0 ? "text-trust-safe" : latest.errorRate < 0.05 ? "text-muted-foreground" : "text-destructive"}`}>
                      {(latest.errorRate * 100).toFixed(2)}% err
                    </span>
                    <div className="w-16">
                      <Progress value={svc.healthScore} className="h-1.5" />
                    </div>
                    <span className="text-xs font-bold text-foreground w-8 text-right">{svc.healthScore}%</span>
                    <TrustBadge level={isHealthy ? "verified" : isDegraded ? "degraded" : "blocked"} size="sm" />
                  </div>
                </div>
                {svc.dependencies.length > 0 && (
                  <p className="mt-1.5 text-[10px] text-muted-foreground ml-6">Depends on: {svc.dependencies.join(", ")}</p>
                )}
              </SitaCard>
            );
          })}
          <SitaCard hover={false} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Fleet Summary</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-trust-safe">{fleetSummary.healthy} healthy</span>
                <span className="text-amber-500">{fleetSummary.degraded} degraded</span>
                <span className="text-destructive">{fleetSummary.unhealthy} unhealthy</span>
                <span className="font-bold text-foreground">Avg: {fleetSummary.avgHealthScore}%</span>
              </div>
            </div>
          </SitaCard>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {[...(isDemoMode ? DEMO_FALLBACK_APPROVALS : [] as typeof DEMO_FALLBACK_APPROVALS).map((a, i) => ({
            id: `approval-${i}`,
            type: "approval" as const,
            title: a.action,
            result: a.result,
            time: a.time,
            trust: a.trust,
          })),
          ...incidents.map((inc) => ({
            id: inc.id,
            type: "incident" as const,
            title: inc.title,
            result: inc.state === "resolved" ? "Auto-healed" : `State: ${inc.state}`,
            time: new Date(inc.createdAt).toLocaleTimeString(),
            trust: (inc.state === "resolved" ? "verified" : inc.severity === "P0" || inc.severity === "P1" ? "blocked" : "review") as "verified" | "blocked" | "review" | "approval",
          }))].sort(() => 0.5 - Math.random()).map((entry) => (
            <SitaCard key={entry.id} hover={false} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${entry.type === "approval" ? "bg-primary/10" : "bg-amber-500/10"}`}>
                    {entry.type === "approval" ? <CheckCircle className="h-3.5 w-3.5 text-primary" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.title}</p>
                    <p className="text-[11px] text-muted-foreground">{entry.result} · {entry.time}</p>
                  </div>
                </div>
                <TrustBadge level={entry.trust} size="sm" />
              </div>
            </SitaCard>
          ))}
          <SitaCard hover={false} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Execution Summary</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{(isDemoMode ? DEMO_FALLBACK_APPROVALS : [] as typeof DEMO_FALLBACK_APPROVALS).length} approvals</span>
                <span>{incidents.length} incidents</span>
                <span className="text-trust-safe">{incidents.filter(i => i.state === "resolved").length} resolved</span>
              </div>
            </div>
          </SitaCard>
        </div>
      )}
    </motion.div>
  );
};

export default SystemStatus;
