// ═══════════════════════════════════════════════════════════════
// SITA OS — Issue Lifecycle State Machine
// Manages item transitions through the full pipeline
// ═══════════════════════════════════════════════════════════════

import { getEventBus } from "@/platform/core-services/event-bus";
import type { IssueLifecycleState } from "./types";

// ── Valid Transitions ───────────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<IssueLifecycleState, IssueLifecycleState[]> = {
  detected: ["advisor_review"],
  advisor_review: ["app_board_review", "closed"],
  app_board_review: ["boardroom_candidate", "closed"],
  boardroom_candidate: ["boardroom_active", "closed"],
  boardroom_active: ["simulation_pending", "approval_pending", "evidence_requested", "deferred"],
  simulation_pending: ["approval_pending", "boardroom_active", "deferred"],
  approval_pending: ["approved", "deferred", "evidence_requested"],
  approved: ["executed", "outcome_tracking"],
  deferred: ["boardroom_active", "closed"],
  evidence_requested: ["boardroom_active", "simulation_pending", "closed"],
  executed: ["outcome_tracking", "closed"],
  outcome_tracking: ["closed"],
  closed: [],
};

export interface LifecycleEvent {
  item_id: string;
  from_state: IssueLifecycleState;
  to_state: IssueLifecycleState;
  timestamp: string;
  reason?: string;
}

const lifecycleHistory: Map<string, LifecycleEvent[]> = new Map();
const currentStates: Map<string, IssueLifecycleState> = new Map();

/**
 * Validate a state transition.
 */
export function canTransition(from: IssueLifecycleState, to: IssueLifecycleState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Transition an item to a new lifecycle state.
 */
export function transitionState(
  itemId: string,
  newState: IssueLifecycleState,
  reason?: string
): { success: boolean; error?: string } {
  const currentState = currentStates.get(itemId) || "detected";

  if (!canTransition(currentState, newState)) {
    return {
      success: false,
      error: `Invalid transition: ${currentState} → ${newState}`,
    };
  }

  const event: LifecycleEvent = {
    item_id: itemId,
    from_state: currentState,
    to_state: newState,
    timestamp: new Date().toISOString(),
    reason,
  };

  currentStates.set(itemId, newState);

  if (!lifecycleHistory.has(itemId)) lifecycleHistory.set(itemId, []);
  lifecycleHistory.get(itemId)!.push(event);

  // Publish lifecycle event to event bus
  const bus = getEventBus();
  bus.publish("lifecycle.transition", event as unknown as Record<string, unknown>, {
    source: "issue-lifecycle",
    correlationId: itemId,
    skipPersist: true,
  });

  return { success: true };
}

/**
 * Get current state for an item.
 */
export function getCurrentState(itemId: string): IssueLifecycleState {
  return currentStates.get(itemId) || "detected";
}

/**
 * Get full lifecycle trail for an item.
 */
export function getLifecycleTrail(itemId: string): LifecycleEvent[] {
  return lifecycleHistory.get(itemId) || [];
}

/**
 * Register a new item at the detected state.
 */
export function registerItem(itemId: string): void {
  if (!currentStates.has(itemId)) {
    currentStates.set(itemId, "detected");
    lifecycleHistory.set(itemId, [{
      item_id: itemId,
      from_state: "detected",
      to_state: "detected",
      timestamp: new Date().toISOString(),
      reason: "Item registered",
    }]);
  }
}

/**
 * Get all items in a given state.
 */
export function getItemsInState(state: IssueLifecycleState): string[] {
  const result: string[] = [];
  currentStates.forEach((s, id) => { if (s === state) result.push(id); });
  return result;
}

/**
 * Get the allowed transition map (for UI display).
 */
export function getAllowedTransitions(): Record<IssueLifecycleState, IssueLifecycleState[]> {
  return { ...ALLOWED_TRANSITIONS };
}

/**
 * Get human-readable label for a lifecycle state.
 */
export function getStateLabel(state: IssueLifecycleState): string {
  const labels: Record<IssueLifecycleState, string> = {
    detected: "Detected",
    advisor_review: "Advisor Review",
    app_board_review: "Board Review",
    boardroom_candidate: "Boardroom Candidate",
    boardroom_active: "Boardroom Active",
    simulation_pending: "Simulation Pending",
    approval_pending: "Approval Pending",
    approved: "Approved",
    deferred: "Deferred",
    evidence_requested: "Evidence Requested",
    executed: "Executed",
    outcome_tracking: "Outcome Tracking",
    closed: "Closed",
  };
  return labels[state] || state;
}
