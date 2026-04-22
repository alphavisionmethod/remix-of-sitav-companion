// ═══════════════════════════════════════════════════════════════
// Phase 6 — Cross-Council Coordination Board
// Unified admin surface for: consensus sessions, cost proposals, self-healing runbooks.
// L3 hard ceiling visualized; never offers an "auto-apply" path for cost proposals.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Users2, DollarSign, Wrench, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/sita/EmptyState";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import { AITruthDisclosure } from "@/components/primitives/status/AITruthDisclosure";
import { OperatorActionPanel } from "@/components/primitives/actions/OperatorActionPanel";
import { outcomeTone, riskTone, policyDraftStatusTone } from "@/components/admin/ai-runtime/_shared/status-tone-maps";

interface ConsensusSession {
  id: string;
  session_key: string;
  topic: string;
  initiating_agent_id: string;
  participating_councils: string[];
  participating_agent_ids: string[];
  quorum_required: number;
  action_class: string;
  proposed_autonomy_level: number;
  effective_autonomy_level: number;
  ceiling_capped: boolean;
  status: string;
  conflict_detected: boolean;
  resolution_summary: string | null;
  created_at: string;
}

interface CostProposal {
  id: string;
  proposal_key: string;
  proposing_agent_id: string;
  proposal_type: string;
  scope: string;
  target_capability: string | null;
  estimated_monthly_savings_usd: number;
  estimated_quality_delta: number;
  rationale: string;
  risk_assessment: string;
  status: string;
  decision_notes: string | null;
  created_at: string;
}

interface RunbookExecution {
  id: string;
  execution_key: string;
  agent_id: string;
  runbook_id: string;
  trigger_reason: string;
  autonomy_level_used: number;
  ceiling_capped: boolean;
  outcome_status: string;
  outcome_summary: string | null;
  duration_ms: number | null;
  started_at: string;
}

