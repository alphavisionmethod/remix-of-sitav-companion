// ═══════════════════════════════════════════════════════════════
// SITA OS — Personality Tuner (Phase H)
// ═══════════════════════════════════════════════════════════════
// Reads recent feedback signals (advisor_feedback ratings, plan
// outcomes, journal lessons) for the calling user and returns a
// suggested patch to `sita_personality_profiles` (verbosity,
// proactivity, formality). Caller decides whether to apply.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function clamp(n: number) { return Math.max(0, Math.min(1, n)); }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "missing creds" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "auth required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: userResp } = await supabase.auth.getUser();
    const user = userResp?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "auth required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: profile } = await supabase
      .from("sita_personality_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: feedback } = await supabase
      .from("advisor_feedback")
      .select("rating,feedback_type,created_at")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .limit(200);

    const ratings = (feedback ?? []).map((f) => f.rating).filter((r): r is number => typeof r === "number");
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const dismissals = (feedback ?? []).filter((f) => f.feedback_type === "dismissed").length;

    const current = {
      voice_persona: profile?.voice_persona ?? "sita",
      formality: Number(profile?.formality ?? 0.5),
      verbosity: Number(profile?.verbosity ?? 0.4),
      proactivity: Number(profile?.proactivity ?? 0.5),
      humor: Number(profile?.humor ?? 0.2),
    };

    // Heuristic: too many dismissals → lower proactivity; low avg rating → lower verbosity.
    const suggestion = {
      verbosity: clamp(current.verbosity + (avg !== null && avg < 3 ? -0.1 : 0)),
      proactivity: clamp(current.proactivity + (dismissals > 5 ? -0.15 : 0)),
      formality: current.formality,
      humor: current.humor,
    };

    const changed = (Object.keys(suggestion) as Array<keyof typeof suggestion>)
      .some((k) => Math.abs(suggestion[k] - (current as Record<string, number>)[k]) > 0.01);

    return new Response(JSON.stringify({
      ok: true,
      current,
      suggestion,
      changed,
      signal: { sample_size: ratings.length, avg_rating: avg, dismissals, window_days: 14 },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[personality-tune]", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});