
## Rewrite `OS Deployment_v1.md` → `OS Deployment_v2.md`

The v1 doc is ~70% accurate but stale. Significant infrastructure landed since it was written that needs to be reflected so the audit is honest:

**What v1 missed / underrated:**
1. `ios-templates/` directory with hardened `Info.plist`, `App.entitlements`, `PrivacyInfo.xcprivacy`, `LaunchScreen.storyboard`, `Podfile` — the "scaffold these later" items in v1 are already shipped
2. `.github/workflows/ios-bootstrap.yml` — cloud-side `npx cap add ios` runner that solves the "must do on macOS" blocker for users without a Mac
3. `scripts/ios/bootstrap.sh` — local Mac mirror of the bootstrap workflow
4. `docs/ios/IOS_NATIVE_RUNTIME.md` — operator guide
5. `build-ios.sh` already pre-flights for `ios/`, hardened templates, AND rejects placeholder bundle IDs
6. 8 native bridge adapters (not 4): adds `native-app-lifecycle`, `native-background-runner`, `native-crash-reporter`, `native-deep-links`
7. Subdirectories under `src/lib/mobile-platform/` for android/ios/release/runtime/security/sync/contracts/migration/navigation/services/analytics
8. 2 CI contracts both passing: `check-mobile-build-pipeline.ts` + `check-mobile-store-readiness.ts`

**What v1 got right and stays:**
- Apple Developer Program enrollment, certs, profiles, App Store Connect = still USER work
- APNs deferred per policy
- Bundle ID still needs replacement from `app.lovable.*` → `com.sita.os`
- `server.url` must be commented out for production
- CI signing-asset decode/keychain-import enhancement still needed (build-ios.sh validates env vars but doesn't decode/install them)
- `exportOptions.plist` `provisioningProfiles` mapping still needed

### v2 Structure

1. **Verdict** — "70% paved" → "~85% paved; the cloud bootstrap workflow eliminated the macOS-required scaffold step"
2. **TL;DR** — updated paragraph reflecting templates + bootstrap workflow exist
3. **Honest current state** — expanded asset table including all 8 adapters, ios-templates/, both workflows, IOS_NATIVE_RUNTIME.md
4. **Two-path bootstrap** — explain that users now have CLOUD path (no Mac required for scaffold) OR LOCAL MAC path
5. **Gap matrix (P0/P1/P2)** — re-ranked: P0-1 ("no ios/ folder") downgraded because bootstrap workflow exists; user just runs it. Real remaining P0s = Apple account + bundle ID rename + GitHub secrets + signing-decode CI enhancement
6. **Remediation phases A–G** — rewritten with accurate references to bootstrap workflow as Phase C
7. **Lovable vs User split table** — updated rows (Lovable now ships templates + bootstrap CI)
8. **Pre-flight checklist** — updated with new files; mark items genuinely complete
9. **What CHANGED since v1** — new section explicitly diffing v1 → v2 so reader sees the delta
10. **Honest residual gaps** — short list of the truly remaining items
11. **End-to-end timeline** — realistic wall-clock from zero to App Store

Output as `/mnt/documents/OS Deployment_v2.md` with `<lov-artifact>` tag. ~450 lines, no fluff, every claim verifiable against repo paths shown above.
