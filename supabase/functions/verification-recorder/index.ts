// ═══════════════════════════════════════════════════════
// SITA OS — Verification Recorder Edge Function
// Records test results from Playwright or manual runs
// ═══════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { user_id, surface_id, route_key, run_type, mode, passed, failure_reason, duration_ms, evidence } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // If surface_id not provided, look up by route_key
    let resolvedSurfaceId = surface_id;
    if (!resolvedSurfaceId && route_key) {
      const { data: surface } = await supabase
        .from("verification_surfaces")
        .select("id")
        .eq("user_id", user_id)
        .eq("route_key", route_key)
        .single();
      resolvedSurfaceId = surface?.id;
    }

    // Insert verification run
    const { data: run, error: runErr } = await supabase.from("verification_runs").insert({
      user_id,
      surface_id: resolvedSurfaceId || null,
      run_type: run_type || "playwright",
      mode: mode || "real",
      passed: !!passed,
      failure_reason: failure_reason || null,
      duration_ms: duration_ms || null,
      launched_by: "automation",
    }).select().single();

    if (runErr) throw runErr;

    // Update surface status
    if (resolvedSurfaceId) {
      await supabase
        .from("verification_surfaces")
        .update({ verification_status: passed ? "pass" : "fail" })
        .eq("id", resolvedSurfaceId);
    }

    // Auto-create blocker for P0 failures
    if (!passed && resolvedSurfaceId) {
      const { data: surface } = await supabase
        .from("verification_surfaces")
        .select("test_priority, route_key, action_label")
        .eq("id", resolvedSurfaceId)
        .single();

      if (surface?.test_priority === "P0") {
        await supabase.from("verification_blockers").insert({
          user_id,
          surface_id: resolvedSurfaceId,
          blocker_type: "functional",
          severity: "critical",
          description: `P0 failure: ${surface.route_key} — ${surface.action_label}. Reason: ${failure_reason || "Unknown"}`,
        });
      }
    }

    // Store evidence if provided
    if (evidence && Array.isArray(evidence) && run) {
      const evidenceRecords = evidence.map((e: any) => ({
        user_id,
        run_id: run.id,
        evidence_type: e.type || "log",
        content: e.content || null,
        file_url: e.file_url || null,
        metadata: e.metadata || {},
      }));
      await supabase.from("verification_evidence").insert(evidenceRecords);
    }

    return new Response(JSON.stringify({ success: true, run_id: run?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
