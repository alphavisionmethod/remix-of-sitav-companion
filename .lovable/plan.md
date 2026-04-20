
## Diagnosis

Audit observation is accurate:
- `src/components/onboarding/` does NOT exist on disk
- All 29 personalization ceremony screens live under `src/pages/revenue-office/onboarding/screens/`
- This violates the "components are reusable, pages compose them" convention and means shared onboarding primitives (progress chrome, step shell, choice cards, etc.) are duplicated/inlined inside page files
- No CI gate enforces the existence of a canonical `src/components/onboarding/` directory, so future drift is unguarded

The fix is **structural, not cosmetic**: extract genuinely shared onboarding UI primitives into `src/components/onboarding/`, refactor the screen pages to consume them, and add a BLOCK-tier gate that asserts the folder's existence + a minimum primitive count + that screen pages import from it.

## Strategy — additive, mirrors existing component-folder conventions

### Step 1 — Inspect current screen files to identify shared primitives
Read a representative sample (~5-8 screens) under `src/pages/revenue-office/onboarding/screens/` to identify recurring UI patterns. Expected primitives based on the master spec:
- `OnboardingShell` — page chrome (header, progress, footer nav)
- `OnboardingProgress` — phase/step indicator
- `OnboardingChoiceCard` — depth/tone/option selection card
- `OnboardingStepHeader` — title + subtitle + microcopy
- `OnboardingFooterNav` — back/next/skip buttons
- `OnboardingMomentReveal` — wow-moment animation wrapper

### Step 2 — Create `src/components/onboarding/` with extracted primitives
- Create the folder
- Add 6 primitive components (one file each) with proper TypeScript interfaces
- Add `index.ts` barrel export
- Each component uses semantic tokens from `index.css` / `tailwind.config.ts` (no hardcoded colors per project convention)

### Step 3 — Refactor screen pages to consume primitives
- Update `src/pages/revenue-office/onboarding/screens/*.tsx` to import from `@/components/onboarding`
- Replace inline chrome/progress/card markup with the primitives
- Keep all screen-specific copy, branching logic, and data-binding intact
- Scope: at least 5 screens refactored to prove the pattern; remaining screens flagged for follow-up but pages still build

### Step 4 — Add BLOCK-tier gate `check-onboarding-components-folder.ts`
New gate at `scripts/architecture/checks/check-onboarding-components-folder.ts` asserting:
1. `src/components/onboarding/` exists
2. Contains ≥ 5 `.tsx` primitive files + `index.ts` barrel
3. At least 5 screen pages under `src/pages/revenue-office/onboarding/screens/` import from `@/components/onboarding`

Register as gate #23 in `src/lib/ci/ci-gate-registry.ts` and the master release readiness aggregator. Produces `generated/onboarding-components-folder-report.json`.

### Step 5 — Update audit mirrors to RESOLVED
Update line "Onboarding components folder" in all four mirrors:
- `public/generated/MISSING_AUDIT.md`
- `/mnt/documents/MISSING_AUDIT.md`
- `public/generated/MISSING_AUDIT_v2.md`
- `/mnt/documents/MISSING_AUDIT_v2.md`

To: `**RESOLVED 2026-04-20** — src/components/onboarding/ created with 6 extracted primitives (Shell, Progress, ChoiceCard, StepHeader, FooterNav, MomentReveal); 5+ screens refactored to consume them; BLOCK gate #23 (check-onboarding-components-folder) asserts folder presence, primitive count, and consumer imports.`

Preserve byte-identical mirror parity via md5sum.

## What this does NOT touch

- Zero behavior change to onboarding flow logic, branching, or copy
- No changes to data model keys (`onboardingSession`, etc.)
- No changes to existing 22 BLOCK gates' logic
- No changes to routes or navigation
- No removal of screen files — only refactoring inline markup to use primitives

## Files touched

**New (8):**
- `src/components/onboarding/OnboardingShell.tsx`
- `src/components/onboarding/OnboardingProgress.tsx`
- `src/components/onboarding/OnboardingChoiceCard.tsx`
- `src/components/onboarding/OnboardingStepHeader.tsx`
- `src/components/onboarding/OnboardingFooterNav.tsx`
- `src/components/onboarding/OnboardingMomentReveal.tsx`
- `src/components/onboarding/index.ts`
- `scripts/architecture/checks/check-onboarding-components-folder.ts`

**Modified (~9):**
- 5+ screen files under `src/pages/revenue-office/onboarding/screens/` (refactor to consume primitives)
- `src/lib/ci/ci-gate-registry.ts` (register gate #23)
- `scripts/architecture/checks/check-os-release-readiness.ts` (add to mandatory roster — now 23)
- `public/generated/MISSING_AUDIT.md` + mirror
- `public/generated/MISSING_AUDIT_v2.md` + mirror

## Verification after approval

```bash
ls src/components/onboarding/                                              # 6 .tsx + index.ts
npx tsx scripts/architecture/checks/check-onboarding-components-folder.ts  # 0 errors
npm run release:readiness                                                  # 23/23 green
npx tsc --noEmit                                                            # 0 errors
md5sum public/generated/MISSING_AUDIT.md /mnt/documents/MISSING_AUDIT.md   # identical
md5sum public/generated/MISSING_AUDIT_v2.md /mnt/documents/MISSING_AUDIT_v2.md  # identical
```

Result: `src/components/onboarding/` becomes a real, populated, gate-enforced canonical folder; onboarding screens consume shared primitives instead of inlining chrome; and a new BLOCK gate prevents future regression.
