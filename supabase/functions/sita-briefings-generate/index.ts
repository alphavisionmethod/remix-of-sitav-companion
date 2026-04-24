// ═══════════════════════════════════════════════════════════════
// SITA OS — Briefings Generator (Phase H)
// ═══════════════════════════════════════════════════════════════
// Generates queued morning / midday / evening briefings for a user
// based on the last 24h of activity (action receipts, agent plans,
// mission milestones). Designed to be triggered by pg_cron 3x/day
// or manually via supabase.functions.invoke. Idempotent per
// (user_id, kind, day) — won't queue duplicates.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type BriefingKind = "morning" | "midday" | "evening" | "weekly" | "mission" | "risk";

interface UserActivity {
  user_id: string;
  receipts: number;
  failed: number;
  plans: number;
  open_missions: number;
}

function pickKind(now: Date): BriefingKind {
  const h = now.getUTCHours();
  if (h < 11) return "morning";
  if (h < 17) return "midday";
  return "evening";
}

function craftHeadline(kind: BriefingKind, a: UserActivity): { headline: string; body: string; priority: number } {
  if (kind === "morning") {
    return {
      headline: a.open_missions > 0 ? `${a.open_missions} active missions today` : "Quiet morning ahead",
      body: `Yesterday: ${a.receipts} actions${a.failed ? `, ${a.failed} failed` : ""}.`,
      priority: a.open_missions > 0 ? 4 : 3,
    };
  }
  if (kind === "midday") {
    return {
      headline: a.failed > 0 ? `${a.failed} failed actions need review` : "Midday check-in",
      body: `${a.plans} plans in flight.`,
      priority: a.failed > 0 ? 5 : 2,
    };
  }
  return {
    headline: a.receipts > 0 ? `${a.receipts} actions completed today` : "Day complete",
    body: a.failed > 0 ? `${a.failed} blockers worth a look tomorrow.` : "Clean run today.",
    priority: 3,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) {
      return new Response(JSON.stringify({ error: "missing service credentials" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(url, serviceKey);

    const now = new Date();
    const kind = pickKind(now);
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const dayStart = new Date(now);
    dayStart.setUTCHours(0, 0, 0, 0);

    // Aggregate per-user activity in the last 24h.
    const { data: receipts } = await supabase
      .from("ai_action_receipts")
      .select("user_id,status")
      .gte("created_at", since);

    const { data: plans } = await supabase
      .from("sita_agent_plans")
      .select("user_id,status")
      .gte("created_at", since);

    const { data: missions } = await supabase
      .from("sita_missions")
      .select("user_id,status")
      .eq("status", "active");

    const map = new Map<string, UserActivity>();
    for (const r of receipts ?? []) {
      const a = map.get(r.user_id) ?? { user_id: r.user_id, receipts: 0, failed: 0, plans: 0, open_missions: 0 };
      a.receipts++;
      if (r.status && r.status !== "executed" && r.status !== "completed") a.failed++;
      map.set(r.user_id, a);
    }
    for (const p of plans ?? []) {
      const a = map.get(p.user_id) ?? { user_id: p.user_id, receipts: 0, failed: 0, plans: 0, open_missions: 0 };
      a.plans++;
      map.set(p.user_id, a);
    }
    for (const m of missions ?? []) {
      const a = map.get(m.user_id) ?? { user_id: m.user_id, receipts: 0, failed: 0, plans: 0, open_missions: 0 };
      a.open_missions++;
      map.set(m.user_id, a);
    }

    const inserts: Array<Record<string, unknown>> = [];
    for (const a of map.values()) {
      // Idempotency: skip if a briefing of this kind already exists today.
      const { count } = await supabase
        .from("sita_proactive_briefings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", a.user_id)
        .eq("kind", kind)
        .gte("scheduled_for", dayStart.toISOString());
      if ((count ?? 0) > 0) continue;

      const { headline, body, priority } = craftHeadline(kind, a);
      inserts.push({
        user_id: a.user_id,
        kind,
        headline,
        body,
        priority,
        evidence: [{ receipts: a.receipts, failed: a.failed, plans: a.plans, missions: a.open_missions }],
        scheduled_for: now.toISOString(),
      });
    }

    if (inserts.length > 0) {
      const { error } = await supabase.from("sita_proactive_briefings").insert(inserts);
      if (error) console.error("[briefings-generate] insert error", error);
    }

    return new Response(JSON.stringify({
      ok: true,
      kind,
      generated: inserts.length,
      users_evaluated: map.size,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[briefings-generate]", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});