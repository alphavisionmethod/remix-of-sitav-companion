# Wave B — Generated Artifact Governance & Frontend/Backend Boundary Hardening Report

> **Status:** SEALED. **Approved plan:** `.lovable/plan.md`. **Closes:** GAP 9 (generated artifact governance) + GAP 10 (frontend/backend ownership).

## 1. Old governance gap summary (GAP 9)

Pre-Wave-B state (audited from real repo):
- `generated/` held **1,440** files; `public/generated/` held **619**; mirror policy already enforced via `check-public-artifact-mirror.ts`.
- Ownership maps existed for contracts, admin plane, shared components, lib services — but **no formal lifecycle class** on individual artifacts.
- Freshness existed only ad-hoc (`check-foundation-manifest-freshness`, `check-supportability-freshness`, `check-attestation-evidence-freshness`).
- No single source of truth answering "is this artifact CI-blocking, informational, reference, or historical?"
- No CI gate detecting **stale active-blocking** artifacts or **new orphans**.

## 2. Generated lifecycle model adopted

Four classes, deterministically assigned by the new generator:

| Class | Definition | TTL | CI on stale | CI on missing | Publish |
|---|---|---|---|---|---|
| `active-blocking` | Read by a `block`-classified validator | 7d | fail | fail | only if allowlisted |
| `active-informational` | Read by a WARN/advisory validator or dashboard | 30d | warn | warn | yes if mirror-policy match |
| `reference` | Engineer/audit lookup, not gated | 180d | label-only | none | yes if mirror-policy match |
| `historical-archived` | Frozen snapshot or baseline | n/a | none | none | yes (immutable) |

## 3. Freshness and gating rules adopted

Encoded machine-readable in `generated/manifests/generated-artifact-freshness-policy.json`. CI behavior is enforced by `check-generated-artifact-governance.ts`:

- Stale `active-blocking` ⇒ exit 1 (BLOCK).
- Missing `active-blocking`/`active-informational` ⇒ exit 1 / warn respectively.
- New orphan beyond `generated/baselines/orphan-artifact-baseline.json` (917 entries pinned) ⇒ exit 1.

## 4. Publishability and ownership-script rules

- Eligible for `public/generated/**` only if matched by `MIRROR_RULES` (already enforced by `check-public-artifact-mirror.ts`).
- `active-blocking` artifacts default to non-publishable unless explicitly allowlisted.
- Owning-script ownership is inferred by scanning `scripts/**` for `writeFileSync`/`writeJSON`/`emitGateReport` references to the artifact path; orphans pinned in baseline.

## 5. Old backend-boundary gap summary (GAP 10)

Pre-Wave-B state (audited from real repo):
- `check-no-backend-in-ui.ts` only catches `@/lib/core-services/` — **not direct Supabase client use**.
- `check-no-ui-in-backend.ts` already BLOCK and clean.
- 8 edge-function governance checks already in place.
- **No constitutional rule** unifying `supabase/functions/`, `supabase/migrations/`, `src/integrations/`, `src/lib/services/`, and UI/domain access into one law.
- Real bypass count: **145** files in `src/pages/**` and **9** files in `src/domains/**` directly importing `@/integrations/supabase/**`. Components: **0** (already clean).

## 6. New frontend/backend ownership model

Five-layer table now constitutionally enforced. Documented in `docs/architecture/FRONTEND_BACKEND_OWNERSHIP_MODEL.md`. Boundary law summarized in `REPOSITORY_CONSTITUTION.md` §B.2.

Key rules:
- Pages/components must call backend through a service facade in `src/lib/services/**`.
- Domains are pure (no integrations imports).
- Service ↔ edge function pairs need a contract link (`SERVICE_LAYER_CONSTITUTION.md` Rule 44).

## 7. Files / families reclassified or rewired

**Zero source files moved this wave** (no-logic / no-UI / no-API rule). All 1,594 affected files (1,440 generated + 154 bypass) are *baselined* and *ratcheted*, not refactored. Wave C will execute the actual page-facade extraction.

| Surface | Pre-Wave-B | Wave B disposition |
|---|---|---|
| `generated/**` artifacts | 1,440 unclassified | All classified (1 blocking / 152 info / 1252 ref / 35 historical) |
| `generated/**` orphans | 917 unowned | All pinned in baseline; new orphans block |
| `src/pages/**` direct supabase | 145 | Pinned baseline; monotone-decreasing |
| `src/components/**` direct supabase | 0 | Sealed (zero-tolerance) |
| `src/domains/**` direct supabase | 9 | Pinned baseline; monotone-decreasing |

## 8. Constitution changes

- `docs/architecture/REPOSITORY_CONSTITUTION.md`:
  - Added **§ Wave B.1 — Generated Artifact Lifecycle Law (BLOCKING)**.
  - Added **§ Wave B.2 — Frontend / Backend Ownership Law (BLOCKING)**.
  - Updated **Pointer index** with 6 new artifact references.
- `docs/architecture/SERVICE_LAYER_CONSTITUTION.md`:
  - Added **Rule 44 — Service ↔ Edge Function contract link**.
- New canonical model docs:
  - `docs/architecture/GENERATED_ARTIFACT_LIFECYCLE_MODEL.md`
  - `docs/architecture/FRONTEND_BACKEND_OWNERSHIP_MODEL.md`

## 9. Validator and CI changes

`src/lib/ci/validator-gate-map.ts`: added 2 new BLOCK validators (count 14 → 16 explicit overrides; total `block`-classified validators unchanged in auto-classification fallback):

- `check-generated-artifact-governance` → BLOCK / release-readiness
- `check-page-backend-bypass` → BLOCK / release-readiness

New scripts:
- `scripts/architecture/generate/generate-artifact-governance-map.ts`
- `scripts/architecture/generate/generate-frontend-backend-boundary-map.ts`
- `scripts/architecture/checks/check-generated-artifact-governance.ts`
- `scripts/architecture/checks/check-page-backend-bypass.ts`

## 10. Verification proof

| Gate | Result |
|---|---|
| G1 — canonical destination proof | ✅ Two new model docs at canonical `docs/architecture/` paths; no parallel duplicates created |
| G2 — reverse-dep proof | ✅ `tsc --noEmit` clean; no source moves so no import rewires required |
| G3 — old-path removal | ✅ N/A (no removals this wave) |
| G4 — multi-consumer smoke | ✅ Both generators run successfully; both new validators pass against current baselines |
| G5 — single canonical owner | ✅ Exactly one model doc per concept; old `BACKEND_TOPOLOGY_MAP.md` retained as descriptive reference (not duplicate of law) |
| G6 — attestation via canonical script | ✅ Resealing instructions documented; reseal must run `wave-10-emit-attestation.ts` |
| G7 — `EmptyState` semantic verification | ✅ No UI surfaces touched; `src/components/empty/` unchanged |
| G8 — strict no-logic/no-UI/no-API | ✅ All edits are docs/scripts/manifests/baselines + 1 governance map entry in `validator-gate-map.ts`. Zero source-code semantics changed. |

## 11. Remaining future-facing work

- **Wave C** — extract the 145 page-local Supabase calls into `src/lib/services/<domain>/` facades; drive baseline 145 → 0.
- **Wave C.1** — purge the 9 domain-layer integration imports; enforce strict zero on `src/domains/**`.
- **Wave C.2** — backfill `contract.ts` files for every existing service↔edge-function pair.
- **Wave C.3** — triage the 917 orphan generated artifacts; either rehome under a generation script or move to `historical-archived`.
- **Wave C.4** — promote `check-no-backend-in-ui.ts` from WARN to BLOCK once Wave C lands.