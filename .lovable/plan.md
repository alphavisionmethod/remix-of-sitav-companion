# Wave 1.0 — Hook & Context Ownership Hardening

## Audit findings (real repo state)

| Bucket | Count | Notes |
|---|---:|---|
| `src/hooks/` files | **198** | All flat at root; no subdirs |
| Hooks importing `@/modules/**` | 1 | `use-pillar-priority.ts` |
| Hooks importing `@/platform/**` | 16 | e.g. `use-trust-emit`, `useOrchestration*`, `useBoardroomKernel` |
| Hooks importing `@/domains/**` | 12 | e.g. `use-mission-control-data`, `use-business-data` |
| Hooks with pillar/platform-semantic names | ~40 | e.g. `use-boardroom-*`, `useBusinessProfile` (79 importers!), `use-advisor-*` |
| `src/contexts/` files | **23** | All flat at root |
| Contexts with owner imports | ~7 | `BusinessProfileContext`, `BusinessNavigationContext`, `ConciergeNavigationContext`, `FinanceNavigationContext`, `ConciergeDataContext`, `RevenueOfficeModeContext`, `AppPlatformContext` |
| Truly app-wide contexts (confirmed) | ~13 | `AuthContext` (297 refs), `DataModeContext` (93), `WindowManager`, `Theme`, `Appearance`, `Connectivity`, `Inspector`, `Entity`, `Display`, `CalmEngine`, `Demo`, plus 3 SITA OS singletons (`SitaKernel`, `SitaOS`, `SitaVoice`, `Nova`) |

The constitution's existing line at row 30 of the top-level ownership map already gestures at "hooks owned by a single pillar should move to `src/modules/<pillar>/hooks/`" but **there is no validator, no baseline, no semantic rule, and no concept test**. This is the same gap Wave 0.9 fixed for components.

`src/modules/` exists (`business`, `concierge`, `finance`, `health`, `_shared`, `_trust`); `src/platform/` has 28+ subsystems. Both are valid relocation homes — but **physical moves are deferred** because hooks like `useBusinessProfile` have 79 importers and would shatter the Wave 10 attestation fingerprint.

## Strategy: install enforcement substrate, defer physical relocation

This wave installs the **concept-based ownership rule + classifier + blocking validators + monotone-decreasing ratchet baseline**, exactly mirroring Waves 0.7 (route adapters) and 0.9 (shared components). Physical file moves happen in a future "Hook & Context Relocation Wave" gated by Rules 19 (re-attest) + 24 (safe-change evidence).

## Concept rule (to be enforced)

A file may live in `src/hooks/**` only if it passes all three tests:

1. **Vocabulary** — name and exported symbols contain no pillar word (`business`, `concierge`, `finance`, `health`, `revenue`, `investment`), no platform-subsystem word (`advisor`, `boardroom`, `trust`, `sita`, `nova`, `mission`, `brain`, etc.), no admin/operator word.
2. **Dependency** — no imports from `@/modules/**`, `@/platform/**`, `@/admin/**`, `@/domains/**`, `@/pages/**`. (Generic shared utilities like `@/lib/utils`, `@/contracts`, `@/integrations/supabase` are allowed.)
3. **Cross-cutting** — usable by ≥2 conceptual surfaces (shell, any pillar, platform read), not just one feature flow.

A file may live in `src/contexts/**` only if it represents **app-wide shell-level state** — auth, theme, appearance, connectivity, runtime mode, window manager, OS kernel/SDK singletons. Module navigation contexts, business profile state, concierge data state, etc. fail the rule.

## Concrete deliverables

### 1. Model documentation

- **CREATE** `docs/architecture/HOOK_AND_CONTEXT_OWNERSHIP_MODEL.md` defining:
  - Three buckets for hooks: `src/hooks/` (cross-cutting), `src/modules/<pillar>/hooks/` (pillar), `src/platform/<system>/hooks/` (platform)
  - Two buckets for contexts: `src/contexts/` (app-wide shell), owner-local for everything else
  - The 3-test concept rule (vocabulary / dependency / cross-cutting)
  - Allowed shell-level context concerns
  - Target-owner inference table
  - Examples: valid & invalid

### 2. Classifier scripts (mirror Wave 0.9 pattern)

- **CREATE** `scripts/manifests/generate/generate-hook-ownership-map.ts`
  - Walks `src/hooks/**` (excluding `__tests__/`)
  - Classifies each file as: `shared-clean`, `pillar-semantic-<pillar>`, `platform-semantic-<system>`, `admin-semantic`, `domain-semantic`, `wrapper-with-owner-import`, `barrel-only-reexport`, `deprecated-shim`
  - Computes `targetOwner` path (e.g. `@/modules/business/hooks/`, `@/platform/boardroom/hooks/`)
  - Counts importers (blast radius)
  - Emits `generated/manifests/hook-ownership-map.json`

- **CREATE** `scripts/manifests/generate/generate-context-ownership-map.ts`
  - Walks `src/contexts/**`
  - Classifies as: `shell-app-wide`, `pillar-navigation`, `pillar-data`, `platform-capability`, `os-singleton`, `legacy-feature`
  - Whitelist of canonical app-wide concerns: `auth`, `theme`, `appearance`, `connectivity`, `data-mode`, `demo`, `display`, `entity`, `inspector`, `calm`, `window-manager`, plus OS singletons (`SitaKernel`, `SitaOS`, `Nova`, `SitaVoice`, `Runtime`)
  - Computes `targetOwner` for misowned ones
  - Emits `generated/manifests/context-ownership-map.json`

### 3. Blocking validators

