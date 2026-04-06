
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Provider Family Architecture Schema (fixed)
-- ═══════════════════════════════════════════════════════════════

-- 1. Provider Families
CREATE TABLE public.provider_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  auth_types_supported TEXT[] DEFAULT '{"oauth2"}',
  identity_support BOOLEAN DEFAULT false,
  connector_support BOOLEAN DEFAULT true,
  demo_support BOOLEAN DEFAULT true,
  health_model TEXT DEFAULT 'basic',
  launch_stage TEXT DEFAULT 'planned',
  active BOOLEAN DEFAULT true,
  docs_url TEXT,
  setup_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_key, user_id)
);
ALTER TABLE public.provider_families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own provider families" ON public.provider_families FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_provider_families_updated_at BEFORE UPDATE ON public.provider_families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Provider Capabilities
CREATE TABLE public.provider_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE NOT NULL,
  capability_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  auth_requirement TEXT DEFAULT 'oauth2',
  minimum_scopes TEXT[] DEFAULT '{}',
  optional_scopes TEXT[] DEFAULT '{}',
  read_write TEXT DEFAULT 'read',
  sync_support BOOLEAN DEFAULT false,
  health_support BOOLEAN DEFAULT false,
  upgrade_path_support BOOLEAN DEFAULT false,
  launch_stage TEXT DEFAULT 'planned',
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(capability_key, user_id)
);
ALTER TABLE public.provider_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own provider capabilities" ON public.provider_capabilities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_provider_capabilities_updated_at BEFORE UPDATE ON public.provider_capabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. OAuth Client Registry
CREATE TABLE public.oauth_client_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_purpose TEXT NOT NULL DEFAULT 'connector_web',
  allowed_capabilities TEXT[] DEFAULT '{}',
  environment TEXT DEFAULT 'production',
  redirect_uris TEXT[] DEFAULT '{}',
  authorized_origins TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  rotation_metadata JSONB DEFAULT '{}',
  launch_stage TEXT DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.oauth_client_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own oauth clients" ON public.oauth_client_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_oauth_client_registry_updated_at BEFORE UPDATE ON public.oauth_client_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Consent Ledger
CREATE TABLE public.consent_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  oauth_client_id UUID REFERENCES public.oauth_client_registry(id) ON DELETE SET NULL,
  granted_scopes TEXT[] DEFAULT '{}',
  denied_scopes TEXT[] DEFAULT '{}',
  consent_version INTEGER DEFAULT 1,
  consent_status TEXT DEFAULT 'active',
  connection_context JSONB DEFAULT '{}',
  source_flow TEXT DEFAULT 'manual',
  mode TEXT DEFAULT 'real',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  entity_id TEXT,
  workspace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consent" ON public.consent_ledger FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_consent_ledger_updated_at BEFORE UPDATE ON public.consent_ledger FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Consent Upgrades
CREATE TABLE public.consent_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_ledger_id UUID REFERENCES public.consent_ledger(id) ON DELETE CASCADE NOT NULL,
  previous_scopes TEXT[] DEFAULT '{}',
  new_scopes TEXT[] DEFAULT '{}',
  upgrade_reason TEXT,
  approved_by TEXT,
  approval_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_upgrades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consent upgrades" ON public.consent_upgrades FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Consent Revocations
CREATE TABLE public.consent_revocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_ledger_id UUID REFERENCES public.consent_ledger(id) ON DELETE CASCADE NOT NULL,
  revocation_reason TEXT NOT NULL DEFAULT 'user_requested',
  impacted_capabilities TEXT[] DEFAULT '{}',
  revoked_scopes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_revocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own revocations" ON public.consent_revocations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Scope Policy Matrix
CREATE TABLE public.scope_policy_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE CASCADE NOT NULL,
  minimum_scopes TEXT[] DEFAULT '{}',
  optional_scopes TEXT[] DEFAULT '{}',
  disallowed_scopes TEXT[] DEFAULT '{}',
  default_grant_profile TEXT DEFAULT 'read_only',
  upgrade_path_available BOOLEAN DEFAULT false,
  approval_required_for_upgrade BOOLEAN DEFAULT false,
  launch_safety_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_capability_id, user_id)
);
ALTER TABLE public.scope_policy_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scope policies" ON public.scope_policy_matrix FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_scope_policy_matrix_updated_at BEFORE UPDATE ON public.scope_policy_matrix FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Scope Recommendations
CREATE TABLE public.scope_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE CASCADE,
  requested_scopes TEXT[] DEFAULT '{}',
  recommended_scopes TEXT[] DEFAULT '{}',
  removed_scopes TEXT[] DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  approval_needed BOOLEAN DEFAULT false,
  launch_safe BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scope_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scope recommendations" ON public.scope_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Permission Levels
