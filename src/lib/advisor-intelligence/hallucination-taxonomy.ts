// ═══════════════════════════════════════════════════════════════
// SITA OS — Hallucination Taxonomy & Advanced Verification
// Classification, detection, incident tracking, and the full
// anti-hallucination control stack
// ═══════════════════════════════════════════════════════════════

import type {
  RecommendationV2,
  StructuredClaim,
  CritiqueResult,
  VerificationPass,
  AdvisorSpecializationContract,
} from "./types";
import { getSpecialization } from "./specializations";

// ── Hallucination Taxonomy ────────────────────────────────

export type HallucinationType =
  | "fabricated-fact"         // Stated something as fact with zero evidence
  | "inflated-confidence"    // Claimed higher certainty than evidence supports
  | "stale-assertion"        // Used expired/stale data as if current
  | "scope-overreach"        // Made claims outside advisor's domain
  | "false-precision"        // Gave specific numbers without specific evidence
  | "memory-confabulation"   // Mixed up or fabricated memory-derived claims
  | "temporal-confusion"     // Confused past/present/future states
  | "entity-confusion"       // Mixed up entities (wrong client, wrong account)
  | "causal-invention"       // Invented causal relationships not in evidence
  | "policy-fabrication"     // Cited policies or rules that don't exist
  | "projection-as-fact"     // Presented a projection/forecast as established fact
  | "silent-assumption"      // Made critical assumption without declaring it
  | "contradiction-hiding"   // Failed to surface known contradictions
  | "source-misattribution"; // Attributed data to wrong source

export type HallucinationSeverity = "cosmetic" | "misleading" | "material" | "dangerous";

export interface HallucinationIncident {
  id: string;
  advisorId: string;
  sessionId: string;
  recommendationId: string;
  type: HallucinationType;
  severity: HallucinationSeverity;
  description: string;
  affectedClaims: string[];
  detectedBy: "verifier" | "user-report" | "post-execution" | "cross-advisor" | "audit";
  detectedAt: string;
  rootCause?: string;
  correctionApplied?: string;
  preventionRule?: string;
}

// ── Severity Classification ───────────────────────────────

export function classifyHallucinationSeverity(
  type: HallucinationType,
  domain: string,
  trustSensitivity: string,
): HallucinationSeverity {
  // Dangerous: financial/trust-critical fabrications
  const dangerousTypes: HallucinationType[] = [
    "fabricated-fact", "false-precision", "policy-fabrication", "entity-confusion"
  ];
  if (dangerousTypes.includes(type) && (trustSensitivity === "critical" || trustSensitivity === "veto-capable")) {
    return "dangerous";
  }

  // Material: affects decisions
  const materialTypes: HallucinationType[] = [
    "fabricated-fact", "inflated-confidence", "stale-assertion",
    "causal-invention", "projection-as-fact", "contradiction-hiding",
  ];
  if (materialTypes.includes(type)) return "material";

  // Misleading: could lead to wrong conclusions
  const misleadingTypes: HallucinationType[] = [
    "scope-overreach", "memory-confabulation", "temporal-confusion",
    "silent-assumption", "source-misattribution",
  ];
  if (misleadingTypes.includes(type)) return "misleading";

  return "cosmetic";
}

// ── Anti-Hallucination Control Stack ──────────────────────
// Layered from retrieval → assembly → generation → verification → output

export type ControlLayer =
  | "retrieval"     // Layer 1: What data reaches the advisor
  | "assembly"      // Layer 2: How context is filtered and compressed
  | "generation"    // Layer 3: Constitutional rules during generation
  | "verification"  // Layer 4: Post-generation verification passes
  | "output"        // Layer 5: Final output gating before user display
  | "feedback";     // Layer 6: Post-delivery monitoring

export interface AntiHallucinationControl {
  id: string;
  layer: ControlLayer;
  name: string;
  description: string;
  alwaysActive: boolean;
  blocksOutput: boolean;
  latencyImpactMs: number;
}

