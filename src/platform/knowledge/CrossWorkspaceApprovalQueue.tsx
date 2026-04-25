// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 10 <CrossWorkspaceApprovalQueue>
// Admin / operator surface to triage pending cross-workspace
// approvals. Approve / reject / cancel with notes.
// Class: COMPOSITE.
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  XCircle,
  Ban,
  ShieldCheck,
  Network,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useCrossWorkspaceApprovals,
  useDecideCrossWorkspaceApproval,
} from "./use-cross-workspace-approvals";
import type {
  ApprovalStatus,
  CrossWorkspaceApprovalRow,
} from "./cross-workspace-approval-service";

const STATUS_TABS: { value: ApprovalStatus | "all"; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "executed", label: "Executed" },
  { value: "all", label: "All" },
];

const ACTION_LABEL: Record<string, string> = {
  promote_memory: "Promote memory",
  share_chunk: "Share chunk",
  grant_voice: "Grant voice",
  elevate_sensitivity: "Elevate sensitivity",
  custom: "Custom action",
};

const SENSITIVITY_BADGE: Record<string, string> = {
  public: "bg-emerald-500/15 text-emerald-300",
  internal: "bg-blue-500/15 text-blue-300",
  confidential: "bg-amber-500/15 text-amber-300",
  restricted: "bg-destructive/20 text-destructive",
};

function shortId(id: string | null | undefined) {
  if (!id) return "—";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function ApprovalRow({ row }: { row: CrossWorkspaceApprovalRow }) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<null | "approved" | "rejected" | "cancelled" | "executed">(null);
  const decide = useDecideCrossWorkspaceApproval();

  const isPending = row.status === "pending";

  async function handle(decision: "approved" | "rejected" | "cancelled" | "executed") {
    setBusy(decision);
    try {
      await decide.mutateAsync({
        approvalId: row.id,
        decision,
        notes: notes.trim() ? notes.trim() : null,
      });
      toast.success(`Approval ${decision}.`);
      setNotes("");
    } catch (err) {
      toast.error(`Failed: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2 rounded border border-border/40 bg-muted/10 p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-medium">
          {ACTION_LABEL[row.action_kind] ?? row.action_kind}
        </Badge>
        <Badge
          variant="outline"
          className={cn("text-[10px] uppercase", SENSITIVITY_BADGE[row.sensitivity] ?? "")}
        >
          {row.sensitivity}
        </Badge>
        <Badge variant="outline" className="text-[10px] uppercase">
          {row.status}
        </Badge>
        {row.federation_id && (
          <Badge variant="outline" className="gap-1 text-[10px]">
            <Network className="h-3 w-3" />
            fed {shortId(row.federation_id)}
          </Badge>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {new Date(row.created_at).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
        <div>
          <span className="text-foreground/70">From workspace</span>:{" "}
          {shortId(row.requester_workspace_id)}
        </div>
        <div>
          <span className="text-foreground/70">To workspace</span>:{" "}
          {shortId(row.target_workspace_id)}
        </div>
        <div className="col-span-2">
          <span className="text-foreground/70">Expires</span>:{" "}
          {new Date(row.expires_at).toLocaleString()}
        </div>
      </div>

      {row.rationale && (
        <p className="rounded border border-border/30 bg-background/40 p-2 text-[11px] italic text-muted-foreground">
          “{row.rationale}”
        </p>
      )}

      {row.decision_notes && !isPending && (
        <p className="rounded border border-border/30 bg-background/40 p-2 text-[11px]">
          <span className="font-medium">Decision notes:</span> {row.decision_notes}
        </p>
      )}

      {isPending && (
        <div className="space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Decision notes (optional)…"
            rows={2}
            className="text-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="default"
              disabled={busy !== null}
              onClick={() => handle("approved")}
              className="gap-1"
            >
              {busy === "approved" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy !== null}
              onClick={() => handle("rejected")}
              className="gap-1"
            >
              {busy === "rejected" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              Reject
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy !== null}
              onClick={() => handle("cancelled")}
              className="gap-1"
            >
              {busy === "cancelled" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Ban className="h-3 w-3" />
              )}
              Cancel
            </Button>
          </div>
        </div>
      )}

      {row.status === "approved" && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={() => handle("executed")}
          className="gap-1"
        >
          {busy === "executed" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ShieldCheck className="h-3 w-3" />
          )}
          Mark executed
        </Button>
      )}
    </div>
  );
}

export interface CrossWorkspaceApprovalQueueProps {
  className?: string;
  defaultStatus?: ApprovalStatus | "all";
}

export function CrossWorkspaceApprovalQueue({
  className,
  defaultStatus = "pending",
}: CrossWorkspaceApprovalQueueProps) {
  const [status, setStatus] = useState<ApprovalStatus | "all">(defaultStatus);
  const q = useCrossWorkspaceApprovals(status);

  const rows = useMemo(() => q.data ?? [], [q.data]);

  return (
    <Card className={cn("border-border/50 bg-background/40 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Cross-workspace approvals
          <Badge variant="outline" className="ml-auto text-[10px]">
            {rows.length} {status}
          </Badge>
        </CardTitle>
        <CardDescription className="text-[11px]">
          Operator approval queue for actions that cross workspace boundaries
          (federated memory promotion, sensitivity elevation, etc).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={status} onValueChange={(v) => setStatus(v as ApprovalStatus | "all")}>
          <TabsList className="grid w-full grid-cols-5">
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-[11px]">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {q.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded border border-dashed border-border/40 p-6 text-center text-xs text-muted-foreground">
            No {status} approvals.
          </p>
        ) : (
          <ScrollArea className="max-h-[480px]">
            <div className="space-y-2 pr-2">
              {rows.map((r) => (
                <ApprovalRow key={r.id} row={r} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}