

# Fix C-003: No Live OAuth Connector Flow

## Problem

The `connector-oauth` edge function is fully implemented (initiate, callback, disconnect, token exchange, consent logging). However, the flow is dead because:

1. **Missing secrets**: `GOOGLE_CONNECTOR_CLIENT_ID` and `GOOGLE_CONNECTOR_CLIENT_SECRET` are not configured
2. **No redirect handling**: When `system.connector.connect` calls the edge function and gets back `{ authorization_url: "..." }`, nothing redirects the user to Google's consent screen
3. **No callback route**: After Google redirects back, there's no client-side page to capture the `code` and `state` query params and call the `callback` action

## Fix Plan

### Step 1: Request Google OAuth secrets
Use `add_secret` to prompt the user to provide `GOOGLE_CONNECTOR_CLIENT_ID` and `GOOGLE_CONNECTOR_CLIENT_SECRET`. These come from the Google Cloud Console (APIs & Services → Credentials → OAuth 2.0 Client IDs). The redirect URI to configure in Google Console is: `{SUPABASE_URL}/functions/v1/connector-oauth`.

### Step 2: Update `system.connector.connect` capability to handle redirect
In `src/lib/capabilities/system-capabilities.ts`, after receiving the `authorization_url` from the edge function, open it via `window.location.href` to redirect the user to Google's consent screen.

### Step 3: Create OAuth callback page
Create `src/pages/OAuthCallback.tsx` — a small page mounted at `/oauth/callback` that:
- Reads `code` and `state` from URL query params
- Calls `supabase.functions.invoke("connector-oauth", { body: { action: "callback", code, state } })`
- Shows success/error and redirects to Connector Hub

### Step 4: Add callback route
Register `/oauth/callback` in the router (likely `App.tsx` or wherever routes are defined).

### Step 5: Update edge function callback to support GET redirect
Update `connector-oauth/index.ts` to also handle GET requests at the callback (since Google redirects via GET with `?code=...&state=...`). Add a GET handler that exchanges the token and redirects the user back to the app with a success/error status parameter.

### Step 6: Update ConnectorHub connect button
In `ConnectorHub.tsx`, update the connect button's `onClick` to properly handle the `authorization_url` response — either by using `window.open()` or redirecting directly.

### Step 7: Deploy edge function
Deploy the updated `connector-oauth` edge function.

## Files Changed
- **Create**: `src/pages/OAuthCallback.tsx` (~60 lines)
- **Edit**: `src/lib/capabilities/system-capabilities.ts` (handle redirect in connect capability)
- **Edit**: `supabase/functions/connector-oauth/index.ts` (add GET callback handler)
- **Edit**: Router file (add `/oauth/callback` route)
- **Edit**: `src/pages/ConnectorHub.tsx` (handle authorization_url in connect response)

## Important Note
You will need to provide Google OAuth client credentials. These are created in the Google Cloud Console under APIs & Services → Credentials. The authorized redirect URI should be set to your edge function URL.