- **CREATE** `scripts/architecture/check-hook-concept-rule.ts` (and alias under `scripts/architecture/checks/`)
  - Reads the hook ownership map
  - Enforces monotone-decreasing baseline at `generated/manifests/hook-semantic-violation-baseline.json`
  - Net-new owner-specific hooks in `src/hooks/**` → BLOCK CI
  - Severity regressions on baselined files → BLOCK CI

- **CREATE** `scripts/architecture/check-context-concept-rule.ts` (and alias under `scripts/architecture/checks/`)
  - Reads the context ownership map
  - Enforces monotone-decreasing baseline at `generated/manifests/context-semantic-violation-baseline.json`
  - Net-new owner-specific contexts in `src/contexts/**` → BLOCK CI

### 4. Sealed baselines

- **CREATE** `generated/manifests/hook-semantic-violation-baseline.json` — sealed snapshot of the ~40 owner-semantic hooks currently in `src/hooks/**`. Format mirrors `shared-component-semantic-violation-baseline.json`: `{ sealedAt, totalCount, byClassification, files: [{ path, classification, targetOwner, importerCount }] }`.
- **CREATE** `generated/manifests/context-semantic-violation-baseline.json` — sealed snapshot of the ~7 owner-specific contexts currently in `src/contexts/**`.

### 5. Constitution amendments

Add a new section to `docs/architecture/REPOSITORY_CONSTITUTION.md`:

```
## Hook & Context Ownership Rule (Wave 1.0 — BLOCKING)

39. **Hook ownership rule.** Files under `src/hooks/**` MUST pass the 3-test
    concept rule (vocabulary, dependency, cross-cutting) defined in
    `docs/architecture/HOOK_AND_CONTEXT_OWNERSHIP_MODEL.md`. Owner-specific
    hooks belong under `src/modules/<pillar>/hooks/` or
    `src/platform/<system>/hooks/`. Validator:
    `scripts/architecture/check-hook-concept-rule.ts` (foundation-tier, BLOCKING).

40. **Context ownership rule.** Files under `src/contexts/**` MUST be
    app-wide shell-level providers (auth, theme, runtime, window manager,
    OS singletons). Pillar/platform/feature contexts belong with their
    owner. Validator:
    `scripts/architecture/check-context-concept-rule.ts` (foundation-tier, BLOCKING).

41. **Hook & context violation ratchets.** Pre-existing owner-specific
    files are baselined in
    `generated/manifests/hook-semantic-violation-baseline.json` and
    `generated/manifests/context-semantic-violation-baseline.json`.
    Counts are monotone-decreasing — net-new violators BLOCK CI. Drained
    by the future Hook & Context Relocation Wave (gated by Rules 19, 24).
```

Also update the top-level ownership map row for `src/hooks/` and `src/contexts/` (lines 29–30) to point at the new model doc.

### 6. CI / foundation wiring

- Register both validators in `src/lib/ci/validator-gate-map.ts` with classification `block`, consumer `foundation-gate`.
- Add the 4 new manifests + 2 baselines to `scripts/manifests/generate/generate-foundation-manifest-index.ts` so they appear in `generated/manifests/foundation-manifest-index.json` (manifestCount: 23 → 27) and `foundation-tier-validator-set.json`.
- Wire the two new validators into `.github/workflows/foundation-gate.yml`.
- Re-emit `generated/validator-gate-map.json` so the new entries become visible (totalValidators 240 → 242, blockCount 76 → 78).

### 7. Final report

- **CREATE** `generated/audits/hook-context-ownership-hardening-report.md` containing:
  1. Old loophole summary
  2. New concept-based ownership model
  3. Hook classification results (count by bucket + sample files)
  4. Context classification results
  5. Sealed baselines (file lists with targetOwner)
  6. Constitution rules added (39, 40, 41)
  7. Validators added + classification table update
  8. Foundation manifest index delta
  9. Verification proof (validator runs GREEN; baseline matches scan)
  10. Future-facing: physical Hook & Context Relocation Wave deferred behind Wave 10 re-attestation

## What this wave does NOT do (intentionally)

- **No physical file moves.** `useBusinessProfile` (79 importers), `useBoardroomKernel`, `useOrchestration*` etc. stay where they are. Moving them now would invalidate the Wave 10 attestation seal and require a coordinated re-attest. The substrate installed here makes that future wave safe and bounded.
- **No new module/platform `hooks/` directories created.** The classifier *infers* target owners; the relocation wave creates the directories and moves files atomically.
- **No deletion of legacy duplicates.** `useAction.ts` vs `use-action.ts`, `useUserPreferences` vs `use-user-preferences.ts`, etc. are flagged in the classifier output as `duplicate-suspected` for the relocation wave to resolve under Rule 24 evidence.

## Safety guarantees

- ✅ Wave 10 architectural-attestation seal preserved (no source moves).
- ✅ All 297 `AuthContext` consumers untouched.
- ✅ All 79 `useBusinessProfile` consumers untouched.
- ✅ Monotone ratchet ensures the situation can only improve from here.
- ✅ Pattern is identical to the proven Waves 0.7 (route adapters) and 0.9 (shared components).

## Verification before completion

1. Run both new generators → confirm baselines match scan output exactly.
2. Run both new validators → confirm GREEN against the sealed baselines.
3. Run `npm run foundation:emit` → confirm manifest index updates cleanly.
4. Spot-check 3 baselined files exist in baseline; spot-check 3 known-clean hooks (e.g. `use-toast`, `use-mobile`, `useCountUp`) classified as `shared-clean`.
5. Confirm `.github/workflows/foundation-gate.yml` parses and the two new validator steps are syntactically correct.
