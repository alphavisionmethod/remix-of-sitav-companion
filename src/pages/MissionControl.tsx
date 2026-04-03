import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { Progress } from "@/components/ui/progress";
import { useArchGates, useDeploymentRings, useTestCoverage } from "@/hooks/use-admin-data";
import {
  Shield, Activity, Zap, RefreshCw, Eye, Wifi, CheckCircle, RotateCcw, AlertTriangle, Loader2, DollarSign, Cpu,
  Rocket, GitBranch, TestTube, ShieldCheck, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminData {
  agentHealth: any;
  costs: any;
  incidents: any;
  workflowHealth: any;
  connectorHealth: any;
  approvals: any;
}

function useAdminAPI() {
  const { session } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEndpoint = async (endpoint: string) => {
    if (!session?.access_token) return null;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api/${endpoint}?days=7`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const refresh = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const [agentHealth, costs, incidents, workflowHealth, connectorHealth, approvals] = await Promise.all([
        fetchEndpoint("agent-health"),
        fetchEndpoint("costs"),
        fetchEndpoint("incidents"),
        fetchEndpoint("workflow-health"),
        fetchEndpoint("connector-health"),
        fetchEndpoint("approvals"),
      ]);
      setData({ agentHealth, costs, incidents, workflowHealth, connectorHealth, approvals });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [session?.access_token]);

  return { data, loading, error, refresh };
}

const MissionControl = () => {
  const { data, loading, error, refresh } = useAdminAPI();
  const { data: archGates } = useArchGates();
  const { data: deploymentRings } = useDeploymentRings();
  const { data: testCoverage } = useTestCoverage();

  const systemStatus = data?.incidents?.status === "clear" ? "All Clear" : "Issues Found";
  const systemHealthy = data?.incidents?.status === "clear";

  const gates = (archGates || []) as Array<{ name: string; status: string; lastRun: string; details: string }>;
  const rings = (deploymentRings || []) as Array<{ ring: number; name: string; version: string; status: string; progress: number }>;
  const coverage = (testCoverage || { unit: 0, integration: 0, e2e: 0, contract: 0 }) as { unit: number; integration: number; e2e: number; contract: number };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto max-w-7xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <SitaPageHeader title="Mission Control" subtitle="System health, deployments, architecture gates, and admin controls" />
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {/* KPIs */}
      <motion.div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {[
          { label: "System Status", value: loading ? "…" : systemStatus, icon: systemHealthy ? CheckCircle : AlertTriangle, className: systemHealthy ? "gradient-sita-subtle" : "" },
          { label: "Workflow Runs (7d)", value: loading ? "…" : String(data?.workflowHealth?.total_runs ?? 0), icon: Activity, sub: data?.workflowHealth?.by_status?.failed ? `${data.workflowHealth.by_status.failed} failed` : "All healthy" },
          { label: "AI Requests (7d)", value: loading ? "…" : String(data?.agentHealth?.total_requests ?? 0), icon: Zap, sub: data?.agentHealth?.avg_latency_ms ? `Avg ${data.agentHealth.avg_latency_ms}ms` : undefined },
          { label: "Tokens Used (7d)", value: loading ? "…" : (data?.costs?.total_tokens ?? 0).toLocaleString(), icon: DollarSign, sub: data?.costs?.total_requests ? `${data.costs.total_requests} calls` : undefined },
        ].map((kpi, i) => (
          <motion.div key={i} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
            <KPITile {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Deployment Rings */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Ring-based progressive rollout">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-accent" />
              Deployment Rings
            </div>
          </SitaCardTitle>
          <div className="mt-4 space-y-3">
            {rings.map(r => (
              <div key={r.ring} className="rounded-xl bg-secondary/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === "healthy" || r.status === "stable" ? "bg-trust-safe/10 text-trust-safe" : r.status === "deploying" ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-muted-foreground"}`}>
                      Ring {r.ring}
                    </span>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{r.version}</span>
                </div>
                <Progress value={r.progress} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground mt-1 capitalize">{r.status} · {r.progress}%</p>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Architecture Gates */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Pre-merge compliance checks">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Architecture Gates
            </div>
          </SitaCardTitle>
          <div className="mt-4 space-y-2">
            {gates.map(g => (
              <div key={g.name} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3">
                <div className="flex items-center gap-2.5">
                  {g.status === "pass" ? (
                    <CheckCircle className="h-4 w-4 text-trust-safe" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm text-foreground">{g.name}</p>
                    <p className="text-[10px] text-muted-foreground">{g.details}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${g.status === "pass" ? "bg-trust-safe/10 text-trust-safe" : "bg-amber-500/10 text-amber-500"}`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Test Coverage */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="Quality metrics across test types">
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4 text-accent" />
              Test Coverage
            </div>
          </SitaCardTitle>
          <div className="mt-4 space-y-3">
            {[
              { label: "Unit Tests", value: coverage.unit, target: 80 },
              { label: "Integration Tests", value: coverage.integration, target: 60 },
              { label: "E2E Tests", value: coverage.e2e, target: 30 },
              { label: "Contract Tests", value: coverage.contract, target: 90 },
            ].map(t => (
              <div key={t.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{t.label}</span>
                  <span className={`text-xs font-semibold ${t.value >= t.target ? "text-trust-safe" : "text-amber-500"}`}>
                    {t.value}% / {t.target}%
                  </span>
                </div>
                <div className="relative">
                  <Progress value={t.value} className="h-2" />
                  <div className="absolute top-0 h-full border-l-2 border-dashed border-muted-foreground/30" style={{ left: `${t.target}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Agent Health */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="AI advisor performance and routing">Agent Health</SitaCardTitle>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : data?.agentHealth ? (
              <>
                <div className="flex items-center gap-2 rounded-xl bg-secondary/30 p-3">
                  <div className={`h-2 w-2 rounded-full ${data.agentHealth.status === "healthy" ? "bg-trust-verified" : "bg-amber-500"}`} />
                  <p className="text-sm text-foreground">{data.agentHealth.summary}</p>
                </div>
                {data.agentHealth.by_model && Object.keys(data.agentHealth.by_model).length > 0 && (
                  <div className="rounded-xl bg-secondary/20 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">By Model</p>
                    <div className="space-y-1">
                      {Object.entries(data.agentHealth.by_model as Record<string, { count: number; tokens: number }>).map(([model, stats]) => (
                        <div key={model} className="flex justify-between text-xs text-foreground">
                          <span className="truncate">{model.split("/").pop()}</span>
                          <span className="text-muted-foreground">{stats.count} calls · {stats.tokens.toLocaleString()} tokens</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No agent data available yet.</p>
            )}
          </div>
        </SitaCard>

        {/* Connectors */}
        <SitaCard hover={false}>
          <SitaCardTitle sub="External service integrations">Connections</SitaCardTitle>
          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : data?.connectorHealth?.connectors?.length > 0 ? (
              data.connectorHealth.connectors.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Wifi className={`h-4 w-4 ${c.status === "active" ? "text-trust-verified" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm text-foreground capitalize">{c.service}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {c.last_sync_at ? `Last sync: ${new Date(c.last_sync_at).toLocaleDateString()}` : "Never synced"}
                      </p>
                    </div>
                  </div>
                  <TrustBadge level={c.status === "active" ? "verified" : "degraded"} label={c.status === "active" ? "Healthy" : c.status} size="sm" />
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Wifi className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No connectors configured yet.</p>
              </div>
            )}
          </div>
        </SitaCard>

        {/* Quick Actions */}
        <SitaCard hover={false} className="lg:col-span-2">
          <SitaCardTitle sub="Administrative tools">Quick Actions</SitaCardTitle>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Refresh All", icon: RefreshCw, action: refresh },
              { label: "View AI Spend", icon: Zap },
              { label: "Diagnostics", icon: Activity },
              { label: "Privacy Controls", icon: Shield },
              { label: "Rollback Entry", icon: RotateCcw },
              { label: "Support Review", icon: Eye },
            ].map((a, i) => (
              <button
                key={i}
                onClick={a.action}
                className="flex items-center gap-2.5 rounded-xl border border-border p-3 text-sm text-foreground transition-all hover:bg-secondary hover:shadow-xs"
              >
                <a.icon className="h-4 w-4 text-muted-foreground" />
                {a.label}
              </button>
            ))}
          </div>
        </SitaCard>
      </div>
    </motion.div>
  );
};

export default MissionControl;
