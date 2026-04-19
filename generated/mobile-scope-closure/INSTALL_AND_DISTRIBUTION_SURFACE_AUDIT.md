# Install & Distribution Surface Audit

> Generated: 2026-04-19

## Surfaces inspected

| Surface | Route | File | Mentions native mobile? | Honesty link added? |
|---|---|---|---|---|
| Download SITA OS | `/download` | `src/pages/DownloadPage.tsx` | No (Ubuntu ISO only) | ✅ `<MobileHonestyNotice>` added |
| Downloads Center | `/downloads-center` (legacy) | `src/pages/DownloadsCenter.tsx` | No (proof bundles, exports) | ✅ `<MobileHonestyNotice>` added |
| External Installer | `/app-store/external-installer` | `src/pages/app-platform/ExternalInstallerPage.tsx` | No (.deb/.AppImage/etc.) | ✅ `<MobileHonestyNotice>` added |
| App Store catalog | `/app-store` | `src/pages/AppStorePage.tsx` | No (web-app catalog) | Out of scope (no install action) |
| `/install` route | covered by `DownloadPage` | — | — | — |

## Rationale

These three surfaces are the only entry points where a user might reasonably wonder "is there a SITA OS app for my phone?" Adding a small `<MobileHonestyNotice>` link/banner that points to `docs/MOBILE_HONESTY.md`:

1. Resolves the implicit ambiguity without adding friction to the primary download flow.
2. Reuses the existing `Alert` component — no new design system surface.
3. Is enforced by `check-install-page-mobile-honesty.ts`, so removing the link fails CI.

## Out of scope

- Marketing/landing pages — separate audit scope.
- `src/pages/mobile/*` and `src/components/mobile/*` — these are the **responsive web** surfaces, not native-app surfaces. They remain active.
- PWA (`public/sw.js`, manifest) — installable web app on supported browsers; explicitly preserved.
