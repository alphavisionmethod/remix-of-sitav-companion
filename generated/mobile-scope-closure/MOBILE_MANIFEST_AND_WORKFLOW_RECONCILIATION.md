# Mobile Manifest & Workflow Reconciliation

> Canonical record of how every mobile-related manifest, workflow, dependency, generated report, npm script, and validator was reconciled during the Mobile Native Scope Closure pass.
>
> **Decision:** Native iOS / Android = `ARCHIVED` / `FUTURE_VISION_ONLY`. Active deployment surfaces = Web SPA + Ubuntu-native + Electron desktop shell.
>
> **Strategy:** Contain, classify, and gate — never blind-delete. Every artifact is preserved under `archive/` so a future mobile program can be reactivated without archaeology, but **none of it participates in current deployment truth**.

---

## 1. Active-path → archive-path disposition table

| Original active path | Archive destination | Classification | Drift gate |
|---|---|---|---|
| `capacitor.config.ts` | `archive/capacitor/capacitor.config.ts` | `ARCHIVED` (banner header) | `check-mobile-native-out-of-scope-truth` |
| `infra/deploy/mobile.yaml` | `archive/infra/mobile.yaml` | `ARCHIVED` (banner header) | `check-mobile-manifest-archive-classification` |
| `mobile/android/AndroidManifest.permissions.xml` | `archive/mobile/android/AndroidManifest.permissions.xml` | `FUTURE_VISION_ONLY` | `check-mobile-native-out-of-scope-truth` |
| `mobile/android/FCM.md` | `archive/mobile/android/FCM.md` | `FUTURE_VISION_ONLY` | — |
| `mobile/android/SIGNING.md` | `archive/mobile/android/SIGNING.md` | `FUTURE_VISION_ONLY` | — |
| `mobile/android/TARGET_SDK_POLICY.md` | `archive/mobile/android/TARGET_SDK_POLICY.md` | `FUTURE_VISION_ONLY` | — |
| `mobile/ios/Info.plist.template` | `archive/mobile/ios/Info.plist.template` | `FUTURE_VISION_ONLY` | — |
| `mobile/ios/PrivacyInfo.xcprivacy` | `archive/mobile/ios/PrivacyInfo.xcprivacy` | `FUTURE_VISION_ONLY` | — |
| `mobile/ios/SIGNING.md` | `archive/mobile/ios/SIGNING.md` | `FUTURE_VISION_ONLY` | — |
| `mobile/icons/android/*` | `archive/mobile/icons/android/*` | `FUTURE_VISION_ONLY` | — |
| `mobile/icons/ios/*` | `archive/mobile/icons/ios/*` | `FUTURE_VISION_ONLY` | — |
| `mobile/store-metadata/android.json` | `archive/mobile/store-metadata/android.json` | `FUTURE_VISION_ONLY` | — |
| `mobile/store-metadata/android.data-safety.json` | `archive/mobile/store-metadata/android.data-safety.json` | `FUTURE_VISION_ONLY` | — |
| `mobile/store-metadata/ios.json` | `archive/mobile/store-metadata/ios.json` | `FUTURE_VISION_ONLY` | — |
| `mobile/store-metadata/ios.screenshots.json` | `archive/mobile/store-metadata/ios.screenshots.json` | `FUTURE_VISION_ONLY` | — |

The archived `mobile/` tree is preserved verbatim and gated by `archive/mobile/ARCHIVED.md`, which states: *"These assets are preserved for a possible future mobile-native reactivation. They are NOT part of the current deployment surface set. See `generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md` for the conditions under which they could re-enter active scope."*

---

## 2. Dependency reconciliation

The following 8 `@capacitor/*` runtime dependencies were **removed** from `package.json` (verified absent — no `import "@capacitor/*"` exists anywhere in `src/`):

- `@capacitor/android`
- `@capacitor/app`
- `@capacitor/core`
- `@capacitor/device`
- `@capacitor/haptics`
- `@capacitor/ios`
- `@capacitor/keyboard`
- `@capacitor/status-bar`

**Drift gate:** `check-mobile-native-out-of-scope-truth.ts` re-fails if any `@capacitor/*` reappears in `package.json` `dependencies` or `devDependencies`.

---

## 3. Generated report reconciliation

