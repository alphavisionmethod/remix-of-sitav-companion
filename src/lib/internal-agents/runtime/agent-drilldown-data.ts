// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agent Drilldown Data Loader
//
// Single fetch surface used by AIRuntimeDrilldownPanel. Reads:
//   • internal_agent_actions  (joined to ai_workforce_invocations for cost/tokens)
//   • ai_usage_ledger         (last 24h scoped by correlation_id family)
//   • ai_workforce_budget_classes (current effective class for the user)
//   • ai_fallback_events      (last 30 — capability_key derived from agent)
//   • ai_provider_health      (current snapshot for routed providers)
//
// All reads honour existing RLS — no new policies needed.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface AgentActionRow {
  id: string;
  action_type: string;
  status: string;
  summary: string;
  rationale: string | null;
  confidence: number;
  duration_ms: number | null;
  created_at: string;
  invocation_id: string | null;
  correlation_id: string | null;
  invocation: {
    id: string;
    role_key: string;
    task_key: string;
    model_used: string | null;
    cost_cents: number | null;
    tokens_in: number | null;
    tokens_out: number | null;
    status: string;
  } | null;
}

export interface AgentBudgetWindow {
  windowStart: string;
  windowEnd: string;
  totalCostCents: number;
  totalTokens: number;
  invocations: number;
  budgetClass: {
    class_key: string;
    display_name: string;
    max_cost_cents_per_call: number;
    max_calls_per_hour: number;
    max_tokens_per_call: number;
  } | null;
  utilizationPct: number;
}

export interface FallbackEventRow {
  id: string;
  capability_key: string;
  fallback_reason: string;
  result_state: string;
  created_at: string;
}

export interface ProviderHealthRow {
  provider_key: string;
  status: string;
  latency_ms_p50: number | null;
  latency_ms_p95: number | null;
  error_rate_pct: number | null;
  last_probed_at: string;
  last_error: string | null;
}

export interface AgentDrilldownData {
  actions: AgentActionRow[];
  budget: AgentBudgetWindow;
  fallback: FallbackEventRow[];
  providers: ProviderHealthRow[];
}

// Heuristic: agent_id "P-04 Boardroom Storyteller" maps capability_keys
// like `internal-agent.<agent_id>.*`. We just match prefix.
function capabilityKeyForAgent(agentId: string): string {
  return `internal-agent.${agentId}`;
}

