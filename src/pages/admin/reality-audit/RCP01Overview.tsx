import RCPSubNav from "@/components/admin/RCPSubNav";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertTriangle, ArrowRight, CheckCircle, TrendingUp, Shield, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getOverviewStats, getDomainRealityRollups, REALITY_TRANSITIONS,
  FEATURE_REALITY_MATRIX, type RealityState
} from "@/runtimes/reality/reality-audit-registry";

const stateColors: Record<RealityState, string> = {
  presentational: "bg-red-500",
  simulated: "bg-amber-500",
  persisted: "bg-blue-500",
  proven: "bg-emerald-500",
};

const RCP01Overview = () => {
  const navigate = useNavigate();
  const stats = useMemo(() => getOverviewStats(), []);
  const domainRollups = useMemo(() => getDomainRealityRollups(), []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Reality Conversion Overview</h1>
          <p className="text-sm text-muted-foreground">Executive view of platform reality state, migration progress, and launch readiness</p>
        </div>
      </div>

      {/* RealityStateOverviewBand */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Presentational", value: stats.distribution.presentational, color: "text-red-400", path: "/admin/reality-audit" },
          { label: "Simulated", value: stats.distribution.simulated, color: "text-amber-400", path: "/admin/reality-audit" },
          { label: "Persisted", value: stats.distribution.persisted, color: "text-blue-400", path: "/admin/reality-audit" },
          { label: "Proven", value: stats.distribution.proven, color: "text-emerald-400", path: "/admin/reality-audit" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(k.path)}>
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* StateDistributionChart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">State Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-10 rounded-lg overflow-hidden">
            {(["presentational", "simulated", "persisted", "proven"] as RealityState[]).map(s => {
              const pct = (stats.distribution[s] / stats.totalFeatures) * 100;
              return pct > 0 ? (
                <div key={s} className={`${stateColors[s]} flex items-center justify-center text-xs font-bold text-foreground`} style={{ width: `${pct}%` }}>
                  {stats.distribution[s]}
                </div>
              ) : null;
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>← Theatrical</span>
            <span>Runtime-Real →</span>
          </div>
        </CardContent>
      </Card>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {([
          { label: "Total Features", value: stats.totalFeatures, color: "text-foreground" },
          { label: "Mock Sources", value: stats.sourceStats.total, color: "text-amber-400" },
          { label: "Forbidden Mocks", value: stats.sourceStats.forbidden, color: "text-red-400" },
          { label: "Contracts Ready", value: stats.contractStats.fullyReady, color: "text-emerald-400" },
          { label: "Services In-Memory", value: stats.serviceHealth.inMemory, color: "text-red-400" },
          { label: "Runtime Passing", value: stats.runtimeSummary.passing, color: "text-emerald-400" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50">
            <CardContent className="p-3 text-center">
              <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[10px] text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MockBackedCriticalLane */}
      <Card className="border-red-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> P0 Launch Blockers — Mock-Backed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.launchBlockers.map(f => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/15"
                onClick={() => navigate(`/admin/reality-audit/feature/${f.id}`)}>
                <div>
                  <span className="font-medium text-sm">{f.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 capitalize">{f.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">{f.realityState}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MigrationProgressCards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Migration Progress</CardTitle>
            <button onClick={() => navigate("/admin/reality-audit/mock-replacement")} className="text-xs text-primary hover:underline">View board →</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(Object.entries(stats.progress.byStatus) as [string, number][]).map(([status, count]) => (
              <div key={status} className="text-center p-2 rounded bg-muted/30">
                <div className="text-lg font-bold">{count}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{status.replace("_", " ")}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Domain health heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Domain Reality Health</CardTitle>
            <button onClick={() => navigate("/admin/reality-audit/route-heatmap")} className="text-xs text-primary hover:underline">Heatmap →</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {domainRollups.map(d => (
              <div key={d.domain} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{d.domain}</span>
                  <span className="font-mono text-xs">{d.healthPct}% real</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden">
                  {(["presentational", "simulated", "persisted", "proven"] as RealityState[]).map(s => {
                    const pct = d.total > 0 ? (d[s] / d.total) * 100 : 0;
                    return pct > 0 ? <div key={s} className={stateColors[s]} style={{ width: `${pct}%` }} /> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RecentConversionsFeed */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Recent Conversions</CardTitle>
            <button onClick={() => navigate("/admin/reality-audit/progress")} className="text-xs text-primary hover:underline">Timeline →</button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {REALITY_TRANSITIONS.slice(-3).reverse().map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.featureName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">{t.fromState}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">{t.toState}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{t.transitionDate}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {([
          { label: "Classification Matrix", path: "/admin/reality-audit", icon: Eye },
          { label: "Mock Replacement", path: "/admin/reality-audit/mock-replacement", icon: AlertTriangle },
          { label: "Launch Honesty", path: "/admin/reality-audit/launch-honesty", icon: Shield },
          { label: "Wave Planner", path: "/admin/reality-audit/wave-planner", icon: TrendingUp },
        ]).map(nav => (
          <button key={nav.path} onClick={() => navigate(nav.path)}
            className="p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors text-left">
            <nav.icon className="h-4 w-4 text-primary mb-1" />
            <div className="text-xs font-medium">{nav.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RCP01Overview;
