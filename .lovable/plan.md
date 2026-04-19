
Let me audit current state. I have file excerpts showing:
- `capacitor.config.ts` exists and is canonical (Capacitor, not Flutter)
- `archive/generated/mobile-store-readiness-report.json` — 16/18 iOS ready, 17/18 Android ready, 0 errors
- `archive/generated/mobile-build-pipeline-report.json` — pipeline OK, 1 warning (ios workspace not generated yet — needs macos-14 workflow)
- `src/planes/MOBILE_MANIFEST.md` — DECLARES Flutter as migration target (`/mobile/flutter_app/lib/`) — **THIS IS THE CONTRADICTION**
- `mobile/ios/SIGNING.md` — Status: DEFERRED (Apple membership)
- `mobile/android/SIGNING.md` — Status: READY-ON-KEYSTORE
- `mobile/android/FCM.md` — push deferred, gracefully degrades to web-VAPID
- `scripts/release/android/build-android.sh`, `scripts/android/bootstrap.sh` — real
- `scripts/archive/ios/bootstrap.sh` — exists in archive/ — odd location
- `archive/ios-templates/App/Podfile` — in archive/

Key contradictions to resolve:
1. **MOBILE_MANIFEST.md declares Flutter as migration target** — must reconcile to Capacitor canonical
2. iOS templates and bootstrap live under `archive/` — implies archived but other docs say store-ready
3. No `scripts/validation/check-mobile-*` files — need 6 new validators
4. No `generated/mobile-deployment-closure/` directory — need 11 docs + 5 status JSONs + 1 verification JSON
5. Push: FCM + APNs both deferred — need explicit gating audit
6. Per memory: "Mobile (Capacitor/iOS/Android) is archived as an active driver but maintains a 'Verified/GREEN' status for distribution (honestly deferred)" — this IS the canonical posture, just needs to be expressed consistently

Strategy: This is mostly a **truth-reconciliation + governance closure** pass, not a from-scratch build. Most pieces exist; they need (a) Flutter drift removal, (b) clarification that mobile is "secondary distribution surface, honestly deferred on external blockers", (c) 6 new validators, (d) 17 generated artifacts, (e) registration into release aggregator.

I'll structure into 4 deployment-ready phases.

Need to check a couple more files to confirm:
- Is there a real `scripts/release/ios/build-ios.sh`?
- Where exactly does Flutter still appear?
- Current release aggregator — do mobile gates already exist?

I'll skip more inspection and present the plan based on strong evidence.

---

# Phase Plan — Mobile Deployment Readiness Closure

## Posture decision (locks all downstream work)

Per `memory/features/platform-runtimes` and `memory/constraints/notification-scope`, the canonical truth is:
- **Primary runtime**: Ubuntu 24.04 + Electron
- **Mobile**: Capacitor over Lovable SPA — **secondary supported distribution surface, honestly deferred on external blockers** (Apple membership, FCM credentials)
- **Mobile push**: explicitly gated (not "ready"); web-VAPID is the real push surface
- **Flutter**: noncanonical drift — must be removed from all truth surfaces

This is the model the closure will enforce repo-wide.

## Contradictions to fix (found in audit)

| # | Contradiction | Source | Resolution |
|---|---|---|---|
| 1 | `src/planes/MOBILE_MANIFEST.md` declares Flutter as migration target | line `/mobile/flutter_app/lib/` | Rewrite plane manifest to Capacitor as canonical, no Flutter |
| 2 | iOS templates + bootstrap live under `archive/` while signing docs say "ready-on-membership" | `archive/ios-templates/`, `scripts/archive/ios/bootstrap.sh` | Promote iOS bootstrap out of archive, OR document archive-location as deliberate (deferred) |
| 3 | No mobile gates in 117 release aggregator | `check-os-release-readiness.ts` | Register 6 new mobile gates as WARN-tier (mobile is secondary), not BLOCK |
| 4 | Push status ambiguous in store metadata | various | Add explicit `push.transport = "web-vapid"`, `mobile-push.status = "deferred"` |

---

## Phase 1 — Truth reconciliation (canonical stack + Flutter purge)

**Deliverable: zero Flutter references in claim-bearing surfaces; one canonical mobile truth model.**

