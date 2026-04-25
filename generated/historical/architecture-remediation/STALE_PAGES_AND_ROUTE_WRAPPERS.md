# SITA OS — Stale Pages & Route Wrappers Inventory

## Known wrappers (16 — all documented and intentional)

These are thin re-export shims created during page-consolidation waves. They preserve deep-link compatibility while the canonical implementation lives under `src/admin/modules/<domain>/views/`.

| Shim path | Canonical target | Wave |
|---|---|---|
| `src/app/index.ts` | barrel | — |
| `src/pages/admin/cloud/AdminRBACConsole.tsx` | `src/admin/modules/trust-security/views/AdminRBACConsole.tsx` | A (this commit) |
| `src/pages/admin/verification/V01SurfaceInventoryBoard.tsx` | `src/admin/modules/verification/views/V01...` | P5/W1 |
| `src/pages/admin/verification/V02InteractionCoverageBoard.tsx` | `src/admin/modules/verification/views/V02...` | P5/W1 |
| `src/pages/admin/verification/V03P0JourneyBoard.tsx` | `src/admin/modules/verification/views/V03...` | P5/W1 |
| `src/pages/admin/verification/V04ModeVerificationBoard.tsx` | `src/admin/modules/verification/views/V04...` | P5/W1 |
| `src/pages/admin/verification/V06EvidenceExplorer.tsx` | `src/admin/modules/verification/views/V06...` | P5/W1 |
| `src/pages/admin/verification/V07LaunchBlockerBoard.tsx` | `src/admin/modules/verification/views/V07...` | P5/W1 |
| `src/pages/admin/GeneratedTruthDashboard.tsx` | `src/admin/modules/overview/views/GeneratedTruthDashboard.tsx` | P5/W2 |
| `src/pages/admin/LaunchHonestyBoard.tsx` | `src/admin/modules/verification/views/LaunchHonestyBoard.tsx` | P5/W2 |
| `src/pages/admin/LaunchReadinessBoard.tsx` | `src/admin/modules/releases/views/LaunchReadinessBoard.tsx` | P5/W2 |
| `src/pages/admin/TeamManagement.tsx` | `src/admin/modules/environments/views/TeamManagement.tsx` | P5/W2 |
| `src/pages/admin/UserManagement.tsx` | `src/admin/modules/environments/views/UserManagement.tsx` | P5/W2 |
| `src/pages/admin/modules/MCKnowledgeBase.tsx` | `src/admin/modules/config/views/MCKnowledgeBase.tsx` | P5/W2 |
| `src/pages/admin/modules/MCSupport.tsx` | `src/admin/modules/support/views/MCSupport.tsx` | P5/W2 |
| `src/pages/admin/reality-audit/LaunchHonestyBoard.tsx` | `src/admin/modules/verification/views/LaunchHonestyBoard.tsx` | P5/W2 |

## Detected orphans (135 — manual triage required)

Sample (15 of 135). Many are likely **false positives** mounted dynamically:

```
src/pages/AdminCenter.tsx            (likely admin entry mounted via plane registry)
src/pages/ConnectorHub.tsx
src/pages/EnterpriseMaturityDashboard.tsx
src/pages/GlobalBoardroom.tsx
src/pages/GovernanceDashboard.tsx
src/pages/IntegrationConcierge.tsx
src/pages/LandingPage.tsx            (likely root index target)
src/pages/LearnLaterPage.tsx
src/pages/NotFound.tsx               (404 fallback — definitely live)
src/pages/ObservabilityPage.tsx      (admin-themed, see plane violations)
src/pages/Onboarding.tsx
src/pages/OnboardingWrapper.tsx
src/pages/PermissionsCenter.tsx      (admin-themed)
src/pages/PolicyEditor.tsx           (admin-themed)
```

Full list in `route-truth-map.json` (`orphanedPages` field).

## Triage plan
1. For each detected orphan, grep nav/menu/command-palette files for the component name.
2. Confirmed dead → convert to redirect.
3. Confirmed live (dynamic mount) → add to detector allowlist.
4. Action deferred to a dedicated cleanup wave.
