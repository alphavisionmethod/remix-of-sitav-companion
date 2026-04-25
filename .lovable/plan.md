
# Wave B — Generated Artifact Governance & Frontend/Backend Boundary Hardening

## Audit findings (real repo state, not assumed)

- `generated/` holds **1,440** files; `public/generated/` holds **619**. Mirror is policy-driven via `scripts/architecture/lib/public-mirror-policy.ts` + `check-public-artifact-mirror.ts` (already STRICT).
- Ownership maps already exist: `generated/manifests/{contract,admin-plane,shared-component,lib-service-layer}-ownership-map.json` and `foundation-manifest-freshness-report.json`.
- Existing checks already cover much: `check-no-backend-in-ui`, `check-no-ui-in-backend`, `check-frontend-backend-substrate-map`, `check-route-backend-wiring`, plus 8 edge-function governance checks.
- **Real gaps**:
  1. No formal **lifecycle class** (active-blocking / active-informational / reference / historical-archived) on each generated artifact.
  2. No formal **freshness TTL + CI behavior** matrix; freshness exists only ad-hoc (`check-supportability-freshness`, `check-attestation-evidence-freshness`, foundation-manifest).
  3. No single canonical `FRONTEND_BACKEND_OWNERSHIP_MODEL.md` (only the older `BACKEND_TOPOLOGY_MAP.md` and `CORE_OS_USER_ADMIN_BACKEND_MODEL.md`).
  4. **145 pages** directly import `@/integrations/supabase/client`; **9 domain files** do as well — no ratchet exists yet to prevent regression.
  5. `check-no-backend-in-ui` only catches `@/lib/core-services/`, not direct Supabase client use.

## Scope rules (hard constraints — same as prior waves)

- **No-logic / No-UI / No-API change**: zero behavioral edits, zero file moves of source code in this wave (governance + ratchets only — exactly what user has approved in every prior wave).
- **Exactly one canonical owner path per concept**: model lives at `docs/architecture/GENERATED_ARTIFACT_LIFECYCLE_MODEL.md` and `docs/architecture/FRONTEND_BACKEND_OWNERSHIP_MODEL.md` (no duplicates of `BACKEND_TOPOLOGY_MAP.md`).
- **Attestation resealing**: only via canonical `scripts/architecture/wave-10-emit-attestation.ts` (G6).
- **Reverse-dependency proof**: `tsc --noEmit` + targeted `rg` import checks must pass after every edit (G2).
- **Ratchet-not-purge**: 145 page→supabase imports become a baselined ratchet, not a forced refactor (purge requires a separate Wave C with state-extraction).
- **`EmptyState` semantic verification** (G7): unchanged; no UI surfaces touched.

---

## Step 1 — Generated artifact lifecycle model

Create `docs/architecture/GENERATED_ARTIFACT_LIFECYCLE_MODEL.md` defining:

| Class | Definition | Freshness TTL | CI on stale | CI on missing | Publish? |
|---|---|---|---|---|---|
| `active-blocking` | Read by a STRICT/BLOCK gate | ≤ 24h (release-gated) / ≤ 7d (PR-gated) | **fail** | **fail** | only if explicitly allowlisted |
| `active-informational` | Read by WARN gate or dashboard | ≤ 30d | warn | warn | usually yes |
| `reference` | Engineer/audit lookup, not gated | ≤ 180d | label-only | none | yes if mirror policy matches |
| `historical-archived` | Frozen snapshot | n/a (frozen) | none | none | yes (immutable) |

Rules:
- Every artifact must have an **owning script** (`scripts/...`); orphans become validator violations.
- Lifecycle/freshness/publishability/owner-script = the four mandatory metadata facets.

## Step 2 — Generated artifact governance manifest

Create `scripts/architecture/generate/generate-artifact-governance-map.ts` that walks `generated/**` and emits:

- `generated/manifests/generated-artifact-governance-map.json` — per-artifact: `path, lifecycleClass, freshnessTtlDays, owningScript, publishable, lastModifiedISO, ageDays, gateName?`
- `generated/manifests/generated-artifact-freshness-policy.json` — per-class: TTL + gate behavior + exceptions list

