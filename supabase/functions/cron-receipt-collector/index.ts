// Cron Receipt Collector — pg_cron calls this every 5m. Persists its own
// heartbeat into cron_run_receipts and accepts heartbeats from other jobs.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface ReceiptRequest {
  job_name?: string;
  schedule_expression?: string;
  status?: "running" | "succeeded" | "failed";
  payload?: Record<string, unknown>;
  error_message?: string;
  duration_ms?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!serviceKey || !supabaseUrl) {
      return new Response(JSON.stringify({ error: "service config missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ReceiptRequest = req.method === "POST"
      ? await req.json().catch(() => ({}))
      : {};

    const jobName = (body.job_name ?? "cron-receipt-collector").toString().slice(0, 200);
    const status = body.status ?? "succeeded";
    if (!["running", "succeeded", "failed"].includes(status)) {
      return new Response(JSON.stringify({ error: "invalid status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const finishedAt = status === "running" ? null : new Date().toISOString();

    const { data, error } = await supabase
      .from("cron_run_receipts")
      .insert({
        job_name: jobName,
        schedule_expression: body.schedule_expression ?? null,
        status,
        finished_at: finishedAt,
        duration_ms: body.duration_ms ?? null,
        payload: body.payload ?? {},
        error_message: body.error_message ?? null,
      })
      .select("id")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, receipt_id: data?.id, job_name: jobName, status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
