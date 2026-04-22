// ════════════════════════════════════════════════════════════════
// Phase 4 — Admin Review Surface
// Lists AI-drafted security policy proposals; admin approves/rejects.
// NEVER applies SQL automatically — admin must run approved SQL manually.
// ════════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { AITruthDisclosure } from "@/components/primitives/status/AITruthDisclosure";
import { OperatorActionPanel } from "@/components/primitives/actions/OperatorActionPanel";
import { formatTrustLabel } from "@/lib/trust-copy/trust-copy-map";
import {
  riskTone,
  policyDraftStatusTone,
} from "@/components/admin/ai-runtime/_shared/status-tone-maps";
import { ShieldAlert, FileWarning, KeyRound, CheckCircle2, XCircle, RefreshCw, Play, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type DraftStatus = "pending_review" | "approved" | "rejected" | "changes_requested" | "archived" | "applied_externally";

interface PolicyDraft {
  id: string;
  agent_id: string;
  draft_kind: "rls_policy" | "secret_rotation" | "role_grant_review" | "column_grant_review";
  target_resource: string;
  target_schema: string;
  title: string;
  rationale: string;
  sql_preview: string;
  risk_assessment: "low" | "medium" | "high" | "critical";
  status: DraftStatus;
  reviewer_notes: string | null;
  created_at: string;
}

interface HealthSummary {
  total: number;
  pending_review: number;
  approved: number;
  rejected: number;
  changes_requested: number;
  critical_pending: number;
  by_kind: Record<string, number>;
  by_risk: Record<string, number>;
}

const KIND_ICON: Record<string, typeof FileWarning> = {
  rls_policy: ShieldAlert,
  secret_rotation: KeyRound,
  role_grant_review: FileWarning,
  column_grant_review: FileWarning,
};

// Risk + status tones now flow through canonical StatusBadge + status-tone-maps.

export default function PolicyDraftReviewBoard() {
  const [drafts, setDrafts] = useState<PolicyDraft[]>([]);
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<DraftStatus>("pending_review");
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const [{ data: d }, { data: h }] = await Promise.all([
      supabase
        .from("internal_agent_policy_drafts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.rpc("summarize_policy_draft_health"),
    ]);
    setDrafts((d ?? []) as PolicyDraft[]);
    setHealth((h as unknown as HealthSummary) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function runScan() {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("internal-agent-policy-architect", { body: {} });
      if (error) throw error;
      toast.success(`Scan complete: ${data?.new_drafts_inserted ?? 0} new drafts`);
      await load();
    } catch (e) {
      toast.error(`Scan failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setScanning(false);
    }
  }

  async function decide(id: string, action: "approved" | "rejected" | "requested_changes" | "archived" | "applied_externally") {
    try {
      const { error } = await supabase.rpc("record_policy_draft_decision", {
        _draft_id: id,
        _action: action,
        _notes: notes[id] ?? null,
        _evidence: {},
      });
      if (error) throw error;
      toast.success(`Marked as ${action}`);
      setNotes((n) => ({ ...n, [id]: "" }));
      await load();
    } catch (e) {
      toast.error(`Decision failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const filtered = drafts.filter((d) => d.status === activeTab);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Policy Draft Review Board
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-drafted security proposals (RLS, secret rotation). Never auto-applied — admin approval required.
          </p>
          <div className="mt-2">
            <AITruthDisclosure
              mode={drafts.length > 0 ? "structural" : "structural"}
              label={formatTrustLabel("ai", "structural")}
            />
          </div>
        </div>
        <OperatorActionPanel
          ariaLabel="Policy Draft actions"
          primary={{
            label: scanning ? "Scanning…" : "Run Architect Scan",
            icon: scanning ? RefreshCw : Play,
            onClick: runScan,
            disabled: scanning,
          }}
          next={[
            { label: "Refresh", icon: RefreshCw, onClick: () => void load(), disabled: loading },
          ]}
        />
      </div>

      {health && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="pt-6"><div className="text-xs text-muted-foreground">Total drafts</div>
              <div className="text-2xl font-bold">{health.total}</div></CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6"><div className="text-xs text-muted-foreground">Pending review</div>
              <div className="text-2xl font-bold text-warning">{health.pending_review}</div></CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6"><div className="text-xs text-muted-foreground">Approved</div>
              <div className="text-2xl font-bold text-success">{health.approved}</div></CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6"><div className="text-xs text-muted-foreground">Rejected</div>
              <div className="text-2xl font-bold text-destructive">{health.rejected}</div></CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
              <div><div className="text-xs text-muted-foreground">Critical pending</div>
                <div className="text-2xl font-bold text-destructive">{health.critical_pending}</div></div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DraftStatus)}>
        <TabsList>
          <TabsTrigger value="pending_review">Pending</TabsTrigger>
          <TabsTrigger value="changes_requested">Changes</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="applied_externally">Applied</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-4">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <EmptyState
              icon={<FileWarning className="h-5 w-5" />}
              title="No drafts in this state"
              description="Policy drafts queued by the security architect will surface here for review and approval."
            />
          )}
          {filtered.map((draft) => {
            const Icon = KIND_ICON[draft.draft_kind] ?? FileWarning;
            return (
              <Card key={draft.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <CardTitle className="text-base">{draft.title}</CardTitle>
                        <div className="text-xs text-muted-foreground mt-1">
                          {draft.target_schema}.{draft.target_resource} · {new Date(draft.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone="muted" size="xs">{draft.draft_kind.replace(/_/g, " ")}</StatusBadge>
                      <StatusBadge tone={riskTone(draft.risk_assessment)} size="xs">{draft.risk_assessment}</StatusBadge>
                      <StatusBadge tone={policyDraftStatusTone(draft.status)} size="xs">{draft.status.replace(/_/g, " ")}</StatusBadge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{draft.rationale}</p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {draft.sql_preview}
                  </pre>
                  {draft.reviewer_notes && (
                    <div className="text-xs text-muted-foreground border-l-2 border-border pl-3">
                      <span className="font-semibold">Notes:</span> {draft.reviewer_notes}
                    </div>
                  )}
                  {draft.status === "pending_review" && (
                    <>
                      <Textarea
                        placeholder="Reviewer notes (optional)…"
                        value={notes[draft.id] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [draft.id]: e.target.value }))}
                        className="text-xs"
                        rows={2}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => decide(draft.id, "approved")} className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => decide(draft.id, "requested_changes")}>
                          Request changes
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => decide(draft.id, "rejected")} className="gap-1">
                          <XCircle className="h-3 w-3" /> Reject
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => decide(draft.id, "archived")}>
                          Archive
                        </Button>
                      </div>
                    </>
                  )}
                  {draft.status === "approved" && (
                    <Button size="sm" variant="outline" onClick={() => decide(draft.id, "applied_externally")}>
                      Mark as applied externally
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
