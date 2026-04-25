# Wave 6 — Root-Level Single-File Page Reclassification

**Date:** 2026-04-25
**Status:** ✅ Complete
**Build:** `tsc --noEmit` 0 errors

## Goal

Eliminate root-level single-file pages (`src/pages/*.tsx`) by reclassifying
each into its canonical platform/pillar home, replacing the original with a
thin re-export adapter so all routes and lazy imports remain stable.

## Outcome

- **96 page bodies relocated** out of 97 candidates
- **96 thin adapters** generated at the original `src/pages/<File>.tsx` paths
- **1 intentional retention**: `src/pages/NotFound.tsx` (router 404 fallback)
- **0 collisions**, **0 TypeScript errors** after fix-ups
- `src/platform/` file count: **472 → 556**
- 9 pillar relocations (5 → business, 3 → concierge, 4 → finance) + 87 platform relocations

## Distribution by destination

| Destination | Count |
|---|---|
| `platform/workspace/pages` | 15 |
| `platform/ai/pages` | 9 |
| `platform/notifications/pages` | 8 |
| `platform/observability/pages` | 7 |
| `platform/trust/pages` | 7 |
| `platform/setup/pages` | 6 |
| `platform/app-platform/pages` | 5 |
| `modules/business/pages` | 5 |
| `platform/files/pages` | 4 |
| `modules/finance/pages` | 4 |
| `platform/settings/pages` | 4 |
| `platform/boardroom/pages` | 3 |
| `platform/owner/pages` | 3 |
| `modules/concierge/pages` | 3 |
| `platform/personal-brain/pages` | 3 |
| `platform/orchestration/pages` | 3 |
| `platform/integration/pages` | 2 |
| `platform/governance/pages` | 1 |
| `platform/enterprise/pages` | 1 |
| `platform/search/pages` | 1 |
| `platform/marketing/pages` | 1 |
| `platform/support/pages` | 1 |

## Key reclassification rationale

- **Productivity surfaces** (Calendar, Docs, Sheets, Notes, PDF, People, Reporting, Team, Planning, Productivity, Print/Scan, Clipboard, Command, Desktop) → `platform/workspace/pages/`
- **AI / autonomy / simulation** (AIEconomics, AIWorkforce, AgentActivity, OutcomeEngine, OpportunityEngine, DigitalTwins, Simulation, ScenarioLab, LifeSimulator) → `platform/ai/pages/`
- **Trust / approvals / policy** → `platform/trust/pages/` (8 files including Policy/Permissions surfaces)
- **Notifications / activity / inbox / pulse** → `platform/notifications/pages/`
- **Observability / status / replay / time machine** → `platform/observability/pages/`
- **Setup / onboarding / personalization / first-boot** → `platform/setup/pages/`
- **Customer/Revenue/Recovered Value** (business pillar) → `modules/business/pages/`
- **Money/Wealth/Capital Allocation** (finance pillar) → `modules/finance/pages/`
- **PersonalLife/LifeDashboard/Concierge** → `modules/concierge/pages/`

## Adapter pattern

```typescript
// Wave 6 — legacy path re-exports the canonical implementation.
// Moved to @/platform/marketing/pages/LandingPage
export { default } from "@/platform/marketing/pages/LandingPage";
export * from "@/platform/marketing/pages/LandingPage";
```

## Fix-ups required

Two pages used relative `./files/...` and `./workspace/...` imports that
broke when moved. These were migrated in Wave 5; updated to absolute aliases:

- `platform/files/pages/FilesCenter.tsx` — 9 sibling imports → `@/platform/files/pages/*`
- `platform/workspace/pages/ProductivityHub.tsx` — 3 lazy imports → `@/platform/workspace/pages/*`

## Verification

- `tsc --noEmit` → **0 errors**
- All 96 adapters use canonical absolute aliases
- `NotFound.tsx` correctly retained at root for the router fallback

## Next wave

**Wave 7**: Now that pages are canonical, scan `src/components/` for pillar-specific or platform-specific components miscategorized as shared, and relocate them to their owners (`src/modules/<pillar>/components/` or `src/platform/<system>/components/`).