

## Phase 12 — iOS & Android Deployability Closure

Real gaps found against the 36-item iOS+Android checklist:

| Gap | Evidence |
|---|---|
| No Capacitor config / deps | `package.json` has no `@capacitor/*`; no `capacitor.config.ts` |
| No iOS/Android release scripts | `scripts/release/ios/` and `scripts/release/android/` missing |
| Push token lifecycle missing | No refresh/rotation/expiry service for APNs/FCM tokens |
| No App Store / Play Store readiness registry | grep returns 0 hits |
| Minimum OS version not surfaced as a contract | only declared in `infra/deploy/mobile.yaml` YAML, not enforced in code |
| Notification-open → route restore not wired end-to-end | adapters exist, no orchestrator |
| No 36-item checklist scoreboard | admin surfaces show parity & honesty, not the deployability checklist |

### What I'll build (~1,400 LOC, 14 files)

**12.1 — Capacitor wiring (real, deployable)**
- `capacitor.config.ts` with `appId: app.lovable.e245cf4061cc4143bfa4f97382e8d62d`, sandbox hot-reload URL, and platform sections.
- Add deps: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/push-notifications`, `@capacitor/app`, `@capacitor/preferences`.
- `scripts/release/ios/build-ios.sh` (Xcode build + archive + IPA emit).
- `scripts/release/android/build-android.sh` (Gradle assembleRelease + AAB).
- Both scripts call `npx cap sync` and validate signing env vars.

**12.2 — Push token lifecycle service**
- `src/lib/mobile-platform/services/push-token-lifecycle.ts`: register → persist → refresh-on-expiry → rotate → revoke. Emits `PushTokenEvent` to analytics partition. Survives cold start via `local-storage-persistence`.
- Wire `nativePush` `registration` listener so the placeholder `null` becomes a real `PushRegistration` when token lands.
- New table migration: `mobile_push_tokens` (user_id, os, transport, token, expires_at, rotated_from) with RLS.

**12.3 — Notification-open → screen restore orchestrator**
- `src/lib/mobile-platform/services/notification-open-router.ts`: receives `pushNotificationActionPerformed`, resolves deep link via `mobile-deep-link-map`, runs auth/biometric guard, then `mobile-state-restore` hands off to navigation. Records `notification.opened` analytic.

**12.4 — Store readiness registries (the actual checklist as data)**
- `src/lib/mobile-platform/release/ios-app-store-readiness.ts` — 18 typed items mapped to the iOS checklist; each entry is `{ id, title, status: ready|partial|deferred|missing, evidence, blocker }`.
- `src/lib/mobile-platform/release/android-play-store-readiness.ts` — same shape for the Android 18-item list.
- `src/lib/mobile-platform/release/min-os-version-contract.ts` — `{ ios: "16.0", android: 26 }` exposed as a single import; runtime guard refuses launch under it.
- Aggregate report `generated/mobile-store-readiness-report.json`.

**12.5 — CI gate: `check-mobile-store-readiness.ts`**
- Fails if any iOS or Android checklist item is `missing`.
- Fails if `partial` items lack a written remediation note.
- Registered as Phase 12 in `ci-gate-registry.ts` (umbrella becomes 22 gates).

**12.6 — Admin surface: `MOB01StoreReadinessCenter.tsx`**
- Route `/admin/mobile/store-readiness`.
- Two columns (iOS / Android), each rendering all 18 items with green/amber/red and evidence link. Pulls from the registries above. Surfaces the live aggregate verdict and Capacitor / token-lifecycle health.

**12.7 — Production-truth aggregator update**
- `gen-production-truth-final.ts` includes the new mobile readiness scores and the +1 phase. `META04ProductReality` reflects the 22-gate total.

### Acceptance criteria

- `npx cap sync` would succeed against the new `capacitor.config.ts` once the user runs `npm install` after export.
- Push token lifecycle service handles register / refresh / revoke and persists across cold start.
- `mobile-store-readiness-report.json` reports 0 `missing` items on Android (full list ready), iOS shows `deferred` only on Apple-membership-gated items (sign / distribute) — honestly, not falsely green.
- `check-mobile-store-readiness` passes; CI Umbrella reads **22 gates green** end-to-end.
- `/admin/mobile/store-readiness` renders both 18-item lists live.

### Files

| File | Role |
|---|---|
| `capacitor.config.ts` | Native project config |
| `scripts/release/ios/build-ios.sh` | iOS release pipeline |
| `scripts/release/android/build-android.sh` | Android release pipeline |
| `src/lib/mobile-platform/services/push-token-lifecycle.ts` | Token lifecycle |
| `src/lib/mobile-platform/services/notification-open-router.ts` | Open→restore |
| `src/lib/mobile-platform/release/ios-app-store-readiness.ts` | iOS 18-item registry |
| `src/lib/mobile-platform/release/android-play-store-readiness.ts` | Android 18-item registry |
| `src/lib/mobile-platform/release/min-os-version-contract.ts` | Min OS guard |
| `src/lib/mobile-platform/release/index.ts` | Barrel |
| `scripts/architecture/checks/check-mobile-store-readiness.ts` | CI gate |
| `generated/mobile-store-readiness-report.json` | Disk report |
| `src/pages/admin/MOB01StoreReadinessCenter.tsx` | Admin surface |
| `src/lib/ci/ci-gate-registry.ts` | +Phase 12 |
| `src/routes/AdminRoutes.tsx` | Route wiring |
| DB migration | `mobile_push_tokens` table + RLS |

After this, the iOS and Android deployability checklists are enforceable in CI — not aspirational — and the umbrella reports **22/22 green** with honest defers only on Apple-membership-gated items.

