

# Interaction Truth & Journey Verification — Gap Analysis and Enhancement Plan

## Current State (Already Implemented)

The project has robust existing systems that cover the majority of the prompt's requirements:

**Verification Layer (V01–V07):** 7 boards at `/admin/verification/*` — Surface Inventory, Interaction Coverage, P0 Journey Board, Mode Verification, Failure Triage, Evidence Explorer, Launch Blockers. All wired to `verification_surfaces`, `verification_runs`, `verification_blockers`, `verification_evidence` tables via `verification-hooks.ts`.

**Customer Journey Layer (CJ01–CJ09):** 9 boards at `/admin/customer-journey/*` — Executive Report, Journey Truth Matrix, Journey Detail, Launch Blockers, Demo vs Real, Broken Clicks Explorer, Owner Remediation, Route Action Coverage, Recent Verification Runs. All wired to `customer_journey_runs` table via `journey-hooks.ts`.

**Supporting Infrastructure:**
- `surface-registry.ts` — 215-line canonical interaction registry (P0/P1/P2 surfaces with stable selectors, expected behaviors, backend dependencies)
- `journey-registry.ts` — 801-line journey manifest (60+ journeys with steps, outcomes, launch importance)
- `runtime-probes` edge function + LT04 Runtime Probe Center
- E2E test helpers (`selectors.ts`, `assertions.ts`, `journey-recorder.ts`, `auth.ts`)
- `InteractionTracker` component for behavioral signal capture
- Launch gate systems (V07 + CJ04 + LT05)

## What's Missing (5 Pages + 1 Enhancement)

| JVC Screen | Purpose | Why it's needed |
|---|---|---|
| JVC05 — Redirect Integrity Map | Visualize navigation correctness, detect dead ends/loops | No redirect-specific verification exists |
| JVC07 — Form Verification Center | Track form field validation, submit, persist, redirect | No form-specific verification exists |
| JVC08 — Modal/Drawer Interaction Board | Verify transient UI correctness (open/close/focus trap) | Completely missing |
| JVC09 — Keyboard/Command Verification | Track shortcuts, command palette, focus order | Completely missing |
| JVC11 — Journey Replay | Visual step-by-step replay of journey executions | No replay timeline page |
| JVC13 — Interaction Drift Radar | Detect mismatches between registry and actual behavior | No drift detection page |

**Already fully covered (no changes needed):**
- JVC01 → CJ01 Executive Report
- JVC02 → V01 Surface Inventory Board
- JVC03 → CJ02 + CJ03 Journey Matrix/Detail
- JVC04 → CJ06 Broken Clicks Explorer
- JVC06 → V03 + V04 Page Load Boards
- JVC10 → LT04 Runtime Probe Center
- JVC12 → V02 + CJ08 Behavior Coverage
- JVC14 → V07 + CJ04 + LT05 Launch Gates

## Implementation Plan

### 1. Surface Registry Enhancement
**File:** `src/lib/verification/surface-registry.ts`
- Add new surface types: `redirect`, `form_field`, `modal`, `drawer`, `keyboard_shortcut`, `command_palette`
- Add fields: `redirectTarget`, `formFields`, `focusTrapExpected`, `shortcutKey`

### 2. New Pages (6 files)

**`src/pages/admin/verification/JVC05RedirectIntegrityMap.tsx`**
- Redirect flow graph from surface registry entries with `actionType: "navigation"`
- Broken redirect list (entries pointing to non-existent routes)
- Dead end warnings (routes with no outbound navigation)
- Auth/permission redirect flows
- Loop detection

**`src/pages/admin/verification/JVC07FormVerificationCenter.tsx`**
- Table of all registered forms from surface registry (`surfaceClass: "form"`)
- Field validation coverage panel
- Submission outcome history from verification_runs
- Persistence verification (submit → refresh → data still present)
- Proof/receipt linkage for applicable forms

**`src/pages/admin/verification/JVC08ModalDrawerBoard.tsx`**
- Grid of all modal/drawer interactions from registry
- Open/close success tracking
- Focus trap check panel
- Escape handling verification
- Zombie overlay alert detection

**`src/pages/admin/verification/JVC09KeyboardCommandBoard.tsx`**
- Shortcut registration table (from command palette + keyboard bindings)
- Execution success tracking per shortcut
- Command palette action results
- Focus order inspector
- Conflict detection (duplicate shortcuts)

**`src/pages/admin/verification/JVC11JourneyReplay.tsx`**
- Journey selection from registry
- Step-by-step replay timeline with pass/fail per step
- Route transition visualization
- Screenshot/evidence carousel from verification_evidence
- Semantic assertion panel showing expected vs actual

**`src/pages/admin/verification/JVC13InteractionDriftRadar.tsx`**
- Compare surface registry entries against actual route/component existence
- Selector drift detection (registered selector no longer in DOM)
- Changed redirect targets
- Lost success feedback
- Drift severity rail and timeline
- Resolution workflow panel

### 3. Route Wiring
**File:** `src/App.tsx`
- Add 6 new lazy imports and routes under `/admin/verification/*`

### 4. Data Model Extensions
**File:** `src/lib/verification/surface-registry.ts`
- Add entries for forms, modals, keyboard shortcuts, redirects across all major workspaces (Money Office, Admin, AI Engineering, etc.)

### File Summary

| File | Action |
|---|---|
| `src/lib/verification/surface-registry.ts` | Enhance types + add form/modal/keyboard/redirect entries |
| `src/pages/admin/verification/JVC05RedirectIntegrityMap.tsx` | New — redirect flow verification |
| `src/pages/admin/verification/JVC07FormVerificationCenter.tsx` | New — form behavior verification |
| `src/pages/admin/verification/JVC08ModalDrawerBoard.tsx` | New — modal/drawer interaction board |
| `src/pages/admin/verification/JVC09KeyboardCommandBoard.tsx` | New — keyboard/command verification |
| `src/pages/admin/verification/JVC11JourneyReplay.tsx` | New — journey execution replay |
| `src/pages/admin/verification/JVC13InteractionDriftRadar.tsx` | New — behavior drift detection |
| `src/App.tsx` | Add 6 routes |

All new pages will use existing hooks (`useVerificationSurfaces`, `useVerificationRuns`, `useCustomerJourneyRuns`), existing primitives (`SitaCard`, `Badge`, `Table`), and existing data from the surface registry and journey registry. No new database tables needed — all pages consume existing verification tables.

