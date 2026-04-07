// ═══════════════════════════════════════════════════════
// SITA OS — CJ08: Route & Action Coverage Board
// + domain coverage heatmap, weak coverage identification
// ═══════════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActionInventory, useSeedActionInventory, useRouteCoverage, useSeedRouteCoverage } from "@/lib/customer-journey/journey-coverage-hooks";
import { useRouteCoverageSummary } from "@/lib/customer-journey/journey-ingestion-hooks";
import { Grid3X3, Loader2, Database, AlertTriangle, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useDataMode } from "@/contexts/DataModeContext";

const PRIORITY_COLORS: Record<string, string> = {
  p0: "bg-destructive/15 text-destructive border-destructive/30",
  p1: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  p2: "bg-muted text-muted-foreground border-border",
};

const WEAK_THRESHOLD = 30;

export default function CJ08RouteActionCoverage() {
  const { isDemoMode } = useDataMode();
  const { data: actions, isLoading: actionsLoading } = useActionInventory();
  const { data: coverage, isLoading: coverageLoading } = useRouteCoverage();
  const { data: coverageSummary } = useRouteCoverageSummary();
  const seedActions = useSeedActionInventory();
  const seedCoverage = useSeedRouteCoverage();
  const [filter, setFilter] = useState<string>("all");

  const isLoading = actionsLoading || coverageLoading;

  const handleSeedAll = async () => {
    try {
      const ac = await seedActions.mutateAsync();
      const rc = await seedCoverage.mutateAsync();
      toast.success(`Seeded ${ac} actions + ${rc} routes`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalActions = actions?.length ?? 0;
  const p0Count = (actions ?? []).filter((a: any) => a.priority_class === "p0").length;
  const p1Count = (actions ?? []).filter((a: any) => a.priority_class === "p1").length;
  const totalRoutes = coverage?.length ?? 0;
  const zeroCoverage = (coverage ?? []).filter((r: any) => (r.coverage_percent ?? 0) === 0).length;
  const weakCoverage = (coverage ?? []).filter((r: any) => {
    const pct = r.coverage_percent ?? 0;
    return pct > 0 && pct < WEAK_THRESHOLD;
  }).length;

  const filteredActions = filter === "all"
    ? (actions ?? [])
    : (actions ?? []).filter((a: any) => a.priority_class === filter);

  // Domain coverage heatmap data
  const domainHeatmap = useMemo(() => {
    const map: Record<string, { total: number; verified: number; p0: number; p0Verified: number }> = {};
    for (const r of (coverage ?? [])) {
      const routeKey = (r as Record<string, unknown>).route_key || "";
      const domain = routeKey.split("/")[1] || routeKey.split(".")[0] || "unknown";
      if (!map[domain]) map[domain] = { total: 0, verified: 0, p0: 0, p0Verified: 0 };
      map[domain].total += (r as Record<string, unknown>).total_actions || 0;
      map[domain].verified += (r as Record<string, unknown>).verified_actions || 0;
      map[domain].p0 += (r as Record<string, unknown>).p0_actions || 0;
      map[domain].p0Verified += (r as Record<string, unknown>).p0_verified_actions || 0;
    }
    return Object.entries(map).map(([domain, stats]) => ({
      domain,
      ...stats,
      pct: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0,
    })).sort((a, b) => a.pct - b.pct);
  }, [coverage]);

  function heatColor(pct: number): string {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-500";
    if (pct > 0) return "bg-orange-500";
    return "bg-destructive";
  }

  return (
    <div className="space-y-6 p-6" data-testid="cj08-route-action-coverage">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-primary" />
            CJ08 — Route & Action Coverage
          </h1>
          <p className="text-muted-foreground mt-1">Full inventory of UI actions, domain heatmap, and coverage gaps</p>
        </div>
        <Button onClick={handleSeedAll} disabled={seedActions.isPending} size="sm" variant="outline">
          <Database className="h-4 w-4 mr-1" />
          {seedActions.isPending ? "Seeding…" : "Seed from Registry"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{totalActions}</div><div className="text-xs text-muted-foreground">Total Actions</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-destructive">{p0Count}</div><div className="text-xs text-muted-foreground">P0 Actions</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-amber-400">{p1Count}</div><div className="text-xs text-muted-foreground">P1 Actions</div></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{totalRoutes}</div><div className="text-xs text-muted-foreground">Routes Tracked</div></CardContent></Card>
            <Card className={zeroCoverage > 0 ? "border-destructive/30" : ""}><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-destructive">{zeroCoverage}</div><div className="text-xs text-muted-foreground">0% Coverage</div></CardContent></Card>
            <Card className={weakCoverage > 0 ? "border-amber-500/30" : ""}><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-amber-400">{weakCoverage}</div><div className="text-xs text-muted-foreground">&lt;{WEAK_THRESHOLD}% Weak</div></CardContent></Card>
          </div>

          {/* Domain Coverage Heatmap */}
          {domainHeatmap.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Domain Coverage Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {domainHeatmap.map((d) => (
                    <div key={d.domain} className={`p-3 rounded-lg border bg-card relative overflow-hidden`}>
                      <div className={`absolute inset-0 ${heatColor(d.pct)} opacity-10`} />
                      <div className="relative">
                        <div className="font-mono text-sm capitalize font-medium">{d.domain}</div>
                        <div className="text-2xl font-bold mt-1">{d.pct}%</div>
                        <div className="text-[10px] text-muted-foreground">{d.verified}/{d.total} verified • {d.p0} P0</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" />≥80%</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500" />50-79%</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500" />1-49%</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive" />0%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Surface-level Coverage Summary */}
          {(coverageSummary ?? []).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">Coverage by Surface</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(coverageSummary ?? []).map((s: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded border bg-card">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm">{s.surface_class}</div>
                      <div className="text-[10px] text-muted-foreground">{s.total_routes} routes • {s.total_actions} actions • {s.total_p0_actions} P0</div>
                    </div>
                    <div className="w-32"><Progress value={Number(s.overall_coverage_percent) || 0} className="h-2" /></div>
                    <span className="text-xs font-mono w-12 text-right">{s.overall_coverage_percent ?? 0}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Route Coverage Table */}
          {(coverage ?? []).length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Route Coverage</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(coverage ?? []).map((r: any) => {
                  const pct = r.coverage_percent ?? 0;
                  const isWeak = pct > 0 && pct < WEAK_THRESHOLD;
                  return (
                    <div key={r.id} className={`flex items-center gap-3 p-2 rounded border bg-card ${isWeak ? "border-amber-500/30" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs truncate">{r.route_key}</div>
                        <div className="text-[10px] text-muted-foreground">{r.total_actions} actions ({r.p0_actions} P0)</div>
                      </div>
                      <div className="w-32"><Progress value={pct} className="h-2" /></div>
                      <span className="text-xs font-mono w-12 text-right">{pct}%</span>
                      {pct === 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      {isWeak && <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400">Weak</Badge>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Action Inventory */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Action Inventory ({filteredActions.length})</CardTitle>
                <div className="flex gap-1">
                  {["all", "p0", "p1", "p2"].map((p) => (
                    <Button key={p} size="sm" variant={filter === p ? "default" : "outline"} onClick={() => setFilter(p)} className="text-xs h-7 px-2">
                      {p.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {filteredActions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No actions found. Click "Seed from Registry" to populate.</p>
              ) : (
                filteredActions.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded border bg-card text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{a.action_label || a.action_key}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{a.route_key} • {a.action_type}{a.owner_team ? ` • ${a.owner_team}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[a.priority_class] || ""}`}>
                        {(a.priority_class || "p2").toUpperCase()}
                      </Badge>
                      {a.test_id && <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400">testid</Badge>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
