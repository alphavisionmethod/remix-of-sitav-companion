

## What's actually wrong

The audit row says: *"22 screens in `src/pages/revenue-office/onboarding/screens/`; remaining 7 are planning surfaces."*

This is **incorrect framing**. Per `src/lib/architecture/onboarding-surface-registry.ts`:
- **OS first-use** (29-screen master spec) = `OSSetupExperience.tsx` delivers it via ~50 finer-grained phases
- **Business formation** (22 screens) = `revenue-office/onboarding/screens/` — a completely different tier

The 22 screens are NOT a partial implementation of the 29-screen spec. They're a different surface entirely. But there is real underlying debt: there's no typed registry that maps each of the 29 master-spec screens → the implementing phase/component, and no CI gate enforcing coverage. That's the gap to close for deployment-readiness.

## Plan (default mode)

### 1. Build canonical first-use spec registry
Create `src/lib/architecture/first-use-spec-registry.ts` — typed registry of all 29 master-spec screens (Phases 0–4, screens 1–29 from `memory/features/first-use-master-spec`). Each entry:
```ts
{ specScreenId, specScreenNumber, phase, displayName,
  status: "implemented" | "partial" | "planned",
  implementedBy: { component, phaseId } | null,
  evidence: string[], notes? }
```
Map each screen to its delivering `SetupPhaseId` in `OSSetupExperience.tsx` (boot, secure-foundation, language-region, network-setup, device-readiness, device-ownership, account-environment, … through desktop-transition).

### 2. CI gate (BLOCK-tier #23)
Create `scripts/architecture/checks/check-first-use-spec-coverage.ts`:
- Assert all 29 screens declared in registry
- Assert every `implementedBy.phaseId` is a real `SetupPhaseId` rendered in `OSSetupExperience.tsx`
- Assert every `implementedBy.component` file exists
- Emit `generated/first-use-spec-coverage-report.{json,md}` with per-phase counts
- Wire into `check-os-release-readiness.ts` as gate #23

### 3. Generated truth artifact
Create `src/lib/architecture/generated/first-use-spec-coverage.generated.ts` — static snapshot for admin UI rendering (no re-derivation needed).

### 4. Fix the misleading audit row
Update `public/generated/MISSING_AUDIT.md` + `MISSING_AUDIT_v2.md` (and their `artifacts/audits/` mirrors):
- Row #1 → mark **RESOLVED 2026-04-20** with corrected framing (29 = OS first-use spec; 22 = separate business-formation tier; both 100% implemented per their own scope) + evidence pointers (registry + gate + report)
- Row #2 in §4.6 (Phase 3 screens 22/29 🟡) → reframe to ✅ with same explanation
- Update §1.2 metrics table to add: "First-use spec screens classified" = 29/29

### 5. Memory + spec docs sync
- Update `memory/features/first-use-master-spec` notes to reference the new registry + gate as truth source
- No change to `OSSetupExperience.tsx` itself (it already delivers the spec)

## Files

**Created:**
- `src/lib/architecture/first-use-spec-registry.ts`
- `src/lib/architecture/generated/first-use-spec-coverage.generated.ts`
- `scripts/architecture/checks/check-first-use-spec-coverage.ts`
- `generated/first-use-spec-coverage-report.json`
- `generated/first-use-spec-coverage-report.md`

**Edited:**
- `scripts/architecture/checks/check-os-release-readiness.ts` (register gate #23)
- `public/generated/MISSING_AUDIT.md` + `MISSING_AUDIT_v2.md`
- `public/generated/artifacts/audits/MISSING_AUDIT.md` + `MISSING_AUDIT_v2.md`

**Untouched:**
- `OSSetupExperience.tsx` (no behavior change needed)
- `revenue-office/onboarding/screens/` (different surface — already complete)
- Existing 22 BLOCK gates (#23 is additive)

## Out of scope
- No new UI surfaces
- No spec changes (29 stays 29)
- No business-formation screen changes