export default function CrossCouncilBoard() {
  const [sessions, setSessions] = useState<ConsensusSession[]>([]);
  const [proposals, setProposals] = useState<CostProposal[]>([]);
  const [executions, setExecutions] = useState<RunbookExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, p, e] = await Promise.all([
        supabase
          .from("internal_agent_consensus_sessions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("internal_agent_cost_proposals")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("internal_agent_runbook_executions")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(50),
      ]);
      if (s.data) setSessions(s.data as ConsensusSession[]);
      if (p.data) setProposals(p.data as CostProposal[]);
      if (e.data) setExecutions(e.data as RunbookExecution[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "load failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function runCostOptimizer() {
    setRunning("cost");
    try {
      const { data, error } = await supabase.functions.invoke("internal-agent-cost-optimizer", {
        body: { lookback_days: 30 },
      });
      if (error) throw error;
      toast.success(`Drafted ${data?.proposals_drafted ?? 0} proposal(s) — all pending human review`);
      await loadAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "run failed";
      toast.error(msg);
    } finally {
      setRunning(null);
    }
  }

  async function decideProposal(id: string, status: "approved_for_manual_apply" | "rejected") {
    try {
      const { error } = await supabase
        .from("internal_agent_cost_proposals")
        .update({ status, decided_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success(status === "approved_for_manual_apply" ? "Approved for manual apply" : "Rejected");
      await loadAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "update failed";
      toast.error(msg);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cross-Council Coordination</h1>
          <p className="text-muted-foreground mt-1">
            Phase 6 — multi-agent consensus, cost optimization drafts, and self-healing runbook executions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AITruthDisclosure mode="live-gateway" to="/admin/ai-runtime" />
          <Button onClick={loadAll} variant="outline" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>L3 hard ceiling enforced</AlertTitle>
        <AlertDescription>
          Cross-council actions, runbook executions, and cost proposals are all capped at autonomy L3.
          Anything above is automatically downgraded by the database RPC. Cost proposals never auto-apply.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="consensus" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consensus" className="gap-2">
            <Users2 className="h-4 w-4" /> Consensus ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="cost" className="gap-2">
            <DollarSign className="h-4 w-4" /> Cost Proposals ({proposals.length})
          </TabsTrigger>
          <TabsTrigger value="healing" className="gap-2">
            <Wrench className="h-4 w-4" /> Self-Healing ({executions.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Consensus Sessions ─────────────────────────────── */}
        <TabsContent value="consensus" className="space-y-3">
          {sessions.length === 0 && !loading && (
            <Card>
              <CardContent className="py-6 space-y-3">
                <EmptyState
                  icon={<Users2 className="h-5 w-5" />}
                  title="No consensus sessions in flight"
                  description="Sessions open automatically when agents from multiple councils need to align on a shared decision. Quorum, action class, and effective autonomy are recorded for each session."
                />
                <OperatorActionPanel
                  next={[{ label: "Open Internal Agents", href: "/admin/ai-runtime?tab=internal-agents" }]}
                  evidence={[{ label: "Open Trust Ladder", href: "/admin/ai-runtime?tab=trust-ladder" }]}
                />
              </CardContent>
            </Card>
          )}
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{s.topic}</CardTitle>
                    <CardDescription>
                      Initiated by <span className="font-mono">{s.initiating_agent_id}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge tone={outcomeTone(s.status)} size="sm">
                      {s.status}
                    </StatusBadge>
                    {s.conflict_detected && <StatusBadge tone="danger" size="sm" icon={<AlertTriangle className="h-3 w-3" />}>conflict</StatusBadge>}
                    {s.ceiling_capped && <StatusBadge tone="warning" size="sm">capped → L{s.effective_autonomy_level}</StatusBadge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-1">
                  {s.participating_councils.map((c) => (
                    <StatusBadge key={c} tone="muted" size="xs">{c}</StatusBadge>
                  ))}
                </div>
                <div className="text-muted-foreground">
                  Quorum: <span className="font-medium text-foreground">{s.quorum_required}</span> · Action class:{" "}
                  <span className="font-mono text-foreground">{s.action_class}</span> · Proposed L{s.proposed_autonomy_level} → Effective L{s.effective_autonomy_level}
                </div>
                {s.resolution_summary && (
                  <div className="text-xs bg-muted/50 rounded p-2">{s.resolution_summary}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Cost Proposals ────────────────────────────────── */}
        <TabsContent value="cost" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              AI-drafted optimization proposals. <strong>Never auto-applied</strong> — admin reviews and applies manually.
            </p>
            <Button onClick={runCostOptimizer} disabled={running === "cost"}>
              {running === "cost" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Run cost optimizer
            </Button>
          </div>
          {proposals.length === 0 && !loading && (
            <Card>
              <CardContent className="py-6">
                <EmptyState
                  icon={<DollarSign className="h-5 w-5" />}
                  title="No cost proposals drafted"
                  description="The cost optimizer scans recent usage and drafts savings proposals here. Proposals never auto-apply — admins approve them for manual application via canonical config tooling."
                />
              </CardContent>
            </Card>
          )}
          {proposals.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base capitalize">
                      {p.proposal_type.replace(/_/g, " ")}
                      {p.target_capability && <span className="text-muted-foreground font-mono text-sm ml-2">{p.target_capability}</span>}
                    </CardTitle>
                    <CardDescription>by {p.proposing_agent_id} · scope: {p.scope}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge tone={policyDraftStatusTone(p.status)} size="sm">
                      {p.status.replace(/_/g, " ")}
                    </StatusBadge>
                    <StatusBadge tone={riskTone(p.risk_assessment)} size="sm">
                      risk: {p.risk_assessment}
                    </StatusBadge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{p.rationale}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-primary font-semibold">
                    ~${p.estimated_monthly_savings_usd.toFixed(2)}/mo savings
                  </span>
                  <span className="text-muted-foreground">
                    quality Δ: {(p.estimated_quality_delta * 100).toFixed(1)}%
                  </span>
                </div>
                {p.status === "draft_pending_review" && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => decideProposal(p.id, "approved_for_manual_apply")}>
                        Approve for manual apply
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decideProposal(p.id, "rejected")}>
                        Reject
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Approval marks this proposal for an admin to apply via canonical config tooling — it does not change any system state.
                    </p>
                  </>
                )}
                {p.decision_notes && <p className="text-xs italic text-muted-foreground">{p.decision_notes}</p>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Self-Healing Executions ───────────────────────── */}
        <TabsContent value="healing" className="space-y-3">
          {executions.length === 0 && !loading && (
            <Card>
              <CardContent className="py-6">
                <EmptyState
                  icon={<Wrench className="h-5 w-5" />}
                  title="No self-healing executions yet"
                  description="Bound agents appear here when they execute reversible runbook steps. Every run records the runbook ID, autonomy level used, and ceiling cap status."
                />
              </CardContent>
            </Card>
          )}
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3">
              {executions.map((e) => (
                <Card key={e.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-mono text-sm">{e.runbook_id}</CardTitle>
                        <CardDescription>
                          by {e.agent_id} · {new Date(e.started_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge tone={outcomeTone(e.outcome_status)} size="sm">
                          {e.outcome_status}
                        </StatusBadge>
                        <StatusBadge tone="muted" size="sm">L{e.autonomy_level_used}{e.ceiling_capped ? " (capped)" : ""}</StatusBadge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">Trigger:</span> {e.trigger_reason}</div>
                    {e.outcome_summary && <div className="text-muted-foreground">{e.outcome_summary}</div>}
                    {e.duration_ms != null && <div className="text-xs text-muted-foreground">duration: {e.duration_ms}ms</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