16 stale `generated/mobile-*.json` and related machine-readable reports were moved out of the active `generated/` root into `archive/generated/mobile/`:

- `generated/android-native-generation-report.json`
- `generated/android-release-path-report.json`
- `generated/capacitor-mobile-truth-report.json`
- `generated/final-mobile-truth-report.json`
- `generated/ios-native-generation-report.json`
- `generated/ios-release-path-report.json`
- `generated/mobile-bootstrap-contract-report.json`
- `generated/mobile-build-model-consistency-report.json`
- `generated/mobile-build-pipeline-report.json`
- `generated/mobile-canonical-stack-report.json`
- `generated/mobile-capability-truth-report.json` (+ `mobile-capability-truth.json`)
- `generated/mobile-env-strategy-consistency-report.json`
- `generated/mobile-identity-source-of-truth-report.json`
- `generated/mobile-project-identification-report.json`
- `generated/mobile-push-claim-safety-report.json`
- `generated/mobile-store-readiness-report.json`
- `generated/mobile-submission-blockers-report.json`
- `generated/native-project-generation-contract-report.json`
- `generated/no-flutter-mobile-truth-drift-report.json`
- `generated/no-flutter-stack-drift-report.json`
- `generated/mobile-deployment-closure/**` (entire directory)
- `generated/mobile-identity-reconciliation/**` (entire directory)

The **only** machine-readable mobile truth that participates in active governance now lives under `generated/mobile-scope-closure/`:

- `mobile-scope-status.json`
- `install-surface-honesty-status.json`
- `mobile-manifest-status.json`
- `mobile-scope-verification.json`

Plus the 5 sibling gate-report outputs at `generated/` root (allowlisted, not drift):

- `mobile-native-out-of-scope-truth-report.json`
- `no-active-native-mobile-claims-report.json`
- `install-page-mobile-honesty-report.json`
- `mobile-manifest-archive-classification-report.json`
- `generated-mobile-truth-consistency-report.json`

**Drift gate:** `check-generated-mobile-truth-consistency.ts` and `emit-mobile-scope-artifacts.ts` both fail if any new `mobile-*.json` / `capacitor-*.json` / `android-*.json` / `ios-*.json` / `no-flutter-*.json` / `native-project-*.json` / `final-mobile-*.json` appears at `generated/` root outside the allowlist.

---

## 4. npm script reconciliation

16 stale mobile-build / mobile-truth scripts were retired from `package.json`. Replaced by the canonical pair:

| New script | Purpose |
|---|---|
| `mobile:scope:emit` | Runs `scripts/validation/emit-mobile-scope-artifacts.ts` to refresh the 4 canonical JSON artifacts + `MOBILE_SCOPE_FINAL_VERIFICATION.md` |
| `mobile:scope:run-all` | Runs all 5 BLOCK validators in sequence: `check-mobile-native-out-of-scope-truth` → `check-no-active-native-mobile-claims` → `check-install-page-mobile-honesty` → `check-mobile-manifest-archive-classification` → `check-generated-mobile-truth-consistency` |

Retired scripts (no longer in `package.json`): `mobile:bootstrap:android`, `mobile:bootstrap:ios`, `mobile:identity:run-all`, `mobile:closure:run-all`, `mobile:run-all`, `mobile:capability:check`, `mobile:push:check`, `mobile:store:check`, `mobile:submission:check`, `mobile:env:check`, `mobile:build:check`, `mobile:canonical-stack:check`, `mobile:identity:check`, `mobile:project-id:check`, `mobile:flutter-drift:check`, `mobile:final-truth:check`.

---

## 5. Validator reconciliation

The legacy mobile / Capacitor / iOS / Android / Flutter validators were moved out of active rotation into `archive/scripts/`:

- `check-android-native-generation.ts`
- `check-android-release-path.ts`
- `check-capacitor-mobile-truth.ts`
- `check-ios-native-generation.ts`
- `check-ios-release-path.ts`
- `check-mobile-bootstrap-contract.ts`
- `check-mobile-build-model-consistency.ts`
- `check-mobile-canonical-stack.ts`
- `check-mobile-env-strategy-consistency.ts`
- `check-mobile-identity-source-of-truth.ts`
- `check-mobile-project-identification.ts`
- `check-mobile-push-claim-safety.ts`
- `check-mobile-submission-blockers.ts`
- `check-native-project-generation-contract.ts`
- `check-no-flutter-mobile-truth-drift.ts`
- `check-no-flutter-stack-drift.ts`

