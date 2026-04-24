// ═══════════════════════════════════════════════════════════════
// SITA OS — Dream Consolidator (Phase J)
// ═══════════════════════════════════════════════════════════════
// Nightly job (or manual trigger) that:
//  1. Reads recent episodes + perception events + affect events
//  2. Promotes recurring perception payloads into knowledge_nodes
//  3. Decays low-confidence nodes that haven't been seen in 30d
//  4. Suggests personality patches based on aggregated affect
//
// Pure server-side, idempotent per user/day.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConsolidationReport {
  user_id: string;
  episodes_processed: number;
  affect_events_processed: number;
  nodes_promoted: number;
  nodes_decayed: number;
  personality_patches: Array<{ field: string; from: number; to: number; reason: string }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  // Determine target users
  let targetUserIds: string[] = [];
  let manual = false;
  try {
    const body = await req.json().catch(() => ({}));
    manual = !!body?.manual;
    if (manual) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data } = await userClient.auth.getClaims(token);
        if (data?.claims?.sub) targetUserIds = [data.claims.sub as string];
      }
    }
  } catch { /* noop */ }

  if (!targetUserIds.length) {
    // Cron path — process every user with affect or episode activity in last 24h
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { data } = await admin
      .from("sita_episodes")
      .select("user_id")
      .gte("started_at", since);
    const ids = new Set<string>();
    for (const r of (data ?? []) as Array<{ user_id: string }>) ids.add(r.user_id);
    targetUserIds = Array.from(ids);
  }

  const reports: ConsolidationReport[] = [];
  for (const uid of targetUserIds) {
    try {
      reports.push(await consolidateUser(admin, uid));
    } catch (err) {
      console.warn("[dream] user failed", uid, err);
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      manual,
      processed_users: reports.length,
      report: reports[0] ?? null,
      reports,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
  );
});

// service-role admin client is intentionally untyped at edge runtime — newer
// @supabase/supabase-js typings lock generic schema to `never` and reject all
// table writes when `Database` types aren't supplied.
// deno-lint-ignore no-explicit-any
async function consolidateUser(admin: any, userId: string): Promise<ConsolidationReport> {
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();

  // 1. Episodes
  const { data: eps } = await admin
    .from("sita_episodes")
    .select("id, primary_surface, intent_summary, signals_count")
    .eq("user_id", userId)
    .gte("started_at", since);
  const episodes = (eps ?? []) as Array<{ id: string; primary_surface: string | null; intent_summary: string | null; signals_count: number }>;

  // 2. Affect summary
  const { data: affect } = await admin
    .from("sita_affect_events")
    .select("signal, target_kind, weight")
    .eq("user_id", userId)
    .gte("created_at", since);
  const affectRows = (affect ?? []) as Array<{ signal: string; target_kind: string; weight: number }>;

  // 3. Perception → knowledge node promotion
  const { data: perc } = await admin
    .from("sita_perception_events")
    .select("source, payload")
    .eq("user_id", userId)
    .gte("created_at", since);
  const perception = (perc ?? []) as Array<{ source: string; payload: Record<string, unknown> }>;

  const labelCounts = new Map<string, number>();
  for (const p of perception) {
    const preview = String((p.payload?.preview as string) ?? "").trim();
    if (preview.length >= 6 && preview.length <= 80) {
      labelCounts.set(preview, (labelCounts.get(preview) ?? 0) + 1);
    }
  }
  let nodes_promoted = 0;
  for (const [label, count] of labelCounts.entries()) {
    if (count < 3) continue; // recurrence threshold
    try {
      const { data: existing } = await admin
        .from("sita_knowledge_nodes")
        .select("id, confidence")
        .eq("user_id", userId)
        .eq("kind", "concept")
        .eq("label", label)
        .maybeSingle();
      if (existing) {
        await admin
          .from("sita_knowledge_nodes")
          .update({
            confidence: Math.min(1, ((existing as { confidence: number }).confidence ?? 0.5) + 0.05 * count),
            last_seen_at: new Date().toISOString(),
          })
          .eq("id", (existing as { id: string }).id);
      } else {
        await admin.from("sita_knowledge_nodes").insert({
          user_id: userId,
          kind: "concept",
          label,
          confidence: Math.min(0.7, 0.3 + 0.05 * count),
          source: "dream-consolidate",
        });
        nodes_promoted += 1;
      }
    } catch { /* noop */ }
  }

  // 4. Decay stale low-confidence nodes
  const decayCutoff = new Date(Date.now() - 30 * 24 * 3600_000).toISOString();
  const { data: stale } = await admin
    .from("sita_knowledge_nodes")
    .select("id, confidence")
    .eq("user_id", userId)
    .lt("confidence", 0.4)
    .lt("last_seen_at", decayCutoff)
    .limit(50);
  let nodes_decayed = 0;
  for (const n of (stale ?? []) as Array<{ id: string; confidence: number }>) {
    const next = Math.max(0, n.confidence - 0.1);
    if (next < 0.05) {
      await admin.from("sita_knowledge_nodes").delete().eq("id", n.id);
    } else {
      await admin.from("sita_knowledge_nodes").update({ confidence: next }).eq("id", n.id);
    }
    nodes_decayed += 1;
  }

  // 5. Personality patch suggestions from affect aggregation
  const personality_patches: Array<{ field: string; from: number; to: number; reason: string }> = [];
  const dismissals = affectRows.filter((r) => r.signal === "dismiss").length;
  const positives = affectRows.filter((r) => r.signal === "thumbs_up" || r.signal === "accept").length;
  if (dismissals >= 5 || positives >= 5) {
    const { data: prof } = await admin
      .from("sita_personality_profiles")
      .select("verbosity, proactivity")
      .eq("user_id", userId)
      .maybeSingle();
    const verbosity = Number((prof as { verbosity?: number } | null)?.verbosity ?? 0.4);
    const proactivity = Number((prof as { proactivity?: number } | null)?.proactivity ?? 0.5);
    if (dismissals > positives + 2) {
      const next = Math.max(0.1, proactivity - 0.05);
      if (next !== proactivity) {
        await admin.from("sita_personality_profiles").upsert({
          user_id: userId, proactivity: next,
        }, { onConflict: "user_id" });
        personality_patches.push({ field: "proactivity", from: proactivity, to: next, reason: `${dismissals} dismissals vs ${positives} accepts` });
      }
    } else if (positives > dismissals + 2) {
      const next = Math.min(1, verbosity + 0.03);
      if (next !== verbosity) {
        await admin.from("sita_personality_profiles").upsert({
          user_id: userId, verbosity: next,
        }, { onConflict: "user_id" });
        personality_patches.push({ field: "verbosity", from: verbosity, to: next, reason: `${positives} positive reactions` });
      }
    }
  }

  return {
    user_id: userId,
    episodes_processed: episodes.length,
    affect_events_processed: affectRows.length,
    nodes_promoted,
    nodes_decayed,
    personality_patches,
  };
}