// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Action-State Machine (Durable)
// 16-state FSM for ALL meaningful workflows across all domains
// NOW with durable persistence to os_action_lineage
// ═══════════════════════════════════════════════════════════════

import type { ActionState, ActionStateTransition, ActionRecord, OSDomain, EntityScope } from "../types/os-unified.types";
import {
  persistActionRecord,
  persistActionTransition,
  linkEventToAction,
  linkPolicyToAction,
  addProofToAction,
} from "@/lib/persistence/action-lineage-persistence";

const VALID_TRANSITIONS: Record<ActionState, ActionState[]> = {
  detected: ["proposed", "archived"],
  proposed: ["drafted", "archived"],
  drafted: ["simulated", "approval_requested", "archived"],
  simulated: ["approval_requested", "drafted", "archived"],
  approval_requested: ["approved", "rejected", "drafted", "escalated", "archived"],
  approved: ["queued", "executing"],
  rejected: ["drafted", "archived"],
  queued: ["executing", "archived"],
  executing: ["partially_completed", "completed", "failed", "escalated"],
  partially_completed: ["executing", "completed", "failed", "escalated", "rolled_back"],
  completed: ["verified", "rolled_back"],
  verified: ["archived"],
  failed: ["queued", "rolled_back", "escalated", "archived"],
  rolled_back: ["archived", "queued"],
  escalated: ["approval_requested", "queued", "archived"],
  archived: [],
};

const TERMINAL_STATES: ActionState[] = ["verified", "archived"];
const STUCK_THRESHOLD_MS = 30 * 60 * 1000;

export class ActionStateMachine {
  private record: ActionRecord;
  private persistenceEnabled = true;

  constructor(init: {
    id: string;
    workflowId: string;
    domain: OSDomain;
    assignedAdvisor: string;
    entityScope: EntityScope;
    actionType?: string;
    initiatingSurface?: string;
  }) {
    this.record = {
      ...init,
      currentState: "detected",
      stateHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rollbackEligible: false,
      replayable: true,
      blockingReasons: [],
      dependsOn: [],
      confidenceScore: 1,
      proofIds: [],
    };

    // Durably persist the initial record
    if (this.persistenceEnabled) {
      persistActionRecord(this.record, {
        actionType: init.actionType,
        initiatingSurface: init.initiatingSurface,
      }).catch(() => {});
    }
  }

  static fromRecord(record: ActionRecord): ActionStateMachine {
    const machine = new ActionStateMachine({
      id: record.id,
      workflowId: record.workflowId,
      domain: record.domain,
      assignedAdvisor: record.assignedAdvisor,
      entityScope: record.entityScope,
    });
    machine.record = { ...record };
    return machine;
  }

  get state(): ActionState { return this.record.currentState; }
  get snapshot(): Readonly<ActionRecord> { return { ...this.record }; }
  get isTerminal(): boolean { return TERMINAL_STATES.includes(this.record.currentState); }

  canTransitionTo(target: ActionState): boolean {
    return VALID_TRANSITIONS[this.record.currentState]?.includes(target) ?? false;
  }

  getValidTransitions(): ActionState[] {
    return VALID_TRANSITIONS[this.record.currentState] || [];
  }

  transition(target: ActionState, triggeredBy: string, reason: string, confidence: number = 1): ActionRecord {
    if (!this.canTransitionTo(target)) {
      throw new Error(`Invalid transition: ${this.record.currentState} → ${target}. Valid: ${this.getValidTransitions().join(", ")}`);
    }

    const transition: ActionStateTransition = {
      from: this.record.currentState,
      to: target,
      triggeredBy,
      timestamp: new Date().toISOString(),
      reason,
      confidence,
    };

    this.record.stateHistory.push(transition);
    this.record.currentState = target;
    this.record.updatedAt = transition.timestamp;
    this.record.confidenceScore = Math.min(this.record.confidenceScore, confidence);
    this.record.rollbackEligible = ["completed", "partially_completed", "failed"].includes(target);
    this.record.stuckSince = undefined;

    // Durably persist the transition
    if (this.persistenceEnabled) {
      persistActionTransition(this.record.id, target, transition, {
        rollbackEligible: this.record.rollbackEligible,
        confidenceScore: this.record.confidenceScore,
        stuckSince: null,
      }).catch(() => {});
    }

    return this.snapshot;
  }

