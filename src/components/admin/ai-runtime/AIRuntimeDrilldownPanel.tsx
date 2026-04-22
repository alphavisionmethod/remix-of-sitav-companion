// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Drilldown Panel (Phase 3)
//
// Operator drilldown reused by InternalAgentsBoard, CouncilsBoard,
// and AIT01TeamOverview. Three real tabs:
//   • Actions  — last 50 internal_agent_actions joined to invocations
//   • Budget   — last 24h ai_usage_ledger + active budget class
//   • Health   — ai_fallback_events + ai_provider_health snapshot
//
// Plus a nightly-proof badge that reads the real readiness artifact.
// No duplicate fetch logic: see lib/internal-agents/runtime/agent-drilldown-data.ts.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/primitives/status/StatusBadge";
import {
  loadAgentDrilldownData,
  loadNightlyProofStatus,
  type AgentDrilldownData,
  type NightlyProofStatus,
} from "@/lib/internal-agents/runtime/agent-drilldown-data";
import { Activity, Coins, ShieldAlert, ExternalLink, Clock, Inbox } from "lucide-react";
import { EmptyState } from "@/components/sita/EmptyState";

interface Props {
  agentId: string;
  userId: string | null;
}

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

function fmtCents(c: number): string {
  return `$${(c / 100).toFixed(c < 10 ? 4 : 2)}`;
}

export function NightlyProofBadge() {
  const [proof, setProof] = useState<NightlyProofStatus | null>(null);
  useEffect(() => {
    loadNightlyProofStatus().then(setProof);
  }, []);
  if (!proof) {
    return <StatusBadge tone="muted" size="xs">Nightly proof: …</StatusBadge>;
  }
  if (!proof.available || !proof.verdict) {
    return (
      <StatusBadge tone="muted" size="xs" icon={<Clock className="h-3 w-3" />}>
        Nightly proof: never run
      </StatusBadge>
    );
  }
  const tone =
    proof.verdict === "GREEN" ? "success" : proof.verdict === "YELLOW" ? "warning" : "danger";
  return (
    <StatusBadge tone={tone} size="xs" dot>
      Nightly proof {proof.verdict.toLowerCase()} · {relTime(proof.generatedAt)}
    </StatusBadge>
  );
}