Classification heuristics (deterministic, audited):
- If artifact is referenced by any check in `src/lib/ci/validator-gate-map.ts` with `severity: BLOCK` ⇒ `active-blocking`.
- If referenced by any other check ⇒ `active-informational`.
- If under `generated/audits/wave-*` or `generated/.../*-historical-*` ⇒ `historical-archived`.
- Else ⇒ `reference`.
- Owning script: scan `scripts/**` for emitters writing the path (`fs.writeFileSync` / `writeJSON`).

## Step 3 — Governance validator (BLOCKING, ratcheted)

Create `scripts/architecture/checks/check-generated-artifact-governance.ts`:

Detects (BLOCK):
1. Artifact missing from governance map.
2. `active-blocking` artifact older than its TTL.
3. Artifact with no owning script (orphan), unless on baseline.
4. Artifact mirrored to `public/generated/` but not in mirror policy.

Wired into `src/lib/ci/validator-gate-map.ts` (going from 80 → 81 blocking validators).

**Baseline file**: `generated/baselines/orphan-artifact-baseline.json` — current orphans (likely several hundred legacy files), pinned. New orphans = fail.

## Step 4 — Frontend/Backend ownership model

Create `docs/architecture/FRONTEND_BACKEND_OWNERSHIP_MODEL.md` defining the law:

| Layer | Owns | Forbidden imports | Allowed callers |
|---|---|---|---|
| `supabase/functions/**` | Backend execution endpoints (server-side orchestration) | `@/components`, `@/pages`, `react` | (deployed; not imported) |
| `supabase/migrations/**` | Schema evolution | n/a (SQL) | (auto-managed; never hand-edited as app logic) |
| `src/integrations/supabase/**` | Generated client + types | n/a (auto-generated) | `src/lib/services/**`, `src/lib/clients/**`, `src/lib/data-services/**` |
| `src/lib/services/**` | App-facing service facades | `react`, `@/components`, `@/pages` | `src/pages`, `src/components`, `src/modules`, `src/platform` |
| `src/pages/**`, `src/components/**` | UI | direct `@/integrations/supabase/client` (use facades) | (terminal consumers) |
| `src/domains/**` | Pure models/engines | `@/integrations/supabase`, `@/lib/services` | UI/services |

Anti-duplication rule: a frontend service that wraps an edge function must declare a **contract link** in `src/lib/services/<name>/contract.ts` referencing the edge function name, OR be flagged by validator.

## Step 5 — Frontend/Backend boundary manifest + ratcheted validator

Create `scripts/architecture/generate/generate-frontend-backend-boundary-map.ts` → `generated/manifests/frontend-backend-boundary-map.json`:
- Every `src/pages/**`, `src/components/**`, `src/domains/**` file with raw `@/integrations/supabase` import.
- Current count expected: **145 pages + 9 domains** = 154 entries.

Create `scripts/architecture/checks/check-page-backend-bypass.ts`:
- Reads boundary map + `generated/baselines/page-backend-bypass-baseline.json`.
- New violations beyond baseline = BLOCK.
- Domain violations always BLOCK once baseline is captured (domains are pure — stricter).
- Wired into validator-gate-map (81 → 82 blocking validators).

## Step 6 — Constitution amendment

Edit `docs/architecture/REPOSITORY_CONSTITUTION.md`:
- Add **§ Wave B.1 — Generated Artifact Lifecycle Law (BLOCKING)** with the 4-class model + freshness TTLs + owner-script requirement.
- Add **§ Wave B.2 — Frontend/Backend Ownership Law (BLOCKING)** with the table from Step 4 + bypass-ratchet policy + edge-function vs facade anti-duplication rule.
- Update `## Pointer index` to reference the two new model docs and the new manifests.

Edit `docs/architecture/SERVICE_LAYER_CONSTITUTION.md`:
- Add **Rule 44**: services that proxy edge functions must declare a contract link.

## Step 7 — Hardening report + attestation reseal

Create `generated/audits/wave-b-generated-artifact-and-backend-boundary-hardening-report.md` covering all 11 mandated sections (gap summary → verification proof → remaining work).

