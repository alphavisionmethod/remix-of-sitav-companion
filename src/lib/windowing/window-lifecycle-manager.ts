// ═══════════════════════════════════════════════════════════════
// SITA OS — Window Lifecycle Manager
// Canonical 15-state machine with validated transitions.
// ═══════════════════════════════════════════════════════════════

import type { WindowContract, WindowLifecycleState } from "@/packages/window-contracts";
import { LIFECYCLE_TRANSITIONS, isValidTransition } from "@/packages/window-contracts";

export type LifecycleEventHandler = (
  windowId: string,
  from: WindowLifecycleState,
  to: WindowLifecycleState,
  transitionName: string
) => void;

const listeners: LifecycleEventHandler[] = [];

export function onLifecycleTransition(handler: LifecycleEventHandler): () => void {
  listeners.push(handler);
  return () => { const i = listeners.indexOf(handler); if (i >= 0) listeners.splice(i, 1); };
}

function emit(windowId: string, from: WindowLifecycleState, to: WindowLifecycleState, name: string) {
  for (const fn of listeners) { try { fn(windowId, from, to, name); } catch { /* swallow */ } }
}

/**
 * Attempt a lifecycle transition on a window contract.
 * Returns the updated contract or null if the transition is invalid.
 */
export function transitionWindow(
  contract: WindowContract,
  transitionName: string
): WindowContract | null {
  const t = LIFECYCLE_TRANSITIONS[transitionName];
  if (!t) return null;
  if (!isValidTransition(contract.lifecycleState, transitionName)) return null;

  const from = contract.lifecycleState;
  const updated: WindowContract = {
    ...contract,
    lifecycleState: t.to,
    evidence: {
      ...contract.evidence,
      lastTransitionAt: Date.now(),
      transitionCount: contract.evidence.transitionCount + 1,
    },
  };

  if (t.requiresFocusUpdate) {
    updated.focusState = t.to === "FOCUSED" ? "focused" : t.to === "BLURRED" ? "blurred" : "inactive";
  }

  if (t.to === "CRASHED") {
    updated.recovery = {
      ...updated.recovery,
      crashCount: updated.recovery.crashCount + 1,
      lastCrashAt: Date.now(),
    };
  }

  emit(contract.windowId, from, t.to, transitionName);
  return updated;
}

/**
 * Find the valid transition name that leads to the target state.
 */
export function findTransitionTo(
  currentState: WindowLifecycleState,
  targetState: WindowLifecycleState
): string | null {
  for (const [name, t] of Object.entries(LIFECYCLE_TRANSITIONS)) {
    if (t.to === targetState && t.from.includes(currentState)) return name;
  }
  return null;
}

/**
 * Get all valid transitions from the current state.
 */
export function getAvailableTransitions(currentState: WindowLifecycleState): string[] {
  return Object.entries(LIFECYCLE_TRANSITIONS)
    .filter(([, t]) => t.from.includes(currentState))
    .map(([name]) => name);
}