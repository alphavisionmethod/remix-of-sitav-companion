// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Tools Plane Public API
// Simulation, FIP governance, dual-reality, demo data, seed scripts.
// Must NOT be imported by production code paths.
// ═══════════════════════════════════════════════════════════════

// ── Simulation Engine ──
export {
  dcfNPV, blackScholes, kellyCriterion, capmExpectedReturn,
  sharpeRatio, compoundInterest, parametricVaR, historicalVaR,
  expectedShortfall, sortinoRatio, maxDrawdown, FORMULA_REGISTRY,
} from "@/lib/simulation/financial-formulas";
export type { FormulaType } from "@/lib/simulation/financial-formulas";
export type { MarketDataPoint, IntelligenceReport } from "@/lib/simulation/market-intelligence";

// ── FIP (Feature Integration Protocol) ──
export {
  persistFeatureRegistration, loadPersistedFeatures,
  PLATFORM_SEED_FEATURES, seedPlatformFeatures,
} from "@/lib/fip/feature-registry-persistence";
export type {
  FeatureType, WedgePriority, RiskTier, AutonomyTier,
  IntakeStatus, ReadinessStage,
} from "@/lib/fip/types";

// ── Dual Reality ──
export * as DualReality from "@/lib/dual-reality";

// ── Reality Audit (namespaced — overlaps with reality-records) ──
export * as RealityAudit from "@/runtimes/reality/reality-audit-registry";

// ── Reality Records (namespaced — overlaps with reality-audit) ──
export * as RealityRecords from "@/lib/reality-records/canonical-records";
export * as TruthVocabulary from "@/lib/reality-records/truth-vocabulary";

// ── Demo Data ──
export * as DemoData from "@/lib/demo-data";

// ── Seed ──
export * as SeedScripts from "@/lib/seed";
