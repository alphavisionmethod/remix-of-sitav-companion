// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Policy Map (Phase 16.2)
//
// For every edge function in EDGE_FUNCTION_REGISTRY this map
// declares the operational policy expectation:
//   • rateLimit  — strict | standard | none
//   • idempotency — required | optional | n/a
//   • auditLog   — required | optional | none
//
// Defaults are auto-derived from the registry's sideEffectClass
// so the policy map stays in lock-step with topology truth.
// ═══════════════════════════════════════════════════════════════

import { EDGE_FUNCTION_REGISTRY, type EdgeFunctionEntry } from "./edge-function-registry";

export type RateLimitPolicy = "strict" | "standard" | "none";
export type IdempotencyPolicy = "required" | "optional" | "n/a";
export type AuditLogPolicy = "required" | "optional" | "none";

export interface EdgeFunctionPolicy {
  readonly name: string;
  readonly rateLimit: RateLimitPolicy;
  readonly idempotency: IdempotencyPolicy;
  readonly auditLog: AuditLogPolicy;
  readonly rationale: string;
}

function derivePolicy(entry: EdgeFunctionEntry): EdgeFunctionPolicy {
  // Wrappers / deprecated → standard envelope, audit optional.
  if (entry.status === "deprecated" || entry.migrationStatus === "wrapper") {
    return {
      name: entry.name,
      rateLimit: "standard",
      idempotency: "optional",
      auditLog: "optional",
      rationale: "Deprecated/wrapper — forwards to canonical target",
    };
  }

  // Webhooks always need rate-limit + idempotency for replay safety.
  if (entry.category === "CONNECTOR_WEBHOOK_FUNCTION") {
    return {
      name: entry.name,
      rateLimit: "strict",
      idempotency: "required",
      auditLog: "required",
      rationale: "Webhook — provider may retry, must be replay-safe and audited",
    };
  }

  // High side-effect → strict everything.
  if (entry.sideEffectClass === "high") {
    return {
      name: entry.name,
      rateLimit: "strict",
      idempotency: "required",
      auditLog: "required",
      rationale: "High side-effect — mutations require full guard envelope",
    };
  }

  // Medium side-effect → standard rate, optional idempotency, required audit.
  if (entry.sideEffectClass === "medium") {
    return {
      name: entry.name,
      rateLimit: "standard",
      idempotency: "optional",
      auditLog: "required",
      rationale: "Medium side-effect — audit required, idempotency advisory",
    };
  }

  // BFFs aggregate, no side-effect → standard rate, no idempotency, optional audit.
  if (entry.category === "PUBLIC_BFF" || entry.category === "ADMIN_BFF") {
    return {
      name: entry.name,
      rateLimit: "standard",
      idempotency: "n/a",
      auditLog: entry.category === "ADMIN_BFF" ? "required" : "optional",
      rationale: "BFF aggregation — read-mostly composition",
    };
  }

  // Runtime / system channels — strict rate, audit required.
  if (entry.category === "RUNTIME_SYSTEM_FUNCTION") {
    return {
      name: entry.name,
      rateLimit: "strict",
      idempotency: "required",
      auditLog: "required",
      rationale: "Runtime/system channel — kernel-only command surface",
    };
  }

  // Orchestration → standard rate, idempotency required for retry chains.
  if (entry.category === "ORCHESTRATION_FUNCTION") {
    return {
      name: entry.name,
      rateLimit: "standard",
      idempotency: "required",
      auditLog: "required",
      rationale: "Orchestration — multi-step chains must be retry-safe",
    };
  }

  // Low side-effect default.
  return {
    name: entry.name,
    rateLimit: "standard",
    idempotency: "optional",
    auditLog: "optional",
    rationale: "Low side-effect domain function — standard envelope",
  };
}

export const EDGE_FUNCTION_POLICY_MAP: ReadonlyArray<EdgeFunctionPolicy> =
  EDGE_FUNCTION_REGISTRY.map(derivePolicy);

export const EDGE_FUNCTION_POLICY_INDEX: ReadonlyMap<string, EdgeFunctionPolicy> = new Map(
  EDGE_FUNCTION_POLICY_MAP.map((p) => [p.name, p]),
);

export function getEdgeFunctionPolicy(name: string): EdgeFunctionPolicy | undefined {
  return EDGE_FUNCTION_POLICY_INDEX.get(name);
}

export interface PolicyCoverageSummary {
  readonly total: number;
  readonly rateLimit: Record<RateLimitPolicy, number>;
  readonly idempotency: Record<IdempotencyPolicy, number>;
  readonly auditLog: Record<AuditLogPolicy, number>;
  readonly highRiskWithStrictRateLimit: number;
  readonly highRiskWithRequiredAudit: number;
}

export function policyCoverageSummary(): PolicyCoverageSummary {
  const rateLimit = { strict: 0, standard: 0, none: 0 } as Record<RateLimitPolicy, number>;
  const idempotency = { required: 0, optional: 0, "n/a": 0 } as Record<IdempotencyPolicy, number>;
  const auditLog = { required: 0, optional: 0, none: 0 } as Record<AuditLogPolicy, number>;
  let highRiskWithStrictRateLimit = 0;
  let highRiskWithRequiredAudit = 0;
  const highRisk = new Set(EDGE_FUNCTION_REGISTRY.filter((e) => e.sideEffectClass === "high").map((e) => e.name));
  for (const p of EDGE_FUNCTION_POLICY_MAP) {
    rateLimit[p.rateLimit]++;
    idempotency[p.idempotency]++;
    auditLog[p.auditLog]++;
    if (highRisk.has(p.name)) {
      if (p.rateLimit === "strict") highRiskWithStrictRateLimit++;
      if (p.auditLog === "required") highRiskWithRequiredAudit++;
    }
  }
  return {
    total: EDGE_FUNCTION_POLICY_MAP.length,
    rateLimit,
    idempotency,
    auditLog,
    highRiskWithStrictRateLimit,
    highRiskWithRequiredAudit,
  };
}
