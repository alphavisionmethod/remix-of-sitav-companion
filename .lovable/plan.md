

# Live Connector Completion + Notification Reality — Implementation Plan

## Current State Assessment

### What EXISTS and works:

**Connectors:**
- `connector_operations` edge function: seed, test, health check, demo activate, sync, disconnect
- `connector-health` edge function: pings configured connectors
- `provider-family-operations` edge function: Google family seeding, scope policies, drift checks
- DB tables: `connector_registry`, `connector_accounts`, `connector_oauth_tokens`, `connector_oauth_flows`, `connector_sync_runs`, `connector_health_records`, `connector_receipts`, `connector_policies`, `connector_launch_readiness`, `connector_demo_bindings`, `consent_ledger`, `consent_scope_records`, `consent_revocations`, `consent_upgrades`
- Admin pages: CN01-CN07 (Reality Overview, Registry, Account Linkage, Sync Truth, Health, Demo Review, Launch Gate)
- PFA01-PFA10 (Provider Family boards including OAuth client registry, consent ledger, scope matrix, health drift, connected accounts, launch honesty)
- ISA01-ISA07 (Identity/Security/Auth boards)
- Google provider family service with demo/real state management

**Notifications:**
- `push-dispatch` edge function: full VAPID web push + FCM + APNs dispatch with token cleanup
- `push-registration-service.ts`: web push subscription, token persistence, VAPID key handling
- `use-push-notifications.ts` hook: permission, register, unregister, refresh
- `sw-push.js` service worker: push event + notification click handling
- `NotificationCenter.tsx`: full UI with urgency classes, categories, mark read, dismiss
- DB tables: `notifications_queue`, `device_push_tokens`, `attention_decisions`, `interruption_policies`, `notification_fatigue_profiles`, `ambient_notification_routes`
- Admin pages: NRC01-NRC06 (Routing Studio, Calmness Center, Fatigue Board, Queue/Interrupt Matrix, Cross-Device Delivery, Launch Honesty)
- DWE04 (Notification Routing Studio with quiet hours)
- VAPID keys configured as secrets
- DB trigger `dispatch_push_notification` on `notifications_queue` insert

### What is MISSING (gaps):

**Connector gaps:**
1. **No real Google OAuth callback handler** — `connector_oauth_flows` table exists but no edge function handles the actual Google OAuth redirect, code exchange, or token persistence. The connect flow is architectural, not runtime-real.
2. **No real OAuth initiation endpoint** — no edge function generates the Google authorization URL with correct scopes and state parameter.
3. **Connected Services page doesn't have real connect/disconnect buttons wired to OAuth** — it shows demo state.

**Notification gaps:**
4. **No `notification_delivery_receipts` table** — push-dispatch writes to `notifications_queue.status` but doesn't persist per-delivery-attempt records (platform, success/fail, failure reason, latency).
5. **No notification preferences table** — no per-user/per-category channel preferences. `interruption_policies` handles quiet hours but not "I want email for finance, push for approvals" type preferences.
6. **No event-to-response tracking** — notifications are fire-and-forget. No link from "user clicked notification" back to the source event.
7. **Calm routing logic exists in admin UI (demo data) but is not wired into the push-dispatch flow** — `interruption_policies` table exists but push-dispatch doesn't check it before sending.

**Admin gaps:**
8. **No dedicated Connector Runtime Verification Board (CON01)** matching the prompt's exact spec — CN01 exists but doesn't show OAuth/callback/token verification matrix.
9. **No dedicated Notification Delivery Receipts Explorer (NOT03)** — no admin page for per-attempt delivery inspection.

## Implementation Plan

### Phase 1 — Database: Delivery receipts + notification preferences (migration)

Create 2 new tables:
- `notification_delivery_receipts`: notification_id, user_id, platform, channel, status (sent/delivered/failed/opened/clicked), failure_reason, latency_ms, sent_at, delivered_at, opened_at, metadata
- `notification_preferences`: user_id, category, channel_push (bool), channel_in_app (bool), channel_email (bool), urgency_minimum, enabled, updated_at

### Phase 2 — Google OAuth real flow (edge function)

Create `supabase/functions/connector-oauth/index.ts` with two actions:
- `initiate`: generates Google authorization URL with correct scopes, state param, redirect URI; writes `connector_oauth_flows` row with status=pending
- `callback`: handles the redirect, exchanges code for tokens, writes `connector_oauth_tokens`, updates `connector_accounts` status to connected, writes `consent_scope_records`, writes `connector_receipts`

This makes Google Drive connect/disconnect/reauth truly real.

### Phase 3 — Notification delivery receipts in push-dispatch

Update `push-dispatch/index.ts` to:
- Write a `notification_delivery_receipts` row per device attempt (platform, success/fail, failure_reason, latency)
- Check `interruption_policies` before sending (calm routing: suppress if in quiet hours and urgency < allowed)
- Check `notification_preferences` for channel permission

### Phase 4 — Connected Services UX truth

Update the Connected Services page to:
- Wire real "Connect Google Drive" button → calls `connector-oauth` initiate
- Show reauth prompts when `connector_oauth_tokens.reauth_required = true`
- Show honest state labels (not connected / connected / reauth required / planned)

### Phase 5 — Admin boards

**CON01 upgrade** (Connector Runtime Verification Board): Add OAuth verification matrix showing per-capability: OAuth configured?, callback verified?, token exchange verified?, connected accounts exist?, reauth flow verified?, disconnect verified?

**NOT03 new** (Notification Delivery Receipts Explorer): Query `notification_delivery_receipts` showing notification_id, platform, status, failure_reason, latency, timestamps.

**NOT04 upgrade** (Calm Policy Board): Wire to real `interruption_policies` data instead of demo data.

### Phase 6 — Customer Journey entries

Add journey entries for connector and notification flows:
- `connectors.google_drive_connect_entry`
- `notifications.permission_enable_web`
- `notifications.push_subscription_primary`
- `notifications.receive_web_push_primary`

## Files Changed

| File | Action |
|---|---|
| `supabase/functions/connector-oauth/index.ts` | **New** — OAuth initiate + callback |
| `supabase/functions/push-dispatch/index.ts` | Update — delivery receipts + calm check |
| `src/pages/admin/CN01ConnectorRealityOverview.tsx` | Update — verification matrix |
| `src/pages/admin/NOT03DeliveryReceiptsExplorer.tsx` | **New** |
| `src/pages/ConnectedServices.tsx` or equivalent | Update — real OAuth buttons |
| `src/lib/customer-journey/journey-registry.ts` | Add connector + notification journeys |
| `src/routes/AdminRoutes.tsx` | Add NOT03 route |

## Database migration required
2 new tables: `notification_delivery_receipts`, `notification_preferences`. RLS policies for both (user can read own rows).

