import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Play, CheckCircle, XCircle, Clock, User, Eye, Search, Layers, Shield, RefreshCw, FileCheck, AlertTriangle, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEMO_RUNS: any[] = [];


interface RunRow {
  id: string;
  workflow_id: string;
  status: string;
  current_step: number;
  started_at: string;
  completed_at: string | null;
  last_progress_at: string;
  error: string | null;
  correlation_id: string | null;
  replayed_from: string | null;
}

interface StepRow {
  id: string;
  step_index: number;
  step_id: string;
  step_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  receipt_id: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  completed: "text-emerald-400",
  failed: "text-red-400",
  running: "text-blue-400",
  pending: "text-muted-foreground",
  cancelled: "text-amber-400",
  stuck: "text-orange-400",
  "awaiting-approval": "text-purple-400",
  paused: "text-muted-foreground",
};

const STEP_ICONS: Record<string, typeof Play> = {
  action: Play,
  approval: Shield,
  condition: GitBranch,
  notification: Layers,
  "external-call": FileCheck,
  delay: Clock,
  transformation: FileCheck,
};

export default function WorkflowReplayAudit() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [steps, setSteps] = useState<Record<string, StepRow[]>>({});
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [repairOpen, setRepairOpen] = useState<RunRow | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function loadRuns() {
    setLoading(true);
    // Query workflow_runs for live data (no DEMO_RUNS fallback)
    const { data, error } = await supabase
      .from("workflow_runs")
      .select("id, workflow_id, status, current_step, started_at, completed_at, last_progress_at, error, correlation_id, replayed_from")
      .order("started_at", { ascending: false })
      .limit(100);
    if (error) toast.error(`Failed to load runs: ${error.message}`);
    setRuns((data ?? []) as RunRow[]);
    setLoading(false);
  }

  async function loadSteps(runId: string) {
    if (steps[runId]) return;
    const { data } = await supabase
      .from("workflow_steps")
      .select("id, step_index, step_id, step_type, status, started_at, completed_at, error, receipt_id")
      .eq("run_id", runId)
      .order("step_index", { ascending: true });
    setSteps((s) => ({ ...s, [runId]: (data ?? []) as StepRow[] }));
  }

  useEffect(() => { loadRuns(); }, []);

  const filtered = runs.filter((r) => !search || r.id.includes(search) || (r.workflow_id ?? "").includes(search));

  async function callRepair(action: "retry" | "force_complete" | "force_fail" | "rollback") {
    if (!repairOpen) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("workflow-repair", {
      body: { run_id: repairOpen.id, action, reason: reason || undefined },
    });
    setBusy(false);
    if (error) {
      toast.error(`Repair failed: ${error.message}`);
      return;
    }
    toast.success(`Repair ${action} applied`);
    setRepairOpen(null);
    setReason("");
    loadRuns();
  }

  async function callReplay(runId: string) {
    setBusy(true);
    const { error } = await supabase.functions.invoke("workflow-replay", { body: { run_id: runId } });
    setBusy(false);
    if (error) toast.error(`Replay failed: ${error.message}`);
    else { toast.success("Replay queued"); loadRuns(); }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Workflow Replay & Audit</h1>
        <p className="text-sm text-muted-foreground">
          Live workflow runs · Repair stuck or failed runs · Replay with full audit trail
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total", value: runs.length },
          { label: "Running", value: runs.filter((r) => r.status === "running").length, color: "text-blue-400" },
          { label: "Completed", value: runs.filter((r) => r.status === "completed").length, color: "text-emerald-400" },
          { label: "Failed", value: runs.filter((r) => r.status === "failed").length, color: "text-red-400" },
          { label: "Stuck", value: runs.filter((r) => r.status === "stuck").length, color: "text-orange-400" },
        ].map((k) => (
          <Card key={k.label} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color || "text-foreground")}>{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by run id or workflow id..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={loadRuns} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />Refresh
        </Button>
      </div>

      {loading && runs.length === 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">Loading runs…</CardContent>
        </Card>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No workflow runs yet. Invoke `workflow-execute` to create one.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.map((run) => {
          const isExpanded = expanded === run.id;
          const runSteps = steps[run.id] ?? [];
          return (
            <motion.div key={run.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={cn("bg-card/50 border-border/50 hover:border-primary/20 transition-colors", isExpanded && "border-primary/30")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => { const next = isExpanded ? null : run.id; setExpanded(next); if (next) loadSteps(run.id); }}>
                    <div className="flex items-center gap-3">
                      <GitBranch className={cn("w-4 h-4", STATUS_COLORS[run.status])} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">{run.id.slice(0, 8)}</span>
                          <Badge variant="outline" className={cn("text-[9px] capitalize", STATUS_COLORS[run.status])}>{run.status}</Badge>
                          {run.replayed_from && <Badge variant="outline" className="text-[8px] text-amber-400">replay</Badge>}
                          {run.status === "stuck" && <AlertTriangle className="w-3 h-3 text-orange-400" />}
                        </div>
                        <p className="text-sm font-medium text-foreground mt-0.5 font-mono">{run.workflow_id.slice(0, 12)}…</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span><Clock className="w-3 h-3 inline mr-0.5" />{new Date(run.started_at).toLocaleString()}</span>
                          <span>step {run.current_step}</span>
                          {run.error && <span className="text-red-400">{run.error.slice(0, 40)}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => callReplay(run.id)} disabled={busy}>
                        <RefreshCw className="w-3 h-3 mr-1" />Replay
                      </Button>
                      <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => setRepairOpen(run)}>
                        <Wrench className="w-3 h-3 mr-1" />Repair
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                      {runSteps.length === 0 && <p className="text-xs text-muted-foreground">No steps recorded.</p>}
                      {runSteps.map((s) => {
                        const Icon = STEP_ICONS[s.step_type] ?? Play;
                        return (
                          <div key={s.id} className="flex items-start gap-3">
                            <div className={cn("p-1 rounded-md", s.status === "completed" ? "bg-emerald-500/10" : s.status === "failed" ? "bg-red-500/10" : "bg-muted/30")}>
                              <Icon className={cn("w-3 h-3", STATUS_COLORS[s.status])} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-foreground">{s.step_id}</p>
                                <Badge variant="outline" className="text-[8px]">{s.step_type}</Badge>
                                <Badge variant="outline" className={cn("text-[8px]", STATUS_COLORS[s.status])}>{s.status}</Badge>
                                {s.receipt_id && <Badge variant="outline" className="text-[8px] text-primary">receipt</Badge>}
                              </div>
                              {s.error && <p className="text-[10px] text-red-400 mt-0.5">{s.error}</p>}
                              {s.completed_at && <p className="text-[9px] text-muted-foreground">{new Date(s.completed_at).toLocaleString()}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Sheet open={!!repairOpen} onOpenChange={(o) => !o && setRepairOpen(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Repair workflow run</SheetTitle>
            <SheetDescription>
              Run <span className="font-mono">{repairOpen?.id.slice(0, 8)}…</span> · current status:{" "}
              <span className={STATUS_COLORS[repairOpen?.status ?? ""]}>{repairOpen?.status}</span>
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Reason (optional)</label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you repairing this run?" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => callRepair("retry")} disabled={busy}><RefreshCw className="w-3 h-3 mr-1" />Retry</Button>
              <Button variant="outline" onClick={() => callRepair("force_complete")} disabled={busy}><CheckCircle className="w-3 h-3 mr-1" />Force complete</Button>
              <Button variant="outline" onClick={() => callRepair("force_fail")} disabled={busy}><XCircle className="w-3 h-3 mr-1" />Force fail</Button>
              <Button variant="outline" onClick={() => callRepair("rollback")} disabled={busy}><Wrench className="w-3 h-3 mr-1" />Rollback</Button>
            </div>
            <p className="text-[10px] text-muted-foreground">All actions write a workflow_receipt + state_transition row for audit.</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