export const ANTI_HALLUCINATION_CONTROLS: AntiHallucinationControl[] = [
  // Layer 1: Retrieval
  { id: "ahc-01", layer: "retrieval", name: "Evidence-bound retrieval", description: "Only retrieve from verified data sources with provenance", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-02", layer: "retrieval", name: "Freshness-gated sourcing", description: "Tag all sources with freshness; block stale sources for deterministic fields", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-03", layer: "retrieval", name: "Domain-scoped filtering", description: "Enforce forbidden context rules — advisor never sees out-of-scope data", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },

  // Layer 2: Assembly
  { id: "ahc-04", layer: "assembly", name: "Gap declaration", description: "Explicitly enumerate missing required inputs in briefing packet", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-05", layer: "assembly", name: "Contradiction pre-detection", description: "Detect cross-source contradictions before advisor sees data", alwaysActive: true, blocksOutput: false, latencyImpactMs: 50 },
  { id: "ahc-06", layer: "assembly", name: "Token-budget compression", description: "Prioritize high-evidence content; trim low-confidence material first", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },

  // Layer 3: Generation
  { id: "ahc-07", layer: "generation", name: "Constitutional separation", description: "System prompt requires fact/inference/recommendation separation", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-08", layer: "generation", name: "Evidence citation requirement", description: "Every claim must reference source IDs from briefing packet", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-09", layer: "generation", name: "Unknown declaration enforcement", description: "Model must output unknowns section when evidence is thin", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-10", layer: "generation", name: "Deterministic field grounding", description: "Numbers, dates, amounts must reference specific sources — never generated", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },

  // Layer 4: Verification
  { id: "ahc-11", layer: "verification", name: "Factuality verifier", description: "Check all fact-type claims have evidence refs", alwaysActive: true, blocksOutput: true, latencyImpactMs: 20 },
  { id: "ahc-12", layer: "verification", name: "Unsupported claim suppressor", description: "Claims matching neverClaimWithoutEvidence list without grounding are blocked", alwaysActive: true, blocksOutput: true, latencyImpactMs: 10 },
  { id: "ahc-13", layer: "verification", name: "Cross-advisor contradiction check", description: "Compare claims across council members", alwaysActive: false, blocksOutput: false, latencyImpactMs: 50 },
  { id: "ahc-14", layer: "verification", name: "Simulation-requirement gate", description: "Block action recs from simulation-required advisors without sim results", alwaysActive: true, blocksOutput: true, latencyImpactMs: 10 },
  { id: "ahc-15", layer: "verification", name: "Scope violation detector", description: "Block claims referencing forbidden domains", alwaysActive: true, blocksOutput: true, latencyImpactMs: 10 },
  { id: "ahc-16", layer: "verification", name: "Confidence cap enforcer", description: "Ensure confidence does not exceed caps from evidence sufficiency", alwaysActive: true, blocksOutput: false, latencyImpactMs: 5 },
  { id: "ahc-17", layer: "verification", name: "Policy compliance checker", description: "Verify recommendations don't violate known policies", alwaysActive: true, blocksOutput: true, latencyImpactMs: 15 },

  // Layer 5: Output
  { id: "ahc-18", layer: "output", name: "Abstention gate", description: "If confidence below floor after all checks, output refusal with explanation", alwaysActive: true, blocksOutput: true, latencyImpactMs: 5 },
  { id: "ahc-19", layer: "output", name: "Unknowns section injection", description: "Force unknowns/missing-info section into user-facing output", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-20", layer: "output", name: "Disagreement disclosure", description: "If council disagreed, surface dissenting views to user", alwaysActive: false, blocksOutput: false, latencyImpactMs: 0 },

  // Layer 6: Feedback
  { id: "ahc-21", layer: "feedback", name: "Post-execution outcome check", description: "After execution, compare predicted vs actual outcomes", alwaysActive: false, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-22", layer: "feedback", name: "User correction capture", description: "When user corrects, log as hallucination incident", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
  { id: "ahc-23", layer: "feedback", name: "Calibration drift detector", description: "Track confidence vs outcomes for calibration monitoring", alwaysActive: true, blocksOutput: false, latencyImpactMs: 0 },
];

// ── Verification Decision Tree ────────────────────────────

export type VerificationDecision =
  | "pass"                    // Output as-is
  | "pass-with-caveats"       // Output but add uncertainty caveats
  | "revise-and-recheck"      // Remove offending claims, recheck
  | "downgrade-to-observation" // Convert recommendation to observation
  | "block-and-abstain"       // Refuse to output, explain why
  | "escalate-to-user"        // Ask user to clarify/decide
  | "escalate-to-trust";      // Route to trust governance

export interface VerificationDecisionNode {
  condition: string;
  check: (rec: RecommendationV2, critiques: CritiqueResult[]) => boolean;
  decision: VerificationDecision;
  explanation: string;
}

export const VERIFICATION_DECISION_TREE: VerificationDecisionNode[] = [
  {
    condition: "Dangerous hallucination detected",
    check: (_, c) => c.some(cr => cr.type === "hallucination-risk" && cr.severity === "block"),
    decision: "block-and-abstain",
    explanation: "Claims matching never-claim-without-evidence rules lack grounding — cannot output safely",
  },
  {
    condition: "Trust-critical policy violation",
    check: (_, c) => c.some(cr => cr.type === "trust-sensitivity" && cr.severity === "block"),
    decision: "escalate-to-trust",
    explanation: "Trust threshold not met for this domain — routing to trust governance",
  },
  {
    condition: "Scope violation (forbidden context)",
    check: (_, c) => c.some(cr => cr.type === "scope-violation" && !cr.passed),
    decision: "revise-and-recheck",
    explanation: "Advisor referenced forbidden context — must be removed before output",
  },
  {
    condition: "Required simulation missing",
    check: (rec, c) => c.some(cr => cr.type === "policy-compliance" && cr.severity === "block"),
    decision: "block-and-abstain",
    explanation: "Simulation required by advisor policy but not run — cannot recommend action",
  },
  {
    condition: "Zero evidence sources",
    check: (rec) => rec.evidenceBundle.totalSources === 0,
    decision: "block-and-abstain",
    explanation: "No evidence sources present — recommendation has no factual basis",
  },
  {
    condition: "Critical freshness",
    check: (rec) => rec.evidenceBundle.overallFreshness === "critical",
    decision: "downgrade-to-observation",
    explanation: "All data is critically stale — downgrading to observation only",
  },
  {
    condition: "Active contradictions",
    check: (_, c) => c.some(cr => cr.type === "contradiction" && !cr.passed),
    decision: "pass-with-caveats",
    explanation: "Contradictions detected — output will include caveat about conflicting data",
  },
  {
    condition: "Ungrounded facts present",
    check: (_, c) => c.some(cr => cr.type === "factuality" && !cr.passed),
    decision: "revise-and-recheck",
    explanation: "Some facts lack evidence backing — must be reclassified as inferences/unknowns",
  },
  {
    condition: "Evidence moderate but present",
    check: (_, c) => c.some(cr => cr.type === "evidence-sufficiency" && cr.severity === "warning"),
    decision: "pass-with-caveats",
    explanation: "Evidence is thin but present — adding confidence caveat",
  },
  {
    condition: "All checks pass",
    check: () => true,
    decision: "pass",
    explanation: "All verification checks passed — output approved",
  },
];

export function runVerificationDecisionTree(
  rec: RecommendationV2,
  critiques: CritiqueResult[],
): { decision: VerificationDecision; explanation: string; matchedRule: string } {
  for (const node of VERIFICATION_DECISION_TREE) {
    if (node.check(rec, critiques)) {
      return { decision: node.decision, explanation: node.explanation, matchedRule: node.condition };
    }
  }
  return { decision: "pass", explanation: "No rules matched — default pass", matchedRule: "default" };
}

// ── When to Say "I Don't Know" ────────────────────────────

export interface AbstentionRule {
  id: string;
  condition: string;
  action: "abstain" | "ask-clarification" | "refuse" | "cap-confidence" | "require-simulation" | "ignore-memory" | "show-disagreement" | "escalate-human";
  applies: (rec: RecommendationV2, spec: AdvisorSpecializationContract) => boolean;
}

export const ABSTENTION_RULES: AbstentionRule[] = [
  {
    id: "abs-01",
    condition: "Evidence sufficiency below 30%",
    action: "abstain",
    applies: (rec) => rec.evidenceBundle.totalSources === 0 || rec.evidenceBundle.gapsDetected.length > 3,
  },
  {
    id: "abs-02",
    condition: "Confidence below advisor floor",
    action: "refuse",
    applies: (rec, spec) => rec.confidenceBreakdown.score < spec.confidenceFloor,
  },
  {
    id: "abs-03",
    condition: "Missing critical inputs exceed 50%",
    action: "ask-clarification",
    applies: (rec, spec) => {
      const missing = spec.requiredContext.filter(c => rec.evidenceBundle.gapsDetected.some(g => g.includes(c)));
      return missing.length > spec.requiredContext.length * 0.5;
    },
  },
  {
    id: "abs-04",
    condition: "Simulation required but not run",
    action: "require-simulation",
    applies: (rec, spec) => spec.simulationPolicy === "required-for-action" && !rec.simulationBasis.ran,
  },
  {
    id: "abs-05",
    condition: "All data sources stale or critical",
    action: "cap-confidence",
    applies: (rec) => rec.dataFreshness.overallFreshness === "stale" || rec.dataFreshness.overallFreshness === "critical",
  },
  {
    id: "abs-06",
    condition: "Memory conflicts with live data on deterministic field",
    action: "ignore-memory",
    applies: (rec) => rec.contradictionFlags.length > 0,
  },
  {
    id: "abs-07",
    condition: "Council members materially disagree",
    action: "show-disagreement",
    applies: () => false, // evaluated at council level, not per-recommendation
  },
  {
    id: "abs-08",
    condition: "Trust-critical recommendation with insufficient evidence",
    action: "escalate-human",
    applies: (rec, spec) => spec.trustSensitivity === "critical" && rec.confidenceBreakdown.score < 0.6,
  },
];

export function evaluateAbstentionRules(
  rec: RecommendationV2,
): { triggeredRules: AbstentionRule[]; primaryAction: AbstentionRule["action"] } {
  const spec = getSpecialization(rec.advisorId);
  if (!spec) return { triggeredRules: [], primaryAction: "abstain" };

  const triggered = ABSTENTION_RULES.filter(r => r.applies(rec, spec));
  const actionPriority: AbstentionRule["action"][] = [
    "escalate-human", "refuse", "abstain", "require-simulation",
    "ask-clarification", "ignore-memory", "cap-confidence", "show-disagreement",
  ];

  const primaryAction = triggered.length > 0
    ? actionPriority.find(a => triggered.some(r => r.action === a)) || "cap-confidence"
    : "cap-confidence";

  return { triggeredRules: triggered, primaryAction: primaryAction as AbstentionRule["action"] };
}
