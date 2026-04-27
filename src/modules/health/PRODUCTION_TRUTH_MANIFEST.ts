// ═══════════════════════════════════════════════════════════════
// SITA OS — Health OS Production-Truth Manifest (Phase 6.1)
//
// Single source of truth for the production state of every
// Health page under src/modules/health/pages/. Mirrors the
// Business / Concierge / Finance manifests in shape and semantics
// so the audit checker can reuse the same eight rules.
//
// Used by:
//   - scripts/architecture/check-health-truth.ts (CI guardrail)
//   - src/__tests__/health/health-page-state-grammar.test.ts
//   - PageTruthBanner default state per page
// ═══════════════════════════════════════════════════════════════

export type TruthState = "fully-wired" | "degraded" | "hidden";

export interface PageTruthEntry {
  /** File stem under src/modules/health/pages/ (no .tsx). */
  page: string;
  /** Subdir under pages/ — "" for top-level (Health currently has none). */
  subdir: "";
  /** Final truth classification. */
  state: TruthState;
  /** Canonical data sources (hooks/services/tables). Required when state === "fully-wired". */
  sources?: ReadonlyArray<string>;
  /** Honest reason for "degraded" state — surfaced in the truth banner. */
  degradedReason?: string;
  /** Reason for "hidden" — explains why removed from main IA. */
  hiddenReason?: string;
  /** Default truth-banner state for the page. */
  bannerState?: "live" | "demo" | "partial" | "degraded" | "connecting";
}

export const HEALTH_TRUTH_MANIFEST: ReadonlyArray<PageTruthEntry> = [
  { page: "HealthHome",           subdir: "", state: "degraded",   degradedReason: "Pillar landing tiles are an IA descriptor; no live aggregate yet — sub-apps wire their own data.", bannerState: "partial" },
  { page: "HealthFitness",        subdir: "", state: "degraded",   degradedReason: "Fitness logging pipeline not yet wired; renders honest setup-required state.",                  bannerState: "partial" },
  { page: "HealthNutrition",      subdir: "", state: "degraded",   degradedReason: "Nutrition logging pipeline not yet wired; renders honest setup-required state.",                bannerState: "partial" },
  { page: "HealthRecovery",       subdir: "", state: "degraded",   degradedReason: "Sleep/recovery telemetry pipeline not yet wired; renders honest setup-required state.",         bannerState: "partial" },
  { page: "HealthStub",           subdir: "", state: "degraded",   degradedReason: "Generic placeholder for not-yet-built sub-apps (medical/fitness etc.) — intentionally honest.",  bannerState: "partial" },
  { page: "HealthMedical",        subdir: "", state: "fully-wired", sources: ["useHealthMedicalRecords / health domain hooks"], bannerState: "live" },
  { page: "HealthMetricsApp",     subdir: "", state: "fully-wired", sources: ["useHealthMetrics", "health metrics tables"],     bannerState: "live" },
  { page: "HealthRemindersPage",  subdir: "", state: "fully-wired", sources: ["useHealthReminders", "reminders pipeline"],      bannerState: "live" },
  { page: "HealthWearables",      subdir: "", state: "fully-wired", sources: ["useWearables / wearable_devices"],               bannerState: "live" },
] as const;

// ── Helpers ────────────────────────────────────────────────────

export function getTruthEntry(page: string): PageTruthEntry | undefined {
  return HEALTH_TRUTH_MANIFEST.find((e) => e.page === page);
}

export function getPagesByState(state: TruthState): ReadonlyArray<PageTruthEntry> {
  return HEALTH_TRUTH_MANIFEST.filter((e) => e.state === state);
}

export function summarizeManifest() {
  const total = HEALTH_TRUTH_MANIFEST.length;
  const fullyWired = getPagesByState("fully-wired").length;
  const degraded = getPagesByState("degraded").length;
  const hidden = getPagesByState("hidden").length;
  return { total, fullyWired, degraded, hidden };
}