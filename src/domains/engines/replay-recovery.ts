// ═══════════════════════════════════════════════════════════════
// SITA OS — Replay & Recovery Engine
// Build replay packets, check rollback eligibility, guide recovery
// ═══════════════════════════════════════════════════════════════

import type {
  ReplayPacket, ReplayTimelineEntry, RollbackPacket, RollbackStep,
  RecoveryAction, RecoveryDiagnosticBundle, VerificationResult,
  ApprovalChainEntry, ConnectorActionRecord, PolicySnapshotRef,
} from "../types/replay-recovery.types";
import type { ActionRecord, OSDomain, EntityScope } from "../types/os-unified.types";

export class ReplayRecoveryEngine {
  private packets: Map<string, ReplayPacket> = new Map();
  private rollbacks: Map<string, RollbackPacket> = new Map();
  private diagnostics: Map<string, RecoveryDiagnosticBundle> = new Map();

  // ── Build Replay Packet ───────────────────────────────────────
  buildReplayPacket(record: ActionRecord, options: {
    approvalChain?: ApprovalChainEntry[];
    connectorActions?: ConnectorActionRecord[];
    verifications?: VerificationResult[];
    policySnapshot?: PolicySnapshotRef;
  } = {}): ReplayPacket {
    const timeline: ReplayTimelineEntry[] = record.stateHistory.map((t, i) => ({
      sequence: i,
      state: t.to,
      actor: t.triggeredBy,
      actorType: t.triggeredBy.startsWith("advisor") ? "advisor" as const
        : t.triggeredBy === "system" ? "system" as const : "user" as const,
      action: `${t.from} → ${t.to}`,
      timestamp: t.timestamp,
      confidence: t.confidence,
      duration: i > 0
        ? new Date(t.timestamp).getTime() - new Date(record.stateHistory[i - 1].timestamp).getTime()
        : 0,
      inputs: t.metadata || {},
      outputs: {},
    }));

    // Determine replay eligibility
    const replayBlockers: string[] = [];
    if (record.currentState === "executing") replayBlockers.push("Workflow is still executing");
    if (record.currentState === "rolled_back") replayBlockers.push("Already rolled back");

    // Determine rollback eligibility
    const rollbackBlockers: string[] = [];
    if (!record.rollbackEligible) rollbackBlockers.push("State does not support rollback");
    const hasIrreversibleConnector = (options.connectorActions || []).some(
      c => c.direction === "outbound" && c.status === "success" && !c.retryable
    );
    if (hasIrreversibleConnector) rollbackBlockers.push("Contains irreversible connector action");

    // Recovery recommendations
    const recoveryRecommendations: RecoveryAction[] = [];
    if (record.currentState === "failed") {
      recoveryRecommendations.push(
        { id: "retry", type: "retry", title: "Retry Workflow", description: "Re-execute from the failed step", risk: "low", estimatedDuration: "1-5 min", automated: true, requiresApproval: false, prerequisites: [], affectedEntities: [] },
        { id: "rollback", type: "rollback", title: "Rollback Changes", description: "Undo all changes made by this workflow", risk: "medium", estimatedDuration: "2-10 min", automated: true, requiresApproval: true, prerequisites: ["No irreversible actions"], affectedEntities: [] },
        { id: "escalate", type: "escalate", title: "Escalate to Owner", description: "Send this workflow to the owner for manual review", risk: "low", estimatedDuration: "Varies", automated: false, requiresApproval: false, prerequisites: [], affectedEntities: [] },
      );
    }
    if (record.currentState === "escalated") {
      recoveryRecommendations.push(
        { id: "manual", type: "manual", title: "Manual Resolution", description: "Review and resolve manually", risk: "medium", estimatedDuration: "Varies", automated: false, requiresApproval: false, prerequisites: [], affectedEntities: [] },
      );
    }

    const packet: ReplayPacket = {
      id: `replay_${record.id}_${Date.now()}`,
      workflowId: record.workflowId,
      correlationId: record.id,
      domain: record.domain,
      entityScope: record.entityScope,
      createdAt: new Date().toISOString(),
      timeline,
      policySnapshot: options.policySnapshot || { snapshotId: "current", policies: [], capturedAt: new Date().toISOString() },
      approvalChain: options.approvalChain || [],
      connectorActions: options.connectorActions || [],
      proofRecords: record.proofIds,
      verificationResults: options.verifications || [],
      replayEligible: replayBlockers.length === 0,
      replayBlockers,
      rollbackEligible: rollbackBlockers.length === 0,
      rollbackBlockers,
      recoveryRecommendations,
    };

    this.packets.set(packet.id, packet);
    return packet;
  }

