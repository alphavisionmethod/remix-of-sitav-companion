# SITA OS — Directory Organization

## Canonical Directory Model

New code should be created under the canonical paths below.
Existing code remains in legacy paths and is re-exported via barrel `index.ts` files.

## Where Should I Put X?

| What you're building | Canonical path |
|---------------------|---------------|
| User-facing feature component | `src/features/<domain>/` |
| Admin module component | `src/admin/modules/<domain>/` |
| Admin shell/navigation | `src/admin/shell/` |
| Platform logic (auth, proof, governance) | `src/platform/<concern>/` |
| Runtime-specific code (shell, desktop, mobile) | `src/runtimes/<runtime>/` |
| Contract types / schemas | `src/contracts/` (via `src/packages/contracts/`) |
| Data access / repositories | `src/data/` (via `src/lib/data-services/`) |
| Generic reusable UI components | `src/components/ui/` or `src/components/shared/` |
| React context providers | `src/contexts/` |
| Generic hooks | `src/hooks/` |
| Domain-specific hooks | `src/features/<domain>/hooks/` |
| App bootstrapping | `src/app/` |

## Feature Domains

| Domain | Canonical Path | Legacy Paths |
|--------|---------------|-------------|
| Advisors | `src/features/advisors/` | `src/components/advisors/` |
| Auth | `src/features/auth/` | `src/components/auth/` |
| Boardroom | `src/features/boardroom/` | `src/components/sita/apps/boardroom/` |
| Business | `src/features/business/` | `src/components/business/` |
| Concierge | `src/features/concierge/` | `src/components/concierge/` |
| Files | `src/features/files/` | `src/components/files/` |
| Money | `src/features/money/` | `src/components/money/`, `src/components/finance/` |
| Intelligence | `src/features/intelligence/` | `src/components/intelligence/` |
| Investment Office | `src/features/investment-office/` | `src/components/investment/` |
| Notifications | `src/features/notifications/` | `src/components/notifications/` |
| Revenue Office | `src/features/revenue-office/` | `src/components/revenue-office/` |
| Onboarding | `src/features/onboarding/` | `src/components/sita/onboarding/` |
| Mobile | `src/features/mobile/` | `src/components/mobile/` |
| Settings | `src/features/settings/` | `src/pages/settings/` |

## Admin Modules

| Module | Canonical Path | Legacy Paths |
|--------|---------------|-------------|
| AI | `src/admin/modules/ai/` | `src/components/admin-ai/` |
| Architecture | `src/admin/modules/architecture/` | `src/components/admin/architecture/` |
| Cloud | `src/admin/modules/cloud/` | `src/pages/admin/Cloud*` |
| Security | `src/admin/modules/security/` | `src/pages/admin/SEC*` |
| Verification | `src/admin/modules/verification/` | `src/pages/admin/ITC*`, `src/pages/admin/V*` |
| Shell | `src/admin/shell/` | `src/components/admin/shells/` |

## Migration Status

All mappings are currently **barrel-only** (re-export layer).
Physical file migration will be done incrementally per module.

See `src/lib/architecture/directory-organization-map.ts` for the programmatic authority.
