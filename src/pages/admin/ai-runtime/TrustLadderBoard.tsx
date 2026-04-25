// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/trust-ladder (Phase 5)
// Supervisor dashboard for the AI Workforce trust ladder:
// per-agent autonomy rung (L0–L6), trust score, recent
// promotions / demotions, and the cross-agent knowledge bus.
// Admin-only.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/platform/sita/components/sita/EmptyState";
import { StatusBadge, type StatusTone } from "@/components/primitives/status/StatusBadge";
import { AITruthDisclosure } from "@/components/primitives/status/AITruthDisclosure";
import { OperatorActionPanel } from "@/admin/components/operator/OperatorActionPanel";
import {
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lock,
  Sparkles,
  AlertTriangle,
  History,
} from "lucide-react";
import { toast } from "sonner";

interface LadderRow {
  agent_id: string;
  current_rung: number;
  previous_rung: number;
  rung_reason: string;
  trust_score: number;
  reflection_count: number;
  last_evaluated_at: string;
  promotion_locked: boolean;
  promotion_lock_reason: string | null;
  human_approval_required_above_rung: number;
  updated_at: string;
}

interface HistoryRow {
  id: string;
  agent_id: string;
  from_rung: number;
  to_rung: number;
  direction: "promotion" | "demotion" | "hold";
  reason: string;
  trust_score_at_change: number;
  human_approved: boolean;
  created_at: string;
}

interface LearningRow {
  id: string;
  source_agent_id: string;
  pattern_tag: string;
  learning_summary: string;
  recommended_guard: string | null;
  confidence: number;
  status: string;
  created_at: string;
}

interface Summary {
  agents: LadderRow[];
  recent_changes: HistoryRow[];
  active_learnings: LearningRow[];
  generated_at: string;
}

const RUNG_LABELS = ["L0 Observe", "L1 Diagnose", "L2 Recommend", "L3 Draft", "L4 Simulate", "L5 Approval-ready", "L6 Constrained-action"];

function rungTone(rung: number): StatusTone {
  if (rung <= 0) return "muted";
  if (rung <= 2) return "info";
  if (rung === 3) return "success";
  if (rung === 4) return "warning";
  return "danger";
}

export default function TrustLadderBoard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("summarize_trust_ladder");
      if (error) throw error;
      setSummary(data as unknown as Summary);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load trust ladder");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runEvaluator = useCallback(async () => {
    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke("internal-agent-trust-evaluator", {
        body: {},
      });
      if (error) throw error;
      const evaluated = (data as { evaluated_agents?: number })?.evaluated_agents ?? 0;
      toast.success(`Evaluated ${evaluated} agent${evaluated === 1 ? "" : "s"}`);
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Trust evaluator failed");
    } finally {
      setEvaluating(false);
    }
  }, [load]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Trust Ladder & Knowledge Bus
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 5 — autonomy rungs derived from reflection trends. Promotions above L
            {summary?.agents[0]?.human_approval_required_above_rung ?? 4} require human approval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AITruthDisclosure mode="live-gateway" verifiedAt={summary?.generated_at} to="/admin/ai-runtime" />
          <Button onClick={runEvaluator} disabled={evaluating} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${evaluating ? "animate-spin" : ""}`} />
            {evaluating ? "Evaluating…" : "Run evaluator"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agents ({summary?.agents.length ?? 0})</TabsTrigger>
          <TabsTrigger value="history">Recent changes ({summary?.recent_changes.length ?? 0})</TabsTrigger>
          <TabsTrigger value="learnings">Knowledge bus ({summary?.active_learnings.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (summary?.agents ?? []).length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="Trust ladder is empty"
              description="Run the evaluator after reflections accumulate. Agents earn rungs once outcome quality stabilises."
            />
          ) : (
            (summary?.agents ?? []).map((a) => (
              <Card key={a.agent_id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-mono">{a.agent_id}</CardTitle>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={rungTone(a.current_rung)} size="sm">
                        {RUNG_LABELS[a.current_rung]}
                      </StatusBadge>
                      {a.promotion_locked && (
                        <StatusBadge tone="warning" size="sm" icon={<Lock className="h-3 w-3" />}>
                          Locked
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Trust score</span>
                      <span>{(a.trust_score * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={a.trust_score * 100} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Reflections</p>
                      <p className="font-semibold">{a.reflection_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Previous rung</p>
                      <p className="font-semibold">L{a.previous_rung}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Human-approval ceiling</p>
                      <p className="font-semibold">L{a.human_approval_required_above_rung}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.rung_reason}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent rung changes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px]">
                <div className="space-y-2">
                  {(summary?.recent_changes ?? []).map((h) => {
                    const Icon = h.direction === "promotion" ? ArrowUpRight : h.direction === "demotion" ? ArrowDownRight : Minus;
                    const color = h.direction === "promotion" ? "text-emerald-500" : h.direction === "demotion" ? "text-red-500" : "text-muted-foreground";
                    return (
                      <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <Icon className={`h-4 w-4 mt-0.5 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-sm">{h.agent_id}</p>
                            <p className="text-xs text-muted-foreground">L{h.from_rung} → L{h.to_rung}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{h.reason}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(h.created_at).toLocaleString()} · trust {(h.trust_score_at_change * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {(summary?.recent_changes ?? []).length === 0 && (
                    <EmptyState
                      icon={<History className="h-5 w-5" />}
                      title="No rung changes recorded"
                      description="Promotions and demotions appear here once the ladder evaluator detects sustained trust shifts."
                    />
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learnings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Cross-agent knowledge bus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px]">
                <div className="space-y-2">
                  {(summary?.active_learnings ?? []).map((l) => (
                    <div key={l.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <StatusBadge tone="info" size="sm" className="font-mono">{l.pattern_tag}</StatusBadge>
                        <span className="text-xs text-muted-foreground">{(l.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                      <p className="text-sm">{l.learning_summary}</p>
                      {l.recommended_guard && (
                        <p className="text-xs text-amber-500 mt-1 flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>Guard: {l.recommended_guard}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2">
                        from <span className="font-mono">{l.source_agent_id}</span> · {new Date(l.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {(summary?.active_learnings ?? []).length === 0 && (
                    <EmptyState
                      icon={<Sparkles className="h-5 w-5" />}
                      title="Knowledge bus is quiet"
                      description="Cross-agent learnings published with sufficient confidence will surface here for supervisor review."
                    />
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
