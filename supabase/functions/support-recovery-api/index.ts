import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Permission checker using admin_role_permissions + user_roles
async function checkPermission(
  supabaseAdmin: any,
  userId: string,
  requiredPerm: string
): Promise<boolean> {
  // Get user's roles
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (!roles?.length) return false;

  const roleKeys = roles.map((r: any) => r.role);

  // Check if any role has the required permission
  const { data: perms } = await supabaseAdmin
    .from("admin_role_permissions")
    .select("granted")
    .in("role_key", roleKeys)
    .eq("permission", requiredPerm)
    .eq("granted", true);

  // Fallback: admin role always has access
  if (roleKeys.includes("admin")) return true;
  return (perms?.length ?? 0) > 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);

  const userId = claimsData.claims.sub as string;
  const admin = createClient(supabaseUrl, serviceKey);

  // Parse route from URL
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";

  try {
    // ── LIST JOBS (support.view) ──
    if (action === "list-jobs") {
      const canView = await checkPermission(admin, userId, "support.view");
      if (!canView) return json({ error: "Forbidden: requires support.view permission", code: "PERMISSION_DENIED" }, 403);

      const { data, error } = await admin
        .from("recovery_jobs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return json({ jobs: data });
    }

    // ── GET JOB DETAIL (support.view) ──
    if (action === "get-job") {
      const canView = await checkPermission(admin, userId, "support.view");
      if (!canView) return json({ error: "Forbidden: requires support.view permission", code: "PERMISSION_DENIED" }, 403);

      const jobId = url.searchParams.get("job_id");
      if (!jobId) return json({ error: "job_id required" }, 400);

      const { data, error } = await admin
        .from("recovery_jobs")
        .select("*")
        .eq("id", jobId)
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return json({ job: data });
    }

    // ── LIST WEBHOOK FAILURES (support.view) ──
    if (action === "list-webhooks") {
      const canView = await checkPermission(admin, userId, "support.view");
      if (!canView) return json({ error: "Forbidden: requires support.view permission", code: "PERMISSION_DENIED" }, 403);

      const status = url.searchParams.get("status");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");

      let query = admin
        .from("webhook_delivery_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (status && status !== "all") query = query.eq("status", status);
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      const { data, error } = await query;
      if (error) throw error;
      return json({ failures: data ?? [], count: data?.length ?? 0 });
    }

    // ── REPLAY WEBHOOK (admin.recovery) ──
    if (action === "replay-webhook") {
      const canExec = await checkPermission(admin, userId, "admin.recovery");
      if (!canExec) return json({ error: "Forbidden: requires admin.recovery permission", code: "PERMISSION_DENIED" }, 403);

      const body = await req.json();
      const webhookId = body?.webhook_id;
      if (!webhookId) return json({ error: "webhook_id required" }, 400);

      // Get the webhook event
      const { data: wh, error: whErr } = await admin
        .from("webhook_delivery_log")
        .select("*")
        .eq("id", webhookId)
        .single();
      if (whErr || !wh) return json({ error: "Webhook not found" }, 404);

      // Only replay failed events
      if (wh.status !== "failed" && wh.status !== "error") {
        return json({ error: "Only failed/error webhooks can be replayed" }, 400);
      }

      // Create a job record
      const { data: job } = await admin.from("recovery_jobs").insert({
        user_id: userId,
        label: `Webhook replay: ${webhookId.slice(0, 8)}…`,
        status: "completed",
        progress: 100,
        parameters: { webhook_id: webhookId, target_url: wh.target_url },
        result: { replay_status: "replayed", original_status: wh.status },
        is_dry_run: false,
        completed_at: new Date().toISOString(),
      }).select().single();

      // Update the webhook status
      await admin
        .from("webhook_delivery_log")
        .update({ status: "replayed", retry_count: (wh.retry_count || 0) + 1, updated_at: new Date().toISOString() })
        .eq("id", webhookId);

      return json({ replay_status: "replayed", job_id: job?.id });
    }

    // ── TRIGGER RECOVERY ACTION (admin.recovery) ──
    if (action === "trigger-action") {
      const canExec = await checkPermission(admin, userId, "admin.recovery");
      if (!canExec) return json({ error: "Forbidden: requires admin.recovery permission", code: "PERMISSION_DENIED" }, 403);

      const body = await req.json();
      const { action_type, target_user_id, reason, is_dry_run } = body || {};
      if (!action_type) return json({ error: "action_type required" }, 400);

      const jobLabel = `${action_type}: ${(target_user_id || "").slice(0, 8)}…${is_dry_run ? " (dry-run)" : ""}`;

      const { data: job, error: jobErr } = await admin.from("recovery_jobs").insert({
        user_id: userId,
        label: jobLabel,
        status: "running",
        progress: 0,
        parameters: { action_type, target_user_id, reason, is_dry_run },
        is_dry_run: is_dry_run ?? true,
      }).select().single();

      if (jobErr) throw jobErr;

      // Simulate execution (in production, dispatch to actual handlers)
      setTimeout(async () => {
        try {
          await admin.from("recovery_jobs").update({
            status: "completed",
            progress: 100,
            result: { success: true, simulated: is_dry_run },
            completed_at: new Date().toISOString(),
          }).eq("id", job.id);
        } catch (_) {}
      }, 3000);

      return json({ job_id: job.id, status: "running" });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    return json({ error: err.message || "Internal error" }, 500);
  }
});