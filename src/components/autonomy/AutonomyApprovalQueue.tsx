// ═══════════════════════════════════════════════════════════════
// SITA OS — Just-In-Time Approval Queue (Phase 5)
// Owner-facing surface for reviewing reversible plans the
// controllers have proposed but cannot auto-execute (queued under
// the L3 ceiling). Approve → mark approved + executed; Reject →
// mark rejected; the plan's stored rollback runs on rejection if
// the action was already executed (rare under L3).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type QueueRow = {
  id: string;
  advisor_id: string;
  domain: string;
  action_type: string;
  summary: string;
  confidence: number;
  status: string;
  created_at: string;
  payload: Record<string, unknown> | null;
};

type Props = {
  /** Optional advisor filter; if omitted, shows all awaiting approval. */
  advisorId?: string;
  /** Compact = no header card chrome. */
  compact?: boolean;
};

export function AutonomyApprovalQueue({ advisorId, compact = false }: Props) {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("advisor_action_queue")
      .select("id, advisor_id, domain, action_type, summary, confidence, status, created_at, payload")
      .in("status", ["awaiting_approval"])
      .order("created_at", { ascending: false })
      .limit(50);
    if (advisorId) q = q.eq("advisor_id", advisorId);
    const { data, error } = await q;
    if (error) toast.error(`Failed to load queue: ${error.message}`);
    setRows((data as QueueRow[]) ?? []);
    setLoading(false);
  }, [advisorId]);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel("autonomy-queue-jit")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "advisor_action_queue" },
        () => void load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const approve = async (row: QueueRow) => {
    setBusyId(row.id);
    const { data: userData } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("advisor_action_queue")
      .update({
        status: "executed",
        approved_at: now,
        approved_by: userData.user?.id ?? null,
        executed_at: now,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) toast.error(`Approve failed: ${error.message}`);
    else {
      toast.success(`Approved ${row.action_type}`);
      void load();
    }
  };

  const reject = async (row: QueueRow) => {
    setBusyId(row.id);
    const { error } = await supabase
      .from("advisor_action_queue")
      .update({
        status: "rejected",
        error_message: "Owner rejected via JIT approval queue",
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) toast.error(`Reject failed: ${error.message}`);
    else {
      toast.success(`Rejected ${row.action_type}`);
      void load();
    }
  };

  const list = (
    <ScrollArea className="h-[480px]">
      <div className="space-y-2 pr-3">
        {loading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}
        {!loading && rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 p-6 text-center text-sm text-muted-foreground">
            <ShieldCheck className="mx-auto mb-2 h-6 w-6 opacity-60" />
            No actions waiting on you. Advisors will queue items here when they need approval.
          </div>
        )}
        {!loading &&
          rows.map((row) => {
            const payload = (row.payload ?? {}) as {
              risk_class?: string;
              draft_only?: boolean;
              is_client_facing?: boolean;
              financial_impact_cents?: number;
              dry_run_reason?: string;
              signal_kind?: string;
            };
            const riskTone =
              payload.risk_class === "irreversible"
                ? "destructive"
                : payload.risk_class === "reversible_risky"
                ? "default"
                : "secondary";
            return (
              <Card key={row.id} className="border-border/60">
                <CardContent className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {row.advisor_id}
                        </span>
                        <Badge variant={riskTone as "default" | "secondary" | "destructive"} className="text-[10px]">
                          {payload.risk_class ?? "unknown"}
                        </Badge>
                        {payload.draft_only && (
                          <Badge variant="outline" className="text-[10px]">
                            draft only
                          </Badge>
                        )}
                        {payload.is_client_facing && (
                          <Badge variant="outline" className="text-[10px] border-warning/60 text-warning">
                            <AlertTriangle className="mr-1 h-3 w-3" /> client-facing
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium leading-snug">{row.summary}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {timeAgo(row.created_at)}
                        </span>
                        <span>conf {(row.confidence * 100).toFixed(0)}%</span>
                        {typeof payload.financial_impact_cents === "number" && payload.financial_impact_cents > 0 && (
                          <span>${(payload.financial_impact_cents / 100).toFixed(2)}</span>
                        )}
                        {payload.dry_run_reason && (
                          <span className="truncate">{payload.dry_run_reason}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={busyId === row.id}
                        onClick={() => void approve(row)}
                        className="h-8"
                      >
                        <Check className="mr-1 h-3 w-3" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === row.id}
                        onClick={() => void reject(row)}
                        className="h-8"
                      >
                        <X className="mr-1 h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </ScrollArea>
  );

  if (compact) return list;

  return (
    <Card className={cn("border-border/60")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Approvals waiting on you</CardTitle>
          <Badge variant="secondary">{rows.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>{list}</CardContent>
    </Card>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}