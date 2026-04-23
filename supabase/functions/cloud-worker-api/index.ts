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
    // STATUS — public for authenticated users
    if (action === "status") {
      const auth = await requireAuth(req);
      if (auth instanceof Response) return auth;
      const { supabase } = auth;

      const [pending, processing, failed, deadLetter] = await Promise.all([
        supabase.from("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("status", "processing"),
        supabase.from("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("cloud_worker_jobs").select("id", { count: "exact", head: true }).eq("dead_letter", true),
      ]);

      const { data: recent } = await supabase.from("cloud_worker_jobs")
        .select("*").order("created_at", { ascending: false }).limit(20);

      return corsResponse({
        queue: {
          pending: pending.count || 0,
          processing: processing.count || 0,
          failed: failed.count || 0,
          dead_letter: deadLetter.count || 0,
        },
        recent_jobs: recent || [],
      });
    }

    // All other actions require admin
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const body = await req.json().catch(() => ({}));

    // ENQUEUE
    if (action === "enqueue") {
      const { job_type, payload, priority, user_id, idempotency_key } = body;
      if (!job_type) return corsError("job_type required", 400);

      // Check idempotency
      if (idempotency_key) {
        const { data: existing } = await supabase.from("cloud_worker_jobs")
          .select("id, status").eq("idempotency_key", idempotency_key).maybeSingle();
        if (existing) return corsResponse({ job: existing, deduplicated: true });
      }

      const { data, error } = await supabase.from("cloud_worker_jobs").insert({
        job_type,
        payload: payload || {},
        priority: priority || 5,
        user_id: user_id || null,
        idempotency_key: idempotency_key || null,
      }).select().single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ job: data });
    }

    // PROCESS — dequeue next job
    if (action === "process") {
      const { data: job } = await supabase.from("cloud_worker_jobs")
        .select("*")
        .eq("status", "pending")
        .eq("dead_letter", false)
        .lte("scheduled_at", new Date().toISOString())
        .order("priority", { ascending: false })
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!job) return corsResponse({ job: null, message: "No jobs available" });

      // Lock the job
      const { data: locked, error } = await supabase.from("cloud_worker_jobs")
        .update({
          status: "processing",
          locked_by: `worker-${user.id}`,
          locked_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          attempts: job.attempts + 1,
        })
        .eq("id", job.id)
        .eq("status", "pending")
        .select()
        .single();

      if (error || !locked) return corsResponse({ job: null, message: "Job already claimed" });
      return corsResponse({ job: locked });
    }

    // COMPLETE — mark job done
    if (action === "complete") {
      const { job_id, result, success } = body;
      if (!job_id) return corsError("job_id required", 400);

      if (success === false) {
        // Check if should go to dead letter
        const { data: job } = await supabase.from("cloud_worker_jobs")
          .select("attempts, max_attempts").eq("id", job_id).single();

        const isDead = job && job.attempts >= job.max_attempts;
        const { error } = await supabase.from("cloud_worker_jobs").update({
          status: isDead ? "dead_letter" : "failed",
          dead_letter: isDead,
          error_message: result?.error || "Job failed",
          completed_at: new Date().toISOString(),
          result: result || null,
        }).eq("id", job_id);

        if (error) return corsError(error.message, 500);
        return corsResponse({ status: isDead ? "dead_letter" : "failed" });
      }

      const { error } = await supabase.from("cloud_worker_jobs").update({
        status: "completed",
        result: result || {},
        completed_at: new Date().toISOString(),
      }).eq("id", job_id);

      if (error) return corsError(error.message, 500);
      return corsResponse({ status: "completed" });
    }

    // DEAD-LETTER RETRY
    if (action === "dead-letter-retry") {
      const { job_id } = body;
      if (!job_id) return corsError("job_id required", 400);

      const { error } = await supabase.from("cloud_worker_jobs").update({
        status: "pending",
        dead_letter: false,
        attempts: 0,
        error_message: null,
        locked_by: null,
        locked_at: null,
        started_at: null,
        completed_at: null,
      }).eq("id", job_id);

      if (error) return corsError(error.message, 500);
      return corsResponse({ status: "retried" });
    }

    return corsError("Unknown action", 400);
  } catch (err) {
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});
