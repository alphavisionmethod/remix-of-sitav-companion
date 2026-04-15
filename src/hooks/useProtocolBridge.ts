// ═══════════════════════════════════════════════════════════════
// SITA OS — useProtocolBridge Hook
// Provides command, approval, trust, and agent protocol
// operations to React components.
// ═══════════════════════════════════════════════════════════════

import { useCallback } from "react";
import {
  executeCommand,
  initiateProtocolApproval,
  resolveProtocolApproval,
  evaluateTrustClaim,
  evaluateRolloutReadiness,
  createAgentCommand,
  acknowledgeAgentCommand,
} from "@/lib/services/protocol-bridge";
import type { CommandEnvelope } from "@/packages/protocols/command-lifecycle";
import type { ApprovalRequest as ProtocolApprovalRequest, ApprovalDecision as ProtocolApprovalDecision } from "@/packages/protocols/approval-protocol";
import type { TrustClaim, TrustEvidence } from "@/packages/protocols/trust-evaluation";
import type { RolloutPlan } from "@/packages/protocols/rollout-protocol";

export function useProtocolBridge() {
  const execute = useCallback(<T = unknown>(envelope: CommandEnvelope<T>) => {
    return executeCommand(envelope);
  }, []);

  const requestApproval = useCallback((request: ProtocolApprovalRequest) => {
    return initiateProtocolApproval(request);
  }, []);

  const resolveApproval = useCallback((approvalId: string, decision: ProtocolApprovalDecision) => {
    return resolveProtocolApproval(approvalId, decision);
  }, []);

  const evaluateTrust = useCallback((claim: TrustClaim, evidence: TrustEvidence[]) => {
    return evaluateTrustClaim(claim, evidence);
  }, []);

  const checkRolloutReadiness = useCallback((plan: RolloutPlan) => {
    return evaluateRolloutReadiness(plan);
  }, []);

  const issueAgentCommand = useCallback(<T = unknown>(params: {
    agentId: string;
    commandType: string;
    payload: T;
    priority?: "critical" | "high" | "normal" | "low";
  }) => {
    return createAgentCommand(params);
  }, []);

  return {
    executeCommand: execute,
    requestApproval,
    resolveApproval,
    evaluateTrust,
    checkRolloutReadiness,
    issueAgentCommand,
  };
}
