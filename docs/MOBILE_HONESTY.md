# SITA OS — Mobile Honesty (Canonical)

> **Status:** Authoritative · Version 1.0 · 2026-04-19
> Single source of truth for the mobile scope of SITA OS.
> Linked from `/install`, `/downloads`, and the External Installer page.

## TL;DR

**SITA OS does not currently ship a native iOS or Android app.**

- ✅ **Active deployment surfaces:** Web SPA, Ubuntu-native ISO, Electron desktop shell.
- 🟡 **On mobile devices:** SITA OS works as a **responsive web app** (and as an installable PWA where the browser supports it). This is **not** a native app.
- ⛔ **Not currently released:** native iOS app, native Android app, App Store, Play Store, APNs/FCM mobile push.

## Why

Truth-honesty over optionality theater. The desktop and web surfaces are real, proven, and operationally hardened. Native mobile apps are not behaviorally proven, not store-published, and depend on external accounts (Apple Developer Program, Google Play Console, FCM/APNs credentials) that are not part of the current deployment scope.

Maintaining "maybe ready" mobile language was creating launch-risk and truth contamination across release docs, generated reports, install surfaces, and operator dashboards. This document closes that ambiguity.

## What this means in practice

### For users
- Use SITA OS in your phone's web browser. It is responsive and installable as a PWA on browsers that support it (Chrome, Edge, modern Safari).
- There is **no** SITA OS in the App Store or Play Store. If you see one, it is not us.
- Push notifications on mobile are delivered through the web (VAPID), not APNs/FCM.

### For operators
- The AI Engineer hub at `/admin/ai-runtime` includes a **Mobile Scope Truth** tab that surfaces the canonical archived status, validation gate results, and reactivation conditions.
- All mobile-native artifacts (Capacitor config, store metadata, signing scripts) are preserved under `archive/` for safe future reactivation but are excluded from active deployment truth.

### For developers
- Do **not** add `@capacitor/*` dependencies, `capacitor.config.ts`, or `infra/deploy/mobile.yaml` back to active paths.
- Do **not** describe responsive web behavior as "the SITA OS app" on a phone.
- The validation suite (`npm run mobile:scope:run-all`) enforces this contract. Drift fails CI.

## Classification vocabulary

The repo uses a single canonical vocabulary for native-mobile artifacts:

| Label | Meaning |
|---|---|
| `ARCHIVED` | Asset moved to `archive/` and excluded from active deployment truth. |
| `FUTURE_VISION_ONLY` | May be reactivated under explicit conditions; not in current scope. |
| `NOT_LAUNCH_SURFACE` | Cannot be claimed in launch-facing or operator-facing claims. |
| `OPTIONAL_FUTURE_PROGRAM` | Could become its own program with dedicated owner, signing, QA, push truth. |

See `generated/mobile-scope-closure/MOBILE_SCOPE_CANONICAL_MODEL.md` for the full model.

## Reactivation conditions

Native mobile may return to active scope only when **all** of the following are true:

1. A signed strategic decision reactivates the mobile-native program with a named owner.
2. Apple Developer Program membership and Google Play Console enrollment are active.
3. Production signing material (keystore, p12, provisioning profiles) is provisioned in CI secrets.
4. Real-device QA and accessibility audits are passing.
5. Push transport truth (APNs + FCM) is resolved end-to-end with live receipts.
6. Native app-quality review is complete (cold start, memory, battery, deep links, offline).
7. Launch-honesty docs (this file, `PLATFORM_SCOPE.md`) are updated and the validation suite is reconfigured to expect a live mobile surface.

Until **every** condition above is met, native mobile remains out of scope.

See `generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md` for the operational checklist.

## References

- `docs/PLATFORM_SCOPE.md` — canonical platform scope
- `generated/mobile-scope-closure/MOBILE_SCOPE_CANONICAL_MODEL.md`
- `generated/mobile-scope-closure/MOBILE_SCOPE_REFERENCE_AUDIT.md`
- `generated/mobile-scope-closure/MOBILE_SCOPE_FINAL_VERIFICATION.md`
- `generated/mobile-scope-closure/mobile-scope-verification.json`
- `archive/mobile/ARCHIVED.md`
- `archive/capacitor/capacitor.config.ts`
- `archive/infra/mobile.yaml`
