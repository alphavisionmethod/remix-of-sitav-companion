// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Trusted Boot Lifecycle
// Trusted device boot sequence and trust initialization contracts
// ═══════════════════════════════════════════════════════════════

export type BootPhase =
  | "device-discovery"
  | "attestation-check"
  | "identity-bind"
  | "trust-baseline"
  | "policy-sync"
  | "capability-load"
  | "memory-hydrate"
  | "ready"
  | "recovery";

export type AccessibilityProfile = "standard" | "large-text" | "high-contrast" | "screen-reader" | "reduced-motion";

export interface TrustedBootSequence {
  id: string;
  deviceId: string;
  userId: string;
  tenantId: string;
  startedAt: string;
  completedAt?: string;
  currentPhase: BootPhase;
  phases: BootPhaseRecord[];
  trustBaseline: number;
  recoveryEnvelope?: BootRecoveryEnvelope;
  accessibilityProfile: AccessibilityProfile;
  tonePreference: "professional" | "friendly" | "minimal";
}

export interface BootPhaseRecord {
  phase: BootPhase;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface BootRecoveryEnvelope {
  lastKnownGoodState: string;
  recoveryReason: string;
  staleDataWarnings: string[];
  offlineCapabilities: string[];
  syncRequired: boolean;
  estimatedSyncMs: number;
}