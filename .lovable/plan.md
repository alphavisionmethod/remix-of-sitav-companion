

## Phase 12.1 — Close Real Mobile Deployability Gaps

I re-audited the iOS + Android checklists against disk truth. The Phase 12 registries, services, contracts, adapters, build scripts, CI gate, admin dashboard, and DB migration are all **in place and honest**. But two real gaps would break an actual mobile build today:

### What's already green ✅
| Area | Evidence |
|---|---|
| iOS readiness registry | 18/18 items, 16 ready + 2 honestly deferred (APNs, signing) |
| Android readiness registry | 18/18 items, 17 ready + 1 honestly deferred (FCM) |
| iOS adapters | 8 files in `src/lib/mobile-platform/ios/` |
| Android adapters | 8 files in `src/lib/mobile-platform/android/` |
| Contracts | 13 contract files (permission, biometric, push, deep-link, lifecycle, sync, etc.) |
| Push token lifecycle | Service + `mobile_push_tokens` table with RLS |
| Notification-open router | Wired to deep-link map + auth/biometric guards |
| Min-OS contract | iOS 16.0 / Android API 26 enforced |
| CI gate | `check-mobile-store-readiness.ts` registered as Phase 12 (22/22 green) |
| Admin dashboard | `/admin/mobile/store-readiness` rendering both 18-item lists |
| Build scripts | `build-ios.sh` + `build-android.sh` with signing-env validation |

### Real gaps blocking an actual native build ❌

**Gap A — Capacitor packages not installed (`package.json` has 0 `@capacitor/*` deps).**
`capacitor.config.ts` imports `@capacitor/cli` types that don't resolve. Services (`native-push.ts`, `native-secure-storage.ts`) reference plugins that aren't in `node_modules`. `npx cap sync` would fail immediately.

**Gap B — `scripts/release/ios/exportOptions.plist` referenced but missing.**
`build-ios.sh` calls `xcodebuild -exportArchive -exportOptionsPlist scripts/release/ios/exportOptions.plist` — that file doesn't exist. The IPA export step would fail with "exportOptionsPlist not found."

### Phase 12.1 — Plan (~4 files, ~120 LOC)

**1. Install Capacitor dependencies**
Add to `package.json`: `@capacitor/core`, `@capacitor/cli` (dev), `@capacitor/ios`, `@capacitor/android`, `@capacitor/push-notifications`, `@capacitor/app`, `@capacitor/preferences`, `@capacitor/device`, `@capacitor/network`. After install, `capacitor.config.ts` resolves cleanly and `npx cap sync` works post-export.

**2. Create `scripts/release/ios/exportOptions.plist`**
App Store distribution plist with `method=app-store`, `signingStyle=manual`, `teamID=$(IOS_TEAM_ID)` placeholder, `compileBitcode=false`, `uploadSymbols=true`. Standard Apple-compliant template.

**3. Add a build-pipeline contract guard (`scripts/architecture/checks/check-mobile-build-pipeline.ts`)**
New micro-gate that asserts: (a) Capacitor packages are present in `package.json`, (b) `exportOptions.plist` exists, (c) both build scripts exist and are executable, (d) `capacitor.config.ts` parses. Wires into the umbrella as the **23rd CI gate** under `phase-12-mobile-deployability`.

**4. Update generated artifacts**
Regenerate `mobile-store-readiness-report.json`, `ci-umbrella-manifest.json` (gateCount: 23), and `production-truth-final.json` to reflect closure.

### Acceptance

- `npm install` resolves all `@capacitor/*` packages.
- `xcodebuild -exportArchive` finds `exportOptions.plist`.
- New `check-mobile-build-pipeline` gate passes.
- CI Umbrella reports **23/23 green** with iOS/Android still honestly deferring only on Apple-membership and Firebase-provisioning gates.

After this micro-phase, the iOS + Android checklists are not just registered as "ready" — the actual `npx cap sync` → `xcodebuild` → IPA / `gradle bundleRelease` → AAB pipelines will execute end-to-end once the user runs `npm install` post-export.

