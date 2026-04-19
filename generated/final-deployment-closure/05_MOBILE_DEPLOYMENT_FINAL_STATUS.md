# 05 — Mobile Deployment Final Status

## Stack truth
- **Canonical:** Capacitor (iOS + Android).
- **Flutter:** contained, not user-facing.
- **Desktop primary:** Ubuntu (Electron) per project memory.

## Build & signing paths
- Android: Gradle path documented; keystore is operator-provided secret.
- iOS: Xcode/fastlane path documented; signing certs are operator-provided.

## Push transport
- Honest resolution: APNs / FCM / Web Push selected per platform.
- Status surfaces report transport, not synthetic "delivered" flags.

## Submission readiness
- Code: ready (gates green via `final-mobile-truth-report.json`).
- **External blockers (not code):**
  - Apple Developer Program membership
  - Google Play Console account
  - Production signing credentials

## Classification
Apple/Play submission = **external-account-blocked**, not code-blocked.
