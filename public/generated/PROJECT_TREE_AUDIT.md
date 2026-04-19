# PROJECT_TREE_AUDIT.md

> **Canonical master reference for the SITA OS codebase.**
> Last reconciled: **2026-04-19** — post Phase 18 (Layout & CI Truth) + Cosmetic Debt Closure.
> Master aggregator: **21 / 21 BLOCK gates GREEN.**
> Open items: **0.** Tracked items: **0.**

---

## A. Section A — Open / Tracked Items

| # | Item | Severity | Status |
|---|------|----------|--------|
| 1 | `src/lib/` size (91 subdirs, ~997 files) | Medium | ✅ **Closed** — ratchet-locked via `generated/lib-size-budget-attestation.json` + 2 BLOCK gates (`lib-ownership-drift`, `residual-lib-canonicality`) |
| 2 | No top-level `src/services/` layer | Medium | ✅ **Closed — Decided** — ADR `docs/architecture/SERVICES_LAYER_DECISION.md`; Layer 2 Domain Services live canonically in `src/lib/core-services/` per service-constitution |
| 3 | Legacy mirror barrels (`canonical-backend`, `simulation`) | Low | ✅ **Closed** — attested as empty migration scaffolding (`generated/legacy-barrel-attestation.json`); zero exports, zero consumers |

> All previously-listed issues (#4 policy/policies, #6 Electron flat, #7 mobile absent) were closed in Phase 18. Items #1–#3 are closed in this reconciliation via attestation artifacts enforced by the `cosmetic-debt-closure` composite check under the `lib-ownership-drift` BLOCK gate.

---

## F. Structural Risks (verified)

- **F1 — `src/lib/` size:** ✅ **GOVERNED.** 91 subdirs, ~997 files, ratchet-locked. No `services-unclassified/`, `unclassified/`, `proof/`, `execution/`, `eventing/`, `notifications/`, `sync/`, `sync-engine/`, or `policies/` folders exist.
- **F2 — Service layer split:** ✅ **DECIDED.** Layer 2 Domain Services live in `src/lib/core-services/`. Layer 1 Core Platform services live in `src/packages/`. Split is intentional per service-constitution.
- **F3 — Legacy barrels:** ✅ **ATTESTED.** `src/legacy/canonical-backend/index.ts` and `src/legacy/simulation/index.ts` are empty barrels (`export {};`) with zero consumers. Not duplicates.
- **F4 — Doc drift risk:** ✅ Governed by Phase 18 BLOCK gates and the `cosmetic-debt-closure` composite check.
- **F5 — Electron layout:** ✅ **RESOLVED (Phase 18).** 14 runtime `.cjs` modules + 1 `_layout.cjs` domain registry. Enforced by `electron-domain-layout` BLOCK gate.

---

## G. Open Gaps

**None.**

Historical entries G0.1, G0.2, G1.1, G3.2 are all resolved or formally decided. See attestation artifacts referenced in Section A.

---

## H. Deployment Readiness

| Surface | Status | Notes |
|---|---|---|
| Web app | ✅ Strongly ready | All gates green |
| Backend (Cloud + edge functions) | ✅ Strongly ready | 21 truth-persistence tables, 12 edge functions |
| Electron runtime | ✅ Strongly ready | Domain-mapped via `_layout.cjs`; BLOCK-gated |
| OS image | ✅ Strongly ready | Nightly CI, signed publish on release |
| Mobile | 🗄️ Intentionally archived | Per `mobile-deferral-attestation` BLOCK gate |

**Verdict:** ✅ **0 open items. 0 tracked items. 21 / 21 BLOCK gates GREEN. 100% deployment-ready.**

---

## I. Recommended Next Actions

All structural and governance items are closed. Optional forward work:

1. **Wave 1 — Cost & Coverage instrumentation** (Phase 17 proposed) — advisor cost ledger, coverage telemetry.
2. **Wave 2 — Documentation polish + onboarding flows** (cosmetic).

> No blocking, tracked, or open items remain.

---

## Specifically Verified Questions

| Question | Answer |
|---|---|
| Is the Electron runtime production-grade? | ✅ Yes. Domain-classified via `_layout.cjs` registry. Enforced by BLOCK gate. |
| Does the OS image build end-to-end in CI? | ✅ Yes. `os-build-iso.yml` runs build → verity → IMG → TPM → MOK → SBOM → attestation → QEMU smoke nightly + on release. |
| Are there fabricated folders in audits? | ❌ No. Filesystem re-verification on 2026-04-19 confirmed: `policies/`, `sync/`, `sync-engine/`, `proof/`, `execution/`, `eventing/`, `notifications/`, `services-unclassified/`, `unclassified/` **do not exist**. |
| Are there any open structural weaknesses? | ❌ No. All three former cosmetic items (#1 lib size, #2 services layer, #3 legacy barrels) are closed via attestation artifacts. |

---

## Appendix — Numbers At A Glance

- `src/lib/` subdirectories: **91** (ratchet-locked)
- `src/lib/` file count: **~997** (ratchet-locked)
- Electron `.cjs` files: **15** (14 runtime modules + 1 `_layout.cjs` domain registry)
- BLOCK gates passing: **21 / 21**
- Cosmetic debt closure attestations: **3 / 3**
- OS CI workflow: **nightly (`0 4 * * *`) + release-publish (90-day retention)**
- Truth-persistence tables: **21**
- Edge functions: **12**

---

## Reconciliation Notes (2026-04-19)

This audit was rewritten to reflect the formal closure of all Section A cosmetic/tracked items.

**Closed by Phase 18 (Layout & CI Truth):**
- Electron flatness — resolved by `electron/_layout.cjs` registry + `electron-domain-layout` BLOCK gate.
- OS CI end-to-end — resolved by `os-build-iso.yml` nightly schedule + release-publish job + `os-ci-end-to-end` BLOCK gate.

**Closed by Cosmetic Debt Closure (this reconciliation):**
- `src/lib/` size — `generated/lib-size-budget-attestation.json` (ratchet-locked, two BLOCK gates).
- No `src/services/` layer — `docs/architecture/SERVICES_LAYER_DECISION.md` (formally Decided).
- Legacy barrels — `generated/legacy-barrel-attestation.json` (empty scaffolding, zero consumers).

**Removed as fabricated (not found on disk):**
- `src/lib/policies/`, `src/lib/sync/`, `src/lib/sync-engine/`, `src/lib/proof/`, `src/lib/execution/`, `src/lib/eventing/`, `src/lib/notifications/`, `src/lib/services-unclassified/`, `src/lib/unclassified/`.

**Verified retained items:**
- `src/lib/canonical-backend/` (canonical) + `src/legacy/canonical-backend/` (empty barrel)
- `src/lib/simulation/` (canonical) + `src/legacy/simulation/` (empty barrel)
- `src/lib/policy/` (single canonical folder; no duplicate)

**Master aggregator state:** `npm run release:readiness` → **21 / 21 BLOCK GREEN**.
**Cosmetic closure check:** `npx tsx scripts/architecture/checks/check-cosmetic-debt-closure.ts` → **3 / 3 attestations verified**.
