// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Surface Contract
// Connects feature barrels to governance, routes, apps, runtime,
// proof, and supportability layers.
// ═══════════════════════════════════════════════════════════════

import type { FeatureRiskTier, DomainAlignment, LaunchStatus } from "@/packages/feature-governance";
import type { RuntimeTier } from "@/runtimes/runtime-tier-model";

// ── State Grammar (shared UX states every feature should handle) ──

export const FEATURE_STATE_GRAMMAR = [
  "loading", "ready", "empty", "error", "blocked",
  "degraded", "recovery", "stale-data", "permission-required",
] as const;
export type FeatureState = typeof FEATURE_STATE_GRAMMAR[number];

// ── Proof Dimensions ──

export const PROOF_DIMENSIONS = [
  "implementation", "wiring", "behavior", "failure",
  "recovery", "operational", "release",
] as const;
export type ProofDimension = typeof PROOF_DIMENSIONS[number];

export type ProofCoverage = Record<ProofDimension, "covered" | "partial" | "missing">;

// ── Feature Surface Entry ──

export interface FeatureSurfaceEntry {
  /** Must match the barrel directory name under src/features/ */
  readonly featureId: string;
  /** Human-readable feature name */
  readonly name: string;
  /** Canonical import path, e.g. "@/features/boardroom" */
  readonly canonicalImport: string;
  /** Domain alignment from governance */
  readonly domain: DomainAlignment;
  /** Risk tier from governance */
  readonly riskTier: FeatureRiskTier;
  /** Launch status */
  readonly status: LaunchStatus;
  /** Route paths this feature owns */
  readonly ownedRoutes: readonly string[];
  /** App shell IDs this feature maps to (from app-plane-map) */
  readonly ownedApps: readonly string[];
  /** Runtime tiers where this feature is available */
  readonly runtimeSupport: readonly RuntimeTier[];
  /** Which UX states this feature explicitly handles */
  readonly stateGrammar: readonly FeatureState[];
  /** Proof coverage per dimension */
  readonly proofCoverage: ProofCoverage;
  /** Whether this feature integrates with support diagnostics */
  readonly supportIntegrated: boolean;
  /** Whether this feature integrates with trust/explanation surfaces */
  readonly trustIntegrated: boolean;
  /** Sub-features (e.g. business/crm, business/leads) */
  readonly subFeatures?: readonly string[];
  /** Features this barrel depends on */
  readonly dependencies?: readonly string[];
}

// ── Helpers ──

export const isFeatureDeployed = (entry: FeatureSurfaceEntry): boolean =>
  entry.status === "ga" || entry.status === "beta";

export const hasProofGap = (entry: FeatureSurfaceEntry): boolean =>
  Object.values(entry.proofCoverage).some(v => v === "missing");

export const featureStateGap = (entry: FeatureSurfaceEntry): readonly FeatureState[] =>
  FEATURE_STATE_GRAMMAR.filter(s => !entry.stateGrammar.includes(s));