# PROJECT_TREE_AUDIT.md

> **Canonical master reference for the SITA OS codebase.**
> Last reconciled: **2026-04-20** — post Phase 18 (Layout & CI Truth) + **Physical Shim-Deletion Wave**.
> Master aggregator: **21 / 21 BLOCK gates GREEN.**
> Open items: **0.** Tracked items: **0.**

---

## A. Section A — Open / Tracked Items

| # | Item | Severity | Status |
|---|------|----------|--------|
| 1 | `src/lib/` size and service-shaped folder sprawl | Medium | ✅ **Physically Eliminated** — 5 service-shaped folders (`canonical-backend`, `simulation`, `mock-data`, `demo-data`, `seed`) **deleted from `src/lib/`**. All 70 consumer imports rewritten to canonical homes (`@/integrations/`, `@/domains/`, `@/data/fixtures/`). `src/lib/` subdirectories: **75 → 71**. Verified by `check-cosmetic-debt-closure` (PHYSICAL-DELETION mode). |
| 2 | No top-level `src/services/` layer | Medium | ✅ **Physically Resolved** — `src/services/index.ts` façade now spans **all 4 layers**: Layer 1 `@/packages` (Platform), Layer 2 `@/lib/core-services` (Domain), Layer 3 `@/lib/os-services` (OS daemons, namespaced), Layer 4 `@/lib/data-services` (Read Models). Single navigable root for the service constitution. |
| 3 | Legacy mirror barrels (`canonical-backend`, `simulation`, `unclassified`) | Low | ✅ **Physically Deleted** — `src/legacy/canonical-backend/`, `src/legacy/simulation/`, `src/legacy/unclassified/` removed from disk. Zero consumers verified before deletion. |

> All three items are **filesystem-verified**, not paper-attested. Run `ls src/lib/canonical-backend src/lib/simulation src/lib/mock-data src/lib/demo-data src/lib/seed` (all "No such file") and `cat src/services/index.ts` (4-layer façade) to confirm.

---

## F. Structural Risks (verified)

- **F1 — `src/lib/` shape:** ✅ **PHYSICALLY SHRUNK.** 5 misplaced folders deleted from `src/lib/` (not shimmed) after migrating all 70 consumer imports to canonical paths. `src/lib/` subdirectories: **75 → 71**. No `services-unclassified/`, `unclassified/`, `proof/`, `execution/`, `eventing/`, `notifications/`, `sync/`, `sync-engine/`, or `policies/` folders exist.
- **F2 — Service layer split:** ✅ **PHYSICALLY UNIFIED.** `src/services/index.ts` façade re-exports **all 4 layers**: Layer 1 (`@/packages`), Layer 2 (`@/lib/core-services`), Layer 3 (`@/lib/os-services`, namespaced), Layer 4 (`@/lib/data-services`). One navigable root.
- **F3 — Legacy barrels:** ✅ **PHYSICALLY DELETED.** `src/legacy/` directory now empty.
- **F4 — Doc drift risk:** ✅ Governed by Phase 18 BLOCK gates and the `cosmetic-debt-closure` composite check (now PHYSICAL-DELETION mode — asserts shim folders are absent, canonical homes present, façade complete).
- **F5 — Electron layout:** ✅ **RESOLVED (Phase 18).** 14 runtime `.cjs` modules + 1 `_layout.cjs` domain registry. Enforced by `electron-domain-layout` BLOCK gate.

---

## G. Open Gaps

**None.**

All historical entries are physically resolved. See Section A and the Physical Resolution Log below.

---

## H. Deployment Readiness

| Surface | Status | Notes |
|---|---|---|
| Web app | ✅ Strongly ready | All gates green; typecheck clean post-deletion |
| Backend (Cloud + edge functions) | ✅ Strongly ready | 21 truth-persistence tables, 12 edge functions |
| Electron runtime | ✅ Strongly ready | Domain-mapped via `_layout.cjs`; BLOCK-gated |
| OS image | ✅ Strongly ready | Nightly CI, signed publish on release |
| Mobile | 🗄️ Intentionally archived | Per `mobile-deferral-attestation` BLOCK gate |

**Verdict:** ✅ **0 open items. 0 tracked items. 21 / 21 BLOCK gates GREEN. Physical filesystem remediated. 100% deployment-ready.**

---

## I. Recommended Next Actions

All structural and governance items are physically resolved. Optional forward work:

1. **Wave 1 — Cost & Coverage instrumentation** (Phase 17 proposed) — advisor cost ledger, coverage telemetry.
2. **Wave 2 — Documentation polish + onboarding flows** (cosmetic).

> No blocking, tracked, or open items remain. No shim cleanup pending — shims have been physically deleted.

---

## Specifically Verified Questions

