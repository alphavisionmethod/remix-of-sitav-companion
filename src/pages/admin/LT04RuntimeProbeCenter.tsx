import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar, Clock, Shield, Zap } from "lucide-react";
import LTSubNav from "@/platform/admin/components/admin/LTSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const LT04RuntimeProbeCenter = () => {
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
      const { data } = await fromTable("runtime_probe_runs").select("*").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: liveProbe, refetch: runProbes, isLoading: probing } = useQuery({
    queryKey: ["live-probe-results"],
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(`https://${projectId ? `${projectId}.supabase.co` : "icrkipwlnuopqbsabngy.supabase.co"}/functions/v1/runtime-probes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""}` },
      });
      return resp.json();
    },
    enabled: false,
  });

  const getLatestRun = (probeId: string) => probeRuns?.find((r: Record<string, any>) => r.probe_id === probeId);

  return (
    <div className="space-y-6 p-6">
      <LTSubNav />
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Runtime Probe Center</h1>
          <p className="text-sm text-muted-foreground">Inspect probe health, latency, and launch impact</p>
        </div>
        <button onClick={() => runProbes()} disabled={probing} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50">
          {probing ? "Running…" : "Run Live Probes"}
        </button>
      </div>

      {/* Live Probe Results */}
      {liveProbe && (
        <Card className="border-primary/20">
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" />Live Probe Results</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant={liveProbe.overall_status === "healthy" ? "default" : "destructive"} className="text-base px-3">
                {liveProbe.overall_status}
              </Badge>
              <span className="text-sm text-muted-foreground">{liveProbe.total_probes} probes · {liveProbe.total_latency_ms}ms total</span>
              <Badge variant={liveProbe.launch_eligible ? "default" : "destructive"}>
                {liveProbe.launch_eligible ? "Launch Eligible" : "Launch Blocked"}
              </Badge>
            </div>
            <div className="space-y-2">
              {liveProbe.probes?.map((p: Record<string, any>) => (
                <div key={p.probe_id} className="flex items-center justify-between p-3 rounded border">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.target} · {p.latency_ms}ms</p>
                  </div>
                  <Badge variant={p.status === "pass" ? "default" : p.status === "degraded" ? "secondary" : "destructive"}>{p.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Probe Inventory */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5" />Probe Inventory</CardTitle></CardHeader>
        <CardContent>
          {probes && probes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">Name</th><th className="p-2">Target</th><th className="p-2">Cadence</th><th className="p-2">Severity</th><th className="p-2">Launch Impact</th><th className="p-2">Latest</th>
                </tr></thead>
                <tbody>
                  {probes.map((p: Record<string, any>) => {
                    const latest = getLatestRun(p.id);
                    return (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{p.name}</td>
                        <td className="p-2 font-mono text-xs">{p.target_system}</td>
                        <td className="p-2">{p.cadence_seconds}s</td>
                        <td className="p-2"><Badge variant={p.severity === "critical" ? "destructive" : "secondary"}>{p.severity}</Badge></td>
                        <td className="p-2"><Badge variant={p.launch_impact === "blocks" ? "destructive" : "outline"}>{p.launch_impact}</Badge></td>
                        <td className="p-2">{latest ? <Badge variant={latest.status === "pass" ? "default" : "destructive"}>{latest.status}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No probes registered. Use the live probe runner above to test platform health.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LT04RuntimeProbeCenter;
