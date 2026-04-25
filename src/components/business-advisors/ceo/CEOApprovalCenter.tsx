// ═══════════════════════════════════════════════════════════════
// SITA OS — CEO Advisor Approval Center
//
// Spec enforcement (ceo-advisor.spec.ts §10, §22):
//   • CEO Advisor never sends external announcements, investor
//     updates, customer/employee/board comms, or cross-advisor
//     spend/scope commitments on its own.
//   • Every externally-facing output must route through the human
//     Approval Center BEFORE any operator decision is applied.
//
// This component:
//   1. Lets the operator queue a CEO-drafted externally-facing
//      output for human approval (writes to
//      ai_workforce_approval_queue with an evidence marker that
//      tags it as a CEO Advisor external send).
//   2. Lists every pending / decided CEO external send and lets
//      the reviewer approve / reject with comments — reusing the
//      existing approval mutation hooks (receipt + binding chain).
//
// All RLS-scoped per user. Empty-state honest. Semantic tokens.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, CheckCircle2, XCircle, Inbox, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useApprovalQueue,
  useApproveApprovalItem,
  useRejectApprovalItem,
} from "@/hooks/use-approval-queue-mutations";

const db = supabase as any;

const CEO_OUTPUT_KINDS = [
  { id: "investor_update", label: "Investor update" },
  { id: "board_brief", label: "Board brief" },
  { id: "customer_announcement", label: "Customer announcement" },
  { id: "employee_announcement", label: "Employee announcement" },
  { id: "press_communication", label: "Press communication" },
  { id: "strategic_shift", label: "Strategic shift commit" },
  { id: "cross_advisor_commit", label: "Cross-advisor commit (spend/scope)" },
] as const;

type CeoOutputKind = typeof CEO_OUTPUT_KINDS[number]["id"];

interface QueueRow {
  id: string;
  title: string;
  summary: string;
  status: string;
  priority: string;
  evidence_links: unknown;
  reviewer_comments: string | null;
  decision_at: string | null;
  created_at: string;
}

function isCeoExternalSend(row: QueueRow): boolean {
  const links = Array.isArray(row.evidence_links) ? (row.evidence_links as unknown[]) : [];
  return links.some((l) => {
    if (!l || typeof l !== "object") return false;
    const o = l as Record<string, unknown>;
    return o.source === "ceo-advisor" && o.externally_facing === true;
  });
}

export function CEOApprovalCenter() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useApprovalQueue();
  const approve = useApproveApprovalItem();
  const reject = useRejectApprovalItem();

  const [kind, setKind] = useState<CeoOutputKind>("investor_update");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});

  const ceoItems = useMemo<QueueRow[]>(
    () => (rows as QueueRow[]).filter(isCeoExternalSend),
    [rows],
  );

  const pending = ceoItems.filter((r) => r.status === "pending");
  const decided = ceoItems.filter((r) => r.status !== "pending").slice(0, 10);

  async function submitForApproval() {
    if (!title.trim() || !body.trim()) {
      toast.error("Add a title and the draft content before routing for approval.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        toast.error("Sign-in required to route an external send for approval.");
        return;
      }
      const kindLabel = CEO_OUTPUT_KINDS.find((k) => k.id === kind)?.label ?? kind;
      const { error } = await db.from("ai_workforce_approval_queue").insert({
        user_id: userId,
        title: `[CEO · ${kindLabel}] ${title.trim()}`,
        summary: body.trim(),
        priority: kind === "strategic_shift" ? "high" : "normal",
        status: "pending",
        evidence_links: [
          {
            source: "ceo-advisor",
            externally_facing: true,
            output_kind: kind,
            audience: audience.trim() || "(not specified)",
            authority_ceiling: "L2-recommend",
            spec_section:
              "ceo-advisor.spec.ts §10 disallowedAutonomousActions / §22 hardBoundaries",
            drafted_at: new Date().toISOString(),
          },
        ],
        launch_implications:
          "External send — must not transmit until human approval is granted.",
      });
      if (error) throw error;
      toast.success("Routed to Approval Center — waiting on human review.");
      setTitle("");
      setBody("");
      setAudience("");
      qc.invalidateQueries({ queryKey: ["approval-queue"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to route for approval.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
          CEO Approval Center — externally-facing outputs
        </CardTitle>
        <CardDescription>
          Every CEO Advisor output that touches stakeholders outside the operator (investors, board, customers, employees, press) or commits cross-advisor spend/scope is routed here for human approval before any operator decision is applied.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Submission form */}
        <div className="rounded-md border border-border bg-muted/20 p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Route a new external send for approval
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="ceo-ac-kind">Output kind</Label>
              <select
                id="ceo-ac-kind"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={kind}
                onChange={(e) => setKind(e.target.value as CeoOutputKind)}
                disabled={submitting}
              >
                {CEO_OUTPUT_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="ceo-ac-audience">Audience</Label>
              <Input
                id="ceo-ac-audience"
                placeholder="e.g. Series A investors, all-hands, top-50 customers"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ceo-ac-title">Title</Label>
              <Input
                id="ceo-ac-title"
                placeholder="Short headline for the reviewer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ceo-ac-body">Draft content</Label>
              <Textarea
                id="ceo-ac-body"
                rows={4}
                placeholder="Paste the full draft the CEO Advisor produced. Reviewer sees the exact text that would be sent."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Routes through the same approval queue used for every gated AI action.
            </p>
            <Button onClick={submitForApproval} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Routing…</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Route for approval</>
              )}
            </Button>
          </div>
        </div>

        <Alert>
          <AlertTitle className="text-xs">No external transmission until approved</AlertTitle>
          <AlertDescription className="text-xs">
            Routing only stages the draft for review. The operator decision is applied — and any external send happens — only after explicit human approval on this queue.
          </AlertDescription>
        </Alert>

        {/* Pending queue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Inbox className="inline h-3.5 w-3.5 mr-1" /> Pending review ({pending.length})
            </p>
          </div>
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No CEO Advisor external sends are waiting for review.
            </p>
          ) : (
            <ScrollArea className="max-h-[380px]">
              <div className="space-y-2 pr-2">
                {pending.map((row) => {
                  const links = Array.isArray(row.evidence_links) ? row.evidence_links : [];
                  const meta = (links[0] ?? {}) as Record<string, unknown>;
                  return (
                    <div
                      key={row.id}
                      className="rounded-md border border-border bg-background p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{row.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {String(meta.output_kind ?? "—")} · audience: {String(meta.audience ?? "—")}
                          </p>
                        </div>
                        <Badge variant={row.priority === "high" ? "destructive" : "outline"} className="text-[10px]">
                          {row.priority}
                        </Badge>
                      </div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {row.summary}
                      </p>
                      <Textarea
                        rows={2}
                        placeholder="Reviewer comments (optional, recorded on the receipt)"
                        value={reviewComments[row.id] ?? ""}
                        onChange={(e) => setReviewComments((p) => ({ ...p, [row.id]: e.target.value }))}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reject.mutate({ id: row.id, reason: reviewComments[row.id] })}
                          disabled={reject.isPending || approve.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approve.mutate({ id: row.id, reason: reviewComments[row.id] })}
                          disabled={reject.isPending || approve.isPending}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve & release
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Recent decisions */}
        {decided.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Recent decisions ({decided.length})
            </p>
            <div className="space-y-1.5">
              {decided.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{row.title}</p>
                    {row.reviewer_comments && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        “{row.reviewer_comments}”
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={row.status === "approved" ? "default" : row.status === "rejected" ? "destructive" : "outline"}
                    className="text-[10px] capitalize"
                  >
                    {row.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}