  // ── Initiate Rollback ─────────────────────────────────────────
  initiateRollback(replayPacketId: string, initiatedBy: string, reason: string): RollbackPacket {
    const packet = this.packets.get(replayPacketId);
    if (!packet) throw new Error(`Replay packet ${replayPacketId} not found`);
    if (!packet.rollbackEligible) throw new Error(`Rollback not eligible: ${packet.rollbackBlockers.join(", ")}`);

    const undoSteps: RollbackStep[] = [...packet.timeline]
      .reverse()
      .map((entry, i) => ({
        sequence: i,
        action: `Undo: ${entry.action}`,
        target: entry.actor,
        previousValue: entry.inputs,
        currentValue: entry.outputs,
        status: "pending" as const,
      }));

    const irreversibleSteps = packet.connectorActions
      .filter(c => c.direction === "outbound" && c.status === "success" && !c.retryable)
      .map(c => ({ step: c.action, reason: `External action on ${c.connectorName} cannot be undone` }));

    const rollback: RollbackPacket = {
      id: `rollback_${Date.now()}`,
      workflowId: packet.workflowId,
      replayPacketId,
      initiatedBy,
      initiatedAt: new Date().toISOString(),
      reason,
      undoSteps,
      status: undoSteps.length > 0 ? "pending" : "completed",
      irreversibleSteps,
      rollbackProofIds: [],
      manualResolutionRequired: irreversibleSteps.map(s => ({
        id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        description: s.reason,
        affectedSystem: s.step,
        severity: "high" as const,
        suggestedAction: "Contact the external service to reverse the action",
      })),
    };

    this.rollbacks.set(rollback.id, rollback);
    return rollback;
  }

  // ── Execute Rollback Step ─────────────────────────────────────
  executeRollbackStep(rollbackId: string, stepSequence: number): RollbackPacket {
    const rollback = this.rollbacks.get(rollbackId);
    if (!rollback) throw new Error(`Rollback ${rollbackId} not found`);

    const step = rollback.undoSteps.find(s => s.sequence === stepSequence);
    if (!step) throw new Error(`Step ${stepSequence} not found`);

    step.status = "completed";
    step.executedAt = new Date().toISOString();

    // Check if all steps done
    const allDone = rollback.undoSteps.every(s => s.status === "completed" || s.status === "skipped");
    const anyFailed = rollback.undoSteps.some(s => s.status === "failed");
    rollback.status = allDone ? "completed" : anyFailed ? "partial" : "in_progress";

    return rollback;
  }

  // ── Build Diagnostic Bundle ───────────────────────────────────
  buildDiagnosticBundle(workflowId: string, purpose: RecoveryDiagnosticBundle["createdFor"]): RecoveryDiagnosticBundle {
    // Find related replay packet
    const replayPacket = Array.from(this.packets.values()).find(p => p.workflowId === workflowId);
    if (!replayPacket) throw new Error(`No replay packet found for workflow ${workflowId}`);

    const rollbackPacket = Array.from(this.rollbacks.values()).find(r => r.workflowId === workflowId);

    const bundle: RecoveryDiagnosticBundle = {
      id: `diag_${Date.now()}`,
      workflowId,
      correlationId: replayPacket.correlationId,
      createdAt: new Date().toISOString(),
      createdFor: purpose,
      replayPacket,
      rollbackPacket,
      trustSnapshot: { score: 94, posture: "verified", incidents: [] },
      memorySnapshot: { relatedMemories: [], contradictions: [] },
      connectorHealth: replayPacket.connectorActions.map(c => ({
        id: c.connectorId, status: c.status, lastSync: c.requestAt,
      })),
      advisorDecisions: replayPacket.timeline
        .filter(t => t.actorType === "advisor")
        .map(t => ({ advisorId: t.actor, decision: t.action, confidence: t.confidence })),
      systemMetrics: { cpu: 12, memory: 45, latency: 23, errorRate: 0.001 },
      explanation: `Workflow ${workflowId} went through ${replayPacket.timeline.length} states. ` +
        `${replayPacket.verificationResults.filter(v => v.passed).length}/${replayPacket.verificationResults.length} verifications passed.` +
        (rollbackPacket ? ` Rollback status: ${rollbackPacket.status}.` : ""),
      redacted: purpose === "support",
    };

    this.diagnostics.set(bundle.id, bundle);
    return bundle;
  }

  // ── Queries ───────────────────────────────────────────────────
  getReplayPacket(id: string): ReplayPacket | undefined { return this.packets.get(id); }
  getRollback(id: string): RollbackPacket | undefined { return this.rollbacks.get(id); }
  getDiagnostic(id: string): RecoveryDiagnosticBundle | undefined { return this.diagnostics.get(id); }

  getPacketsForWorkflow(workflowId: string): ReplayPacket[] {
    return Array.from(this.packets.values()).filter(p => p.workflowId === workflowId);
  }

  getStats() {
    return {
      totalPackets: this.packets.size,
      totalRollbacks: this.rollbacks.size,
      completedRollbacks: Array.from(this.rollbacks.values()).filter(r => r.status === "completed").length,
      failedRollbacks: Array.from(this.rollbacks.values()).filter(r => r.status === "failed" || r.status === "partial").length,
      diagnosticBundles: this.diagnostics.size,
    };
  }

  serialize(): Record<string, unknown> {
    return {
      packets: Array.from(this.packets.entries()),
      rollbacks: Array.from(this.rollbacks.entries()),
      diagnostics: Array.from(this.diagnostics.entries()),
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (state.packets) this.packets = new Map(state.packets as Iterable<[string, never]>) as typeof this.packets;
    if (state.rollbacks) this.rollbacks = new Map(state.rollbacks as Iterable<[string, never]>) as typeof this.rollbacks;
    if (state.diagnostics) this.diagnostics = new Map(state.diagnostics as Iterable<[string, never]>) as typeof this.diagnostics;
  }
}

