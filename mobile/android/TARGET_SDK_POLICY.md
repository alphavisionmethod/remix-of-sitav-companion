# SITA OS — Android Target SDK Policy

> Floor: **API 34 (Android 14)**
> Compile SDK: **API 34**
> Min SDK: **API 26 (Android 8.0)**
> Effective: from first Play submission.

## Why API 34

Google Play requires `targetSdkVersion ≥ 34` for new app submissions and updates
since August 31 2024. Lower target SDK results in submission rejection.

## Migration log

| Date | Target SDK | Notes |
|---|---|---|
| Initial | 34 | Greenfield — no migration needed. |

## Capability impact

- Predictive back gestures: enabled (`android:enableOnBackInvokedCallback="true"`).
- Foreground service types: declared per use case (`dataSync`, `mediaPlayback`).
- Photo picker: replaces legacy `READ_EXTERNAL_STORAGE` for media access.
- Restricted broadcasts: receivers declared in manifest only.

## Enforcement

`scripts/architecture/checks/check-mobile-store-readiness.ts` asserts this file exists
and the line `targetSdkVersion = 34` (or higher) is present. Bumping the floor
requires updating both this doc and `android/app/build.gradle` (when generated).
