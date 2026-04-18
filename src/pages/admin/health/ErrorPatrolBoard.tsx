// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Health · Error Patrol Triage Board (Phase 2)
//
// Operator-grade triage surface for autonomous remediation activity.
// Reads from the canonical `error_patrol_triage_view` and exposes the
// 4 operator actions defined in Phase 2:
//   • Acknowledge a detection
//   • Trigger rollback (calls internal-agent-execute-action with the
//     reverse class — no second action stack)
//   • Open the linked incident (deep-link)
//   • Mute the pattern for 24h
//
// Reuses, never duplicates:
//   - admin shell layout (gated route in AdminRoutes)
//   - Card / Badge / Button / Tabs / Drawer primitives
//   - Triage data layer (single view query)
//   - internal-agent-execute-action edge function for rollback
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  VolumeX,
  Activity,
  RefreshCcw,
} from "lucide-react";

// ─── Types from error_patrol_triage_view ────────────────────────
interface TriageRow {
  id: string;
  pattern_key: string;
  subsystem: string;
  severity: "low" | "moderate" | "high" | "critical";
  status: "open" | "acknowledged" | "muted" | "resolved";
  frequency: number;
  first_seen_at: string;
  last_seen_at: string;
  follow_up_recommendation: string | null;
  affected_resource_type: string | null;
  affected_resource_id: string | null;
  linked_incident_id: string | null;
  linked_agent_action_id: string | null;
  linked_intent_id: string | null;
  acknowledged_at: string | null;
  muted_until: string | null;
  resolved_at: string | null;
  incident_title: string | null;
  incident_severity: string | null;
  responding_agent_id: string | null;
  responding_agent_council: string | null;
  agent_action_type: string | null;
  agent_confidence: number | null;
  agent_action_status: string | null;
  intent_action_class: string | null;
  intent_status: string | null;
  rollback_capable: boolean | null;
  rolled_back_at: string | null;
  intent_receipt_id: string | null;
  intent_executed_at: string | null;
  rollback_availability: "available" | "not_applicable" | "already_rolled_back" | string;
}

interface KillSwitchRow {
  id: string;
  enabled: boolean;
  expires_at: string | null;
  reason: string | null;
}

const SEVERITY_TONE: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  moderate: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

const STATUS_TONE: Record<string, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/20",
  acknowledged: "bg-primary/10 text-primary border-primary/20",
  muted: "bg-muted text-muted-foreground border-border",
  resolved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

