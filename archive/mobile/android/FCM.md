# Firebase Cloud Messaging — Provisioning Notes

> Capability: `push-fcm` (Android only)
> Status: **deferred** — credentials provisioned at deploy time, not source-controlled.

## What's needed

| Asset | How to obtain |
|---|---|
| `google-services.json` | Firebase Console → Project Settings → Android app → `google-services.json` |
| FCM service-account JSON | Firebase Console → Project Settings → Service Accounts → Generate new private key |

## Where they go

- `google-services.json` → **never commit**. Provided to CI via `GOOGLE_SERVICES_JSON_BASE64` secret; written to `android/app/google-services.json` at build time.
- FCM service-account JSON → Supabase secret `FCM_SERVICE_ACCOUNT_JSON`, consumed by the `push-dispatcher` edge function.

## Why deferred

The mobile build pipeline produces a working `.aab` even without `google-services.json` — push simply degrades to web-VAPID. Adding the FCM credentials enables native Android push without code changes.

## Test flow

1. Add `GOOGLE_SERVICES_JSON_BASE64` to repo secrets.
2. Run the `mobile-build` workflow with `with_fcm=true`.
3. Install the resulting `.aab` on a device, sign in, accept push permission.
4. Trigger a push from the admin shell → device receives notification within ~3s.
