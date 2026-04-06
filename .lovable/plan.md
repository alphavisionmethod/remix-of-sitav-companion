
# Provider Family Architecture Implementation Plan

## Database Migration (1 migration, ~18 tables)

| Table | Purpose |
|---|---|
| `provider_families` | Google, Microsoft, Apple, Stripe, Slack, etc. |
| `provider_capabilities` | Sub-capabilities (google_drive, google_gmail, etc.) |
| `oauth_client_registry` | OAuth clients by purpose (web_auth, connector, ios, android) |
| `consent_ledger` | All granted/revoked permissions with full audit trail |
| `consent_scope_records` | Individual scope grants per consent entry |
| `consent_upgrades` | Permission upgrade history |
| `consent_revocations` | Revocation records with reasons |
| `scope_policy_matrix` | Min/optional/disallowed scopes per capability |
| `permission_drift_records` | Detected drift events (expired tokens, reduced scopes) |
| `connector_health_records` | Health status per connector instance |
| `unified_account_nodes` | Principal/user nodes in identity graph |
| `unified_account_edges` | Links between identity and connector accounts |
| `identity_provider_links` | Identity provider connections (sign-in) |
| `connected_service_links` | Connector service connections (Drive, Gmail, etc.) |
| `device_auth_clients` | Future device-bound auth client registry |
| `integration_launch_honesty` | Launch readiness labels per integration |
| `scope_recommendations` | Scope minimization engine output |
| `permission_levels` | Current permission level per connector |

All with RLS (user_id = auth.uid()).

## Edge Function: `provider-family-operations`
Actions: `seed_provider_families`, `seed_google_family`, `seed_scope_policies`, `check_permission_drift`, `generate_scope_recommendation`, `account_graph_report`

## Admin Pages (10 pages)
- PFA01 — Provider Family Registry Console
- PFA02 — Provider Capability Matrix
- PFA03 — OAuth Client Registry Board
- PFA04 — Consent Ledger Explorer
- PFA05 — Scope Policy Matrix Board
- PFA06 — Permission Upgrade Center
- PFA07 — Connector Health & Drift Board
- PFA08 — Unified Account Graph Explorer
- PFA09 — Connected Accounts Center (user-facing)
- PFA10 — Integration Launch Honesty Board

## Routes
All at `/admin/pfa/*` except PFA09 at `/settings/connected-accounts`

## Google Seed Data
- Provider family: Google
- Capabilities: google_identity, google_drive, google_gmail, google_calendar
- OAuth Client 1: SITA Web Auth (openid, profile, email)
- OAuth Client 2: SITA Connector Access (drive, gmail, calendar scopes)
- OAuth Client 3/4: iOS/Android (planned)
- Scope policies for each capability
