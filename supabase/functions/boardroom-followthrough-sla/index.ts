// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Layer 7 SLA Alerter
// Scans boardroom_followthrough_dispatches for rows that have been
// stuck in `outcome_pending` (or other long-tail states) beyond the
// SLA window and pages operators via the alert-router.
//
// Default SLA windows:
//   outcome_pending      → 72h  (warning), 168h (critical)
//   dispatch_pending     → 6h
//   dispatched           → 12h
//   executing            → 24h
//
// Idempotency: writes a per-(dispatch_id × bucket) marker into
// `boardroom_followthrough_sla_alerts` so the same dispatch isn't
// re-paged within the cooldown.
//
// Auth: service-role + verify_jwt=false (cron-callable). Manual
// invocations from the admin UI must include x-admin-trigger header
// so the audit trail records who fired it.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-trigger",
};

interface SlaRule {
  state: string;
  warningHours: number;
  criticalHours: number;
}

const SLA_RULES: SlaRule[] = [
  { state: "dispatch_pending", warningHours: 6, criticalHours: 24 },
  { state: "dispatched",       warningHours: 12, criticalHours: 48 },
  { state: "executing",        warningHours: 24, criticalHours: 72 },
  { state: "outcome_pending",  warningHours: 72, criticalHours: 168 },
];

const COOLDOWN_HOURS = 12; // re-page same row at most every 12h per bucket

interface DispatchRow {
  id: string;
  user_id: string;
  boardroom_item_id: string;
  state: string;
  action_type: string;
  correlation_id: string;
  updated_at: string;
  retry_count: number;
}

function bucketFor(rule: SlaRule, ageHours: number): "warning" | "critical" | null {
  if (ageHours >= rule.criticalHours) return "critical";
  if (ageHours >= rule.warningHours) return "warning";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "missing service credentials" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supa = createClient(SUPABASE_URL, SERVICE_KEY);
  const triggeredBy = req.headers.get("x-admin-trigger") ?? "cron";

  // Pull every dispatch in any tracked state with no terminal write
  const watchedStates = SLA_RULES.map((r) => r.state);
  const { data: rows, error } = await supa
    .from("boardroom_followthrough_dispatches")
    .select("id,user_id,boardroom_item_id,state,action_type,correlation_id,updated_at,retry_count")
    .in("state", watchedStates);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = Date.now();
  const cooldownCutoff = new Date(now - COOLDOWN_HOURS * 3600 * 1000).toISOString();

  const findings: Array<{
    dispatchId: string;
    state: string;
    bucket: "warning" | "critical";
    ageHours: number;
    paged: boolean;
    skipReason?: string;
  }> = [];

  for (const row of (rows ?? []) as DispatchRow[]) {
    const rule = SLA_RULES.find((r) => r.state === row.state);
    if (!rule) continue;
    const ageHours = (now - new Date(row.updated_at).getTime()) / 3600 / 1000;
    const bucket = bucketFor(rule, ageHours);
    if (!bucket) continue;

    // De-dup: skip if we already paged this (dispatch, bucket) within cooldown
    const { data: recent } = await supa
      .from("boardroom_followthrough_sla_alerts")
      .select("id")
      .eq("dispatch_id", row.id)
      .eq("bucket", bucket)
      .gte("created_at", cooldownCutoff)
      .limit(1);
    if (recent && recent.length > 0) {
      findings.push({ dispatchId: row.id, state: row.state, bucket, ageHours, paged: false, skipReason: "cooldown" });
      continue;
    }

    const severity: "warning" | "error" | "critical" =
      bucket === "critical" ? "critical" : "warning";
    const title =
      bucket === "critical"
        ? `Layer 7 dispatch CRITICAL — stuck in ${row.state} for ${ageHours.toFixed(1)}h`
        : `Layer 7 dispatch SLA breach — stuck in ${row.state} for ${ageHours.toFixed(1)}h`;
    const summary =
      `Dispatch ${row.id} (action=${row.action_type}, item=${row.boardroom_item_id}) ` +
      `has been in '${row.state}' since ${row.updated_at}. ` +
      `Triggered by: ${triggeredBy}. Retries=${row.retry_count}.`;

    // Page operators via the canonical alert-router
    const alertRes = await fetch(`${SUPABASE_URL}/functions/v1/alert-router`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        source: "boardroom-followthrough-sla",
        severity,
        title,
        summary,
        runbook: "RB-BOARDROOM-L7-STUCK",
        killSwitchSuggested: bucket === "critical" ? "KS-BOARDROOM-FOLLOWTHROUGH" : null,
        evidence: {
          dispatch_id: row.id,
          boardroom_item_id: row.boardroom_item_id,
          state: row.state,
          age_hours: Math.round(ageHours * 10) / 10,
          correlation_id: row.correlation_id,
          retry_count: row.retry_count,
        },
        incidentId: `l7-sla-${row.id}-${bucket}`,
      }),
    });
    const alertOk = alertRes.ok;

    // Persist marker so we don't re-page within cooldown
    await supa.from("boardroom_followthrough_sla_alerts").insert({
      dispatch_id: row.id,
      boardroom_item_id: row.boardroom_item_id,
      user_id: row.user_id,
      state: row.state,
      bucket,
      age_hours: Math.round(ageHours * 10) / 10,
      severity,
      triggered_by: triggeredBy,
      alert_router_ok: alertOk,
      payload: { correlation_id: row.correlation_id, action_type: row.action_type },
    });

    findings.push({ dispatchId: row.id, state: row.state, bucket, ageHours, paged: alertOk });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      scannedAt: new Date().toISOString(),
      triggeredBy,
      totalRowsScanned: rows?.length ?? 0,
      breaches: findings.length,
      paged: findings.filter((f) => f.paged).length,
      cooldownSkips: findings.filter((f) => f.skipReason === "cooldown").length,
      findings,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
