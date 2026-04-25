// ═══════════════════════════════════════════════════════════════
// Phase 8A — Continuous Assurance & Chaos board
// Reads chaos drills, assurance reports, auto-rollback events.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { ShieldCheck, Zap, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";

interface Drill { id: string; drill_key: string; scenario: string; status: string; blast_radius: number; last_run_at: string | null; }
interface Report { id: string; period_start: string; period_end: string; assurance_score: number; breach_count: number; drill_count: number; summary: string | null; }
interface Rollback { id: string; reason: string; rollback_target: string; applied_autonomy: number; status: string; created_at: string; }

const sevColor: Record<string, string> = {
  passed: "bg-emerald-500/10 text-emerald-600",
  scheduled: "bg-blue-500/10 text-blue-600",
  running: "bg-amber-500/10 text-amber-600",
  failed: "bg-red-500/10 text-red-600",
  cancelled: "bg-muted text-muted-foreground",
  executed: "bg-emerald-500/10 text-emerald-600",
  dry_run: "bg-blue-500/10 text-blue-600",
};

export default function AssuranceChaosBoard() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [rollbacks, setRollbacks] = useState<Rollback[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const [d, r, b] = await Promise.all([
      supabase.from("internal_agent_chaos_drills").select("*").order("last_run_at", { ascending: false, nullsFirst: false }).limit(20),
      supabase.from("internal_agent_assurance_reports").select("*").order("period_end", { ascending: false }).limit(10),
      supabase.from("internal_agent_auto_rollback_events").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    setDrills((d.data ?? []) as typeof drills);
    setReports((r.data ?? []) as typeof reports);
    setRollbacks((b.data ?? []) as typeof rollbacks);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function runCanaries() {
    const { error } = await supabase.functions.invoke("internal-agent-canary-runner", { body: {} });
    if (error) toast.error(error.message); else { toast.success("Canary sweep complete"); refresh(); }
  }
  async function runChaos() {
    const { error } = await supabase.functions.invoke("internal-agent-chaos-scheduler", { body: {} });
    if (error) toast.error(error.message); else { toast.success("Chaos schedule advanced"); refresh(); }
  }

  return (
    <AdminControlPlaneShell contextScope="Assurance & Chaos">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Continuous Assurance & Chaos</h1>
          <p className="text-sm text-muted-foreground">Phase 8A — canary runner, chaos drills, auto-rollback ledger. L3 hard ceiling.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runCanaries} disabled={loading}><Zap className="h-4 w-4 mr-1" /> Run canaries</Button>
          <Button variant="outline" size="sm" onClick={runChaos} disabled={loading}><Zap className="h-4 w-4 mr-1" /> Advance chaos</Button>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Chaos drills</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {drills.length === 0 && (
              <EmptyState
                icon={<Zap className="h-5 w-5" />}
                title="No chaos drills scheduled"
                description="Drills become visible here once a supervisor schedules a controlled failure scenario. Each drill is blast-radius bounded and rollback-capable."
              />
            )}
            {drills.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
                <div>
                  <div className="font-medium">{d.drill_key}</div>
                  <div className="text-muted-foreground">{d.scenario} · blast {d.blast_radius}</div>
                </div>
                <Badge className={sevColor[d.status] ?? ""}>{d.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Auto-rollback events</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rollbacks.length === 0 && (
              <EmptyState
                icon={<RotateCcw className="h-5 w-5" />}
                title="No automatic rollbacks have fired"
                description="A clean window means assurance has not detected a regression severe enough to revert. Rollback events are recorded with their trigger, target, and applied autonomy."
              />
            )}
            {rollbacks.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-1">
                <div>
                  <div className="font-medium flex items-center gap-1"><RotateCcw className="h-3 w-3" /> {r.rollback_target}</div>
                  <div className="text-muted-foreground">{r.reason}</div>
                </div>
                <div className="text-right">
                  <Badge className={sevColor[r.status] ?? ""}>{r.status}</Badge>
                  <div className="text-[10px] text-muted-foreground mt-0.5">L{r.applied_autonomy} ≤ L3</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Weekly assurance reports</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {reports.length === 0 && (
            <EmptyState
              icon={<ShieldCheck className="h-5 w-5" />}
              title="No assurance reports generated yet"
              description="Reports are produced on a rolling cadence after each drill window closes. Each report includes the assurance score, breach count, and remediation linkage."
            />
          )}
          {reports.map((r) => (
            <div key={r.id} className="text-xs border-b border-border/30 pb-1">
              <div className="flex justify-between">
                <span className="font-medium">{new Date(r.period_start).toLocaleDateString()} → {new Date(r.period_end).toLocaleDateString()}</span>
                <Badge variant="outline">score {(r.assurance_score * 100).toFixed(0)}%</Badge>
              </div>
              <div className="text-muted-foreground">{r.summary}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminControlPlaneShell>
  );
}
