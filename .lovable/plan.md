

# Fix: Notification Delivery Edge Functions + VAPID + E2E Tests

## Current State

**Edge functions (push-dispatch, push-track, vapid-public-key):** All three are fully implemented (476, 58, 9 lines respectively) with VAPID signing, FCM, APNs, calm routing, preference checks, and delivery receipts. Code is solid.

**VAPID keys:** All three secrets (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`) are configured. Client-side `VITE_VAPID_PUBLIC_KEY` is in `.env`. Service worker `sw-push.js` handles push/click/dismiss events.

**What's missing:**
1. **No Deno tests** for any of the 3 push edge functions (push-dispatch, push-track, vapid-public-key)
2. **No E2E test** covering the push notification delivery flow (the existing `tests/integration/push-notification-flow.test.ts` is a unit-level mock test, not a real end-to-end test)
3. **vapid-public-key function** is too bare — no input validation, no rate limiting, no auth check (any caller gets the key, which is fine for public keys but should at least match the pattern of other functions)

## Implementation

### 1. Create Deno tests for all 3 push edge functions

**Create:** `supabase/functions/vapid-public-key/index_test.ts`
- Test CORS preflight returns 200
- Test GET returns `{ vapid_public_key: string }` with non-empty value
- Verify response has correct Content-Type and security headers

**Create:** `supabase/functions/push-track/index_test.ts`
- Test CORS preflight
- Test POST with valid `{ notification_id, action: "clicked" }` — expect success or DB error (acceptable in test env)
- Test missing fields returns 400
- Test invalid action returns 400
- Test GET returns 405

**Create:** `supabase/functions/push-dispatch/index_test.ts`
- Test CORS preflight
- Test POST with missing `user_id` returns 400
- Test POST with missing `title` returns 400
- Test POST with valid payload but no tokens returns `{ sent: 0, reason: "no_active_tokens" }`

### 2. Create real E2E push notification test

**Create:** `tests/e2e/push-notification-e2e.spec.ts`

Playwright E2E test that:
- Navigates to login, authenticates
- Goes to `/settings` or `/profile` and enables push notifications (mocking the browser Permission API to auto-grant)
- Verifies the push toggle state persists
- Calls the `vapid-public-key` edge function and asserts a valid key is returned
- Calls `push-track` with a mock notification_id and verifies the response

### 3. Harden vapid-public-key edge function

**Modify:** `supabase/functions/vapid-public-key/index.ts`
- Add method check (only GET/OPTIONS)
- Add response caching header (`Cache-Control: public, max-age=3600`)
- Return 500 if VAPID_PUBLIC_KEY env var is empty (instead of silently returning empty string)

### 4. Update health checker script

**Modify:** `scripts/check-edge-function-health.ts`
- Add `push-dispatch`, `push-track`, `vapid-public-key` to the required functions list so they're tracked in CI

## Files

| Action | File |
|---|---|
| Create | `supabase/functions/vapid-public-key/index_test.ts` |
| Create | `supabase/functions/push-track/index_test.ts` |
| Create | `supabase/functions/push-dispatch/index_test.ts` |
| Create | `tests/e2e/push-notification-e2e.spec.ts` |
| Modify | `supabase/functions/vapid-public-key/index.ts` — harden with method check, cache headers, empty-key guard |
| Modify | `scripts/check-edge-function-health.ts` — add 3 push functions to required list |

