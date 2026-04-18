// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agent Execute Action (Phase 2 Safe Autonomy)
//
// THE SOLE constrained-action execution path for internal agents.
//
// Pipeline (no bypass):
//   1. Auth (admin user OR service-role from internal-agent-loop)
//   2. Validate body shape
//   3. evaluate_action_safety_gates RPC (7-gate brain)
//   4. If denied → write denied intent + return
//   5. If requires_approval → enqueue ai_workforce_approval_queue, return queued
//   6. Insert intent (status=executing) with rollback_plan
//   7. Dispatch action_class handler against canonical primitive
//   8. Write internal_agent_actions row + ai_action_receipts row
//   9. Update intent → executed/failed, update agent runtime_state
//  10. Emit timeline_event for operator visibility
//
// Allowed action_class values (must match internal_agent_action_whitelist):
//   restart_workflow | replay_workflow | clear_stale_lock |
//   rotate_expired_token | disable_unhealthy_connector |
//   trigger_safe_repair_path | enable_connector | cancel_workflow_run
//
// Authentication:
//   - Service-role (from internal-agent-loop): JWT with role=service_role
//   - Admin user: JWT verified via getClaims, has_role(uid, 'admin') checked
// ═══════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-agent-loop, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

interface ExecuteRequest {
  agent_id: string;
  action_class: string;
  target_id: string;
  confidence: number;
  precondition_evidence: Record<string, unknown>;
  correlation_id?: string;
  rationale?: string;
  // Operator override (rollback button on /admin/health/error-patrol)
  triggered_by?: "agent" | "operator";
  rollback_intent_id?: string | null;
  // For disable_unhealthy_connector: connector_account row owner
  target_user_id?: string | null;
}

