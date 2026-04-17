// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Shared Policy Resolver (Phase 19.C)
// Deno-port subset of resolveUnifiedPolicy() for edge use.
// Every R3+ edge function MUST call this before mutating side-effects.
// ═══════════════════════════════════════════════════════════════

export type EdgePolicyActor =
  | "user"
  | "owner-admin"
  | "platform-admin"
  | "advisor"
  | "automation"
  | "service-role"
  | "support-flow"
  | "anonymous";

export type EdgePolicyDomain =
  | "business" | "money" | "concierge" | "boardroom"
  | "files" | "integrations" | "system" | "identity" | "trust" | "admin";

export type EdgeRiskClass = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";

export interface EdgePolicyQuery {
  actor: EdgePolicyActor;
  domain: EdgePolicyDomain;
  riskClass: EdgeRiskClass;
  deviceTrust?: number;          // 0–4
  biometricStepUpRecent?: boolean;
  hasJustification?: boolean;
  isReplay?: boolean;
  killSwitchActive?: boolean;
}

export interface EdgePolicyDecision {
  allowed: boolean;
  refusalReasons: string[];
  requiresStepUp: boolean;
  requiresApproval: boolean;
  requiresJustification: boolean;
  proofRequirements: string[];
}

const ACTOR_MAX_RISK: Record<EdgePolicyActor, number> = {
  anonymous: 1, "support-flow": 2, automation: 3, advisor: 3,
  user: 4, "owner-admin": 5, "platform-admin": 5, "service-role": 5,
};

const DOMAIN_RISK_TRUST_MIN: Record<EdgePolicyDomain, Record<EdgeRiskClass, number>> = {
  business:     { R0:0, R1:0, R2:1, R3:2, R4:3, R5:4 },
  money:        { R0:0, R1:1, R2:2, R3:3, R4:4, R5:4 },
  concierge:    { R0:0, R1:0, R2:1, R3:2, R4:3, R5:4 },
  boardroom:    { R0:0, R1:1, R2:2, R3:3, R4:4, R5:4 },
  files:        { R0:0, R1:0, R2:1, R3:2, R4:3, R5:4 },
  integrations: { R0:0, R1:1, R2:2, R3:3, R4:4, R5:4 },
  system:       { R0:1, R1:2, R2:3, R3:3, R4:4, R5:4 },
  identity:     { R0:1, R1:2, R2:3, R3:3, R4:4, R5:4 },
  trust:        { R0:1, R1:2, R2:3, R3:3, R4:4, R5:4 },
  admin:        { R0:2, R1:2, R2:3, R3:4, R4:4, R5:4 },
};

const RISK_NUM: Record<EdgeRiskClass, number> = { R0:0, R1:1, R2:2, R3:3, R4:4, R5:5 };

/**
 * Resolve a unified policy decision for an edge function call.
 * Returns `allowed:false` with refusal reasons on any deny condition.
 */
export function resolveUnifiedPolicy(q: EdgePolicyQuery): EdgePolicyDecision {
  const refusalReasons: string[] = [];
  const requiresStepUp = RISK_NUM[q.riskClass] >= 3 && !q.biometricStepUpRecent;
  const requiresApproval = RISK_NUM[q.riskClass] >= 4;
  const requiresJustification = RISK_NUM[q.riskClass] >= 3;

  if (q.killSwitchActive) refusalReasons.push("kill-switch-active");

  const actorMaxRisk = ACTOR_MAX_RISK[q.actor];
  if (RISK_NUM[q.riskClass] > actorMaxRisk) {
    refusalReasons.push(`actor-${q.actor}-cannot-reach-${q.riskClass}`);
  }

  const trustMin = DOMAIN_RISK_TRUST_MIN[q.domain][q.riskClass];
  if ((q.deviceTrust ?? 0) < trustMin && !q.biometricStepUpRecent) {
    refusalReasons.push(`device-trust-below-threshold (need ${trustMin}, have ${q.deviceTrust ?? 0})`);
  }

  if (requiresStepUp && !q.biometricStepUpRecent) {
    refusalReasons.push("step-up-biometric-required");
  }

  if (requiresJustification && !q.hasJustification) {
    refusalReasons.push("justification-required");
  }

  if (q.isReplay) refusalReasons.push("replay-detected");

  const proofRequirements: string[] = [];
  if (RISK_NUM[q.riskClass] >= 2) proofRequirements.push("execution-receipt");
  if (RISK_NUM[q.riskClass] >= 3) proofRequirements.push("device-attestation");
  if (RISK_NUM[q.riskClass] >= 4) proofRequirements.push("approval-receipt", "compensation-plan");
  if (RISK_NUM[q.riskClass] >= 5) proofRequirements.push("dual-control-receipt");

  return {
    allowed: refusalReasons.length === 0,
    refusalReasons,
    requiresStepUp,
    requiresApproval,
    requiresJustification,
    proofRequirements,
  };
}

/** Build a structured negative receipt response for refusals. */
export function negativeReceiptResponse(
  decision: EdgePolicyDecision,
  context: Record<string, unknown> = {}
): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      kind: "negative-receipt",
      refused: true,
      refusalReasons: decision.refusalReasons,
      requiresStepUp: decision.requiresStepUp,
      requiresApproval: decision.requiresApproval,
      requiresJustification: decision.requiresJustification,
      proofRequirements: decision.proofRequirements,
      context,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
