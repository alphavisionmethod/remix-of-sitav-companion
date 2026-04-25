// ═══════════════════════════════════════════════════════════════
// BoardroomFollowthroughPanel
// Calm, premium chain visualization for a single Boardroom item.
// Shows: approved → dispatched → executed → outcome → reflected.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBoardroomFollowthrough } from "@/lib/hooks/boardroom/useBoardroomFollowthrough";
import { useDispatchBoardroomAction } from "@/lib/hooks/boardroom/useDispatchBoardroomAction";
import { BoardroomReflectionPrompt } from "./BoardroomReflectionPrompt";
import type { FollowthroughState } from "@/lib/services/boardroom/followthrough-engine";

interface Props {
  itemId: string | null;
  itemTitle?: string;
  recommendationId?: string;
  approvalQueueId?: string;
  defaultActionType?: string;
  defaultActionPayload?: Record<string, unknown>;
  defaultAdvisorId?: string;
}

const STAGES: { key: FollowthroughState; label: string }[] = [
  { key: "approved", label: "Approved" },
  { key: "dispatched", label: "Dispatched" },
  { key: "executing", label: "Executing" },
  { key: "executed", label: "Executed" },
  { key: "receipt_recorded", label: "Receipt" },
  { key: "outcome_tracked", label: "Outcome" },
  { key: "reflected", label: "Reflected" },
  { key: "closed", label: "Closed" },
];

const STATE_ORDER: Record<FollowthroughState, number> = {
  none: -1,
  approved: 0,
  dispatch_pending: 0,
  dispatched: 1,
  executing: 2,
  executed: 3,
  receipt_recorded: 4,
  outcome_pending: 4,
  outcome_tracked: 5,
  reflected: 6,
  closed: 7,
  failed: -2,
};

export function BoardroomFollowthroughPanel({
  itemId,
  itemTitle,
  recommendationId,
  approvalQueueId,
  defaultActionType = "acknowledge",
  defaultActionPayload = {},
  defaultAdvisorId = "boardroom",
}: Props) {
  const chain = useBoardroomFollowthrough(itemId);
  const { dispatch, pending, error: dispatchError } = useDispatchBoardroomAction();

  const currentIndex = useMemo(() => STATE_ORDER[chain.state] ?? -1, [chain.state]);
  const isFailed = chain.state === "failed";
  const canDispatch = !!itemId && (chain.state === "none" || chain.state === "approved");
  const canReflect = chain.state === "outcome_tracked";

  if (chain.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow-through</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="boardroom-followthrough-panel">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Follow-through</CardTitle>
          {itemTitle && <p className="text-sm text-muted-foreground mt-1">{itemTitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <StateBadge state={chain.state} />
          <Button variant="ghost" size="icon" onClick={() => void chain.refresh()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stage rail */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {STAGES.map((stage, idx) => {
            const reached = currentIndex >= idx;
            const active = currentIndex === idx;
            return (
              <div key={stage.key} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                    reached
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                    active && "ring-2 ring-primary/40",
                  )}
                  data-testid={`followthrough-stage-${stage.key}`}
                  data-reached={reached}
                  data-active={active}
                >
                  {reached ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  {stage.label}
                </div>
                {idx < STAGES.length - 1 && (
                  <span className="text-muted-foreground text-xs">›</span>
                )}
              </div>
            );
          })}
        </div>

        {isFailed && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Failed.</strong> {chain.failureReason ?? "Unknown error"}.
            </div>
          </div>
        )}

        {dispatchError && (
          <div className="text-sm text-destructive">Dispatch error: {dispatchError}</div>
        )}

        {canDispatch && (
          <Button
            disabled={pending}
            onClick={() =>
              void dispatch({
                boardroomItemId: itemId!,
                recommendationId,
                approvalQueueId,
                actionType: defaultActionType,
                actionPayload: defaultActionPayload,
              })
            }
            data-testid="followthrough-dispatch-btn"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Dispatching…
              </>
            ) : (
              "Dispatch approved action"
            )}
          </Button>
        )}

        {chain.dispatch && (
          <div className="space-y-2 text-sm">
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Dispatch ID" value={chain.dispatch.id.slice(0, 8)} mono />
              <Field label="Risk tier" value={chain.dispatch.risk_tier} />
              <Field label="Action" value={chain.dispatch.action_type} />
              <Field
                label="Correlation"
                value={chain.dispatch.correlation_id.slice(0, 16)}
                mono
              />
              {chain.dispatch.command_step_id && (
                <Field
                  label="Command step"
                  value={chain.dispatch.command_step_id.slice(0, 8)}
                  mono
                />
              )}
              {chain.dispatch.receipt_id && (
                <Field
                  label="Receipt"
                  value={chain.dispatch.receipt_id.slice(0, 8)}
                  mono
                />
              )}
            </div>
          </div>
        )}

        {chain.outcome && (
          <div className="rounded-md border p-3 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Outcome</h4>
              <OutcomeBadge status={chain.outcome.outcome_status} />
            </div>
            <p className="text-sm text-muted-foreground">{chain.outcome.actual_outcome}</p>
            <p className="text-xs text-muted-foreground">
              Confidence {(chain.outcome.confidence * 100).toFixed(0)}% · Source{" "}
              {chain.outcome.verification_source}
            </p>
          </div>
        )}

        {chain.reflection && (
          <div className="rounded-md border p-3 space-y-1">
            <h4 className="text-sm font-medium">Reflection · {chain.reflection.advisor_id}</h4>
            <p className="text-sm">Action: {chain.reflection.owner_action}</p>
            {chain.reflection.lesson_learned && (
              <p className="text-sm text-muted-foreground">
                Lesson: {chain.reflection.lesson_learned}
              </p>
            )}
          </div>
        )}

        {canReflect && chain.dispatch && (
          <BoardroomReflectionPrompt
            dispatchId={chain.dispatch.id}
            advisorId={defaultAdvisorId}
            onComplete={() => void chain.refresh()}
          />
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("text-sm", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function StateBadge({ state }: { state: FollowthroughState }) {
  const variant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    closed: "default",
    reflected: "default",
    outcome_tracked: "default",
    failed: "destructive",
    none: "outline",
  };
  return (
    <Badge variant={variant[state] ?? "secondary"} data-testid="followthrough-state">
      {state.replace(/_/g, " ")}
    </Badge>
  );
}

function OutcomeBadge({ status }: { status: string }) {
  const v: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    success: "default",
    partial: "secondary",
    failed: "destructive",
    rolled_back: "destructive",
    pending: "outline",
  };
  return <Badge variant={v[status] ?? "secondary"}>{status}</Badge>;
}
