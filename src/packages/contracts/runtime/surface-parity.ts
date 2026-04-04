// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Cross-Surface Parity Contracts
// Enforces degraded-state and proof-state parity across surfaces
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId, DegradedFallbackStrategy, DegradedReason } from "./unified-surface-runtime";

// ── Capability Support Level ─────────────────────────────────

export type CapabilitySupportLevel =
  | "full"           // Fully supported on this surface
  | "degraded"       // Supported with reduced functionality
  | "not-supported"  // Not available on this surface
  | "native-only";   // Only available on native surfaces (desktop/mobile)

// ── Surface Capability Matrix ────────────────────────────────
// What each surface can/cannot do — explicit not-supported vs degraded

export interface SurfaceCapabilityEntry {
  capability: string;
  support: CapabilitySupportLevel;
  degradedBehavior?: DegradedFallbackStrategy;
  reason?: string;
}

export interface SurfaceCapabilityMatrix {
  surfaces: Record<SurfaceId, SurfaceCapabilityEntry[]>;
  lastUpdated: string;
  version: string;
}

// ── Degraded State Map ───────────────────────────────────────
// Per-surface × per-capability degraded behavior matrix

export interface DegradedStateEntry {
  capability: string;
  reason: DegradedReason;
  fallback: DegradedFallbackStrategy;
  userMessage: string;
  autoRecover: boolean;
  maxDegradedDurationMs?: number;
}

export interface SurfaceDegradedStateMap {
  surfaces: Record<SurfaceId, DegradedStateEntry[]>;
  globalFallbacks: DegradedStateEntry[];
  lastValidated: string;
}

// ── Proof State Map ──────────────────────────────────────────
// Per-surface proof emission requirements — MUST be identical

export interface ProofStateEntry {
  commandAction: string;
  emitsReceipt: boolean;
  receiptType: string;
  chainIntegrityRequired: boolean;
  attestationRequired: boolean;
}

export interface SurfaceProofStateMap {
  /** Canonical proof requirements — apply to ALL surfaces identically */
  canonical: ProofStateEntry[];
  /** Per-surface overrides — should be EMPTY if parity is enforced */
  overrides: Record<SurfaceId, ProofStateEntry[]>;
  parityEnforced: boolean;
  lastValidated: string;
}

// ── Parity Violation ─────────────────────────────────────────
// Type for detected divergences between surfaces

export type ParityViolationType =
  | "missing-proof-emission"
  | "different-degraded-behavior"
  | "missing-capability"
  | "inconsistent-approval-gate"
  | "local-masking-divergence";

export interface ParityViolation {
  id: string;
  type: ParityViolationType;
  surface: SurfaceId;
  referenceSurface: SurfaceId;
  capability: string;
  description: string;
  severity: "critical" | "warning" | "info";
  detectedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string;
}

// ── Parity Report ────────────────────────────────────────────

export interface SurfaceParityReport {
  generatedAt: string;
  surfacesChecked: SurfaceId[];
  totalCapabilities: number;
  violations: ParityViolation[];
  parityScore: number; // 0-100, 100 = perfect parity
  proofParityValid: boolean;
  degradedParityValid: boolean;
  approvalParityValid: boolean;
}
