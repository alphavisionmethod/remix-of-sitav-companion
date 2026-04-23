// ═══════════════════════════════════════════════════════════════
// Personal Brain — Nightly learn.scan cron
// ═══════════════════════════════════════════════════════════════
// Triggered via pg_cron / pg_net once per day. Iterates over users
// who have:
//   - autolearn_enabled = true
//   - sensitive_mode = false
//   - learn_from_chats = true
//   - had at least one new pb_messages row in the last 26 hours
// For each, runs the same inference logic as personal-brain action
// "learn.scan" via the service role.
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const DEFAULT_MODEL = "google/gemini-3-flash-preview";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface ScanStat {
  user_id: string;
  scanned: number;
  inferred: number;
  skipped?: string;
  error?: string;
}

async function scanForUser(
  admin: ReturnType<typeof createClient>,
  userId: string,
  apiKey: string,
): Promise<ScanStat> {
  // 1. Pull security prefs (defaults if missing)
  const { data: prefs } = await admin
    .from("pb_security_prefs")
    .select("sensitive_mode,autolearn_enabled,autolearn_threshold,learn_from_chats")
    .eq("user_id", userId)
    .maybeSingle();

  const p = prefs ?? {
    sensitive_mode: false,
    autolearn_enabled: true,
    autolearn_threshold: 0.7,
    learn_from_chats: true,
  };
  if (p.sensitive_mode || !p.autolearn_enabled || !p.learn_from_chats) {
    return { user_id: userId, scanned: 0, inferred: 0, skipped: "autolearn_disabled" };
  }

  // 2. Pull recent messages (last 60, last 26h)
  const since = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
  const { data: msgs } = await admin
    .from("pb_messages")
    .select("role,content,created_at")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(60);

  if (!msgs || msgs.length === 0) {
    return { user_id: userId, scanned: 0, inferred: 0, skipped: "no_messages" };
  }

  const transcript = (msgs as Array<{ role: string; content: string }>)
    .reverse()
    .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 800)}`)
    .join("\n\n");

  // 3. Run inference via Lovable AI Gateway (tool-calling)
  const sysPrompt =
    `You analyze a user's recent chat transcript to extract durable, useful facts the AI should remember. ` +
    `Only return high-quality, non-trivial signals. Avoid restating obvious or short-lived statements.`;
  const tools = [{
    type: "function",
    function: {
      name: "record_inferences",
      description: "Record up to 8 inferred memories about the user.",
      parameters: {
        type: "object",
        properties: {
          inferences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string", enum: ["style","format","interest","skill","project","pain_point","goal","work_context","preference"] },
                content: { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
              },
              required: ["category","content","confidence"],
            },
          },
        },
        required: ["inferences"],
      },
    },
  }];

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: `Transcript:\n${transcript}` },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "record_inferences" } },
    }),
  });

  if (!aiResp.ok) {
    return {
      user_id: userId,
      scanned: msgs.length,
      inferred: 0,
      error: `ai_${aiResp.status}`,
    };
  }

  const json = await aiResp.json();
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  let inferences: Array<{ category: string; content: string; confidence: number }> = [];
  try { inferences = JSON.parse(args ?? "{}").inferences ?? []; } catch { inferences = []; }

  const threshold = Number(p.autolearn_threshold ?? 0.7);
  const rows = inferences.slice(0, 8).map((inf) => ({
    user_id: userId,
    kind: "inferred",
    category: inf.category,
    content: inf.content,
    confidence: inf.confidence,
    status: inf.confidence >= threshold ? "active" : "pending",
  }));

  if (rows.length) {
    await admin.from("pb_memories").insert(rows);
  }

  await admin.from("pb_security_events").insert({
    user_id: userId,
    event_type: "learn.scan.cron",
    severity: "info",
    detail: { scanned: msgs.length, inferred: rows.length },
  });

  return { user_id: userId, scanned: msgs.length, inferred: rows.length };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Shared-secret auth — falls back to WEBHOOK_SIGNING_SECRET so deploys
  // don't require a brand-new env var.
  const expected = Deno.env.get("CRON_SECRET") ?? Deno.env.get("WEBHOOK_SIGNING_SECRET");
  const provided = req.headers.get("x-cron-secret") ?? "";
  if (!expected || provided !== expected) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return jsonResponse({ error: "AI provider not configured" }, 503);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Find users with pb_messages activity in the last 26h
  const since = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
  const { data: activeRows, error } = await admin
    .from("pb_messages")
    .select("user_id")
    .gte("created_at", since)
    .limit(2000);

  if (error) return jsonResponse({ error: error.message }, 500);

  const userIds = Array.from(new Set((activeRows ?? []).map((r) => r.user_id))).filter(Boolean) as string[];
  if (userIds.length === 0) {
    return jsonResponse({ ok: true, processed: 0, results: [] });
  }

  // Run sequentially to keep AI gateway pressure low
  const results: ScanStat[] = [];
  for (const uid of userIds.slice(0, 200)) {
    try {
      const r = await scanForUser(admin, uid, apiKey);
      results.push(r);
    } catch (e) {
      results.push({
        user_id: uid,
        scanned: 0,
        inferred: 0,
        error: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return jsonResponse({
    ok: true,
    processed: results.length,
    total_inferred: results.reduce((s, r) => s + (r.inferred ?? 0), 0),
    results,
  });
});
