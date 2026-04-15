// ═══════════════════════════════════════════════════════════════
// SITA OS — useProtocolBridge Hook (All 12 Protocols)
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
  // Receipt protocol
  createReceiptEnvelope,
  queryReceipts,
  verifyReceiptChain,
  // WebSocket protocol
  subscribeWebSocket,
  unsubscribeWebSocket,
  getWebSocketConnectionState,
  sendWebSocketMessage,
  // Notification protocol
  routeNotification,
  getNotificationPreferences,
  // Sync protocol
  createSyncCheckpoint,
  resolveSyncConflict,
  // Update protocol
  checkForUpdates,
  getUpdateInstallState,
  initiateUpdateRollback,
  // Timeline protocol
  emitTimelineEvent,
  queryTimeline,
  // Compatibility protocol
  checkComponentCompatibility,
} from "@/lib/services/protocol-bridge";
import type { CommandEnvelope } from "@/packages/protocols/command-lifecycle";
import type { ApprovalRequest as ProtocolApprovalRequest, ApprovalDecision as ProtocolApprovalDecision } from "@/packages/protocols/approval-protocol";
import type { TrustClaim, TrustEvidence } from "@/packages/protocols/trust-evaluation";
import type { RolloutPlan } from "@/packages/protocols/rollout-protocol";

export function useProtocolBridge() {
  const execute = useCallback(<T = unknown>(envelope: CommandEnvelope<T>) => executeCommand(envelope), []);
  const requestApproval = useCallback((request: ProtocolApprovalRequest) => initiateProtocolApproval(request), []);
  const resolveApproval = useCallback((approvalId: string, decision: ProtocolApprovalDecision) => resolveProtocolApproval(approvalId, decision), []);
  const evaluateTrust = useCallback((claim: TrustClaim, evidence: TrustEvidence[]) => evaluateTrustClaim(claim, evidence), []);
  const checkRolloutReadiness = useCallback((plan: RolloutPlan) => evaluateRolloutReadiness(plan), []);
  const issueAgentCommand = useCallback(<T = unknown>(params: {
    agentId: string; commandType: string; payload: T;
    priority?: "critical" | "high" | "normal" | "low";
  }) => createAgentCommand(params), []);

  return {
    // Command (1)
    executeCommand: execute,
    // Approval (2)
    requestApproval,
    resolveApproval,
    // Trust (3)
    evaluateTrust,
    // Rollout (4)
    checkRolloutReadiness,
    // Agent (5)
    issueAgentCommand,
    acknowledgeAgentCommand,
    // Receipt (6)
    createReceiptEnvelope,
    queryReceipts,
    verifyReceiptChain,
    // WebSocket (7)
    subscribeWebSocket,
    unsubscribeWebSocket,
    getWebSocketConnectionState,
    sendWebSocketMessage,
    // Notification (8)
    routeNotification,
    getNotificationPreferences,
    // Sync (9)
    createSyncCheckpoint,
    resolveSyncConflict,
    // Update (10)
    checkForUpdates,
    getUpdateInstallState,
    initiateUpdateRollback,
    // Timeline (11)
    emitTimelineEvent,
    queryTimeline,
    // Compatibility (12)
    checkComponentCompatibility,
  };
}
