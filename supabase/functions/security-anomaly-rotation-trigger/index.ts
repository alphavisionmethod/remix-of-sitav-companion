// Phase 4 — Anomaly-driven secret rotation trigger
// On confirmed anomaly, calls existing secret-rotation-orchestrator with dryRun=true
// and persists result to secret_rotation_triggers. NEVER executes rotation directly —
// the existing dual-admin runbook workflow remains the only path to actual rotation.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  source_finding_id?: string | null;
  source_agent_id: string;
  secret_scope: string;
  provider_key?: string;
  anomaly_type: string;
  severity: "low" | "medium" | "high" | "critical";
  anomaly_evidence: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.secret_scope || !body.source_agent_id || !body.anomaly_type) {
    return new Response(JSON.stringify({ error: "missing_required_fields" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!["low", "medium", "high", "critical"].includes(body.severity)) {
    return new Response(JSON.stringify({ error: "invalid_severity" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body.anomaly_evidence || Object.keys(body.anomaly_evidence).length === 0) {
    return new Response(JSON.stringify({ error: "anomaly_evidence_required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Reject weak/noisy signals: only medium+ severity anomalies trigger rotation dry-run.
  if (body.severity === "low") {
    return new Response(
      JSON.stringify({ ok: false, reason: "severity_too_low_to_trigger_rotation_dryrun" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Call existing secret-rotation-orchestrator in DRY-RUN mode only.
  // Hard guardrail — this function MUST pass dryRun: true.
  const orchestratorUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/secret-rotation-orchestrator`;
  let dryRunResult: Record<string, unknown> = {};
  try {
    const resp = await fetch(orchestratorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        scope: body.secret_scope,
        provider_key: body.provider_key,
        dryRun: true, // ← never actually rotate
        triggered_by: "security-anomaly-rotation-trigger",
        triggered_by_agent: body.source_agent_id,
        anomaly_type: body.anomaly_type,
      }),
    });
    const json = await resp.json().catch(() => ({}));
    if (resp.ok) {
      dryRunResult = { ok: true, ...json };
    } else {
      dryRunResult = { error: json.error ?? `orchestrator_returned_${resp.status}`, status: resp.status };
    }
  } catch (err) {
    dryRunResult = { error: err instanceof Error ? err.message : String(err) };
  }

  // Persist trigger packet (idempotent on scope + finding)
  const { data: triggerId, error } = await supabase.rpc("trigger_anomaly_secret_rotation", {
    _source_finding_id: body.source_finding_id ?? null,
    _source_agent_id: body.source_agent_id,
    _secret_scope: body.secret_scope,
    _provider_key: body.provider_key ?? null,
    _anomaly_type: body.anomaly_type,
    _severity: body.severity,
    _anomaly_evidence: body.anomaly_evidence,
    _dryrun_result: dryRunResult,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message, dry_run_result: dryRunResult }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      trigger_id: triggerId,
      dry_run_result: dryRunResult,
      next_step: "operator_review_via_runbook",
      runbook: "RB-SECRET-ROTATION",
      executed_rotation: false,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
