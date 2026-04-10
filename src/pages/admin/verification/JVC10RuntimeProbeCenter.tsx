// ═══════════════════════════════════════════════════════
// SITA OS — JVC10: Runtime Probe Center
// Synthetic behavior probes, evidence, screenshots
// ═══════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fromTable } from "@/lib/supabase-helpers";
import { useVerificationSurfaces, useVerificationRuns } from "@/lib/verification/verification-hooks";
import { SURFACE_REGISTRY } from "@/lib/verification/surface-registry";
import {
  Radar, Zap, CheckCircle2, XCircle, Clock, AlertTriangle, Shield, Play, BarChart3, RefreshCw
} from "lucide-react";

export default function JVC10RuntimeProbeCenter() {
  const { data: probes } = useQuery({
    queryKey: ["runtime-probes"],
    queryFn: async () => {
      const { data } = await fromTable("runtime_probes").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const { data: probeRuns } = useQuery({
    queryKey: ["runtime-probe-runs"],
    queryFn: async () => {
      const { data } = await fromTable("runtime_probe_runs").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  const { data: liveProbe, refetch: runProbes, isLoading: probing } = useQuery({
    queryKey: ["live-probe-results-jvc10"],
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId ? `${projectId}.supabase.co` : "icrkipwlnuopqbsabngy.supabase.co"}/functions/v1/runtime-probes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""}`,
          },
        }
      );
      return resp.json();
    },
    enabled: false,
  });

  const { data: dbSurfaces } = useVerificationSurfaces();
  const { data: runs } = useVerificationRuns();

  // KPIs
  const totalProbes = (probes || []).length;
  const criticalProbes = (probes || []).filter((p: Record<string, any>) => p.severity === "critical").length;
  const launchBlockingProbes = (probes || []).filter((p: Record<string, any>) => p.launch_impact === "blocks").length;

  // Latest run status per probe
  const latestRunMap = useMemo(() => {
    const m = new Map<string, Record<string, any>>();
    (probeRuns || []).forEach((r: Record<string, any>) => {
      if (!m.has(r.probe_id)) m.set(r.probe_id, r);
    });
    return m;
  }, [probeRuns]);

  const passingProbes = Array.from(latestRunMap.values()).filter((r) => r.status === "pass").length;
  const failingProbes = Array.from(latestRunMap.values()).filter((r) => r.status === "fail").length;
  const probeCoverage = totalProbes > 0 ? Math.round((passingProbes / totalProbes) * 100) : 0;

  // Probe type distribution
  const probeTypes = useMemo(() => {
    const m = new Map<string, number>();
    (probes || []).forEach((p: Record<string, any>) => {
      const t = p.probe_type || "unknown";
      m.set(t, (m.get(t) || 0) + 1);
    });
    return m;
  }, [probes]);

  // Recent runs timeline
  const recentRuns = (probeRuns || []).slice(0, 20);

  // Surface cross-reference: how many SURFACE_REGISTRY entries have probe coverage
  const surfacesWithProbes = useMemo(() => {
    const probeTargets = new Set((probes || []).map((p: Record<string, any>) => p.target_system));
    return SURFACE_REGISTRY.filter((s) => probeTargets.has(s.routeKey) || probeTargets.has(s.routePath));
  }, [probes]);

  return (
    <div className="space-y-6 p-6" data-testid="jvc10-runtime-probes">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" />
            JVC10 — Runtime Probe Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Synthetic behavior probes, evidence capture, fleet health, and launch impact
          </p>
        </div>
        <button
          onClick={() => runProbes()}
          disabled={probing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {probing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {probing ? "Running…" : "Run Live Probes"}
        </button>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-primary">{totalProbes}</div>
          <div className="text-[10px] text-muted-foreground">Total Probes</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{passingProbes}</div>
          <div className="text-[10px] text-muted-foreground">Passing</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{failingProbes}</div>
          <div className="text-[10px] text-muted-foreground">Failing</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-amber-500">{criticalProbes}</div>
          <div className="text-[10px] text-muted-foreground">Critical</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-destructive">{launchBlockingProbes}</div>
          <div className="text-[10px] text-muted-foreground">Launch Blocking</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{surfacesWithProbes.length}</div>
          <div className="text-[10px] text-muted-foreground">Surfaces Probed</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <div className="text-2xl font-bold">{probeCoverage}%</div>
          <div className="text-[10px] text-muted-foreground">Pass Rate</div>
          <Progress value={probeCoverage} className="mt-1 h-1" />
        </CardContent></Card>
      </div>

      {/* Live Probe Results */}
      {liveProbe && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Live Probe Results
            </h3>
            <div className="flex items-center gap-4 mb-3">
              <Badge variant={liveProbe.overall_status === "healthy" ? "default" : "destructive"} className="text-sm px-3">
                {liveProbe.overall_status}
              </Badge>
              <span className="text-xs text-muted-foreground">{liveProbe.total_probes} probes · {liveProbe.total_latency_ms}ms total</span>
              <Badge variant={liveProbe.launch_eligible ? "default" : "destructive"}>
                {liveProbe.launch_eligible ? "Launch Eligible" : "Launch Blocked"}
              </Badge>
            </div>
            <div className="space-y-1">
              {liveProbe.probes?.map((p: Record<string, any>) => (
                <div key={p.probe_id} className="flex items-center justify-between p-2 rounded border text-sm">
                  <div className="flex items-center gap-2">
                    {p.status === "pass" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> :
                     p.status === "degraded" ? <AlertTriangle className="h-3 w-3 text-amber-500" /> :
                     <XCircle className="h-3 w-3 text-destructive" />}
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{p.target}</span>
                    <span className="text-xs text-muted-foreground">{p.latency_ms}ms</span>
                    <Badge variant={p.status === "pass" ? "default" : p.status === "degraded" ? "secondary" : "destructive"} className="text-[10px]">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Probe Type Distribution */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Probe Type Distribution
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(probeTypes.entries()).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}: {count}
              </Badge>
            ))}
            {probeTypes.size === 0 && <span className="text-xs text-muted-foreground">No probes registered yet</span>}
          </div>
        </CardContent>
      </Card>

      {/* Probe Inventory */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Probe Fleet ({totalProbes})
          </h3>
          {totalProbes > 0 ? (
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground bg-muted/30">
                    <th className="p-2 text-xs">Name</th>
                    <th className="p-2 text-xs">Target</th>
                    <th className="p-2 text-xs">Type</th>
                    <th className="p-2 text-xs">Cadence</th>
                    <th className="p-2 text-xs">Severity</th>
                    <th className="p-2 text-xs">Launch</th>
                    <th className="p-2 text-xs">Latest</th>
                    <th className="p-2 text-xs">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {(probes || []).map((p: Record<string, any>) => {
                    const latest = latestRunMap.get(p.id);
                    return (
                      <tr key={p.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium text-xs">{p.name}</td>
                        <td className="p-2 font-mono text-[10px]">{p.target_system}</td>
                        <td className="p-2"><Badge variant="outline" className="text-[10px]">{p.probe_type || "—"}</Badge></td>
                        <td className="p-2 text-xs">{p.cadence_seconds}s</td>
                        <td className="p-2">
                          <Badge variant={p.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{p.severity}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={p.launch_impact === "blocks" ? "destructive" : "outline"} className="text-[10px]">{p.launch_impact}</Badge>
                        </td>
                        <td className="p-2">
                          {latest ? (
                            <Badge variant={latest.status === "pass" ? "default" : latest.status === "degraded" ? "secondary" : "destructive"} className="text-[10px]">
                              {latest.status}
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {latest?.latency_ms ? `${latest.latency_ms}ms` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No probes registered. Use the "Run Live Probes" button to test platform health.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Run Timeline */}
      {recentRuns.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Probe Runs
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {recentRuns.map((run: Record<string, any>) => (
                <div key={run.id} className="flex items-center gap-2 text-xs p-2 bg-muted/20 rounded">
                  {run.status === "pass" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> :
                   run.status === "degraded" ? <AlertTriangle className="h-3 w-3 text-amber-500" /> :
                   <XCircle className="h-3 w-3 text-destructive" />}
                  <span className="font-mono truncate flex-1">{run.probe_id?.slice(0, 8)}…</span>
                  <Badge variant={run.status === "pass" ? "default" : "destructive"} className="text-[10px]">{run.status}</Badge>
                  {run.latency_ms && <span className="text-muted-foreground">{run.latency_ms}ms</span>}
                  <span className="text-muted-foreground">{new Date(run.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
