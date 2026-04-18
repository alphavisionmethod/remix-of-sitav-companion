// ═══════════════════════════════════════════════════════════════
// SITA OS — Escalation Router (Intent Layer)
// Determines when to escalate to boardroom
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";
import type { OrchestrationContext } from "../shared/orchestration-context";

export interface EscalationDecision {
  shouldEscalate: boolean;
  escalationTarget: "boardroom" | "admin" | "council" | "none";
  reason: string;
  worthinessScore: number;
}

export function evaluateEscalation(
  envelope: OrchestrationEnvelope,
  context: OrchestrationContext
): EscalationDecision {
  const intentState = envelope.intentState;
  if (!intentState) {
    return { shouldEscalate: false, escalationTarget: "none", reason: "No intent state", worthinessScore: 0 };
  }

  let worthinessScore = 0;

  // Risk tier contribution
  if (intentState.riskTier === "critical") worthinessScore += 0.4;
  else if (intentState.riskTier === "elevated") worthinessScore += 0.2;

  // Low trust contribution
  if (context.trust.trustScore < 0.5) worthinessScore += 0.2;

  // Financial domain contribution
  if (envelope.domain === "finance") worthinessScore += 0.15;

  // Low confidence contribution
  if (intentState.confidenceScore < 0.5) worthinessScore += 0.15;

  // Escalation required flag from intent resolution
  if (intentState.escalationRequired) worthinessScore += 0.1;

  worthinessScore = Math.min(worthinessScore, 1.0);

  const shouldEscalate = worthinessScore >= 0.65;

  return {
    shouldEscalate,
    escalationTarget: shouldEscalate
      ? (worthinessScore > 0.85 ? "boardroom" : "council")
      : "none",
    reason: shouldEscalate
      ? `Worthiness score ${worthinessScore.toFixed(2)} >= 0.65 threshold`
      : `Worthiness score ${worthinessScore.toFixed(2)} below threshold`,
    worthinessScore,
  };
}