CREATE TABLE public.permission_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE CASCADE NOT NULL,
  current_level TEXT DEFAULT 'none',
  granted_scopes TEXT[] DEFAULT '{}',
  max_available_level TEXT DEFAULT 'read_only',
  upgrade_available BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_capability_id, user_id)
);
ALTER TABLE public.permission_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own permission levels" ON public.permission_levels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_permission_levels_updated_at BEFORE UPDATE ON public.permission_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Permission Drift Records
CREATE TABLE public.permission_drift_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  drift_type TEXT NOT NULL DEFAULT 'unknown',
  description TEXT,
  impacted_capabilities TEXT[] DEFAULT '{}',
  severity TEXT DEFAULT 'medium',
  reconnect_needed BOOLEAN DEFAULT false,
  reauth_needed BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.permission_drift_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own drift records" ON public.permission_drift_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. Add provider_capability_id to existing connector_health_records
ALTER TABLE public.connector_health_records ADD COLUMN IF NOT EXISTS provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE SET NULL;

-- 12. Unified Account Nodes
CREATE TABLE public.unified_account_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  node_type TEXT NOT NULL DEFAULT 'principal',
  display_name TEXT,
  email TEXT,
  entity_id TEXT,
  workspace_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.unified_account_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own account nodes" ON public.unified_account_nodes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_unified_account_nodes_updated_at BEFORE UPDATE ON public.unified_account_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Unified Account Edges
CREATE TABLE public.unified_account_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_node_id UUID REFERENCES public.unified_account_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES public.unified_account_nodes(id) ON DELETE CASCADE NOT NULL,
  edge_type TEXT NOT NULL DEFAULT 'identity_link',
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.unified_account_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own account edges" ON public.unified_account_edges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. Identity Provider Links
CREATE TABLE public.identity_provider_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT,
  email TEXT,
  display_name TEXT,
  auth_method TEXT DEFAULT 'oauth2',
  primary_identity BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_provider_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own identity links" ON public.identity_provider_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_identity_provider_links_updated_at BEFORE UPDATE ON public.identity_provider_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Connected Service Links
CREATE TABLE public.connected_service_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE CASCADE NOT NULL,
  connection_status TEXT DEFAULT 'disconnected',
  permission_level TEXT DEFAULT 'none',
  granted_scopes TEXT[] DEFAULT '{}',
  mode TEXT DEFAULT 'real',
  last_sync_at TIMESTAMPTZ,
  health_status TEXT DEFAULT 'unknown',
  reauth_needed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connected_service_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own service links" ON public.connected_service_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_connected_service_links_updated_at BEFORE UPDATE ON public.connected_service_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Device Auth Clients
CREATE TABLE public.device_auth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_class TEXT NOT NULL DEFAULT 'web',
  client_name TEXT NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE SET NULL,
  oauth_client_id UUID REFERENCES public.oauth_client_registry(id) ON DELETE SET NULL,
  device_type TEXT,
  platform TEXT,
  active BOOLEAN DEFAULT true,
  last_auth_at TIMESTAMPTZ,
  launch_stage TEXT DEFAULT 'planned',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.device_auth_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own device clients" ON public.device_auth_clients FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_device_auth_clients_updated_at BEFORE UPDATE ON public.device_auth_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Integration Launch Honesty
CREATE TABLE public.integration_launch_honesty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  launch_label TEXT DEFAULT 'shell_only',
  evidence JSONB DEFAULT '{}',
  blockers TEXT[] DEFAULT '{}',
  notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_launch_honesty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own launch honesty" ON public.integration_launch_honesty FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_integration_launch_honesty_updated_at BEFORE UPDATE ON public.integration_launch_honesty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
