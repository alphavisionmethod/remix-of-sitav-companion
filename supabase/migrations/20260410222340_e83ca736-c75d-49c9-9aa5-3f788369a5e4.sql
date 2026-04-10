
-- ══════════════════════════════════════════════════════════════
-- Gap 1: Create oauth_state_sessions table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.oauth_state_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider_family_id uuid REFERENCES public.provider_families(id),
  provider_capability_id uuid REFERENCES public.provider_capabilities(id),
  oauth_client_registry_id uuid REFERENCES public.oauth_client_registry(id),
  state_token text UNIQUE NOT NULL,
  code_verifier text,
  redirect_uri text,
  requested_scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  flow_type text NOT NULL DEFAULT 'connector_grant',
  status text NOT NULL DEFAULT 'initiated',
  initiated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.oauth_state_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own oauth state sessions"
  ON public.oauth_state_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_oauth_state_sessions_user ON public.oauth_state_sessions(user_id);
CREATE INDEX idx_oauth_state_sessions_state ON public.oauth_state_sessions(state_token);
CREATE INDEX idx_oauth_state_sessions_status ON public.oauth_state_sessions(status);
CREATE INDEX idx_oauth_state_sessions_expires ON public.oauth_state_sessions(expires_at);

-- ══════════════════════════════════════════════════════════════
-- Gap 2: Add missing columns to connector_oauth_tokens
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.connector_oauth_tokens
  ADD COLUMN IF NOT EXISTS oauth_client_registry_id uuid REFERENCES public.oauth_client_registry(id),
  ADD COLUMN IF NOT EXISTS scope_string text,
  ADD COLUMN IF NOT EXISTS refresh_failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS refresh_failure_reason text,
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'real';

-- ══════════════════════════════════════════════════════════════
-- Gap 3: Add performance indexes
-- ══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_csl_user ON public.connected_service_links(user_id);
CREATE INDEX IF NOT EXISTS idx_csl_provider_family ON public.connected_service_links(provider_family_id);
CREATE INDEX IF NOT EXISTS idx_csl_capability ON public.connected_service_links(provider_capability_id);
CREATE INDEX IF NOT EXISTS idx_csl_status ON public.connected_service_links(connection_status);
CREATE INDEX IF NOT EXISTS idx_ipl_user ON public.identity_provider_links(user_id);
CREATE INDEX IF NOT EXISTS idx_ipl_provider_family ON public.identity_provider_links(provider_family_id);
CREATE INDEX IF NOT EXISTS idx_cl_user ON public.consent_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_cl_capability ON public.consent_ledger(provider_capability_id);
CREATE INDEX IF NOT EXISTS idx_cl_type ON public.consent_ledger(consent_type);
CREATE INDEX IF NOT EXISTS idx_cot_account ON public.connector_oauth_tokens(account_id);
CREATE INDEX IF NOT EXISTS idx_cot_expires ON public.connector_oauth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_cot_reauth ON public.connector_oauth_tokens(reauth_required);
CREATE INDEX IF NOT EXISTS idx_chr_account ON public.connector_health_records(account_id);
CREATE INDEX IF NOT EXISTS idx_chr_status ON public.connector_health_records(health_status);
