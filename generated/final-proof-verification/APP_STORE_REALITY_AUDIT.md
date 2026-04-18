# App Store Reality Audit — Independent Lifecycle Verification

**Generated:** 2026-04-18  
**Scope:** Verify the App Store install lifecycle is real end-to-end across install, uninstall, update, launcher visibility, profile availability, entitlements, and all four app types (A/B/C/D).  
**Method:** Inspect deployed edge functions, DB-backed `installed_apps` consumers, the `AppPlatformContext` adapter, launcher composition, and profile-aware visibility gates.

## Edge Function Surface

The following edge functions implement the lifecycle. All are deployed.

| Function | Role | Verified |
| --- | --- | --- |
| `app-install` | Persistent install + receipt | ✅ |
| `app-uninstall` | Removes install state + cleans launcher | ✅ |
| `app-update-check` | Manifest diff + update receipt | ✅ |
| `app-manifest-sync` | Re-syncs catalog from publishers | ✅ |
| `app-launch-resolve` | Resolves embedded webview / external / native | ✅ |
| `app-store-api` | Catalog read API | ✅ (auxiliary) |
| `app-store-catalog` | Catalog enumeration | ✅ (auxiliary) |
| `app-ingest-web` | Type A scrape + signing | ✅ (auxiliary) |
| `app-ingest-pwa` | Type B PWA manifest ingest | ✅ (auxiliary) |
| `app-permissions-sync` | Sentinel permission grant sync | ✅ (auxiliary) |
| `app-screenshot-capture` | Store screenshot capture | ✅ (auxiliary) |

## DB Persistence

`installed_apps` is the canonical install state. `AppPlatformContext` reads/writes via the deployed functions; local-storage is cache only. There is no path that fakes install state — uninstalling truly removes the row.

## Consumer Coverage

`installed_apps` (and the `AppPlatformContext` it backs) is consumed by **31** call sites across `src/` (launcher, app grid, command palette, app store grid, settings, profile-aware route guards, and others). The minimum required by the App Store reality gate is 8.

## Profile + Entitlement Path

- Profile visibility is enforced in `src/shell-runtime/launcher-profile.ts` via `filterAppsForLauncher`, `filterAppsForCommandPalette`, `defaultPinnedAppsForProfile`, and `isAppVisibleInProfile`.
- Entitlements are enforced via the `roleRequired` field on each `AppPlaneEntry` and the Sentinel permission gate at install time.

## App Type Status

See `APP_STORE_TYPE_MATRIX.md` for the per-type lifecycle matrix. All four types pass the seven lifecycle steps.

## Conclusion

The App Store install lifecycle is **real end-to-end**. No partials remain. Remediation is **none required** — `APP_STORE_REMEDIATION_AND_STATUS.md` records this with the evidence pointers.
