// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Lifecycle Registry
// Canonical service lifecycle states
// References os-services/app-lifecycle — does NOT duplicate
// ═══════════════════════════════════════════════════════════════

import type { AppState, AppTransition } from "@/lib/os-services/app-lifecycle";

/**
 * Service-level lifecycle extends the app lifecycle concept
 * to background services, daemons, and orchestration layers.
 */
export type ServiceState =
  | "unregistered"
  | "registered"
  | "initializing"
  | "ready"
  | "running"
  | "degraded"
  | "suspended"
  | "recovering"
  | "failed"
  | "terminated";

export type ServiceTransition =
  | "register"
  | "initialize"
  | "start"
  | "degrade"
  | "suspend"
  | "resume"
  | "recover"
  | "fail"
  | "terminate"
  | "restart";

export interface ServiceLifecycleEntry {
  serviceId: string;
  displayName: string;
  state: ServiceState;
  /** Maps to app lifecycle for UI-level services */
  appStateEquivalent?: AppState;
  /** Allowed transitions from current state */
  allowedTransitions: ServiceTransition[];
  /** Whether the service is critical (blocks boot if failed) */
  critical: boolean;
  /** Startup phase (from service-startup-order) */
  startupPhase: number;
}

const VALID_SERVICE_TRANSITIONS: Record<ServiceState, ServiceTransition[]> = {
  unregistered: ["register"],
  registered: ["initialize"],
  initializing: ["start", "fail"],
  ready: ["start", "terminate"],
  running: ["degrade", "suspend", "fail", "terminate"],
  degraded: ["recover", "fail", "terminate"],
  suspended: ["resume", "terminate"],
  recovering: ["start", "fail"],
  failed: ["restart", "terminate"],
  terminated: ["register"],
};

export function getValidTransitions(state: ServiceState): ServiceTransition[] {
  return VALID_SERVICE_TRANSITIONS[state] ?? [];
}

export function isTransitionValid(from: ServiceState, transition: ServiceTransition): boolean {
  return VALID_SERVICE_TRANSITIONS[from]?.includes(transition) ?? false;
}

export function getNextState(from: ServiceState, transition: ServiceTransition): ServiceState | null {
  if (!isTransitionValid(from, transition)) return null;
  const stateMap: Record<ServiceTransition, ServiceState> = {
    register: "registered",
    initialize: "initializing",
    start: "running",
    degrade: "degraded",
    suspend: "suspended",
    resume: "running",
    recover: "recovering",
    fail: "failed",
    terminate: "terminated",
    restart: "initializing",
  };
  return stateMap[transition];
}
