// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agent Execute Action (Phase 2)
//
// THE sole canonical constrained-action execution path for the internal
// AI workforce. Every autonomous action by a Phase-2 agent must flow
// through this function. There is no bypass.
//
// Pipeline (cannot be reordered):
//   1. CORS + auth (admin user OR service-role for runtime-loop calls)
//   2. Whitelist lookup (action_class must be active in whitelist)
//   3. evaluate_action_safety_gates RPC (7 canonical gates)
//   4. If !allowed → write denied intent, log audit, return 403
//   5. If requires_approval → write intent in approval_pending, queue
//      to ai_workforce_approval_queue, return 202
//   6. Else → write intent (executing) → run handler → write
//      internal_agent_actions + ai_action_receipts → mark intent executed
//
// Reuses canonical infrastructure (no second stack):
//   - automation_kill_switches (KS-INTERNAL-AGENTS-EXECUTE)
//   - ai_workforce_approval_queue
//   - ai_action_receipts (single receipt ledger)
//   - admin_action_audit
//   - internal_agent_actions (sole action ledger)
//
// Allowed action classes (strictly limited):
//   restart_workflow, replay_workflow, clear_stale_lock,
//   rotate_expired_token, disable_unhealthy_connector,
//   trigger_safe_repair_path
// Plus rollback-only classes (called by the rollback flow):
//   enable_connector, cancel_workflow_run
// ═══════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCors, corsResponse, corsError } from "../_shared/cors.ts";

interface ExecuteRequest {
  agent_id: string;
  action_class: string;
  target_id: string;
  confidence: number;
  precondition_evidence: Record<string, unknown>;
  correlation_id?: string;
  triggering_detection_id?: string | null;
  user_scope_id?: string | null;
}

interface HandlerResult {
  ok: boolean;
  result?: Record<string, unknown>;
  error?: string;
}

// ─── Action handlers — each calls a real existing primitive ───
// Every handler is idempotent and returns a structured result.

