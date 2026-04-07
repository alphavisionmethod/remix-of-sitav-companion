// ═══════════════════════════════════════════════════════════════
// SITA OS — Kernel Contract: ReasoningTrace
// Explainability artifact for every kernel decision.
// ═══════════════════════════════════════════════════════════════

export type ReasoningStepType =
  | "intent-classification"
  | "policy-evaluation"
  | "risk-assessment"
  | "approval-check"
  | "capability-routing"
  | "evidence-gathering"
  | "execution-decision"
  | "kill-switch-check"
  | "constitution-check"
  | "lease-validation";

export interface ReasoningStep {
  stepType: ReasoningStepType;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  decision: string;
  confidence: number;
  durationMs: number;
  timestamp: string;
}

export interface ReasoningTrace {
  id: string;
  envelopeId: string;
  correlationId: string;
  steps: ReasoningStep[];
  finalDecision: "allow" | "deny" | "suspend" | "downgrade";
  totalDurationMs: number;
  createdAt: string;
}

export function createReasoningTrace(envelopeId: string, correlationId: string): ReasoningTrace {
  return {
    id: crypto.randomUUID(),
    envelopeId,
    correlationId,
    steps: [],
    finalDecision: "allow",
    totalDurationMs: 0,
    createdAt: new Date().toISOString(),
  };
}

export function addReasoningStep(trace: ReasoningTrace, step: ReasoningStep): ReasoningTrace {
  return {
    ...trace,
    steps: [...trace.steps, step],
    totalDurationMs: trace.totalDurationMs + step.durationMs,
  };
}
