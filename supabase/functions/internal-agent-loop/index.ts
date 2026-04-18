// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agent Runtime Loop (Phase 3 Bridge)
//
// Single canonical loop that:
//   1. Determines which internal agents are due
//   2. Reuses the canonical AI runtime (gateway + budget + receipts)
//   3. Persists actions, escalations, and updates runtime state
//   4. Respects kill-switches, cooldowns, suspension, autonomy caps
//
// Modes:
//   - "scheduled" (default, called by pg_cron) → evaluates all active agents
//   - "manual" + agentId → operator-triggered single-agent run
// ═══════════════════════════════════════════════════════════════
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { checkAIBudget } from "../_shared/ai-budget-check.ts";

// ─── AI Gateway integration (canonical pattern) ────────────────
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface AICallResult {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

async function callAIGateway(
  systemPrompt: string,
  userPrompt: string,
  modelId: string,
): Promise<AICallResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    throw new Error("LOVABLE_API_KEY not configured");
  }
  const res = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI gateway ${res.status}: ${err}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const usage = data.usage ?? {};
  // Rough cost: $0.075/1M in, $0.30/1M out for Gemini Flash → cents
  const promptTokens = Number(usage.prompt_tokens ?? 0);
  const completionTokens = Number(usage.completion_tokens ?? 0);
  const totalTokens = Number(usage.total_tokens ?? promptTokens + completionTokens);
  const estimatedCostUsd =
    (promptTokens / 1_000_000) * 0.075 + (completionTokens / 1_000_000) * 0.3;
  return {
    content,
    model: modelId,
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUsd,
  };
}

// ─── Cron expression evaluation ────────────────────────────────
// Lightweight evaluator: supports "*/N", "N", "*", and combinations
// for the standard 5-field cron format (min hour day month dow).
function isCronDue(cron: string, now: Date, lastRunAt: Date | null): boolean {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const [minPart, hourPart, dayPart, monthPart, dowPart] = parts;

  const fields: Array<[string, number]> = [
    [minPart, now.getUTCMinutes()],
    [hourPart, now.getUTCHours()],
    [dayPart, now.getUTCDate()],
    [monthPart, now.getUTCMonth() + 1],
    [dowPart, now.getUTCDay()],
  ];

  function fieldMatches(spec: string, value: number): boolean {
    if (spec === "*") return true;
    if (spec.startsWith("*/")) {
      const step = parseInt(spec.slice(2), 10);
      return Number.isFinite(step) && step > 0 && value % step === 0;
    }
    // comma list
    if (spec.includes(",")) {
      return spec.split(",").some((p) => fieldMatches(p, value));
    }
    // range
    if (spec.includes("-")) {
      const [a, b] = spec.split("-").map((n) => parseInt(n, 10));
      return value >= a && value <= b;
    }
    const num = parseInt(spec, 10);
    return Number.isFinite(num) && num === value;
  }

  const allMatch = fields.every(([spec, value]) => fieldMatches(spec, value));
  if (!allMatch) return false;

  // Don't re-run inside the same minute bucket (idempotency)
  if (lastRunAt) {
    const sameMinute =
      Math.floor(lastRunAt.getTime() / 60_000) ===
      Math.floor(now.getTime() / 60_000);
    if (sameMinute) return false;
  }
  return true;
}

// ─── Build per-agent system + observation prompt ──────────────
function buildAgentPrompts(def: any, evidence: Record<string, unknown>) {
  const system = `You are an internal SITA OS workforce agent.

ID: ${def.agent_id}
Name: ${def.name}
Council: ${def.council}
Mission: ${def.mission}
Special ability: ${def.special_ability}
Current autonomy: ${def.current_autonomy_level} (max ${def.max_autonomy_level})
Memory scope: ${def.memory_scope}
Allowed tools: ${JSON.stringify(def.tools_allowed)}
Forbidden tools: ${JSON.stringify(def.tools_forbidden)}
Confidence threshold to act: ${def.confidence_threshold_act}
Confidence threshold to recommend: ${def.confidence_threshold_recommend}

You MUST respond with strict JSON conforming to:
{
  "observation": string,
  "diagnosis": string,
  "recommendation": string | null,
  "confidence": number,
  "evidence_refs": string[],
  "should_escalate": boolean,
  "escalation_reason": string | null,
  "severity": "low" | "moderate" | "high" | "critical"
}

Rules:
- Be precise, terse, and operator-grade.
- Never propose actions outside your scope or beyond your current autonomy level.
- If insufficient evidence, set confidence < 0.4 and should_escalate = false.
- If unrecoverable risk detected, set should_escalate = true with severity.`;
  const user = `Scheduled tick. Evidence:\n${JSON.stringify(evidence, null, 2)}`;
  return { system, user };
}

