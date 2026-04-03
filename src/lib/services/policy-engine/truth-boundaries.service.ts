// ═══════════════════════════════════════════════════════════════
// SITA OS — Truth Boundaries Service
// Evaluates fields against TRUTH_BOUNDARIES; flags LLM violations
// ═══════════════════════════════════════════════════════════════

import { TRUTH_BOUNDARIES, type TruthBoundaryRule, type RequiredSourceType } from "@/packages/policy-contracts";

export interface TruthViolation {
  field: string;
  domain: string;
  claimedSource: string;
  requiredSource: RequiredSourceType;
  severity: "critical" | "high" | "medium";
  message: string;
}

export interface TruthEvaluationResult {
  passed: boolean;
  violations: TruthViolation[];
  evaluatedFields: number;
  timestamp: string;
}

export interface FieldClaim {
  field: string;
  domain: string;
  source: "llm" | "deterministic" | "verified-external" | "canonical-record" | "user-input";
  value: unknown;
}

export function evaluateTruthBoundaries(claims: FieldClaim[]): TruthEvaluationResult {
  const violations: TruthViolation[] = [];

  for (const claim of claims) {
    const rule = TRUTH_BOUNDARIES.find(
      (r) => r.domain === claim.domain && r.field === claim.field
    );
    if (!rule) continue;

    if (rule.neverFromLLM && claim.source === "llm") {
      violations.push({
        field: claim.field,
        domain: claim.domain,
        claimedSource: claim.source,
        requiredSource: rule.requiredSource,
        severity: "critical",
        message: `Field "${claim.field}" in domain "${claim.domain}" must never come from LLM. Required source: ${rule.requiredSource}. ${rule.description}`,
      });
    } else if (claim.source !== rule.requiredSource && claim.source !== "user-input") {
      violations.push({
        field: claim.field,
        domain: claim.domain,
        claimedSource: claim.source,
        requiredSource: rule.requiredSource,
        severity: "high",
        message: `Field "${claim.field}" source mismatch: got "${claim.source}", need "${rule.requiredSource}"`,
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    evaluatedFields: claims.length,
    timestamp: new Date().toISOString(),
  };
}

export function getBoundaryRule(domain: string, field: string): TruthBoundaryRule | undefined {
  return TRUTH_BOUNDARIES.find((r) => r.domain === domain && r.field === field);
}

export function listProtectedFields(domain?: string): TruthBoundaryRule[] {
  return domain
    ? TRUTH_BOUNDARIES.filter((r) => r.domain === domain)
    : [...TRUTH_BOUNDARIES];
}

export function isFieldProtected(domain: string, field: string): boolean {
  return TRUTH_BOUNDARIES.some((r) => r.domain === domain && r.field === field);
}
