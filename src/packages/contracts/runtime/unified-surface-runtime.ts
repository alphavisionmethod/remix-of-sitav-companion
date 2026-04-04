// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Unified Surface Runtime Contract
// One shared contract consumed by web/admin/desktop/mobile
// for command, proof, approval, and degraded semantics
// ═══════════════════════════════════════════════════════════════

import type { ShellFrame } from "@/packages/shell-grammar";

// ── Surface Identity ─────────────────────────────────────────

export type SurfaceId = "web" | "admin" | "desktop" | "mobile";

// ── Unified Command Envelope ─────────────────────────────────
// Surface-agnostic command that any surface can emit

export interface UnifiedCommand {
  id: string;
  surface: SurfaceId;
  action: string;
  target: string;
  payload: Record<string, unknown>;
  proofRequired: boolean;
  approvalRequired: boolean;
  degradedFallback: DegradedFallbackStrategy;
  correlationId: string;
  tenantId: string;
  issuedAt: string;
  shellFrame: ShellFrame;
  trustScoreAtIssuance: number;
}

// ── Proof Requirements ───────────────────────────────────────
// Per-command proof emission rules — identical across surfaces

export interface UnifiedProofRequirement {
  commandAction: string;
  emitReceipt: boolean;
  receiptType: string;
  chainRequired: boolean;
  attestationRequired: boolean;
  minimumTrustScore: number;
  proofRetentionDays: number;
}

// ── Approval Requirements ────────────────────────────────────
// Per-command approval gate rules — identical across surfaces

export type UnifiedApprovalMode = "none" | "single" | "dual" | "owner-only" | "quorum";

export interface UnifiedApprovalRequirement {
  commandAction: string;
  mode: UnifiedApprovalMode;
  requiredApprovers: number;
  timeoutMs: number;
  escalationAfterMs: number;
  bypassTrustThreshold?: number;
  allowDelegation: boolean;
}

// ── Degraded Semantics ───────────────────────────────────────
// What each surface does when degraded

export type DegradedFallbackStrategy =
  | "cache-only"
  | "queue-for-sync"
  | "refuse"
  | "local-fallback"
  | "read-only";

export type DegradedReason =
  | "offline"
  | "cloud-unreachable"
  | "trust-below-threshold"
  | "capability-unavailable"
  | "rate-limited"
  | "maintenance";

export interface UnifiedDegradedSemantics {
  surface: SurfaceId;
  reason: DegradedReason;
  fallback: DegradedFallbackStrategy;
  userMessage: string;
  retryAfterMs?: number;
  localCapabilities: string[];
  blockedCapabilities: string[];
  proofEmissionMode: "normal" | "deferred" | "local-only" | "suspended";
}

// ── Surface Runtime Config ───────────────────────────────────
// Complete runtime configuration for a surface

export interface SurfaceRuntimeConfig {
  surface: SurfaceId;
  defaultFrame: ShellFrame;
  proofRequirements: UnifiedProofRequirement[];
  approvalRequirements: UnifiedApprovalRequirement[];
  degradedBehaviors: UnifiedDegradedSemantics[];
  supportedCapabilities: string[];
  nativeOnly: string[];
  maxConcurrentCommands: number;
  commandTimeoutMs: number;
  heartbeatIntervalMs: number;
}

// ── Command Result ───────────────────────────────────────────

export type CommandResultStatus = "success" | "failed" | "queued" | "requires-approval" | "degraded-fallback";

export interface UnifiedCommandResult {
  commandId: string;
  status: CommandResultStatus;
  surface: SurfaceId;
  receiptId?: string;
  approvalId?: string;
  degradedInfo?: UnifiedDegradedSemantics;
  resultPayload?: Record<string, unknown>;
  completedAt: string;
  durationMs: number;
}
