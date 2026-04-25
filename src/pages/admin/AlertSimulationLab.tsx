// ═══════════════════════════════════════════════════════════════
// SITA OS — Alert Simulation Lab
// Demo page to simulate alert streams and verify deduplication,
// suppression windows, and audit logs in real time.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { AlertDedupStats } from "@/platform/admin/components/admin/alerts/AlertDedupStats";
import { Play, Pause, Trash2, Zap, Activity, Radio, Save, History, RotateCcw } from "lucide-react";

interface SimEvent {
  ts: number;
  fingerprint: string;
  severity: string;
  deduplicated: boolean;
  suppressed: boolean;
}

const SAMPLE_FINGERPRINTS = [
  "cpu-spike-prod-web-01",
  "db-connection-pool-exhaust",
  "ssl-cert-expiry-warning",
  "memory-oom-worker-03",
  "api-latency-p99-breach",
  "disk-usage-critical-storage",
];

interface SimRun {
  id: string;
  name: string;
  interval_ms: number;
  burst_size: number;
  severity: string;
  suppression_window_ms: number;
  event_count: number;
  dedup_count: number;
  suppress_count: number;
  created_at: string;
}

export default function AlertSimulationLab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [intervalMs, setIntervalMs] = useState(1000);
  const [burstSize, setBurstSize] = useState(5);
  const [severity, setSeverity] = useState("medium");
  const [suppressionWindowMs, setSuppressionWindowMs] = useState(10_000);
  const [runName, setRunName] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recentMap = useRef(new Map<string, number>());

  const emitEvent = useCallback(() => {
    const fp = SAMPLE_FINGERPRINTS[Math.floor(Math.random() * SAMPLE_FINGERPRINTS.length)];
    const now = Date.now();
    const lastSeen = recentMap.current.get(fp);
    const deduplicated = lastSeen != null && now - lastSeen < suppressionWindowMs;
    const suppressed = deduplicated && Math.random() < 0.7; // 70% suppressed if dedup
    recentMap.current.set(fp, now);

    const ev: SimEvent = { ts: now, fingerprint: fp, severity, deduplicated, suppressed };
    setEvents((prev) => [ev, ...prev].slice(0, 200));
  }, [severity]);

  function startStream() {
    if (timerRef.current) return;
    setIsStreaming(true);
    timerRef.current = setInterval(emitEvent, intervalMs);
  }

  function stopStream() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsStreaming(false);
  }

  function fireBurst() {
    for (let i = 0; i < burstSize; i++) emitEvent();
    toast({ title: "Burst fired", description: `${burstSize} alert events simulated.` });
  }

  function clearLog() {
    setEvents([]);
    recentMap.current.clear();
  }

  // ── Saved runs query ──
  const { data: savedRuns = [] } = useQuery<SimRun[]>({
    queryKey: ["alert-simulation-runs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("alert_simulation_runs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data as SimRun[] | null) ?? [];
    },
  });

  // Write simulated events to DB for persistence
  async function persistToDb() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Auth required", variant: "destructive" }); return; }

    // 1. Save the simulation run config
    const { data: run, error: runErr } = await supabase
      .from("alert_simulation_runs")
      .insert({
        user_id: user.id,
        name: runName || `Run ${new Date().toLocaleTimeString()}`,
        interval_ms: intervalMs,
        burst_size: burstSize,
        severity,
        suppression_window_ms: suppressionWindowMs,
        event_count: totalEvents,
        dedup_count: dedupCount,
        suppress_count: suppressCount,
      })
      .select("id")
      .single();
    if (runErr || !run) {
      toast({ title: "Failed to save run config", description: runErr?.message, variant: "destructive" });
      return;
    }

    // 2. Persist events linked to the run
    const rows = events.slice(0, 50).map((e) => ({
      user_id: user.id,
      fingerprint: e.fingerprint,
      original_severity: e.severity,
      occurrence_count: 1,
      was_deduplicated: e.deduplicated,
      was_suppressed: e.suppressed,
      simulation_run_id: run.id,
    }));
    const { error } = await supabase.from("alert_dedup_log").insert(rows);
    if (error) { toast({ title: "Events insert failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Persisted", description: `Run config + ${rows.length} events saved.` });
    queryClient.invalidateQueries({ queryKey: ["alert-dedup-log"] });
    queryClient.invalidateQueries({ queryKey: ["alert-simulation-runs"] });
  }

  function restoreRun(run: SimRun) {
    setIntervalMs(run.interval_ms);
    setBurstSize(run.burst_size);
    setSeverity(run.severity);
    setSuppressionWindowMs(run.suppression_window_ms);
    setRunName(run.name);
    toast({ title: "Restored", description: `Loaded parameters from "${run.name}"` });
  }

  const totalEvents = events.length;
  const dedupCount = events.filter((e) => e.deduplicated).length;
  const suppressCount = events.filter((e) => e.suppressed).length;

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Radio className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Alert Simulation Lab</h1>
        <Badge variant="outline" className="text-[10px]">Demo / Test</Badge>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Stream Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Interval (ms)</label>
              <Input type="number" className="h-7 w-24 text-xs" value={intervalMs} onChange={(e) => setIntervalMs(Number(e.target.value) || 500)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Burst Size</label>
              <Input type="number" className="h-7 w-20 text-xs" value={burstSize} onChange={(e) => setBurstSize(Number(e.target.value) || 1)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Severity</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Suppression (ms)</label>
              <Input type="number" className="h-7 w-24 text-xs" value={suppressionWindowMs} onChange={(e) => setSuppressionWindowMs(Number(e.target.value) || 5000)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Run Name</label>
              <Input className="h-7 w-36 text-xs" placeholder="Optional label…" value={runName} onChange={(e) => setRunName(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isStreaming ? (
              <Button size="sm" className="gap-1" onClick={startStream}><Play className="h-3 w-3" /> Start Stream</Button>
            ) : (
              <Button size="sm" variant="secondary" className="gap-1" onClick={stopStream}><Pause className="h-3 w-3" /> Stop</Button>
            )}
            <Button size="sm" variant="outline" className="gap-1" onClick={fireBurst}><Zap className="h-3 w-3" /> Fire Burst</Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={persistToDb} disabled={events.length === 0}><Save className="h-3 w-3" /> Save Run</Button>
            <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={clearLog}><Trash2 className="h-3 w-3" /> Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved runs */}
      {savedRuns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" /> Saved Simulation Runs ({savedRuns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-1">
                {savedRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-medium truncate max-w-[160px]">{run.name || "Unnamed"}</span>
                      <span className="text-muted-foreground">{run.interval_ms}ms · burst {run.burst_size}</span>
                      <Badge variant="outline" className="text-[9px]">{run.severity}</Badge>
                      <span className="text-muted-foreground">{run.event_count} events</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{new Date(run.created_at).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => restoreRun(run)}>
                        <RotateCcw className="h-3 w-3" /> Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Simulation Stats (Live)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded bg-muted/20">
                <p className="text-lg font-semibold">{totalEvents}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="p-2 rounded bg-muted/20">
                <p className="text-lg font-semibold text-primary">{dedupCount}</p>
                <p className="text-[10px] text-muted-foreground">Deduplicated</p>
              </div>
              <div className="p-2 rounded bg-muted/20">
                <p className="text-lg font-semibold text-amber-500">{suppressCount}</p>
                <p className="text-[10px] text-muted-foreground">Suppressed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <AlertDedupStats />
      </div>

      {/* Live event stream */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            Live Event Stream
            {isStreaming && <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No events yet — start a stream or fire a burst.</p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-0.5">
              {events.slice(0, 100).map((e, i) => (
                <div key={`${e.ts}-${i}`} className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-muted/20 transition-colors">
                  <span className="text-[10px] text-muted-foreground w-[70px] shrink-0">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                  <span className="font-mono text-[10px] truncate max-w-[200px]">{e.fingerprint}</span>
                  <Badge variant="outline" className={`text-[9px] ${e.severity === "critical" ? "text-red-500" : e.severity === "high" ? "text-orange-500" : e.severity === "medium" ? "text-amber-500" : "text-blue-500"}`}>
                    {e.severity}
                  </Badge>
                  {e.deduplicated && <Badge variant="secondary" className="text-[9px]">DEDUP</Badge>}
                  {e.suppressed && <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-600">SUPPRESSED</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}