// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Behavior Registry
// Recovery strategies per service/surface
// References os-services/recovery-levels — does NOT duplicate
// ═══════════════════════════════════════════════════════════════

import type { RecoveryLevel } from "@/lib/os-services/recovery-levels";

export type RecoveryStrategy =
  | "auto-restart"
  | "restart-with-backoff"
  | "safe-mode"
  | "fallback-to-cache"
  | "disable-and-notify"
  | "escalate-to-owner"
  | "factory-reset";

export interface RecoveryBehaviorEntry {
  serviceId: string;
  /** Recovery attempts in order — escalates through these */
  escalationPath: RecoveryStep[];
  /** Maximum total recovery time before giving up (ms) */
  maxRecoveryTimeMs: number;
  /** Whether to notify the user during recovery */
  notifyUser: boolean;
}

export interface RecoveryStep {
  /** Which recovery level from os-services/recovery-levels */
  recoveryLevel: RecoveryLevel;
  /** Strategy to apply */
  strategy: RecoveryStrategy;
  /** Maximum attempts at this level before escalating */
  maxAttempts: number;
  /** Backoff between attempts (ms) */
  backoffMs: number;
}

export const RECOVERY_BEHAVIORS: RecoveryBehaviorEntry[] = [
  {
    serviceId: "event-bus",
    maxRecoveryTimeMs: 30_000,
    notifyUser: false,
    escalationPath: [
      { recoveryLevel: 1, strategy: "auto-restart", maxAttempts: 3, backoffMs: 1_000 },
      { recoveryLevel: 6, strategy: "safe-mode", maxAttempts: 1, backoffMs: 0 },
    ],
  },
  {
    serviceId: "memory-service",
    maxRecoveryTimeMs: 60_000,
    notifyUser: false,
    escalationPath: [
      { recoveryLevel: 1, strategy: "auto-restart", maxAttempts: 3, backoffMs: 2_000 },
      { recoveryLevel: 2, strategy: "restart-with-backoff", maxAttempts: 2, backoffMs: 5_000 },
      { recoveryLevel: 4, strategy: "disable-and-notify", maxAttempts: 1, backoffMs: 0 },
    ],
  },
  {
    serviceId: "brain-core",
    maxRecoveryTimeMs: 120_000,
    notifyUser: true,
    escalationPath: [
      { recoveryLevel: 1, strategy: "auto-restart", maxAttempts: 2, backoffMs: 3_000 },
      { recoveryLevel: 3, strategy: "fallback-to-cache", maxAttempts: 1, backoffMs: 0 },
      { recoveryLevel: 5, strategy: "escalate-to-owner", maxAttempts: 1, backoffMs: 0 },
    ],
  },
  {
    serviceId: "executor-service",
    maxRecoveryTimeMs: 60_000,
    notifyUser: true,
    escalationPath: [
      { recoveryLevel: 1, strategy: "auto-restart", maxAttempts: 3, backoffMs: 2_000 },
      { recoveryLevel: 4, strategy: "disable-and-notify", maxAttempts: 1, backoffMs: 0 },
      { recoveryLevel: 5, strategy: "escalate-to-owner", maxAttempts: 1, backoffMs: 0 },
    ],
  },
  {
    serviceId: "connector-control",
    maxRecoveryTimeMs: 120_000,
    notifyUser: false,
    escalationPath: [
      { recoveryLevel: 1, strategy: "auto-restart", maxAttempts: 5, backoffMs: 5_000 },
      { recoveryLevel: 2, strategy: "restart-with-backoff", maxAttempts: 3, backoffMs: 15_000 },
    ],
  },
];

export function getRecoveryBehavior(serviceId: string): RecoveryBehaviorEntry | undefined {
  return RECOVERY_BEHAVIORS.find((r) => r.serviceId === serviceId);
}

export function getMaxRecoveryLevel(serviceId: string): RecoveryLevel | undefined {
  const behavior = getRecoveryBehavior(serviceId);
  if (!behavior || behavior.escalationPath.length === 0) return undefined;
  return behavior.escalationPath[behavior.escalationPath.length - 1].recoveryLevel;
}