function relTime(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ErrorPatrolBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<TriageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TriageRow | null>(null);
  const [killSwitch, setKillSwitch] = useState<KillSwitchRow | null>(null);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: triage }, { data: ks }] = await Promise.all([
      supabase
        .from("error_patrol_triage_view" as any)
        .select("*")
        .order("severity", { ascending: false })
        .order("last_seen_at", { ascending: false })
        .limit(200),
      supabase
        .from("automation_kill_switches")
        .select("id, enabled, expires_at, reason")
        .eq("switch_id", "KS-INTERNAL-AGENTS-EXECUTE")
        .eq("user_id", user?.id ?? "")
        .maybeSingle(),
    ]);
    setRows((triage as any as TriageRow[]) ?? []);
    setKillSwitch((ks as any as KillSwitchRow) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // Realtime: refresh on detection changes
    const channel = supabase
      .channel("error-patrol-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "error_patrol_detections" },
        () => void load(),
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const counters = useMemo(() => {
    const out = { critical: 0, high: 0, moderate: 0, low: 0, open: 0, acted: 0, rollback_ready: 0 };
    for (const r of rows) {
      if (r.status === "resolved" || r.status === "muted") continue;
      out[r.severity as keyof typeof out] = (out[r.severity as keyof typeof out] ?? 0) + 1;
      if (r.status === "open") out.open++;
      if (r.responding_agent_id) out.acted++;
      if (r.rollback_availability === "available") out.rollback_ready++;
    }
    return out;
  }, [rows]);

  const filteredRows = (status: "active" | "all") =>
    status === "active"
      ? rows.filter((r) => r.status === "open" || r.status === "acknowledged")
      : rows;

  async function acknowledge(id: string) {
    setActionInFlight(id);
    const { error } = await supabase.rpc("acknowledge_error_patrol_detection" as any, {
      _detection_id: id,
    });
    setActionInFlight(null);
    if (error) {
      toast({ title: "Acknowledge failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Detection acknowledged" });
      void load();
    }
  }

  async function mute(patternKey: string) {
    setActionInFlight(patternKey);
    const { error } = await supabase.rpc("mute_error_patrol_pattern" as any, {
      _pattern_key: patternKey, _hours: 24,
    });
    setActionInFlight(null);
    if (error) {
      toast({ title: "Mute failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pattern muted for 24h" });
      void load();
    }
  }

  async function resolve(id: string) {
    setActionInFlight(id);
    const { error } = await supabase.rpc("resolve_error_patrol_detection" as any, {
      _detection_id: id, _notes: "Resolved from triage board",
    });
    setActionInFlight(null);
    if (error) {
      toast({ title: "Resolve failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Detection resolved" });
      setSelected(null);
      void load();
    }
  }

  async function triggerRollback(row: TriageRow) {
    if (row.rollback_availability !== "available") return;
    if (!row.linked_intent_id || !row.linked_agent_action_id) {
      toast({ title: "Rollback unavailable", description: "Missing intent linkage", variant: "destructive" });
      return;
    }
    setActionInFlight(row.id);
    // Look up the original intent's reverse class via the whitelist
    const { data: intent } = await supabase
      .from("internal_agent_action_intents")
      .select("agent_id, action_class, target_id, rollback_plan")
      .eq("id", row.linked_intent_id)
      .maybeSingle();
    if (!intent || !intent.rollback_plan) {
      setActionInFlight(null);
      toast({ title: "Rollback unavailable", description: "No rollback plan recorded", variant: "destructive" });
      return;
    }
    const plan: any = intent.rollback_plan;
    const reverseClass = plan.reverse_action_class;
    const reverseTarget = plan.target_id ?? intent.target_id;
    if (!reverseClass) {
      setActionInFlight(null);
      toast({ title: "Rollback unavailable", description: "No reverse class defined", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase.functions.invoke("internal-agent-execute-action", {
      body: {
        agent_id: intent.agent_id,
        action_class: reverseClass,
        target_id: reverseTarget,
        confidence: 1.0,
        precondition_evidence: { rollback_for_intent_id: row.linked_intent_id, triggered_by_operator: user?.id ?? null },
        correlation_id: `rollback-${row.linked_intent_id}`,
      },
    });
    setActionInFlight(null);
    if (error || !data?.ok) {
      toast({ title: "Rollback failed", description: error?.message ?? data?.error ?? data?.denial_reason ?? "Unknown error", variant: "destructive" });
    } else {
      toast({ title: "Rollback executed", description: `Action ${data.action_id} succeeded` });
      // Mark the original intent as rolled back
      await supabase
        .from("internal_agent_action_intents")
        .update({ status: "rolled_back", rolled_back_at: new Date().toISOString(), rolled_back_by: user?.id, rollback_intent_id: data.intent_id })
        .eq("id", row.linked_intent_id);
      void load();
    }
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Error Patrol — Triage Board</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Operator-grade view of detected error patterns and autonomous-agent remediation activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {killSwitch && (
            <Badge
              variant="outline"
              className={killSwitch.enabled
                ? "bg-destructive/15 text-destructive border-destructive/30"
                : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"}
            >
              {killSwitch.enabled
                ? <><ShieldAlert className="h-3 w-3 mr-1" /> Master kill-switch ACTIVE</>
                : <><ShieldCheck className="h-3 w-3 mr-1" /> Master kill-switch off</>}
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCcw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Severity counters */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <CounterCard label="Critical" value={counters.critical} tone="critical" />
        <CounterCard label="High" value={counters.high} tone="high" />
        <CounterCard label="Moderate" value={counters.moderate} tone="moderate" />
        <CounterCard label="Low" value={counters.low} tone="low" />
        <CounterCard label="Open" value={counters.open} tone="open" />
        <CounterCard label="Agent acted" value={counters.acted} tone="acted" />
        <CounterCard label="Rollback ready" value={counters.rollback_ready} tone="rollback" />
      </div>

      {/* Triage table */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({filteredRows("active").length})</TabsTrigger>
          <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
        </TabsList>
        {(["active", "all"] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left p-3">Pattern</th>
                      <th className="text-left p-3">Severity</th>
                      <th className="text-left p-3">Subsystem</th>
                      <th className="text-right p-3">Freq</th>
                      <th className="text-left p-3">Last seen</th>
                      <th className="text-left p-3">Agent</th>
                      <th className="text-left p-3">Action</th>
                      <th className="text-left p-3">Rollback</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
                    )}
                    {!loading && filteredRows(tab).length === 0 && (
                      <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 inline mr-2 text-emerald-500" />
                        No detections in this view.
                      </td></tr>
                    )}
                    {filteredRows(tab).map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelected(r)}
                      >
                        <td className="p-3 font-mono text-xs">{r.pattern_key}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={SEVERITY_TONE[r.severity]}>{r.severity}</Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{r.subsystem}</td>
                        <td className="p-3 text-right tabular-nums">{r.frequency}</td>
                        <td className="p-3 text-xs text-muted-foreground">{relTime(r.last_seen_at)}</td>
                        <td className="p-3 text-xs">{r.responding_agent_id ?? <span className="text-muted-foreground">—</span>}</td>
                        <td className="p-3 text-xs">
                          {r.intent_action_class ?? r.agent_action_type ?? <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={
                            r.rollback_availability === "available" ? "bg-primary/10 text-primary border-primary/20"
                            : r.rollback_availability === "already_rolled_back" ? "bg-muted text-muted-foreground"
                            : "bg-muted/40 text-muted-foreground border-border"
                          }>
                            {r.rollback_availability}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={STATUS_TONE[r.status]}>{r.status}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          {r.status === "open" && (
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); void acknowledge(r.id); }}
                              disabled={actionInFlight === r.id}>
                              Ack
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Drilldown drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" /> {selected.pattern_key}
                </SheetTitle>
                <SheetDescription>
                  Detection drilldown · {selected.subsystem} · seen {selected.frequency}× since {relTime(selected.first_seen_at)}
                </SheetDescription>
              </SheetHeader>
              <Tabs defaultValue="detection" className="mt-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="detection">Detection</TabsTrigger>
                  <TabsTrigger value="action">Action</TabsTrigger>
                  <TabsTrigger value="receipt">Receipt & Rollback</TabsTrigger>
                </TabsList>
                <TabsContent value="detection" className="space-y-3 mt-4 text-sm">
                  <KV label="Severity"><Badge variant="outline" className={SEVERITY_TONE[selected.severity]}>{selected.severity}</Badge></KV>
                  <KV label="Status"><Badge variant="outline" className={STATUS_TONE[selected.status]}>{selected.status}</Badge></KV>
                  <KV label="Subsystem">{selected.subsystem}</KV>
                  <KV label="Affected resource">
                    {selected.affected_resource_type ? `${selected.affected_resource_type}/${selected.affected_resource_id ?? "?"}` : "—"}
                  </KV>
                  <KV label="First seen">{relTime(selected.first_seen_at)}</KV>
                  <KV label="Last seen">{relTime(selected.last_seen_at)}</KV>
                  <KV label="Frequency">{selected.frequency}</KV>
                  {selected.linked_incident_id && (
                    <KV label="Linked incident">
                      <Link to={`/admin/health/incidents`} className="text-primary hover:underline inline-flex items-center gap-1">
                        {selected.incident_title ?? selected.linked_incident_id}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </KV>
                  )}
                  {selected.follow_up_recommendation && (
                    <div className="bg-muted/40 rounded p-3 text-xs">
                      <div className="text-muted-foreground uppercase tracking-wider mb-1">Follow-up</div>
                      <div>{selected.follow_up_recommendation}</div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="action" className="space-y-3 mt-4 text-sm">
                  {selected.responding_agent_id ? (
                    <>
                      <KV label="Responding agent">{selected.responding_agent_id}</KV>
                      <KV label="Council">{selected.responding_agent_council}</KV>
                      <KV label="Action class">{selected.intent_action_class ?? selected.agent_action_type}</KV>
                      <KV label="Confidence">{selected.agent_confidence?.toFixed(2) ?? "—"}</KV>
                      <KV label="Action status">
                        <Badge variant="outline">{selected.agent_action_status ?? "—"}</Badge>
                      </KV>
                      <KV label="Intent status">
                        <Badge variant="outline">{selected.intent_status ?? "—"}</Badge>
                      </KV>
                      <KV label="Executed at">{relTime(selected.intent_executed_at)}</KV>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-sm">No agent has acted on this detection yet.</div>
                  )}
                </TabsContent>
                <TabsContent value="receipt" className="space-y-3 mt-4 text-sm">
                  <KV label="Rollback available">
                    <Badge variant="outline" className={
                      selected.rollback_availability === "available" ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground"
                    }>
                      {selected.rollback_availability}
                    </Badge>
                  </KV>
                  <KV label="Rolled back at">{relTime(selected.rolled_back_at)}</KV>
                  <KV label="Receipt ID">
                    {selected.intent_receipt_id ? (
                      <code className="text-xs">{selected.intent_receipt_id.slice(0, 12)}…</code>
                    ) : "—"}
                  </KV>
                  {selected.rollback_availability === "available" && (
                    <Button
                      className="w-full mt-3"
                      onClick={() => void triggerRollback(selected)}
                      disabled={actionInFlight === selected.id}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Trigger rollback
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                {selected.status === "open" && (
                  <Button size="sm" variant="outline" onClick={() => void acknowledge(selected.id)}
                    disabled={actionInFlight === selected.id}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Acknowledge
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => void mute(selected.pattern_key)}
                  disabled={actionInFlight === selected.pattern_key}>
                  <VolumeX className="h-3.5 w-3.5 mr-1" /> Mute pattern 24h
                </Button>
                {selected.status !== "resolved" && (
                  <Button size="sm" variant="ghost" onClick={() => void resolve(selected.id)}
                    disabled={actionInFlight === selected.id}>
                    Resolve
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CounterCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  const toneClass: Record<string, string> = {
    critical: "border-destructive/30 bg-destructive/5",
    high: "border-orange-500/30 bg-orange-500/5",
    moderate: "border-amber-500/30 bg-amber-500/5",
    low: "border-border",
    open: "border-primary/30 bg-primary/5",
    acted: "border-emerald-500/30 bg-emerald-500/5",
    rollback: "border-primary/30 bg-primary/5",
  };
  return (
    <Card className={`p-3 ${toneClass[tone] ?? ""}`}>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
    </Card>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 items-center">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}
