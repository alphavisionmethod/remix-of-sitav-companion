// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 16 · Boardroom L7 SLA Drill-Down
// Operator visibility into stuck follow-through dispatches.
// Read-only — manual remediation via runbook RB-020.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, RefreshCw, Clock, Activity, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Dispatch {
  id: string;
  boardroom_item_id: string | null;
  state: string;
  correlation_id: string | null;
  execution_completed_at: string | null;
  created_at: string;
  failure_reason: string | null;
}

const STUCK_STATES = ["dispatch_pending", "dispatched", "executing", "outcome_pending", "failed"];

export default function BoardroomSLADrillDown() {
  const [items, setItems] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("boardroom_followthrough_dispatches")
      .select("id, boardroom_item_id, state, correlation_id, execution_completed_at, created_at, failure_reason")
      .in("state", STUCK_STATES)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    else setItems((data ?? []) as unknown as Dispatch[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, Dispatch[]>();
    for (const s of STUCK_STATES) map.set(s, []);
    for (const d of items) map.get(d.state)?.push(d);
    return map;
  }, [items]);

  const slaBreached = (d: Dispatch): boolean => {
    const ageMs = Date.now() - new Date(d.created_at).getTime();
    if (d.state === "outcome_pending") return ageMs > 72 * 3600 * 1000;
    if (d.state === "dispatch_pending") return ageMs > 6 * 3600 * 1000;
    if (d.state === "executing") return ageMs > 4 * 3600 * 1000;
    return d.state === "failed";
  };

  const breachCount = items.filter(slaBreached).length;
  const filtered = tab === "all" ? items : tab === "breached" ? items.filter(slaBreached) : (grouped.get(tab) ?? []);

  const stateTone = (s: string): "default" | "secondary" | "destructive" | "outline" =>
    s === "failed" ? "destructive" : s === "outcome_pending" ? "secondary" : "outline";

  return (
    <AdminControlPlaneShell contextScope="Boardroom · L7 SLA Drill-Down">
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Activity className="h-6 w-6" /> Boardroom L7 · SLA Drill-Down
            </h1>
            <p className="text-sm text-muted-foreground">
              Phase 16 · Live view of follow-through dispatches that are stuck or have failed. Cron scan runs every 30 minutes.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">In flight</div>
            <div className="text-2xl font-semibold">{items.length}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">SLA breached</div>
            <div className="text-2xl font-semibold text-destructive">{breachCount}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Outcome pending</div>
            <div className="text-2xl font-semibold">{grouped.get("outcome_pending")?.length ?? 0}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Failed</div>
            <div className="text-2xl font-semibold">{grouped.get("failed")?.length ?? 0}</div>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Remediation runbook
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <div>• Stuck &gt;6h in <code>dispatch_pending</code>: re-trigger via boardroom-followthrough-dispatch.</div>
            <div>• Stuck &gt;72h in <code>outcome_pending</code>: record manual outcome via boardroom-outcome-record.</div>
            <div>• Failed: inspect <code>failure_reason</code>, then either rollback or kill-switch (RB-020).</div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="breached">Breached ({breachCount})</TabsTrigger>
            {STUCK_STATES.map(s => (
              <TabsTrigger key={s} value={s}>{s} ({grouped.get(s)?.length ?? 0})</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={tab} className="mt-4 space-y-2">
            {!loading && filtered.length === 0 && (
              <Card><CardContent className="p-6 text-sm text-muted-foreground text-center">
                No dispatches in this state.
              </CardContent></Card>
            )}
            {filtered.map(d => (
              <Card key={d.id}>
                <CardContent className="p-4 text-sm space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={stateTone(d.state)}>{d.state}</Badge>
                      {slaBreached(d) && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> SLA breach
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">dispatch: {d.id}</div>
                  {d.boardroom_item_id && (
                    <div className="text-xs font-mono text-muted-foreground">item: {d.boardroom_item_id}</div>
                  )}
                  {d.failure_reason && (
                    <div className="text-xs text-destructive">reason: {d.failure_reason}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminControlPlaneShell>
  );
}