Reseal attestation **only** via `npx tsx scripts/architecture/wave-10-emit-attestation.ts` (G6 enforcement).

## Step 8 — End-to-end verification (G1–G8 gates)

| Gate | Check |
|---|---|
| G1 — canonical destination proof | New docs at canonical paths; no duplicate/parallel doc created |
| G2 — reverse-dep proof | `tsc --noEmit` clean; `rg "BACKEND_TOPOLOGY_MAP\|CORE_OS_USER_ADMIN_BACKEND_MODEL"` confirms old docs still referenced (kept as historical-reference, not removed) |
| G3 — old-path removal gates | N/A this wave (no removals) |
| G4 — multi-consumer smoke | Run new generators + new checks; confirm baselines match expected counts |
| G5 — single canonical owner | Exactly one `GENERATED_ARTIFACT_LIFECYCLE_MODEL.md`, one `FRONTEND_BACKEND_OWNERSHIP_MODEL.md`; old backend docs reclassified as `reference`, not duplicates |
| G6 — attestation via canonical script only | `wave-10-emit-attestation.ts` invoked; no manual edits to attestation files |
| G7 — `EmptyState` semantic verification | No UI/component touched; `rg "EmptyState" src/components/empty/` unchanged |
| G8 — strict no-logic/no-UI/no-API change | All edits limited to `docs/`, `scripts/`, `generated/manifests/`, `generated/baselines/`, `generated/audits/`, `src/lib/ci/validator-gate-map.ts` |

## Files to create / edit

**Create (10)**:
1. `docs/architecture/GENERATED_ARTIFACT_LIFECYCLE_MODEL.md`
2. `docs/architecture/FRONTEND_BACKEND_OWNERSHIP_MODEL.md`
3. `scripts/architecture/generate/generate-artifact-governance-map.ts`
4. `scripts/architecture/generate/generate-frontend-backend-boundary-map.ts`
5. `scripts/architecture/checks/check-generated-artifact-governance.ts`
6. `scripts/architecture/checks/check-page-backend-bypass.ts`
7. `generated/manifests/generated-artifact-governance-map.json`
8. `generated/manifests/generated-artifact-freshness-policy.json`
9. `generated/manifests/frontend-backend-boundary-map.json`
10. `generated/audits/wave-b-generated-artifact-and-backend-boundary-hardening-report.md`

**Create baselines (2)**:
11. `generated/baselines/orphan-artifact-baseline.json`
12. `generated/baselines/page-backend-bypass-baseline.json`

**Edit (4)**:
13. `docs/architecture/REPOSITORY_CONSTITUTION.md` — add §B.1, §B.2, update pointer index
14. `docs/architecture/SERVICE_LAYER_CONSTITUTION.md` — add Rule 44
15. `src/lib/ci/validator-gate-map.ts` — register the two new BLOCK validators (80 → 82)
16. `generated/validator-gate-map.json` — auto-regenerated to mirror

**No deletions / no source moves / no UI edits / no API edits.**

## Risk register

| Risk | Mitigation |
|---|---|
| Orphan-artifact baseline too large to triage | Pin all current orphans into baseline; future additions blocked. Cleanup is a future wave. |
| 145 page-backend-bypass entries too large to refactor | Baseline-and-pin; regression-only enforcement. Domain layer (9 files) is the strict tier. |
| Generator scripts slow on 1,440 files | Cache mtimes; skip unchanged. Generators run nightly + on-demand. |
| Conflict with existing `check-supportability-freshness` / `check-attestation-evidence-freshness` | New governance check is additive, reads same source-of-truth (mtimes); no overlap with existing per-domain freshness checks. |

## Future work explicitly out of scope

- Actually refactoring the 145 admin pages off direct `@/integrations/supabase/client` (requires Wave C with state-extraction & service-facade build-out).
- Pruning historical orphan artifacts (requires archival policy decision per family).
- Adding contract-link declarations to existing service↔edge-function pairs (requires per-pair audit).

After approval I will execute Steps 1–8 in one pass, run `tsc --noEmit`, run both new generators + both new checks, capture baselines, reseal attestation via the canonical script, and report verification proof.
