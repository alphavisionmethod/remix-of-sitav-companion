

# Audit: Last 2 Prompts — Implementation Status

## Prompt 1: "Connectors + Notifications Advanced Prompt Pack" (5 sub-prompts)

### Sub-prompt 1: Google Drive Connector — 95% DONE
- **DONE**: `connector-oauth` edge function (366 lines) with initiate/callback/disconnect/check_config
- **DONE**: Real Google OAuth code exchange, token persistence, consent ledger writes
- **DONE**: Identity vs connector OAuth separation, default scopes for Drive/Gmail/Calendar
- **DONE**: ConnectorHub wired with Connect/Disconnect buttons
- **MISSING**: `GOOGLE_CONNECTOR_CLIENT_ID` + `GOOGLE_CONNECTOR_CLIENT_SECRET` secrets (manual step — user must register Google Cloud OAuth client)

### Sub-prompt 2: Web Push / VAPID — 90% DONE
- **DONE**: VAPID secrets configured, `push-registration-service.ts`, `use-push-notifications.ts` hook, `sw-push.js` service worker
- **DONE**: `push-dispatch` edge function (476 lines) with real VAPID web push, delivery receipts, calm routing, preference checks
- **DONE**: DB tables: `notification_delivery_receipts`, `notification_preferences`
- **MISSING**: No dedicated user-facing notification preferences page — `/settings/notifications` routes to generic `SettingsPage`, not a real notification preferences UI

### Sub-prompt 3: Connector Runtime Verification Board — 85% DONE
- **DONE**: CN01 with 7-point OAuth verification matrix, registry listing, health records
- **MISSING**: Per-capability verification rows (google_drive, gmail, calendar individually)
- **MISSING**: Connected account diagnostics with scope/expiry columns
- **MISSING**: Failure diagnostics grouped by type (missing env, callback failure, token expired, etc.)

### Sub-prompt 4: Notification Runtime Verification Board — 40% DONE
- **DONE**: NOT03 Delivery Receipts Explorer, NRC01-NRC06 existing boards
- **MISSING**: `NOT01NotificationRuntimeVerification.tsx` — the single canonical "is push actually working?" board with executive summary, channel verification matrix, subscription truth, launch honesty panel
- **MISSING**: Subscription truth section (device_push_tokens stats in admin)

### Sub-prompt 5: Seed Data for Launch-Honesty Classification — 0% DONE
- **MISSING**: `connector-notification-honesty-seed.ts` service with conservative defaults (google_drive → partial, apple_push → planned, etc.)
- **MISSING**: NRC06 still uses demo data, not wired to real `notification_delivery_receipts`

### Missing CJ Entries
- **MISSING**: `connectors.google_drive_reauth_primary`
- **MISSING**: `connectors.google_drive_disconnect_primary`
- **MISSING**: `notifications.preference_update_primary`
- **MISSING**: `notifications.event_to_response_primary`

---

## Prompt 2: "Live AI Runtime Verification & Activation" (4 parts) — 100% DONE

- **DONE**: `AIG09RuntimeVerification.tsx` (549 lines) — full 8-section board (AIR01-AIR08)
- **DONE**: `ai-launch-honesty-reclassifier.ts` (173 lines) — evidence-driven reclassification
- **DONE**: `ai-routing-seed-service.ts` (294 lines) — providers, models, capability routing seeds
- **DONE**: Routes for AIG07, AIG08, AIG09 added to App.tsx
- **DONE**: All 7 target capabilities, all 6 honesty classes, claim risk + blocking gaps

---

## Gap Implementation Plan (7 items)

### 1. NOT01 Notification Runtime Verification Board (NEW)
Create `src/pages/admin/NOT01NotificationRuntimeVerification.tsx` with:
- Executive summary cards: active subscriptions, delivery success/failure rates, calm suppressions, Apple/Android planned status
- Channel verification matrix (web push / in-app / android planned / apple planned)
- Subscription truth section querying `device_push_tokens`
- Launch honesty classification panel

### 2. Notification Preferences User Page (NEW)
Create `src/pages/settings/NotificationPreferences.tsx` with:
- Push permission state display
- Enable/disable push toggle using `usePushNotifications` hook
- Per-category channel toggles (push/in-app) reading/writing `notification_preferences` table
- Urgency minimum per category
- Wire route in App.tsx

### 3. Connector-Notification Honesty Seed Service (NEW)
Create `src/lib/services/connector-notification-honesty-seed.ts`:
- Seeds `ecosystem_launch_readiness` with conservative defaults: google_drive → partial, gmail/calendar → planned, web_push → partial, android_push → planned, apple_push → planned, in_app → partial
- Promotion rules metadata

### 4. CN01 Enhancement — Per-Capability Matrix + Diagnostics
Update `CN01ConnectorRealityOverview.tsx`:
- Add per-capability rows (google_drive, gmail, calendar) with individual verification checks
- Add connected account detail table with scope, expiry, reauth columns
- Add failure diagnostics grouped by category

### 5. NRC06 Wire to Real Data
Update `NRC06NotificationLaunchHonesty.tsx`:
- Query real `notification_delivery_receipts` and `device_push_tokens` for evidence-based classification
- Replace demo data with computed reality scores

### 6. Missing Customer Journey Entries
Add 4 entries to `journey-registry.ts`:
- `connectors.google_drive_reauth_primary`
- `connectors.google_drive_disconnect_primary`
- `notifications.preference_update_primary`
- `notifications.event_to_response_primary`

### 7. Route Wiring
Update `App.tsx`:
- Add NOT01 route under admin
- Replace `/settings/notifications` to use new `NotificationPreferences` page

## Files

| File | Action |
|---|---|
| `src/pages/admin/NOT01NotificationRuntimeVerification.tsx` | **New** |
| `src/pages/settings/NotificationPreferences.tsx` | **New** |
| `src/lib/services/connector-notification-honesty-seed.ts` | **New** |
| `src/pages/admin/CN01ConnectorRealityOverview.tsx` | Update |
| `src/pages/admin/NRC06NotificationLaunchHonesty.tsx` | Update |
| `src/lib/customer-journey/journey-registry.ts` | Add 4 entries |
| `src/App.tsx` | Add NOT01 route + NotificationPreferences route |

## No database migration needed
All tables exist. Pure frontend + service logic.

