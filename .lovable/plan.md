

# Interaction Truth & Journey Verification — Gap Analysis & Enhancement Plan

## Current State: 13 pages exist, 2 missing, 4 need enhancement

### Fully Complete (no changes needed)
| Spec Board | Existing Page | Lines | Verdict |
|---|---|---|---|
| 5. Redirect Integrity Map | JVC05 | 215 | ✅ Loop detection, dead ends, auth redirects, search |
| 7. Form Verification Center | JVC07 | 220 | ✅ Field tracking, persistence, proof, submit, per-form drill |
| 8. Modal/Drawer Board | JVC08 | 180 | ✅ Focus trap, zombie detection, cleanup, escape |
| 9. Keyboard/Command Board | JVC09 | 197 | ✅ Conflicts, shortcuts, command palette, redirect targets |
| 10. Runtime Probe Center | LT04 | 122 | ✅ Live probe execution, DB-backed, edge function calls |
| 11. Journey Replay | JVC11 | 240 | ✅ Step-by-step, domain filter, evidence, run history |
| 12. Interaction Drift Radar | JVC13 | 272 | ✅ 7 drift categories, severity rail, timeline, resolution workflow |
| 1. Interaction Registry | V01 | 133 | ✅ Full SURFACE_REGISTRY, seed, filter, search |

### Missing Pages (need creation)
| Spec Board | Required |
|---|---|
| **4. Button & CTA Health Board** | Dedicated board: clickability, disabled-state correctness, destination, duplicate submit risk, stale selectors, ghost buttons |
| **6. Page Load Integrity Board** | Page load, shell load, data load, error/empty/degraded states, time to first usable view, client error rate |

### Pages Needing Enhancement
| Spec Board | Current Page | Gap |
|---|---|---|
| **3. Behavior Coverage Board** | V02 (72 lines) | Too thin — needs: % interactions registered vs tested vs probed, critical uncovered buttons, routes with incomplete coverage, by-priority breakdown |
| **2. Journey Manifest Registry** | V03 (83 lines) | Only shows P0 families — needs: full CUSTOMER_JOURNEY_REGISTRY browser, all domains, step counts, launch importance, status from DB |

---

## Plan

### Step 1: Create JVC04 — Button & CTA Health Board
New file: `src/pages/admin/verification/JVC04ButtonCTAHealth.tsx`

Reads from SURFACE_REGISTRY filtering `surfaceClass` in [button, card_action, form submit, toggle]. Shows:
- KPI band: total CTAs, P0 CTAs, with selectors, without selectors, with redirects
- Clickability matrix: per button — visible, disabled rules, destination, action type
- Duplicate submit risk panel: forms without proof/receipt that mutate
- Ghost button detection: buttons with no actionSelector or stale selectors
- Stale selector warnings: selectors not using data-testid pattern
- Per-CTA verification status from DB runs

### Step 2: Create JVC06 — Page Load Integrity Board
New file: `src/pages/admin/verification/JVC06PageLoadIntegrity.tsx`

Reads from SURFACE_REGISTRY filtering `surfaceClass === "page"`. Shows:
- KPI band: total pages, with loading state, with error state, with empty state, with shell assignment
- Page inventory grid: route, shell, backend dependency, launch honesty class
- Missing state alerts: pages missing loading/error/degraded state indicators
- Shell assignment map: which pages use which shell
- Data dependency panel: pages with backend dependencies vs those without
- Verification status per page from DB

### Step 3: Enhance V02 — Behavior Coverage Board
Expand from 72 → ~150 lines:
- Add: % of SURFACE_REGISTRY entries that are tested (from DB runs)
- Add: % of entries that are runtime-probed (cross-ref with runtime_probes table)
- Add: critical uncovered buttons section (P0 surfaces with no verification runs)
- Add: by-priority breakdown (P0/P1/P2 coverage bars)
- Add: by-surface-class breakdown (buttons, forms, pages, modals each with coverage %)

### Step 4: Enhance V03 → Full Journey Manifest Registry
Expand from 83 → ~200 lines. Currently only shows 8 hardcoded P0 families. Change to:
- Browse ALL journeys from CUSTOMER_JOURNEY_REGISTRY (50+ entries)
- Domain filter, persona filter, launch importance filter
- Per-journey: step count, launch importance badge, status from customer_journey_status DB table
- Journey step drill-down: expand to see all steps with expected behavior
- Missing journey warnings: domains with < 2 journeys registered

### Step 5: Wire new routes in App.tsx
Add 2 lazy imports + 2 Route entries:
- JVC04ButtonCTAHealth → `/admin/verification/buttons`
- JVC06PageLoadIntegrity → `/admin/verification/page-load`

### Step 6: Add command palette entries
Add 2 new entries to AdminCommandPalette.tsx for the new pages.

---

## Files Changed

| File | Action |
|---|---|
| `src/pages/admin/verification/JVC04ButtonCTAHealth.tsx` | **New** — Button & CTA Health Board |
| `src/pages/admin/verification/JVC06PageLoadIntegrity.tsx` | **New** — Page Load Integrity Board |
| `src/pages/admin/verification/V02InteractionCoverageBoard.tsx` | **Edit** — expand with priority/class breakdown, uncovered P0s, probe cross-ref |
| `src/pages/admin/verification/V03P0JourneyBoard.tsx` | **Edit** — full journey manifest browser with filters, DB status, step drill-down |
| `src/App.tsx` | **Edit** — 2 lazy imports + 2 routes |
| `src/components/admin/AdminCommandPalette.tsx` | **Edit** — 2 nav entries |

## What Does NOT Change
- V01 SurfaceInventoryBoard — already complete with seed, search, filter
- JVC05 RedirectIntegrityMap — already has loop detection, dead ends
- JVC07 FormVerificationCenter — already has field tracking, persistence
- JVC08 ModalDrawerBoard — already has focus trap, zombie detection
- JVC09 KeyboardCommandBoard — already has conflicts, shortcuts
- JVC11 JourneyReplay — already has step replay, evidence
- JVC13 InteractionDriftRadar — already has 7 categories, resolution workflow
- LT04 RuntimeProbeCenter — already has live probes
- surface-registry.ts — already has full SurfaceEntry type with all required fields
- journey-registry.ts — already has 50+ journey definitions
- verification-hooks.ts — already has useVerificationSurfaces, useVerificationRuns, useSeedSurfaces