const VALID_CLASSES = new Set([
  "restart_workflow",
  "replay_workflow",
  "clear_stale_lock",
  "rotate_expired_token",
  "disable_unhealthy_connector",
  "trigger_safe_repair_path",
  "enable_connector",
  "cancel_workflow_run",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const startedAt = Date.now();
  const correlationId =
    req.headers.get("x-correlation-id") ?? crypto.randomUUID();

  // ── 1. Auth ──
  const authHeader = req.headers.get("Authorization") ?? "";
  const isLoopCaller = req.headers.get("x-internal-agent-loop") === "1";
  let actorUserId: string | null = null;
  let isServiceRole = false;

  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }
  const token = authHeader.slice("Bearer ".length);

  // Service-role detection: anon-key match (Lovable Cloud) OR service role from loop
  if (token === SERVICE_ROLE || (isLoopCaller && token === SERVICE_ROLE)) {
    isServiceRole = true;
  } else {
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data, error } = await userClient.auth.getClaims(token);
    if (error || !data?.claims?.sub) {
      return jsonResponse({ error: "unauthorized", detail: error?.message }, 401);
    }
    actorUserId = data.claims.sub as string;

    // Admin check via has_role RPC
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: hasAdmin, error: roleErr } = await adminClient.rpc("has_role", {
      _user_id: actorUserId,
      _role: "admin",
    });
    if (roleErr || !hasAdmin) {
      return jsonResponse({ error: "forbidden", detail: "admin role required" }, 403);
    }
  }

  // ── 2. Body validation ──
  let body: ExecuteRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }
  if (
    !body.agent_id ||
    !body.action_class ||
    !VALID_CLASSES.has(body.action_class) ||
    !body.target_id ||
    typeof body.confidence !== "number" ||
    !body.precondition_evidence ||
    typeof body.precondition_evidence !== "object"
  ) {
    return jsonResponse(
      {
        error: "invalid_payload",
        detail:
          "agent_id, action_class (whitelisted), target_id, confidence (number), precondition_evidence (object) required",
      },
      400,
    );
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // ── 3. Safety gates ──
  const { data: gateResult, error: gateErr } = await admin.rpc(
    "evaluate_action_safety_gates",
    {
      _agent_id: body.agent_id,
      _action_class: body.action_class,
      _target_id: body.target_id,
      _confidence: body.confidence,
      _precondition_evidence: body.precondition_evidence,
    },
  );
  if (gateErr || !gateResult) {
    return jsonResponse(
      { error: "gate_evaluation_failed", detail: gateErr?.message },
      500,
    );
  }

  const gate = gateResult as {
    allowed: boolean;
    denial_reason: string | null;
    gate_results: Array<Record<string, unknown>>;
    requires_approval: boolean;
    rollback_plan: Record<string, unknown> | null;
    whitelist_row: { is_reversible: boolean; reverse_action_class: string | null };
    agent: { agent_id: string; council: string; current_autonomy_level: string };
  };

  // Resolve owning user for the action (for receipts/intents)
  // Use target_user_id if supplied (e.g. for disable_unhealthy_connector),
  // else the actor (operator-triggered), else fall back to first admin.
  let owningUserId = body.target_user_id ?? actorUserId;
  if (!owningUserId) {
    const { data: anyAdmin } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();
    owningUserId = anyAdmin?.user_id ?? null;
  }
  if (!owningUserId) {
    return jsonResponse({ error: "no_owning_user_for_intent" }, 500);
  }

  // ── 4. Denied → record + return ──
  if (!gate.allowed) {
    const { data: deniedIntent } = await admin
      .from("internal_agent_action_intents")
      .insert({
        user_id: owningUserId,
        agent_id: body.agent_id,
        action_class: body.action_class,
        target_id: body.target_id,
        target_resource_type: gate.whitelist_row?.is_reversible
          ? "reversible"
          : "non_reversible",
        confidence: body.confidence,
        precondition_evidence: body.precondition_evidence,
        precondition_check_passed: false,
        rollback_plan: gate.rollback_plan,
        rollback_capable: !!gate.rollback_plan,
        gate_results: gate.gate_results,
        status: "denied",
        denial_reason: gate.denial_reason,
        correlation_id: correlationId,
      })
      .select("id")
      .single();

    return jsonResponse({
      status: "denied",
      reason: gate.denial_reason,
      gate_results: gate.gate_results,
      intent_id: deniedIntent?.id ?? null,
    });
  }

  // ── 5. Requires approval → enqueue + return ──
  if (gate.requires_approval) {
    const { data: approval, error: appErr } = await admin
      .from("ai_workforce_approval_queue")
      .insert({
        user_id: owningUserId,
        title: `Internal agent action: ${body.action_class}`,
        summary:
          body.rationale ??
          `Agent ${body.agent_id} requests ${body.action_class} on ${body.target_id} (confidence ${body.confidence})`,
        priority: "high",
        status: "pending",
        evidence_links: [
          {
            kind: "precondition_evidence",
            data: body.precondition_evidence,
          },
          { kind: "gate_results", data: gate.gate_results },
        ],
        cost_implications: "Constrained-action execution is bounded by safety gates",
        launch_implications: `action_class=${body.action_class} target=${body.target_id}`,
      })
      .select("id")
      .single();

    if (appErr) {
      return jsonResponse(
        { error: "approval_enqueue_failed", detail: appErr.message },
        500,
      );
    }

    const { data: pendingIntent } = await admin
      .from("internal_agent_action_intents")
      .insert({
        user_id: owningUserId,
        agent_id: body.agent_id,
        action_class: body.action_class,
        target_id: body.target_id,
        target_resource_type: gate.whitelist_row?.is_reversible
          ? "reversible"
          : "non_reversible",
        confidence: body.confidence,
        precondition_evidence: body.precondition_evidence,
        precondition_check_passed: true,
        rollback_plan: gate.rollback_plan,
        rollback_capable: !!gate.rollback_plan,
        gate_results: gate.gate_results,
        status: "approval_pending",
        approval_request_id: approval?.id ?? null,
        correlation_id: correlationId,
      })
      .select("id")
      .single();

    return jsonResponse({
      status: "approval_pending",
      approval_request_id: approval?.id,
      intent_id: pendingIntent?.id,
      gate_results: gate.gate_results,
    });
  }

  // ── 6. Allowed → write intent (executing) ──
  const { data: intent, error: intentErr } = await admin
    .from("internal_agent_action_intents")
    .insert({
      user_id: owningUserId,
      agent_id: body.agent_id,
      action_class: body.action_class,
      target_id: body.target_id,
      target_resource_type: gate.whitelist_row?.is_reversible
        ? "reversible"
        : "non_reversible",
      confidence: body.confidence,
      precondition_evidence: body.precondition_evidence,
      precondition_check_passed: true,
      rollback_plan: gate.rollback_plan,
      rollback_capable: !!gate.rollback_plan,
      gate_results: gate.gate_results,
      status: "executing",
      correlation_id: correlationId,
      rollback_intent_id: body.rollback_intent_id ?? null,
    })
    .select("id")
    .single();

  if (intentErr || !intent) {
    return jsonResponse(
      { error: "intent_create_failed", detail: intentErr?.message },
      500,
    );
  }

  // ── 7. Dispatch handler ──
  let executionResult: Record<string, unknown> = {};
  let executionError: string | null = null;

  try {
    executionResult = await dispatchAction(
      admin,
      body.action_class,
      body.target_id,
      owningUserId,
      body.precondition_evidence,
    );
  } catch (e) {
    executionError = (e as Error).message;
  }

  const succeeded = executionError === null;

  // ── 8. Write canonical action + receipt rows ──
  const { data: actionRow } = await admin
    .from("internal_agent_actions")
    .insert({
      agent_id: body.agent_id,
      council: gate.agent.council,
      action_type: body.action_class,
      autonomy_level_used: gate.agent.current_autonomy_level,
      confidence: body.confidence,
      summary: `${body.action_class} on ${body.target_id}`,
      rationale: body.rationale ?? "constrained-action via internal-agent-execute-action",
      observation_payload: body.precondition_evidence,
      execution_result: executionResult,
      rollback_data: gate.rollback_plan,
      status: succeeded ? "executed" : "failed",
      error_message: executionError,
      correlation_id: correlationId,
      duration_ms: Date.now() - startedAt,
    })
    .select("id")
    .single();

  const { data: receiptRow } = await admin
    .from("ai_action_receipts")
    .insert({
      user_id: owningUserId,
      action_type: `internal.${body.action_class}`,
      action_payload: {
        agent_id: body.agent_id,
        target_id: body.target_id,
        precondition_evidence: body.precondition_evidence,
        gate_results: gate.gate_results,
        execution_result: executionResult,
      },
      recommendation_summary: `${body.agent_id} executed ${body.action_class} on ${body.target_id}`,
      confidence: body.confidence,
      risk_tier: gate.whitelist_row?.is_reversible ? "low" : "medium",
      status: succeeded ? "executed" : "failed",
      executed_at: new Date().toISOString(),
      metadata: {
        correlation_id: correlationId,
        intent_id: intent.id,
        action_id: actionRow?.id,
        triggered_by: body.triggered_by ?? "agent",
      },
    })
    .select("id")
    .single();

  // ── 9. Update intent + agent runtime_state ──
  await admin
    .from("internal_agent_action_intents")
    .update({
      status: succeeded ? "executed" : "failed",
      execution_result: executionResult,
      error_message: executionError,
      action_id: actionRow?.id ?? null,
      receipt_id: receiptRow?.id ?? null,
      executed_at: new Date().toISOString(),
    })
    .eq("id", intent.id);

  await admin.rpc("noop").catch(() => {});
  await admin
    .from("internal_agent_runtime_state")
    .update({
      last_action_at: new Date().toISOString(),
      ...(succeeded ? {} : {}),
    })
    .eq("agent_id", body.agent_id);

  // ── 10. Timeline + linked detection update ──
  await admin.from("timeline_events").insert({
    user_id: owningUserId,
    event_type: succeeded
      ? "internal_agent.action.executed"
      : "internal_agent.action.failed",
    actor_type: "agent",
    actor_id: body.agent_id,
    subject_type: "internal_agent_action",
    subject_id: actionRow?.id ?? intent.id,
    action: body.action_class,
    description: succeeded
      ? `Agent ${body.agent_id} executed ${body.action_class} on ${body.target_id}`
      : `Agent ${body.agent_id} failed ${body.action_class}: ${executionError}`,
    metadata: {
      correlation_id: correlationId,
      intent_id: intent.id,
      receipt_id: receiptRow?.id,
      gate_results: gate.gate_results,
    },
    receipt_id: receiptRow?.id ?? null,
    domain: "internal-ai-runtime",
  });

  // Mark linked detection (if any) as agent-handled
  await admin
    .from("error_patrol_detections")
    .update({
      linked_agent_action_id: actionRow?.id ?? null,
      status: succeeded ? "agent_acted" : "needs_followup",
      updated_at: new Date().toISOString(),
    })
    .eq("target_id", body.target_id)
    .is("linked_agent_action_id", null);

  return jsonResponse({
    status: succeeded ? "executed" : "failed",
    intent_id: intent.id,
    action_id: actionRow?.id,
    receipt_id: receiptRow?.id,
    execution_result: executionResult,
    error: executionError,
    duration_ms: Date.now() - startedAt,
    correlation_id: correlationId,
  });
});

