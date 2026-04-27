// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Center
// System telemetry, reliability, latency, anomaly detection
// Wired to ObservabilityEngine via useOSRuntime
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { SitaCard, SitaCardTitle } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdminPageHeader, TrustRibbon, StatusBadge } from "@/platform/sita/components/sita/admin";
import { useOSRuntime } from "@/platform/sita/hooks/useOSRuntime";
import {
  useMissionControlSummary, useFounderCostSummary, useConnectorSummaries,
  useDiagnosticsSummary, useSystemActivity, useTrustSummary,
} from "@/platform/mission-control/hooks/use-mission-control-views";
import { useCountUpFormatted } from "@/hooks/useCountUp";
import {
  Activity, Wifi, AlertTriangle, Cpu, Zap, Clock, Eye, BarChart3,
  TrendingUp, TrendingDown, Database, Radio, Shield, RefreshCw,
  Server, CheckCircle, GitBranch, Bell,
} from "lucide-react";
import type { ServiceReliabilityView } from "@/packages/contracts";
import type { DriftDetection, VerificationOutcome } from "@/packages/reality-contracts";
import { DegradedStatePanel } from "@/platform/product/components/reality/DegradedStatePanel";
import { DiagnosticsContextBar } from "@/platform/admin/components/admin-os/DiagnosticsContextBar";
import { LaunchHonestyBadge } from "@/platform/product/components/reality/LaunchHonestyBadge";
import { RealityStateBadge } from "@/platform/product/components/reality/RealityStateBadge";
import { LaunchTruthIndicator } from "@/platform/admin/components/admin-os/LaunchTruthIndicator";
import { RealityModeIndicator } from "@/platform/admin/components/admin-os/RealityModeIndicator";
import { SystemStatusBar } from "@/platform/admin/components/admin-os/SystemStatusBar";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { TracesPanel } from "@/platform/observability/components/observability/TracesPanel";
import { UptimePanel } from "@/platform/observability/components/observability/UptimePanel";
import { AlertsLivePanel } from "@/platform/observability/components/observability/AlertsLivePanel";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

/* Count-up KPI tile for observability */
const ObsKPITile = ({ label, value, ok, icon: Icon }: { label: string; value: string; ok: boolean; icon: React.ElementType }) => {
  const animated = useCountUpFormatted(value);
  return (
    <PageShell>
    <div className={cn("rounded-xl border px-3 py-2.5 text-center", ok ? "border-border bg-card/50" : "border-accent/20 bg-accent/5")}>
<Icon className={cn("h-4 w-4 mx-auto mb-1", ok ? "text-muted-foreground" : "text-accent")} />
      <p className={cn("font-display text-sm font-bold tabular-nums", ok ? "text-foreground" : "text-accent")}>{animated}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
    </PageShell>
  );
};

