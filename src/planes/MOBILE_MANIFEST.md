# Mobile Plane Manifest

> **Canonical stack: Capacitor over Lovable SPA.**
> **Posture: secondary supported distribution surface — honestly deferred on external blockers.**
> Primary runtime is Ubuntu 24.04 + Electron. Mobile is an optional channel, not a first-class daily driver.

## Purpose
Provide an installable mobile distribution of SITA OS for owner-operators who want a phone-resident control surface. Mobile is **not** a primary product. It exists as an honest, governed distribution channel that flips from `deferred` → `live` when the external prerequisites (Apple Developer membership, FCM credentials, signing keystore) are provisioned.

## Ownership
- **Primary owner**: Platform Distribution
- **Trust level**: read-mostly companion surface; high-impact actions still require desktop/owner-device biometric

## Canonical stack
| Layer | Choice | Why |
|---|---|---|
| Wrapper | **Capacitor 6** | Reuses the Lovable SPA verbatim — one codebase, two distribution surfaces. |
| iOS | Capacitor iOS (Xcode/Swift project, generated on demand) | Standard App Store submission flow. |
| Android | Capacitor Android (Gradle project, generated on demand) | Standard Play Store / AAB submission flow. |
| Push (mobile) | **Deferred** — APNs + FCM both gated on credentials | See `mobile/android/FCM.md`, `mobile/ios/SIGNING.md`. |
| Push (web) | VAPID — **active** | Real, shipped in current SPA. |

> **Flutter is not used.** Earlier architecture sketches referenced Flutter as a future migration target; that direction was abandoned. Any remaining Flutter mention in this repo is non-canonical drift and is regression-protected by `scripts/validation/check-mobile-canonical-stack.ts` and `scripts/validation/check-no-flutter-mobile-truth-drift.ts`.

## Directories (current)
| Path | Description |
|------|-------------|
| `capacitor.config.ts` | Capacitor config (canonical) |
| `mobile/android/` | Android signing notes, FCM provisioning, manifest permissions |
| `mobile/ios/` | iOS signing notes, Info.plist template, privacy manifest |
| `mobile/store-metadata/` | Play + App Store listing payloads, screenshots matrix, data-safety JSON |
| `archive/ios-templates/` | iOS Podfile + project templates (deferred location, intentional — see below) |
| `scripts/android/bootstrap.sh` | Cold-start: web build → `cap add android` → overlay templates → `assembleDebug` |
| `scripts/release/android/build-android.sh` | Signed AAB pipeline (env-var-gated) |
| `scripts/release/ios/build-ios.sh` | Signed `.ipa` archive pipeline (env-var-gated, Apple-account-blocked) |
| `src/pages/mobile/` | Mobile-responsive page routes (shared SPA) |
| `src/components/mobile/` | Mobile-specific UI affordances |

### Why iOS templates live under `archive/`
`archive/ios-templates/` is a **deliberate deferred location**, not abandoned code. Promotion from `archive/ios-templates/` → `mobile/ios-templates/` happens automatically the first time `scripts/release/ios/build-ios.sh` runs with valid Apple credentials. Until then, keeping the templates in `archive/` prevents accidental "we have iOS!" claims in product surfaces.

## Allowed dependencies
- `shared` (contracts, types, schemas)
- The Lovable SPA verbatim (Capacitor wraps, does not fork)

## Forbidden dependencies
- Any Flutter package
- Any second mobile-architecture path
- Hardcoded signing material, certificates, or service-account JSON
- Direct mutation of native projects without going through the bootstrap script

## Deployment readiness state
| Surface | State | Blocker |
|---|---|---|
| Android cold-start → debug APK | **code-ready** | none — runs on any Linux runner with Node + JDK 17 |
| Android signed AAB | **secret-blocked** | `ANDROID_KEYSTORE_PATH` + 4 env vars |
| Android FCM push | **deferred** | `google-services.json` (see `mobile/android/FCM.md`) |
| Android Play submission | **metadata-blocked-on-screenshots** | screenshot matrix in `mobile/store-metadata/android.screenshots.json` |
| iOS cold-start → unsigned `.ipa` | **code-ready (macOS-only)** | needs `macos-14` runner |
| iOS signed `.ipa` + TestFlight | **account-blocked** | Apple Developer Program + 7 secrets (see `mobile/ios/SIGNING.md`) |
| iOS APNs push | **account-blocked** | APNs key (gated by membership) |
| Mobile push UI claims | **gated** | enforced by `check-mobile-push-claim-safety.ts` |

## Security requirements
- Biometric authentication (Face ID / Touch ID / fingerprint) for high-impact actions
- Secure Enclave / Keystore for key material
- Certificate pinning for API communication
- Push notification security (when transport flips from `deferred` → `live`: APNs / FCM)
- No secrets in repo — all signing material comes from CI env vars only
