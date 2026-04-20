// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Reflection → Policy Feedback Loop
// Closes the loop: reflection outcomes feed back into policy
// adjustments for confidence, autonomy, and behavior tuning.
// ═══════════════════════════════════════════════════════════════

export interface ReflectionSignal {
  readonly advisorId: string;
  readonly outcomeQuality: number;       // 0-1
  readonly ownerAction: "accepted" | "modified" | "rejected" | "ignored";
  readonly executionFitness: number;     // 0-1
  readonly shouldRepeat: boolean;
  readonly lessonLearned: string;
}

export interface PolicyAdjustment {
  readonly adjustmentType: "confidence-shift" | "autonomy-change" | "blocked-action-add" | "blocked-action-remove" | "capability-gate";
  readonly delta: number;
  readonly reason: string;
  readonly requiresOwnerApproval: boolean;
}

export function deriveAdjustments(signal: ReflectionSignal): PolicyAdjustment[] {
  const adjustments: PolicyAdjustment[] = [];

  // Owner rejection → lower confidence and autonomy
  if (signal.ownerAction === "rejected") {
    adjustments.push({ adjustmentType: "confidence-shift", delta: -0.05, reason: "Owner rejected recommendation", requiresOwnerApproval: false });
    if (signal.outcomeQuality < 0.3) {
      adjustments.push({ adjustmentType: "autonomy-change", delta: -1, reason: "Low-quality rejected outcome", requiresOwnerApproval: true });
    }
  }

  // Repeated acceptance → raise confidence
  if (signal.ownerAction === "accepted" && signal.shouldRepeat && signal.outcomeQuality > 0.8) {
    adjustments.push({ adjustmentType: "confidence-shift", delta: 0.02, reason: "Consistently accepted high-quality outcomes", requiresOwnerApproval: false });
  }

  // Execution fitness degradation → gate capability
  if (signal.executionFitness < 0.4) {
    adjustments.push({ adjustmentType: "capability-gate", delta: 0, reason: `Execution fitness ${signal.executionFitness} below threshold`, requiresOwnerApproval: true });
  }

  return adjustments;
}