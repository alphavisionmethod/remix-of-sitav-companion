# User Domain Surface Consolidation
> Generated: 2026-04-18T11:38:28.102Z
> Source: `scripts/architecture/audits/emit-consolidation-docs.ts`
> Status: Phase 4 baseline — every user domain has a canonical shell owner.

## Canonical shells per user domain

| Domain | Shell page | Routes | Strategy |
|---|---|---:|---|
| **Business** | `src/pages/BusinessCenter.tsx` | 46 (single composite shell) | Already consolidated. Every `/business/*` route renders `BusinessCenter` and switches view via path. Phase 4 ✅ |
| **Money** | `src/pages/MoneyCenter.tsx` | 37 (single composite shell) | Already consolidated. `/money/*` paths render `MoneyCenter`. Phase 4 ✅ |
| **Concierge** | `src/pages/ConciergeCenter.tsx` | 20 (single composite shell) | Already consolidated. `/concierge/*` paths render `ConciergeCenter`. Phase 4 ✅ |
| **Investment Office** | `src/features/investment-office/pages/InvestmentShellPage.tsx` (Phase 4 scaffold) | 18 canonical + 100+ experimental | Shell scaffold added. Detail pages remain mounted under `/investment/*`; experimental `/investments/*` paths redirect to canonical. |
| **Files** | `src/pages/FilesCenter.tsx` | served by `getFilesRoutes()` | Composite shell; no Phase 4 changes. |
| **Boardroom** | `src/pages/Boardroom.tsx` | served by `getBoardroomRoutes()` | Composite shell; no Phase 4 changes. |
| **Communications** | `src/pages/CommunicationsPage.tsx` | served by `getCommunicationsRoutes()` | Composite shell; no Phase 4 changes. |
| **Apps** | `src/pages/AppStoreCenter.tsx` | served by `getAppsRoutes()` | Composite shell. |
| **Settings** | served by `getSettingsRoutes()` | Composite shell. |

## Why this looks "easy"

The user product plane was consolidated incrementally during the
Phase 24 work — most domains already follow the canonical shell
pattern (one page composes many child views). Phase 4 of the page
consolidation effort therefore only had to:

1. Add the `InvestmentShellPage` scaffold so the canonical owner is
   explicit (Investment Office had been mounted as 100+ flat routes
   under `experimental-routes.tsx`).
2. Wire `/investments/*` legacy plural URLs through the
   `USER_REDIRECTS` map (Phase 2).

All other domains already conformed.

## What is NOT in scope here

- ❌ No physical move of the 100+ Investment Office pages. They
  remain at `src/pages/investment-office/*` and continue to be
  mounted by `investment-routes.tsx` / `experimental-routes.tsx`.
- ❌ No deletion of any user-domain page.
- ❌ No collapse of the canonical `/business/crm-*` deep links —
  they stay first-class deep-linkable URLs.
