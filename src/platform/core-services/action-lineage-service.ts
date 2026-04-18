// ═══════════════════════════════════════════════════════════════
// SITA OS — Action Lineage Orchestration Service
// Canonical API for recording action lifecycle, state transitions,
// and cross-linking events/receipts/policies/memory to actions.
// Wires to the existing action-lineage-persistence adapter.
// ═══════════════════════════════════════════════════════════════

import type { ActionRecord, ActionState, ActionStateTransition } from "@/packages/contracts/domain-types/os-unified";
import {
  persistActionRecord,
  persistActionTransition,
  linkEventToAction,
  linkReceiptToAction,
  linkPolicyToAction,
  linkMemoryToAction,
  addProofToAction,
  fetchActionLineage,
  getActionExplanation,
  findStuckActions,
} from "@/lib/persistence/action-lineage-persistence";

export class ActionLineageService {
  private activeActions = new Map<string, ActionRecord>();

  /** Initiate a new tracked action with durable persistence */
  async initiateAction(
    record: ActionRecord,
    opts?: { actionType?: string; initiatingSurface?: string }
  ): Promise<string | null> {
    this.activeActions.set(record.id, record);

    const persistedId = await persistActionRecord(record, opts);
    if (!persistedId) {
      console.error("[action-lineage] Failed to persist action:", record.id);
    }
    return persistedId;
  }

  /** Record a state transition on an existing action */
  async transitionAction(
    actionId: string,
    newState: ActionState,
    transition: ActionStateTransition,
    opts?: {
      rollbackEligible?: boolean;
      confidenceScore?: number;
      blockingReasons?: string[];
    }
  ): Promise<boolean> {
    // Update in-memory
    const active = this.activeActions.get(actionId);
    if (active) {
      active.currentState = newState;
      active.stateHistory = [...active.stateHistory, transition];
    }

    return persistActionTransition(actionId, newState, transition, opts);
  }

  /** Link an event to an action for lineage tracing */
  async linkEvent(actionId: string, eventId: string): Promise<boolean> {
    return linkEventToAction(actionId, eventId);
  }

  /** Link a receipt to an action for proof chain */
  async linkReceipt(actionId: string, receiptId: string): Promise<boolean> {
    return linkReceiptToAction(actionId, receiptId);
  }

  /** Link a policy evaluation to an action for governance trail */
  async linkPolicy(actionId: string, policyEvalId: string): Promise<boolean> {
    return linkPolicyToAction(actionId, policyEvalId);
  }

  /** Link a memory entry to an action for context trail */
  async linkMemory(actionId: string, memoryId: string): Promise<boolean> {
    return linkMemoryToAction(actionId, memoryId);
  }

  /** Add proof reference to an action */
  async addProof(actionId: string, proofId: string): Promise<boolean> {
    return addProofToAction(actionId, proofId);
  }

  /** Query persisted action history */
  async queryActions(filters?: {
    domain?: string;
    currentState?: ActionState;
    workflowId?: string;
    includeArchived?: boolean;
    limit?: number;
  }) {
    return fetchActionLineage(filters);
  }

  /** Get full action explanation with linked events/policies/receipts */
  async getExplanation(actionId: string) {
    return getActionExplanation(actionId);
  }

  /** Find stuck actions */
  async findStuck(thresholdMs?: number) {
    return findStuckActions(thresholdMs);
  }

  /** Get in-memory active actions count */
  getActiveCount(): number {
    return this.activeActions.size;
  }
}

// ── Singleton ─────────────────────────────────────────────────────

let _instance: ActionLineageService | null = null;

export function getActionLineageService(): ActionLineageService {
  if (!_instance) _instance = new ActionLineageService();
  return _instance;
}

export function createActionLineageService(): ActionLineageService {
  return new ActionLineageService();
}
