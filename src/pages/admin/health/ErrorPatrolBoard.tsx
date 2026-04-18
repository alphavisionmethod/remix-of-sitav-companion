// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/health/error-patrol
// Operator triage surface for autonomous + human-handled detections.
// Reads error_patrol_triage_view; rollback button calls
// internal-agent-execute-action with the reverse class.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  RotateCcw,
  ExternalLink,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

interface DetectionRow {
  detection_id: string;
  pattern_key: string;
  severity: "low" | "medium" | "high" | "critical";
  subsystem: string;
  first_seen: string;
  last_seen: string;
  frequency: number;
  status: string;
  follow_up_recommendation: string | null;
  target_id: string | null;
  linked_incident_id: string | null;
  linked_agent_action_id: string | null;
  agent_id: string | null;
  action_class: string | null;
  action_status: string | null;
  receipt_id: string | null;
  intent_id: string | null;
  rollback_plan: Record<string, unknown> | null;
  rollback_available: "available" | "none" | "already_rolled_back" | null;
  gate_results: unknown;
  precondition_evidence: unknown;
  triggered_by: string | null;
  is_reversible: boolean | null;
  reverse_action_class: string | null;
  detection_created_at: string;
}

interface KillSwitchRow {
  enabled: boolean;
  reason: string | null;
}

const severityColor: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

