// ============================================================
// SITA OS — Refusal Engine
// Decides when to refuse, downgrade, or caveat
// ============================================================

import type { RefusalState, ConfidenceEnvelope, StalenessState, ContradictionReport, DowngradeLevel } from "./types";

interface RefusalInputs {
  confidence: ConfidenceEnvelope;
  staleness: StalenessState;
  contradictions: ContradictionReport;
  requiredInputs: string[];
  presentInputs: string[];
  policyStateKnown: boolean;
}

export function evaluateRefusal(inputs: RefusalInputs): RefusalState {
  const { confidence, staleness, contradictions, requiredInputs, presentInputs, policyStateKnown } = inputs;

  const missingRequired = requiredInputs.filter(r => !presentInputs.includes(r));
  const materialContradictions = contradictions.contradictions.filter(c => c.severity === "material");

  // Determine downgrade level
  let downgradeLevel: DowngradeLevel = "none";
  let refused = false;
  let reason = "";
  const nextSteps: string[] = [];
  let fallbackOutput: string | undefined;

  // Rule 1: Confidence-based refusal (already computed in envelope)
  if (confidence.isRefused) {
    refused = true;
    downgradeLevel = "refuse";
    reason = `Confidence too low (${Math.round(confidence.score * 100)}%) for ${confidence.riskClass} content`;
    nextSteps.push("Refresh data sources to improve confidence");
    nextSteps.push("Review missing inputs and provide them manually");
    fallbackOutput = "Insufficient confidence to provide this output safely. Please review the data sources and try again.";
  }
  // Rule 2: Missing critical inputs
  else if (missingRequired.length > requiredInputs.length * 0.5) {
    refused = true;
    downgradeLevel = "refuse";
    reason = `${missingRequired.length} of ${requiredInputs.length} required inputs missing`;
    nextSteps.push(`Provide: ${missingRequired.join(", ")}`);
    fallbackOutput = `Cannot proceed — missing: ${missingRequired.join(", ")}`;
  }
  // Rule 3: Policy state unknown for trust-critical operations
  else if (!policyStateKnown && confidence.riskClass === "critical-truth") {
    refused = true;
    downgradeLevel = "refuse";
    reason = "Policy state unknown — cannot safely execute critical-truth operation";
    nextSteps.push("Verify policy engine is accessible");
  }
  // Rule 4: Material contradictions → low-confidence
  else if (materialContradictions.length > 0) {
    downgradeLevel = "low-confidence";
    reason = `${materialContradictions.length} material contradiction(s) — output may be unreliable`;
    nextSteps.push("Resolve contradictions between data sources");
    nextSteps.push("Review flagged fields manually");
  }
  // Rule 5: Stale data → caveat
  else if (staleness.overallFreshness === "stale" || staleness.overallFreshness === "critical") {
    downgradeLevel = staleness.overallFreshness === "critical" ? "low-confidence" : "caveat";
    reason = `Data freshness: ${staleness.overallFreshness} — some sources may be outdated`;
    nextSteps.push("Refresh stale data sources");
  }
  // Rule 6: Minor issues → caveat
  else if (confidence.score < 0.85 && confidence.riskClass !== "low") {
    downgradeLevel = "caveat";
    reason = `Moderate confidence (${Math.round(confidence.score * 100)}%) — verify key figures`;
  }

  return { refused, reason, nextSteps, fallbackOutput, downgradeLevel };
}

export function createCleanRefusal(): RefusalState {
  return { refused: false, reason: "", nextSteps: [], downgradeLevel: "none" };
}
