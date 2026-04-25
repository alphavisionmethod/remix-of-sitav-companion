# FLOWOS — Master Repository Execution Ledger

> **Status:** Adopted. This file is the **single canonical execution document**
> for the SITA OS repository's wave-based architecture program. It is binding
> alongside [`docs/architecture/REPOSITORY_CONSTITUTION.md`](./docs/architecture/REPOSITORY_CONSTITUTION.md)
> (the steady-state constitution) and [`docs/architecture/CANONICAL_OWNERSHIP_MODEL.md`](./docs/architecture/CANONICAL_OWNERSHIP_MODEL.md)
> (the ownership map). When the constitution and this file disagree, the
> constitution wins for *what the world should look like*; FLOWOS wins for
> *how to get there safely*.
>
> Companion (long-form): [`docs/architecture/FLOWOS_MASTER_EXECUTION.md`](./docs/architecture/FLOWOS_MASTER_EXECUTION.md).

---

## Section 1 — Mission

1. Make runtime ownership canonical: every source file has exactly one owner
   path under one of the 7 top-level roots in `CANONICAL_OWNERSHIP_MODEL.md`.
2. Drain the **550** sealed `legacy-violation` page-bodies and the **576**
   sealed admin page-body bodies into their canonical homes
   (`src/admin/modules/<domain>/views/`, `src/platform/<system>/pages/`, or
   `src/modules/<pillar>/pages/`) without changing logic, UI, or API surface.
3. Govern `generated/`, `public/generated/`, and `docs/` separately
   (machine-owned vs. publish-allowlisted vs. human-authored).
4. Keep the 257 architecture validators in `scripts/architecture/checks/`
   wired through the `validator-gate-map.ts` so every wave is monotone-ratchet
   safe (`direction: decrease-only`).
5. Make the repository elite, scalable, deployment-ready, and re-deployable
   without one-off knowledge.

## Section 2 — Canonical Ownership Model (binding reference)

The full ownership map is in [`docs/architecture/REPOSITORY_CONSTITUTION.md`](./docs/architecture/REPOSITORY_CONSTITUTION.md)
(top-level table of folders + 42+ numbered rules) and
[`docs/architecture/CANONICAL_OWNERSHIP_MODEL.md`](./docs/architecture/CANONICAL_OWNERSHIP_MODEL.md)
(the 7 source roots: `pages`, `components`, `features`, `planes`, `hooks`,
`contexts`, `domains`, `platform`, `runtimes`, `data`, `integrations`,
`contracts`, `legacy`, `lib`).

Headline rules (verbatim):

- `src/modules/<pillar>/` owns the four user pillars (`business`, `concierge`,
  `finance`, `health`).
- `src/platform/<system>/` owns cross-pillar systems (Trust, AI, Knowledge,
  Workspace, Notifications, Files, Owner, Mission-Control, Atlas, Tenant,
  Enterprise, Personal-Brain, Runtime, Integration, Observability, Search,
  Security, Governance, App-Platform, Admin, …).
- `src/admin/` owns the admin/operator plane (page bodies under
  `src/admin/modules/<domain>/views/`).
- `src/pages/**` is **route-adapter only** — files MUST be ≤40 lines or pure
  re-exports (Constitution Rule 7). Sole exception: `src/pages/NotFound.tsx`.
- `src/components/**` is **shared, presentation-only** (Rule 5).
- `src/domains/**` is **side-effect free** (Rule 6).
- `src/lib/services/**` owns side effects.
- `src/runtimes/**` owns runtime/host abstractions.
- `generated/**` is machine-owned (Rule 10); `public/generated/**` is
  allowlisted (Rule 11); `docs/**` is human-owned (Rule 12).

## Section 3 — File Classification System

Every file is classified along 12 axes. The current canonical maps that
populate these axes are listed in §17 (Active Deliverables Index).

