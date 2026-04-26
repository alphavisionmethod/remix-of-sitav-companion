# Business OS — Canonical Architecture Reorganization Plan

## Audit Summary (real findings)

| Issue | Location | Evidence |
|---|---|---|
| Empty domain barrel | `src/domains/business/index.ts` | Only contains `export {};` |
| Side-effect leak in engine | `src/domains/engines/business-profile-engine.ts` lines 631/637/643 | Direct `localStorage.setItem/getItem/removeItem` calls |
| Parallel type for same concept | `LeadScoreResult` (engine) vs `ScoredLeadResult` (service) | Both describe a scored lead, no shared contract |
| No domain-layer consumers | `@/domains/business` import count: **0** | Barrel never wired |
| No engine→service contracts | Services importing engines: **0** | Services re-declare types instead of consuming engine outputs |
| Soft advisor copy in pure engine | `lead-recovery-engine.ts:282` | Hardcoded persona string in pure logic file |
| Hardcoded demo string in engine | Same | Belongs in fixtures, not pure engine |
| Empty re-export | `revenue-opportunity` re-exported from engines barrel with 0 exported types | Placeholder leak |

## Target Ownership Model

```
src/domains/business/        → contracts, entity types, status enums, DTOs (pure types only)
src/domains/engines/         → pure functions, scoring, ranking, classification (no I/O)
src/lib/services/business-os/→ Supabase, edge fns, persistence, receipt emission (side effects)
src/modules/business/components/ → presentation only, consume hooks
src/modules/business/pages/  → composition only, route-level orchestration
```

**Direction of dependency:** components/pages → services → engines → domain. Domain depends on nothing.

---

## Phase 1 — Canonical Domain Layer (`src/domains/business/`)
**Status gate:** TS clean + zero behavior change before Phase 2.

1. Replace empty barrel with structured subfiles:
   - `src/domains/business/types/lead.ts` — `PriorityTier`, `UrgencyBand`, `HeatStatus`, `ConfidenceLevel`, `ConversionBand`, `LeadScoreResult`, `ScoreableLead`, `ScoreFactor` (lifted from `lead-scoring-engine.ts`)
   - `src/domains/business/types/recovery.ts` — recovery candidate, reactivation outcome contracts (lifted from `lead-recovery-engine.ts`)
   - `src/domains/business/types/profile.ts` — `BusinessProfileResult`, `ArchetypeWeights`, `ProfileArchetype` (lifted from `business-profile-engine.ts`)
   - `src/domains/business/types/customer.ts` — health, dashboard, timeline contracts (currently duplicated across services)
   - `src/domains/business/types/opportunity.ts` — opportunity + ranking contracts
   - `src/domains/business/types/quote.ts`, `proposal.ts`, `invoice.ts`, `callback.ts`, `collections.ts`
   - `src/domains/business/contracts/index.ts` — re-export only contracts
   - `src/domains/business/index.ts` — single canonical barrel
2. **No behavior change**: engines and services keep working; types are re-exported from new locations and old engine/service files re-export from the new domain home (`@lovable:migrated-wrapper` marker, identical to the existing `src/domains/types/*` pattern).
3. Add architecture marker README: `src/domains/business/README.md`.

**Deliverable:** Domain layer populated. `bunx tsc --noEmit` clean. Zero runtime change.

---

## Phase 2 — Engine Purification
**Status gate:** All engines pure + tests pass before Phase 3.

1. Move `localStorage` I/O out of `business-profile-engine.ts`:
   - Keep `computeBusinessProfile` (pure) in engine.
   - Move `saveBusinessProfile` / `loadBusinessProfile` / `clearBusinessProfile` into a new persistence service: `src/lib/services/business-os/business-profile.service.ts`.
   - Update the only consumer (`src/contexts/BusinessProfileContext.tsx`) to import save/load from the service and `compute*` from the engine.
2. Remove hardcoded persona string from `lead-recovery-engine.ts:282`; move advisor messaging to `src/data/fixtures/business/lead-recovery-copy.ts` and inject as parameter.
3. Drop the empty `revenue-opportunity` re-export from `src/domains/engines/index.ts` (or add real exports if file has utility — verify first; remove if dead).
4. All engine files now consume types from `@/domains/business` instead of re-declaring locally.

**Deliverable:** No engine performs I/O. No engine carries demo copy inline. Engine barrel honest.

---

## Phase 3 — Service Boundary Standardization
**Status gate:** Services consume domain contracts before Phase 4.

1. Each `*.service.ts` under `src/lib/services/business-os/` re-points local `export type` re-declarations to `import type` from `@/domains/business`.
2. Resolve the `LeadScoreResult` (engine) vs `ScoredLeadResult` (service) split: canonicalize as `LeadScoreResult` in domain; service exposes `scoreLead(): Promise<LeadScoreResult>` (Supabase-fetch wrapper around the pure engine).
3. Add `src/lib/services/business-os/business-profile.service.ts` (new from Phase 2).
4. Verify each service: side-effect only, no type ownership beyond DTOs that purely shape Supabase row → domain type.
5. `src/lib/services/business-os/index.ts` continues to be the side-effect facade — no domain types re-exported from here (consumers import types from `@/domains/business`, side-effects from `@/lib/services/business-os`).

