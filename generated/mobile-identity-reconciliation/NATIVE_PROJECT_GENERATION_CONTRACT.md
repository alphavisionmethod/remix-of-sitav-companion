# SITA OS — Native Project Generation Contract

**Status:** canonical
**Authority:** this document is the source of truth for how `android/` and `ios/` come into existence
**Enforcement:** 4 validators (`check-android-native-generation`, `check-ios-native-generation`, `check-native-project-generation-contract`, `check-mobile-bootstrap-contract`)

---

## 1. Contract Summary

| Aspect | Android | iOS |
|---|---|---|
| Committed to repo? | **NO** | **NO** |
| Generation script | `scripts/android/bootstrap.sh` | `scripts/ios/bootstrap.sh` |
| CI generator | `.github/workflows/mobile-build.yml` job `android` | `.github/workflows/mobile-build.yml` job `ios` (`macos-14` runner) |
| Host OS requirement | Linux or macOS | **macOS only** (Xcode dependency) |
| Required Node major | 18 | 18 |
| Required additional tooling | JDK 17, rsync | CocoaPods (`pod`), Xcode CLI (`xcodebuild`), `sips` (built-in to macOS) |
| Idempotency | yes — re-running on existing `android/` only re-overlays templates | yes — re-running on existing `ios/` only re-overlays templates and runs `pod install` |
| Post-generation validation | 3 file-existence checks + APK build | 3 file-existence checks + Podfile.lock |
| Outputs | `android/app/build/outputs/apk/debug/*.apk` (debug, unsigned) | `ios/App/App.xcworkspace` (ready for Xcode archive or CI signed build) |
| Production signed build | `scripts/release/android/build-android.sh` | `scripts/release/ios/build-ios.sh` |

---

