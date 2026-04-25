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
  // ─── Wave 0.7 — Semantic Route-Adapter Contract (Constitution Rules 33–35, BLOCKING) ──
  {
    validator: "check-page-semantic-adapter",
    gateId: "page-semantic-adapter",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 0.7 semantic route-adapter contract. Every src/pages/** file must belong to one of six adapter subtypes (pure-reexport, lazy, redirect, param-translate, shell-mount, event-dispatch) and must not contain forbidden APIs (supabase.*, TanStack queries/mutations, useState/useReducer for canonical state). The legacy-violation count is monotone-decreasing per Rule 34.",
  },
  {
    validator: "check-page-adapter-subtype-declaration",
    gateId: "page-adapter-subtype-declaration",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 0.7 forward-looking declaration check. When a src/pages/** file carries the // @route-adapter: directive, its declared subtype must match the content the classifier detects. Enforces Constitution Rule 35.",
  },
  // ─── Wave 0.9 — Concept-Based Shared Component Rule (Constitution Rules 36–38, BLOCKING) ──
  {
    validator: "check-shared-component-concept-rule",
    gateId: "shared-component-concept-rule",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 0.9 concept-based shared component rule. Replaces the structural 'used by ≥2 pillars' heuristic with a semantic 3-test rule (vocabulary, dependency, portability). Net-new files under src/components/** must classify as shared-clean; the 12 grandfathered violators are baselined and monotone-decreasing per Constitution Rule 37. See docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md.",
  },
  // ─── Wave 1.2 — Contract Layer Ownership (Constitution Rules 39–42, BLOCKING) ──
  {
    validator: "check-public-contract-barrel-purity",
    gateId: "public-contract-barrel-purity",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 1.2 Rule 40. Asserts src/contracts/** stays a pure public re-export barrel (re-exports only; no implementation bodies; no forbidden imports from react/supabase/services/components/pages/hooks/contexts/modules). See docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md.",
  },
  {
    validator: "check-platform-local-contract-scope",
    gateId: "platform-local-contract-scope",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 1.2 Rule 42. Asserts files under src/platform/<X>/contracts/** are imported only from inside src/platform/<X>/**. Cross-system / pillar / page importers indicate the contract must be promoted to src/packages/<family>-contracts/. Deprecated re-export shims (frontmatter @deprecated Wave 1.2) are exempted and tracked under the Rule 23 shim baseline.",
  },
  {
    validator: "check-contract-duplicate-identifiers",
    gateId: "contract-duplicate-identifiers",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 1.2 Rule 39. Asserts no exported type/interface/enum/const identifier appears in ≥2 of {src/contracts/**, src/packages/**, src/domains/types/**, src/platform/<X>/contracts/**}. Emits generated/manifests/contract-ownership-map.json and generated/audits/duplicate-contract-family-report.json. Sealed at 0 dupes after the Wave 1.2 promotions.",
  },
  // ─── Wave 1.3 — Service / Adapter / Client Vocabulary Coherence (Constitution Rule 43, BLOCKING) ──
  {
    validator: "check-service-vocabulary-coherence",
    gateId: "service-vocabulary-coherence",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave 1.3 Rule 43. Bridges the user-facing `service / adapter / client` vocabulary onto the existing 5-layer Service Layer Constitution and enforces the four forbidden sprawl patterns (service-as-transport, client-as-orchestrator, adapter-as-facade, raw-SDK bypass). See docs/architecture/SERVICE_ADAPTER_CLIENT_OWNERSHIP_MODEL.md and src/lib/migration/service-vocabulary-bridge.ts.",
  },
  // ─── Wave B — Generated Artifact Governance (Constitution §B.1, BLOCKING) ──
  {
    validator: "check-generated-artifact-governance",
    gateId: "generated-artifact-governance",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave B §B.1. Enforces the 4-class lifecycle model (active-blocking / active-informational / reference / historical-archived) over every file in generated/**. Reads generated/manifests/generated-artifact-governance-map.json and generated/baselines/orphan-artifact-baseline.json (917 pre-Wave-B orphans pinned). Fails on stale active-blocking artifacts, missing active artifacts, or new orphans beyond baseline. See docs/architecture/GENERATED_ARTIFACT_LIFECYCLE_MODEL.md.",
  },
  // ─── Wave B — Frontend/Backend Boundary Ratchet (Constitution §B.2, BLOCKING) ──
  {
    validator: "check-page-backend-bypass",
    gateId: "page-backend-bypass",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave B §B.2. Monotone ratchet over direct @/integrations/supabase imports from src/pages/** (baseline 145, decrease-only), src/components/** (sealed at 0, zero-tolerance), and src/domains/** (baseline 9, decrease-only). New violators must be moved to a canonical service facade in src/lib/services/**. See docs/architecture/FRONTEND_BACKEND_OWNERSHIP_MODEL.md and generated/baselines/page-backend-bypass-baseline.json.",
  },
  // ─── Wave C — UI Ownership Law (Constitution §C.1, BLOCKING) ──
  {
    validator: "check-ui-ownership",
    gateId: "ui-ownership",
    classification: "block",
    consumer: "release-readiness",
    rationale: "Wave C §C.1. Enforces the 5-zone UI ownership model. (1) Sealed allowlist for src/components/* — only NavLink.tsx, primitives/, ui/, __tests__/ may exist; (2) Forbids deprecated shim folders (cards/, launcher/, navigation/, shared/) from being re-introduced; (3) Primitive purity — files under src/components/primitives/** may not import from @/modules/**, @/platform/**, @/admin/**, @/app/**, @/runtimes/**; (4) Forbids module/platform/admin-semantic component names under src/components/ root. See docs/architecture/UI_OWNERSHIP_MODEL.md and generated/manifests/ui-ownership-map.json.",
  },
];

/** Lookup table for fast access by validator basename. */
export const VALIDATOR_GATE_OVERRIDE_INDEX: Map<string, ValidatorGateMapEntry> =
  new Map(VALIDATOR_GATE_OVERRIDES.map((e) => [e.validator, e]));
