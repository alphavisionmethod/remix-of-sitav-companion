// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Kill-Switch Enforcement Helper
// Phase 27 — Runtime gating for the 14 canonical kill switches.
//
// Usage (inside any edge function, after auth):
//
//   import { checkKillSwitchOrReject } from "../_shared/kill-switch.ts";
//   const blocked = await checkKillSwitchOrReject("KS-PAYMENTS", supabase);
//   if (blocked) return blocked;
//
// Returns:
//   - null  → switch is disarmed, request continues
//   - Response (HTTP 503) → switch is armed; structured negative receipt
//
// The helper queries `automation_kill_switches`, honoring the canonical
// scope hierarchy:
//   • global         (scope = "global", enabled = true)
//   • domain-scoped  (scope = "domain", scope_id = <KS-ID>)
//   • job_class      (scope = "job_class", scope_id = <KS-ID>)
//   • workflow_id    (scope = "workflow_id", scope_id = <KS-ID>)
//
// ANY armed row that matches the switch ID OR a global arm triggers refusal.
// ═══════════════════════════════════════════════════════════════

import { corsHeaders } from "./cors.ts";

// Mirrors src/lib/control-plane/kill-switch-types.ts — kept inline so the
// edge runtime has zero cross-bundle imports.
export type KillSwitchId =
  | "KS-ADVISORS"
  | "KS-OUTBOUND"
  | "KS-CONNECTORS"
  | "KS-SYNC"
  | "KS-PAYMENTS"
  | "KS-MOBILE-PUSH"
  | "KS-MODEL-PROVIDERS"
  | "KS-WORKFLOW"
  | "KS-SIMULATIONS"
  | "KS-AUTOMATIONS"
  | "KS-RELEASE-ROLLOUT"
  | "KS-APPLIANCE-UPDATE"
  | "KS-SELF-HEALING"
  | "KS-PROVIDER-INGESTION";

export interface KillSwitchHit {
  switchId: KillSwitchId;
  scope: string;
  scope_id: string | null;
  reason: string | null;
  activated_at: string | null;
}

const DEFAULT_CONSEQUENCE: Record<KillSwitchId, string> = {
  "KS-ADVISORS": "Advisor chat completions and recommendation generation are paused.",
  "KS-OUTBOUND": "All outbound emails, SMS, and pushes are queued or refused.",
  "KS-CONNECTORS": "External integrations and OAuth operations are blocked.",
  "KS-SYNC": "Connector sync runs are paused across providers.",
  "KS-PAYMENTS": "Payment capture, refunds, and gateway calls are refused.",
  "KS-MOBILE-PUSH": "VAPID web push and mobile push delivery are blocked.",
  "KS-MODEL-PROVIDERS": "All outbound LLM/model API calls are refused.",
  "KS-WORKFLOW": "Workflow engine is paused — no new runs or transitions.",
  "KS-SIMULATIONS": "Simulation engines are paused.",
  "KS-AUTOMATIONS": "Scheduled automations and cron triggers are halted.",
  "KS-RELEASE-ROLLOUT": "Release pipeline refuses to ship a new version.",
  "KS-APPLIANCE-UPDATE": "OTA appliance update channel is paused.",
  "KS-SELF-HEALING": "Autonomous repair and restart loops are paused.",
  "KS-PROVIDER-INGESTION": "Inbound webhook ingestion is acknowledged but deferred.",
};

/**
 * Build the structured 503 negative-receipt response for an active switch.
 * Exposed separately so callers that already detected a hit can return it.
 */
export function killSwitchResponse(
  switchId: KillSwitchId,
  hit?: Partial<KillSwitchHit>,
): Response {
  const body = {
    code: "KILL_SWITCH_ACTIVE",
    switchId,
    consequence: DEFAULT_CONSEQUENCE[switchId] ?? "Subsystem disabled by operator.",
    scope: hit?.scope ?? "global",
    scope_id: hit?.scope_id ?? null,
    reason: hit?.reason ?? null,
    activated_at: hit?.activated_at ?? null,
    runbookHint:
      "See KILL_SWITCH_REGISTRY.md → runbookRef for recovery procedure. Operators must disarm via /admin/automation/kill-switches.",
    retriable: false,
  };
  return new Response(JSON.stringify(body), {
    status: 503,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Retry-After": "60",
      "X-Kill-Switch": switchId,
    },
  });
}

/**
 * Check whether the given kill switch (or global) is armed.
 *
 * Returns:
 *   - `null` if the request may continue
 *   - a `Response` (HTTP 503) ready to be returned by the edge function
 *
 * The helper is fail-open on transient query errors (returns null) BUT logs
 * the failure as a structured warning so operators can detect drift.
 * Fail-open is the documented choice: a momentary DB hiccup must not break
 * the entire surface; the outer policy gate, audit trail, and per-action
 * approval flow remain in force.
 */
export async function checkKillSwitchOrReject(
  switchId: KillSwitchId,
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<Response | null> {
  try {
    const { data, error } = await supabase
      .from("automation_kill_switches")
      .select("scope, scope_id, reason, activated_at, enabled")
      .eq("enabled", true)
      .or(`scope.eq.global,scope_id.eq.${switchId}`)
      .limit(1);

    if (error) {
      console.warn(
        JSON.stringify({
          level: "warn",
          event: "kill_switch_check_failed",
          switchId,
          error: error.message,
          decision: "fail-open",
        }),
      );
      return null;
    }

    if (data && data.length > 0) {
      const row = data[0];
      // Audit the refusal so operators can prove the gate fired
      try {
        await supabase.from("audit_logs").insert({
          action: "kill_switch_refusal",
          category: "control_plane",
          actor: "edge-function",
          target_type: "kill_switch",
          target_id: row.scope_id ?? "global",
          severity: "high",
          details: {
            switchId,
            scope: row.scope,
            scope_id: row.scope_id,
            reason: row.reason,
            activated_at: row.activated_at,
          },
        });
      } catch (_auditErr) {
        // Audit failure must not block the refusal.
      }
      return killSwitchResponse(switchId, row);
    }

    return null;
  } catch (e) {
    console.warn(
      JSON.stringify({
        level: "warn",
        event: "kill_switch_check_exception",
        switchId,
        error: (e as Error).message ?? String(e),
        decision: "fail-open",
      }),
    );
    return null;
  }
}

/**
 * Variant that checks multiple switches in a single call.
 * Returns the first armed switch's 503, or null.
 */
export async function checkAnyKillSwitchOrReject(
  switchIds: readonly KillSwitchId[],
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<Response | null> {
  for (const id of switchIds) {
    const blocked = await checkKillSwitchOrReject(id, supabase);
    if (blocked) return blocked;
  }
  return null;
}
