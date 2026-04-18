// ═══════════════════════════════════════════════════════════════
// Phase 8C — Federated Knowledge Aggregator
// Reads federated_knowledge_shares from opted-in tenants only,
// applies differential-privacy noise (ε ≤ 1.0 enforced via
// dp_noise_clamp), bands frequencies/confidences, and writes
// federated_pattern_aggregates. Never exposes individual tenant
// IDs in aggregates — only contributing_tenant_count.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function band(value: number, lo: number, hi: number): "low" | "medium" | "high" {
  if (value < lo) return "low";
  if (value < hi) return "medium";
  return "high";
}

function laplaceNoise(epsilon: number, sensitivity = 1): number {
  // Inverse-CDF Laplace sampling
  const u = Math.random() - 0.5;
  return -(sensitivity / epsilon) * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller's tenant has opted in (defense-in-depth on top of trigger)
    const { data: optin } = await supabase
      .from("tenant_federation_optins")
      .select("id, tenant_id")
      .eq("user_id", user.id)
      .is("revoked_at", null)
      .maybeSingle();
    if (!optin) {
      return new Response(JSON.stringify({ error: "tenant_not_opted_in" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const windowEnd = new Date();

    const { data: shares } = await supabase
      .from("federated_knowledge_shares")
      .select("pattern_hash, pattern_kind, dp_epsilon, source_tenant_id")
      .gte("created_at", windowStart.toISOString());

    // Group by (pattern_kind, pattern_hash), count distinct tenants
    const groups = new Map<string, { tenants: Set<string>; epsilonSum: number; count: number }>();
    for (const s of shares ?? []) {
      const k = `${s.pattern_kind}::${s.pattern_hash}`;
      if (!groups.has(k)) groups.set(k, { tenants: new Set(), epsilonSum: 0, count: 0 });
      const g = groups.get(k)!;
      g.tenants.add(s.source_tenant_id);
      g.epsilonSum += Number(s.dp_epsilon ?? 0.5);
      g.count += 1;
    }

    let written = 0;
    for (const [key, g] of groups) {
      const avgEpsilon = g.epsilonSum / Math.max(g.count, 1);
      const { data: clamped } = await supabase.rpc("dp_noise_clamp", { p_epsilon: avgEpsilon });
      const epsilon = Number(clamped ?? 1.0);
      const noisyCount = Math.max(0, g.count + laplaceNoise(epsilon));
      const noisyConfidence = Math.min(1, Math.max(0, g.tenants.size / Math.max(g.count, 1) + laplaceNoise(epsilon, 0.1)));

      const [pattern_kind, pattern_hash] = key.split("::");
      await supabase.from("federated_pattern_aggregates").insert({
        user_id: user.id,
        pattern_key: `${pattern_kind}:${pattern_hash.slice(0, 12)}`,
        frequency_band: band(noisyCount, 5, 20),
        confidence_band: band(noisyConfidence, 0.33, 0.66),
        contributing_tenant_count: g.tenants.size,
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        payload: { dp_epsilon: epsilon, noisy_count: Math.round(noisyCount) },
      });
      written++;
    }

    return new Response(JSON.stringify({ ok: true, aggregates_written: written }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
