

## Diagnosis

`MISSING_AUDIT.md` flags **multiple onboarding entrypoints with overlapping intent** as a P2 architecture issue:

| Surface | Role | Status |
|---|---|---|
| `/onboarding` route → `OnboardingWrapper` → `OSSetupExperience` (~50 phases, components in `src/components/sita/onboarding/`) | OS-level first-boot personalization (29-screen master spec) | Canonical OS path |
| `src/pages/revenue-office/onboarding/FormationShell` (22 screens, mounted inside `BusinessAppShell` when `business_onboarding.completed_at` is null) | Business-domain "formation" (revenue model, journey, intake) | Domain-specific business setup |
| `src/lib/business-journey-config.ts` | Journey recommendation lookup (sidebar visibility) | Pure config |
| `src/features/onboarding/index.ts` | Barrel re-exporting `src/components/sita/onboarding/*` | Façade |
| `src/lib/services/onboarding-daemon` + `useOnboardingDaemon` | Alternative daemon-driven 11-step OS onboarding | Parallel/legacy engine |
| `src/lib/services/onboarding/` | Empty placeholder barrel | Phantom |
| `src/lib/setup/` (emotional-arc, reflection-copy, world-model-field-meta) | Copy/data helpers | Library |
| `src/components/sita/setup/` (~45 setup atoms) | UI primitives for setup | Library |
| `src/components/sita/money-onboarding/` | Money-domain onboarding | Domain-specific |
| `src/domains/setup/` + `src/platform/setup/` | Empty placeholder barrels | Phantom |

**Real overlap**: `OSSetupExperience` and `useOnboardingDaemon` are two parallel orchestration engines for the same OS first-boot intent. `FormationShell` legitimately exists as a **separate** business-domain flow (it runs *after* OS onboarding, inside the Business app), but it is undeclared, undocumented, and lives in `revenue-office/onboarding/` which the audit reads as duplication. The phantom barrels (`src/lib/services/onboarding/`, `src/domains/setup/`, `src/platform/setup/`, `src/features/onboarding/`) add cognitive noise without value.

## Strategy: Three-tier canonical onboarding registry + intent declarations

Don't move 22 screens or rewrite 50-phase OSSetupExperience (high risk, would touch BLOCK-gated Phase-3 master-spec attestation). Instead, **declare the intent boundaries explicitly**, retire the redundant daemon engine, and collapse phantom barrels.

### Step 1 — Create canonical onboarding registry

New file: `src/lib/architecture/onboarding-surface-registry.ts`

Declares each onboarding surface with: `id · scope · intent · entrypoint · screens · ownerDomain · canonicalPath · status`. Three legitimate tiers:

| Tier | ID | Scope | Entry | Screens |
|---|---|---|---|---|
| **OS** | `os-first-boot` | Device-wide first-boot personalization (29-screen master spec) | `/onboarding` → `OSSetupExperience` | ~50 phases (covers all 29 + setup) |
| **Business** | `business-formation` | Per-business workspace formation, runs inside Business app | `BusinessAppShell` → `FormationShell` | 22 |
| **Money** | `money-introduction` | Optional Finance-app onboarding | `MoneyOnboarding/*` | 6 |

This registry becomes the truth source — referenced by docs, tests, and the new validator.

### Step 2 — Retire the redundant onboarding daemon

`src/lib/services/onboarding-daemon/` defines an **alternative** 11-step OS onboarding engine that no live code actually mounts (the canonical path is `OSSetupExperience`). The hook `useOnboardingDaemon` exists but isn't routed anywhere user-visible.

