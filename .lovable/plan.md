

# Push Notifications — APNs / FCM / Web Push Implementation Plan

## Current State

- **notifications_queue** table exists with in-app notification support
- **Realtime hook** (`use-realtime-notifications.ts`) delivers in-app toasts and Electron native notifications
- **Communication service** is client-side only with simulated delivery — no actual push dispatch
- **No `device_push_tokens` table** — nowhere to store FCM/APNs/Web Push tokens
- **No push dispatch edge function** — nothing sends to FCM or APNs
- **No Web Push subscription** — no service worker push handler, no VAPID keys
- **Ecosystem seeder** references `apns`/`fcm` channels but they are metadata-only, not wired

## Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Browser/PWA  │────▶│ device_push_     │     │  push-dispatch  │
│ iOS/Android  │     │ tokens (table)   │◀────│  edge function  │
│ Electron     │     └──────────────────┘     └────────┬────────┘
└─────────────┘                                        │
                    ┌──────────────────┐     ┌─────────▼────────┐
                    │ notifications_   │────▶│ DB trigger:      │
                    │ queue            │     │ dispatch_push    │
                    └──────────────────┘     └──────────────────┘
                                                       │
                                          ┌────────────┼────────────┐
                                          ▼            ▼            ▼
                                        FCM         APNs       Web Push
```

## Implementation Steps

### Step 1: Database — `device_push_tokens` table + trigger

Create migration:
- **`device_push_tokens`** table: `id`, `user_id` (FK auth.users), `platform` (enum: `web`, `ios`, `android`, `electron`), `token` (text, unique), `endpoint` (text, nullable — for Web Push), `auth_key` / `p256dh` (text, nullable — Web Push keys), `device_name`, `active` (bool), `last_used_at`, `created_at`, `updated_at`
- RLS: users manage own tokens only
- **DB trigger** on `notifications_queue` INSERT → calls `push-dispatch` edge function via `pg_net` (or inserts into a dispatch queue the edge function polls)

### Step 2: Edge Function — `push-dispatch`

Create `supabase/functions/push-dispatch/index.ts`:
- Triggered per notification (or batch polls `notifications_queue` where `channel = 'push'` and `status = 'pending'`)
- Looks up all active tokens for `user_id` from `device_push_tokens`
- **FCM path**: POST to `https://fcm.googleapis.com/v1/projects/{project}/messages:send` with service account key (secret: `FCM_SERVICE_ACCOUNT_JSON`)
- **APNs path**: POST to `https://api.push.apple.com/3/device/{token}` with JWT signed by APNs key (secrets: `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_PRIVATE_KEY`, `APNS_BUNDLE_ID`)
- **Web Push path**: Use `web-push` protocol — VAPID-signed POST to subscription endpoint (secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
- Updates `notifications_queue.status` to `delivered` / `failed`
- Removes invalid tokens (410 Gone from APNs, `NotRegistered` from FCM)

### Step 3: Frontend — Push Token Registration Service

Create `src/lib/services/push-notification/push-registration-service.ts`:
- **Web Push**: Request `Notification.permission`, call `serviceWorkerRegistration.pushManager.subscribe()` with VAPID public key, save subscription to `device_push_tokens`
- **Capacitor (iOS/Android)**: Import `@capacitor/push-notifications`, register, listen for `registration` event, save token with platform `ios`/`android`
- **Electron**: Already handled via IPC bridge — register Electron's native token
- Provides `registerPushToken()`, `unregisterPushToken()`, `refreshToken()`

### Step 4: Service Worker — Push Event Handler

Update or create service worker push handler (compatible with PWA setup):
- Listen for `push` event, parse payload, show `self.registration.showNotification()`
- Listen for `notificationclick`, navigate to `action_url`

### Step 5: React Hook — `usePushNotifications`

Create `src/hooks/use-push-notifications.ts`:
- On mount (if authenticated): check permission status, auto-register if granted
- Provides `requestPermission()`, `isSupported`, `isRegistered`, `permissionState`
- Integrates with existing `useRealtimeNotifications` (realtime = in-app toasts, push = native OS)

### Step 6: Settings UI Integration

Update `MobileSettings.tsx` and create desktop notification settings:
- Toggle to enable/disable push notifications (calls register/unregister)
- Show registered devices from `device_push_tokens`
- Quiet hours integration (already in notifications_queue trigger logic)

### Step 7: Communication Service Wiring

Update `CommunicationService.send()`:
- When `channel === "push"`, insert into `notifications_queue` with `channel: 'push'` instead of simulating delivery
- The DB trigger + edge function handles actual dispatch

### Step 8: Tests

- Unit tests for token registration service (mock service worker API)
- Integration test for push-dispatch edge function (mock FCM/APNs responses)
- E2E test for permission flow

## Secrets Required

| Secret | Purpose |
|--------|---------|
| `VAPID_PUBLIC_KEY` | Web Push VAPID identification |
| `VAPID_PRIVATE_KEY` | Web Push signing |
| `VAPID_SUBJECT` | Web Push contact (mailto:) |
| `FCM_SERVICE_ACCOUNT_JSON` | Firebase Cloud Messaging auth |
| `APNS_KEY_ID` | Apple Push Notification Service |
| `APNS_TEAM_ID` | Apple Developer Team |
| `APNS_PRIVATE_KEY` | APNs JWT signing key |
| `APNS_BUNDLE_ID` | iOS app bundle identifier |

## Files Created/Modified

| File | Action |
|------|--------|
| `supabase/migrations/xxx_device_push_tokens.sql` | Create table + trigger |
| `supabase/functions/push-dispatch/index.ts` | New edge function |
| `src/lib/services/push-notification/push-registration-service.ts` | New service |
| `src/hooks/use-push-notifications.ts` | New hook |
| `src/lib/services/communication-service/index.ts` | Wire push channel |
| `src/hooks/use-realtime-notifications.ts` | Minor integration |
| `src/pages/mobile/MobileSettings.tsx` | Wire real toggle |
| `public/sw-push.js` | Service worker push handler |
| Tests (unit + integration + e2e) | New test files |

