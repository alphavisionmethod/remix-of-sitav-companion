// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core: Intent Orchestration
// Single sovereign brain — no second brain allowed
// ═══════════════════════════════════════════════════════════════

export type IntentType = "query" | "action" | "simulation" | "approval" | "boardroom" | "diagnostic";
export type BrainExecutionMode = "observe" | "recommend" | "draft" | "simulate" | "execute" | "approval-required";

export interface ParsedIntent {
  id: string;
  rawInput: string;
  type: IntentType;
  domain: "business" | "finance" | "concierge" | "platform";
  entities: { type: string; value: string; confidence: number }[];
  capabilities: string[];
  urgency: "low" | "medium" | "high" | "critical";
  parsedAt: string;
}

export interface OrchestrationPlan {
  intentId: string;
  selectedAdvisors: string[];
  executionMode: BrainExecutionMode;
  policyChecks: { policyId: string; passed: boolean; reason: string }[];
  requiresApproval: boolean;
  approvalType?: "single" | "dual" | "owner-only";
  estimatedCostTokens: number;
  steps: OrchestrationStep[];
  createdAt: string;
}

export interface OrchestrationStep {
  order: number;
  capabilityId: string;
  serviceName: string;
  action: string;
  inputs: Record<string, unknown>;
  dependsOn: number[];
  estimatedDurationMs: number;
}

export interface OrchestrationResult {
  intentId: string;
  planId: string;
  status: "completed" | "partial" | "failed" | "awaiting-approval";
  outputs: Record<string, unknown>;
  receipts: string[];
  explanation: string;
  confidenceScore: number;
  completedAt: string;
  durationMs: number;
}

export function parseIntent(rawInput: string): ParsedIntent {
  const lowerInput = rawInput.toLowerCase();
  let domain: ParsedIntent["domain"] = "platform";
  let type: IntentType = "query";

  if (lowerInput.includes("invoice") || lowerInput.includes("lead") || lowerInput.includes("customer") || lowerInput.includes("deal")) {
    domain = "business";
  } else if (lowerInput.includes("balance") || lowerInput.includes("payment") || lowerInput.includes("reserve") || lowerInput.includes("investment")) {
    domain = "finance";
  } else if (lowerInput.includes("task") || lowerInput.includes("travel") || lowerInput.includes("grocery") || lowerInput.includes("household")) {
    domain = "concierge";
  }

  if (lowerInput.includes("pay") || lowerInput.includes("send") || lowerInput.includes("create") || lowerInput.includes("execute")) {
    type = "action";
  } else if (lowerInput.includes("simulate") || lowerInput.includes("what if") || lowerInput.includes("project")) {
    type = "simulation";
  } else if (lowerInput.includes("approve") || lowerInput.includes("review")) {
    type = "approval";
  }

  return {
    id: `intent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    rawInput,
    type,
    domain,
    entities: [],
    capabilities: [],
    urgency: type === "action" ? "high" : "medium",
    parsedAt: new Date().toISOString(),
  };
}

export function chooseExecutionMode(intent: ParsedIntent): BrainExecutionMode {
  switch (intent.type) {
    case "query": return "observe";
    case "simulation": return "simulate";
    case "approval": return "approval-required";
    case "action": return intent.urgency === "critical" ? "approval-required" : "recommend";
    case "boardroom": return "recommend";
    case "diagnostic": return "observe";
    default: return "observe";
  }
}

export function buildOrchestrationPlan(intent: ParsedIntent): OrchestrationPlan {
  const mode = chooseExecutionMode(intent);
  return {
    intentId: intent.id,
    selectedAdvisors: [`${intent.domain}-advisor`],
    executionMode: mode,
    policyChecks: [{ policyId: "truth-boundary", passed: true, reason: "Within domain scope" }],
    requiresApproval: mode === "approval-required",
    approvalType: mode === "approval-required" ? "single" : undefined,
    estimatedCostTokens: intent.type === "simulation" ? 5000 : 1000,
    steps: [{
      order: 1,
      capabilityId: `${intent.domain}-${intent.type}`,
      serviceName: `${intent.domain}-os`,
      action: intent.type,
      inputs: { rawInput: intent.rawInput },
      dependsOn: [],
      estimatedDurationMs: 500,
    }],
    createdAt: new Date().toISOString(),
  };
}

export function buildExplanation(result: OrchestrationResult): string {
  if (result.status === "completed") {
    return `Completed with ${result.confidenceScore}% confidence in ${result.durationMs}ms. Generated ${result.receipts.length} receipt(s).`;
  }
  if (result.status === "awaiting-approval") {
    return "Action requires your approval before execution. Review the details and approve or reject.";
  }
  return `Operation ${result.status}. ${result.explanation}`;
}
