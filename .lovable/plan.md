
The user wants a downloadable, detailed step-by-step audit document called `OS Deployment.md` covering exactly what is missing to make the project 100% deployable to iOS, given that the audit shows "No Xcode project, no Swift, no Capacitor/RN bridge, Missing native runtime."

I need to first establish the **actual current state** of iOS readiness before writing the doc. The repo has many references to mobile (Capacitor config in CI, mobile build pipeline report, mobile manifests, infra/deploy/mobile.yaml, scripts/release/ios/build-ios.sh, exportOptions.plist) — but the master audit says "iOS NOT DEPLOYABLE." So there's a gap between **scaffolding/CI YAML** and **actual native iOS project artifacts**. I need to verify which side is true.

### Discovery I need to do (read-only)

1. **Native project presence**: Is there an `ios/` folder with an Xcode project (`App.xcworkspace`, `App.xcodeproj`, `Podfile`, `Info.plist`)? This is the single biggest gate.
2. **Capacitor wiring**: Does `capacitor.config.ts/json` exist at root? Are `@capacitor/ios` + `@capacitor/core` + `@capacitor/cli` in `package.json` (the mobile-build-pipeline-report claims yes)?
3. **Build scripts**: View `scripts/release/ios/build-ios.sh` and `exportOptions.plist` — do they reference a real Xcode project path that doesn't exist?
4. **Push notification status**: Memory says Apple APNs is **deferred** (no paid Apple membership). This is critical context — the doc must reflect that APNs is intentionally deferred, not a blocker.
5. **Store readiness checklist**: Check `src/lib/mobile-platform/release.ts` (referenced by check-mobile-store-readiness.ts) for the canonical iOS App Store checklist — this is the authoritative gap list.
6. **Signing secrets**: Required GitHub secrets per `.github/workflows/release-ios.yml`: `IOS_TEAM_ID`, `IOS_BUNDLE_ID`, `IOS_PROVISIONING_PROFILE`, `IOS_SIGNING_CERTIFICATE`. Doc must list these as user-action items.
7. **Mobile shell code**: Any actual mobile-specific React/Capacitor bridge code in `src/lib/mobile-platform/` or `src/components/mobile/`?

### Deliverable

A downloadable artifact at `/mnt/documents/OS Deployment.md` (note: filename has space — must be quoted in shell) covering:

- **Section 1 — Honest current state**: what exists (CI YAML, build scripts, store-readiness registry, Capacitor deps if confirmed) vs. what doesn't (Xcode project, ios/ folder, signing assets, Apple Developer account).
- **Section 2 — The gap, ranked by blocker severity**: P0 hard blockers (no native project, no Apple Developer Program enrollment, no signing certs) → P1 (TestFlight metadata, privacy manifest, push entitlements) → P2 (deferred APNs per project policy).
- **Section 3 — Step-by-step remediation playbook**: numbered phases (Phase A: Apple account & legal, Phase B: Capacitor scaffold, Phase C: native project generation, Phase D: signing, Phase E: build/archive, Phase F: TestFlight, Phase G: App Store submission). Each step explicitly marked `[USER ACTION]` (account/payment/legal) vs `[CODE — Lovable can do]` (config files, scripts) vs `[LOCAL MAC ONLY]` (anything requiring Xcode).
- **Section 4 — Lovable-side vs. user-side split**: a clear table since Lovable runs in a Linux sandbox and **cannot run Xcode, cannot sign, cannot upload to App Store Connect**. The user (or their dev) must execute the macOS-only steps.
- **Section 5 — File-by-file checklist**: every file/secret/account that must exist before the GitHub Actions `release-ios.yml` workflow can succeed signed.
- **Section 6 — Acceptance criteria**: what "100% iOS deployable" means concretely (green CI + IPA artifact + TestFlight build live + App Store Connect listing approved).
- **Section 7 — Honest verdict & ETA**: realistic timeline broken into "code work" (1-3 days) vs. "Apple review wall-clock" (1-3 weeks for first review).

### Plan structure (concise, no padding)

```
Discovery (parallel reads, ~7 calls):
  - ls ios/ (existence check)
  - cat package.json (capacitor deps)
  - cat capacitor.config.ts/json if present
  - cat scripts/release/ios/build-ios.sh
  - cat scripts/release/ios/exportOptions.plist
  - cat src/lib/mobile-platform/release.ts
  - ls src/lib/mobile-platform/ + src/components/mobile/
  - search for "Capacitor" usages in src/

Then write /mnt/documents/OS Deployment.md (single artifact, ~400 lines)
Emit <lov-artifact> tag for download.
```

### Acceptance

| Check | Target |
|---|---|
| Artifact at `/mnt/documents/OS Deployment.md` | ✅ |
| Every gap classified P0/P1/P2 | ✅ |
| Every step labeled USER / CODE / LOCAL-MAC | ✅ |
| APNs deferral honored per project policy | ✅ |
| Signing secrets listed with names matching CI workflow | ✅ |
| No invented file paths — every referenced file verified live | ✅ |
| `<lov-artifact>` tag emitted | ✅ |

No code changes, no migrations — this is a docs-only deliverable.
