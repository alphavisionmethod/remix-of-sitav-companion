# Archive — Inactive Platform Assets

This directory holds **historical** assets that are no longer part of active project scope.

## What's here

| Path | What | Why archived |
|---|---|---|
| `archive/ios-templates/` | iOS Capacitor template | Apple/iOS not pursued — see `docs/PLATFORM_SCOPE.md` |
| `archive/android-templates/` | Android Capacitor template | Android Play Store not pursued |
| `archive/mobile-platform/` | Mobile native adapters (iOS/Android/Capacitor) | Replaced by responsive web + PWA |
| `docs/archive/ios/` | iOS native runtime docs | Historical reference only |
| `scripts/archive/ios/` | iOS bootstrap + release scripts | Historical reference only |

## Policy

- **Do not import** from `archive/` in active code.
- **Do not extend** archived files. If scope ever revives, restore deliberately and add a fresh decision record.
- CI gates must not require archived assets.

## Active platform truth

The canonical native platform is **Ubuntu 24.04 LTS + Electron shell**.
See `docs/PLATFORM_SCOPE.md` and `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md`.
