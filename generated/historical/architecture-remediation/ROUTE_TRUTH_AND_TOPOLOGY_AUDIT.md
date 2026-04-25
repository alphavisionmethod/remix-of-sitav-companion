# SITA OS — Route Truth & Topology Audit (Phase B1 Evidence)

> **Generated:** 2026-04-18 · **Source:** `route-truth-map.json`

## TL;DR

- **491 declared `<Route>` entries** across all route registries.
- **1,047 page files** on disk (`src/pages/**` + `src/app/**`).
- **135 orphaned pages** — no route reference and no lazy-import reference detected.
- **7 wrapper pages** — files <500 chars containing only re-exports.

## Numbers in context

| Metric | Value | Implication |
|---|---:|---|
| Pages on disk | 1,047 | Matches prior 1,042 audit (+5 new module relocations) |
| Routed pages | ~ 912 | Healthy coverage |
| Orphaned pages | 135 | Candidates for redirect or archive |
| Route wrappers | 7 | Acceptable — all from documented page-migration shims |
| Total `<Route>` declarations | 491 | Consistent with manifest |

## Orphaned page sample (15 of 135)

These pages exist on disk but are not referenced by any route file or lazy import:

```
src/app/index.ts
src/pages/AdminCenter.tsx
src/pages/ConnectorHub.tsx
src/pages/EnterpriseMaturityDashboard.tsx
src/pages/GlobalBoardroom.tsx
src/pages/GovernanceDashboard.tsx
src/pages/IntegrationConcierge.tsx
src/pages/LandingPage.tsx
src/pages/LearnLaterPage.tsx
src/pages/NotFound.tsx
src/pages/ObservabilityPage.tsx
src/pages/Onboarding.tsx
src/pages/OnboardingWrapper.tsx
src/pages/PermissionsCenter.tsx
src/pages/PolicyEditor.tsx
```

**Caveats:**
- `NotFound.tsx`, `LandingPage.tsx`, `Onboarding.tsx`, `OnboardingWrapper.tsx` are **probably referenced via dynamic mount** — not true orphans. The detector requires explicit alias-based imports.
- `src/app/index.ts` is a barrel — not a page.
- `ObservabilityPage`, `PermissionsCenter`, `PolicyEditor` overlap with the plane-violation list — likely admin pages misplaced in user plane.

The detector likely produces ~30% false positives (dynamic mounts, barrel re-exports). True orphan estimate: **~95 pages** worth a manual triage pass.

## Route wrappers (7)

```
src/app/index.ts                                                  (barrel, OK)
src/pages/admin/cloud/AdminRBACConsole.tsx                        (Phase A shim, OK)
src/pages/admin/verification/V02InteractionCoverageBoard.tsx      (Wave 1 shim, OK)
src/pages/admin/verification/V03P0JourneyBoard.tsx                (Wave 1 shim, OK)
src/pages/admin/verification/V04ModeVerificationBoard.tsx         (Wave 1 shim, OK)
src/pages/admin/verification/V06EvidenceExplorer.tsx              (Wave 1 shim, OK)
src/pages/admin/verification/V07LaunchBlockerBoard.tsx            (Wave 1 shim, OK)
```

All wrappers are **documented and intentional** from prior page-consolidation waves. None require action.

## Recommended actions (B3-scoped)

1. Add `check-route-truth.ts` and `check-dead-pages.ts` (Phase B2) at warn-level.
2. Triage orphaned page list manually in a future wave — convert true orphans to redirects via existing `admin-redirect-map.ts` / `user-redirect-map.ts`.
3. Document the 7 known wrappers explicitly so the wrapper-usage check ignores them.
4. Do **not** delete pages in this wave — every orphaned page may have an undetected dynamic mount.