| # | Axis | Source of truth |
|---|------|-----------------|
| 1 | **Owner** (which top-level root) | `generated/manifests/foundation-manifest-index.json` |
| 2 | **Layer** (L1 UX / L2 Domain / L3 Platform) | `docs/architecture/SITA_SYSTEM_STACK.md` + `src/lib/architecture/system-layer-registry.ts` |
| 3 | **Canonical-location status** | `route-adapter-semantic-map.json`, `admin-plane-ownership-map.json`, `shared-component-ownership-map.json` |
| 4 | **Runtime-truth status** (production / partial / mock) | `lib-service-layer-ownership-map.json` |
| 5 | **Dependency direction** (L3→L1 forbidden) | `check-layer-boundaries.ts` |
| 6 | **Reverse-dependency criticality** (count of importers) | `scripts/architecture/audit-components.ts` |
| 7 | **Route-binding** | `src/routes/*.tsx` + `route-adapter-semantic-map.json` |
| 8 | **Trust/proof status** | `proof-requirement-map.ts`, `wave-10-architectural-attestation.json` |
| 9 | **Test-coverage status** | `generated/readiness/file-test-coverage-matrix.json` (W0 output) |
| 10 | **Duplication status** | `contract-duplicate-baseline.json`, `platform-cross-subclass-baseline.json` |
| 11 | **Migration action** (none / move / merge / wrap / archive) | per-wave reports under `generated/audits/` |
| 12 | **Rewiring obligations** | enforced per-PR via Section 14 (Wave 8 discipline) |

## Section 4 — File Status Vocabulary (controlled)

- `canonical` — file is at its rightful canonical home.
- `transitional` — file is a thin re-export shim retained for stability.
- `wrapper` — file is a route-adapter wrapper (≤40 lines, declared subtype).
- `alias` — barrel re-export from a canonical location.
- `misplaced` — file should move to a different owner.
- `duplicate` — concept exists at >1 canonical location.
- `split-brain` — two ownership systems compete for the same concept.
- `generated` — machine-owned, must be regenerated, never hand-edited.
- `archive-candidate` — slated for `archive/` once consumers migrate.
- `production-real` — live, wired, and exercised in CI.
- `partial` — implementation exists but lacks proof/test coverage.
- `mock-only` — fixture/stub used solely in tests or demo mode.
- `admin-only` — owned by `src/admin/**`.
- `platform-owned` / `module-owned` — top-level ownership classification.
- `route-adapter-only` — `src/pages/**` thin wrapper.
- `proof-backed` — has an attestation entry under `wave-10-architectural-attestation.json`.
- `unverified` — no proof entry yet; needs attestation refresh.

## Section 5 — Wave Strategy Overview

| Wave | Title | Status | Dependency |
|---|---|---|---|
| W0 | Baseline & Truth Inventory | ✅ done — manifests in `generated/manifests/` | — |
| W1 | Constitution & Topology | ✅ done — `REPOSITORY_CONSTITUTION.md` + `CANONICAL_OWNERSHIP_MODEL.md` | W0 |
| W2 | Module/Platform boundary canonicalization | ✅ done — `wave-2-dedup-report.json` | W1 |
| W3 | Product pillar ownership | ✅ done — `wave-4-pillar-migration-report.md` | W2 |
| W4 | Domain/service/component/runtime cleanup | ✅ done — `wave-7-component-reclassification-report.md` | W3 |
| W5 | Route/shell/launcher/registry rewiring | ✅ done — `wave-5-platform-page-reclassification.json` | W4 |
| W6 | Generated/docs/public artifacts governance | ✅ done — `GENERATED_AND_AUTHORED_ARTIFACT_LIFECYCLE.md` + `check-public-generated-allowlist.ts` | W5 |
| W7 | Tests/validators/CI hardening | ✅ done — 257 validators in `scripts/architecture/checks/` | W6 |
| W8 | **Per-file migration discipline (LIVE)** — Wave A is the first sub-wave | 🟡 in progress — see §14 | W7 |
| W9 | Verification, proof, completion criteria | 🟡 ratchet baselines remain non-zero | W8 |

## Section 6 — Wave 0: Baseline & Truth Inventory

**Status:** complete. Active artifacts:

