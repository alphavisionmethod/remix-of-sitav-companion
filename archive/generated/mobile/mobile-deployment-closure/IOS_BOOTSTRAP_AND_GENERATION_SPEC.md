# iOS Bootstrap & Native-Project Generation Spec

> Deterministic cold-start on `macos-14` → working unsigned `.ipa` (or signed if credentials present).

## Prerequisites

| Tool | Min version | Why |
|---|---|---|
| macOS | 14 (Sonoma) | Xcode 16 requirement |
| Xcode | 16.0 | iOS 17/18 SDK + signing |
| CocoaPods | 1.14+ | Capacitor pod resolution |
| Node | 18.x | Vite + Capacitor CLI |
| Apple Developer membership | active | **only for signed builds** |

## Cold-start procedure

```bash
# Step 1: Build web bundle
npm run build

# Step 2: Generate ios/ directory (idempotent)
npx cap add ios

# Step 3: Sync web bundle + plugins
npx cap sync ios

# Step 4: Install CocoaPods
cd ios/App && pod install && cd -

# Step 5: Open in Xcode (interactive) OR archive (CI)
open ios/App/App.xcworkspace
# OR for CI:
xcodebuild -workspace ios/App/App.xcworkspace -scheme App archive ...
```

## Signed pipeline

Single command:
```bash
bash scripts/release/ios/build-ios.sh
```

This wraps all 5 manual steps + signing material decoding + archive + export. See `IOS_SIGNING_AND_RELEASE_FLOW.md`.

## Post-generation validation

After `npx cap sync ios`, verify:
- `ios/App/App.xcworkspace/contents.xcworkspacedata` exists
- `ios/App/Podfile` exists and references all `@capacitor/*` packages from `package.json`
- `ios/App/App/Info.plist` exists
- `ios/App/Podfile.lock` is generated

## Why `ios/` is not committed

Same rationale as Android: the `ios/` directory is derived from `capacitor.config.ts` + web bundle + plugin metadata. Committing it would create drift on every Capacitor or plugin upgrade. The bootstrap script + `pod install` make regeneration reliable.

## Failure diagnostics

| Symptom | Cause | Fix |
|---|---|---|
| `pod install` fails on M-series Mac | Old CocoaPods | `gem install cocoapods --pre` or `brew upgrade cocoapods` |
| `xcodebuild: command not found` | Xcode CLI tools missing | `xcode-select --install` |
| Profile mismatch error | Wrong bundle ID in profile | Regenerate profile for `com.sita.os` |
| "No accounts" error | macOS keychain empty | `security create-keychain` + import `.p12` (script handles this) |

## CI counterpart

`.github/workflows/mobile-build.yml` job `ios-signed` runs `bash scripts/release/ios/build-ios.sh` on `macos-14`. Job is gated on the 7 Apple secrets being present in the repo settings.

## Determinism

- Reproducible per Xcode version + iOS SDK version
- Bit-for-bit reproducibility is not guaranteed by Apple's toolchain; behavioral reproducibility is the contract
- Same web bundle + same Capacitor versions + same Xcode = same app
