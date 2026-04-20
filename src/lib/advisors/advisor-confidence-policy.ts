// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Confidence Policy
// Governance rules for confidence thresholds per action class.
// Extends src/lib/no-hallucination/confidence.ts contract.
// ═══════════════════════════════════════════════════════════════

export interface ConfidenceGate {
  readonly actionClass: string;
  readonly minimumConfidence: number;
  readonly belowThresholdBehavior: "refuse" | "caveat" | "escalate" | "downgrade-to-draft";
  readonly description: string;
}

export const CONFIDENCE_GATES: readonly ConfidenceGate[] = [
  { actionClass: "observe", minimumConfidence: 0.0, belowThresholdBehavior: "caveat", description: "Observations always allowed with caveats" },
  { actionClass: "recommend", minimumConfidence: 0.5, belowThresholdBehavior: "caveat", description: "Recommendations need modest confidence" },
  { actionClass: "draft", minimumConfidence: 0.6, belowThresholdBehavior: "downgrade-to-draft", description: "Drafts need moderate confidence" },
  { actionClass: "simulate", minimumConfidence: 0.7, belowThresholdBehavior: "escalate", description: "Simulations require solid confidence" },
  { actionClass: "execute", minimumConfidence: 0.8, belowThresholdBehavior: "escalate", description: "Execution requires high confidence" },
  { actionClass: "execute-financial", minimumConfidence: 0.9, belowThresholdBehavior: "refuse", description: "Financial execution requires very high confidence" },
  { actionClass: "communicate-external", minimumConfidence: 0.85, belowThresholdBehavior: "escalate", description: "External comms require high confidence" },
  { actionClass: "system-config", minimumConfidence: 0.9, belowThresholdBehavior: "refuse", description: "System changes require near-certain confidence" },
];

export function evaluateConfidenceGate(actionClass: string, confidence: number): { allowed: boolean; behavior: ConfidenceGate["belowThresholdBehavior"] } {
  const gate = CONFIDENCE_GATES.find((g) => g.actionClass === actionClass);
  if (!gate) return { allowed: false, behavior: "refuse" };
  if (confidence >= gate.minimumConfidence) return { allowed: true, behavior: "caveat" };
  return { allowed: false, behavior: gate.belowThresholdBehavior };
}