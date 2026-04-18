// ═══════════════════════════════════════════════════════════════
// SITA OS — Quality Floor Engine
// Prevents optimization from lowering quality below thresholds.
// ═══════════════════════════════════════════════════════════════

export interface QualityFloor {
  taskClass: string;
  domain: string;
  minConfidence: number;            // 0-100
  minEvidenceCompleteness: number;  // 0-100
  minVerificationStandard: "none" | "basic" | "verified" | "double-verified";
  minTrustProofRequired: boolean;
  minOperatorClarity: number;       // 0-100
  minFreshness: number;             // 0-100
  enforcementMode: "block" | "escalate" | "reroute" | "warn";
}

export interface QualityCheckInput {
  taskClass: string;
  domain: string;
  confidence: number;
  evidenceCompleteness: number;
  verificationStandard: "none" | "basic" | "verified" | "double-verified";
  hasTrustProof: boolean;
  operatorClarity: number;
  freshness: number;
}

export interface QualityCheckResult {
  passes: boolean;
  violations: QualityViolation[];
  enforcementAction: "pass" | "block" | "escalate" | "reroute" | "warn";
  floor: QualityFloor;
  overallScore: number;
}

export interface QualityViolation {
  dimension: string;
  actual: number | string | boolean;
  required: number | string | boolean;
  severity: "critical" | "warning";
  suggestion: string;
}

// ── Default Floors ─────────────────────────────────────────

const VERIFICATION_ORDER = ["none", "basic", "verified", "double-verified"];

export const DEFAULT_QUALITY_FLOORS: QualityFloor[] = [
  { taskClass: "financial_recommendation", domain: "investment-finance", minConfidence: 85, minEvidenceCompleteness: 80, minVerificationStandard: "verified", minTrustProofRequired: true, minOperatorClarity: 75, minFreshness: 70, enforcementMode: "block" },
  { taskClass: "compliance_check", domain: "compliance-trust", minConfidence: 90, minEvidenceCompleteness: 90, minVerificationStandard: "double-verified", minTrustProofRequired: true, minOperatorClarity: 85, minFreshness: 80, enforcementMode: "block" },
  { taskClass: "self_heal", domain: "engineering", minConfidence: 80, minEvidenceCompleteness: 70, minVerificationStandard: "verified", minTrustProofRequired: true, minOperatorClarity: 60, minFreshness: 60, enforcementMode: "escalate" },
  { taskClass: "strategic_recommendation", domain: "admin-ops", minConfidence: 75, minEvidenceCompleteness: 70, minVerificationStandard: "basic", minTrustProofRequired: false, minOperatorClarity: 70, minFreshness: 50, enforcementMode: "warn" },
  { taskClass: "design_proposal", domain: "digital-presence", minConfidence: 70, minEvidenceCompleteness: 60, minVerificationStandard: "basic", minTrustProofRequired: false, minOperatorClarity: 65, minFreshness: 50, enforcementMode: "reroute" },
  { taskClass: "lead_scoring", domain: "revenue-business", minConfidence: 70, minEvidenceCompleteness: 65, minVerificationStandard: "basic", minTrustProofRequired: false, minOperatorClarity: 60, minFreshness: 60, enforcementMode: "warn" },
  { taskClass: "root_cause_analysis", domain: "engineering", minConfidence: 80, minEvidenceCompleteness: 75, minVerificationStandard: "verified", minTrustProofRequired: true, minOperatorClarity: 70, minFreshness: 65, enforcementMode: "escalate" },
  { taskClass: "release_readiness", domain: "launch-deployment", minConfidence: 85, minEvidenceCompleteness: 80, minVerificationStandard: "verified", minTrustProofRequired: true, minOperatorClarity: 75, minFreshness: 70, enforcementMode: "block" },
];

// ── Engine ──────────────────────────────────────────────────

export function getQualityFloor(taskClass: string, domain: string): QualityFloor {
  const exact = DEFAULT_QUALITY_FLOORS.find(f => f.taskClass === taskClass && f.domain === domain);
  if (exact) return exact;
  const byTask = DEFAULT_QUALITY_FLOORS.find(f => f.taskClass === taskClass);
  if (byTask) return byTask;
  // Default floor
  return {
    taskClass, domain,
    minConfidence: 65, minEvidenceCompleteness: 50,
    minVerificationStandard: "basic", minTrustProofRequired: false,
    minOperatorClarity: 50, minFreshness: 40,
    enforcementMode: "warn",
  };
}

export function checkQualityFloor(input: QualityCheckInput): QualityCheckResult {
  const floor = getQualityFloor(input.taskClass, input.domain);
  const violations: QualityViolation[] = [];

  if (input.confidence < floor.minConfidence) {
    violations.push({ dimension: "confidence", actual: input.confidence, required: floor.minConfidence, severity: "critical", suggestion: "Escalate to higher-tier model or gather more evidence" });
  }
  if (input.evidenceCompleteness < floor.minEvidenceCompleteness) {
    violations.push({ dimension: "evidence_completeness", actual: input.evidenceCompleteness, required: floor.minEvidenceCompleteness, severity: "critical", suggestion: "Gather additional evidence before proceeding" });
  }

  const actualVerIdx = VERIFICATION_ORDER.indexOf(input.verificationStandard);
  const requiredVerIdx = VERIFICATION_ORDER.indexOf(floor.minVerificationStandard);
  if (actualVerIdx < requiredVerIdx) {
    violations.push({ dimension: "verification_standard", actual: input.verificationStandard, required: floor.minVerificationStandard, severity: "critical", suggestion: "Run verification pass before delivery" });
  }

  if (floor.minTrustProofRequired && !input.hasTrustProof) {
    violations.push({ dimension: "trust_proof", actual: false, required: true, severity: "critical", suggestion: "Attach trust proof / receipt before proceeding" });
  }
  if (input.operatorClarity < floor.minOperatorClarity) {
    violations.push({ dimension: "operator_clarity", actual: input.operatorClarity, required: floor.minOperatorClarity, severity: "warning", suggestion: "Improve explanation quality" });
  }
  if (input.freshness < floor.minFreshness) {
    violations.push({ dimension: "freshness", actual: input.freshness, required: floor.minFreshness, severity: "warning", suggestion: "Refresh stale data sources" });
  }

  const passes = violations.filter(v => v.severity === "critical").length === 0;
  const score = Math.round(
    (Math.min(input.confidence, 100) + Math.min(input.evidenceCompleteness, 100) +
     Math.min(input.operatorClarity, 100) + Math.min(input.freshness, 100)) / 4
  );

  return {
    passes,
    violations,
    enforcementAction: passes ? "pass" : floor.enforcementMode,
    floor,
    overallScore: score,
  };
}