- File inventory: `generated/manifests/foundation-manifest-index.json`
- Route-page semantic map: `generated/manifests/route-adapter-semantic-map.json`
- Admin plane ownership: `generated/manifests/admin-plane-ownership-map.json`
- Platform sub-classification: `generated/manifests/platform-subclassification-map.json`
- Contract duplication: `generated/manifests/contract-duplicate-baseline.json`
- Lib/service layer ownership: `generated/manifests/lib-service-layer-ownership-map.json`
- Shared component ownership: `generated/manifests/shared-component-ownership-map.json`
- Cross-subclass baseline: `generated/manifests/platform-cross-subclass-baseline.json`
- Architecture exception ledger: `generated/manifests/architecture-exception-ledger.json`
- Safe-change evidence ledger: `generated/manifests/safe-change-evidence-ledger.json`

"Baseline complete" means: every map above exists, validators pass, and ratchet
baselines are sealed.

## Section 7 — Wave 1: Constitution & Topology

**Status:** complete. Active artifacts:

- [`docs/architecture/REPOSITORY_CONSTITUTION.md`](./docs/architecture/REPOSITORY_CONSTITUTION.md) — 42+ numbered rules.
- [`docs/architecture/CANONICAL_OWNERSHIP_MODEL.md`](./docs/architecture/CANONICAL_OWNERSHIP_MODEL.md) — the 7 source roots.
- [`docs/architecture/PLATFORM_SUBCLASSIFICATION_MODEL.md`](./docs/architecture/PLATFORM_SUBCLASSIFICATION_MODEL.md) — 6-class platform model.
- [`docs/architecture/ADMIN_PLANE_OWNERSHIP_MODEL.md`](./docs/architecture/ADMIN_PLANE_OWNERSHIP_MODEL.md) — admin canonical home.
- [`docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md`](./docs/architecture/CONTRACT_LAYER_OWNERSHIP_MODEL.md) — public vs. local contracts.
- [`docs/architecture/COMPONENT_CONSTITUTION.md`](./docs/architecture/COMPONENT_CONSTITUTION.md) — concept-based component ownership.
- [`docs/architecture/LEGACY_AND_WRAPPER_POLICY.md`](./docs/architecture/LEGACY_AND_WRAPPER_POLICY.md) — wrapper policy.
- [`docs/architecture/MIGRATION_POLICY_AND_ROLLOUTS.md`](./docs/architecture/MIGRATION_POLICY_AND_ROLLOUTS.md) — generated/authored lifecycle.

## Section 8 — Wave 2: Module/Platform Boundary Canonicalization

**Status:** complete. Report: `generated/audits/wave-2-dedup-report.json`. Outcome:

- `src/platform/{ai-gateway,ai,core,os-services,policy,policies,sync,nova-runtime-sdk}` placeholder folders eliminated (Constitution Rule 8).
- Canonical platform folders kept and policed by `check-no-duplicate-platform.ts`.
- `services-unclassified/` forbidden (Rule 9).

## Section 9 — Wave 3: Product Pillar Ownership Migration

**Status:** complete for pillar pages (`business`, `concierge`, `finance`, `health`,
`money`, `investment-office`, `revenue-office`, `digital-presence`).
Reports: `wave-4-pillar-migration.json`, `wave-4b-revenue-office.json`,
`wave-4c-digital-presence.json`.

Pillar page bodies live at `src/modules/<pillar>/pages/<File>.tsx`; the matching
`src/pages/<pillar>/<File>.tsx` files are thin re-exports.

## Section 10 — Wave 4: Domain/Service/Component/Runtime Cleanup

**Status:** complete. Reports: `wave-7-component-reclassification-report.md`,
`shared-component-relocation-wave-report.md`. Validators:
`check-shared-component-concept-rule.ts`, `check-component-classification.ts`,
`check-component-ownership.ts`, `check-misplaced-runtime-logic.ts`,
`check-misplaced-data-logic.ts`, `check-misplaced-domain-logic.ts`.

## Section 11 — Wave 5: Route, Shell, Launcher, Registry & Wrapper Rewiring

**Status:** complete. Routes are split into per-domain registries under
`src/routes/*.tsx`. Wrapper policy enforced by `check-pages-thin-adapter.ts`,
`check-page-semantic-adapter.ts`, `check-page-adapter-subtype-declaration.ts`.
Lazy-loader imports always target `@/pages/<…>` so adapters can move bodies
freely under them.