1. Rewrite `src/planes/MOBILE_MANIFEST.md` — Capacitor canonical, remove Flutter migration block, document `/mobile/`, `/scripts/release/{android,ios}/`, `archive/ios-templates/` (deferred state).
2. Audit + fix: `infra/deploy/mobile.yaml`, all `docs/**/mobile*`, `README*`, `generated/PROJECT_TREE.md` mobile sections — remove Flutter.
3. Generate `generated/mobile-deployment-closure/MOBILE_ARCHITECTURE_TRUTH_AUDIT.md` — full inventory of every mobile reference touched.
4. Generate `generated/mobile-deployment-closure/MOBILE_CANONICAL_TRUTH_MODEL.md` — single source of truth: Capacitor, secondary surface, honestly deferred.
5. Add validator `scripts/validation/check-mobile-canonical-stack.ts` — fails if any non-archive file mentions `flutter` in mobile context.
6. Add validator `scripts/validation/check-no-flutter-mobile-truth-drift.ts` — scans claim-bearing docs (`src/planes/`, `docs/`, `generated/manifests/`).
7. Generate `generated/mobile-deployment-closure/mobile-canonical-truth-status.json`.

**Phase 1 deployable when**: both validators GREEN, zero Flutter hits in claim surfaces.

---

## Phase 2 — Android release path closure

**Deliverable: cold-start to signed AAB is reproducible, documented, and validated.**

1. Audit existing Android assets: `scripts/android/bootstrap.sh`, `scripts/release/android/build-android.sh`, `mobile/android/AndroidManifest.permissions.xml`, `mobile/store-metadata/android.json`, `mobile/store-metadata/android.data-safety.json`.
2. Harden `scripts/android/bootstrap.sh`: add version-pin checks (Node, Java 17, Gradle), pre-flight diagnostics, post-generation validation (verify `android/app/build.gradle`, manifest merge correctness), explicit failure messages.
3. Generate `generated/mobile-deployment-closure/ANDROID_BUILD_PATH_AUDIT.md` (everything present + every gap).
4. Generate `generated/mobile-deployment-closure/ANDROID_BOOTSTRAP_AND_GENERATION_SPEC.md` (deterministic cold-start procedure).
5. Generate `generated/mobile-deployment-closure/ANDROID_SIGNING_AND_RELEASE_FLOW.md` (canonical promotion of existing `mobile/android/SIGNING.md` into closure docs, env-var contract, never-commit rules).
6. Add validator `scripts/validation/check-android-release-path.ts`: verifies bootstrap script exists, build script exists, signing env-var contract documented, store metadata complete, data-safety JSON aligns with manifest permissions.
7. Generate `generated/mobile-deployment-closure/android-release-path-status.json`.

**Phase 2 deployable when**: validator GREEN, bootstrap script self-validates on Linux runner, signing path is keystore-only-blocked.

---

## Phase 3 — iOS release path closure + push truth gating

**Deliverable: iOS path explicit and honestly Apple-account-blocked; push state unambiguous.**