**Deliverable:** Single source of truth per concept. Services importable in tests without Supabase mocks for type purposes.

---

## Phase 4 — UI/Page Rewiring
**Status gate:** All 49 business pages + components compile and render against new layers.

1. Update business pages and components that currently import types from `src/lib/services/business-os/*.service` for **type** purposes to instead import types from `@/domains/business`.
2. Pages keep importing **functions** from `@/lib/services/business-os` (side-effect facade unchanged).
3. Audit `src/modules/business/components/business/**` for any inline business logic / re-derived enums; lift into engines or domain as appropriate (no new layers).
4. Verify route shims (`src/routes/business-routes.tsx`, `src/routes/families/business-routes`) still resolve.
5. Verify `BusinessAppShell` + `BusinessNavigationContext` untouched.

**Deliverable:** All UI consumes canonical layers. Zero stale imports. App boots, business module navigates.

---

## Phase 5 — Verification & Anti-Duplication Guards
**Status gate:** Tests pass before Phase 6.

1. Add boundary checks in `scripts/architecture/`:
   - `check-business-engine-purity.ts` — fail CI if any `src/domains/engines/business-*` or relevant engine imports `supabase`, calls `localStorage`, `fetch(`, or imports from `src/lib/services/`.
   - `check-business-domain-no-duplicates.ts` — fail CI if `src/lib/services/business-os/**` declares a type whose name already exists in `@/domains/business`.
2. Vitest:
   - `src/domains/business/__tests__/contracts.test.ts` — type-level smoke confirming canonical exports exist.
   - `src/lib/services/business-os/__tests__/business-profile.service.test.ts` — save/load round-trip via mocked storage.
   - `src/domains/engines/__tests__/business-profile-engine.purity.test.ts` — assert engine produces identical output for identical input across calls (confirms no hidden state).
3. Run full type-check + relevant Vitest suites.

**Deliverable:** CI-enforced architecture. No regressions.

---

## Phase 6 — Architecture Report
1. `docs/architecture/BUSINESS_OS_CANONICAL_ARCHITECTURE_REPORT.md` covering: old problems, ownership model, files moved, engines purified, services rebounded, anti-duplication enforced, transitional debt remaining (if any), follow-up recommendations.
2. `src/modules/business/pages/README.md` — short developer map of "what goes where".

**Deliverable:** Single canonical doc engineers will trust.

---

## Anti-Duplication Discipline (applies to every phase)

Before creating any file, I will:
1. `rg "<TypeName>" src/domains src/lib/services` to confirm uniqueness.
2. Reuse existing barrels rather than creating new ones.
3. Mark every relocated file with the existing `@lovable:migrated-wrapper` convention so the old import path keeps working until consumers are rewired (matches the proven `src/domains/types/*` pattern).

## Scope Boundaries (explicitly NOT in this task)

- Will not touch `src/components/business-advisors/**` internal logic (advisor identity is owned by `mem://architecture/advisor-runtime-closure`).
- Will not modify `BusinessAppShell`, route registries, or windowing.
- Will not change Supabase schema or RLS.
- Will not touch the 49 business pages' rendering logic — only their import paths.
- No parallel "business-v2" tree.

## Files To Be Created

- `src/domains/business/types/{lead,recovery,profile,customer,opportunity,quote,proposal,invoice,callback,collections}.ts`
- `src/domains/business/contracts/index.ts`
- `src/domains/business/index.ts` (replaces empty stub)
- `src/domains/business/README.md`
- `src/lib/services/business-os/business-profile.service.ts`
- `src/data/fixtures/business/lead-recovery-copy.ts`
- `scripts/architecture/check-business-engine-purity.ts`
- `scripts/architecture/check-business-domain-no-duplicates.ts`
- `src/domains/business/__tests__/contracts.test.ts`
- `src/lib/services/business-os/__tests__/business-profile.service.test.ts`
- `src/domains/engines/__tests__/business-profile-engine.purity.test.ts`
- `docs/architecture/BUSINESS_OS_CANONICAL_ARCHITECTURE_REPORT.md`
- `src/modules/business/pages/README.md`

## Files To Be Modified (no behavior change)

- `src/domains/engines/business-profile-engine.ts` (remove localStorage, keep pure)
- `src/domains/engines/lead-scoring-engine.ts` (re-export types from domain)
- `src/domains/engines/lead-recovery-engine.ts` (remove inline persona copy)
- `src/domains/engines/index.ts` (drop dead `revenue-opportunity` export if confirmed empty)
- All `src/lib/services/business-os/*.service.ts` files that re-declare domain types → swap to `import type`
- `src/contexts/BusinessProfileContext.tsx` (import save/load from service)
- Business pages with stale type imports (only the import lines)

## Phase Gate Discipline

After each phase: TypeScript clean, tests green, smoke check on 3 representative business pages (`BusinessOverview`, `CRMPipeline`, `LeadRecovery`) before proceeding. No phase begins until the previous is 100% deployment-ready.
