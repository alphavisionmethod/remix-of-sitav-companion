// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/internal-agent-intents
// AI Engineer surface (Phase 6): full lifecycle of every constrained
// autonomous action — intent → 7 gate verdicts → execution → receipt
// → rollback. Admin-only. Reads internal_agent_action_intents +
// ai_action_receipts; rollback button calls internal-agent-execute-action.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ShieldCheck,
  ShieldX,
  RotateCcw,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/sita/EmptyState";

interface IntentRow {
  id: string;
  agent_id: string;
  action_class: string;
  target_id: string;
  target_resource_type: string;
  confidence: number;
  status: string;
  precondition_check_passed: boolean;
  rollback_capable: boolean;
  rollback_plan: any;
  gate_results: any;
  approval_request_id: string | null;
  receipt_id: string | null;
  rollback_intent_id: string | null;
  rolled_back_at: string | null;
  denial_reason: string | null;
  error_message: string | null;
  execution_result: any;
  created_at: string;
  executed_at: string | null;
  correlation_id: string | null;
}

const STATUS_STYLES: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground", icon: Clock },
  approval_pending: { label: "Awaiting approval", cls: "bg-amber-500/15 text-amber-400", icon: AlertTriangle },
  executing: { label: "Executing", cls: "bg-blue-500/15 text-blue-400 animate-pulse", icon: Activity },
  executed: { label: "Executed", cls: "bg-green-500/15 text-green-400", icon: CheckCircle2 },
  failed: { label: "Failed", cls: "bg-destructive/15 text-destructive", icon: XCircle },
  denied: { label: "Denied", cls: "bg-red-500/15 text-red-400", icon: ShieldX },
  rolled_back: { label: "Rolled back", cls: "bg-orange-500/15 text-orange-400", icon: RotateCcw },
};

const REVERSE_CLASS_MAP: Record<string, string> = {
  enable_connector: "disable_unhealthy_connector",
  disable_unhealthy_connector: "enable_connector",
  cancel_workflow_run: "restart_workflow",
  restart_workflow: "cancel_workflow_run",
};

function StatusBadge({ status }: { status: string }) {
  const entry = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const Icon = entry.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", entry.cls)}>
      <Icon className="h-3 w-3" />
      {entry.label}
    </span>
  );
}

function GateStrip({ gates }: { gates: any[] }) {
  if (!Array.isArray(gates) || gates.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {gates.map((g, i) => {
        const passed = g?.passed === true || g?.result === "pass";
        return (
          <span
            key={i}
            title={`${g.gate ?? "gate"}: ${g.reason ?? (passed ? "pass" : "fail")}`}
            className={cn(
              "inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-mono",
              passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
            )}
          >
            {g.gate ?? `g${i}`}
          </span>
        );
      })}
    </div>
  );
}

