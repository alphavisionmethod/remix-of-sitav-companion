// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof Threshold Policy
// Minimum evidence thresholds per category for "working" claims.
// ═══════════════════════════════════════════════════════════════

import type { HardProofCategory } from "./proof-category-model";

export type ReadinessLanguage =
  | "production-ready"    // all 7 categories present
  | "release-candidate"   // blocking categories present, advisory partial
  | "beta"                // blocking present, advisory gaps
  | "alpha"               // some blocking gaps
  | "pre-alpha";          // major gaps

export interface ProofThreshold {
  readonly category: HardProofCategory;
  readonly minimumStatus: "present" | "partial";
  readonly minimumEvidenceCount: number;
  readonly requiredForLanguage: ReadinessLanguage;
}

export const PROOF_THRESHOLDS: readonly ProofThreshold[] = [
  { category: "IMPLEMENTATION", minimumStatus: "present", minimumEvidenceCount: 1, requiredForLanguage: "alpha" },
  { category: "WIRING",         minimumStatus: "present", minimumEvidenceCount: 1, requiredForLanguage: "alpha" },
  { category: "BEHAVIOR",       minimumStatus: "present", minimumEvidenceCount: 1, requiredForLanguage: "beta" },
  { category: "FAILURE",        minimumStatus: "partial", minimumEvidenceCount: 1, requiredForLanguage: "release-candidate" },
  { category: "RECOVERY",       minimumStatus: "partial", minimumEvidenceCount: 1, requiredForLanguage: "release-candidate" },
  { category: "OPERATIONAL",    minimumStatus: "partial", minimumEvidenceCount: 1, requiredForLanguage: "beta" },
  { category: "RELEASE",        minimumStatus: "present", minimumEvidenceCount: 1, requiredForLanguage: "beta" },
] as const;

export function getRequiredLanguage(presentCount: number, partialCount: number, missingCount: number): ReadinessLanguage {
  if (missingCount === 0 && partialCount === 0) return "production-ready";
  if (missingCount === 0 && partialCount <= 2) return "release-candidate";
  if (missingCount <= 1) return "beta";
  if (missingCount <= 3) return "alpha";
  return "pre-alpha";
}