- Mark `src/lib/services/onboarding-daemon/index.ts` and `src/hooks/useOnboardingDaemon.ts` as **deprecated** with header banners pointing to `OSSetupExperience` and the canonical registry
- Keep them compiling (don't delete — would touch tests) but ensure no new code can reference them via a new ESLint-style restriction in the new validator

### Step 3 — Collapse phantom barrels

Three empty placeholder barrels create cluster noise:
- `src/domains/setup/index.ts` — empty `export {}`
- `src/platform/setup/index.ts` — empty `export {}`
- `src/lib/services/onboarding/index.ts` — empty barrel

Replace each with a 3-line file that **re-exports the canonical registry** so any future code looking there gets routed correctly:
```ts
// Canonical onboarding surfaces declared in the registry.
export { ONBOARDING_SURFACES, type OnboardingSurface } from "@/lib/architecture/onboarding-surface-registry";
```

### Step 4 — Add intent banner to FormationShell + OSSetupExperience

Top-of-file comment on each declares its scope, registry ID, and explicit non-overlap statement so future readers (and audits) can't confuse them:

```ts
// ════════════════════════════════════════════════════════════════
// ONBOARDING SURFACE: business-formation (registry: ONBOARDING_SURFACES)
// SCOPE: Per-business workspace formation. Runs inside BusinessAppShell
//        AFTER OS first-boot (os-first-boot) is complete.
// NOT THE OS FIRST-BOOT FLOW. See OSSetupExperience for that.
// ════════════════════════════════════════════════════════════════
```

### Step 5 — Add validator: `check-onboarding-surface-truth.ts`

New WARN-tier (not BLOCK — keeps 21/21 unchanged) validator at `scripts/architecture/checks/check-onboarding-surface-truth.ts`. Asserts:
1. Every entry in `ONBOARDING_SURFACES` has a real `entrypointFile` on disk
2. No file outside the declared entrypoints imports `useOnboardingDaemon` (deprecated)
3. The 29-screen master spec count matches the declared OS surface phase count
4. Each declared surface has its intent banner present

Wire into `package.json` as `check:onboarding-surface-truth` and add to `npm run check:architecture` (the WARN-tier suite, not BLOCK).

### Step 6 — Update `MISSING_AUDIT.md`

In `public/generated/MISSING_AUDIT.md` AND `/mnt/documents/MISSING_AUDIT.md`:
- **Part III** (Cluster Audit) — mark onboarding surfaces as consolidated, link to `onboarding-surface-registry.ts`
- **Part XI** (Onboarding Journey) — replace the "22 vs 29 mismatch" finding with the resolved 3-tier model
- **Part XIII** (Drift) — note phantom barrels collapsed
- **Part XIV** (Fix Plan) — strike the "Multiple onboarding entrypoints" P2 item, add **RESOLVED 2026-04-20**

## What this does NOT touch

- No changes to `OSSetupExperience` logic or any of the 50 phases
- No changes to `FormationShell` logic or any of the 22 screens
- No changes to `MoneyOnboarding` or `useBusinessOnboarding` hook
- No DB / RLS / edge function / auth changes
- No changes to any of the 21 BLOCK gates or the master release aggregator
- No changes to `App.tsx` routes or navigation
- `useOnboardingDaemon` stays compiling — only deprecation banner added

## Files touched

**New (3):**
- `src/lib/architecture/onboarding-surface-registry.ts`
- `scripts/architecture/checks/check-onboarding-surface-truth.ts`
- `generated/onboarding-surface-truth-report.json` (auto-generated by validator)

**Modified (8):**
- `src/lib/services/onboarding-daemon/index.ts` (add deprecation banner)
- `src/hooks/useOnboardingDaemon.ts` (add deprecation banner)
- `src/domains/setup/index.ts` (re-export registry)
- `src/platform/setup/index.ts` (re-export registry)
- `src/lib/services/onboarding/index.ts` (re-export registry)
- `src/components/sita/OSSetupExperience.tsx` (add intent banner — header comment only)
- `src/pages/revenue-office/onboarding/FormationShell.tsx` (add intent banner — header comment only)
- `src/components/sita/money-onboarding/index.ts` if exists (add intent banner)
- `package.json` (add check:onboarding-surface-truth script)

**Doc updates (2):**
- `public/generated/MISSING_AUDIT.md`
- `/mnt/documents/MISSING_AUDIT.md`

## Verification after approval

```bash
cat src/lib/architecture/onboarding-surface-registry.ts | head -20    # 3 declared surfaces
npx tsc --noEmit                                                       # 0 errors
npm run check:onboarding-surface-truth                                 # PASS
npm run release:readiness                                              # 21/21 BLOCK GREEN (unchanged)
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md  # identical
grep -c "DEPRECATED" src/hooks/useOnboardingDaemon.ts                 # ≥1
grep -c "ONBOARDING SURFACE" src/components/sita/OSSetupExperience.tsx src/pages/revenue-office/onboarding/FormationShell.tsx  # 2
```

Result: A single declared truth source for all onboarding intents, the redundant daemon retired, phantom barrels collapsed, and a new validator preventing regression — all without touching any user-visible behavior or the 21 BLOCK gates.

