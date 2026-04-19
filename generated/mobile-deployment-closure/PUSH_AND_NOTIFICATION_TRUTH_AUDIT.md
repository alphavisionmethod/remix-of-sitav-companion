# Push & Notification Truth Audit

## Decision: Path B — explicit gating

Mobile push (APNs + FCM) is **deferred**. Web Push (VAPID) is **active**. UI and store metadata reflect this honestly.

## Transport matrix

| Transport | Status | Blocker | Code path |
|---|---|---|---|
| Web Push (VAPID) | ✅ **active** | none | `src/lib/push/web-vapid-*` |
| Ubuntu-native notifications | ✅ active | none | Electron `Notification` API |
| iOS APNs | ⚠ **deferred** | Apple Developer membership + APNs key | wired in `infra/deploy/mobile.yaml`, gated until secrets exist |
| Android FCM | ⚠ **deferred** | `google-services.json` + service-account JSON | wired in `mobile/android/FCM.md`, gated until file dropped |

## Where the truth lives

| File | What it asserts |
|---|---|
| `infra/deploy/mobile.yaml` | `apns.status: deferred`, `fcm.status: deferred`, `transport_resolution.web: vapid` |
| `mobile/ios/SIGNING.md` | "Status: DEFERRED — Apple Developer Program membership not yet active" |
| `mobile/android/FCM.md` | "Status: deferred — credentials provisioned at deploy time" |
| `src/planes/MOBILE_MANIFEST.md` | Mobile push table marks both as deferred |
| `memory/constraints/notification-scope` | Ground-truth: web-VAPID active, mobile push deferred, no readiness blocker |

## What is forbidden

- Store listings (`mobile/store-metadata/{android,ios}.json`) advertising "push notifications" as a current capability
- UI components/pages claiming "Mobile push is enabled / active / ready / live"
- Documentation implying mobile push works without explicit "deferred" qualifier

These are enforced by `scripts/validation/check-mobile-push-claim-safety.ts`.

## What is allowed

- Web push UI ("Enable browser notifications") — real, shipped
- Ubuntu-native notification UI — real, shipped via Electron
- Mention of mobile push in roadmap/architecture docs **with** explicit `deferred` qualifier
- Capacitor push plugin presence in `package.json` — graceful no-op without credentials

## Capacitor wiring (no-op without credentials)

The Capacitor push plugins are installed and will register transparently when:
- iOS: APNs key present in App Store Connect + provisioning profile includes `aps-environment`
- Android: `android/app/google-services.json` present at build time

Until then, `PushNotifications.register()` either no-ops or returns a clear "credentials missing" error — it does not falsely claim success.

## How to flip mobile push from `deferred` → `active`

### iOS APNs
1. Activate Apple Developer membership (see `IOS_SIGNING_AND_RELEASE_FLOW.md`)
2. Generate APNs Auth Key (.p8) in Apple Developer → Keys
3. Set Supabase secrets: `APNS_KEY_ID`, `APNS_TEAM_ID` (= `APPLE_TEAM_ID`), `APNS_PRIVATE_KEY` (.p8 contents)
4. Update `infra/deploy/mobile.yaml` → `apns.status: active`
5. Re-run `check-mobile-push-claim-safety.ts` — gate stays GREEN

### Android FCM
1. Create Firebase project linked to Play Console
2. Add Android app `com.sita.os` → download `google-services.json`
3. Add `GOOGLE_SERVICES_JSON_BASE64` repo secret
4. Add `FCM_SERVICE_ACCOUNT_JSON` Supabase secret (consumed by `push-dispatcher` edge function)
5. Update `infra/deploy/mobile.yaml` → `fcm.status: active`
6. Re-run validator — gate stays GREEN

No source code changes required for either flip. The push plugins were always there; the credentials were the gate.
