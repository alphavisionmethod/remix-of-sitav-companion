// ═══════════════════════════════════════════════════════════════
// SITA OS — Immutable Event Taxonomy
// Every meaningful state transition emits an immutable event.
// Events are append-only, tenant-scoped, and support replay.
// ═══════════════════════════════════════════════════════════════

export type EventClass =
  // Pipeline events
  | "intent.received"
  | "intent.classified"
  | "identity.resolved"
  | "identity.ambiguous"
  | "memory.retrieved"
  | "policy.evaluated"
  | "policy.refused"
  | "advisor.routed"
  | "advisor.dissented"
  | "proposal.created"
  | "proposal.updated"
  | "mode.set"
  | "mode.upgraded"
  // Approval events
  | "approval.requested"
  | "approval.granted"
  | "approval.refused"
  | "approval.expired"
  | "approval.escalated"
  | "approval.delegated"
  | "approval.revoked"
  // Execution events
  | "envelope.issued"
  | "envelope.expired"
  | "execution.started"
  | "execution.succeeded"
  | "execution.failed"
  | "execution.partial"
  | "execution.timed-out"
  // Receipt events
  | "receipt.emitted"
  | "refusal.emitted"
  | "rollback.emitted"
  | "compensation.emitted"
  | "simulation.emitted"
  // Postcondition events
  | "postcondition.verified"
  | "postcondition.failed"
  // Governance update events
  | "trust.updated"
  | "memory.written"
  | "memory.corrected"
  | "memory.forgotten"
  | "graph.updated"
  | "boardroom.updated"
  | "opportunity.detected"
  // Workflow events
  | "workflow.created"
  | "workflow.transitioned"
  | "workflow.completed"
  | "workflow.failed"
  | "workflow.rolled-back"
  | "workflow.cancelled"
  // Policy events
  | "policy.bundle-created"
  | "policy.bundle-activated"
  | "policy.weakening-requested"
  | "policy.weakening-approved"
  | "policy.rolled-back"
  // Connector events
  | "connector.certified"
  | "connector.activated"
  | "connector.degraded"
  | "connector.killed"
  | "connector.action-executed"
  | "connector.action-failed"
  // Learning events
  | "learning.proposal-created"
  | "learning.auto-applied"
  | "learning.human-approved"
  | "learning.rejected"
  // System events
  | "system.health-check"
  | "system.budget-alert"
  | "system.anomaly-detected"
  | "system.tenant-created";

export interface ImmutableEvent {
  eventId: string;
  eventClass: EventClass;
  tenantId: string;
  actorId: string;
  correlationId: string;          // groups related events
  causationId?: string;           // event that caused this one
  pipelineId?: string;
  workflowId?: string;
  envelopeId?: string;
  payload: Record<string, unknown>;
  metadata: {
    surface?: string;
    deviceId?: string;
    sessionId?: string;
    policyVersion?: number;
    evidenceGrade?: string;
  };
  timestamp: string;
  sequenceNumber: number;          // monotonic within tenant
  partitionKey: string;            // for sharding: tenantId
  schemaVersion: number;           // for event evolution
}

// ── Event Factory ───────────────────────────────────────────

let globalSequence = 0;

export function createEvent(
  eventClass: EventClass,
  tenantId: string,
  actorId: string,
  correlationId: string,
  payload: Record<string, unknown>,
  opts?: {
    causationId?: string;
    pipelineId?: string;
    workflowId?: string;
    envelopeId?: string;
    surface?: string;
    deviceId?: string;
    policyVersion?: number;
    evidenceGrade?: string;
  },
): ImmutableEvent {
  globalSequence++;
  return {
    eventId: crypto.randomUUID(),
    eventClass,
    tenantId,
    actorId,
    correlationId,
    causationId: opts?.causationId,
    pipelineId: opts?.pipelineId,
    workflowId: opts?.workflowId,
    envelopeId: opts?.envelopeId,
    payload,
    metadata: {
      surface: opts?.surface,
      deviceId: opts?.deviceId,
      policyVersion: opts?.policyVersion,
      evidenceGrade: opts?.evidenceGrade,
    },
    timestamp: new Date().toISOString(),
    sequenceNumber: globalSequence,
    partitionKey: tenantId,
    schemaVersion: 1,
  };
}

// ── Event Replay ────────────────────────────────────────────

export interface EventStream {
  tenantId: string;
  events: ImmutableEvent[];
  lastSequence: number;
}

export function filterByCorrelation(stream: EventStream, correlationId: string): ImmutableEvent[] {
  return stream.events.filter(e => e.correlationId === correlationId);
}

export function filterByClass(stream: EventStream, eventClass: EventClass): ImmutableEvent[] {
  return stream.events.filter(e => e.eventClass === eventClass);
}

export function replayFrom(stream: EventStream, fromSequence: number): ImmutableEvent[] {
  return stream.events.filter(e => e.sequenceNumber >= fromSequence);
}

// ── Event Taxonomy Metadata ─────────────────────────────────

export const EVENT_TAXONOMY: Record<string, { category: string; description: string; receiptRequired: boolean }> = {
  "intent.received": { category: "pipeline", description: "New intent entered the system", receiptRequired: false },
  "identity.resolved": { category: "pipeline", description: "Actor identity fully resolved", receiptRequired: false },
  "policy.evaluated": { category: "pipeline", description: "Policy decision rendered", receiptRequired: true },
  "policy.refused": { category: "pipeline", description: "Policy refused the action", receiptRequired: true },
  "approval.requested": { category: "approval", description: "Approval request created", receiptRequired: true },
  "approval.granted": { category: "approval", description: "Approval granted by authorized party", receiptRequired: true },
  "approval.refused": { category: "approval", description: "Approval explicitly refused", receiptRequired: true },
  "envelope.issued": { category: "execution", description: "Signed execution envelope issued", receiptRequired: true },
  "execution.started": { category: "execution", description: "Executor began processing", receiptRequired: true },
  "execution.succeeded": { category: "execution", description: "Execution completed successfully", receiptRequired: true },
  "execution.failed": { category: "execution", description: "Execution failed", receiptRequired: true },
  "receipt.emitted": { category: "proof", description: "Formal receipt generated", receiptRequired: false },
  "refusal.emitted": { category: "proof", description: "Formal refusal receipt generated", receiptRequired: false },
  "postcondition.verified": { category: "verification", description: "All postconditions passed", receiptRequired: true },
  "postcondition.failed": { category: "verification", description: "One or more postconditions failed", receiptRequired: true },
  "trust.updated": { category: "governance", description: "Trust metrics updated", receiptRequired: false },
  "memory.written": { category: "governance", description: "New memory record created", receiptRequired: false },
  "memory.corrected": { category: "governance", description: "Memory record corrected with lineage", receiptRequired: true },
  "memory.forgotten": { category: "governance", description: "Memory record forgotten/deleted", receiptRequired: true },
  "policy.weakening-requested": { category: "policy", description: "Material policy weakening requested", receiptRequired: true },
  "connector.action-executed": { category: "connector", description: "Connector completed an action", receiptRequired: true },
  "learning.auto-applied": { category: "learning", description: "Safe learning improvement auto-applied", receiptRequired: false },
  "learning.human-approved": { category: "learning", description: "Learning proposal approved by human", receiptRequired: true },
  "system.anomaly-detected": { category: "system", description: "Anomaly detected in system behavior", receiptRequired: true },
};
