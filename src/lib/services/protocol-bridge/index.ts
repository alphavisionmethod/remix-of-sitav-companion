// ═══════════════════════════════════════════════════════════════
// SITA OS — Protocol Bridge
// Maps canonical protocol types to existing service implementations.
// This is the integration layer that connects protocol contracts
// to the actual approval-engine, executor, trust, and agent services.
// ═══════════════════════════════════════════════════════════════

import type {
  CommandEnvelope,
  CommandPhase,
  CommandReceipt,
  isValidTransition,
} from "@/packages/protocols/command-lifecycle";
import type {
  ApprovalRequest as ProtocolApprovalRequest,
  ApprovalDecision as ProtocolApprovalDecision,
  ApprovalPolicy,
} from "@/packages/protocols/approval-protocol";
import type {
  TrustClaim,
  TrustEvidence,
  TrustGrading,
  TrustDecision as ProtocolTrustDecision,
  TrustGrade,
} from "@/packages/protocols/trust-evaluation";
import type {
  AgentCommand,
  AgentCommandAck,
  AgentResult,
  AgentIdentity,
} from "@/packages/protocols/agent-communication";
import type {
  RolloutPlan,
  RolloutGate,
  RolloutDecision,
} from "@/packages/protocols/rollout-protocol";

import {
  createApprovalRequest,
  addDecision,
  getRequest,
} from "@/lib/services/approval-engine/approval-requests.service";
import {
  executeAction,
  type ExecutionEnvelope,
} from "@/lib/services/executor-service/execute-action.service";
import {
  createActionReceipt,
} from "@/lib/services/receipt-service";
import { releaseIntelligence } from "@/lib/services/release-intelligence";
import { degradedModeService } from "@/lib/services/degraded-mode";

// ── Command Protocol → Executor Bridge ──

export function executeCommand<T = unknown>(envelope: CommandEnvelope<T>): {
  execution: ExecutionEnvelope;
  receipt: CommandReceipt;
} {
  const execution = executeAction({
    capabilityId: envelope.command_type,
    mode: "live",
    input: envelope.payload as Record<string, unknown>,
    idempotencyKey: envelope.idempotency_key,
    correlationId: envelope.correlation_id,
  });

  const receipt: CommandReceipt = {
    receipt_id: crypto.randomUUID(),
    command_id: envelope.command_id,
    correlation_id: envelope.correlation_id,
    phase: execution.status === "completed" ? "executed" : "failed",
    outcome: execution.status === "completed" ? "success" : "failure",
    duration_ms: execution.durationMs ?? 0,
    side_effects: [],
    rollback_available: false,
    created_at: new Date().toISOString(),
  };

  return { execution, receipt };
}

// ── Approval Protocol → Approval Engine Bridge ──

export function initiateProtocolApproval(request: ProtocolApprovalRequest): string {
  const created = createApprovalRequest({
    actionId: request.command_id ?? request.approval_id,
    actionType: request.action_key,
    requestedBy: request.requester_id,
    context: {
      domain: request.domain,
      justification: request.justification,
      evidence_refs: request.evidence_refs,
      impact_summary: request.impact_summary,
      risk_level: request.risk_level,
    },
    requiredApprovers: request.approval_type === "dual" ? 2 : 1,
    expiresInMinutes: Math.floor((new Date(request.expires_at).getTime() - Date.now()) / 60000),
  });
  return created.id;
}

export function resolveProtocolApproval(approvalId: string, decision: ProtocolApprovalDecision): boolean {
  const request = getRequest(approvalId);
  if (!request) return false;
  
  addDecision(approvalId, {
    decidedBy: decision.decided_by,
    decision: decision.decision === "approve" ? "approve" : "reject",
    reason: decision.comments,
    timestamp: decision.decided_at,
  });
  return true;
}

// ── Trust Protocol → Trust Governor Bridge ──