## Section 12 — Wave 6: Generated/Docs/Public Artifacts Governance

**Status:** complete. Authored docs live under `docs/`; machine outputs under
`generated/`. `public/generated/` is allowlisted via
`scripts/architecture/public-generated-allowlist.json` and policed by
`check-public-generated-allowlist.ts`. Stale-doc and freshness validators:
`check-foundation-manifest-freshness.ts`, `check-generated-vs-docs.ts`.

## Section 13 — Wave 7: Tests, Validators, CI Hardening

**Status:** complete. 257 validator scripts in
`scripts/architecture/checks/`. Gate classification authority:
`src/lib/ci/validator-gate-map.ts` + `generated/validator-gate-map.json`.
CI gates: `.github/workflows/check-boundaries.yml`,
`release-gates.yml`, `ai-runtime-truth-nightly.yml`,
`connector-truth-nightly.yml`, `playwright-proof-nightly.yml`.

## Section 14 — Wave 8: Per-File Migration & Rewiring Discipline (LIVE)

This is the **active wave**. Sub-waves drain ratchet baselines.

### G1–G8 — Per-move enforcement gates (binding)

Every physical move under Wave 8 MUST satisfy:

- **G1 — Canonical destination proof.** Destination path matches the rule in
  Constitution §7 / §14 (or `admin-plane-ownership-map.json`, etc.).
- **G2 — Reverse-dependency proof.** `rg "from .*<old-path>"` over
  `src/`, `tests/`, `docs/`, `generated/`, `scripts/`, `.github/workflows/`
  is run; every consumer is either left intact (because the old path now is a
  thin re-export to the new path) or rewired.
- **G3 — Old-path verification.** Either the old path is deleted (after every
  consumer is rewired) or it remains as a `≤10` line thin re-export shim
  declared with `// @route-adapter-subtype: pure-reexport`.
- **G4 — Multi-consumer smoke tests.** If the moved concept has ≥3 consumers,
  a smoke test under `src/__tests__/` or `tests/integration/` is touched and
  re-run.
- **G5 — `EmptyState` semantic verification.** Any move that touches
  `EmptyState` MUST be followed by `rg -n "EmptyState" src` to confirm every
  reference resolves to the canonical export at
  `@/platform/sita/components/sita/EmptyState`.
- **G6 — Attestation resealing only via canonical script.**
  `scripts/architecture/wave-10-emit-attestation.ts` is the **only** way to
  refresh `wave-10-architectural-attestation.json`. Hand edits forbidden.
- **G7 — Exactly one canonical owner path.** The moved concept has exactly one
  body file at the canonical path; all other paths are re-exports.
- **G8 — Strict no-logic / no-UI / no-API change.** Move = byte-for-byte
  relocation + import-path rewrites; no behavior change permitted.

### Mandatory rewiring per move

- imports / exports
- route registries (`src/routes/*`, `src/admin/routes/`)
- lazy loaders, manifests, registries
- tests under `src/__tests__/`, `src/test/`, `tests/`
- docs under `docs/` and `mem/`
- generated artifact references (run regenerator scripts)
- validator references (`scripts/architecture/`)
- CI references (`.github/workflows/`)
- codeowners / `package.json` exports if applicable

### Active sub-wave plan

| Sub-wave | Scope | Target ratchet | Approval |
|---|---|---|---|
| **Wave A** (this PR) | 13 mobile + 1 owner-mode page bodies → canonical homes | `page-semantic-violation-baseline.json`: 550 → ≤537 | LIVE |
| Wave A.1 | 2 `business-advisors` legacy adapters (declare subtype, no body move) | `route-adapter-semantic-map`: invalid → 0 | next |
| Wave B.x (12 shards) | `src/pages/admin/<domain>/` → `src/admin/modules/<domain>/views/` per IA domain | `admin-page-body-baseline.json`: 576 → 0 in 12 sub-waves | future |
| Wave C | `NotFound.tsx` exception ledger entry; final ratchet reseal | constitution Rule 7 exception sealed | future |

