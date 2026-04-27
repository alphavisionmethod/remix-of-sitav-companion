// ═══════════════════════════════════════════════════════════════
// SITA OS — Enterprise Maturity Dashboard (Phase 6)
// Enterprise control, support, observability, release safety,
// trust device, compliance — unified premium surface
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOSRuntime } from "@/platform/sita/hooks/useOSRuntime";
import {
  Shield, Activity, Wifi, AlertTriangle, Rocket, Lock, Eye,
  Monitor, Smartphone, Tablet, Server, CheckCircle2, XCircle,
  Clock, BarChart3, FileText, Users, Building2, Fingerprint,
  BellRing, HeartPulse, Target, Gauge, RefreshCw, Download,
  ArrowRight, Zap, ShieldCheck, Database, Globe, Key, GitBranch,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";



// ── SLO Card ───────────────────────────────────────────────────
function SLOCard({ slo }: { slo: { id: string; name: string; target: number; currentValue: number; budget: number; budgetConsumed: number; status: string; window: string } }) {
  const statusColor = { met: "text-trust-safe", "at-risk": "text-accent", breached: "text-destructive" };
  return (
    <PageShell>
    <div className="rounded-xl border border-border/40 bg-card/60 p-4">
<div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">{slo.name}</span>
        <Badge variant="outline" className={cn("text-[9px]", statusColor[slo.status as keyof typeof statusColor])}>{slo.status}</Badge>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className={cn("text-xl font-bold font-display", statusColor[slo.status as keyof typeof statusColor])}>{slo.currentValue}%</span>
        <span className="text-[10px] text-muted-foreground mb-1">/ {slo.target}% target</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Error budget</span>
          <span>{Math.round((slo.budgetConsumed / slo.budget) * 100)}% used</span>
        </div>
        <Progress value={(slo.budgetConsumed / slo.budget) * 100} className="h-1.5" />
      </div>
      <span className="text-[9px] text-muted-foreground mt-1 block">Window: {slo.window}</span>
    </div>
    </PageShell>
  );
}

// ── Device Card ────────────────────────────────────────────────
function DeviceCard({ device }: { device: any }) {
  const iconMap = { desktop: Monitor, mobile: Smartphone, tablet: Tablet, "hardware-key": Key };
  const Icon = iconMap[device.type as keyof typeof iconMap] || Monitor;
  const trustColor = { "secure-enclave": "text-trust-safe", trusted: "text-primary", verified: "text-accent", basic: "text-muted-foreground", untrusted: "text-destructive" };

  return (
    <div className={cn("rounded-xl border border-border/40 bg-card/60 p-4", device.revoked && "opacity-50")}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{device.name}</p>
          <p className="text-[10px] text-muted-foreground">{device.diagnostics.osVersion} · {device.diagnostics.appVersion}</p>
        </div>
        <Badge variant="outline" className={cn("text-[9px]", trustColor[device.trustLevel as keyof typeof trustColor])}>
          {device.trustLevel}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div><p className="text-sm font-bold text-foreground">{device.trustScore}</p><p className="text-[9px] text-muted-foreground">Trust</p></div>
        <div><p className="text-sm font-bold text-foreground">{device.localProofCache}</p><p className="text-[9px] text-muted-foreground">Proofs</p></div>
        <div><p className="text-sm font-bold text-foreground">{device.queuedActions}</p><p className="text-[9px] text-muted-foreground">Queued</p></div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
        {device.signingAuthority && <Badge className="bg-trust-safe/10 text-trust-safe border-trust-safe/20 text-[9px]"><Fingerprint className="h-2.5 w-2.5 mr-1" />Signing</Badge>}
        {device.canApproveHighTrust && <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px]"><ShieldCheck className="h-2.5 w-2.5 mr-1" />High-Trust</Badge>}
        <span className="text-[9px] text-muted-foreground ml-auto">Last seen: {new Date(device.lastSeen).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

// ── Audit Entry ────────────────────────────────────────────────
function AuditEntry({ entry }: { entry: any }) {
  const actorColor = { user: "bg-primary/10 text-primary", advisor: "bg-sita-gold/10 text-sita-gold", agent: "bg-accent/10 text-accent", system: "bg-muted text-muted-foreground" };
  const outcomeIcon = { success: CheckCircle2, failure: XCircle, denied: Shield };
  const OutcomeIcon = outcomeIcon[entry.outcome as keyof typeof outcomeIcon] || CheckCircle2;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0">
      <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-bold", actorColor[entry.actorType as keyof typeof actorColor])}>
        {entry.actor.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{entry.action}</p>
        <p className="text-[10px] text-muted-foreground truncate">{entry.resource}</p>
      </div>
      <OutcomeIcon className={cn("h-3.5 w-3.5 shrink-0", entry.outcome === "success" ? "text-trust-safe" : entry.outcome === "denied" ? "text-destructive" : "text-accent")} />
      <span className="text-[9px] text-muted-foreground shrink-0">{new Date(entry.timestamp).toLocaleTimeString()}</span>
    </div>
  );
}

// ── Release Card ───────────────────────────────────────────────
function ReleaseCard({ release }: { release: any }) {
  const statusColor: Record<string, string> = { ga: "text-trust-safe", canary: "text-accent", "ring-1": "text-primary", "rolled-back": "text-destructive", frozen: "text-muted-foreground" };
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-foreground font-display">{release.version}</p>
          <p className="text-[10px] text-muted-foreground">{release.name}</p>
        </div>
        <Badge variant="outline" className={cn("text-[9px]", statusColor[release.status])}>{release.status}</Badge>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs text-foreground font-medium">{release.confidenceScore}% confidence</span>
        <Progress value={release.confidenceScore} className="flex-1 h-1.5" />
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {release.features.map((f: string) => (
          <Badge key={f} variant="outline" className="text-[9px]">{f}</Badge>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-muted-foreground">Checklist: {release.readinessChecklist.filter((c: Record<string, any>) => c.met).length}/{release.readinessChecklist.length}</span>
        {release.impactPrediction.riskLevel !== "low" && (
          <Badge className="bg-accent/10 text-accent border-accent/20 text-[9px]">
            <AlertTriangle className="h-2.5 w-2.5 mr-1" />{release.impactPrediction.riskLevel} risk
          </Badge>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function EnterpriseMaturityDashboard() {
  const { engines } = useOSRuntime();
  const [activeTab, setActiveTab] = useState("overview");

  const slos = useMemo(() => engines.observability.getSLOs(), [engines.observability]);
  const anomalies = useMemo(() => engines.observability.detectAnomalies(), [engines.observability]);
  const latency = useMemo(() => engines.observability.getLatencyOverview(), [engines.observability]);
  const trustPosture = useMemo(() => engines.observability.getTrustPostureDashboard(), [engines.observability]);
  const devices = useMemo(() => engines.trustDevice.getDemoDevices(), [engines.trustDevice]);
  const fleetSummary = useMemo(() => {
    // Seed demo devices
    devices.forEach(d => { try { engines.trustDevice.enrollDevice({ ...d }); } catch {} });
    return engines.trustDevice.getFleetSummary();
  }, [engines.trustDevice, devices]);
  const releases = useMemo(() => engines.releases.getDemoReleases(), [engines.releases]);
  const environments = useMemo(() => engines.releases.getEnvironments(), [engines.releases]);
  const compliance = useMemo(() => engines.compliance.getComplianceSummary(), [engines.compliance]);
  const auditEntries = useMemo(() => engines.compliance.getDemoAuditEntries(), [engines.compliance]);
  const connectorGov = useMemo(() => engines.enterprise.getConnectorGovernance(), [engines.enterprise]);
  const supportAnalytics = useMemo(() => engines.support.getSupportAnalytics(), [engines.support]);
  const knownIssues = useMemo(() => engines.support.getKnownIssues(), [engines.support]);

  const overallHealth = Math.round(slos.reduce((s, slo) => s + (slo.status === "met" ? 100 : slo.status === "at-risk" ? 70 : 30), 0) / slos.length);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground font-display">Enterprise Maturity</h1>
            <p className="text-sm text-muted-foreground">Control plane · Support · Observability · Release Safety · Trust Devices · Compliance</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-trust-safe font-display">{overallHealth}%</p>
              <p className="text-[9px] text-muted-foreground">Platform Health</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground font-display">{devices.length}</p>
              <p className="text-[9px] text-muted-foreground">Trusted Devices</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary font-display">{releases.length}</p>
              <p className="text-[9px] text-muted-foreground">Active Releases</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "SLOs Met", value: `${slos.filter(s => s.status === "met").length}/${slos.length}`, icon: Target, color: "text-trust-safe" },
          { label: "Anomalies", value: anomalies.filter(a => !a.autoResolved).length, icon: AlertTriangle, color: anomalies.filter(a => !a.autoResolved).length > 0 ? "text-accent" : "text-trust-safe" },
          { label: "Open Cases", value: supportAnalytics.openCases, icon: HeartPulse, color: "text-primary" },
          { label: "Compliance", value: `${compliance.auditCoverage}%`, icon: Shield, color: "text-trust-safe" },
          { label: "Fleet Trust", value: `${fleetSummary.avgTrustScore || 89}%`, icon: Fingerprint, color: "text-primary" },
          { label: "Environments", value: environments.length, icon: Globe, color: "text-foreground" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
            <kpi.icon className={cn("h-4 w-4 mx-auto mb-1", kpi.color)} />
            <p className={cn("text-lg font-bold font-display", kpi.color)}>{kpi.value}</p>
            <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-9 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "overview", label: "Overview", icon: BarChart3 },
            { value: "observability", label: "Observability", icon: Activity },
            { value: "support", label: "Support", icon: HeartPulse },
            { value: "releases", label: "Releases", icon: Rocket },
            { value: "trust-devices", label: "Trust Devices", icon: Fingerprint },
            { value: "compliance", label: "Compliance", icon: Shield },
            { value: "enterprise", label: "Enterprise", icon: Building2 },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[11px] h-8 px-3 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <t.icon className="h-3 w-3 mr-1.5" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-5">
          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> SLO Dashboard</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slos.slice(0, 4).map(slo => <SLOCard key={slo.id} slo={slo} />)}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Recent Activity</h3>
                <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                  {auditEntries.slice(0, 6).map(entry => <AuditEntry key={entry.id} entry={entry} />)}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Observability */}
          <TabsContent value="observability">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground font-display mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Service Level Objectives</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slos.map(slo => <SLOCard key={slo.id} slo={slo} />)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground font-display mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Latency Overview</h3>
                <div className="rounded-xl border border-border/40 bg-card/60 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border/30 bg-muted/20">
                      <th className="text-left p-3 text-muted-foreground font-medium">Service</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">p50</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">p95</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">p99</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Trend</th>
                    </tr></thead>
                    <tbody>
                      {latency.map(l => (
                        <tr key={l.service} className="border-b border-border/10">
                          <td className="p-3 font-medium text-foreground">{l.service}</td>
                          <td className="p-3 text-right text-muted-foreground">{l.p50}ms</td>
                          <td className="p-3 text-right text-muted-foreground">{l.p95}ms</td>
                          <td className={cn("p-3 text-right font-medium", l.p99 > 500 ? "text-accent" : "text-foreground")}>{l.p99}ms</td>
                          <td className="p-3 text-right">
                            <Badge variant="outline" className={cn("text-[9px]", l.trend === "improving" ? "text-trust-safe" : l.trend === "degrading" ? "text-destructive" : "text-muted-foreground")}>{l.trend}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground font-display mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-accent" /> Anomaly Signals</h3>
                <div className="space-y-2">
                  {anomalies.map(a => (
                    <div key={a.id} className={cn("rounded-xl border p-3 flex items-center gap-3", a.severity === "critical" ? "border-destructive/30 bg-destructive/5" : a.severity === "warning" ? "border-accent/30 bg-accent/5" : "border-border/40 bg-card/60")}>
                      <AlertTriangle className={cn("h-4 w-4 shrink-0", a.severity === "critical" ? "text-destructive" : a.severity === "warning" ? "text-accent" : "text-muted-foreground")} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-foreground">{a.metric}</p>
                        <p className="text-[10px] text-muted-foreground">Expected: {a.expectedRange[0]}-{a.expectedRange[1]} · Actual: {a.actualValue} · {a.deviation}σ deviation</p>
                      </div>
                      {a.autoResolved && <Badge className="bg-trust-safe/10 text-trust-safe border-trust-safe/20 text-[9px]">Auto-resolved</Badge>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground font-display mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Trust Posture</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {trustPosture.map(d => (
                    <div key={d.dimension} className="rounded-xl border border-border/40 bg-card/60 p-3">
                      <p className="text-[10px] text-muted-foreground mb-1">{d.dimension}</p>
                      <div className="flex items-end gap-1.5 mb-2">
                        <span className={cn("text-lg font-bold font-display", d.current >= d.target ? "text-trust-safe" : "text-accent")}>{d.current}%</span>
                        <span className="text-[9px] text-muted-foreground mb-0.5">/ {d.target}%</span>
                      </div>
                      <Progress value={d.current} className="h-1.5" />
                      <div className="flex items-center justify-between mt-1.5">
                        <Badge variant="outline" className={cn("text-[8px]", d.trend === "up" ? "text-trust-safe" : d.trend === "down" ? "text-destructive" : "text-muted-foreground")}>
                          {d.trend === "up" ? "↑" : d.trend === "down" ? "↓" : "→"} {d.trend}
                        </Badge>
                        {d.incidents > 0 && <span className="text-[9px] text-accent">{d.incidents} incident{d.incidents > 1 ? "s" : ""}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Support */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" /> Support Analytics</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Cases", value: supportAnalytics.totalCases, color: "text-foreground" },
                    { label: "Open", value: supportAnalytics.openCases, color: supportAnalytics.openCases > 0 ? "text-accent" : "text-trust-safe" },
                    { label: "Avg Resolution", value: `${supportAnalytics.avgResolutionHours}h`, color: "text-foreground" },
                    { label: "SLA Breach Rate", value: `${Math.round(supportAnalytics.slaBreachRate * 100)}%`, color: supportAnalytics.slaBreachRate > 0.1 ? "text-destructive" : "text-trust-safe" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
                      <p className={cn("text-xl font-bold font-display", s.color)}>{s.value}</p>
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                  <Download className="h-3.5 w-3.5" /> Export Diagnostic Bundle
                </button>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2"><BellRing className="h-4 w-4 text-accent" /> Known Issues</h3>
                <div className="space-y-2">
                  {knownIssues.map(ki => (
                    <div key={ki.id} className="rounded-xl border border-border/40 bg-card/60 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-foreground">{ki.description}</p>
                        <Badge variant="outline" className={cn("text-[9px]", ki.autoResolve ? "text-trust-safe" : "text-accent")}>{ki.autoResolve ? "auto-resolve" : "manual"}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-1">{ki.remediation}</p>
                      <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                        <span>{ki.occurrences} occurrences</span>
                        <span>Modules: {ki.affectedModules.join(", ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Releases */}
          <TabsContent value="releases">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground font-display mb-3 flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Environments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {environments.map(env => (
                    <div key={env.name} className="rounded-xl border border-border/40 bg-card/60 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-foreground capitalize">{env.name}</p>
                        <Badge variant="outline" className="text-[9px]">{env.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Release: <span className="text-foreground font-medium">{env.activeRelease}</span></p>
                      <div className="flex flex-wrap gap-1">
                        {env.featureFlags.slice(0, 3).map(f => <Badge key={f} variant="outline" className="text-[8px]">{f}</Badge>)}
                        {env.featureFlags.length > 3 && <Badge variant="outline" className="text-[8px]">+{env.featureFlags.length - 3}</Badge>}
                      </div>
                      {env.incidentFreeze && <Badge className="mt-2 bg-destructive/10 text-destructive text-[9px]">Incident Freeze</Badge>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground font-display mb-3 flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" /> Active Releases</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {releases.map(r => <ReleaseCard key={r.id} release={r} />)}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Trust Devices */}
          <TabsContent value="trust-devices">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Enrolled", value: devices.length, icon: Monitor },
                  { label: "Signing Capable", value: devices.filter(d => d.signingAuthority).length, icon: Fingerprint },
                  { label: "High-Trust", value: devices.filter(d => d.canApproveHighTrust).length, icon: ShieldCheck },
                  { label: "Avg Trust", value: `${Math.round(devices.reduce((s, d) => s + d.trustScore, 0) / devices.length)}%`, icon: Gauge },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
                    <s.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-bold text-foreground font-display">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map(d => <DeviceCard key={d.id} device={d} />)}
              </div>
            </div>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2"><Shield className="h-4 w-4 text-trust-safe" /> Compliance Status</h3>
                <div className="rounded-xl border border-trust-safe/20 bg-trust-safe/5 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-trust-safe" />
                    <div>
                      <p className="text-lg font-bold text-foreground font-display capitalize">{compliance.overallStatus}</p>
                      <p className="text-[10px] text-muted-foreground">Last audit: {new Date(compliance.lastAudit).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Audit Coverage", value: `${compliance.auditCoverage}%` },
                      { label: "Tamper Integrity", value: `${compliance.tamperEvidenceIntegrity}%` },
                      { label: "Retention Compliance", value: `${compliance.retentionCompliance}%` },
                      { label: "Open Findings", value: compliance.openFindings },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg bg-card/40 p-2 text-center">
                        <p className="text-sm font-bold text-foreground">{s.value}</p>
                        <p className="text-[9px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Audit Timeline</h3>
                <div className="rounded-xl border border-border/40 bg-card/60 p-4">
                  {auditEntries.map(entry => <AuditEntry key={entry.id} entry={entry} />)}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Enterprise */}
          <TabsContent value="enterprise">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground font-display mb-3 flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Connector Governance</h3>
                <div className="rounded-xl border border-border/40 bg-card/60 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border/30 bg-muted/20">
                      <th className="text-left p-3 text-muted-foreground font-medium">Connector</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Owner</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Policy</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Health</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Last Audit</th>
                    </tr></thead>
                    <tbody>
                      {connectorGov.map(c => (
                        <tr key={c.connectorId} className="border-b border-border/10">
                          <td className="p-3 font-medium text-foreground capitalize">{c.connectorId}</td>
                          <td className="p-3 text-muted-foreground">{c.owner}</td>
                          <td className="p-3"><Badge variant="outline" className="text-[9px]">{c.policy}</Badge></td>
                          <td className={cn("p-3 text-right font-bold", c.healthScore >= 95 ? "text-trust-safe" : c.healthScore >= 80 ? "text-accent" : "text-destructive")}>{c.healthScore}%</td>
                          <td className="p-3 text-right text-muted-foreground">{new Date(c.lastAudit).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