export async function loadAgentDrilldownData(
  agentId: string,
  userId: string | null,
): Promise<AgentDrilldownData> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const capPrefix = capabilityKeyForAgent(agentId);

  // ── Recent actions joined to invocations (left join on FK invocation_id) ──
  const { data: actionsRaw } = await supabase
    .from("internal_agent_actions")
    .select(
      `
        id, action_type, status, summary, rationale, confidence,
        duration_ms, created_at, invocation_id, correlation_id,
        ai_workforce_invocations:invocation_id (
          id, role_key, task_key, model_used, cost_cents, tokens_in, tokens_out, status
        )
      `,
    )
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(50);

  const actions: AgentActionRow[] = (actionsRaw ?? []).map((r: any) => ({
    id: r.id,
    action_type: r.action_type,
    status: r.status,
    summary: r.summary ?? "",
    rationale: r.rationale,
    confidence: Number(r.confidence ?? 0),
    duration_ms: r.duration_ms,
    created_at: r.created_at,
    invocation_id: r.invocation_id,
    correlation_id: r.correlation_id,
    invocation: r.ai_workforce_invocations
      ? {
          id: r.ai_workforce_invocations.id,
          role_key: r.ai_workforce_invocations.role_key,
          task_key: r.ai_workforce_invocations.task_key,
          model_used: r.ai_workforce_invocations.model_used,
          cost_cents: r.ai_workforce_invocations.cost_cents != null
            ? Number(r.ai_workforce_invocations.cost_cents)
            : null,
          tokens_in: r.ai_workforce_invocations.tokens_in,
          tokens_out: r.ai_workforce_invocations.tokens_out,
          status: r.ai_workforce_invocations.status,
        }
      : null,
  }));

  // ── Budget window (last 24h ledger filtered by capability prefix) ──
  let totalCostCents = 0;
  let totalTokens = 0;
  let invocations = 0;
  if (userId) {
    const { data: ledger } = await supabase
      .from("ai_usage_ledger")
      .select("estimated_cost_usd, total_tokens, capability_key")
      .eq("user_id", userId)
      .gte("created_at", since24h)
      .like("capability_key", `${capPrefix}%`);
    (ledger ?? []).forEach((l: any) => {
      totalCostCents += Number(l.estimated_cost_usd ?? 0) * 100;
      totalTokens += Number(l.total_tokens ?? 0);
      invocations += 1;
    });
  }

  let budgetClass: AgentBudgetWindow["budgetClass"] = null;
  if (userId) {
    const { data: cls } = await supabase
      .from("ai_workforce_budget_classes")
      .select("class_key, display_name, max_cost_cents_per_call, max_calls_per_hour, max_tokens_per_call")
      .eq("user_id", userId)
      .order("priority_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (cls) budgetClass = cls as AgentBudgetWindow["budgetClass"];
  }

  const dailyEnvelopeCents = budgetClass
    ? budgetClass.max_cost_cents_per_call * budgetClass.max_calls_per_hour * 24
    : 0;
  const utilizationPct = dailyEnvelopeCents > 0
    ? Math.round((totalCostCents / dailyEnvelopeCents) * 1000) / 10
    : 0;

  const budget: AgentBudgetWindow = {
    windowStart: since24h,
    windowEnd: new Date().toISOString(),
    totalCostCents: Math.round(totalCostCents * 100) / 100,
    totalTokens,
    invocations,
    budgetClass,
    utilizationPct,
  };

  // ── Fallback events (capability prefix match) ──
  let fallback: FallbackEventRow[] = [];
  if (userId) {
    const { data: fb } = await supabase
      .from("ai_fallback_events")
      .select("id, capability_key, fallback_reason, result_state, created_at")
      .eq("user_id", userId)
      .like("capability_key", `${capPrefix}%`)
      .order("created_at", { ascending: false })
      .limit(30);
    fallback = (fb ?? []) as FallbackEventRow[];
  }

  // ── Provider health snapshot for the providers we route to ──
  const providerKeys = Array.from(
    new Set(
      actions
        .map((a) => a.invocation?.model_used?.split("/")[0])
        .filter((p): p is string => !!p),
    ),
  );
  let providers: ProviderHealthRow[] = [];
  if (providerKeys.length > 0) {
    const { data: ph } = await supabase
      .from("ai_provider_health")
      .select("provider_key, status, latency_ms_p50, latency_ms_p95, error_rate_pct, last_probed_at, last_error")
      .in("provider_key", providerKeys)
      .order("last_probed_at", { ascending: false });
    // Dedupe to most-recent-per-provider
    const seen = new Set<string>();
    providers = (ph ?? []).filter((p: any) => {
      if (seen.has(p.provider_key)) return false;
      seen.add(p.provider_key);
      return true;
    }) as ProviderHealthRow[];
  }

  return { actions, budget, fallback, providers };
}

// ── Nightly proof status — reads release-readiness aggregate from a public artifact ──
// We surface real "last verified at" + verdict (or honest "never run").
export interface NightlyProofStatus {
  available: boolean;
  generatedAt: string | null;
  verdict: "GREEN" | "YELLOW" | "RED" | null;
  totalErrors: number;
  totalWarnings: number;
  source: string;
}

let _proofCache: { ts: number; data: NightlyProofStatus } | null = null;

export async function loadNightlyProofStatus(): Promise<NightlyProofStatus> {
  // 5-minute client cache to avoid hammering the static file.
  if (_proofCache && Date.now() - _proofCache.ts < 5 * 60 * 1000) {
    return _proofCache.data;
  }
  const fallback: NightlyProofStatus = {
    available: false,
    generatedAt: null,
    verdict: null,
    totalErrors: 0,
    totalWarnings: 0,
    source: "/generated/os-release-readiness-report.json",
  };
  try {
    const res = await fetch("/generated/os-release-readiness-report.json", {
      cache: "no-store",
    });
    if (!res.ok) {
      _proofCache = { ts: Date.now(), data: fallback };
      return fallback;
    }
    const j = await res.json();
    const data: NightlyProofStatus = {
      available: true,
      generatedAt: j.generatedAt ?? null,
      verdict: (j.verdict as NightlyProofStatus["verdict"]) ?? null,
      totalErrors: Number(j.totalErrors ?? 0),
      totalWarnings: Number(j.totalWarnings ?? 0),
      source: "/generated/os-release-readiness-report.json",
    };
    _proofCache = { ts: Date.now(), data };
    return data;
  } catch {
    _proofCache = { ts: Date.now(), data: fallback };
    return fallback;
  }
}