export default function InternalAgentIntentTimeline() {
  const [rows, setRows] = useState<IntentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [selected, setSelected] = useState<IntentRow | null>(null);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("internal_agent_action_intents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error("Failed to load intents", { description: error.message });
    } else {
      setRows((data ?? []) as IntentRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-intent-timeline")
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_agent_action_intents" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const counters = useMemo(() => {
    const c = { all: rows.length, executed: 0, denied: 0, failed: 0, rolled_back: 0, approval_pending: 0 };
    for (const r of rows) {
      if (r.status === "executed") c.executed++;
      else if (r.status === "denied") c.denied++;
      else if (r.status === "failed") c.failed++;
      else if (r.status === "rolled_back") c.rolled_back++;
      else if (r.status === "approval_pending") c.approval_pending++;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim();
    return rows.filter((r) => {
      if (statusTab !== "all" && r.status !== statusTab) return false;
      if (!q) return true;
      return (
        r.agent_id.toLowerCase().includes(q) ||
        r.action_class.toLowerCase().includes(q) ||
        r.target_id.toLowerCase().includes(q) ||
        (r.correlation_id ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, statusTab]);

  const handleRollback = useCallback(async (intent: IntentRow) => {
    const reverse = REVERSE_CLASS_MAP[intent.action_class];
    if (!reverse) {
      toast.error("Action class is not reversible");
      return;
    }
    if (intent.rolled_back_at) {
      toast.info("This intent is already rolled back");
      return;
    }
    if (!confirm(`Trigger reverse action "${reverse}" for ${intent.target_resource_type}:${intent.target_id}?`)) return;

    setRollingBack(intent.id);
    try {
      const { data, error } = await supabase.functions.invoke("internal-agent-execute-action", {
        body: {
          agent_id: intent.agent_id,
          action_class: reverse,
          target_id: intent.target_id,
          target_resource_type: intent.target_resource_type,
          confidence: 1.0,
          reason: `manual_rollback_of_intent:${intent.id}`,
          rollback_intent_id: intent.id,
        },
      });
      if (error) throw error;
      if (data?.status === "denied" || data?.status === "failed") {
        toast.error(`Rollback ${data.status}`, { description: data?.denial_reason ?? data?.error });
      } else {
        toast.success("Reverse action queued", { description: `Status: ${data?.status ?? "executed"}` });
      }
      await load();
    } catch (e: any) {
      toast.error("Rollback failed", { description: e?.message ?? String(e) });
    } finally {
      setRollingBack(null);
    }
  }, [load]);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Internal Agent Action Intents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 2 — every constrained autonomous action by the internal AI workforce. Read-only audit, with one-click reverse for reversible classes.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {([
          ["all", "Total", counters.all, "bg-muted"],
          ["executed", "Executed", counters.executed, "bg-green-500/10"],
          ["approval_pending", "Awaiting approval", counters.approval_pending, "bg-amber-500/10"],
          ["denied", "Denied", counters.denied, "bg-red-500/10"],
          ["failed", "Failed", counters.failed, "bg-destructive/10"],
          ["rolled_back", "Rolled back", counters.rolled_back, "bg-orange-500/10"],
        ] as const).map(([key, label, value, bg]) => (
          <Card key={key} className={cn("cursor-pointer transition-colors", bg, statusTab === key && "ring-2 ring-primary")} onClick={() => setStatusTab(key)}>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="text-2xl font-semibold mt-0.5">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter agent / action / target / correlation…"
            className="pl-8"
          />
        </div>
        <Badge variant="outline">{filtered.length} of {rows.length}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Intent timeline</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Action class</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Gates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-2">
                    <EmptyState
                      icon={<Search className="h-5 w-5" />}
                      title={loading ? "Loading intents…" : "No intents match the current filter"}
                      description={loading ? "Fetching the latest 100 constrained autonomous actions." : "Adjust the agent or status filter, or wait for the next intent to be drafted."}
                    />
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((r) => {
                const reverse = REVERSE_CLASS_MAP[r.action_class];
                const canReverse = !!reverse && r.status === "executed" && !r.rolled_back_at && r.rollback_capable;
                return (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.agent_id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">{r.action_class}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="text-muted-foreground">{r.target_resource_type}</div>
                      <div className="font-mono truncate max-w-[180px]">{r.target_id}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{(r.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell><GateStrip gates={r.gate_results ?? []} /></TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {canReverse ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={rollingBack === r.id}
                          onClick={() => handleRollback(r)}
                        >
                          <RotateCcw className={cn("h-3.5 w-3.5 mr-1", rollingBack === r.id && "animate-spin")} />
                          Reverse
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">{selected.action_class}</Badge>
                  <StatusBadge status={selected.status} />
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  intent_id: {selected.id}
                  {selected.correlation_id ? <><br />correlation_id: {selected.correlation_id}</> : null}
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="lifecycle" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
                  <TabsTrigger value="gates">Gates</TabsTrigger>
                  <TabsTrigger value="rollback">Rollback</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>

                <TabsContent value="lifecycle" className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Agent</span><div className="font-mono">{selected.agent_id}</div></div>
                    <div><span className="text-muted-foreground">Confidence</span><div className="font-mono">{(selected.confidence * 100).toFixed(1)}%</div></div>
                    <div><span className="text-muted-foreground">Created</span><div>{new Date(selected.created_at).toLocaleString()}</div></div>
                    <div><span className="text-muted-foreground">Executed</span><div>{selected.executed_at ? new Date(selected.executed_at).toLocaleString() : "—"}</div></div>
                    <div><span className="text-muted-foreground">Precondition</span><div>{selected.precondition_check_passed ? "✓ Passed" : "✗ Failed"}</div></div>
                    <div><span className="text-muted-foreground">Rollback capable</span><div>{selected.rollback_capable ? "✓ Yes" : "✗ No"}</div></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Target</span><div className="font-mono text-xs">{selected.target_resource_type} / {selected.target_id}</div></div>
                    {selected.approval_request_id && (
                      <div className="col-span-2"><span className="text-muted-foreground">Approval request</span><div className="font-mono text-xs">{selected.approval_request_id}</div></div>
                    )}
                    {selected.receipt_id && (
                      <div className="col-span-2"><span className="text-muted-foreground">Receipt</span><div className="font-mono text-xs">{selected.receipt_id}</div></div>
                    )}
                    {selected.denial_reason && (
                      <div className="col-span-2"><span className="text-muted-foreground">Denial reason</span><div className="text-red-400">{selected.denial_reason}</div></div>
                    )}
                    {selected.error_message && (
                      <div className="col-span-2"><span className="text-muted-foreground">Error</span><div className="text-destructive">{selected.error_message}</div></div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="gates" className="mt-4">
                  <div className="space-y-2">
                    {(Array.isArray(selected.gate_results) ? selected.gate_results : []).map((g: any, i: number) => {
                      const passed = g?.passed === true || g?.result === "pass";
                      return (
                        <div key={i} className={cn("flex items-start gap-2 p-2 rounded border", passed ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5")}>
                          {passed ? <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-400 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{g?.gate ?? `gate-${i}`}</div>
                            <div className="text-xs text-muted-foreground">{g?.reason ?? (passed ? "passed" : "failed")}</div>
                          </div>
                        </div>
                      );
                    })}
                    {(!Array.isArray(selected.gate_results) || selected.gate_results.length === 0) && (
                      <EmptyState
                        icon={<ShieldCheck className="h-5 w-5" />}
                        title="No gate verdicts recorded"
                        description="Pre-execution gates left no traces — the action may have been auto-approved or short-circuited before evaluation."
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="rollback" className="mt-4 space-y-3">
                  {selected.rollback_plan ? (
                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">{JSON.stringify(selected.rollback_plan, null, 2)}</pre>
                  ) : (
                    <EmptyState
                      icon={<RotateCcw className="h-5 w-5" />}
                      title="No rollback plan persisted"
                      description="This action class is non-reversible or the planner did not stage a compensating step."
                    />
                  )}
                  {selected.rolled_back_at && (
                    <div className="text-sm">
                      <Badge variant="outline" className="border-orange-500/30 text-orange-400">Rolled back</Badge>
                      <div className="text-xs mt-1">at {new Date(selected.rolled_back_at).toLocaleString()}</div>
                      {selected.rollback_intent_id && <div className="text-xs font-mono mt-1">via intent {selected.rollback_intent_id}</div>}
                    </div>
                  )}
                  {!selected.rolled_back_at && REVERSE_CLASS_MAP[selected.action_class] && selected.status === "executed" && (
                    <Button size="sm" variant="outline" onClick={() => handleRollback(selected)} disabled={rollingBack === selected.id}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Trigger reverse: {REVERSE_CLASS_MAP[selected.action_class]}
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="raw" className="mt-4">
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">{JSON.stringify(selected, null, 2)}</pre>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
