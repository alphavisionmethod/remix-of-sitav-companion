// ═══════════════════════════════════════════════════════════════
// Phase 6B — Autonomous Cost Optimization Drafter
// Scans ai_usage_ledger to draft optimization proposals.
// HARD RULE: never auto-applies; always status='draft_pending_review'.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface UsageRow {
  capability_key: string;
  estimated_cost_usd: number | null;
  total_tokens: number | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const body = await req.json().catch(() => ({}));
    const lookbackDays = Math.min(Number(body.lookback_days ?? 30), 90);
    const since = new Date(Date.now() - lookbackDays * 86_400_000).toISOString();

    // Aggregate usage by capability
    const { data: usage, error: usageErr } = await supabase
      .from("ai_usage_ledger")
      .select("capability_key, estimated_cost_usd, total_tokens")
      .gte("created_at", since)
      .limit(5000);

    if (usageErr) throw usageErr;

    const byCapability = new Map<string, { cost: number; tokens: number; count: number }>();
    for (const r of (usage ?? []) as UsageRow[]) {
      const k = r.capability_key ?? "unknown";
      const cur = byCapability.get(k) ?? { cost: 0, tokens: 0, count: 0 };
      cur.cost += Number(r.estimated_cost_usd ?? 0);
      cur.tokens += Number(r.total_tokens ?? 0);
      cur.count += 1;
      byCapability.set(k, cur);
    }

    const proposals: Array<{ key: string; type: string; savings: number }> = [];
    const agentId = "cost-optimizer-agent";
    const stamp = Date.now();
    let idx = 0;

    for (const [capability, agg] of byCapability.entries()) {
      idx++;
      const monthlyCost = (agg.cost / lookbackDays) * 30;

      // Heuristic 1: high-volume + low average tokens => prompt caching candidate
      const avgTokens = agg.count > 0 ? agg.tokens / agg.count : 0;
      if (agg.count > 100 && avgTokens > 0 && avgTokens < 2000 && monthlyCost > 5) {
        const savings = Math.round(monthlyCost * 0.35 * 100) / 100;
        const key = `cache-${capability}-${stamp}-${idx}`;
        const { error } = await supabase.rpc("propose_internal_cost_optimization", {
          p_proposal_key: key,
          p_proposing_agent_id: agentId,
          p_proposal_type: "prompt_cache",
          p_scope: "capability",
          p_target_capability: capability,
          p_current_state: { calls_30d: agg.count, monthly_cost_usd: monthlyCost, avg_tokens: avgTokens },
          p_proposed_state: { strategy: "introduce_prompt_cache", ttl_seconds: 3600 },
          p_estimated_monthly_savings_usd: savings,
          p_estimated_quality_delta: 0,
          p_rationale: `High call volume (${agg.count}) with small payloads suggests cacheable patterns. Estimated 35% savings.`,
          p_evidence_refs: [{ source: "ai_usage_ledger", window_days: lookbackDays }],
          p_risk_assessment: "low",
        });
        if (!error) proposals.push({ key, type: "prompt_cache", savings });
      }

      // Heuristic 2: high monthly cost => model downgrade candidate
      if (monthlyCost > 50) {
        const savings = Math.round(monthlyCost * 0.4 * 100) / 100;
        const key = `downgrade-${capability}-${stamp}-${idx}`;
        const { error } = await supabase.rpc("propose_internal_cost_optimization", {
          p_proposal_key: key,
          p_proposing_agent_id: agentId,
          p_proposal_type: "model_downgrade",
          p_scope: "capability",
          p_target_capability: capability,
          p_current_state: { monthly_cost_usd: monthlyCost, calls_30d: agg.count },
          p_proposed_state: { strategy: "shift_to_utility_tier", note: "evaluate quality on test set first" },
          p_estimated_monthly_savings_usd: savings,
          p_estimated_quality_delta: -0.05,
          p_rationale: `Capability spends $${monthlyCost.toFixed(2)}/mo. Downgrading lower-risk traffic to utility tier could save ~40%.`,
          p_evidence_refs: [{ source: "ai_usage_ledger", window_days: lookbackDays }],
          p_risk_assessment: "medium",
        });
        if (!error) proposals.push({ key, type: "model_downgrade", savings });
      }
    }

    return json({
      ok: true,
      lookback_days: lookbackDays,
      capabilities_analyzed: byCapability.size,
      proposals_drafted: proposals.length,
      proposals,
      note: "All proposals saved as draft_pending_review. Apply requires human admin.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return json({ ok: false, error: message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