// ─── Per-agent runner ──────────────────────────────────────────
interface RunResult {
  agentId: string;
  status: "ran" | "skipped" | "error" | "blocked";
  reason: string;
  actionId?: string;
  invocationId?: string;
  escalationId?: string;
  durationMs: number;
}

async function runAgent(
  supabase: any,
  def: any,
  state: any,
  reason: string,
): Promise<RunResult> {
  const startedAt = Date.now();
  const now = new Date();

  // Suspension check
  if (state?.current_status === "suspended") {
    return { agentId: def.agent_id, status: "skipped", reason: "suspended", durationMs: 0 };
  }
  // Cooldown check
  if (state?.cooldown_until && new Date(state.cooldown_until) > now) {
    return { agentId: def.agent_id, status: "skipped", reason: "cooldown", durationMs: 0 };
  }

  // Kill-switch check (canonical scope: internal-agents.<council>.<agent_id>)
  const killScopes = [
    `internal-agents.${def.council}.${def.agent_id}`,
    `internal-agents.${def.council}`,
    `internal-agents`,
  ];
  const { data: switches } = await supabase
    .from("automation_kill_switches")
    .select("scope_id, switch_id, enabled, expires_at")
    .eq("enabled", true)
    .in("scope_id", killScopes);
  const activeKill = (switches ?? []).find(
    (s: any) => !s.expires_at || new Date(s.expires_at) > now,
  );
  if (activeKill) {
    return {
      agentId: def.agent_id,
      status: "blocked",
      reason: `kill-switch:${activeKill.scope_id}`,
      durationMs: Date.now() - startedAt,
    };
  }

  // Daily invocation cap
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { count: dailyCount } = await supabase
    .from("internal_agent_actions")
    .select("id", { count: "exact", head: true })
    .eq("agent_id", def.agent_id)
    .gte("created_at", since);
  if ((dailyCount ?? 0) >= def.max_invocations_per_day) {
    return {
      agentId: def.agent_id,
      status: "skipped",
      reason: "daily_cap_reached",
      durationMs: Date.now() - startedAt,
    };
  }

  // Mark as running
  await supabase
    .from("internal_agent_runtime_state")
    .update({ current_status: "running", last_run_at: now.toISOString() })
    .eq("agent_id", def.agent_id);

  try {
    // Budget check via canonical RPC. For internal agents, user_id may be null
    // because they run system-wide; for owner-scoped agents, pick the actor.
    // Use the function caller (admin or service role) as the budget owner.
    const { data: { user } } = await supabase.auth.getUser();
    const budgetUserId = user?.id ?? "00000000-0000-0000-0000-000000000000";
    const capabilityKey = `internal-agent.${def.council}.${def.agent_id}`;
    let modelId = "google/gemini-3-flash-preview";

    if (user?.id) {
      const decision = await checkAIBudget(supabase, user.id, capabilityKey, 0.005);
      if (decision.shouldBlock) {
        await supabase
          .from("internal_agent_runtime_state")
          .update({ current_status: "idle" })
          .eq("agent_id", def.agent_id);
        return {
          agentId: def.agent_id,
          status: "blocked",
          reason: `budget:${decision.reason}`,
          durationMs: Date.now() - startedAt,
        };
      }
      if (decision.shouldDowngrade && decision.fallbackModelId) {
        modelId = decision.fallbackModelId;
      }
    }

    // Gather evidence per memory scope (light, system-tier introspection)
    const evidence: Record<string, unknown> = {
      tick_at: now.toISOString(),
      reason,
      consecutive_failures: state?.consecutive_failures ?? 0,
      last_success_at: state?.last_success_at ?? null,
      open_escalations_count: 0,
    };
    const { count: escCount } = await supabase
      .from("council_escalations")
      .select("id", { count: "exact", head: true })
      .eq("source_agent_id", def.agent_id)
      .in("status", ["open", "acknowledged", "escalated_to_meta"]);
    evidence.open_escalations_count = escCount ?? 0;

    // Call AI gateway
    const { system, user: userPrompt } = buildAgentPrompts(def, evidence);
    let aiResult: AICallResult;
    try {
      aiResult = await callAIGateway(system, userPrompt, modelId);
    } catch (e) {
      // Record failure, increment consecutive_failures, escalate if threshold
      const failures = (state?.consecutive_failures ?? 0) + 1;
      await supabase
        .from("internal_agent_runtime_state")
        .update({
          current_status: failures >= 3 ? "error" : "idle",
          last_failure_at: new Date().toISOString(),
          consecutive_failures: failures,
          total_failures: (state?.total_failures ?? 0) + 1,
          total_runs: (state?.total_runs ?? 0) + 1,
          last_failure_reason: e instanceof Error ? e.message : String(e),
        })
        .eq("agent_id", def.agent_id);

      let escalationId: string | undefined;
      if (failures >= 3) {
        const { data: esc } = await supabase
          .from("council_escalations")
          .insert({
            source_agent_id: def.agent_id,
            source_council: def.council,
            target_supervisor: def.primary_escalation_target,
            escalation_reason: `Agent failed ${failures} consecutive runs`,
            severity: "high",
            evidence: { error: e instanceof Error ? e.message : String(e) } as never,
            status: "open",
          })
          .select("id")
          .single();
        escalationId = esc?.id;
      }
      return {
        agentId: def.agent_id,
        status: "error",
        reason: e instanceof Error ? e.message : String(e),
        escalationId,
        durationMs: Date.now() - startedAt,
      };
    }

    // Parse AI response
    let parsed: any = {};
    try {
      parsed = JSON.parse(aiResult.content);
    } catch {
      parsed = { observation: aiResult.content, confidence: 0, should_escalate: false };
    }
    const confidence = Number(parsed.confidence ?? 0);
    const shouldEscalate = Boolean(parsed.should_escalate);
    const severity = parsed.severity ?? "moderate";

    // Insert canonical AI invocation receipt (reuses ai_workforce_invocations)
    let invocationId: string | null = null;
    if (user?.id) {
      const { data: inv } = await supabase
        .from("ai_workforce_invocations")
        .insert({
          user_id: user.id,
          role_key: def.agent_id,
          task_key: capabilityKey,
          status: "succeeded",
          mode: "auto",
          budget_posture: "normal",
          model_used: aiResult.model,
          tokens_in: aiResult.promptTokens,
          tokens_out: aiResult.completionTokens,
          cost_cents: Math.round(aiResult.estimatedCostUsd * 100),
          duration_ms: Date.now() - startedAt,
          scope_type: "internal-agent",
          scope_ref: def.agent_id,
          scope_payload: {
            council: def.council,
            autonomy: def.current_autonomy_level,
          } as never,
        })
        .select("id")
        .single();
      invocationId = inv?.id ?? null;
    }

    // Decide action lifecycle from autonomy level
    const autonomy = def.current_autonomy_level;
    let actionStatus = "completed";
    let approvalRequestId: string | null = null;

    if (autonomy === "approval_ready" && parsed.recommendation) {
      // queue for human approval
      const { data: approval } = await supabase
        .from("ai_workforce_approval_queue")
        .insert({
          user_id: user?.id ?? budgetUserId,
          title: `[${def.name}] ${String(parsed.recommendation).slice(0, 80)}`,
          summary: parsed.recommendation,
          priority: severity === "critical" ? "critical" : severity === "high" ? "high" : "normal",
          status: "pending",
          evidence_links: { ai_response: parsed, evidence } as never,
          launch_implications: parsed.diagnosis ?? null,
        })
        .select("id")
        .single();
      approvalRequestId = approval?.id ?? null;
      actionStatus = "pending_approval";
    }

    // Insert action row
    const { data: actionRow } = await supabase
      .from("internal_agent_actions")
      .insert({
        agent_id: def.agent_id,
        council: def.council,
        action_type: autonomy === "observe" ? "observation" : autonomy,
        autonomy_level_used: autonomy,
        confidence,
        observation: parsed.observation ?? null,
        diagnosis: parsed.diagnosis ?? null,
        recommendation: parsed.recommendation ?? null,
        evidence_refs: (parsed.evidence_refs ?? []) as never,
        invocation_id: invocationId,
        approval_request_id: approvalRequestId,
        status: actionStatus,
        cost_cents: Math.round(aiResult.estimatedCostUsd * 100),
        duration_ms: Date.now() - startedAt,
        ai_model_used: aiResult.model,
        ai_tokens_used: aiResult.totalTokens,
      })
      .select("id")
      .single();

    // Escalation if low confidence OR explicit
    let escalationId: string | undefined;
    const minConfidence = autonomy === "observe"
      ? def.confidence_threshold_recommend
      : def.confidence_threshold_act;
    if (shouldEscalate || (parsed.recommendation && confidence < minConfidence)) {
      const { data: esc } = await supabase
        .from("council_escalations")
        .insert({
          source_agent_id: def.agent_id,
          source_council: def.council,
          source_action_id: actionRow?.id ?? null,
          target_supervisor: def.primary_escalation_target,
          escalation_reason:
            parsed.escalation_reason ??
            `Confidence ${confidence} below threshold ${minConfidence}`,
          severity,
          evidence: { ai_response: parsed, evidence } as never,
          status: "open",
        })
        .select("id")
        .single();
      escalationId = esc?.id;
    }

    // Update runtime state — success path
    const newTrust = Math.min(
      1,
      Math.max(0, (state?.trust_score ?? 0.5) * 0.95 + confidence * 0.05),
    );
    await supabase
      .from("internal_agent_runtime_state")
      .update({
        current_status: "idle",
        last_run_at: now.toISOString(),
        last_success_at: now.toISOString(),
        consecutive_failures: 0,
        total_runs: (state?.total_runs ?? 0) + 1,
        total_successes: (state?.total_successes ?? 0) + 1,
        trust_score: Math.round(newTrust * 1000) / 1000,
        last_action_summary: String(parsed.observation ?? "").slice(0, 240),
      })
      .eq("agent_id", def.agent_id);

    return {
      agentId: def.agent_id,
      status: "ran",
      reason: "success",
      actionId: actionRow?.id,
      invocationId: invocationId ?? undefined,
      escalationId,
      durationMs: Date.now() - startedAt,
    };
  } catch (e) {
    await supabase
      .from("internal_agent_runtime_state")
      .update({
        current_status: "error",
        last_failure_at: new Date().toISOString(),
        last_failure_reason: e instanceof Error ? e.message : String(e),
        consecutive_failures: (state?.consecutive_failures ?? 0) + 1,
        total_failures: (state?.total_failures ?? 0) + 1,
        total_runs: (state?.total_runs ?? 0) + 1,
      })
      .eq("agent_id", def.agent_id);
    return {
      agentId: def.agent_id,
      status: "error",
      reason: e instanceof Error ? e.message : String(e),
      durationMs: Date.now() - startedAt,
    };
  }
}

