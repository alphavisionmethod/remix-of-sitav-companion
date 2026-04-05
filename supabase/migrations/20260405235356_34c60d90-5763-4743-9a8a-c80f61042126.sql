
-- Connector Registry: defines supported connector types
CREATE TABLE IF NOT EXISTS public.connector_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connector_id text NOT NULL,
  provider text NOT NULL,
  display_name text NOT NULL,
  connector_class text NOT NULL DEFAULT 'real' CHECK (connector_class IN ('real','user_linked','internal_test','demo')),
  auth_method text NOT NULL DEFAULT 'oauth2' CHECK (auth_method IN ('oauth2','api_key','none','internal')),
  read_supported boolean NOT NULL DEFAULT true,
  write_supported boolean NOT NULL DEFAULT false,
  sync_supported boolean NOT NULL DEFAULT true,
  launch_stage text NOT NULL DEFAULT 'shell' CHECK (launch_stage IN ('shell','framework_ready','reference_implemented','user_connectable','pilot_ready','launch_ready','demo_only','internal_test_only')),
  mode_support text[] NOT NULL DEFAULT '{"production"}',
  policy_profile text DEFAULT 'read_only',
  health_model text DEFAULT 'standard',
  description text,
  icon_url text,
  metadata jsonb DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(connector_id, user_id)
);

ALTER TABLE public.connector_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_registry" ON public.connector_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_registry_class ON public.connector_registry(connector_class);

-- Connector Accounts: user-linked connector instances
CREATE TABLE IF NOT EXISTS public.connector_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  registry_id uuid REFERENCES public.connector_registry(id) ON DELETE CASCADE,
  connector_type text NOT NULL,
  provider_account_id text,
  display_name text,
  account_email text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','connected','disconnected','reauth_required','expired','error','demo_simulated','internal_test')),
  demo_mode boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_accounts" ON public.connector_accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_accounts_type ON public.connector_accounts(connector_type);
CREATE INDEX idx_connector_accounts_status ON public.connector_accounts(status);

-- Connector OAuth Tokens: secure token storage
CREATE TABLE IF NOT EXISTS public.connector_oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid REFERENCES public.connector_accounts(id) ON DELETE CASCADE NOT NULL,
  access_token text,
  refresh_token text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz,
  scopes text[] DEFAULT '{}',
  reauth_required boolean NOT NULL DEFAULT false,
  last_refreshed_at timestamptz,
  refresh_failure_count integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_oauth_tokens" ON public.connector_oauth_tokens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Connector Auth Sessions: OAuth flow tracking
CREATE TABLE IF NOT EXISTS public.connector_auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connector_type text NOT NULL,
  state text NOT NULL UNIQUE,
  redirect_uri text,
  code_verifier text,
  scopes text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','callback_received','completed','failed','expired')),
  error_message text,
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_auth_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_auth_sessions" ON public.connector_auth_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Connector Sync Runs: detailed sync execution
CREATE TABLE IF NOT EXISTS public.connector_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid REFERENCES public.connector_accounts(id) ON DELETE CASCADE NOT NULL,
  sync_type text NOT NULL DEFAULT 'incremental' CHECK (sync_type IN ('full','incremental','on_demand','scheduled')),
  trigger text NOT NULL DEFAULT 'manual' CHECK (trigger IN ('manual','scheduled','webhook','system')),
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','partial','failed','cancelled')),
  records_fetched integer NOT NULL DEFAULT 0,
  records_imported integer NOT NULL DEFAULT 0,
  records_skipped integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  errors jsonb DEFAULT '[]',
  duration_ms integer,
  cursor_position text,
  metadata jsonb DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_sync_runs" ON public.connector_sync_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_sync_runs_account ON public.connector_sync_runs(account_id);
CREATE INDEX idx_connector_sync_runs_status ON public.connector_sync_runs(status);

-- Connector Health Records
CREATE TABLE IF NOT EXISTS public.connector_health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid REFERENCES public.connector_accounts(id) ON DELETE CASCADE,
  registry_id uuid REFERENCES public.connector_registry(id) ON DELETE CASCADE,
  health_status text NOT NULL DEFAULT 'unknown' CHECK (health_status IN ('healthy','degraded','unhealthy','token_expired','reauth_required','not_configured','demo_simulated','internal_test','shell_only','unknown')),
  latency_ms integer,
  error_message text,
  token_valid boolean,
  last_successful_sync timestamptz,
  consecutive_failures integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_health_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_health_records" ON public.connector_health_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Connector Receipts: audit trail
CREATE TABLE IF NOT EXISTS public.connector_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid REFERENCES public.connector_accounts(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('connect','disconnect','sync_start','sync_complete','sync_fail','reauth','token_refresh','token_refresh_fail','health_check','policy_block','demo_activate')),
  connector_type text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_receipts" ON public.connector_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_receipts_type ON public.connector_receipts(event_type);

-- Connector Policies: safety rules
CREATE TABLE IF NOT EXISTS public.connector_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  registry_id uuid REFERENCES public.connector_registry(id) ON DELETE CASCADE NOT NULL,
  read_only boolean NOT NULL DEFAULT true,
  write_enabled boolean NOT NULL DEFAULT false,
  approval_required_for_write boolean NOT NULL DEFAULT true,
  demo_blocks_write boolean NOT NULL DEFAULT true,
  max_sync_records integer DEFAULT 1000,
  sync_interval_minutes integer DEFAULT 60,
  allowed_scopes text[] DEFAULT '{}',
  blocked_operations text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_policies" ON public.connector_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Connector Demo Bindings
CREATE TABLE IF NOT EXISTS public.connector_demo_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  registry_id uuid REFERENCES public.connector_registry(id) ON DELETE CASCADE,
  scenario_name text NOT NULL,
  connector_type text NOT NULL,
  synthetic_data jsonb DEFAULT '{}',
  synthetic_files jsonb DEFAULT '[]',
  synthetic_messages jsonb DEFAULT '[]',
  synthetic_sync_history jsonb DEFAULT '[]',
  pre_linked boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_demo_bindings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_demo_bindings" ON public.connector_demo_bindings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Connector Launch Readiness
CREATE TABLE IF NOT EXISTS public.connector_launch_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  registry_id uuid REFERENCES public.connector_registry(id) ON DELETE CASCADE NOT NULL,
  connector_type text NOT NULL,
  readiness_stage text NOT NULL DEFAULT 'shell_only' CHECK (readiness_stage IN ('shell_only','framework_ready','reference_implemented','user_connectable','pilot_ready','launch_ready','demo_only','internal_test_only')),
  oauth_working boolean NOT NULL DEFAULT false,
  token_storage_working boolean NOT NULL DEFAULT false,
  sync_working boolean NOT NULL DEFAULT false,
  health_reporting boolean NOT NULL DEFAULT false,
  disconnect_working boolean NOT NULL DEFAULT false,
  demo_available boolean NOT NULL DEFAULT false,
  blockers text[] DEFAULT '{}',
  evidence jsonb DEFAULT '{}',
  classification text DEFAULT 'not_ready',
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_launch_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_launch_readiness" ON public.connector_launch_readiness FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_connector_registry_updated_at BEFORE UPDATE ON public.connector_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_accounts_updated_at BEFORE UPDATE ON public.connector_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_oauth_tokens_updated_at BEFORE UPDATE ON public.connector_oauth_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_policies_updated_at BEFORE UPDATE ON public.connector_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_demo_bindings_updated_at BEFORE UPDATE ON public.connector_demo_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_launch_readiness_updated_at BEFORE UPDATE ON public.connector_launch_readiness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
