import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Activity, Shield, Server, AlertTriangle, CheckCircle, Clock,
  ArrowUpRight, Bell, Database, Cpu, Globe, Lock, RefreshCw,
  Layers, GitBranch, Radio, Target, TrendingUp, BarChart3, Brain, Crown,
  Link2, Rocket, Play, Eye, Zap, DollarSign, Wifi, Wrench
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { DEMO_ADMIN_SERVICES_MISSION_CONTROL_HOME as DEMO_SERVICES, DEMO_URGENT_ACTIONS } from "@/data/seed/admin-platform";
import { DEMO_MUTATIONS } from "@/data/seed/durability";
import {
  RevenueSummaryPanel,
  RiskSummaryPanel,
  ConnectorSummaryPanel,
  IncidentSummaryPanel,
  ReplaySummaryPanel,
} from "@/components/admin/panels";
import { HealthScoreGauge } from "@/components/admin/shells/HealthScoreGauge";
import { AISuggestionsPanel } from "@/components/admin/shells/AISuggestionsPanel";
import { OneClickActions } from "@/components/admin/shells/OneClickActions";
import { CommandTemplateCards } from "@/components/admin/shells/CommandTemplateCards";
import { ExecutionTimeline } from "@/components/admin/shells/ExecutionTimeline";
import { WhyTooltip } from "@/components/admin/shells/WhyTooltip";
import { FullSystemAudit } from "@/components/admin/shells/FullSystemAudit";
import { LiveSystemMap } from "@/components/admin/shells/LiveSystemMap";
import { SelfHealingStatusPanel } from "@/components/admin/shells/SelfHealingStatusPanel";
import { NoSilentFailureAlerts } from "@/components/admin/shells/NoSilentFailureAlerts";
import { ContinuousVerificationPanel } from "@/components/admin/shells/ContinuousVerificationPanel";
import { ExplainSimplyToggle } from "@/components/admin/shells/ExplainSimplyToggle";
import { SurfaceAuthorityMatrix } from "@/components/admin/shells/SurfaceAuthorityMatrix";
import { StateAuthorityMap } from "@/components/admin/shells/StateAuthorityMap";
import { useDataMode } from "@/contexts/DataModeContext";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type HealthStatus = "healthy" | "warning" | "degraded" | "critical";