// ─── Auto-escalate stale escalations to meta-supervisor ────────
async function processStaleEscalations(supabase: any) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: stale } = await supabase
    .from("council_escalations")
    .select("id, source_agent_id, severity")
    .in("status", ["open", "acknowledged"])
    .lt("created_at", cutoff)
    .eq("target_supervisor", "" /* placeholder */)
    .limit(50);
  // The above .eq is wrong on purpose - we want anything not already at meta
  const { data: realStale } = await supabase
    .from("council_escalations")
    .select("id, source_agent_id, severity, target_supervisor")
    .in("status", ["open", "acknowledged"])
    .lt("created_at", cutoff)
    .neq("target_supervisor", "chief-of-staff")
    .limit(50);

  let escalated = 0;
  for (const e of realStale ?? []) {
    await supabase
      .from("council_escalations")
      .update({
        status: "escalated_to_meta",
        target_supervisor: "chief-of-staff",
        meta_escalated_at: new Date().toISOString(),
      })
      .eq("id", e.id);
    escalated++;
  }
  return escalated;
}

// ─── Phase 2 priority-agent bridges ────────────────────────────
// Real signal-to-action bridges for the 3 constrained-action-ready agents.
// Every bridge calls the canonical internal-agent-execute-action edge function
// over HTTPS with service-role auth — bridges CANNOT bypass the 7-gate
// evaluate_action_safety_gates RPC (single safety brain).
//
// Confidence policy:
//   - aw-incident-response: 0.85 (above any whitelist threshold → autoexec when allowed)
//   - aw-ai-spend-control:  0.72 (below 0.75 threshold → forces approval queue)
//   - aw-security-monitor:  N/A (escalate-only in Phase 2; never calls executor)
// ───────────────────────────────────────────────────────────────
interface BridgeResult {
  agentId: string;
  signalsProcessed: number;
  actionsDispatched: number;
  approvalsQueued: number;
  escalationsCreated: number;
  errors: string[];
}

