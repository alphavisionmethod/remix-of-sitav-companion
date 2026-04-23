import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth, requireAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cors = handleCors(req);
  if (cors) return cors;

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";

  try {
    // RECONCILIATION — admin only
    if (action === "reconciliation") {
      const auth = await requireAdmin(req);
      if (auth instanceof Response) return auth;
      const { supabase } = auth;

      if (req.method === "GET") {
        const { data } = await supabase.from("cloud_reconciliation_runs")
          .select("*").order("created_at", { ascending: false }).limit(20);
        return corsResponse({ runs: data || [] });
      }

      // Trigger new reconciliation
      const { data, error } = await supabase.from("cloud_reconciliation_runs").insert({
        run_type: "full", status: "running", started_at: new Date().toISOString(),
        triggered_by: (auth as any).user.id,
      }).select().single();

      if (error) return corsError(error.message, 500);

      // Simulate quick reconciliation
      const { data: orphans } = await supabase.from("cloud_blobs")
        .select("id", { count: "exact", head: true }).eq("finalized", false);

      await supabase.from("cloud_reconciliation_runs").update({
        status: "completed", completed_at: new Date().toISOString(),
        orphaned_blobs: orphans?.count || 0, repairs_applied: 0,
      }).eq("id", data.id);

      return corsResponse({ run: { ...data, status: "completed" } });
    }

    // COMPLIANCE HOLD — admin only
    if (action === "compliance-hold") {
      const auth = await requireAdmin(req);
      if (auth instanceof Response) return auth;
      const { user, supabase } = auth;
      const body = await req.json().catch(() => ({}));

      const { target_type, target_id, hook_type, reason, active } = body;
      if (!target_id) return corsError("target_id required", 400);

      if (active === false) {
        const { error } = await supabase.from("cloud_compliance_hooks")
          .update({ status: "inactive", deactivated_at: new Date().toISOString() })
          .eq("target_id", target_id).eq("hook_type", hook_type || "legal_hold");
        if (error) return corsError(error.message, 500);
        return corsResponse({ status: "deactivated" });
      }

      const { data, error } = await supabase.from("cloud_compliance_hooks").insert({
        hook_type: hook_type || "legal_hold",
        target_type: target_type || "user",
        target_id, reason: reason || "",
        activated_by: user.id,
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ hook: data });
    }

    // User-scoped actions below
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;
    const body = await req.json().catch(() => ({}));

    // ARCHIVE — tier migration
    if (action === "archive") {
      const { object_id, object_type, target_tier } = body;
      if (!object_id) return corsError("object_id required", 400);

      const { data, error } = await supabase.from("cloud_archive_jobs").insert({
        user_id: user.id, object_id,
        object_type: object_type || "file",
        direction: "archive",
        target_tier: target_tier || "cold",
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ job: data });
    }

    // RESTORE-ARCHIVE
    if (action === "restore-archive") {
      const { object_id } = body;
      if (!object_id) return corsError("object_id required", 400);

      const { data, error } = await supabase.from("cloud_archive_jobs").insert({
        user_id: user.id, object_id, direction: "restore", target_tier: "hot",
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ job: data });
    }

    // ACCOUNT-CLOSURE
    if (action === "account-closure") {
      const { reason } = body;

      // Create export job first
      const { data: exportJob } = await supabase.from("cloud_import_export_jobs").insert({
        user_id: user.id, job_type: "export", source: "all", status: "pending",
      }).select().single();

      const { data, error } = await supabase.from("cloud_account_closure_requests").insert({
        user_id: user.id, reason: reason || "",
        stage: "requested",
        export_job_id: exportJob?.id,
        cancellation_deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ request: data });
    }

    // EXPORT
    if (action === "export") {
      const { source } = body;
      const { data, error } = await supabase.from("cloud_import_export_jobs").insert({
        user_id: user.id, job_type: "export",
        source: source || "all", status: "pending",
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ job: data });
    }

    // IMPORT
    if (action === "import") {
      const { source, destination } = body;
      const { data, error } = await supabase.from("cloud_import_export_jobs").insert({
        user_id: user.id, job_type: "import",
        source: source || "", destination: destination || "", status: "pending",
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ job: data });
    }

    // LIST my import/export jobs
    if (action === "jobs") {
      const { data } = await supabase.from("cloud_import_export_jobs")
        .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return corsResponse({ jobs: data || [] });
    }

    return corsError("Unknown action", 400);
  } catch (err) {
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});