export function AIRuntimeDrilldownPanel({ agentId, userId }: Props) {
  const [data, setData] = useState<AgentDrilldownData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadAgentDrilldownData(agentId, userId).then((d) => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [agentId, userId]);

  if (loading) {
    return <p className="text-xs text-muted-foreground py-4">Loading drilldown…</p>;
  }
  if (!data) {
    return (
      <EmptyState
        icon={<Inbox className="h-5 w-5" />}
        title="No drilldown data yet"
        description="This agent has no recorded actions, invocations, or fallback events in the current window. Drilldown populates after the first runtime tick."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Drilldown</p>
        <NightlyProofBadge />
      </div>
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-3 h-8">
          <TabsTrigger value="actions" className="text-[11px] gap-1">
            <Activity className="h-3 w-3" /> Actions ({data.actions.length})
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-[11px] gap-1">
            <Coins className="h-3 w-3" /> Budget
          </TabsTrigger>
          <TabsTrigger value="health" className="text-[11px] gap-1">
            <ShieldAlert className="h-3 w-3" /> Health
          </TabsTrigger>
        </TabsList>

        {/* ── Actions ─────────────────────────────────────────── */}
        <TabsContent value="actions" className="mt-2 space-y-1.5 max-h-80 overflow-y-auto">
          {data.actions.length === 0 && (
            <p className="text-[11px] text-muted-foreground italic">No actions in the last 50 records.</p>
          )}
          {data.actions.map((a) => (
            <Card key={a.id} className="p-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-medium">{a.action_type}</span>
                <span className="text-muted-foreground">{relTime(a.created_at)}</span>
              </div>
              {a.summary && <p className="mt-1 text-muted-foreground line-clamp-2">{a.summary}</p>}
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground flex-wrap">
                <span>conf {Math.round(a.confidence * 100)}%</span>
                <span>· {a.status}</span>
                {a.duration_ms != null && <span>· {a.duration_ms}ms</span>}
                {a.invocation && (
                  <>
                    <span>· {a.invocation.model_used ?? "no-model"}</span>
                    {a.invocation.cost_cents != null && (
                      <span>· {fmtCents(a.invocation.cost_cents)}</span>
                    )}
                    {a.invocation.tokens_in != null && a.invocation.tokens_out != null && (
                      <span>· {a.invocation.tokens_in + a.invocation.tokens_out} tok</span>
                    )}
                    <Link
                      to={`/admin/ai-gateway/receipts?invocation=${a.invocation.id}`}
                      className="inline-flex items-center gap-0.5 text-primary hover:underline ml-auto"
                    >
                      receipt <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </>
                )}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* ── Budget ──────────────────────────────────────────── */}
        <TabsContent value="budget" className="mt-2 space-y-2">
          <Card className="p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">24h cost</span>
              <span className="text-xs font-medium tabular-nums">{fmtCents(data.budget.totalCostCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">24h tokens</span>
              <span className="text-xs font-medium tabular-nums">{data.budget.totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Invocations</span>
              <span className="text-xs font-medium tabular-nums">{data.budget.invocations}</span>
            </div>
            {data.budget.budgetClass && (
              <>
                <div className="border-t border-border my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Budget class</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    {data.budget.budgetClass.display_name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Daily envelope use</span>
                  <span className={`text-xs font-medium tabular-nums ${
                    data.budget.utilizationPct >= 80 ? "text-destructive" :
                    data.budget.utilizationPct >= 60 ? "text-amber-500" : ""
                  }`}>
                    {data.budget.utilizationPct.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Cap per call: {fmtCents(data.budget.budgetClass.max_cost_cents_per_call)} ·
                  {" "}{data.budget.budgetClass.max_calls_per_hour}/hr ·
                  {" "}{data.budget.budgetClass.max_tokens_per_call.toLocaleString()} tok
                </p>
              </>
            )}
            {!data.budget.budgetClass && (
              <p className="text-[10px] text-muted-foreground italic">No budget class assigned.</p>
            )}
          </Card>
        </TabsContent>

        {/* ── Health (fallback + provider) ───────────────────── */}
        <TabsContent value="health" className="mt-2 space-y-2 max-h-80 overflow-y-auto">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              Provider health
            </p>
            {data.providers.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic">No routed providers observed.</p>
            )}
            {data.providers.map((p) => (
              <Card key={p.provider_key} className="p-2 text-[11px] mb-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.provider_key}</span>
                  <StatusBadge
                    tone={p.status === "healthy" ? "success" : p.status === "degraded" ? "warning" : p.status === "failing" ? "danger" : "muted"}
                    size="xs"
                    dot
                  >
                    {p.status}
                  </StatusBadge>
                </div>
                <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                  {p.latency_ms_p50 != null && <span>p50 {p.latency_ms_p50}ms</span>}
                  {p.latency_ms_p95 != null && <span>p95 {p.latency_ms_p95}ms</span>}
                  {p.error_rate_pct != null && <span>err {Number(p.error_rate_pct).toFixed(1)}%</span>}
                  <span className="ml-auto">{relTime(p.last_probed_at)}</span>
                </div>
                {p.last_error && (
                  <p className="mt-1 text-[10px] text-destructive line-clamp-1">{p.last_error}</p>
                )}
              </Card>
            ))}
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              Recent fallback events ({data.fallback.length})
            </p>
            {data.fallback.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic">No fallback events recorded.</p>
            )}
            {data.fallback.map((f) => (
              <Card key={f.id} className="p-2 text-[11px] mb-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{f.fallback_reason}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1">{f.result_state}</Badge>
                </div>
                <div className="flex items-center justify-between mt-0.5 text-[10px] text-muted-foreground">
                  <span className="truncate">{f.capability_key}</span>
                  <span>{relTime(f.created_at)}</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
