
# FLOWOS — Master Execution Plan

## Audit summary (real repository facts)

The repo already has a mature wave-based canonicalization program: 257 architecture validators in `scripts/architecture/checks/`, 79 architecture docs, a sealed `REPOSITORY_CONSTITUTION.md` with 42+ numbered rules, a `validator-gate-map.ts`, monotone ratchet baselines, and reports for waves 1–10 in `generated/audits/`. Modules (`business`, `concierge`, `finance`, `health`), platform subsystems, route registries (`src/routes/*`), and admin canonical home (`src/admin/`) are all in place.

What is **not** done — the real remaining file-movement work, with sealed baselines:

| Ratchet | Baseline | Canonical destination | Source |
|---|---|---|---|
| `LEGACY_PAGE_BODY` under `src/pages/admin/` | **576** | `src/admin/modules/<domain>/views/` | `admin-page-body-baseline.json` |
| `page semantic violation` across `src/pages/**` | **550** (admin 534 / mobile 12 / owner-mode 1 / other 3) | `src/admin/modules/*` or `src/platform/<system>/pages/` or `src/modules/<pillar>/pages/` | `page-semantic-violation-baseline.json` |
| `_shared` / `_trust` shim imports | **0** | already drained (Wave 9 complete) | `deprecated-shim-baseline.json` |

So `FLOWOS.MD` must (a) consolidate all of this into one master ledger and (b) actually drain real violations physically.

## Part 1 — Create `FLOWOS.MD` at repo root

A single execution-grade master document with all 18 mandated sections, fully grounded in the real repo:

1. **Mission** — make runtime ownership canonical, drain 550 page violations, govern generated/docs lifecycle.
2. **Canonical ownership model** — references the existing `docs/architecture/REPOSITORY_CONSTITUTION.md` ownership table verbatim (modules / platform / pages / components / domains / lib/services / runtimes / generated / docs) and points to `CANONICAL_OWNERSHIP_MODEL.md` as the binding companion.
3. **File classification system** — owner, layer, canonical-location status, runtime-truth status, dependency-direction, reverse-dep criticality, route-binding, trust/proof, test-coverage, duplication, migration action, rewiring obligations.
4. **File status vocabulary** — controlled list (canonical, transitional, wrapper, alias, misplaced, duplicate, split-brain, generated, archive-candidate, production-real, partial, mock-only, admin-only, platform-owned, module-owned, route-adapter-only, proof-backed, unverified).
5. **Wave strategy overview** — explicit ordered wave list (W0–W9) with dependency rationale.
6. **Wave 0 — Baseline & Truth Inventory** — points to existing artifacts and lists any missing ones to emit (file-import-graph, reverse-dep graph, route-page map already exist as `route-adapter-semantic-map.json`, `foundation-manifest-index.json`, etc.).
7. **Wave 1 — Constitution & topology** — references `REPOSITORY_CONSTITUTION.md`, `CANONICAL_OWNERSHIP_MODEL.md`, `WRAPPER_AND_ROUTE_ADAPTER_POLICY.md`, `GENERATED_AND_AUTHORED_ARTIFACT_LIFECYCLE.md` (all already exist).
8. **Wave 2 — Module/Platform boundary canonicalization** — status: complete; report `wave-2-dedup-report.json`.
9. **Wave 3 — Product pillar ownership** — pillar pages migrated; report `wave-4-pillar-migration-report.md` + `wave-4b-revenue-office.json` + `wave-4c-digital-presence.json`.
10. **Wave 4 — Domain/service/component/runtime cleanup** — components covered by `wave-7-component-reclassification-report.md`, services by Wave 1.3 hardening report.
11. **Wave 5 — Route/shell/launcher/registry rewiring** — covered by `src/routes/*` registries; ratchet report `wave-5-platform-page-reclassification.json`.
12. **Wave 6 — Generated/docs/public artifacts governance** — covered by `GENERATED_AND_AUTHORED_ARTIFACT_LIFECYCLE.md` + `check-generated-vs-docs.ts` + `check-public-generated-allowlist.ts`.
13. **Wave 7 — Tests/validators/CI** — 257 validators wired in `validator-gate-map.ts`.
14. **Wave 8 — Per-file migration discipline** — codifies the no-logic/no-UI/no-API-change rule, mandatory rewiring of imports/exports/routes/tests/snapshots/docs/manifests/registries/generated artifacts/validator references/CI/codeowners; mandatory verification gates listed below.
15. **Wave 9 — Verification, proof, completion criteria** — every wave must produce a delta report under `generated/audits/`.
16. **Risk register** — populated with real live risks (admin page-body bulk migration, route stability under shell-mount adapters, attestation drift, validator gate map coverage, ratchet inversions).
17. **Active deliverables index** — a real table of existing artifacts (manifests/audits/reports) + their owner script + wave + active-vs-historical status.
18. **Final state blueprint** — concrete target tree, page-body count = 0, attestation green, all 257 validators wired.

In addition `FLOWOS.MD` will encode the **8 user-mandated enforcement gates** as constitutional rules:
- G1 canonical destination proof for every move
- G2 reverse-dependency proof across src/tests/docs/generated/scripts/workflows
- G3 verification gates for old-path removal
- G4 targeted smoke tests for multi-consumer moves
- G5 explicit semantic verification for `EmptyState`
- G6 attestation resealing only via `scripts/architecture/wave-10-emit-attestation.ts`
- G7 exactly one canonical owner path per moved concept
- G8 strict no-logic / no-UI / no-API-change rule