const statusColor: Record<HealthStatus, string> = {
  healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  degraded: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

const RECENT_CHANGES = [
  { id: "rc-1", text: "Connector Slack sync restored", time: "12m ago", type: "recovery" },
  { id: "rc-2", text: "Policy pol-42 activated via council approval", time: "28m ago", type: "mutation" },
  { id: "rc-3", text: "Ring 0 promoted for v2.14.0-rc3", time: "1h ago", type: "deployment" },
  { id: "rc-4", text: "Brain-core memory scaled to 4GB", time: "2h ago", type: "infra" },
  { id: "rc-5", text: "AI budget cap enforced per-domain", time: "3h ago", type: "policy" },
];

const MissionControlHome = () => {
  const { isDemoMode } = useDataMode();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: incidentCount } = useQuery({
    queryKey: ["mission-incidents-count"],
    queryFn: async () => {
      const { count } = await fromTable("incidents").select("*", { count: "exact", head: true }).in("status", ["open", "investigating"]);
      return count || 0;
    },
  });

  const { data: approvalCount } = useQuery({
    queryKey: ["mission-approvals-count"],
    queryFn: async () => {
      const { count } = await fromTable("approval_queue").select("*", { count: "exact", head: true }).eq("status", "pending");
      return count || 0;
    },
  });

  const healthyCount = ([] as typeof DEMO_SERVICES).filter(s => s.status === "healthy").length;
  const overallHealth: HealthStatus = ([] as typeof DEMO_SERVICES).some(s => s.status === "critical") ? "critical" : ([] as typeof DEMO_SERVICES).some(s => s.status === "degraded") ? "degraded" : ([] as typeof DEMO_SERVICES).some(s => s.status === "warning") ? "warning" : "healthy";
  const healthScore = overallHealth === "healthy" ? 98 : overallHealth === "warning" ? 85 : overallHealth === "degraded" ? 68 : 42;
  const pendingMutations = ([] as typeof DEMO_MUTATIONS).filter(m => m.durabilityStatus === "pending").length;
  const failedMutations = ([] as typeof DEMO_MUTATIONS).filter(m => m.durabilityStatus === "failed").length;

  const KPI_STRIP = [
    { label: "Health", value: `${healthScore}%`, icon: Activity, color: healthScore >= 90 ? "text-emerald-500" : "text-amber-500", why: "Weighted average of all subsystem health scores: auth, sync, storage, trust, AI, releases, devices." },
    { label: "Sync Reliability", value: "99.4%", icon: Wifi, color: "text-emerald-500", why: "Percentage of sync operations that completed successfully in the last 24 hours." },
    { label: "Security Risk", value: "Low", icon: Shield, color: "text-emerald-500", why: "Composite security risk level based on active threats, policy compliance, and trust score distribution." },
    { label: "Active Incidents", value: String(incidentCount ?? 0), icon: AlertTriangle, color: (incidentCount ?? 0) > 0 ? "text-amber-500" : "text-emerald-500", why: "Count of open or investigating incidents across all platform services." },
    { label: "Release Readiness", value: "Good", icon: Rocket, color: "text-emerald-500", why: "Whether the platform meets all quality gates to ship the next release (tests, crash rate, performance)." },
    { label: "AI Cost Efficiency", value: "91%", icon: DollarSign, color: "text-emerald-500", why: "Ratio of useful AI outputs to total AI spend. Higher is better — includes cache hits and model routing optimization." },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Mission Control</h1>
          <p className="text-xs text-muted-foreground mt-1">Platform truth at a glance · Last refreshed {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExplainSimplyToggle />
          <Badge variant="outline" className="text-[9px] text-muted-foreground hidden md:inline-flex">⌘K for commands</Badge>
          <Badge variant="outline" className={statusColor[overallHealth]}>
            <Radio className="h-3 w-3 mr-1" /> Platform {overallHealth}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setLastRefresh(new Date())}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* No Silent Failure Alerts */}
        <NoSilentFailureAlerts />

        {/* Warning banners */}
        {(pendingMutations > 0 || failedMutations > 0) && (
          <motion.div variants={fadeUp}>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-3 flex items-center gap-3">
                <Database className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-foreground">
                  Admin Durability: <strong>{pendingMutations} pending</strong>, <strong className={failedMutations > 0 ? "text-red-500" : ""}>{failedMutations} failed</strong> mutations
                </span>
                <Link to="/admin/durability" className="text-[10px] text-primary hover:underline ml-auto">View →</Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Health Score Gauge + KPI Strip */}
        <motion.div variants={fadeUp}>
          <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <HealthScoreGauge score={healthScore} />
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
                  {KPI_STRIP.map(kpi => (
                    <div key={kpi.label} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                        <WhyTooltip explanation={kpi.why} className="ml-auto" />
                      </div>
                      <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* "What should I do next?" */}
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-3">
                <Brain className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs text-foreground">
                  <span className="font-medium">What should you do next?</span>{" "}
                  {(incidentCount ?? 0) > 0
                    ? "Review active incidents — there are open issues requiring attention."
                    : approvalCount && approvalCount > 0
                      ? `Review ${approvalCount} pending approval(s) in the queue.`
                      : "Everything looks good. Consider running a security sweep or preparing the next release."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Service Health */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Service Health Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {([] as typeof DEMO_SERVICES).map((svc) => (
                    <div key={svc.name} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-foreground">{svc.name}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusColor[svc.status]}`}>{svc.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{svc.latency}ms</span>
                        <span>{svc.uptime}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Urgent Actions + What Changed */}
          <motion.div variants={fadeUp} className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" /> Urgent Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {([] as typeof DEMO_URGENT_ACTIONS).map((a) => (
                  <Link key={a.id} to={a.route} className="block p-2.5 rounded-lg border hover:bg-muted/50 transition-colors group">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${a.severity === "high" ? "text-red-500" : a.severity === "medium" ? "text-amber-500" : "text-blue-500"}`} />
                      <p className="text-xs text-foreground leading-relaxed group-hover:text-primary transition-colors">{a.title}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> What Changed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {RECENT_CHANGES.map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-[11px]">
                    <span className="text-muted-foreground w-14 shrink-0">{c.time}</span>
                    <span className="text-foreground">{c.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Full System Audit */}
        <motion.div variants={fadeUp}>
          <FullSystemAudit />
        </motion.div>

        {/* AI Suggestions */}
        <motion.div variants={fadeUp}>
          <AISuggestionsPanel />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <OneClickActions compact />
        </motion.div>

        {/* Command Templates */}
        <motion.div variants={fadeUp}>
          <CommandTemplateCards compact />
        </motion.div>

        {/* Self-Healing Status */}
        <motion.div variants={fadeUp}>
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-400" /> Self-Healing Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SelfHealingStatusPanel />
            </CardContent>
          </Card>
        </motion.div>

        {/* Live System Map */}
        <motion.div variants={fadeUp}>
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Live System Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LiveSystemMap compact />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Timeline */}
        <motion.div variants={fadeUp}>
          <ExecutionTimeline compact maxVisible={5} />
        </motion.div>

        {/* Continuous Verification */}
        <motion.div variants={fadeUp}>
          <Card className="border-white/[0.06] bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" /> Continuous Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContinuousVerificationPanel />
            </CardContent>
          </Card>
        </motion.div>

        {/* Surface Authority Matrix */}
        <motion.div variants={fadeUp}>
          <SurfaceAuthorityMatrix compact />
        </motion.div>

        {/* State Authority Map */}
        <motion.div variants={fadeUp}>
          <StateAuthorityMap compact />
        </motion.div>

        {/* Platform Pulse — Summary Panels */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" /> Platform Pulse
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <RevenueSummaryPanel />
            <RiskSummaryPanel />
            <ConnectorSummaryPanel />
            <IncidentSummaryPanel />
            <ReplaySummaryPanel />
          </div>
        </motion.div>

        {/* Command Surfaces */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Command Surfaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { label: "Incidents", icon: AlertTriangle, route: "/admin/incidents", count: incidentCount },
                  { label: "Deployment", icon: GitBranch, route: "/admin/deployment" },
                  { label: "Release Rings", icon: Rocket, route: "/admin/release-ring" },
                  { label: "Proof Matrix", icon: Layers, route: "/admin/proof-matrix" },
                  { label: "Chain Explorer", icon: Link2, route: "/admin/chain-explorer" },
                  { label: "Connectors", icon: Globe, route: "/admin/connectors" },
                  { label: "Fleet Health", icon: Cpu, route: "/admin/fleet-health" },
                  { label: "Launch Ready", icon: Target, route: "/admin/launch-readiness" },
                  { label: "Durability", icon: Database, route: "/admin/durability" },
                  { label: "Projections", icon: BarChart3, route: "/admin/projections" },
                  { label: "Security", icon: Lock, route: "/admin/security-posture" },
                  { label: "Operations", icon: Zap, route: "/admin/operations" },
                  { label: "Intelligence", icon: Brain, route: "/admin/intelligence" },
                  { label: "Truth Registry", icon: Eye, route: "/admin/truth-registry" },
                  { label: "Council", icon: Crown, route: "/admin/founder-council" },
                  { label: "Concierge", icon: Activity, route: "/admin/concierge-runtime" },
                  { label: "Alert Triage", icon: Bell, route: "/admin/alert-triage" },
                  { label: "Policy Sim", icon: Shield, route: "/admin/policy-simulator" },
                  { label: "Replay", icon: Play, route: "/admin/workflow-replay" },
                ].map((nav) => (
                  <Link key={nav.label} to={nav.route} className="p-2.5 rounded-lg border hover:bg-muted/50 hover:-translate-y-0.5 transition-all flex items-center gap-2 group">
                    <nav.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[11px] font-medium text-foreground">{nav.label}</span>
                    {nav.count != null && nav.count > 0 && (
                      <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0">{nav.count}</Badge>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MissionControlHome;
