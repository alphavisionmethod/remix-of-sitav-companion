
# SITA OS — Phase 3: Real Google OAuth Connector Completion

## Current State Assessment

**What Already Exists (Strong Foundation):**
- `connector-oauth` edge function: 366 lines — full initiate/callback/disconnect with Zod validation, state tokens, token exchange, consent ledger, receipts ✅
- `connector-proxy` edge function: 162 lines — gateway proxy for Slack/Resend/Twilio ✅
- `ConnectorHub.tsx`: 337 lines — queries connector_accounts, connector_registry, OAuth config check, connect/disconnect mutations wired ✅
- 10+ connector DB tables: connector_accounts, connector_oauth_flows, connector_oauth_tokens, connector_credentials, consent_scope_records, consent_ledger, connector_receipts, connector_disconnection_events, connector_health_records, connector_launch_readiness ✅
- Auth/connector separation types: `src/lib/types/auth-connector-separation.types.ts` ✅
- Multiple admin connector pages: CN01-CN07, ISA02, ISA07, PFA07, PFA09 ✅

**What's Missing (Blockers):**
1. **GOOGLE_CONNECTOR_CLIENT_ID and GOOGLE_CONNECTOR_CLIENT_SECRET secrets** — not set (only 9 secrets exist, neither is present)
2. **connector-proxy doesn't support Google Drive** — only maps Slack/Resend/Twilio
3. **No reauth mutation** in ConnectorHub UI
4. **ConnectorHub UX** doesn't show premium connection states (reauth_required, limited_scope, etc.)
5. **No OAuth callback return page** — after Google redirects back, user needs a landing page
6. **Admin connector boards** (CN01-CN07) need real data wiring

## Implementation Plan (8 Steps)

### Step 1: Add Google Connector OAuth Secrets
- Request `GOOGLE_CONNECTOR_CLIENT_ID` and `GOOGLE_CONNECTOR_CLIENT_SECRET` via secrets tool
- These are separate from Google Auth login credentials

### Step 2: Create OAuth Callback Landing Page
- New page at `/connectors/callback` that handles the redirect from Google
- Extracts `code` and `state` from URL params
- Calls `connector-oauth` with `action: "callback"`
- Shows success/error state and returns user to ConnectorHub

### Step 3: Add Google Drive to connector-proxy
- Add `google_drive` to CONNECTOR_KEYS mapping
- Add Google Drive API actions (list files, get file metadata)
- Use stored OAuth tokens from connector_oauth_tokens table

### Step 4: Upgrade ConnectorHub UX to Premium States
- Add reauth mutation
- Show all connector states: connected, reauth_required, limited_scope, disconnected, planned
- Premium Google Drive card with scope summary
- Proper connect/reconnect/disconnect affordances

### Step 5: Add Reauth Flow
- Add `action: "reauth"` handler to connector-oauth edge function
- Detect expired/revoked tokens and surface reauth_required state
- Add token refresh logic using refresh_token

### Step 6: Wire Admin Connector Boards with Real Data
- CN01 (Connector Reality Overview): real connector_accounts + oauth_flows data
- PFA09 (Connected Accounts Center): live account status, token health
- ISA07 (Auth Connector Truth Board): separation audit data

### Step 7: Add Connector Journey Evidence
- Seed customer journey entries for connector flows
- Update journey truth based on runtime proof

### Step 8: Deploy and Verify
- Deploy updated edge functions
- Test OAuth config check endpoint
- Verify UI states render correctly

## Estimated Effort: ~4-6 hours
## Files Changed: ~8-12 files