## Part 2 — Execute Wave A physical moves (bounded, safe)

Trying to move all 576 admin pages in one shot is unsafe. Wave A drains the **highest-safety, lowest-blast-radius violations now** as a working proof of FLOWOS.MD:

### Targets (16 non-admin page bodies)
- `src/pages/mobile/**` — 12 violations
- `src/pages/owner-mode/**` — 1 violation
- `src/pages/**` "other" bucket — 3 violations

For each file:
1. **Locate** the canonical destination using existing maps (`route-adapter-semantic-map.json`, `platform-subclassification-map.json`, `admin-plane-ownership-map.json`).
   - Mobile pages → `src/platform/mobile/pages/<File>.tsx` if platform-mobile feature, else owning pillar's `src/modules/<pillar>/pages/mobile/<File>.tsx`.
   - Owner-mode page → `src/platform/owner/pages/<File>.tsx`.
   - "other" bucket — case-by-case based on import graph.
2. **Move** the body file to the canonical location preserving content byte-for-byte (no logic / UI / API change).
3. **Replace** the original `src/pages/<…>/<File>.tsx` with a 1-line thin re-export: `export { default } from "@/platform/<system>/pages/<File>";`
4. **Rewire** every consumer found via `rg "from .*pages/<old-path>"`:
   - route registries in `src/routes/*`
   - lazy loaders, manifests, registries
   - tests under `src/__tests__/`, `src/test/`, `tests/`
   - docs under `docs/` and generated artifacts that reference the path
5. **Verify per-file**:
   - canonical file exists at destination (G1)
   - no consumer still imports from a path that conflicts with canonical (G2)
   - thin adapter passes `check-page-semantic-adapter.ts` and `check-pages-thin-adapter.ts`
   - `tsc --noEmit` clean
   - For any file that is a multi-consumer concept, a smoke test is touched/verified (G4)
   - For the `EmptyState` file specifically, run `rg -n "from .*EmptyState" src` and confirm all resolve to `@/platform/sita/components/sita/EmptyState` (G5)

### Bootstrap admin shard (1 domain only — proof of system)
Pick the smallest-blast `src/pages/admin/<domain>/` cluster (≤10 files) and run the same procedure to relocate to `src/admin/modules/<domain>/views/` with a thin adapter at the old path. The remaining 500+ admin pages are sharded into **per-domain Wave A.x batches** in `FLOWOS.MD`'s wave 8 section, each to be executed in a separate approval cycle.

### Post-move verification (mandatory before marking Wave A done)
- Run all blocking validators: `check-page-semantic-adapter`, `check-admin-page-body-ratchet`, `check-pages-thin-adapter`, `check-canonical-paths`, `check-no-duplicate-platform`, `check-shared-component-concept-rule`, `check-contract-duplicate-identifiers`, `check-public-contract-barrel-purity`, `check-platform-local-contract-scope`, `check-service-vocabulary-coherence`.
- `tsc --noEmit` exit 0.
- Update sealed baselines via `emit-canonicalization-baseline.ts` (decrement only; ratchet enforces direction=decrease-only).
- Reseal architectural attestation **only** through `scripts/architecture/wave-10-emit-attestation.ts` (G6).
- Generate `generated/audits/flowos-wave-a-report.md` with per-file move table (old path → new canonical path → rewired consumers).

## Part 3 — Supporting files created/updated

| File | Action |
|---|---|
| `FLOWOS.MD` (repo root) | **Create** — full 18-section execution ledger |
| `docs/architecture/FLOWOS_MASTER_EXECUTION.md` | **Create** — companion deep-dive (long-form) referenced from FLOWOS.MD |
| `docs/architecture/REPOSITORY_CONSTITUTION.md` | **Amend** — add Rule 43 binding all future migrations to FLOWOS.MD G1–G8 gates |
| `generated/audits/flowos-wave-a-report.md` | **Create** — per-file move ledger |
| `generated/manifests/flowos-deliverables-index.json` | **Create** — programmatic mirror of section 17 |
| `generated/manifests/admin-page-body-baseline.json` | **Resealed** — new lower count after Wave A admin shard |
| `generated/manifests/page-semantic-violation-baseline.json` | **Resealed** — new lower count |
| `generated/audits/wave-10-architectural-attestation.json` | **Resealed via canonical script only** |

No new validators are added in Wave A (existing 257 already cover the boundaries). Future waves may add per-domain admin shard validators only if a regression appears.

## Part 4 — What this plan deliberately does NOT do

- Does **not** move all 534 admin page bodies in one approval (unsafe — staged into per-domain shards listed in FLOWOS.MD §14).
- Does **not** rename any files (only relocates + thin-adapter shim).
- Does **not** change any logic, UI, or API surface (G8).
- Does **not** create competing ownership systems (binds to existing constitution + 257 validators).
- Does **not** hand-edit attestation files (always via canonical script — G6).

## Approval

Approving this plan switches Lovable to default mode and authorizes:
1. Creating `FLOWOS.MD` and the supporting governance files.
2. Physically moving the 16 non-admin page-body violations + 1 admin shard with full rewiring.
3. Resealing baselines and the architectural attestation via canonical scripts only.
4. Producing `flowos-wave-a-report.md` as proof of execution.
