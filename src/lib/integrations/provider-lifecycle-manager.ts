// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Lifecycle Manager
// Canonical lifecycle state machine for provider connections
// ═══════════════════════════════════════════════════════════════

import { type ProviderId, PROVIDER_CONTRACT_REGISTRY } from "./provider-contract-registry";

export type ProviderLifecycleState =
  | "initial-connect" | "auth-issued" | "active" | "refresh"
  | "expiring" | "expired" | "reauth" | "disabled" | "recovered";

export type LifecycleEvent =
  | "connect" | "auth-complete" | "activate" | "token-expiring"
  | "token-expired" | "refresh-success" | "refresh-failure"
  | "reauth-initiated" | "reauth-complete" | "disable" | "recover";

const TRANSITIONS: Record<ProviderLifecycleState, Partial<Record<LifecycleEvent, ProviderLifecycleState>>> = {
  "initial-connect": { "auth-complete": "auth-issued" },
  "auth-issued": { activate: "active" },
  active: { "token-expiring": "expiring", disable: "disabled", "refresh-failure": "expired" },
  refresh: { "refresh-success": "active", "refresh-failure": "expired" },
  expiring: { "refresh-success": "active", "token-expired": "expired" },
  expired: { "reauth-initiated": "reauth", disable: "disabled" },
  reauth: { "reauth-complete": "active", disable: "disabled" },
  disabled: { recover: "recovered" },
  recovered: { activate: "active" },
};

export interface ProviderLifecycleRecord {
  providerId: ProviderId;
  currentState: ProviderLifecycleState;
  lastTransition: string;
  lastEvent: LifecycleEvent | null;
  history: Array<{ from: ProviderLifecycleState; to: ProviderLifecycleState; event: LifecycleEvent; at: string }>;
}

export function createLifecycleRecord(providerId: ProviderId): ProviderLifecycleRecord {
  return {
    providerId,
    currentState: "initial-connect",
    lastTransition: new Date().toISOString(),
    lastEvent: null,
    history: [],
  };
}

export function advanceProviderLifecycle(
  record: ProviderLifecycleRecord,
  event: LifecycleEvent
): ProviderLifecycleRecord {
  const possibleTransitions = TRANSITIONS[record.currentState];
  const nextState = possibleTransitions?.[event];
  if (!nextState) {
    console.warn(`[LIFECYCLE] Invalid transition: ${record.currentState} + ${event} for ${record.providerId}`);
    return record;
  }
  const now = new Date().toISOString();
  return {
    ...record,
    currentState: nextState,
    lastTransition: now,
    lastEvent: event,
    history: [...record.history, { from: record.currentState, to: nextState, event, at: now }],
  };
}

export function getRefreshPolicy(providerId: ProviderId) {
  return PROVIDER_CONTRACT_REGISTRY[providerId].refreshPolicy;
}