// ═══════════════════════════════════════════════════════════════
// Phase 7A — SLO + Anomaly + Drift + Canary observability board
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/components/admin/shells/AdminControlPlaneShell";
import { Activity, AlertTriangle, GitBranch, Target, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/primitives/feedback/EmptyState";
import { toast } from "sonner";

interface SLOSnap {
  id: string; window_start: string; window_end: string;
  success_rate: number; p50_latency_ms: number; p95_latency_ms: number;
  escalation_rate: number; action_count: number; slo_status: string;
}
interface Anomaly {
  id: string; signal_kind: string; severity: string; status: string;
  detected_at: string; metric_payload: any;
}
interface Drift { id: string; detector_key: string; drift_score: number; severity: string; status: string; created_at: string; }
interface Canary { id: string; golden_path_id: string; status: string; started_at: string; failure_reason: string | null; }

const sevColor: Record<string, string> = {
  ok: "bg-emerald-500/10 text-emerald-600",
  warn: "bg-amber-500/10 text-amber-600",
  breach: "bg-red-500/10 text-red-600",
  info: "bg-blue-500/10 text-blue-600",
  crit: "bg-red-500/10 text-red-600",
};

export default function SLOObservabilityBoard() {
  const [slos, setSlos] = useState<SLOSnap[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [drift, setDrift] = useState<Drift[]>([]);
  const [canaries, setCanaries] = useState<Canary[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const [s, a, d, c] = await Promise.all([
      supabase.from("internal_agent_slo_snapshots").select("*").order("window_end", { ascending: false }).limit(20),
      supabase.from("internal_agent_anomaly_signals").select("*").order("detected_at", { ascending: false }).limit(20),
      supabase.from("internal_agent_drift_findings").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("internal_agent_canary_runs").select("*").order("started_at", { ascending: false }).limit(20),
    ]);
    setSlos((s.data ?? []) as typeof slos);
    setAnomalies((a.data ?? []) as typeof anomalies);
    setDrift((d.data ?? []) as typeof drift);
    setCanaries((c.data ?? []) as typeof canaries);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function runEvaluator() {
    const { error } = await supabase.functions.invoke("internal-agent-slo-evaluator", { body: {} });
    if (error) toast.error(error.message); else { toast.success("SLO snapshot captured"); refresh(); }
  }

  return (
    <AdminControlPlaneShell contextScope="AI Runtime · Observability">
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Activity className="h-6 w-6" /> SLO &amp; Anomaly Observatory
            </h1>
            <p className="text-sm text-muted-foreground">
              Phase 7A · production hardening for the internal AI workforce
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={runEvaluator}>Run SLO evaluator</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" />Recent SLO snapshots</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {slos.length === 0 && (
                <EmptyState
                  icon={<Activity className="h-5 w-5" />}
                  title="No SLO snapshots yet"
                  description="Run the SLO evaluator to capture the first rolling window."
                />
              )}
              {slos.map(s => (
                <div key={s.id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-medium">{new Date(s.window_end).toLocaleString()}</div>
                    <div className="text-muted-foreground">
                      success {(s.success_rate * 100).toFixed(1)}% · p95 {s.p95_latency_ms}ms · esc {(s.escalation_rate * 100).toFixed(1)}% · {s.action_count} actions
                    </div>
                  </div>
                  <Badge className={sevColor[s.slo_status] ?? ""}>{s.slo_status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Open anomalies</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {anomalies.filter(a => a.status === "open").length === 0 && (
                <EmptyState
                  icon={<AlertTriangle className="h-5 w-5" />}
                  title="No open anomalies"
                  description="The runtime is operating within expected behavioural envelopes."
                />
              )}
              {anomalies.map(a => (
                <div key={a.id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-medium">{a.signal_kind}</div>
                    <div className="text-muted-foreground">{new Date(a.detected_at).toLocaleString()}</div>
                  </div>
                  <Badge className={sevColor[a.severity] ?? ""}>{a.severity}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GitBranch className="h-4 w-4" />Drift findings</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {drift.length === 0 && (
                <EmptyState
                  icon={<GitBranch className="h-5 w-5" />}
                  title="No drift detected"
                  description="Distribution detectors will surface here once a drift score exceeds threshold."
                />
              )}
              {drift.map(d => (
                <div key={d.id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-medium">{d.detector_key}</div>
                    <div className="text-muted-foreground">score {(d.drift_score * 100).toFixed(1)}% · {d.status}</div>
                  </div>
                  <Badge className={sevColor[d.severity] ?? ""}>{d.severity}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4" />Canary runs (golden paths)</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {canaries.length === 0 && (
                <EmptyState
                  icon={<Target className="h-5 w-5" />}
                  title="No canary runs yet"
                  description="Schedule the canary cron or trigger a golden-path probe to populate this panel."
                />
              )}
              {canaries.map(c => (
                <div key={c.id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-medium">{c.golden_path_id}</div>
                    <div className="text-muted-foreground">{new Date(c.started_at).toLocaleString()}{c.failure_reason ? ` · ${c.failure_reason}` : ""}</div>
                  </div>
                  <Badge className={c.status === "pass" ? sevColor.ok : c.status === "fail" ? sevColor.crit : sevColor.warn}>{c.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminControlPlaneShell>
  );
}