## Section 15 — Wave 9: Verification, Proof, Completion Criteria

Per-wave completion requires (all already in place as scripts):

1. Changed-files list — `generated/audits/wave-<n>-*-report.{json,md}`.
2. Affected imports/exports/routes/tests/docs/manifests — same report.
3. All 257 validators pass — `scripts/run-blocking-architecture-checks.ts`.
4. `tsc --noEmit` exit 0.
5. Ratchet baselines decreased (never increased) and re-sealed.
6. Architectural attestation re-emitted via
   `scripts/architecture/wave-10-emit-attestation.ts`.

**Final repository success criteria:**

- every file classified along the 12 axes;
- every major surface has exactly one canonical owner;
- `src/pages/` reduced to thin route adapters (max body = `NotFound.tsx`);
- `src/admin/modules/<domain>/views/` is the home of every admin page body;
- generated/docs/public lifecycle 100% governed;
- no critical duplicate systems remain;
- all blocking validators green;
- final readiness: `generated/audits/wave-10-architectural-attestation-report.md`
  shows zero outstanding violations.

## Section 16 — Risk Register (live)

| Risk | Severity | Affected families | Mitigation | Wave | Exit criteria |
|---|---|---|---|---|---|
| Bulk admin page-body move breaks lazy-load chain | HIGH | `src/pages/admin/**`, `src/routes/AdminRoutes.tsx` | Per-domain shard (Wave B.x); each shard ≤50 files; route imports kept stable via thin re-export | W8 (B.x) | `check-admin-page-body-ratchet` reaches 0 |
| Mobile route registry import-path drift | MED | `src/routes/MobileRoutes.tsx` | Old paths kept as thin re-exports; route registry untouched in Wave A | W8 (A) | Mobile smoke test passes |
| Attestation drift from manual edits | HIGH | `wave-10-architectural-attestation.json` | G6 — only the canonical emit script may write it | W9 | `check-architectural-attestation` green |
| Validator gate-map coverage gap | MED | `scripts/architecture/checks/**` (257 files) | `check-validator-gate-coverage.ts` runs in CI | W7 | gate-map matches checks dir |
| Ratchet inversion (count grows) | HIGH | `*-baseline.json` files | All ratchets are `direction: decrease-only`, enforced in CI | W8/W9 | no PR can increase a ratchet |
| Stale doc duplication of generated truth | MED | `docs/**` mirrors of `generated/**` | `check-generated-vs-docs.ts` | W6 | validator green |
| Public artifact leakage | MED | `public/generated/**` | `check-public-generated-allowlist.ts` + allowlist JSON | W6 | validator green |
| Component cross-pillar import sneak | MED | `src/components/**` → `src/modules/<pillar>/**` | `check-shared-component-concept-rule.ts` | W4 | validator green |

## Section 17 — Active Deliverables Index