// ─── Action handlers — each calls a canonical primitive ───────
async function dispatchAction(
  admin: ReturnType<typeof createClient>,
  actionClass: string,
  targetId: string,
  owningUserId: string,
  evidence: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  switch (actionClass) {
    case "restart_workflow": {
      // Reset a stuck workflow_run to "queued" so the workflow runner picks it up.
      const { data, error } = await admin
        .from("workflow_runs")
        .update({
          status: "queued",
          next_retry_at: new Date().toISOString(),
          error: null,
          last_progress_at: new Date().toISOString(),
        })
        .eq("id", targetId)
        .select("id,status,workflow_id,current_step")
        .single();
      if (error) throw new Error(`restart_workflow failed: ${error.message}`);
      return { primitive: "workflow_runs.update", run: data };
    }

    case "replay_workflow": {
      // Create a new workflow_run row that replays the original.
      const { data: original, error: readErr } = await admin
        .from("workflow_runs")
        .select("workflow_id,user_id,context")
        .eq("id", targetId)
        .single();
      if (readErr || !original)
        throw new Error(`replay_workflow read failed: ${readErr?.message}`);
      const { data, error } = await admin
        .from("workflow_runs")
        .insert({
          workflow_id: original.workflow_id,
          user_id: original.user_id ?? owningUserId,
          status: "queued",
          context: original.context ?? {},
          replayed_from: targetId,
          started_at: new Date().toISOString(),
        })
        .select("id,workflow_id,status")
        .single();
      if (error) throw new Error(`replay_workflow insert failed: ${error.message}`);
      return { primitive: "workflow_runs.replay", original_id: targetId, replay: data };
    }

    case "clear_stale_lock": {
      // Force-clear a stuck workflow run (lock semantics) by force-terminating it.
      const { data, error } = await admin
        .from("workflow_runs")
        .update({
          status: "failed",
          error: "force-terminated by agent: stale lock cleared",
          completed_at: new Date().toISOString(),
        })
        .eq("id", targetId)
        .in("status", ["running", "queued", "retrying"])
        .select("id,status")
        .single();
      if (error) throw new Error(`clear_stale_lock failed: ${error.message}`);
      return { primitive: "workflow_runs.force_terminate", run: data };
    }

    case "rotate_expired_token": {
      // Mark connector account as needing reauth; a downstream connector worker
      // picks it up. We never hold tokens here — we flag the account.
      const { data, error } = await admin
        .from("connector_accounts")
        .update({
          status: "reauth_required",
          last_health_at: new Date().toISOString(),
          last_health_status: "expired_token_detected",
          metadata: {
            ...(evidence?.metadata ?? {}),
            rotation_requested_at: new Date().toISOString(),
            rotation_evidence: evidence,
          },
        })
        .eq("id", targetId)
        .select("id,connector_type,status")
        .single();
      if (error) throw new Error(`rotate_expired_token failed: ${error.message}`);
      return { primitive: "connector_accounts.flag_reauth", account: data };
    }

    case "disable_unhealthy_connector": {
      const { data, error } = await admin
        .from("connector_accounts")
        .update({
          status: "paused",
          disconnected_at: new Date().toISOString(),
          last_health_at: new Date().toISOString(),
          last_health_status: "paused_by_agent",
        })
        .eq("id", targetId)
        .select("id,connector_type,status")
        .single();
      if (error) throw new Error(`disable_unhealthy_connector failed: ${error.message}`);
      return { primitive: "connector_accounts.pause", account: data };
    }

    case "enable_connector": {
      // Reverse of disable — used by rollback button on /admin/health/error-patrol
      const { data, error } = await admin
        .from("connector_accounts")
        .update({
          status: "active",
          disconnected_at: null,
          last_health_at: new Date().toISOString(),
          last_health_status: "re_enabled_by_rollback",
        })
        .eq("id", targetId)
        .select("id,connector_type,status")
        .single();
      if (error) throw new Error(`enable_connector failed: ${error.message}`);
      return { primitive: "connector_accounts.reenable", account: data };
    }

    case "cancel_workflow_run": {
      // Reverse of restart/replay — cancel a queued/running run
      const { data, error } = await admin
        .from("workflow_runs")
        .update({
          status: "cancelled",
          completed_at: new Date().toISOString(),
          error: "cancelled by rollback",
        })
        .eq("id", targetId)
        .select("id,status")
        .single();
      if (error) throw new Error(`cancel_workflow_run failed: ${error.message}`);
      return { primitive: "workflow_runs.cancel", run: data };
    }

    case "trigger_safe_repair_path": {
      // Open or update an incident row so support / runbook flow can take over.
      const { data, error } = await admin
        .from("incidents")
        .insert({
          user_id: owningUserId,
          severity: (evidence?.severity as string) ?? "medium",
          title: `Safe repair path triggered by agent`,
          description: `Repair key: ${targetId}\nEvidence: ${JSON.stringify(evidence)}`,
          status: "open",
          affected_services: (evidence?.affected_services as unknown[]) ?? [],
        })
        .select("id,severity,status")
        .single();
      if (error) throw new Error(`trigger_safe_repair_path failed: ${error.message}`);
      return { primitive: "incidents.open", incident: data };
    }

    default:
      throw new Error(`unknown action_class: ${actionClass}`);
  }
}
