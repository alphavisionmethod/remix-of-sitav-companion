

# SITA OS — Schema Completion Audit: Gaps Found & Fix Plan

## Audit Results

### Tables: 22/23 exist — 1 missing

| Table | Status |
|-------|--------|
| provider_families | Exists with equivalent columns |
| provider_capabilities | Exists with equivalent columns |
| oauth_client_registry | Exists |
| identity_provider_registry | Exists |
| identity_provider_links (linked_identity_providers) | Exists |
| connected_service_links (connected_service_accounts) | Exists with all required columns |
| connector_oauth_tokens | Exists — **missing 4 columns** |
| connector_health_records | Exists |
| connector_sync_runs | Exists |
| scope_policy_matrix | Exists |
| consent_ledger | Exists |
| permission_upgrade_requests | Exists |
| unified_account_nodes | Exists |
| unified_account_edges | Exists |
| auth_connector_separation_audits | Exists |
| identity_session_audit | Exists |
| connector_disconnection_events | Exists |
| integration_launch_honesty | Exists |
| device_auth_clients | Exists |
| **oauth_state_sessions** | **MISSING** |

### Views: 4/4 exist
All views (`v_connected_accounts_center`, `v_identity_methods`, `v_consent_history`, `v_account_graph_summary`) exist.

### RLS: Enabled on all tables
All tables have RLS enabled with user-scoped policies.

## Remaining Gaps (3 items)

### Gap 1 — `oauth_state_sessions` table does not exist
Required by Part 4, Table 19. Tracks OAuth initiation/callback state for CSRF protection during connector authorization flows.

### Gap 2 — `connector_oauth_tokens` missing columns
Currently has: `id, user_id, account_id, access_token, refresh_token, token_type, expires_at, scopes, reauth_required, last_refreshed_at, refresh_failure_count, metadata, created_at, updated_at`

Missing per spec:
- `oauth_client_registry_id uuid` — FK to oauth_client_registry, needed to track which OAuth client issued the token
- `scope_string text` — raw scope string from provider
- `refresh_failed_at timestamptz` — when last refresh failed
- `refresh_failure_reason text` — why refresh failed
- `mode text default 'real'` — dual-reality support

### Gap 3 — Missing performance indexes
Most tables only have PK indexes. The spec requires indexes on FK columns, state columns, and timestamp columns for query performance. Tables affected:
- `connected_service_links`: needs indexes on `user_id`, `provider_family_id`, `provider_capability_id`, `connection_status`
- `identity_provider_links`: needs indexes on `user_id`, `provider_family_id`
- `consent_ledger`: needs indexes on `user_id`, `provider_capability_id`, `consent_type`
- `connector_oauth_tokens`: needs indexes on `account_id`, `expires_at`, `reauth_required`
- `connector_health_records`: needs index on `account_id`, `health_status`

## Implementation Plan

### Migration 1 — Create `oauth_state_sessions` table
```sql
CREATE TABLE oauth_state_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider_family_id uuid REFERENCES provider_families(id),
  provider_capability_id uuid REFERENCES provider_capabilities(id),
  oauth_client_registry_id uuid REFERENCES oauth_client_registry(id),
  state_token text UNIQUE NOT NULL,
  code_verifier text,
  redirect_uri text,
  requested_scopes jsonb DEFAULT '[]',
  flow_type text NOT NULL DEFAULT 'connector_grant',
  status text NOT NULL DEFAULT 'initiated',
  initiated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE oauth_state_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own oauth states" ON oauth_state_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_oauth_state_sessions_user ON oauth_state_sessions(user_id);
CREATE INDEX idx_oauth_state_sessions_state ON oauth_state_sessions(state_token);
CREATE INDEX idx_oauth_state_sessions_status ON oauth_state_sessions(status);
```

### Migration 2 — Add missing columns to `connector_oauth_tokens`
```sql
ALTER TABLE connector_oauth_tokens
  ADD COLUMN IF NOT EXISTS oauth_client_registry_id uuid REFERENCES oauth_client_registry(id),
  ADD COLUMN IF NOT EXISTS scope_string text,
  ADD COLUMN IF NOT EXISTS refresh_failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS refresh_failure_reason text,
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'real';
```

### Migration 3 — Add performance indexes
```sql
CREATE INDEX IF NOT EXISTS idx_csl_user ON connected_service_links(user_id);
CREATE INDEX IF NOT EXISTS idx_csl_provider_family ON connected_service_links(provider_family_id);
CREATE INDEX IF NOT EXISTS idx_csl_capability ON connected_service_links(provider_capability_id);
CREATE INDEX IF NOT EXISTS idx_csl_status ON connected_service_links(connection_status);
CREATE INDEX IF NOT EXISTS idx_ipl_user ON identity_provider_links(user_id);
CREATE INDEX IF NOT EXISTS idx_ipl_provider_family ON identity_provider_links(provider_family_id);
CREATE INDEX IF NOT EXISTS idx_cl_user ON consent_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_cl_capability ON consent_ledger(provider_capability_id);
CREATE INDEX IF NOT EXISTS idx_cl_type ON consent_ledger(consent_type);
CREATE INDEX IF NOT EXISTS idx_cot_account ON connector_oauth_tokens(account_id);
CREATE INDEX IF NOT EXISTS idx_cot_expires ON connector_oauth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_cot_reauth ON connector_oauth_tokens(reauth_required);
CREATE INDEX IF NOT EXISTS idx_chr_account ON connector_health_records(account_id);
CREATE INDEX IF NOT EXISTS idx_chr_status ON connector_health_records(health_status);
```

### What This Does NOT Do
- No table renames (existing names are semantically equivalent)
- No column renames (existing column names work fine)
- No RLS changes (current policies are correctly scoped)
- No view changes (all 4 views already work)
- No frontend code changes needed

### Summary
3 migrations total. 1 new table, 5 new columns, 15 new indexes. Zero duplicates, zero stubs.

