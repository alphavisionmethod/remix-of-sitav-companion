// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Reflection Loop (Phase G)
// ═══════════════════════════════════════════════════════════════
// Nightly job. For each user with activity in the last 24h, reads
// `ai_action_receipts` + `sita_agent_plans` + `advisor_action_queue`,
// asks the Lovable AI Gateway to summarize wins / blockers / lessons,
// and upserts one row per (user, date) into `sita_journal_entries`.
// Gracefully degrades to a deterministic summary if the gateway is
// unavailable or out of credits. Designed to be triggered by pg_cron
// or manual admin invoke — never blocks the user.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRow {
  user_id: string;
  action_type: string;
  status: string;
  recommendation_summary: string | null;
  created_at: string;
}
interface PlanRow {
  user_id: string;
  intent: string | null;
  status: string | null;
  domain: string | null;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function deterministicSummary(receipts: ReceiptRow[], plans: PlanRow[]) {
  const completed = receipts.filter((r) => r.status === "completed" || r.status === "ok").length;
  const failed = receipts.filter((r) => r.status === "failed" || r.status === "error").length;
  const planned = plans.length;
  return {
    summary: {
      headline: `${completed} actions completed, ${planned} plans drafted`,
      details: failed > 0 ? `${failed} action(s) failed and may need review.` : "Quiet day — nothing failed.",
    },
    wins: completed > 0 ? [{ text: `${completed} action${completed === 1 ? "" : "s"} executed cleanly` }] : [],
    blockers: failed > 0 ? [{ text: `${failed} failed receipt${failed === 1 ? "" : "s"}`, severity: "med" as const }] : [],
    lessons: [] as Array<{ text: string; category?: string }>,
  };
}

async function aiSummarize(apiKey: string, receipts: ReceiptRow[], plans: PlanRow[]) {
  const sys = "You are Sita's nightly reflection writer. Be terse, factual, never hallucinate.";
  const user = JSON.stringify({
    receipts: receipts.slice(0, 80).map((r) => ({ a: r.action_type, s: r.status, t: r.recommendation_summary })),
    plans: plans.slice(0, 40).map((p) => ({ i: p.intent, s: p.status, d: p.domain })),
  });
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      tools: [{
        type: "function",
        function: {
          name: "submit_journal",
          description: "Submit a structured daily journal entry.",
          parameters: {
            type: "object",
            properties: {
              headline: { type: "string" },
              details: { type: "string" },
              wins: { type: "array", items: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
              blockers: { type: "array", items: { type: "object", properties: { text: { type: "string" }, severity: { type: "string", enum: ["low", "med", "high"] } }, required: ["text"] } },
              lessons: { type: "array", items: { type: "object", properties: { text: { type: "string" }, category: { type: "string" } }, required: ["text"] } },
            },
            required: ["headline", "wins", "blockers", "lessons"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "submit_journal" } },
    }),
  });
  if (!r.ok) return null;
  const data = await r.json();
  const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return null;
  try {
    const parsed = JSON.parse(args);
    return {
      summary: { headline: parsed.headline, details: parsed.details ?? "" },
      wins: parsed.wins ?? [],
      blockers: parsed.blockers ?? [],
      lessons: parsed.lessons ?? [],
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "missing service env" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const date = todayUTC();

  let body: { user_id?: string } = {};
  try { body = await req.json(); } catch { /* noop */ }

  // Either run for one user (manual) or for every user with activity (cron).
  let userIds: string[] = [];
  if (body.user_id) {
    userIds = [body.user_id];
  } else {
    const { data: actives } = await admin
      .from("ai_action_receipts")
      .select("user_id")
      .gte("created_at", since)
      .limit(1000);
    const set = new Set<string>();
    for (const r of (actives ?? []) as Array<{ user_id: string }>) set.add(r.user_id);
    userIds = [...set];
  }

  const results: Array<{ user_id: string; ok: boolean; mode: string; reason?: string }> = [];

  for (const uid of userIds) {
    try {
      const { data: receipts } = await admin
        .from("ai_action_receipts")
        .select("user_id, action_type, status, recommendation_summary, created_at")
        .eq("user_id", uid)
        .gte("created_at", since)
        .limit(200);

      const { data: plans } = await admin
        .from("sita_agent_plans")
        .select("user_id, intent, status, domain")
        .eq("user_id", uid)
        .gte("created_at", since)
        .limit(80);

      const r = (receipts ?? []) as ReceiptRow[];
      const p = (plans ?? []) as PlanRow[];

      let entry = LOVABLE_API_KEY ? await aiSummarize(LOVABLE_API_KEY, r, p) : null;
      let mode = "ai";
      if (!entry) { entry = deterministicSummary(r, p); mode = "deterministic"; }

      const { error: upErr } = await admin
        .from("sita_journal_entries")
        .upsert({
          user_id: uid,
          entry_date: date,
          summary: entry.summary,
          wins: entry.wins,
          blockers: entry.blockers,
          lessons: entry.lessons,
        }, { onConflict: "user_id,entry_date" });

      if (upErr) {
        results.push({ user_id: uid, ok: false, mode, reason: upErr.message });
      } else {
        results.push({ user_id: uid, ok: true, mode });
      }
    } catch (err) {
      results.push({ user_id: uid, ok: false, mode: "error", reason: err instanceof Error ? err.message : "unknown" });
    }
  }

  return new Response(JSON.stringify({ date, processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});