Replaced by 5 new BLOCK-level validators in `scripts/validation/`:

| Validator | Asserts |
|---|---|
| `check-mobile-native-out-of-scope-truth.ts` | `capacitor.config.ts` is not at repo root; no `@capacitor/*` deps in `package.json`; archive copies present with ARCHIVED banners |
| `check-no-active-native-mobile-claims.ts` | No "store-ready" / "App Store submission ready" / "Play Store submission ready" phrases in active docs/UI outside `archive/` |
| `check-install-page-mobile-honesty.ts` | `DownloadPage.tsx`, `DownloadsCenter.tsx`, `ExternalInstallerPage.tsx` all render `MobileHonestyNotice` or link to `docs/MOBILE_HONESTY.md` |
| `check-mobile-manifest-archive-classification.ts` | No `infra/deploy/mobile.yaml` at active path; `archive/infra/mobile.yaml` present with ARCHIVED banner |
| `check-generated-mobile-truth-consistency.ts` | No stray `mobile-*.json` / `capacitor-*.json` / `android-*.json` / `ios-*.json` / `no-flutter-*.json` / `native-project-*.json` / `final-mobile-*.json` at `generated/` root outside the 5-name gate-report allowlist; all 4 canonical artifacts in `generated/mobile-scope-closure/` exist |

All 5 are wired into `scripts/architecture/checks/check-os-release-readiness.ts` BLOCK list.

---

## 6. UI surface reconciliation

| Surface | Reconciliation |
|---|---|
| `src/pages/DownloadPage.tsx` | Renders `<MobileHonestyNotice />` (links to `/docs/MOBILE_HONESTY.md`) |
| `src/pages/DownloadsCenter.tsx` | Renders `<MobileHonestyNotice />` |
| `src/pages/app-platform/ExternalInstallerPage.tsx` | Renders `<MobileHonestyNotice />` |
| `src/pages/admin/ai-runtime/AIRuntimeHome.tsx` | New "Mobile Scope Truth" tab renders `<MobileScopeTruthPanel />` reading live `mobile-scope-verification.json` |

No new operator-facing pages were introduced. The `MobileScopeTruthPanel` reuses the existing tabbed-panel pattern from `ConnectorTruthSummaryPanel` — no design-system drift.

---

## 7. Documentation reconciliation

| Doc | Change |
|---|---|
| `docs/MOBILE_HONESTY.md` | **NEW** — canonical single source of truth: native mobile is archived, web/Ubuntu/Electron are live |
| `docs/PLATFORM_SCOPE.md` | Corrected false claim "Deleted `capacitor.config.ts` + 12 `@capacitor/*` deps" → accurate "Archived to `archive/capacitor/` and `archive/mobile/`; 8 deps removed from `package.json`" |
| `src/planes/MOBILE_MANIFEST.md` | Marked secondary; identity/closure tracks deferred until reactivation |
| `archive/mobile/ARCHIVED.md` | **NEW** — explains containment policy and pointer back to `MOBILE_REACTIVATION_CONDITIONS.md` |

---

## 8. Reconciliation outcome

| Outcome | Status |
|---|---|
| Zero `@capacitor/*` deps in active `package.json` | ✅ |
| Zero `capacitor.config.ts` at repo root | ✅ |
| Zero `infra/deploy/mobile.yaml` at active path | ✅ |
| Zero `mobile/` directory at repo root | ✅ |
| Zero stray `mobile-*.json` outside `generated/mobile-scope-closure/` (excluding 5-name allowlist) | ✅ |
| All install surfaces link to `MOBILE_HONESTY.md` | ✅ |
| All 5 BLOCK validators GREEN | ✅ |
| All 4 canonical JSON artifacts emitted | ✅ |
| All 6 canonical markdown deliverables present | ✅ |
| Reactivation path documented | ✅ |

After this reconciliation, the repository contains **one and only one** mobile-truth model: native mobile is archived / future-vision-only, contained under `archive/`, and gated by 5 BLOCK validators that prevent drift back into active scope.