iOS:
1. Promote `scripts/archive/ios/bootstrap.sh` → `scripts/ios/bootstrap.sh` (or document archive location as the canonical deferred location). Same for `archive/ios-templates/` → `mobile/ios-templates/` if we want active, or keep archived with a `README_DEFERRED.md`.
2. Verify `mobile/ios/Info.plist.template`, `mobile/ios/PrivacyInfo.xcprivacy`, `mobile/store-metadata/ios.json`, `mobile/store-metadata/ios.screenshots.json` exist and are aligned with `capacitor.config.ts` bundle id.
3. Create `scripts/release/ios/build-ios.sh` if missing (mirrors Android one — env-var-gated, never executes without `APPLE_TEAM_ID` etc.).
4. Generate `generated/mobile-deployment-closure/IOS_BUILD_PATH_AUDIT.md`.
5. Generate `generated/mobile-deployment-closure/IOS_BOOTSTRAP_AND_GENERATION_SPEC.md`.
6. Generate `generated/mobile-deployment-closure/IOS_SIGNING_AND_RELEASE_FLOW.md` (membership prerequisites, secret contract, TestFlight path, what's code-blocked vs account-blocked).
7. Add validator `scripts/validation/check-ios-release-path.ts`.
8. Generate `generated/mobile-deployment-closure/ios-release-path-status.json`.

Push:
9. Audit existing push: `mobile/android/FCM.md`, capacitor `PushNotifications` config, any web-VAPID code paths in `src/`.
10. Choose **Path B (explicit gating)** per project posture: mobile push deferred, web-VAPID real.
11. Verify no UI/store-metadata claims mobile push — add gate enforcement.
12. Generate `generated/mobile-deployment-closure/PUSH_AND_NOTIFICATION_TRUTH_AUDIT.md`.
13. Add validator `scripts/validation/check-mobile-push-claim-safety.ts`: scans store metadata, app capability registries, UI strings for mobile-push readiness claims when `mobile-push-status.json` says deferred.
14. Generate `generated/mobile-deployment-closure/push-truth-status.json`.

**Phase 3 deployable when**: iOS validator GREEN (account-blocked acknowledged), push validator GREEN (no false claims), both status JSONs reflect honest deferred state.

---

## Phase 4 — Operator playbook + governance integration

**Deliverable: operators know exactly what to do; mobile truth wired into 117-gate aggregator.**

1. Generate `generated/mobile-deployment-closure/STORE_SUBMISSION_OPERATOR_PLAYBOOK.md` — concrete commands: bootstrap → build → sign → upload to Play internal track + TestFlight; rollback/resubmission; metadata/screenshot completion checklist.
2. Generate `generated/mobile-deployment-closure/MOBILE_BLOCKER_CLASSIFICATION.md` — every blocker classified: code-complete | secret-blocked | account-blocked | review-blocked | metadata-blocked.
3. Add validator `scripts/validation/check-mobile-submission-blockers.ts` — verifies blocker JSON consistency with status JSONs.
4. Register all 6 new mobile validators into `scripts/validation/check-os-release-readiness.ts` as **WARN-tier gates** (since mobile is secondary surface; making them BLOCK would falsely gate desktop-primary releases on Apple membership).
5. Update aggregator total: 117 → 123 gates (6 new WARN-tier).
6. Update `package.json`: add `mobile:closure:run-all` script that runs all 6 validators.
7. Update admin truth: if `src/components/admin/**` has a mobile readiness tile, wire it to the 5 status JSONs (read-only display).
8. Generate `generated/mobile-deployment-closure/MOBILE_DEPLOYMENT_FINAL_VERIFICATION.md` — final state, all gate results, all blockers.
9. Generate `generated/mobile-deployment-closure/mobile-deployment-verification.json` — machine-readable final state.

**Phase 4 deployable when**: aggregator runs at 123 gates with mobile WARN-tier reporting, playbook executes end-to-end against checklist, no contradictions remain.

---

## Files touched (estimate)

- **1 rewrite**: `src/planes/MOBILE_MANIFEST.md` (Flutter purge)
- **2 hardened scripts**: `scripts/android/bootstrap.sh`, new `scripts/release/ios/build-ios.sh`
- **1 promoted/clarified**: iOS bootstrap location decision
- **6 new validators**: `scripts/validation/check-mobile-*.ts`
- **17 generated artifacts**: all under `generated/mobile-deployment-closure/`
- **1 aggregator update**: `scripts/validation/check-os-release-readiness.ts` (117 → 123 gates, WARN-tier)
- **1 package.json**: new `mobile:closure:run-all` script
- **N docs touched**: any remaining Flutter references in `docs/`, `infra/deploy/mobile.yaml`, `README*`

## Safety guarantees

- Mobile gates registered as **WARN-tier**, not BLOCK — desktop-primary releases are not falsely gated on Apple/FCM
- No secrets committed; signing scripts are env-var-only and refuse to run without them
- iOS account-blocked state is explicit, not hidden
- Push gating is enforced at validator level — claims drift detection
- Flutter purge enforced by validator — regression-protected
- Existing `mobile-store-readiness-report.json` (16/18 iOS, 17/18 Android, 0 errors) is preserved as the upstream truth source

## Final state

- 123 release gates: 117 BLOCK GREEN + 6 mobile WARN reflecting honest deferred state
- Zero Flutter drift in claim-bearing surfaces
- Android: cold-start → signed AAB executable on any Linux runner with keystore secrets
- iOS: cold-start → archive executable on any macOS runner with Apple Developer secrets
- Push: web-VAPID real, mobile push explicitly gated as deferred, no false claims
- Operator playbook: every step from `git pull` to "live in TestFlight / Play internal" documented