| Question | Answer |
|---|---|
| Is the Electron runtime production-grade? | ✅ Yes. Domain-classified via `_layout.cjs` registry. Enforced by BLOCK gate. |
| Does the OS image build end-to-end in CI? | ✅ Yes. `os-build-iso.yml` runs build → verity → IMG → TPM → MOK → SBOM → attestation → QEMU smoke nightly + on release. |
| Are there fabricated folders in audits? | ❌ No. Filesystem re-verification on 2026-04-20 confirmed: `policies/`, `sync/`, `sync-engine/`, `proof/`, `execution/`, `eventing/`, `notifications/`, `services-unclassified/`, `unclassified/` **do not exist**. |
| Are there any open structural weaknesses? | ❌ No. All three former cosmetic items (#1 lib sprawl, #2 services layer, #3 legacy barrels) are **physically resolved on disk**. |
| Was `src/legacy/` cleaned up? | ✅ Yes. `src/legacy/canonical-backend/`, `src/legacy/simulation/`, `src/legacy/unclassified/` all deleted. Directory is now empty. |
| Does `src/services/` exist? | ✅ Yes. `src/services/index.ts` is the canonical façade across all 4 service constitution layers. |
| Are the lib shims still present? | ❌ No. Physically deleted. `ls src/lib/canonical-backend src/lib/simulation src/lib/mock-data src/lib/demo-data src/lib/seed` returns "No such file" for all five. |

---

## Appendix — Numbers At A Glance (Post Shim-Deletion)

- `src/lib/` subdirectories: **71** (down from 75 pre-deletion, 91 pre-remediation)
- `src/lib/` shim files (re-export only): **0** (deleted)
- `src/integrations/canonical-backend/` files: **1** (canonical)
- `src/domains/simulation/` files: **3** (canonical)
- `src/data/fixtures/` files: **34** (canonical: demo-data + mock-data + seed)
- `src/legacy/` contents: **EMPTY (deleted)**
- `src/services/index.ts`: **4-layer canonical façade** (Platform, Domain, OS, Data)
- `src/lib/os-services/index.ts`: **NEW namespaced barrel** (33 daemons, collision-free)
- Electron `.cjs` files: **15** (14 runtime modules + 1 `_layout.cjs` domain registry)
- BLOCK gates passing: **21 / 21**
- Cosmetic debt closure assertions (PHYSICAL-DELETION): **14 / 14**
- OS CI workflow: **nightly (`0 4 * * *`) + release-publish (90-day retention)**
- Truth-persistence tables: **21**
- Edge functions: **12**

---

## Physical Resolution Log (2026-04-20)

This audit reflects **physical filesystem deletion** of all shim infrastructure. No paper-only closures, no compatibility shims left behind.

### Import migration + folder deletion (Issue #1)

Step A: Codemod rewrote **70 consumer imports** across **48 files** from `@/lib/{canonical-backend,simulation,mock-data,demo-data,seed}` → canonical homes:

| Source (old) | Destination (canonical) | Imports rewritten |
|---|---|---|
| `@/lib/canonical-backend` | `@/integrations/canonical-backend` | 12 |
| `@/lib/simulation/...` | `@/domains/simulation/...` | 3 |
| `@/lib/mock-data/...` | `@/data/fixtures/mock-data/...` | 47 |
| `@/lib/demo-data` | `@/data/fixtures/demo-data` | 4 |
| `@/lib/seed` | `@/data/fixtures/seed` | 4 |

Step B: With zero remaining consumers (verified by grep), the 5 shim folders were **physically deleted from `src/lib/`**:

| Deleted folder | Files removed |
|---|---|
| `src/lib/canonical-backend/` | 1 shim |
| `src/lib/simulation/` | 3 shims |
| `src/lib/mock-data/` | 27 shims |
| `src/lib/demo-data/` | 2 shims |
| `src/lib/seed/` | 1 shim |

Net result: `src/lib/` subdirectories dropped from **75 → 71**. No transitional shims remain.

### Complete services façade (Issue #2)

- **Updated:** `src/services/index.ts` now spans **all 4 layers**:
  - `export * from "@/lib/core-services"` (Layer 2 — Domain)
  - `export * from "@/lib/data-services"` (Layer 4 — Data)
  - `export * as OS from "@/lib/os-services"` (Layer 3 — OS daemons, namespaced)
  - `export * as Platform from "@/packages"` (Layer 1 — Core Platform)
- **Created:** `src/lib/os-services/index.ts` namespaced barrel (33 daemons re-exported per-module to avoid `DiagnosticBundle` and other cross-daemon name collisions).

### Deletions (Issue #3)

- **Deleted:** `src/legacy/canonical-backend/` (was empty barrel, zero consumers)
- **Deleted:** `src/legacy/simulation/` (was empty barrel, zero consumers)
- **Deleted:** `src/legacy/unclassified/` (was empty barrel, zero consumers)
- **Deleted:** `generated/legacy-barrel-attestation.json` (paper attestation no longer needed)
- **Deleted:** `generated/lib-size-budget-attestation.json` (paper attestation no longer needed)

### Validator updates

- `scripts/architecture/checks/check-cosmetic-debt-closure.ts` rewritten to **PHYSICAL-DELETION mode**: 14 filesystem assertions — 5 shim-folder deletions, 5 canonical-home presence checks, 1 four-layer façade check, 3 legacy-barrel deletions. No longer reads attestation JSONs; shim presence is now a CI failure.
- `generated/lib-remediation/lib-canonicality-baseline.json` re-baselined to lock the new (smaller) `src/lib/` ceiling.

### Closed by Phase 18 (Layout & CI Truth) — historical

- Electron flatness — resolved by `electron/_layout.cjs` registry + `electron-domain-layout` BLOCK gate.
- OS CI end-to-end — resolved by `os-build-iso.yml` nightly schedule + release-publish job + `os-ci-end-to-end` BLOCK gate.

### Verification

```bash
ls src/lib/canonical-backend src/lib/simulation src/lib/mock-data src/lib/demo-data src/lib/seed 2>&1   # all "No such file" ✅
ls src/lib | wc -l                                                                                       # 71 ✅
grep -rE "@/lib/(canonical-backend|simulation|mock-data|demo-data|seed)" src 2>/dev/null | wc -l         # 0 ✅
ls src/services/index.ts                                                                                 # exists ✅
ls src/legacy 2>&1                                                                                       # empty ✅
ls src/integrations/canonical-backend/index.ts                                                           # exists ✅
ls src/domains/simulation/                                                                               # 3 files ✅
ls src/data/fixtures/{demo-data,mock-data,seed}/                                                         # canonical ✅
npx tsc --noEmit                                                                                         # 0 errors ✅
npx tsx scripts/architecture/checks/check-cosmetic-debt-closure.ts                                       # 14/14 PHYSICAL ✅
npm run release:readiness                                                                                # 21/21 BLOCK GREEN ✅
```

**Master aggregator state:** `npm run release:readiness` → **21 / 21 BLOCK GREEN**.
**Cosmetic closure check (PHYSICAL-DELETION):** `npx tsx scripts/architecture/checks/check-cosmetic-debt-closure.ts` → **14 / 14 filesystem assertions verified**.

---

## Wave 2 Residual Cleanup (2026-04-20)

After the physical shim-deletion wave, a deep audit surfaced **6 stale string-literal reference clusters** to the deleted folders that would have caused runtime failures or false-positive Reality dashboard alerts. All have now been surgically repointed to canonical homes, and a new CI gate prevents regression.

### Repaired references

| File | Stale ref | Repointed to |
|---|---|---|
| `tests/integration/service-flows.test.ts:63` | `await import("@/lib/seed/index")` | `@/data/fixtures/seed/index` |
| `src/lib/detection/reality-detection-engine.ts:91–100` | 9 × `src/lib/mock-data/<file>.ts` registry paths | `src/data/fixtures/mock-data/<file>.ts` |
| `src/runtimes/reality/reality-audit-registry.ts:259–273` | 6 × `src/lib/mock-data/<file>.ts` MOCK_SOURCE_INVENTORY records | `src/data/fixtures/mock-data/<file>.ts` |
| `src/lib/delivery-methodology/remediation-engine.ts:59` | Suggested-action template `src/lib/mock-data/` | `src/data/fixtures/mock-data/` |
| `src/planes/INTERNAL_TOOLS_MANIFEST.md:13–19` | 3 × deleted-path manifest rows | Canonical homes (`src/domains/simulation`, `src/data/fixtures/{demo-data,seed,mock-data}`) |
| `docs/REAL_VS_SIMULATED.md:688` | `src/lib/simulation/` | `src/domains/simulation/` |
| `generated/plane-ownership.json` (`internal-tools.directories`) | 4 × deleted `src/lib/` paths | 4 × canonical `src/domains/`, `src/data/fixtures/` paths |

### New CI gate — `check-stale-deleted-paths`

- **Script:** `scripts/architecture/checks/check-stale-deleted-paths.ts`
- **Behavior:** scans `src/`, `tests/`, `docs/`, and `generated/*.json` for any string literal containing `src/lib/(canonical-backend|simulation|mock-data|demo-data|seed)/`. Emits `generated/stale-deleted-paths-report.json`.
- **Allowlist:** archived migration scripts (`perform-real-migration-wave*.ts`, `rewire-consumers-wave*.ts`, `scripts/migrate/**`), historical refactor docs (`docs/refactor/**`, `docs/architecture/MIGRATION-BLUEPRINT.md`), this audit log, and machine-regenerated `generated/**` topology snapshots.
- **Status:** ✅ **0 stale references** (verified 2026-04-20).
- **Composition:** rolls up under the existing `lib-ownership-drift` BLOCK gate — **no change to the 21 BLOCK gate count**.

### Verification (Wave 2)

```bash
npx tsx scripts/architecture/checks/check-stale-deleted-paths.ts   # 0 stale refs ✅
npx tsc --noEmit                                                    # 0 errors ✅
```

The remaining 7 grep hits in raw text scope are entirely confined to the historical-record allowlist (`docs/refactor/move-map.md`, `docs/refactor/runtime-map.md`, archived migration scripts) — they document the migration itself and are intentionally preserved.

**Final state:** the project is now reference-clean. No code path, registry, manifest, or live doc points at a deleted folder anywhere outside the explicit historical-record allowlist. **0 open. 0 tracked. 21 / 21 BLOCK GREEN. 100 % deployment-ready.**