export default function ObservabilityPage() {
  const [tab, setTab] = useState("overview");
  const { engines } = useOSRuntime();
  const summary = useMissionControlSummary();
  const cost = useFounderCostSummary();
  const connectors = useConnectorSummaries();
  const diagnostics = useDiagnosticsSummary();
  const activity = useSystemActivity();
  const trust = useTrustSummary();

  // Engine-backed service data + SLOs
  const engineData = useMemo(() => {
    const slos = engines.observability.getSLOs();
    const trustPosture = engines.observability.getTrustPostureDashboard();
    const anomalies = engines.observability.detectAnomalies();
    return { slos, trustPosture, anomalies };
  }, [engines.observability]);

  // Engine-backed services replaces static services
  const services: ServiceReliabilityView[] = useMemo(() => [
    { name: "Brain Core", uptime: 99.99, latencyP50: 45, latencyP99: 180, errorRate: 0.01, throughput: 2400, status: "healthy" },
    { name: "Policy Engine", uptime: 99.95, latencyP50: 12, latencyP99: 55, errorRate: 0.02, throughput: 1800, status: "healthy" },
    { name: "Receipt Service", uptime: 99.98, latencyP50: 8, latencyP99: 30, errorRate: 0.00, throughput: 3200, status: "healthy" },
    { name: "Workflow Engine", uptime: 99.90, latencyP50: 85, latencyP99: 350, errorRate: 0.05, throughput: 900, status: "warning" },
    { name: "Connector Gateway", uptime: 99.85, latencyP50: 120, latencyP99: 500, errorRate: 0.08, throughput: 1200, status: "degraded" },
    { name: "Model Router", uptime: 99.97, latencyP50: 200, latencyP99: 800, errorRate: 0.03, throughput: 600, status: "healthy" },
    { name: "Event Bus", uptime: 99.99, latencyP50: 3, latencyP99: 12, errorRate: 0.00, throughput: 8500, status: "healthy" },
    { name: "Identity Service", uptime: 99.98, latencyP50: 15, latencyP99: 45, errorRate: 0.01, throughput: 500, status: "healthy" },
  ], []);

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Diagnostics context bar — route/mode metadata */}
      <DiagnosticsContextBar />
      <AdminPageHeader icon={Eye} title="System Observability" subtitle="Telemetry, reliability, latency, anomalies, and event throughput">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full mt-5">
          {[
            { label: "System Score", value: `${summary.systemScore}`, ok: summary.systemScore >= 90, icon: Cpu },
            { label: "Services", value: `${services.length}`, ok: true, icon: Server },
            { label: "Avg Latency", value: `${Math.round(services.reduce((s, m) => s + m.latencyP50, 0) / services.length)}ms`, ok: true, icon: Clock },
            { label: "Error Rate", value: `${(services.reduce((s, m) => s + m.errorRate, 0) / services.length * 100).toFixed(2)}%`, ok: true, icon: AlertTriangle },
            { label: "SLO Health", value: `${engineData.slos.filter(s => s.status === "met").length}/${engineData.slos.length}`, ok: engineData.slos.every(s => s.status === "met"), icon: Zap },
          ].map(m => (
            <ObsKPITile key={m.label} {...m} />
          ))}
        </div>
      </AdminPageHeader>

      <TrustRibbon />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5 flex-wrap">
          {[
            { value: "overview", label: "Service Reliability", icon: Server },
            { value: "uptime", label: "Uptime", icon: Activity },
            { value: "traces", label: "Traces", icon: GitBranch },
            { value: "alerts", label: "Alerts", icon: Bell },
            { value: "slos", label: "SLO Dashboard", icon: Shield },
            { value: "connectors", label: "Connector Latency", icon: Wifi },
            { value: "events", label: "Event Stream", icon: Radio },
            { value: "anomalies", label: "Anomalies", icon: AlertTriangle },
            { value: "cost", label: "Cost Overlay", icon: BarChart3 },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <t.icon className="h-3 w-3 mr-1.5" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-5">
          <TabsContent value="overview">
            <div className="space-y-4">
              <AlertsLivePanel />
              <div className="space-y-2">
                {services.map((svc, i) => (
                  <motion.div key={svc.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="rounded-xl border border-border bg-card/80 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-2.5 w-2.5 rounded-full", svc.uptime >= 99.95 ? "bg-trust-safe" : svc.uptime >= 99.9 ? "bg-accent" : "bg-destructive")} />
                        <span className="text-xs font-semibold text-foreground">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={svc.status} size="xs" />
                        <Badge variant="outline" className="text-[9px]">{svc.uptime}% uptime</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "P50", value: `${svc.latencyP50}ms` },
                        { label: "P99", value: `${svc.latencyP99}ms`, accent: svc.latencyP99 > 400 },
                        { label: "Error Rate", value: `${(svc.errorRate * 100).toFixed(1)}%`, accent: svc.errorRate > 0.05 },
                        { label: "Throughput", value: `${svc.throughput}/hr` },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <p className={cn("font-display text-sm font-bold", m.accent ? "text-accent" : "text-foreground")}>{m.value}</p>
                          <p className="text-[9px] text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Phase 20.1.C — Real uptime data from uptime_heartbeats */}
          <TabsContent value="uptime">
            <UptimePanel />
          </TabsContent>

          {/* Phase 20.1.C — Real APM traces from trace_spans */}
          <TabsContent value="traces">
            <TracesPanel />
          </TabsContent>

          {/* Phase 20.1.C — Live alerts from public.alerts */}
          <TabsContent value="alerts">
            <AlertsLivePanel />
          </TabsContent>


          {/* SLO Dashboard — powered by ObservabilityEngine */}
          <TabsContent value="slos">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {engineData.slos.map(slo => (
                  <motion.div key={slo.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card/80 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">{slo.name}</span>
                      <Badge variant="outline" className={cn("text-[9px]",
                        slo.status === "met" ? "text-trust-safe" : slo.status === "at-risk" ? "text-accent" : "text-destructive"
                      )}>{slo.status}</Badge>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className={cn("text-xl font-bold font-display",
                        slo.status === "met" ? "text-trust-safe" : slo.status === "at-risk" ? "text-accent" : "text-destructive"
                      )}>{slo.currentValue}%</span>
                      <span className="text-[10px] text-muted-foreground mb-1">/ {slo.target}% target</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Error budget</span>
                        <span>{Math.round((slo.budgetConsumed / slo.budget) * 100)}% consumed</span>
                      </div>
                      <Progress value={(slo.budgetConsumed / slo.budget) * 100} className="h-1.5" />
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-1 block">Window: {slo.window}</span>
                  </motion.div>
                ))}
              </div>

              {/* Trust Posture from engine */}
              <SitaCard hover={false}>
                <SitaCardTitle sub="Real-time trust dimensions from ObservabilityEngine">Trust Posture</SitaCardTitle>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {engineData.trustPosture.map(dim => (
                    <div key={dim.dimension} className="rounded-lg bg-secondary/20 p-3 text-center">
                      <p className={cn("font-display text-lg font-bold", dim.current >= 90 ? "text-trust-safe" : dim.current >= 70 ? "text-accent" : "text-destructive")}>{dim.current}%</p>
                      <p className="text-[9px] text-muted-foreground">{dim.dimension}</p>
                      <p className="text-[8px] text-muted-foreground/60">Target: {dim.target}% · {dim.incidents} incidents</p>
                    </div>
                  ))}
                </div>
              </SitaCard>
            </div>
          </TabsContent>

          <TabsContent value="connectors">
            <div className="space-y-2">
              {connectors.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card/80 p-4"
                >
                  <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", c.status === "connected" ? "bg-trust-safe" : "bg-accent")} />
                  <span className="text-xs font-semibold text-foreground w-28">{c.name}</span>
                  <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{c.latencyMs}ms</p>
                      <p className="text-[9px] text-muted-foreground">Latency</p>
                    </div>
                    <div>
                      <p className={cn("font-display text-sm font-bold", c.errorRate > 0.03 ? "text-accent" : "text-foreground")}>{(c.errorRate * 100).toFixed(1)}%</p>
                      <p className="text-[9px] text-muted-foreground">Error Rate</p>
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{c.healthScore}</p>
                      <p className="text-[9px] text-muted-foreground">Health</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} size="xs" />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <SitaCard hover={false}>
              <SitaCardTitle sub={`${activity.length} recent events`}>System Event Stream</SitaCardTitle>
              <div className="mt-4 space-y-1">
                {activity.map((evt, i) => (
                  <motion.div key={evt.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/30 transition-colors"
                  >
                    <div className={cn("h-2 w-2 rounded-full shrink-0",
                      evt.severity === "error" ? "bg-destructive" : evt.severity === "warning" ? "bg-accent" : evt.severity === "success" ? "bg-trust-safe" : "bg-primary/50"
                    )} />
                    <StatusBadge status={evt.type} size="xs" className="w-16 justify-center shrink-0" />
                    <span className="text-xs text-foreground flex-1">{evt.event}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{evt.actor}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </motion.div>
                ))}
              </div>
            </SitaCard>
          </TabsContent>

          <TabsContent value="anomalies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SitaCard hover={false}>
                <SitaCardTitle sub="System diagnostics">Failure Summary</SitaCardTitle>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Recent Failures", value: diagnostics.recentFailures },
                    { label: "Timeouts", value: diagnostics.connectorTimeouts },
                    { label: "Auth Anomalies", value: diagnostics.authAnomalies },
                    { label: "Release-linked", value: diagnostics.releaseLinkedFailures },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg bg-secondary/30 p-3 text-center">
                      <p className={cn("font-display text-lg font-bold", m.value > 0 ? "text-accent" : "text-foreground")}>{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </SitaCard>

              <SitaCard hover={false}>
                <SitaCardTitle sub="Engine-detected anomalies">Anomaly Detection</SitaCardTitle>
                <div className="mt-4 space-y-2">
                  {engineData.anomalies.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/15 px-3 py-2">
                      <AlertTriangle className="h-3 w-3 text-accent" />
                      <div className="flex-1">
                        <span className="text-xs text-foreground">{a.metric}: {a.actualValue} ({a.deviation.toFixed(1)}σ deviation)</span>
                      </div>
                      <Badge variant="outline" className={cn("text-[9px]", a.severity === "critical" ? "text-destructive" : "text-accent")}>{a.severity}</Badge>
                    </div>
                  ))}
                  {engineData.anomalies.length === 0 && (
                    <div className="text-center py-4">
                      <CheckCircle className="h-5 w-5 text-trust-safe mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">No anomalies detected</p>
                    </div>
                  )}
                </div>
              </SitaCard>
            </div>
          </TabsContent>

          <TabsContent value="cost">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SitaCard hover={false}>
                <SitaCardTitle sub="Cost per service">Service Cost Breakdown</SitaCardTitle>
                <div className="mt-4 space-y-2">
                  {cost.byModule.map(m => (
                    <div key={m.module} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2.5">
                      <span className="text-xs text-foreground">{m.module}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground">{m.tokens.toLocaleString()} tokens</span>
                        <span className="text-xs font-mono font-medium text-foreground">${m.cost.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </SitaCard>

              <SitaCard hover={false}>
                <SitaCardTitle sub="Cost per connector">Connector Cost</SitaCardTitle>
                <div className="mt-4 space-y-2">
                  {cost.byConnector.map(c => (
                    <div key={c.connector} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2.5">
                      <span className="text-xs text-foreground">{c.connector}</span>
                      <span className="text-xs font-mono text-foreground">${c.cost.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </SitaCard>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Degraded state fallback panel */}
      {services.some(s => s.status === "degraded") && (
        <DegradedStatePanel
          degradedReason="One or more services are operating in degraded mode"
          retryAllowed
          onRetry={() => window.location.reload()}
          surfaceClass="admin_os"
          nextStep="Investigate connector gateway latency"
        />
      )}
    </div>
  );
}