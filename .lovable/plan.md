
## Diagnosis

Backend resume telemetry is **already 100% production-ready**:
- ✅ `onboarding_resume_checkpoints` table (migration `20260420020119`) with 3 owner-RLS policies, validation trigger, 30-day TTL, unique resume_token
- ✅ Edge function `supabase/functions/onboarding-resume-checkpoint/index.ts` (POST upsert + GET retrieve, JWT-validated)
- ✅ BLOCK gate `check-onboarding-branch-telemetry.ts` enforces all three (table/RLS/fn) — runs green: `resume persistence — table:true rls:true fn:true`
- ✅ Owner-map registered (`user-experience` team)
- ✅ All audit mirrors carry RESOLVED 2026-04-20 markers (lines 63, 78, 816, 1197, 1350-1356)

**Real remaining gap on disk:** the client never calls the edge function. `src/pages/Onboarding.tsx` tracks `step` in local React state only. If a user abandons setup mid-flow, nothing is persisted server-side, so the resume table stays empty and the "resume after abandonment" loop is unverifiable end-to-end. The E2E spec `tests/e2e/customer-journey/auth/setup-continuation.spec.ts` is also a stub (just navigates to `/`).

## Plan — close the client-side resume loop

### 1. Create `src/hooks/useOnboardingResume.ts`
Owner-scoped hook that:
- On mount: GET latest checkpoint via edge function (using session_id from localStorage); returns `{ checkpoint, isLoading }`
- Exposes `saveCheckpoint({ currentScreen, branch, profileSnapshot, conditionalState, lastCompletedScreen })` debounced (500ms)
- Exposes `clearCheckpoint()` (called on completion)
- Generates stable `session_id` per setup attempt (uuid in localStorage, cleared on complete)

### 2. Wire into `src/pages/Onboarding.tsx`
- Map existing `Step` enum to numeric `currentScreen` (1..29 — clamp 10 steps onto the 29-screen ceremony per master spec)
- On step change: call `saveCheckpoint` with current step + collected form data as `profileSnapshot`
- On mount: if checkpoint exists and not expired, prompt "Resume where you left off?" → restore `step` + form data
- On `complete` step: call `clearCheckpoint`

### 3. Strengthen `check-onboarding-branch-telemetry.ts` (additive)
Add a fourth assertion: `useOnboardingResume` hook exists AND is imported by `src/pages/Onboarding.tsx`. Surfaces in report as `resumePersistence.clientWired: boolean`.

### 4. Make E2E test real
Replace stub `tests/e2e/customer-journey/auth/setup-continuation.spec.ts` with: start onboarding → advance 3 steps → reload page → assert resume prompt → restore → assert at correct step.

### 5. Update audit doc
Append "client-side resume hook + E2E" delivery note under the existing RESOLVED 2026-04-20 entries in both `MISSING_AUDIT.md` and `MISSING_AUDIT_v2.md` (public/generated/ + /mnt/documents/ — keep all 4 mirrors byte-identical).

## Files touched

**Created (3):**
- `src/hooks/useOnboardingResume.ts`
- (none — gate is extended in-place)

**Edited (5):**
- `src/pages/Onboarding.tsx` (wire hook + resume prompt)
- `scripts/architecture/checks/check-onboarding-branch-telemetry.ts` (add clientWired assertion)
- `tests/e2e/customer-journey/auth/setup-continuation.spec.ts` (real flow)
- `public/generated/MISSING_AUDIT.md` + `MISSING_AUDIT_v2.md` and `/mnt/documents/` mirrors

## What this does NOT touch

- Zero schema changes (table + RLS + trigger already shipped)
- Zero edge function changes
- Zero changes to existing 21 BLOCK gates wiring (gate #11 is extended additively)
- Zero changes to other pages or hooks