async function callExecuteAction(
  agentId: string,
  actionClass: string,
  targetId: string,
  confidence: number,
  precondition: Record<string, unknown>,
  targetUserId?: string | null,
): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/internal-agent-execute-action`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "x-internal-agent-loop": "true",
      },
      body: JSON.stringify({
        agent_id: agentId,
        action_class: actionClass,
        target_id: targetId,
        confidence,
        precondition_evidence: precondition,
        triggered_by: "agent",
        target_user_id: targetUserId ?? null,
        rationale: `priority-bridge:${agentId}:${actionClass}`,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error ?? `HTTP ${res.status}` };
    return { ok: true, status: json?.status ?? "dispatched" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function bridgeIncidentResponse(supabase: any): Promise<BridgeResult> {
  const result: BridgeResult = {
    agentId: "aw-incident-response",
    signalsProcessed: 0,
    actionsDispatched: 0,
    approvalsQueued: 0,
    escalationsCreated: 0,
    errors: [],
  };

  // Signal source: stale-locked workflow runs (last_progress_at > 30min)
  const { data: stale, error } = await supabase.rpc("list_stale_locked_workflow_runs", {
    _max_age_minutes: 30,
  });
  if (error) {
    result.errors.push(`rpc:list_stale_locked_workflow_runs:${error.message}`);
    return result;
  }
  for (const row of stale ?? []) {
    result.signalsProcessed++;
    const r = await callExecuteAction(
      "aw-incident-response",
      "clear_stale_lock",
      row.id,
      0.85,
      {
        signal: "stale_locked_workflow_run",
        workflow_id: row.workflow_id,
        last_progress_at: row.last_progress_at,
        detected_by: "aw-incident-response.bridge",
      },
      row.user_id,
    );
    if (r.ok) {
      if (r.status === "queued_for_approval") result.approvalsQueued++;
      else if (r.status === "executed") result.actionsDispatched++;
    } else {
      result.errors.push(`clear_stale_lock:${row.id}:${r.error}`);
    }
  }
  return result;
}

async function bridgeSpendControl(supabase: any): Promise<BridgeResult> {
  const result: BridgeResult = {
    agentId: "aw-ai-spend-control",
    signalsProcessed: 0,
    actionsDispatched: 0,
    approvalsQueued: 0,
    escalationsCreated: 0,
    errors: [],
  };

  // Signal source: critical AI budget alerts (alert_state=critical, last hour)
  const { data: alerts, error } = await supabase
    .from("ai_budget_alerts")
    .select("id,user_id,scope_type,scope_ref,alert_state,observed_cost_usd,threshold_percent")
    .eq("alert_state", "critical")
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .limit(10);
  if (error) {
    result.errors.push(`select:ai_budget_alerts:${error.message}`);
    return result;
  }

  // Use the canonical service-role helper so every bridge discovery
  // path is auditable and uniform across agents.
  const { data: unhealthy, error: unhealthyError } = await supabase.rpc("list_unhealthy_connector_accounts");
  if (unhealthyError) {
    result.errors.push(`rpc:list_unhealthy_connector_accounts:${unhealthyError.message}`);
    return result;
  }

  for (const a of alerts ?? []) {
    // Pair each critical budget alert with the most-recently unhealthy connector
    // owned by the same user and propose disabling it (forces approval at 0.72).
    const target = (unhealthy ?? []).find((c: any) => c.user_id === a.user_id);
    if (!target) continue;

    result.signalsProcessed++;
    const r = await callExecuteAction(
      "aw-ai-spend-control",
      "disable_unhealthy_connector",
      target.id,
      0.72, // below 0.75 → routes through approval queue
      {
        signal: "critical_budget_alert",
        budget_alert_id: a.id,
        observed_cost_usd: a.observed_cost_usd,
        threshold_percent: a.threshold_percent,
        target_connector: target.connector_type,
        target_display_name: target.display_name,
        target_status: target.status,
        detected_by: "aw-ai-spend-control.bridge",
      },
      a.user_id,
    );
    if (r.ok) {
      if (r.status === "queued_for_approval") result.approvalsQueued++;
      else if (r.status === "executed") result.actionsDispatched++;
    } else {
      result.errors.push(`disable_unhealthy_connector:${target.id}:${r.error}`);
    }
  }
  return result;
}

async function bridgeSecurityMonitor(supabase: any): Promise<BridgeResult> {
  const result: BridgeResult = {
    agentId: "aw-security-monitor",
    signalsProcessed: 0,
    actionsDispatched: 0,
    approvalsQueued: 0,
    escalationsCreated: 0,
    errors: [],
  };

  // Phase 2 policy: security-monitor is escalate-only. No calls to executor.
  const { data: events, error } = await supabase.rpc("list_unescalated_security_events", {
    _lookback_minutes: 60,
  });
  if (error) {
    result.errors.push(`rpc:list_unescalated_security_events:${error.message}`);
    return result;
  }
  for (const ev of events ?? []) {
    result.signalsProcessed++;
    const { data: esc, error: insErr } = await supabase
      .from("council_escalations")
      .insert({
        source_agent_id: "aw-security-monitor",
        source_council: "security-trust",
        target_supervisor: "sup-security",
        escalation_reason: `Security event: ${ev.action} (${ev.severity})`,
        severity: ev.severity === "critical" ? "critical" : "high",
        evidence: {
          audit_id: ev.audit_id,
          action: ev.action,
          target_type: ev.target_type,
          target_id: ev.target_id,
          created_at: ev.created_at,
          detected_by: "aw-security-monitor.bridge",
          escalate_only: true,
        } as never,
        status: "open",
      })
      .select("id")
      .single();
    if (insErr) {
      result.errors.push(`escalate:${ev.audit_id}:${insErr.message}`);
    } else if (esc) {
      result.escalationsCreated++;
    }
  }
  return result;
}

async function runPriorityAgentBridges(supabase: any): Promise<BridgeResult[]> {
  const out: BridgeResult[] = [];
  for (const fn of [bridgeIncidentResponse, bridgeSpendControl, bridgeSecurityMonitor]) {
    try {
      out.push(await fn(supabase));
    } catch (e) {
      out.push({
        agentId: fn.name,
        signalsProcessed: 0,
        actionsDispatched: 0,
        approvalsQueued: 0,
        escalationsCreated: 0,
        errors: [e instanceof Error ? e.message : String(e)],
      });
    }
  }
  return out;
}

// ─── HTTP entry ────────────────────────────────────────────────
serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      },
    );

    let body: { mode?: "scheduled" | "manual"; agentId?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = { mode: "scheduled" };
    }
    const mode = body.mode ?? "scheduled";

    // Manual single-agent run (admin trigger)
    if (mode === "manual" && body.agentId) {
      const { data: def } = await supabase
        .from("internal_agent_definitions")
        .select("*")
        .eq("agent_id", body.agentId)
        .maybeSingle();
      if (!def) return corsError(`agent ${body.agentId} not found`, 404);
      const { data: state } = await supabase
        .from("internal_agent_runtime_state")
        .select("*")
        .eq("agent_id", body.agentId)
        .maybeSingle();
      const result = await runAgent(supabase, def, state, "manual_trigger");
      return corsResponse({ ok: true, mode: "manual", result });
    }

    // Scheduled tick — evaluate all active agents
    const { data: defs, error: defErr } = await supabase
      .from("internal_agent_definitions")
      .select("*")
      .eq("is_active", true);
    if (defErr) throw defErr;

    const { data: states } = await supabase
      .from("internal_agent_runtime_state")
      .select("*");
    const stateByAgent = new Map<string, any>();
    (states ?? []).forEach((s: any) => stateByAgent.set(s.agent_id, s));

    const now = new Date();
    const results: RunResult[] = [];
    let dueCount = 0;

    for (const def of defs ?? []) {
      const state = stateByAgent.get(def.agent_id);
      const lastRunAt = state?.last_run_at ? new Date(state.last_run_at) : null;
      if (!isCronDue(def.schedule_cron, now, lastRunAt)) continue;
      dueCount++;
      const result = await runAgent(supabase, def, state, "scheduled");
      results.push(result);
    }

    // Stale escalation auto-routing (every tick)
    const escalated = await processStaleEscalations(supabase);

    // Phase 2: priority-agent signal-to-action bridges
    // (incident-response, ai-spend-control, security-monitor)
    const bridges = await runPriorityAgentBridges(supabase);

    return corsResponse({
      ok: true,
      mode: "scheduled",
      tick_at: now.toISOString(),
      total_agents: defs?.length ?? 0,
      due_count: dueCount,
      ran_count: results.filter((r) => r.status === "ran").length,
      skipped_count: results.filter((r) => r.status === "skipped").length,
      blocked_count: results.filter((r) => r.status === "blocked").length,
      error_count: results.filter((r) => r.status === "error").length,
      meta_escalations_routed: escalated,
      priority_bridges: bridges,
      results,
    });
  } catch (e) {
    console.error("[internal-agent-loop] fatal:", e);
    return corsError(e instanceof Error ? e.message : String(e), 500);
  }
});