export function evaluateTrustClaim(claim: TrustClaim, evidence: TrustEvidence[]): ProtocolTrustDecision {
  const confidenceSum = evidence.reduce((sum, e) => sum + e.confidence, 0);
  const avgConfidence = evidence.length > 0 ? confidenceSum / evidence.length : 0;

  const freshnessWeights: Record<string, number> = { realtime: 1.0, recent: 0.8, stale: 0.4, expired: 0.1 };
  const freshnessScore = evidence.reduce((sum, e) => sum + (freshnessWeights[e.freshness] ?? 0.5), 0) / Math.max(evidence.length, 1);

  const overallScore = avgConfidence * 0.7 + freshnessScore * 0.3;

  let grade: TrustGrade = "F";
  if (overallScore >= 0.9) grade = "A";
  else if (overallScore >= 0.75) grade = "B";
  else if (overallScore >= 0.6) grade = "C";
  else if (overallScore >= 0.4) grade = "D";

  let outcome: ProtocolTrustDecision["outcome"] = "denied";
  if (grade === "A" || grade === "B") outcome = "trusted";
  else if (grade === "C") outcome = "conditional";
  else if (grade === "D") outcome = "deferred";

  return {
    claim_id: claim.claim_id,
    outcome,
    grade,
    conditions: outcome === "conditional" ? ["Requires additional verification within 24h"] : undefined,
    rationale: `Trust evaluation: ${evidence.length} evidence sources, avg confidence ${(avgConfidence * 100).toFixed(1)}%, freshness score ${(freshnessScore * 100).toFixed(1)}%`,
    decided_at: new Date().toISOString(),
  };
}

// ── Rollout Protocol → Release Intelligence Bridge ──

export function evaluateRolloutReadiness(plan: RolloutPlan): {
  ready: boolean;
  score: number;
  blockers: string[];
  gates: Array<{ name: string; passed: boolean }>;
} {
  const gateResults = plan.gates.map(gate => ({
    name: gate.name,
    passed: gate.status === "passed",
  }));

  const requiredGates = plan.gates.filter(g => g.required);
  const allRequiredPassed = requiredGates.every(g => g.status === "passed");
  const passedRatio = plan.gates.filter(g => g.status === "passed").length / Math.max(plan.gates.length, 1);

  const blockers: string[] = [];
  for (const gate of requiredGates) {
    if (gate.status !== "passed") {
      blockers.push(`Required gate "${gate.name}" not passed (status: ${gate.status})`);
    }
  }

  // Check degraded mode
  const systemHealth = degradedModeService.getCurrentMode();
  if (systemHealth !== "full") {
    blockers.push(`System in ${systemHealth} mode — rollout not recommended`);
  }

  return {
    ready: allRequiredPassed && blockers.length === 0,
    score: Math.round(passedRatio * 100) / 100,
    blockers,
    gates: gateResults,
  };
}

// ── Agent Protocol → Agent Orchestrator Bridge ──

export function createAgentCommand<T = unknown>(params: {
  agentId: string;
  commandType: string;
  payload: T;
  priority?: "critical" | "high" | "normal" | "low";
  timeoutMs?: number;
}): AgentCommand<T> {
  return {
    command_id: crypto.randomUUID(),
    correlation_id: crypto.randomUUID(),
    agent_id: params.agentId,
    command_type: params.commandType,
    payload: params.payload,
    priority: params.priority ?? "normal",
    timeout_ms: params.timeoutMs ?? 30000,
    retry_policy: { max_retries: 3, backoff_ms: 1000 },
    issued_at: new Date().toISOString(),
  };
}

export function acknowledgeAgentCommand(command: AgentCommand, accepted: boolean, reason?: string): AgentCommandAck {
  return {
    command_id: command.command_id,
    agent_id: command.agent_id,
    accepted,
    rejection_reason: reason,
    estimated_duration_ms: accepted ? command.timeout_ms / 2 : undefined,
    acked_at: new Date().toISOString(),
  };
}