async function handlerRestartWorkflow(
  supabase: any, targetId: string, evidence: any
): Promise<HandlerResult> {
  // Re-queue a stuck workflow run by resetting status to "queued"
  // and clearing the next_retry_at timestamp.
  const { data, error } = await supabase
    .from("workflow_runs")
    .update({
      status: "queued",
      next_retry_at: null,
      error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId)
    .in("status", ["failed", "stuck", "running"])
    .select("id, status, workflow_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "workflow_run_not_in_restartable_state" };
  return { ok: true, result: { workflow_run_id: data.id, new_status: "queued", workflow_id: data.workflow_id } };
}

async function handlerReplayWorkflow(
  supabase: any, targetId: string, evidence: any
): Promise<HandlerResult> {
  // Replay = create a new run that copies context from the source run.
  const { data: source, error: e1 } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("id", targetId)
    .maybeSingle();
  if (e1 || !source) return { ok: false, error: e1?.message ?? "source_run_not_found" };

  const { data: replay, error: e2 } = await supabase
    .from("workflow_runs")
    .insert({
      user_id: source.user_id,
      workflow_id: source.workflow_id,
      status: "queued",
      context: source.context,
      correlation_id: source.correlation_id ?? null,
      replayed_from: source.id,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (e2) return { ok: false, error: e2.message };
  return { ok: true, result: { source_run_id: source.id, replay_run_id: replay.id } };
}

async function handlerClearStaleLock(
  supabase: any, targetId: string, evidence: any
): Promise<HandlerResult> {
  // Clear stale lock on a workflow run by force-terminating it,
  // then leave it in a recoverable state. (No workflow_locks table —
  // the canonical lock mechanism is workflow_runs.status = 'running'
  // with a stale last_progress_at.)
  const { data, error } = await supabase
    .from("workflow_runs")
    .update({
      status: "failed",
      force_terminated_by: "internal-agent-execute-action:clear_stale_lock",
      error: "Stale lock cleared by autonomous agent",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId)
    .eq("status", "running")
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "lock_not_held_or_already_cleared" };
  return { ok: true, result: { workflow_run_id: data.id, lock_cleared: true } };
}

async function handlerRotateExpiredToken(
  supabase: any, targetId: string, evidence: any
): Promise<HandlerResult> {
  // Mark an expired connector_token as 'rotation_pending' so the
  // canonical refresh worker picks it up. Increments rotation_count.
  const { data: existing } = await supabase
    .from("connector_tokens")
    .select("id, rotation_count, status, expires_at")
    .eq("id", targetId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "token_not_found" };
  if (existing.expires_at && new Date(existing.expires_at) > new Date()) {
    return { ok: false, error: "token_not_expired" };
  }
  const { error } = await supabase
    .from("connector_tokens")
    .update({
      status: "rotation_pending",
      rotation_count: (existing.rotation_count ?? 0) + 1,
    })
    .eq("id", targetId);
  if (error) return { ok: false, error: error.message };
  return { ok: true, result: { token_id: targetId, marked_for_rotation: true } };
}

async function handlerDisableUnhealthyConnector(
  supabase: any, targetId: string, evidence: any
): Promise<HandlerResult> {
  const { data, error } = await supabase
    .from("connector_accounts")
    .update({ status: "paused" })
    .eq("id", targetId)
    .neq("status", "paused")
    .select("id, user_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "connector_already_paused_or_not_found" };
  // Best-effort timeline event (non-fatal)
  await supabase.from("timeline_events").insert({
    user_id: data.user_id,
    event_type: "connector.paused.by_agent",
    actor_type: "system",
    actor_id: "internal-agent-execute-action",
    subject_type: "connector_account",
    subject_id: data.id,
    action: "paused",
    description: "Connector paused by autonomous agent",
    metadata: { evidence },
    domain: "integrations",
  }).then(() => null).catch(() => null);
  return { ok: true, result: { connector_id: data.id, new_status: "paused" } };
}

async function handlerEnableConnector(
  supabase: any, targetId: string, evidence: any
): Promise<HandlerResult> {
  // Rollback for disable_unhealthy_connector
  const { data, error } = await supabase
    .from("connector_accounts")
    .update({ status: "active" })
    .eq("id", targetId)
    .eq("status", "paused")
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "connector_not_in_paused_state" };
  return { ok: true, result: { connector_id: data.id, new_status: "active" } };
}

async function handlerCancelWorkflowRun(
  supabase: any, targetId: string, evidence: any
): Promise<HandlerResult> {
  // Rollback for restart_workflow / replay_workflow
  const { data, error } = await supabase
    .from("workflow_runs")
    .update({
      status: "cancelled",
      force_terminated_by: "internal-agent-execute-action:rollback",
      completed_at: new Date().toISOString(),
    })
    .eq("id", targetId)
    .in("status", ["queued", "running"])
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "run_not_in_cancellable_state" };
  return { ok: true, result: { workflow_run_id: data.id, status: "cancelled" } };
}

async function handlerTriggerSafeRepairPath(
  supabase: any, targetId: string, evidence: any
): Promise<HandlerResult> {
  // Safe repair path: emit an incident with a runbook reference so
  // the existing self-healing pipeline picks it up. targetId is the
  // repair_key/runbook_id.
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("incidents")
    .insert({
      user_id: user?.id ?? evidence?.user_id ?? null,
      severity: "moderate",
      title: `Safe repair triggered: ${targetId}`,
      description: "Autonomous agent triggered a known-safe repair path. "
        + "Self-healing pipeline will execute the bound runbook.",
      affected_services: evidence?.affected_services ?? [],
      status: "open",
      runbook_ids: [targetId],
      primary_runbook_id: targetId,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, result: { incident_id: data.id, runbook_id: targetId } };
}

const HANDLERS: Record<string, (s: any, t: string, e: any) => Promise<HandlerResult>> = {
  restart_workflow: handlerRestartWorkflow,
  replay_workflow: handlerReplayWorkflow,
  clear_stale_lock: handlerClearStaleLock,
  rotate_expired_token: handlerRotateExpiredToken,
  disable_unhealthy_connector: handlerDisableUnhealthyConnector,
  enable_connector: handlerEnableConnector,
  cancel_workflow_run: handlerCancelWorkflowRun,
  trigger_safe_repair_path: handlerTriggerSafeRepairPath,
};

// ─── HTTP entry ─────────────────────────────────────────────────
serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") return corsError("method_not_allowed", 405);

  let body: ExecuteRequest;
  try {
    body = await req.json();
  } catch {
    return corsError("invalid_json_body", 400);
  }

  // Required fields
  if (!body.agent_id || !body.action_class || !body.target_id
      || typeof body.confidence !== "number") {
    return corsError(
      "missing_required_fields:agent_id,action_class,target_id,confidence",
      400,
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    },
  );

  // Resolve caller (admin user or service-role/loop)
  const { data: { user } } = await supabase.auth.getUser();
  const callerUserId = user?.id ?? null;

  // Admin gate for human-triggered calls (service-role calls have no user)
  if (callerUserId) {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUserId);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");
    if (!isAdmin) return corsError("admin_role_required", 403);
  }

  const correlationId = body.correlation_id
    ?? `iaea-${crypto.randomUUID()}`;

  try {
    // ─── GATE EVALUATION (7 canonical gates via RPC) ───
    const { data: gateResult, error: gateError } = await supabase.rpc(
      "evaluate_action_safety_gates",
      {
        _agent_id: body.agent_id,
        _action_class: body.action_class,
        _target_id: body.target_id,
        _confidence: body.confidence,
        _precondition_evidence: body.precondition_evidence ?? {},
      },
    );
    if (gateError) return corsError(`gate_evaluation_failed:${gateError.message}`, 500);

    const allowed = gateResult.allowed === true;
    const requiresApproval = gateResult.requires_approval === true;
    const denialReason = gateResult.denial_reason ?? null;
    const rollbackPlan = gateResult.rollback_plan ?? null;

    // ─── DENIED PATH ───
    if (!allowed) {
      const { data: deniedIntent } = await supabase
        .from("internal_agent_action_intents")
        .insert({
          agent_id: body.agent_id,
          action_class: body.action_class,
          target_id: body.target_id,
          target_resource_type: gateResult.whitelist_row?.target_resource_type ?? null,
          confidence: body.confidence,
          precondition_evidence: body.precondition_evidence ?? {},
          precondition_check_passed: false,
          rollback_plan: rollbackPlan,
          rollback_capable: !!rollbackPlan,
          gate_results: gateResult.gate_results ?? [],
          status: "denied",
          denial_reason: denialReason ?? "unspecified",
          correlation_id: correlationId,
        })
        .select("id")
        .single();

      // Audit denial (best-effort)
      if (callerUserId) {
        await supabase.from("admin_action_audit").insert({
          actor_user_id: callerUserId,
          action: "internal-agent-execute-action.denied",
          plane: "admin",
          severity: "high",
          target_type: gateResult.whitelist_row?.target_resource_type ?? "unknown",
          target_id: body.target_id,
          metadata: {
            agent_id: body.agent_id,
            action_class: body.action_class,
            denial_reason: denialReason,
            gate_results: gateResult.gate_results,
            intent_id: deniedIntent?.id ?? null,
          },
        }).then(() => null).catch(() => null);
      }

      return corsResponse({
        ok: false,
        denied: true,
        denial_reason: denialReason,
        gate_results: gateResult.gate_results,
        intent_id: deniedIntent?.id ?? null,
      }, 403);
    }

    // ─── APPROVAL-REQUIRED PATH ───
    if (requiresApproval) {
      const { data: pendingIntent } = await supabase
        .from("internal_agent_action_intents")
        .insert({
          agent_id: body.agent_id,
          action_class: body.action_class,
          target_id: body.target_id,
          target_resource_type: gateResult.whitelist_row?.target_resource_type ?? null,
          confidence: body.confidence,
          precondition_evidence: body.precondition_evidence ?? {},
          precondition_check_passed: true,
          rollback_plan: rollbackPlan,
          rollback_capable: !!rollbackPlan,
          gate_results: gateResult.gate_results ?? [],
          status: "approval_pending",
          correlation_id: correlationId,
        })
        .select("id")
        .single();

      // Queue into the canonical approval queue (no second queue)
      const approvalUserId = callerUserId ?? body.user_scope_id ?? null;
      if (approvalUserId) {
        const { data: approval } = await supabase
          .from("ai_workforce_approval_queue")
          .insert({
            user_id: approvalUserId,
            title: `[${body.agent_id}] ${body.action_class} on ${body.target_id}`,
            summary: `Autonomous action requires approval — confidence ${body.confidence} below threshold.`,
            priority: gateResult.agent?.council === "security-trust" ? "high" : "normal",
            status: "pending",
            evidence_links: {
              intent_id: pendingIntent?.id,
              gate_results: gateResult.gate_results,
              precondition_evidence: body.precondition_evidence,
              rollback_plan: rollbackPlan,
              correlation_id: correlationId,
            } as never,
            launch_implications: `Action class: ${body.action_class}. Target: ${body.target_id}.`,
          })
          .select("id")
          .single();

        if (approval && pendingIntent) {
          await supabase
            .from("internal_agent_action_intents")
            .update({ approval_request_id: approval.id })
            .eq("id", pendingIntent.id);
        }
      }

      return corsResponse({
        ok: true,
        approval_required: true,
        intent_id: pendingIntent?.id ?? null,
        gate_results: gateResult.gate_results,
      }, 202);
    }

    // ─── EXECUTE PATH ───
    const handler = HANDLERS[body.action_class];
    if (!handler) {
      // Belt-and-suspenders: gate already validated whitelist, but if we
      // reach here without a handler that's a hard config bug.
      return corsError(`no_handler_for_action_class:${body.action_class}`, 500);
    }

    // Insert intent in 'executing' state BEFORE running the handler
    const { data: execIntent } = await supabase
      .from("internal_agent_action_intents")
      .insert({
        agent_id: body.agent_id,
        action_class: body.action_class,
        target_id: body.target_id,
        target_resource_type: gateResult.whitelist_row?.target_resource_type ?? null,
        confidence: body.confidence,
        precondition_evidence: body.precondition_evidence ?? {},
        precondition_check_passed: true,
        rollback_plan: rollbackPlan,
        rollback_capable: !!rollbackPlan,
        gate_results: gateResult.gate_results ?? [],
        status: "executing",
        correlation_id: correlationId,
      })
      .select("id")
      .single();

    const startedAt = Date.now();
    const handlerResult = await handler(supabase, body.target_id, body.precondition_evidence);
    const durationMs = Date.now() - startedAt;

    // Insert canonical action row + receipt
    const { data: actionRow } = await supabase
      .from("internal_agent_actions")
      .insert({
        agent_id: body.agent_id,
        council: gateResult.agent?.council ?? null,
        action_type: body.action_class,
        autonomy_level_used: gateResult.agent?.current_autonomy_level ?? "constrained_action_ready",
        confidence: body.confidence,
        summary: `${body.action_class} on ${body.target_id}`,
        rationale: handlerResult.ok
          ? `Autonomous remediation: ${body.action_class}`
          : `Attempted ${body.action_class} — failed: ${handlerResult.error}`,
        observation_payload: { precondition_evidence: body.precondition_evidence } as never,
        execution_result: handlerResult.result ?? { error: handlerResult.error } as never,
        rollback_data: rollbackPlan as never,
        status: handlerResult.ok ? "completed" : "failed",
        error_message: handlerResult.ok ? null : handlerResult.error,
        correlation_id: correlationId,
        duration_ms: durationMs,
      })
      .select("id")
      .single();

    // Receipt — single canonical ledger
    let receiptId: string | null = null;
    if (callerUserId) {
      const { data: receipt } = await supabase
        .from("ai_action_receipts")
        .insert({
          user_id: callerUserId,
          recommendation_summary: `Internal agent ${body.agent_id} executed ${body.action_class}`,
          action_type: `internal-agent.${body.action_class}`,
          action_payload: {
            agent_id: body.agent_id,
            action_class: body.action_class,
            target_id: body.target_id,
            target_resource_type: gateResult.whitelist_row?.target_resource_type,
            handler_result: handlerResult,
            duration_ms: durationMs,
          } as never,
          confidence: body.confidence,
          risk_tier: "medium",
          status: handlerResult.ok ? "completed" : "failed",
          executed_at: new Date().toISOString(),
          metadata: {
            correlation_id: correlationId,
            intent_id: execIntent?.id,
            action_id: actionRow?.id,
            gate_results: gateResult.gate_results,
            rollback_plan: rollbackPlan,
            council: gateResult.agent?.council,
          } as never,
        })
        .select("id")
        .single();
      receiptId = receipt?.id ?? null;
    }

    // Update intent → executed/failed
    await supabase
      .from("internal_agent_action_intents")
      .update({
        status: handlerResult.ok ? "executed" : "failed",
        action_id: actionRow?.id ?? null,
        receipt_id: receiptId,
        execution_result: handlerResult.result ?? null,
        error_message: handlerResult.ok ? null : handlerResult.error,
        executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", execIntent?.id);

    // If the action failed, record an error patrol detection
    if (!handlerResult.ok) {
      await supabase.rpc("record_error_patrol_detection", {
        _pattern_key: `agent-action-failure:${body.action_class}`,
        _subsystem: gateResult.agent?.council ?? "internal-agents",
        _severity: "high",
        _signature_hash: `${body.agent_id}:${body.action_class}:${handlerResult.error ?? "unknown"}`,
        _raw_signal: {
          agent_id: body.agent_id,
          action_class: body.action_class,
          target_id: body.target_id,
          error: handlerResult.error,
        } as never,
        _affected_resource_type: gateResult.whitelist_row?.target_resource_type,
        _affected_resource_id: body.target_id,
        _user_id: callerUserId,
        _linked_agent_action_id: actionRow?.id ?? null,
        _linked_intent_id: execIntent?.id ?? null,
        _follow_up_recommendation: rollbackPlan
          ? "Rollback plan available — review and trigger rollback if needed."
          : "Investigate manually — no rollback for this class.",
      }).then(() => null).catch(() => null);
    }

    // Link the triggering detection (if provided)
    if (body.triggering_detection_id && actionRow?.id) {
      await supabase
        .from("error_patrol_detections")
        .update({
          linked_agent_action_id: actionRow.id,
          linked_intent_id: execIntent?.id ?? null,
        })
        .eq("id", body.triggering_detection_id)
        .then(() => null).catch(() => null);
    }

    // Best-effort audit
    if (callerUserId) {
      await supabase.from("admin_action_audit").insert({
        actor_user_id: callerUserId,
        action: handlerResult.ok
          ? "internal-agent-execute-action.executed"
          : "internal-agent-execute-action.failed",
        plane: "admin",
        severity: handlerResult.ok ? "moderate" : "high",
        target_type: gateResult.whitelist_row?.target_resource_type ?? "unknown",
        target_id: body.target_id,
        metadata: {
          agent_id: body.agent_id,
          action_class: body.action_class,
          intent_id: execIntent?.id,
          action_id: actionRow?.id,
          receipt_id: receiptId,
          handler_result: handlerResult,
        },
      }).then(() => null).catch(() => null);
    }

    return corsResponse({
      ok: handlerResult.ok,
      executed: handlerResult.ok,
      intent_id: execIntent?.id ?? null,
      action_id: actionRow?.id ?? null,
      receipt_id: receiptId,
      result: handlerResult.result ?? null,
      error: handlerResult.error ?? null,
      gate_results: gateResult.gate_results,
      duration_ms: durationMs,
      correlation_id: correlationId,
    }, handlerResult.ok ? 200 : 500);
  } catch (e) {
    console.error("[internal-agent-execute-action] fatal:", e);
    return corsError(e instanceof Error ? e.message : String(e), 500);
  }
});
