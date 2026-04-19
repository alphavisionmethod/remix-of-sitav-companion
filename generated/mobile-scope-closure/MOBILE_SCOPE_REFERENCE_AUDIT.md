# Mobile Scope — Reference Audit

> Generated: 2026-04-19 · Owner: Platform Distribution
> Companion to `MOBILE_SCOPE_CANONICAL_MODEL.md` and `docs/MOBILE_HONESTY.md`.

## Purpose

Inventory every mobile-native reference in the repo and classify it as:

- `safe-archived` — reference is correctly contained under `archive/`
- `contradiction` — reference implies active mobile scope; must be rewritten or moved
- `must-rewrite` — reference is launch-facing and ambiguous
- `must-gate` — reference must be hidden behind a `MOBILE_HONESTY` link or guard

## Classification matrix

| Surface | Path | Pre-closure state | Action | Post-closure state |
|---|---|---|---|---|
| Capacitor config | `capacitor.config.ts` | Active root file | Move to `archive/capacitor/` with banner | `safe-archived` |
| Mobile deploy manifest | `infra/deploy/mobile.yaml` | Active manifest | Move to `archive/infra/mobile.yaml` with banner | `safe-archived` |
| Mobile platform tree | `mobile/` (android/, ios/, store-metadata/, icons/) | Active directory | Move to `archive/mobile/` with `ARCHIVED.md` | `safe-archived` |
| Capacitor deps | `package.json` (8 `@capacitor/*` entries) | Installed but unused | Removed (no `import "@capacitor/*"` in `src/`) | `removed` |
| Mobile npm scripts | `mobile:closure:run-all`, `mobile:identity:run-all`, `mobile:run-all` | Active | Replaced by single `mobile:scope:run-all` | `replaced` |
| Stale generated reports | `generated/mobile-*.json` (16 files) | Active machine-readable truth | Move to `archive/generated/mobile/` | `safe-archived` |
| Stale validators | `scripts/validation/check-mobile-*.ts`, `check-capacitor-*.ts` | Active | Move to `archive/scripts/` | `safe-archived` |
| `docs/PLATFORM_SCOPE.md` | False claim "Deleted capacitor.config.ts + 12 deps" | Contradiction with files on disk | Rewrite to "Archived to `archive/capacitor/` and `archive/mobile/` on 2026-04-19" | `must-rewrite` → reconciled |
| `src/planes/MOBILE_MANIFEST.md` | Declares Capacitor canonical, store-ready language | Contradiction | Out of scope for this pass; gated by new validators (drift fails CI if it returns to active surface claims) | `must-gate` |
| `archive/mobile-platform-native/native/*` | Already archived | OK | Keep — already contained | `safe-archived` |
| `/install` (`DownloadPage.tsx`) | No mobile honesty link | Implicit ambiguity | Add `<MobileHonestyNotice>` linking to `docs/MOBILE_HONESTY.md` | `must-gate` → resolved |
| `/downloads` (`DownloadsCenter.tsx`) | No mobile honesty link | Implicit ambiguity | Add `<MobileHonestyNotice>` | `must-gate` → resolved |
| External Installer (`ExternalInstallerPage.tsx`) | No mobile honesty link | Implicit ambiguity | Add `<MobileHonestyNotice>` | `must-gate` → resolved |
| Admin AI Engineer hub | No mobile-truth surface | Missing operator signal | Add `MobileScopeTruthPanel` tab | `resolved` |
| Mobile-responsive web | All `src/components/mobile/*`, breakpoints, PWA | Correct (responsive web ≠ native app) | Keep — explicitly preserved | `safe` |

## Headcount

- **9** items moved/archived
- **3** install surfaces gated with `MobileHonestyNotice`
- **1** new operator panel
- **5** new validators preventing drift
- **0** functional regressions to web responsiveness or PWA

## Verification

After this pass, `npm run mobile:scope:run-all` exits 0. The 5 BLOCK gates wired into `check-os-release-readiness.ts` enforce that:

- `capacitor.config.ts` cannot reappear at repo root
- `@capacitor/*` deps cannot be reintroduced
- `infra/deploy/mobile.yaml` cannot reappear at active path
- Install surfaces must continue linking to `MOBILE_HONESTY.md`
- No new `generated/mobile-*.json` may appear outside `mobile-scope-closure/`
