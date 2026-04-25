// Canonical Validator-to-Gate Map.
// Every check-*.ts under scripts/architecture/checks/ MUST be classified here
// (or be auto-classified by generate-validator-gate-map.ts via name-match against
// REQUIRED_GATES / deployment-gap-suite). This file is the source of truth for
// overrides — it lets us declare gateId, classification, and consumer when the
// validator filename does NOT match its gateId 1:1.
//
// Owned by: Architecture Governance.
// Consumed by:
//   - scripts/manifests/generate/generate-validator-gate-map.ts
//   - scripts/architecture/checks/check-validator-gate-coverage.ts
//   - scripts/architecture/checks/check-os-release-readiness.ts (advisory ingestion)

export type ValidatorClassification =
  | "block"      // Wired into REQUIRED_GATES; failure blocks release.
  | "warn"       // Wired into a WARN bucket; failure surfaces as warning only.
  | "advisory"   // Run on demand or in advisory suite; surfaced in readiness summary.
  | "disabled"   // Intentionally inert; must reference a kill-switch.
  | "archived";  // Slated for removal; must be moved to archive/ folder.

export type ValidatorConsumer =
  | "release-readiness"     // Read by check-os-release-readiness.ts BLOCK loop.
  | "deployment-gap-suite"  // Read by run-all-deployment-gap-gates.ts.
  | "warn-ratchet"          // Read by check-warn-ratchet / per-bucket-warn-ratchet.
  | "advisory-only"         // Stand-alone or surfaced via advisory ingestion.
  | "kill-switched"         // Inert pending kill-switch flip.
  | "archived";

export interface ValidatorGateMapEntry {
  /** Validator script basename without extension, e.g. "check-foo". */
  validator: string;
  /** Canonical gate identifier (matches generated/<gateId>-report.json). */
  gateId: string;
  classification: ValidatorClassification;
  consumer: ValidatorConsumer;
  /** Optional WARN bucket name when classification === "warn". */
  bucket?: string;
  /** Required when classification === "disabled". */
  killSwitchRef?: string;
  /** Human-readable rationale. */
  rationale: string;
}

/**
 * Manual overrides only. The generator auto-classifies everything else by:
 *   1. If gateId (= validator stripped of "check-") ∈ REQUIRED_GATES → block / release-readiness
 *   2. Else if validator ∈ deployment-gap-suite → warn / deployment-gap-suite
 *   3. Else → advisory / advisory-only
 *
 * Add an entry below ONLY when:
 *   - The validator filename does NOT match its real gateId, OR
 *   - You want to mark a validator as `disabled` / `archived`, OR
 *   - You want to override the auto-classification for governance reasons.
 */
export const VALIDATOR_GATE_OVERRIDES: ValidatorGateMapEntry[] = [
  // ─── Validator filename ≠ gateId (need explicit gateId) ──────────────────
  // (None known at present — all current name-mismatches live in scripts/validation/
  // and are not under scripts/architecture/checks/. If new ones appear, declare them here.)

  // ─── Disabled / kill-switched (must cite kill switch) ────────────────────
  // (None at present.)

  // ─── Archived (must live under archive/, not under scripts/architecture/checks/) ──
  // (None at present.)

  // ─── WARN-tier advisory drift detectors ──────────────────────────────────
  {
    validator: "check-routes-inventory-completeness",
    gateId: "routes-inventory-completeness",
    classification: "warn",
    consumer: "advisory-only",
    bucket: "architecture-hygiene",
    rationale: "Asserts public/generated/routes.json is fresh, mirrors generated/routes.json, and covers all <Route> declarations across App.tsx + every src/routes/* shell. WARN-tier — does not block release; surfaces in advisory ingestion.",
  },
  // ─── Wave 0.5 — Platform Subclassification (Constitution Rule 27, BLOCKING) ──
  {
    validator: "check-platform-anti-patterns",
    gateId: "platform-anti-patterns",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 0.5 promotion. Thin wrapper that delegates to scripts/architecture/check-platform-subclassification.ts. Promoted from advisory to BLOCK so platform sprawl regressions fail CI under Constitution Rule 27.",
  },
  {
    validator: "check-platform-subclassification",
    gateId: "platform-subclassification",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 0.5 canonical subclassification gate. Verifies every src/platform/<X>/ folder is classified into one of the six canonical subclasses and that cross-subclass imports respect the monotone ratchet (decrease-only). Wired into foundation-gate.yml as BLOCKING.",
  },
  // ─── Wave 0.6 — Admin Plane Law (Constitution Rules 29–32, BLOCKING) ──
  {
    validator: "check-admin-plane-boundaries",
    gateId: "admin-plane-boundaries",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 0.6 admin plane boundary gate. Verifies platform→admin, modules→admin, and admin→modules import counts have not grown above their sealed baselines, and that no new page-body files were added under src/pages/admin/. Wired into foundation-gate.yml as BLOCKING.",
  },
  {
    validator: "check-admin-page-body-ratchet",
    gateId: "admin-page-body-ratchet",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 0.6 admin page-body monotone ratchet. The LEGACY_PAGE_BODY count under src/pages/admin/ may only decrease — new admin pages must be thin re-exports targeting @/admin/** per Constitution Rule 30.",
  },
];

/** Lookup table for fast access by validator basename. */
export const VALIDATOR_GATE_OVERRIDE_INDEX: Map<string, ValidatorGateMapEntry> =
  new Map(VALIDATOR_GATE_OVERRIDES.map((e) => [e.validator, e]));