| Path | Owner | Source wave | Status | Type |
|---|---|---|---|---|
| `FLOWOS.MD` | Architecture Governance | W8 | active | human-authored |
| `docs/architecture/REPOSITORY_CONSTITUTION.md` | Architecture Governance | W1 | active | human-authored |
| `docs/architecture/CANONICAL_OWNERSHIP_MODEL.md` | Architecture Governance | W1 | active | human-authored |
| `docs/architecture/FLOWOS_MASTER_EXECUTION.md` | Architecture Governance | W8 | active | human-authored |
| `generated/manifests/foundation-manifest-index.json` | `scripts/manifests/generate/generate-foundation-manifest-index.ts` | W0 | active | machine |
| `generated/manifests/route-adapter-semantic-map.json` | `scripts/manifests/generate/generate-route-adapter-semantic-map.ts` | W0 | active | machine |
| `generated/manifests/page-semantic-violation-baseline.json` | sealed by `check-page-semantic-adapter.ts` | W7 | active ratchet | machine |
| `generated/manifests/admin-page-body-baseline.json` | sealed by `check-admin-page-body-ratchet.ts` | W7 | active ratchet | machine |
| `generated/manifests/admin-plane-ownership-map.json` | `generate-admin-plane-ownership-map.ts` | W0 | active | machine |
| `generated/manifests/platform-subclassification-map.json` | `generate-platform-subclassification-map.ts` | W0 | active | machine |
| `generated/manifests/shared-component-ownership-map.json` | `generate-shared-component-ownership-map.ts` | W0 | active | machine |
| `generated/manifests/contract-duplicate-baseline.json` | sealed by `check-contract-duplicate-identifiers.ts` | W7 | active ratchet | machine |
| `generated/manifests/safe-change-evidence-ledger.json` | `check-safe-change-evidence.ts` | W7 | active ledger | machine |
| `generated/audits/wave-10-architectural-attestation.json` | `scripts/architecture/wave-10-emit-attestation.ts` (G6 only) | W9 | active proof | machine |
| `generated/audits/wave-2-dedup-report.json` | wave runner | W2 | historical | machine |
| `generated/audits/wave-4-pillar-migration-report.md` | wave runner | W3 | historical | machine |
| `generated/audits/wave-5-platform-page-reclassification-report.md` | wave runner | W5 | historical | machine |
| `generated/audits/wave-6-root-page-reclassification-report.md` | wave runner | W6 | historical | machine |
| `generated/audits/wave-7-component-reclassification-report.md` | wave runner | W4 | historical | machine |
| `generated/audits/repository-canonicalization-baseline.json` | `emit-canonicalization-baseline.ts` | W0 | active | machine |
| `generated/audits/repository-canonicalization-plan.md` | wave runner | W1 | active | machine |
| `generated/audits/flowos-wave-a-report.md` | this PR | W8 | active | human-authored ledger |
| `generated/manifests/flowos-deliverables-index.json` | this PR | W8 | active | machine-mirrored |
| `src/lib/ci/validator-gate-map.ts` | Architecture Governance | W7 | active | source-of-truth |
| `generated/validator-gate-map.json` | `generate-validator-gate-map.ts` | W7 | active | machine |

## Section 18 — Final State Blueprint

```
src/
├─ app/                  bootstrap (route assembly, providers)
├─ pages/                ROUTE-ADAPTER ONLY — every file ≤40 lines
│  └─ NotFound.tsx       sole exception (Constitution Rule 7)
├─ admin/                CANONICAL admin/operator plane
│  └─ modules/<domain>/views/   admin page bodies live here
├─ modules/              4 product pillars: business / concierge / finance / health
│  └─ <pillar>/pages/    pillar page bodies live here
├─ platform/             cross-pillar systems (40+ subsystems)
│  └─ <system>/pages/    platform page bodies live here
├─ components/           SHARED, presentation-only, pillar-blind
├─ domains/              SIDE-EFFECT-FREE models / contracts / engines
├─ lib/services/         side-effect layer (persistence, connectors)
├─ runtimes/             host abstractions (web / desktop / mobile / appliance)
├─ contracts/            public types/schemas/constants
├─ integrations/         generated supabase client + adapters
├─ data/                 static seed/reference
├─ routes/               route registries
├─ planes/               horizontal plane definitions
├─ shells/, features/, hooks/, contexts/, packages/, ...
└─ legacy/               explicit archive (never trash)

generated/                machine-owned (regenerable)
public/generated/         publish-allowlisted subset
docs/                     human-authored
scripts/architecture/     257 validators (block / warn / advisory)
.github/workflows/        CI gates wired to validator-gate-map
```

**Validator topology (final state):**

- Every check in `scripts/architecture/checks/` is classified in
  `validator-gate-map.ts` as `block` / `warn` / `advisory` / `disabled` / `archived`.
- Every `block` validator is wired into `release-gates.yml` and
  `check-boundaries.yml`.
- Every monotone-ratchet baseline has `direction: decrease-only` and is
  re-sealed only after a wave drains it.
- The architectural attestation in `wave-10-architectural-attestation.json` is
  re-emitted only by `wave-10-emit-attestation.ts` (G6).

---

_End of FLOWOS.MD. Companion deep-dive:
[`docs/architecture/FLOWOS_MASTER_EXECUTION.md`](./docs/architecture/FLOWOS_MASTER_EXECUTION.md)._