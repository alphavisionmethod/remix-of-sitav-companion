
The user wants the Manifest Truth Framework implemented in phases, each deployment-ready. Looking at context, much of the foundational work already exists in `src/lib/truth-manifests/` (manifest-registry, source-map, validator-map, CI-gate-map, runtime-consequence-map) and `scripts/manifests/` (generate + validate scripts). I need to audit what exists, identify gaps, and propose phases that strengthen weak linkages, add real implementation/runtime backing, and wire CI gates.

Let me structure 6 phases that build on existing scaffolding:

**Phase 1**: Audit & Registry Hardening — complete metadata for every entry, classify all generated artifacts, demote unenforced ones to informational.

**Phase 2**: Real Source-Truth Linkage — wire validators to actual route files, imports, edge functions, DB migrations, runtime registrations.

**Phase 3**: Runtime Evidence Layer — runtime probes feeding runtime-class manifests with live evidence (boot chain, service registry, capability registry).

**Phase 4**: CI Gate Wiring — every critical/high-severity manifest fails CI on drift; aggregator gate; release blockers.

**Phase 5**: Owner Admin Surfaces — Truth Dashboard, Drift Triage, Provenance Inspector under `/admin/verification`.

**Phase 6**: Tests, Docs, Cleanup — 8 governance tests, MANIFEST_TRUTH_FRAMEWORK.md, OWNERSHIP_MATRIX, RUNTIME_CONSEQUENCES, retire stale generators.

Each phase ends with: tsc clean, all checks green, app boots, no regressions to admin consolidation work.

<lov-plan>

# Manifest Truth Framework — Phased Plan

## Goal
Turn 57+ generated artifacts from "documentation theater" into a runtime-backed, CI-enforced truth pipeline. Every authoritative manifest must declare owner, source of truth, generator, validator, CI gate, and runtime consequence — and be backed by real implementation evidence.

## Foundation Already In Place
- `src/lib/truth-manifests/` — registry + source/validator/CI-gate/consequence maps
- `scripts/manifests/generate/` — registry + truth dashboard generators
- `scripts/manifests/validate/` — authority, runtime-linkage, CI-gates, source-truth checks

The phases below harden these scaffolds into enforceable truth.

## Phase Sequencing (each independently deployable)

### Phase 1 — Registry Hardening & Honest Classification
- Expand `manifest-registry.ts` to cover **every** file in `generated/` (currently partial). Classify each: `structural | contract | runtime | compliance | informational`.
- Mark every entry that lacks a real validator as `authoritative: false` + `informational`. No more silent authority claims.
- Add `manifest-types.ts` with the full `ManifestEntry` schema (owner, sourceOfTruth, generationInputs, validationInputs, ciGate, driftSeverity, runtimeConsequence, releaseConsequence, supportConsequence, consumers).
- New check: `check-manifest-authority-completeness.ts` — fails if any `authoritative: true` entry is missing required metadata.
- **Deployable**: pure metadata, zero behavior change.

### Phase 2 — Real Source-Truth Linkage
Wire validators to **actual implementation**, not other manifests.
- `check-route-manifest-vs-filesystem.ts` — diff `generated/route-manifest.json` against scanned `src/pages/**` + router config.
- `check-service-manifest-vs-imports.ts` — diff service manifest against import-graph scan.
- `check-edge-function-manifest-vs-supabase.ts` — diff against `supabase/functions/*` inventory.
- `check-db-manifest-vs-migrations.ts` — diff DB-sensitive manifests against `supabase/migrations/*` schema.
- `check-capability-manifest-vs-registrations.ts` — diff capability index against actual `registerCapability()` calls.
- Update each affected registry entry: `sourceOfTruth` becomes the real path, not the prior manifest.

### Phase 3 — Runtime Evidence Layer
Runtime-class manifests must be backed by live probes, not static scans.
- `src/lib/truth-manifests/runtime-evidence/` — collectors for boot chain, service registry, capability registry, shell-space, startup order.
- `generate-runtime-conformance-from-evidence.ts` — generator reads runtime evidence (captured during boot) instead of static source.
- `check-runtime-manifest-has-evidence.ts` — fails if any `type: 'runtime'` entry lacks an evidence collector.
- Demote any runtime manifest without evidence to `informational` until backed.

### Phase 4 — CI Gate Wiring
- `scripts/manifests/validate-all.ts` — aggregator that runs every manifest validator and exits non-zero on any `critical` or `high` drift.
- `check-manifest-ci-gate-coverage.ts` — fails if any `driftSeverity: 'critical' | 'high'` entry has no CI gate.
- Wire `validate-all.ts` into the existing release-readiness gate so drift blocks deploy.
- Generate `generated/manifest-drift-report.json` on every run for the admin dashboard.

### Phase 5 — Owner Admin Surfaces (under `/admin/verification`)
Three new pages composed via `DomainHubLayout` (registry-driven, consistent with admin consolidation):
- **Manifest Truth Dashboard** — authoritative vs informational counts, drift state, missing validators, missing CI gates, owners, last validation timestamp.
- **Manifest Drift Triage** — what drifted, runtime/release/support consequence, owner, remediation path.
- **Manifest Provenance Inspector** — per-manifest: generation source, validation source, CI gate, last run, evidence trail.
- All three read from `generated/manifest-truth-dashboard.json` and `generated/manifest-drift-report.json`.
- Register in `admin-route-registry.ts` under `verification` domain.

### Phase 6 — Governance Tests, Docs, Cleanup
- 8 vitest suites: authority completeness, source-truth integrity, runtime linkage, CI gate coverage, DB schema linkage, edge function linkage, route linkage, import-graph linkage.
- Docs: `MANIFEST_TRUTH_FRAMEWORK.md`, `MANIFEST_OWNERSHIP_MATRIX.md`, `MANIFEST_RUNTIME_CONSEQUENCES.md`.
- Retire or merge stale generators flagged in Phase 1 (only after all consumers are migrated).
- Final pass: every entry in `manifest-registry.ts` either fully enforced **or** explicitly informational.

## Deliverables
- Complete `ManifestEntry` registry covering all generated artifacts
- 5 source-truth validators (routes, services, edge fns, DB, capabilities)
- Runtime evidence collectors + runtime-class regeneration
- `validate-all.ts` aggregator wired into release gate
- 3 admin surfaces under Verification domain
- 8 governance tests + 3 architecture docs
- Honest classification: no manifest claims authority it cannot prove

## Non-Negotiable Rules
- No manifest is authoritative without owner + validator + CI gate + source of truth
- Runtime-class manifests must have runtime evidence — otherwise demoted
- No validator may treat another manifest as source of truth (unless explicitly declared)
- Every phase ends with: `tsc --noEmit` clean, all governance checks green, app boots
- Admin consolidation work (12-domain IA) must remain intact

## Starting Point
Phase 1 — Registry Hardening & Honest Classification — in the next message.

