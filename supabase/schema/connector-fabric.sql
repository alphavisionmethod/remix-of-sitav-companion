-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: connector-fabric
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 3
-- Last generated: 2026-04-16T21:35:49.932Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260405164049_14ba72ef-6d1e-4b10-9ad4-cde64747a076.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Integration Hub Schema
-- ═══════════════════════════════════════════════════════════════

-- 1. Integration Providers (catalog)
CREATE TABLE public.integration_providers (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  auth_type TEXT NOT NULL DEFAULT 'oauth2',
  icon_url TEXT,
  supported_scopes JSONB DEFAULT '[]'::jsonb,
  supported_objects JSONB DEFAULT '[]'::jsonb,
  supported_actions JSONB DEFAULT '[]'::jsonb,
  supports_writes BOOLEAN DEFAULT false,
  supports_webhooks BOOLEAN DEFAULT false,
  requires_approval_for_writes BOOLEAN DEFAULT true,
  default_risk_level TEXT DEFAULT 'medium',
  setup_instructions TEXT,
  docs_url TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read providers"
  ON public.integration_providers FOR SELECT
  TO authenticated USING (true);

-- 2. Integration Connections
CREATE TABLE public.integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  provider_id TEXT NOT NULL REFERENCES public.integration_providers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  scopes TEXT[] DEFAULT '{}',
  external_account_id TEXT,
  external_account_name TEXT,
  mode TEXT NOT NULL DEFAULT 'simple',
  metadata JSONB DEFAULT '{}'::jsonb,
  last_health_check_at TIMESTAMPTZ,
  last_health_status TEXT,
  last_sync_at TIMESTAMPTZ,
  last_error_code TEXT,
  last_error_message_redacted TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ic_tenant ON public.integration_connections(tenant_id);
CREATE INDEX idx_ic_provider ON public.integration_connections(provider_id);

ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tenant connections"
  ON public.integration_connections FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Integration Credentials (encrypted)
CREATE TABLE public.integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE,
  encrypted_payload TEXT NOT NULL,
  key_version INTEGER NOT NULL DEFAULT 1,
  token_type TEXT DEFAULT 'oauth2',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_icred_conn ON public.integration_credentials(connection_id);

ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Credentials accessible by connection owner"
  ON public.integration_credentials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.integration_connections c
      WHERE c.id = connection_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.integration_connections c
      WHERE c.id = connection_id AND c.user_id = auth.uid()
    )
  );

-- 4. Sync Runs
CREATE TABLE public.integration_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  sync_type TEXT NOT NULL DEFAULT 'pull',
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  stats_json JSONB DEFAULT '{}'::jsonb,
  error_redacted TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_isr_conn ON public.integration_sync_runs(connection_id);
CREATE INDEX idx_isr_tenant ON public.integration_sync_runs(tenant_id);

ALTER TABLE public.integration_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant sync runs"
  ON public.integration_sync_runs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.integration_connections c
      WHERE c.id = connection_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.integration_connections c
      WHERE c.id = connection_id AND c.user_id = auth.uid()
    )
  );

-- 5. Action Requests (Approval Workflow)
CREATE TABLE public.integration_action_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES public.integration_connections(id),
  action_type TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'proposed',
  requested_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_by UUID,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  payload_json JSONB DEFAULT '{}'::jsonb,
  dry_run_result JSONB,
  execution_result JSONB,
  execution_started_at TIMESTAMPTZ,
  execution_ended_at TIMESTAMPTZ,
  execution_error_redacted TEXT,
  spending_cap_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_iar_tenant ON public.integration_action_requests(tenant_id);
CREATE INDEX idx_iar_status ON public.integration_action_requests(status);
CREATE INDEX idx_iar_conn ON public.integration_action_requests(connection_id);

ALTER TABLE public.integration_action_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tenant action requests"
  ON public.integration_action_requests FOR ALL
  TO authenticated
  USING (requested_by = auth.uid() OR approved_by = auth.uid())
  WITH CHECK (requested_by = auth.uid());

-- 6. Integration Audit Logs
CREATE TABLE public.integration_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  connection_id UUID,
  event_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata_redacted JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ial_tenant ON public.integration_audit_logs(tenant_id);
CREATE INDEX idx_ial_event ON public.integration_audit_logs(event_type);
CREATE INDEX idx_ial_conn ON public.integration_audit_logs(connection_id);

ALTER TABLE public.integration_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their tenant audit logs"
  ON public.integration_audit_logs FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid());

CREATE POLICY "Users can insert their tenant audit logs"
  ON public.integration_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- 7. Routing Rules (Agency Mode)
CREATE TABLE public.integration_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_id TEXT,
  project_name TEXT,
  match_rules JSONB DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_irr_tenant ON public.integration_routing_rules(tenant_id);
CREATE INDEX idx_irr_conn ON public.integration_routing_rules(connection_id);

ALTER TABLE public.integration_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tenant routing rules"
  ON public.integration_routing_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.integration_connections c
      WHERE c.id = connection_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.integration_connections c
      WHERE c.id = connection_id AND c.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_integration_providers_updated_at BEFORE UPDATE ON public.integration_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integration_connections_updated_at BEFORE UPDATE ON public.integration_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integration_credentials_updated_at BEFORE UPDATE ON public.integration_credentials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integration_action_requests_updated_at BEFORE UPDATE ON public.integration_action_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integration_routing_rules_updated_at BEFORE UPDATE ON public.integration_routing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260405235356_34c60d90-5763-4743-9a8a-c80f61042126.sql ──
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

-- ── 20260406103340_7a49373f-0074-4032-8cce-c35ab3008c98.sql ──
CREATE TABLE IF NOT EXISTS public.connector_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connector_id UUID,
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  records_synced INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync logs"
  ON public.connector_sync_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs"
  ON public.connector_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_connector_sync_logs_user ON public.connector_sync_logs(user_id);
CREATE INDEX idx_connector_sync_logs_connector ON public.connector_sync_logs(connector_id);
