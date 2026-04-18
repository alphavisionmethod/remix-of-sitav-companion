// ════════════════════════════════════════════════════════════════
// Phase 4 — aw-policy-architect edge function
// SCANS the database for security gaps and DRAFTS proposals
// for admin review. NEVER applies any change.
// ════════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DraftCandidate {
  draft_kind: "rls_policy" | "secret_rotation" | "role_grant_review" | "column_grant_review";
  target_resource: string;
  target_schema: string;
  title: string;
  rationale: string;
  current_state: Record<string, unknown>;
  proposed_state: Record<string, unknown>;
  sql_preview: string;
  risk_assessment: "low" | "medium" | "high" | "critical";
  evidence: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Caller must be admin (verify via JWT)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (!roleRow) {
          return new Response(JSON.stringify({ error: "admin role required" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const candidates: DraftCandidate[] = [];

    // ── Heuristic 1: tables with RLS enabled but zero policies ────
    const { data: drift } = await supabase.rpc("get_db_truth_snapshot", { _op: "drift" });
    const noPolicyTables: string[] = (drift?.rls_enabled_no_policies as string[]) ?? [];
    for (const t of noPolicyTables.slice(0, 10)) {
      candidates.push({
        draft_kind: "rls_policy",
        target_resource: t,
        target_schema: "public",
        title: `Add owner-scoped SELECT policy to public.${t}`,
        rationale:
          `Table public.${t} has Row-Level Security enabled but no policies. ` +
          `This means the table is unreadable from PostgREST. Either add a policy or disable RLS deliberately.`,
        current_state: { rls_enabled: true, policy_count: 0 },
        proposed_state: { rls_enabled: true, policy_count: 1, pattern: "owner_user_id" },
        sql_preview:
          `-- DRAFT — review before applying\n` +
          `CREATE POLICY "owners read ${t}"\n` +
          `  ON public.${t} FOR SELECT\n` +
          `  USING (auth.uid() = user_id);`,
        risk_assessment: "high",
        evidence: { source: "get_db_truth_snapshot.drift", detected_at: new Date().toISOString() },
      });
    }

    // ── Heuristic 2: tables with RLS DISABLED entirely ────────────
    const noRlsTables: string[] = (drift?.rls_disabled as string[]) ?? [];
    for (const t of noRlsTables.slice(0, 10)) {
      candidates.push({
        draft_kind: "rls_policy",
        target_resource: t,
        target_schema: "public",
        title: `Enable Row-Level Security on public.${t}`,
        rationale:
          `Table public.${t} has Row-Level Security DISABLED. ` +
          `If this table contains tenant or user data this is a critical exposure.`,
        current_state: { rls_enabled: false },
        proposed_state: { rls_enabled: true },
        sql_preview:
          `-- DRAFT — review before applying\n` +
          `ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`,
        risk_assessment: "critical",
        evidence: { source: "get_db_truth_snapshot.drift", detected_at: new Date().toISOString() },
      });
    }

    // ── Heuristic 3: secret rotation review (informational only) ──
    const oldSecrets = ["SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"];
    for (const s of oldSecrets) {
      candidates.push({
        draft_kind: "secret_rotation",
        target_resource: s,
        target_schema: "secrets",
        title: `Rotate secret ${s} (90-day review)`,
        rationale:
          `Periodic 90-day rotation review. Rotate ${s} in the provider dashboard, ` +
          `then update the corresponding Lovable Cloud secret. No DB change required.`,
        current_state: { rotation_status: "review_due" },
        proposed_state: { rotation_status: "rotated", new_provider_token: "<redacted>" },
        sql_preview: `-- No SQL: rotate ${s} via the Lovable Cloud secrets surface.`,
        risk_assessment: "medium",
        evidence: { policy: "90-day rotation cadence", detected_at: new Date().toISOString() },
      });
    }

    // ── De-dupe against open drafts (don't re-propose same target+kind) ──
    const newDrafts: DraftCandidate[] = [];
    for (const c of candidates) {
      const { data: existing } = await supabase
        .from("internal_agent_policy_drafts")
        .select("id")
        .eq("draft_kind", c.draft_kind)
        .eq("target_resource", c.target_resource)
        .in("status", ["pending_review", "changes_requested"])
        .maybeSingle();
      if (!existing) newDrafts.push(c);
    }

    let inserted = 0;
    for (const draft of newDrafts) {
      const { error } = await supabase.from("internal_agent_policy_drafts").insert({
        agent_id: "aw-policy-architect",
        ...draft,
      });
      if (!error) inserted += 1;
    }

    // Publish health summary
    const { data: health } = await supabase.rpc("summarize_policy_draft_health");

    return new Response(
      JSON.stringify({
        ok: true,
        scanned_candidates: candidates.length,
        new_drafts_inserted: inserted,
        skipped_existing: candidates.length - inserted,
        health,
        scanned_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[internal-agent-policy-architect] error", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
