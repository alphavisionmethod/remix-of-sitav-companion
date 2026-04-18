// ═══════════════════════════════════════════════════════════════
// SITA OS — Differential Reasoning Engine
// Reasons over what changed rather than full re-analysis.
// Compares current vs. last verified state, detects material
// deltas, and runs partial reasoning when safe.
// ═══════════════════════════════════════════════════════════════

export interface VerifiedState {
  stateId: string;
  domain: string;
  scopeId: string;
  stateHash: string;
  snapshot: Record<string, unknown>;
  verifiedAt: string;
  reasoningArtifactId?: string;       // links to intelligence asset
  confidence: number;
}

export interface MaterialDelta {
  deltaId: string;
  field: string;
  previousValue: unknown;
  currentValue: unknown;
  changeType: "added" | "removed" | "modified" | "threshold-crossed";
  materialityScore: number;           // 0-100
  invalidatesPriorReasoning: boolean;
  requiresPartialReasoning: boolean;
  requiresFullReasoning: boolean;
}

export interface DifferentialAnalysis {
  analysisId: string;
  domain: string;
  previousStateId: string;
  currentStateHash: string;
  deltas: MaterialDelta[];
  totalMateriality: number;           // aggregate score
  priorReasoningValid: boolean;
  recommendedAction: "reuse-as-is" | "partial-update" | "full-reanalysis" | "escalate";
  estimatedCostIfFull: number;        // cents
  estimatedCostIfPartial: number;     // cents
  estimatedCostIfReuse: number;       // cents
  confidenceInReuse: number;          // 0-100
  invalidationTriggers: string[];
  timestamp: string;
}

export function analyzeDifferential(
  previous: VerifiedState,
  currentSnapshot: Record<string, unknown>,
  currentHash: string,
): DifferentialAnalysis {
  const deltas: MaterialDelta[] = [];

  // Compare keys
  const allKeys = new Set([...Object.keys(previous.snapshot), ...Object.keys(currentSnapshot)]);
  for (const key of allKeys) {
    const prev = previous.snapshot[key];
    const curr = currentSnapshot[key];
    if (prev === undefined && curr !== undefined) {
      deltas.push({ deltaId: `d-${key}`, field: key, previousValue: prev, currentValue: curr, changeType: "added", materialityScore: 60, invalidatesPriorReasoning: false, requiresPartialReasoning: true, requiresFullReasoning: false });
    } else if (prev !== undefined && curr === undefined) {
      deltas.push({ deltaId: `d-${key}`, field: key, previousValue: prev, currentValue: curr, changeType: "removed", materialityScore: 70, invalidatesPriorReasoning: true, requiresPartialReasoning: false, requiresFullReasoning: true });
    } else if (JSON.stringify(prev) !== JSON.stringify(curr)) {
      const materiality = typeof curr === "number" && typeof prev === "number"
        ? Math.min(100, Math.abs((curr - prev) / (prev || 1)) * 100)
        : 50;
      deltas.push({ deltaId: `d-${key}`, field: key, previousValue: prev, currentValue: curr, changeType: "modified", materialityScore: Math.round(materiality), invalidatesPriorReasoning: materiality > 80, requiresPartialReasoning: materiality > 30, requiresFullReasoning: materiality > 80 });
    }
  }

  const totalMateriality = deltas.length > 0
    ? Math.round(deltas.reduce((s, d) => s + d.materialityScore, 0) / deltas.length)
    : 0;

  const anyInvalidation = deltas.some(d => d.invalidatesPriorReasoning);
  const anyFullRequired = deltas.some(d => d.requiresFullReasoning);
  const anyPartialRequired = deltas.some(d => d.requiresPartialReasoning);

  let recommendedAction: DifferentialAnalysis["recommendedAction"];
  if (deltas.length === 0 || totalMateriality < 10) recommendedAction = "reuse-as-is";
  else if (anyFullRequired || totalMateriality > 70) recommendedAction = "full-reanalysis";
  else if (anyPartialRequired) recommendedAction = "partial-update";
  else recommendedAction = "reuse-as-is";

  // If prior state was low confidence, escalate
  if (previous.confidence < 60 && deltas.length > 0) recommendedAction = "escalate";

  return {
    analysisId: `da-${Date.now()}`,
    domain: previous.domain,
    previousStateId: previous.stateId,
    currentStateHash: currentHash,
    deltas,
    totalMateriality,
    priorReasoningValid: !anyInvalidation,
    recommendedAction,
    estimatedCostIfFull: 120,
    estimatedCostIfPartial: 35,
    estimatedCostIfReuse: 5,
    confidenceInReuse: anyInvalidation ? 30 : deltas.length === 0 ? 98 : 75,
    invalidationTriggers: deltas.filter(d => d.invalidatesPriorReasoning).map(d => d.field),
    timestamp: new Date().toISOString(),
  };
}

// ── Confidence-Gated Escalation ─────────────────────────────

export interface EscalationGate {
  shouldEscalate: boolean;
  reason: string;
  suggestedTier: "utility" | "standard" | "premium" | "exceptional";
  estimatedCostCents: number;
  outcomeValueEstimate: number;       // 0-100
  confidenceGap: number;              // how much confidence is missing
}

export function evaluateEscalation(
  currentConfidence: number,
  stakes: "low" | "medium" | "high" | "critical",
  novelty: number,                    // 0-100
  userRequestedDeep: boolean,
  priorReasoningValid: boolean,
  outcomeValueEstimate: number,
): EscalationGate {
  const stakesWeight: Record<string, number> = { low: 0.2, medium: 0.5, high: 0.8, critical: 1.0 };
  const stakesFactor = stakesWeight[stakes];
  const confidenceGap = 100 - currentConfidence;

  // Escalate if: low confidence + high stakes, OR high novelty, OR user requested, OR prior invalid
  const escalationScore = (confidenceGap * stakesFactor * 0.4)
    + (novelty * 0.3)
    + (userRequestedDeep ? 30 : 0)
    + (!priorReasoningValid ? 20 : 0);

  const shouldEscalate = escalationScore > 40;

  let suggestedTier: EscalationGate["suggestedTier"] = "utility";
  if (escalationScore > 80) suggestedTier = "exceptional";
  else if (escalationScore > 60) suggestedTier = "premium";
  else if (escalationScore > 40) suggestedTier = "standard";

  const costMap = { utility: 5, standard: 25, premium: 80, exceptional: 200 };

  const reasons: string[] = [];
  if (confidenceGap > 30 && stakesFactor >= 0.8) reasons.push("Low confidence in high-stakes context");
  if (novelty > 60) reasons.push("High novelty — no prior patterns");
  if (userRequestedDeep) reasons.push("User explicitly requested deep analysis");
  if (!priorReasoningValid) reasons.push("Prior reasoning invalidated");

  return {
    shouldEscalate,
    reason: reasons.length > 0 ? reasons.join("; ") : "No escalation triggers met",
    suggestedTier,
    estimatedCostCents: costMap[suggestedTier],
    outcomeValueEstimate,
    confidenceGap,
  };
}