## 2. The Generation Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ Repository state (committed)                                │
│  • capacitor.config.ts        ← canonical identity          │
│  • package.json               ← Capacitor deps              │
│  • src/                       ← Lovable SPA source          │
│  • mobile/android/            ← signing notes, FCM, perms   │
│  • archive/ios-templates/     ← Podfile + project overlays  │
│  • android-templates/         ← (optional) overlay          │
│  • scripts/android/bootstrap.sh                             │
│  • scripts/ios/bootstrap.sh                                 │
└────────────────────┬────────────────────────────────────────┘
                     │ bootstrap script run
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Generated state (NOT committed, .gitignored)                │
│  • dist/                      ← Vite web bundle             │
│  • android/                   ← Capacitor-generated Gradle  │
│      └─ app/build/outputs/apk/debug/*.apk                   │
│  • ios/App/App.xcworkspace    ← Capacitor-generated Xcode   │
│      └─ Podfile.lock                                        │
└─────────────────────────────────────────────────────────────┘
```

**Reproducibility guarantee:** running the bootstrap script on a clean checkout produces a buildable native project deterministically, given the pinned tool versions are present.

---

## 3. Why On-Demand, Not Committed

| Reason | Detail |
|---|---|
| Merge-conflict noise | Capacitor regenerates pbxproj/build.gradle on every `cap sync`; committing creates massive false-positive diffs |
| Reproducibility theater | committed native projects encode absolute paths (Xcode pbxproj `developmentRegion`, Gradle wrapper hashes) that differ across machines |
| Credential foot-gun | committed `ios/App/App.entitlements` or `android/app/google-services.json` would leak through `git add .` |
| Capacitor team's own pattern | `@capacitor/example-app` does not commit native projects either |
| Smaller repo | iOS pbxproj alone is ~50KB of churn per `cap sync`; Android equivalent is ~30KB |

---

## 4. Pinned Tool Versions (the contract)

Any change to these values requires a PR title `mobile-bootstrap-contract: <tool> <old> → <new>` and validator updates:

| Tool | Pinned at | Rationale |
|---|---|---|
| Node.js major | 18 | Capacitor 6 minimum; matches Lovable build env |
| Java JDK major | 17 | Required by Android Gradle Plugin 8.x; required by Play Console August 2024 target SDK 34 |
| Capacitor | 6 | LTS line; matches `@capacitor/core` major in `package.json` |
| iOS deployment target | 16.0 | matches `archive/ios-templates/App/Podfile` |
| Android min SDK | 26 | matches `infra/deploy/mobile.yaml` |
| Android target SDK | 34 | matches `infra/deploy/mobile.yaml` |

---

## 5. The "Cannot Verify" Resolution

The closure-pass audit flagged "Native generation — cannot verify from available files" as a residual ambiguity. **This contract resolves it explicitly:**

| Previous ambiguity | Resolved by |
|---|---|
| "Where does `android/` come from?" | `scripts/android/bootstrap.sh` step 3 (`npx cap add android`) |
| "Where does `ios/` come from?" | `scripts/ios/bootstrap.sh` step 3 (`npx cap add ios`) |
| "Are tool versions pinned?" | yes — script lines 10-11 (Android), pre-flight (iOS) |
| "Is generation validated?" | yes — script lines 68-80 (Android), post-generation (iOS) |
| "What does CI do?" | mirror of local script in `.github/workflows/mobile-build.yml` |
| "Can operators trust cold-start?" | yes — exit codes 2/3/4/5 cover every failure class with diagnostic output |

---

## 6. Operator Workflow

### Android, local:
```bash
# Cold start (no android/ directory yet)
bash scripts/android/bootstrap.sh
# Result: android/ generated + debug APK at android/app/build/outputs/apk/debug/

# Iterate on web changes
npm run build && npx cap sync android && cd android && ./gradlew assembleDebug

# Signed release (requires env vars — see mobile/android/SIGNING.md)
bash scripts/release/android/build-android.sh
```

### iOS, local (macOS only):
```bash
# Cold start
bash scripts/ios/bootstrap.sh
# Result: ios/App/App.xcworkspace ready for Xcode archive

# Open in Xcode
open ios/App/App.xcworkspace

# Signed release (requires Apple Developer membership + env vars)
bash scripts/release/ios/build-ios.sh
```

### CI:
- Push to `main` → `.github/workflows/mobile-build.yml` runs both jobs
- `android` job produces signed AAB if keystore secrets present, else debug APK
- `ios` job produces signed `.ipa` if Apple credentials present, else fails with `account-blocked` exit code

---

## 7. Failure Diagnostics

If `bash scripts/android/bootstrap.sh` exits non-zero:

| Exit code | Diagnostic |
|---|---|
| 2 | check `node -v` (≥18) and `java -version` (≥17); ensure you're in project root |
| 3 | run `npm run build` manually and inspect Vite output |
| 4 | delete `android/` and re-run; if still failing, check `npx cap doctor android` |
| 5 | `cd android && ./gradlew assembleDebug --stacktrace` for full Gradle trace |

If `bash scripts/ios/bootstrap.sh` exits non-zero:

| Exit code | Diagnostic |
|---|---|
| 2 | macOS only; verify `xcode-select --install` and `sudo gem install cocoapods` |
| 3 | run `npm run build` manually |
| 4 | `cd ios/App && pod install --verbose` for full CocoaPods trace |
| 5 | delete `ios/` and re-run; check `npx cap doctor ios` |

---

## 8. Contract Verification

This contract is enforced by:

| Validator | Asserts |
|---|---|
| `check-android-native-generation.ts` | bootstrap script exists, has version pins, has post-generation validation |
| `check-ios-native-generation.ts` | bootstrap script exists at `scripts/ios/bootstrap.sh` (NOT just archive), has version pins, has post-generation validation |
| `check-native-project-generation-contract.ts` | this document exists, declares "NOT committed", references both bootstrap scripts |
| `check-mobile-bootstrap-contract.ts` | both bootstrap scripts exist + are executable + reference `cap add` and `cap sync` correctly |

All 4 validators run via `npm run mobile:identity:run-all` and are wired into the release readiness aggregator as WARN-tier gates (mobile is secondary distribution surface — these report state but do not BLOCK desktop releases).
