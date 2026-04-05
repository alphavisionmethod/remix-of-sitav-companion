// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability & Diagnostics Model
// The system must explain every proposal, refusal, and execution.
// Two modes: user-facing "Why?" + operator-facing "What failed?"
// ═══════════════════════════════════════════════════════════════

// ── Execution Trace ─────────────────────────────────────────

export interface ExecutionTrace {
  traceId: string;
  pipelineId: string;
  tenantId: string;
  actorId: string;
  intentSummary: string;
  stages: TraceStage[];
  totalDurationMs: number;
  outcome: "succeeded" | "failed" | "refused" | "partial" | "pending";
  createdAt: string;
}

export interface TraceStage {
  stage: string;
  status: "completed" | "failed" | "skipped" | "pending";
  durationMs: number;
  inputRef?: string;
  outputRef?: string;
  policyDecisionRef?: string;
  advisorRefs?: string[];
  errorRef?: string;
  timestamp: string;
}

// ── Policy Decision Trace ───────────────────────────────────

export interface PolicyTrace {
  traceId: string;
  policyDecisionId: string;
  tenantId: string;
  rulesEvaluated: Array<{
    ruleId: string;
    ruleName: string;
    input: Record<string, unknown>;
    result: "allow" | "deny" | "require-approval" | "escalate";
    reason: string;
  }>;
  constitutionalChecks: Array<{
    rule: string;
    passed: boolean;
    reason: string;
  }>;
  finalDecision: "allowed" | "refused" | "approval-required";
  policyBundleVersion: number;
  evaluatedAt: string;
}

// ── Advisor Participation Log ───────────────────────────────

export interface AdvisorLog {
  logId: string;
  pipelineId: string;
  tenantId: string;
  advisors: Array<{
    advisorId: string;
    advisorName: string;
    domain: string;
    recommendation: string;
    confidence: number;
    evidenceGrade: string;
    dissent: boolean;
    dissentReason?: string;
    tokensUsed: number;
    durationMs: number;
  }>;
  synthesisOutcome: string;
  consensusReached: boolean;
  escalated: boolean;
  createdAt: string;
}

// ── Connector Health Dashboard ──────────────────────────────

export interface ConnectorHealthDashboard {
  snapshotId: string;
  tenantId: string;
  connectors: Array<{
    connectorId: string;
    name: string;
    status: "healthy" | "degraded" | "unhealthy" | "killed";
    latencyP50Ms: number;
    latencyP99Ms: number;
    errorRate: number;
    lastSuccessAt?: string;
    lastFailureAt?: string;
    actionCount24h: number;
    costCents24h: number;
  }>;
  generatedAt: string;
}

// ── User-Facing Explanation ─────────────────────────────────

export interface UserExplanation {
  explanationId: string;
  tenantId: string;
  actorId: string;
  question: "why-proposed" | "why-refused" | "why-approval-required" | "what-happened" | "what-failed" | "what-evidence";
  answer: string;
  supportingFacts: Array<{
    fact: string;
    source: string;
    evidenceGrade: string;
  }>;
  relatedReceipts: string[];
  relatedPolicyRules: string[];
  relatedAdvisors: string[];
  memorySourcesUsed: string[];
  proofArtifacts: string[];
  generatedAt: string;
}

// ── Operator Diagnostics ────────────────────────────────────

export interface OperatorDiagnostic {
  diagnosticId: string;
  tenantId: string;
  category: "execution-failure" | "policy-anomaly" | "connector-failure" | "budget-alert" | "workflow-stuck" | "memory-conflict" | "trust-anomaly";
  severity: "info" | "warning" | "error" | "critical";
  summary: string;
  rootCause?: string;
  affectedComponents: string[];
  timeline: Array<{ timestamp: string; event: string; detail: string }>;
  suggestedActions: string[];
  relatedTraceIds: string[];
  relatedReceiptIds: string[];
  createdAt: string;
}

// ── Explanation Factory ─────────────────────────────────────

export function createExplanation(
  question: UserExplanation["question"],
  trace: ExecutionTrace,
  policyTrace?: PolicyTrace,
  advisorLog?: AdvisorLog,
): UserExplanation {
  let answer = "";

  switch (question) {
    case "why-proposed":
      answer = `This action was proposed based on ${advisorLog?.advisors.length ?? 0} advisor(s). ${
        advisorLog?.consensusReached ? "All advisors agreed." : "There was disagreement among advisors."
      }`;
      break;
    case "why-refused":
      answer = policyTrace
        ? `Policy refused this action: ${policyTrace.rulesEvaluated.filter(r => r.result === "deny").map(r => r.reason).join("; ")}`
        : "The action was refused but no policy trace is available.";
      break;
    case "why-approval-required":
      answer = policyTrace
        ? `Approval is required because: ${policyTrace.rulesEvaluated.filter(r => r.result === "require-approval").map(r => r.reason).join("; ")}`
        : "Approval is required by system policy.";
      break;
    case "what-happened":
      answer = `Action ${trace.outcome}. Took ${trace.totalDurationMs}ms across ${trace.stages.length} stages.`;
      break;
    case "what-failed":
      const failedStages = trace.stages.filter(s => s.status === "failed");
      answer = failedStages.length > 0
        ? `Failed at stage(s): ${failedStages.map(s => s.stage).join(", ")}`
        : "No stage failures detected.";
      break;
    default:
      answer = "Explanation not available for this question type.";
  }

  return {
    explanationId: crypto.randomUUID(),
    tenantId: trace.tenantId,
    actorId: trace.actorId,
    question,
    answer,
    supportingFacts: [],
    relatedReceipts: [],
    relatedPolicyRules: policyTrace?.rulesEvaluated.map(r => r.ruleId) ?? [],
    relatedAdvisors: advisorLog?.advisors.map(a => a.advisorId) ?? [],
    memorySourcesUsed: [],
    proofArtifacts: [],
    generatedAt: new Date().toISOString(),
  };
}