export default function ErrorPatrolBoard() {
  const [rows, setRows] = useState<DetectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DetectionRow | null>(null);
  const [killSwitch, setKillSwitch] = useState<KillSwitchRow | null>(null);
  const [acting, setActing] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("error_patrol_triage_view" as never)
      .select("*")
      .order("detection_created_at", { ascending: false })
      .limit(200);

    if (error) {
      toast.error(`Failed to load detections: ${error.message}`);
    } else {
      setRows((data as DetectionRow[]) ?? []);
    }

    const { data: ks } = await supabase
      .from("automation_kill_switches")
      .select("enabled,reason")
      .eq("switch_id", "KS-INTERNAL-AGENTS-EXECUTE")
      .limit(1)
      .maybeSingle();
    setKillSwitch((ks as KillSwitchRow) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const r of rows) c[r.severity] = (c[r.severity] ?? 0) + 1;
    return c;
  }, [rows]);

  async function triggerRollback(row: DetectionRow) {
    if (!row.reverse_action_class || !row.target_id || !row.intent_id) {
      toast.error("Rollback metadata missing");
      return;
    }
    setActing(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("internal-agent-execute-action", {
      body: {
        agent_id: row.agent_id ?? "operator-rollback",
        action_class: row.reverse_action_class,
        target_id: row.target_id,
        confidence: 1.0,
        precondition_evidence: {
          rollback_of_intent: row.intent_id,
          original_action: row.action_class,
          operator_initiated: true,
        },
        triggered_by: "operator",
        rollback_intent_id: row.intent_id,
        rationale: `Operator rollback of ${row.action_class} on ${row.target_id}`,
      },
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    });
    setActing(false);
    if (res.error) {
      toast.error(`Rollback failed: ${res.error.message}`);
    } else {
      toast.success(`Rollback dispatched: ${(res.data as { status?: string })?.status ?? "queued"}`);
      setSelected(null);
      load();
    }
  }

  async function acknowledge(row: DetectionRow) {
    const { error } = await supabase
      .from("error_patrol_detections")
      .update({ status: "acknowledged", updated_at: new Date().toISOString() })
      .eq("id", row.detection_id);
    if (error) toast.error(error.message);
    else {
      toast.success("Acknowledged");
      load();
    }
  }

  async function mute24h(row: DetectionRow) {
    const { error } = await supabase
      .from("error_patrol_detections")
      .update({
        status: "muted",
        updated_at: new Date().toISOString(),
      })
      .eq("pattern_key", row.pattern_key);
    if (error) toast.error(error.message);
    else {
      toast.success(`Pattern ${row.pattern_key} muted`);
      load();
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Patrol</h1>
          <p className="text-muted-foreground mt-1">
            Triage autonomous + human-handled detections across the OS.
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            killSwitch?.enabled
              ? "border-destructive/40 text-destructive bg-destructive/10"
              : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
          }
        >
          {killSwitch?.enabled ? (
            <>
              <VolumeX className="w-3.5 h-3.5 mr-1.5" />
              KS-INTERNAL-AGENTS-EXECUTE: HALTED
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 mr-1.5" />
              KS-INTERNAL-AGENTS-EXECUTE: live
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["critical", "high", "medium", "low"] as const).map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                {s}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{counts[s]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Detections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground text-sm">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground text-sm py-8 text-center">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No active detections. The error patrol surface aggregates incidents,
              self-healing detections, and agent-handled actions as they appear.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Subsystem</TableHead>
                  <TableHead>Freq</TableHead>
                  <TableHead>Last seen</TableHead>
                  <TableHead>Agent action</TableHead>
                  <TableHead>Rollback</TableHead>
                  <TableHead className="text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.detection_id} className="cursor-pointer">
                    <TableCell className="font-mono text-xs">{r.pattern_key}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severityColor[r.severity]}>
                        {r.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{r.subsystem}</TableCell>
                    <TableCell className="text-sm tabular-nums">{r.frequency}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(r.last_seen).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.action_class ? (
                        <span className="font-mono text-xs">
                          {r.agent_id} → {r.action_class}{" "}
                          <Badge variant="secondary" className="ml-1 text-[10px]">
                            {r.action_status}
                          </Badge>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">no action</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.rollback_available === "available" && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30" variant="outline">
                          available
                        </Badge>
                      )}
                      {r.rollback_available === "already_rolled_back" && (
                        <Badge variant="outline" className="text-muted-foreground">
                          rolled back
                        </Badge>
                      )}
                      {(r.rollback_available === "none" || r.rollback_available === null) && (
                        <Badge variant="outline" className="text-muted-foreground">
                          —
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {selected.pattern_key}
                </SheetTitle>
                <SheetDescription>
                  {selected.subsystem} · {selected.severity} · seen {selected.frequency}× since{" "}
                  {new Date(selected.first_seen).toLocaleString()}
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="detection" className="mt-6">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="detection">Detection</TabsTrigger>
                  <TabsTrigger value="action">Agent action</TabsTrigger>
                  <TabsTrigger value="receipt">Receipt &amp; rollback</TabsTrigger>
                </TabsList>

                <TabsContent value="detection" className="space-y-3 mt-4">
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                    <div>
                      <b>Status:</b> {selected.status}
                    </div>
                    <div>
                      <b>Target:</b>{" "}
                      <code className="text-xs">{selected.target_id ?? "—"}</code>
                    </div>
                    <div>
                      <b>Linked incident:</b>{" "}
                      {selected.linked_incident_id ? (
                        <a
                          className="underline inline-flex items-center gap-1"
                          href={`/admin/health/incidents`}
                        >
                          {selected.linked_incident_id.slice(0, 8)}…
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                    {selected.follow_up_recommendation && (
                      <div>
                        <b>Recommendation:</b> {selected.follow_up_recommendation}
                      </div>
                    )}
                  </div>
                  <pre className="text-[11px] bg-muted/30 p-3 rounded border overflow-auto max-h-64">
                    {JSON.stringify(selected.precondition_evidence ?? {}, null, 2)}
                  </pre>
                </TabsContent>

                <TabsContent value="action" className="space-y-3 mt-4">
                  {selected.action_class ? (
                    <>
                      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
                        <div>
                          <b>Agent:</b> <code className="text-xs">{selected.agent_id}</code>
                        </div>
                        <div>
                          <b>Action class:</b>{" "}
                          <code className="text-xs">{selected.action_class}</code>
                        </div>
                        <div>
                          <b>Triggered by:</b> {selected.triggered_by ?? "agent"}
                        </div>
                        <div>
                          <b>Outcome:</b> {selected.action_status}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                          Safety gate results
                        </div>
                        <pre className="text-[11px] bg-muted/30 p-3 rounded border overflow-auto max-h-64">
                          {JSON.stringify(selected.gate_results ?? [], null, 2)}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No agent action recorded for this detection.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="receipt" className="space-y-3 mt-4">
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
                    <div>
                      <b>Receipt:</b>{" "}
                      {selected.receipt_id ? (
                        <code className="text-xs">{selected.receipt_id}</code>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div>
                      <b>Intent:</b>{" "}
                      {selected.intent_id ? (
                        <code className="text-xs">{selected.intent_id}</code>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div>
                      <b>Reversible:</b> {selected.is_reversible ? "yes" : "no"}
                    </div>
                    <div>
                      <b>Reverse action:</b>{" "}
                      <code className="text-xs">
                        {selected.reverse_action_class ?? "—"}
                      </code>
                    </div>
                  </div>

                  {selected.rollback_plan && (
                    <pre className="text-[11px] bg-muted/30 p-3 rounded border overflow-auto max-h-48">
                      {JSON.stringify(selected.rollback_plan, null, 2)}
                    </pre>
                  )}

                  <div className="flex flex-wrap gap-2 pt-3">
                    <Button
                      variant="default"
                      size="sm"
                      disabled={
                        acting ||
                        selected.rollback_available !== "available" ||
                        !selected.reverse_action_class
                      }
                      onClick={() => triggerRollback(selected)}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Trigger rollback
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => acknowledge(selected)}>
                      Acknowledge
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => mute24h(selected)}>
                      Mute pattern
                    </Button>
                    {selected.linked_incident_id && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/admin/health/incidents">Open incident →</a>
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
