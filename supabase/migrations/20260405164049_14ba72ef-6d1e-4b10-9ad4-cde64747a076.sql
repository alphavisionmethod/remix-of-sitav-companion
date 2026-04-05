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