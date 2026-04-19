# SITA OS — Mobile Deployment Verification (Reality-Aligned)

**Status:** 🟢 Verified against filesystem · 2026-04-19
**Classification:** `ARCHIVED` / `FUTURE_VISION_ONLY` / `NOT_LAUNCH_SURFACE`
**Canonical doc:** `docs/MOBILE_HONESTY.md`

---

## Reality Check — Where the Files Actually Live

The previous version of this document referenced active paths (`capacitor.config.ts`, `infra/deploy/mobile.yaml`, `mobile/`) that **do not exist** at active paths — by design. SITA OS native mobile is **archived**, not active. All native-mobile assets are preserved under `archive/` for safe future reactivation, and validation gates BLOCK any return to active paths.

This document now maps every claimed asset to its **real, on-disk location**.

---

## ✅ Verified File Inventory (all under `archive/`)

| Asset | Real Path | Exists |
|---|---|---|
| Capacitor config | `archive/capacitor/capacitor.config.ts` | ✅ |
| Mobile deploy manifest | `archive/infra/mobile.yaml` | ✅ |
| Archive index | `archive/mobile/ARCHIVED.md` | ✅ |
| Android signing notes | `archive/mobile/android/SIGNING.md` | ✅ |
| Android FCM notes | `archive/mobile/android/FCM.md` | ✅ |
| Android manifest perms | `archive/mobile/android/AndroidManifest.permissions.xml` | ✅ |
| Android target SDK policy | `archive/mobile/android/TARGET_SDK_POLICY.md` | ✅ |
| Android native templates | `archive/android-templates/` (README + `app/`) | ✅ |
| iOS signing notes | `archive/mobile/ios/SIGNING.md` | ✅ |
| iOS Info.plist template | `archive/mobile/ios/Info.plist.template` | ✅ |
| iOS privacy manifest | `archive/mobile/ios/PrivacyInfo.xcprivacy` | ✅ |
| Play Store metadata | `archive/mobile/store-metadata/android.json` | ✅ |
| Play data-safety form | `archive/mobile/store-metadata/android.data-safety.json` | ✅ |
| App Store metadata | `archive/mobile/store-metadata/ios.json` | ✅ |
| App Store screenshot matrix | `archive/mobile/store-metadata/ios.screenshots.json` | ✅ |
| Mobile icons (source) | `archive/mobile/icons/` | ✅ |
| Archived build report | `archive/generated/mobile-build-pipeline-report.json` | ✅ |
| Archived gate report | `archive/generated/mobile/mobile-build-pipeline-report.json` | ✅ |

---

## ✅ Mobile-Scope Closure Evidence (active, in-tree)

| Document | Path |
|---|---|
| Canonical honesty doc | `docs/MOBILE_HONESTY.md` |
| Scope canonical model | `generated/mobile-scope-closure/MOBILE_SCOPE_CANONICAL_MODEL.md` |
| Reference audit | `generated/mobile-scope-closure/MOBILE_SCOPE_REFERENCE_AUDIT.md` |
| Final verification | `generated/mobile-scope-closure/MOBILE_SCOPE_FINAL_VERIFICATION.md` |
| Reactivation checklist | `generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md` |
| Manifest reconciliation | `generated/mobile-scope-closure/MOBILE_MANIFEST_AND_WORKFLOW_RECONCILIATION.md` |
| Install/distribution audit | `generated/mobile-scope-closure/INSTALL_AND_DISTRIBUTION_SURFACE_AUDIT.md` |
| Scope status (machine-readable) | `generated/mobile-scope-closure/mobile-scope-status.json` |
| Scope verification (JSON) | `generated/mobile-scope-closure/mobile-scope-verification.json` |
| Manifest status | `generated/mobile-scope-closure/mobile-manifest-status.json` |
| Install-surface honesty | `generated/mobile-scope-closure/install-surface-honesty-status.json` |
| Stack-truth status (mirror) | `public/generated/mobile-identity-reconciliation/mobile-stack-truth-status.json` |

---

## 🛡️ Drift-Protection Validators (active, BLOCK-class)

These BLOCK CI if any archived mobile asset reappears at an active path:

| # | Validator | Purpose |
|---|---|---|
| 1 | `scripts/validation/check-mobile-native-out-of-scope-truth.ts` | Fails if `capacitor.config.ts` or `@capacitor/*` deps return to active paths |
| 2 | `scripts/validation/check-no-active-native-mobile-claims.ts` | Fails if forbidden phrases ("store-ready", "App Store submission ready") appear outside `archive/` |
| 3 | `scripts/validation/check-install-page-mobile-honesty.ts` | Fails if install surfaces stop linking `docs/MOBILE_HONESTY.md` |
| 4 | `scripts/validation/check-mobile-manifest-archive-classification.ts` | Fails if `infra/deploy/mobile.yaml` reappears at the active path |
| 5 | `scripts/validation/check-generated-mobile-truth-consistency.ts` | Fails if any `generated/mobile-*.json` appears outside `generated/mobile-scope-closure/` |

Aggregator: `scripts/architecture/checks/check-mobile-deferral-attestation.ts` (Gate #12 in master release readiness).

---

## 🚦 Deployment Posture

| Surface | Status |
|---|---|
| Web SPA | ✅ Active launch surface |
| Ubuntu-native ISO | ✅ Active launch surface |
| Electron desktop | ✅ Active launch surface |
| PWA on mobile browser | ✅ Active (responsive web) |
| Native iOS app | ⛔ Archived — not in current scope |
| Native Android app | ⛔ Archived — not in current scope |
| App Store / Play Store | ⛔ Not published |
| APNs / FCM push | ⛔ Deferred (web VAPID is the active mobile-push transport) |

---

## ✅ Verdict

**100% deployment-ready for the in-scope surfaces (Web, Ubuntu ISO, Electron, PWA).**
Native mobile remains correctly archived. All previously "missing" files are present at their archived paths and protected by 5 BLOCK-class drift validators. There are no outstanding mobile-deployment fixes required for the current launch.

**Reactivation path:** see `generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md` (8 sections, ~25 boxes — every box must be checked before any "mobile is back" claim is allowed).