  addBlockingReason(reason: string): void {
    if (!this.record.blockingReasons.includes(reason)) {
      this.record.blockingReasons.push(reason);
    }
  }

  removeBlockingReason(reason: string): void {
    this.record.blockingReasons = this.record.blockingReasons.filter(r => r !== reason);
  }

  addDependency(workflowId: string): void {
    if (!this.record.dependsOn.includes(workflowId)) {
      this.record.dependsOn.push(workflowId);
    }
  }

  /** Add a proof reference and persist the linkage durably */
  addProof(proofId: string): void {
    if (!this.record.proofIds.includes(proofId)) {
      this.record.proofIds.push(proofId);
      if (this.persistenceEnabled) {
        addProofToAction(this.record.id, proofId).catch(() => {});
      }
    }
  }

  /** Link an event to this action's lineage */
  linkEvent(eventId: string): void {
    if (this.persistenceEnabled) {
      linkEventToAction(this.record.id, eventId).catch(() => {});
    }
  }

  /** Link a policy evaluation to this action's lineage */
  linkPolicy(policyEvalId: string): void {
    if (this.persistenceEnabled) {
      linkPolicyToAction(this.record.id, policyEvalId).catch(() => {});
    }
  }

  /** Enable/disable persistence */
  setPersistence(enabled: boolean): void { this.persistenceEnabled = enabled; }

  checkStuck(): { isStuck: boolean; duration: number } {
    const lastTransition = this.record.stateHistory[this.record.stateHistory.length - 1];
    if (!lastTransition || this.isTerminal) return { isStuck: false, duration: 0 };

    const duration = Date.now() - new Date(lastTransition.timestamp).getTime();
    const isStuck = duration > STUCK_THRESHOLD_MS && !this.isTerminal;

    if (isStuck && !this.record.stuckSince) {
      this.record.stuckSince = lastTransition.timestamp;
    }

    return { isStuck, duration };
  }

  getTimeInState(): number {
    const lastTransition = this.record.stateHistory[this.record.stateHistory.length - 1];
    if (!lastTransition) return Date.now() - new Date(this.record.createdAt).getTime();
    return Date.now() - new Date(lastTransition.timestamp).getTime();
  }

  getExplanation(): string {
    const history = this.record.stateHistory;
    if (history.length === 0) return "Workflow detected but no actions taken yet.";

    const last = history[history.length - 1];
    const stateDescriptions: Record<ActionState, string> = {
      detected: "An opportunity or task was detected",
      proposed: "A plan was proposed by an advisor",
      drafted: "A draft action was prepared",
      simulated: "The action was simulated to check safety",
      approval_requested: "Waiting for your approval",
      approved: "You approved this action",
      rejected: "This action was rejected",
      queued: "Queued for execution",
      executing: "Currently running",
      partially_completed: "Partially done — some steps remain",
      completed: "Finished successfully",
      verified: "Verified and proven correct",
      failed: `Failed: ${last.reason}`,
      rolled_back: "Rolled back to previous state",
      escalated: `Escalated: ${last.reason}`,
      archived: "Archived",
    };

    return stateDescriptions[this.record.currentState] || `Current state: ${this.record.currentState}`;
  }
}

// ── Duplicate Prevention ────────────────────────────────────────
export function isDuplicateAction(existing: ActionRecord[], newAction: { workflowId: string; domain: OSDomain; assignedAdvisor: string }): boolean {
  return existing.some(r =>
    r.workflowId === newAction.workflowId &&
    r.domain === newAction.domain &&
    !TERMINAL_STATES.includes(r.currentState)
  );
}

// ── Aging Detection ─────────────────────────────────────────────
export function findAgingWorkflows(records: ActionRecord[], thresholdMs: number = STUCK_THRESHOLD_MS): ActionRecord[] {
  return records.filter(r => {
    if (TERMINAL_STATES.includes(r.currentState)) return false;
    const lastTransition = r.stateHistory[r.stateHistory.length - 1];
    if (!lastTransition) return false;
    return Date.now() - new Date(lastTransition.timestamp).getTime() > thresholdMs;
  });
}
