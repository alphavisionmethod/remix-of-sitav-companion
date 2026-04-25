// ═══════════════════════════════════════════════════════════════
// Layer7FollowthroughBoard (admin)
// Operator visibility into Boardroom Layer 7 follow-through chains.
// Surfaces queues for stale dispatches, failed executions, missing
// outcomes, missing reflections, plus drilldown to the full chain.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { recordOutcome, closeFollowthrough } from "@/lib/services/boardroom/followthrough-engine";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Clock, CheckCircle2, RotateCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DispatchRow {
  id: string;
  user_id: string;
  boardroom_item_id: string;
  state: string;
  risk_tier: string;
  action_type: string;
  correlation_id: string;
  command_step_id: string | null;
  receipt_id: string | null;
  outcome_record_id: string | null;
  failure_reason: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

const STALE_MINUTES = 30;

export function Layer7FollowthroughBoard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DispatchRow[]>([]);
  const [acting, setActing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("boardroom_followthrough_dispatches")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);
    setRows((data ?? []) as DispatchRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("admin-layer7-board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "boardroom_followthrough_dispatches" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, []);

  const buckets = useMemo(() => {
    const cutoff = Date.now() - STALE_MINUTES * 60_000;
    const stale = rows.filter(
      (r) =>
        ["dispatch_pending", "dispatched", "executing", "outcome_pending"].includes(r.state) &&
        new Date(r.updated_at).getTime() < cutoff,
    );
    const failed = rows.filter((r) => r.state === "failed");
    const missingProof = rows.filter(
      (r) => ["executed", "outcome_pending"].includes(r.state) && !r.receipt_id,
    );
    const missingOutcome = rows.filter(
      (r) => ["executed", "receipt_recorded"].includes(r.state) && !r.outcome_record_id,
    );
    const missingReflection = rows.filter((r) => r.state === "outcome_tracked");
    const closed = rows.filter((r) => r.state === "closed" || r.state === "reflected");
    return { stale, failed, missingProof, missingOutcome, missingReflection, closed, all: rows };
  }, [rows]);

  const retryDispatch = async (row: DispatchRow) => {
    setActing(row.id);
    try {
      const { error } = await supabase.functions.invoke("boardroom-followthrough-dispatch", {
        body: {
          boardroom_item_id: row.boardroom_item_id,
          action_type: row.action_type,
          action_payload: {},
          risk_tier: row.risk_tier,
          metadata: { retry_of: row.id },
        },
      });
      if (error) throw new Error(error.message);
      toast({ title: "Retry dispatched" });
    } catch (e) {
      toast({ title: "Retry failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const markOutcome = async (row: DispatchRow, status: "success" | "partial" | "failed") => {
    setActing(row.id);
    try {
      await recordOutcome({
        dispatchId: row.id,
        outcomeStatus: status,
        actualOutcome: `Marked ${status} by operator`,
        verificationSource: "operator",
        confidence: 0.7,
      });
      toast({ title: `Outcome marked ${status}` });
    } catch (e) {
      toast({ title: "Mark failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  const forceClose = async (row: DispatchRow) => {
    setActing(row.id);
    try {
      await closeFollowthrough(row.id);
      toast({ title: "Closed" });
    } catch (e) {
      toast({ title: "Close failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="layer7-followthrough-board">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Boardroom Layer 7 — Follow-through queue</CardTitle>
          <div className="flex gap-2">
            <Stat label="Stale" value={buckets.stale.length} tone="warn" />
            <Stat label="Failed" value={buckets.failed.length} tone="bad" />
            <Stat label="Missing outcome" value={buckets.missingOutcome.length} tone="warn" />
            <Stat label="Closed" value={buckets.closed.length} tone="good" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stale">
            <TabsList>
              <TabsTrigger value="stale">Stale ({buckets.stale.length})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({buckets.failed.length})</TabsTrigger>
              <TabsTrigger value="missing-proof">No proof ({buckets.missingProof.length})</TabsTrigger>
              <TabsTrigger value="missing-outcome">
                No outcome ({buckets.missingOutcome.length})
              </TabsTrigger>
              <TabsTrigger value="missing-reflection">
                No reflection ({buckets.missingReflection.length})
              </TabsTrigger>
              <TabsTrigger value="all">All ({buckets.all.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="stale">
              <RowList
                rows={buckets.stale}
                acting={acting}
                onRetry={retryDispatch}
                onForceClose={forceClose}
                onMarkOutcome={markOutcome}
                emptyHint="No stale dispatches. Queue is healthy."
              />
            </TabsContent>
            <TabsContent value="failed">
              <RowList
                rows={buckets.failed}
                acting={acting}
                onRetry={retryDispatch}
                onForceClose={forceClose}
                onMarkOutcome={markOutcome}
                emptyHint="No failures."
              />
            </TabsContent>
            <TabsContent value="missing-proof">
              <RowList
                rows={buckets.missingProof}
                acting={acting}
                onRetry={retryDispatch}
                onForceClose={forceClose}
                onMarkOutcome={markOutcome}
                emptyHint="All executed dispatches have proof."
              />
            </TabsContent>
            <TabsContent value="missing-outcome">
              <RowList
                rows={buckets.missingOutcome}
                acting={acting}
                onRetry={retryDispatch}
                onForceClose={forceClose}
                onMarkOutcome={markOutcome}
                emptyHint="All executed dispatches have outcome records."
              />
            </TabsContent>
            <TabsContent value="missing-reflection">
              <RowList
                rows={buckets.missingReflection}
                acting={acting}
                onRetry={retryDispatch}
                onForceClose={forceClose}
                onMarkOutcome={markOutcome}
                emptyHint="All outcomes have reflections."
              />
            </TabsContent>
            <TabsContent value="all">
              <RowList
                rows={buckets.all}
                acting={acting}
                onRetry={retryDispatch}
                onForceClose={forceClose}
                onMarkOutcome={markOutcome}
                emptyHint="No dispatches yet."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "warn" | "bad";
}) {
  const cls =
    tone === "good"
      ? "bg-primary/10 text-primary"
      : tone === "warn"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-destructive/10 text-destructive";
  return (
    <div className={`px-3 py-1 rounded-md text-xs font-medium ${cls}`}>
      {label}: {value}
    </div>
  );
}

function RowList({
  rows,
  acting,
  onRetry,
  onForceClose,
  onMarkOutcome,
  emptyHint,
}: {
  rows: DispatchRow[];
  acting: string | null;
  onRetry: (r: DispatchRow) => void;
  onForceClose: (r: DispatchRow) => void;
  onMarkOutcome: (r: DispatchRow, s: "success" | "partial" | "failed") => void;
  emptyHint: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <CheckCircle2 className="h-6 w-6 text-primary" />
        {emptyHint}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={r.id}
          className="border rounded-md p-3 flex flex-col md:flex-row md:items-center gap-3"
          data-testid={`l7-row-${r.id}`}
        >
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={r.state === "failed" ? "destructive" : "secondary"}>
                {r.state}
              </Badge>
              <Badge variant="outline">{r.risk_tier}</Badge>
              <span className="text-xs text-muted-foreground">{r.action_type}</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono truncate">
              item={r.boardroom_item_id.slice(0, 8)} · cor={r.correlation_id.slice(0, 16)}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-3">
              <Clock className="h-3 w-3" />
              updated {formatDistanceToNow(new Date(r.updated_at))} ago
              {r.failure_reason && (
                <span className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {r.failure_reason}
                </span>
              )}
              {r.retry_count > 0 && <span>retries={r.retry_count}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(r.state === "failed" || r.state === "dispatch_pending") && (
              <Button
                size="sm"
                variant="outline"
                disabled={acting === r.id}
                onClick={() => onRetry(r)}
              >
                <RotateCw className="h-3 w-3 mr-1" /> Retry
              </Button>
            )}
            {(r.state === "executed" || r.state === "receipt_recorded" || r.state === "outcome_pending") && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  disabled={acting === r.id}
                  onClick={() => onMarkOutcome(r, "success")}
                >
                  Mark success
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={acting === r.id}
                  onClick={() => onMarkOutcome(r, "partial")}
                >
                  Partial
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={acting === r.id}
                  onClick={() => onMarkOutcome(r, "failed")}
                >
                  Failed
                </Button>
              </>
            )}
            {r.state !== "closed" && (
              <Button
                size="sm"
                variant="ghost"
                disabled={acting === r.id}
                onClick={() => onForceClose(r)}
              >
                Force close
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
