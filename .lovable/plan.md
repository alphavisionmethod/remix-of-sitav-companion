

# Fix Accessibility to 100% Deployment-Ready (PROVEN Status)

## Problem

The accessibility subsystem is marked **PARTIAL / UNPROVEN** in the audit because:

1. **Fake validator**: `generate-validation-summary.ts` (line 62) hardcodes `score: 100` and `status: "compliant"` for every route without actually inspecting ARIA attributes — it is a placeholder, not a real check.
2. **No dedicated accessibility validator**: `check-accessibility-baseline.ts` only checks if the evidence JSON file exists and counts routes — it never inspects component source code for actual ARIA compliance.
3. **No accessibility test suite**: Zero tests verify that components render correct ARIA attributes, roles, landmarks, focus management, or keyboard navigation.
4. **Missing ARIA on key UI primitives**: Several shadcn/ui components (e.g., `progress.tsx`, `skeleton.tsx`, `switch.tsx`, `slider.tsx`, `textarea.tsx`, `input.tsx`) lack explicit ARIA attributes that WCAG 2.1 AA requires.

## Plan

### 1. Create a Real Accessibility Validator Script

**New file**: `scripts/validation/check-accessibility-compliance.ts`

- Scans all `.tsx` files under `src/components/ui/` (49 primitives) and `src/components/sita/` (shell surfaces)
- For each file, checks for presence of: `role=`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-hidden`, `sr-only`, `tabIndex`, `aria-expanded`, `aria-controls`
- Classifies components into categories: **interactive** (buttons, inputs, dialogs — must have ARIA labels), **decorative** (must have `aria-hidden`), **structural** (must have landmark roles)
- Emits `generated/accessibility-compliance-report.json` via `emitGateReport`
- Sets `ok: true` only when all interactive components have at least one ARIA attribute and all dialogs have focus-trap evidence

### 2. Fix the Fake Evidence Generator

**Edit file**: `scripts/manifests/generate/generate-validation-summary.ts` (lines 59-74)

- Replace the hardcoded `score: 100` stub with actual per-route ARIA presence checks
- Read each route's component file and scan for `aria-` attribute presence
- Score based on actual findings: has landmarks, has labels, has focus management
- Output honest compliance percentages

### 3. Wire Validator into Release Gate Aggregator

**Edit file**: `scripts/architecture/checks/check-os-release-readiness.ts`

- Add `"accessibility-compliance"` to the gate list (currently only has `"accessibility-baseline"` which is advisory)
- Promote from advisory to block-level gate

### 4. Add ARIA Attributes to UI Primitives Missing Them

**Files to edit** (adding missing ARIA):

| Component | Fix |
|---|---|
| `src/components/ui/progress.tsx` | Add `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` |
| `src/components/ui/skeleton.tsx` | Add `aria-hidden="true"`, `role="presentation"` |
| `src/components/ui/input.tsx` | Add `aria-invalid` binding when used with form errors |
| `src/components/ui/textarea.tsx` | Add `aria-invalid` binding when used with form errors |
| `src/components/ui/switch.tsx` | Ensure `aria-checked` is explicitly bound (Radix may handle this but verify) |
| `src/components/ui/slider.tsx` | Ensure `aria-valuemin`, `aria-valuemax`, `aria-valuenow` are present |
| `src/components/ui/badge.tsx` | Add `role="status"` for status badges |
| `src/components/ui/toast.tsx` | Ensure `role="alert"` and `aria-live="assertive"` |
| `src/components/ui/tooltip.tsx` | Ensure `role="tooltip"` is present |
| `src/components/ui/separator.tsx` | Add `aria-orientation` |

### 5. Create Accessibility Test Suite

**New file**: `src/test/accessibility-compliance.test.ts`

- Tests that all 49 UI primitives in `src/components/ui/` render with correct ARIA semantics
- Tests for: Dialog focus trap (`sr-only` Close button present), Alert has `role="alert"`, Carousel has `aria-roledescription`, Progress has `role="progressbar"`, interactive elements are keyboard-reachable
- Tests that the `AccessibilityBaseline` contract covers all 6 page classes
- Tests that `useReducedMotion` hook respects `prefers-reduced-motion`

### 6. Update OSAUDIT.md Evidence

**Edit file**: `/mnt/documents/OSAUDIT.md`

- Update the accessibility row from `Partial | UNPROVEN` to `Complete | PROVEN`
- Add the new validator script path and test file as evidence
- Update compliance percentage

## Outcome

After implementation:
- A **real** validator scans component source for ARIA compliance (not a hardcoded stub)
- All 49 UI primitives have correct ARIA attributes per WCAG 2.1 AA
- A dedicated test suite proves compliance in CI
- The release gate aggregator blocks releases if accessibility regresses
- The audit status moves from `PARTIAL/UNPROVEN` to `COMPLETE/PROVEN`

