// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Insurance Layer
// Hedges against hallucination and false confidence.
// ═══════════════════════════════════════════════════════════════

export type InsuranceAction =
  | "verifier_pass"
  | "consistency_check"
  | "playbook_cross_check"
  | "extra_evidence"
  | "human_review"
  | "safer_model_route";

export interface InsurancePolicy {
  policyId: string;
  domain: string;
  taskClass: string;
  minStakesLevel: "low" | "medium" | "high" | "critical";
  minUncertainty: number;           // 0-100
  requiredActions: InsuranceAction[];
  maxCostOverheadPercent: number;
  description: string;
}

export interface InsuranceEvaluation {
  shouldInsure: boolean;
  triggeredPolicies: InsurancePolicy[];
  requiredActions: InsuranceAction[];
  estimatedOverheadCents: number;
  riskMitigated: string;
  confidenceGain: number;
}

export interface InsuranceInput {
  domain: string;
  taskClass: string;
  stakesLevel: "low" | "medium" | "high" | "critical";
  uncertainty: number;
  currentConfidence: number;
  estimatedCostCents: number;
  hasPlaybook: boolean;
  hasPriorAsset: boolean;
}

// ── Default Policies ───────────────────────────────────────

const STAKES_ORDER = ["low", "medium", "high", "critical"];

export const DEFAULT_INSURANCE_POLICIES: InsurancePolicy[] = [
  { policyId: "ins-fin-critical", domain: "investment-finance", taskClass: "*", minStakesLevel: "high", minUncertainty: 30, requiredActions: ["verifier_pass", "consistency_check", "human_review"], maxCostOverheadPercent: 50, description: "Financial decisions require full insurance" },
  { policyId: "ins-compliance", domain: "compliance-trust", taskClass: "*", minStakesLevel: "medium", minUncertainty: 20, requiredActions: ["verifier_pass", "extra_evidence", "human_review"], maxCostOverheadPercent: 100, description: "Compliance always hedged" },
  { policyId: "ins-self-heal", domain: "engineering", taskClass: "self_heal", minStakesLevel: "medium", minUncertainty: 25, requiredActions: ["playbook_cross_check", "verifier_pass"], maxCostOverheadPercent: 30, description: "Self-healing actions verified against playbooks" },
  { policyId: "ins-release", domain: "launch-deployment", taskClass: "release_approval", minStakesLevel: "medium", minUncertainty: 20, requiredActions: ["consistency_check", "extra_evidence"], maxCostOverheadPercent: 40, description: "Release approvals need consistency checks" },
  { policyId: "ins-strategy", domain: "admin-ops", taskClass: "strategic_recommendation", minStakesLevel: "high", minUncertainty: 35, requiredActions: ["verifier_pass", "playbook_cross_check"], maxCostOverheadPercent: 35, description: "Strategic recommendations hedged at high stakes" },
  { policyId: "ins-revenue", domain: "revenue-business", taskClass: "*", minStakesLevel: "high", minUncertainty: 30, requiredActions: ["consistency_check", "safer_model_route"], maxCostOverheadPercent: 25, description: "Revenue decisions at high stakes get safer routing" },
];

// ── Evaluation ─────────────────────────────────────────────

export function evaluateInsurance(input: InsuranceInput): InsuranceEvaluation {
  const triggered: InsurancePolicy[] = [];

  for (const policy of DEFAULT_INSURANCE_POLICIES) {
    const domainMatch = policy.domain === input.domain || policy.domain === "*";
    const taskMatch = policy.taskClass === input.taskClass || policy.taskClass === "*";
    if (!domainMatch || !taskMatch) continue;

    const stakesIdx = STAKES_ORDER.indexOf(input.stakesLevel);
    const minStakesIdx = STAKES_ORDER.indexOf(policy.minStakesLevel);
    if (stakesIdx < minStakesIdx) continue;
    if (input.uncertainty < policy.minUncertainty) continue;

    triggered.push(policy);
  }

  if (triggered.length === 0) {
    return { shouldInsure: false, triggeredPolicies: [], requiredActions: [], estimatedOverheadCents: 0, riskMitigated: "none", confidenceGain: 0 };
  }

  const allActions = [...new Set(triggered.flatMap(p => p.requiredActions))];
  const maxOverhead = Math.max(...triggered.map(p => p.maxCostOverheadPercent));
  const overhead = Math.round(input.estimatedCostCents * (maxOverhead / 100));
  const confidenceGain = Math.min(20, allActions.length * 5);

  return {
    shouldInsure: true,
    triggeredPolicies: triggered,
    requiredActions: allActions,
    estimatedOverheadCents: overhead,
    riskMitigated: triggered.map(p => p.description).join("; "),
    confidenceGain,
  };
}
