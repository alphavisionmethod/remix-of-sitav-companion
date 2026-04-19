# Android Bootstrap & Native-Project Generation Spec

> Deterministic cold-start: empty `android/` → working debug APK in <5 min.

## Prerequisites

| Tool | Min version | Why |
|---|---|---|
| Node | 18.x | Vite + Capacitor CLI |
| JDK | 17 | Required by Gradle 8 + AGP 8 |
| `npx` | bundled with npm 9+ | Capacitor CLI invocation |
| `rsync` | any | Template overlay |
| Internet | yes | Gradle dependency download (first run only) |

## Procedure

```bash
# 1. From project root with no android/ directory:
bash scripts/android/bootstrap.sh

# 2. Validate output:
ls android/app/build/outputs/apk/debug/   # → app-debug.apk

# 3. (Optional) install on connected device:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Steps performed

1. **Pre-flight diagnostics** — fails fast if any tool missing/wrong version
2. **Web bundle build** — `npm run build`; aborts if `dist/` not produced
3. **Platform add (idempotent)** — `npx cap add android` only if `android/` absent
4. **Template overlay** — `rsync` from `android-templates/app/` if present (excludes `google-services.json.template`)
5. **FCM advisory** — non-fatal warning if `google-services.json` missing
6. **Capacitor sync** — `npx cap sync android` copies web bundle + plugins into native project
7. **Post-generation validation** — verifies `android/app/build.gradle`, `android/build.gradle`, `AndroidManifest.xml`
8. **Gradle assembleDebug** — produces unsigned debug APK with `--no-daemon` (CI-friendly)

## Failure diagnostics

| Exit code | Meaning |
|---|---|
| 2 | Pre-flight failed (missing tool / wrong version / not project root) |
| 3 | Web build silently failed (`dist/` not produced) |
| 4 | Capacitor generation incomplete (Gradle files missing) |
| 5 | APK not produced (Gradle failure) |

Each step prints a clear `▶`/`✓`/`⚠`/`✘` marker so failures are line-attributable.

## Determinism guarantees

- **Reproducible**: same Node + JDK + `package-lock.json` produces byte-similar APK (modulo timestamps)
- **Idempotent**: re-running the script when `android/` exists overlays templates and re-syncs without re-creating the project
- **No network surprises after first run**: Gradle caches under `~/.gradle/`

## Why we don't commit `android/`

The `android/` directory is generated from `capacitor.config.ts` + the web bundle + Capacitor plugin metadata. Committing it would (a) bloat the repo, (b) drift away from `package.json` plugin versions, and (c) require manual reconciliation on every Capacitor upgrade. The bootstrap script makes the regen reliable.

## CI counterpart

`.github/workflows/android-bootstrap.yml` runs this exact script on `ubuntu-latest` to produce the debug APK as a build artifact on every PR.
