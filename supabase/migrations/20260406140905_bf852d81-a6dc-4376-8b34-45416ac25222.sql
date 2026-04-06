
-- ============================================================
-- 1. Create identity_provider_registry FIRST (referenced by identity_provider_links FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.identity_provider_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE CASCADE,
  provider_capability_id uuid REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  identity_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  auth_method text NOT NULL DEFAULT 'oauth2',
  default_scopes jsonb NOT NULL DEFAULT '[]',
  platform_scope text NOT NULL DEFAULT 'web',
  launch_stage text NOT NULL DEFAULT 'planned',
  is_active boolean NOT NULL DEFAULT true,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_provider_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ipr_select" ON public.identity_provider_registry FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ipr_insert" ON public.identity_provider_registry FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ipr_update" ON public.identity_provider_registry FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. Create other new tables
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permission_upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connected_service_account_id uuid REFERENCES public.connected_service_links(id) ON DELETE CASCADE NOT NULL,
  requested_permission_level text NOT NULL,
  current_permission_level text NOT NULL,
  requested_scopes jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending',
  approval_required boolean NOT NULL DEFAULT false,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.permission_upgrade_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pur_select" ON public.permission_upgrade_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pur_insert" ON public.permission_upgrade_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pur_update" ON public.permission_upgrade_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.auth_connector_separation_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE SET NULL,
  issue_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  details jsonb NOT NULL DEFAULT '{}',
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.auth_connector_separation_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acsa_select" ON public.auth_connector_separation_audits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "acsa_insert" ON public.auth_connector_separation_audits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.identity_session_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  identity_provider_key text,
  provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT 'login',
  ip_address text,
  user_agent text,
  session_id text,
  trust_posture text DEFAULT 'standard',
  anomaly_detected boolean NOT NULL DEFAULT false,
  anomaly_reason text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_session_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "isa_select" ON public.identity_session_audit FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "isa_insert" ON public.identity_session_audit FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.connector_disconnection_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connected_service_account_id uuid REFERENCES public.connected_service_links(id) ON DELETE CASCADE NOT NULL,
  provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE SET NULL,
  provider_capability_id uuid REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  disconnect_reason text NOT NULL DEFAULT 'user_initiated',
  previous_permission_level text,
  previous_scopes jsonb NOT NULL DEFAULT '[]',
  initiated_by text NOT NULL DEFAULT 'user',
  metadata jsonb NOT NULL DEFAULT '{}',
  user_id uuid NOT NULL,
  disconnected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_disconnection_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cde_select" ON public.connector_disconnection_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cde_insert" ON public.connector_disconnection_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. Add columns to existing tables
-- ============================================================
ALTER TABLE public.unified_account_nodes
  ADD COLUMN IF NOT EXISTS node_ref_id uuid,
  ADD COLUMN IF NOT EXISTS provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE SET NULL;

ALTER TABLE public.consent_ledger
  ADD COLUMN IF NOT EXISTS consent_type text DEFAULT 'connector_grant',
  ADD COLUMN IF NOT EXISTS previous_scopes jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.identity_provider_links
  ADD COLUMN IF NOT EXISTS identity_provider_registry_id uuid REFERENCES public.identity_provider_registry(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS linked_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'real';

ALTER TABLE public.connected_service_links
  ADD COLUMN IF NOT EXISTS account_label text,
  ADD COLUMN IF NOT EXISTS external_account_id text,
  ADD COLUMN IF NOT EXISTS external_account_email text,
  ADD COLUMN IF NOT EXISTS external_account_name text,
  ADD COLUMN IF NOT EXISTS workspace_id uuid,
  ADD COLUMN IF NOT EXISTS entity_id uuid,
  ADD COLUMN IF NOT EXISTS disconnected_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_health_check_at timestamptz;

-- ============================================================
-- 4. Create views
-- ============================================================
CREATE OR REPLACE VIEW public.v_connected_accounts_center AS
SELECT
  csl.id, csl.user_id, csl.connection_status, csl.permission_level,
  csl.health_status, csl.last_sync_at, csl.mode, csl.account_label,
  csl.external_account_id, csl.external_account_email, csl.granted_scopes,
  csl.reauth_needed, csl.last_health_check_at, csl.created_at,
  pf.name AS provider_family_name, pf.provider_key AS provider_family_key,
  pc.display_name AS capability_name, pc.capability_key, pc.category AS capability_category,
  spm.default_grant_profile, spm.minimum_scopes AS policy_minimum_scopes, spm.upgrade_path_available
FROM public.connected_service_links csl
LEFT JOIN public.provider_families pf ON csl.provider_family_id = pf.id
LEFT JOIN public.provider_capabilities pc ON csl.provider_capability_id = pc.id
LEFT JOIN public.scope_policy_matrix spm ON spm.provider_capability_id = pc.id;

CREATE OR REPLACE VIEW public.v_identity_methods AS
SELECT
  ipl.id, ipl.user_id, ipl.email, ipl.display_name, ipl.avatar_url,
  ipl.auth_method, ipl.primary_identity, ipl.active, ipl.external_id,
  ipl.linked_at, ipl.revoked_at, ipl.last_verified_at, ipl.last_used_at, ipl.mode,
  pf.name AS provider_family_name, pf.provider_key AS provider_family_key,
  ipr.identity_key, ipr.platform_scope, ipr.launch_stage AS registry_launch_stage
FROM public.identity_provider_links ipl
LEFT JOIN public.provider_families pf ON ipl.provider_family_id = pf.id
LEFT JOIN public.identity_provider_registry ipr ON ipl.identity_provider_registry_id = ipr.id;

CREATE OR REPLACE VIEW public.v_consent_history AS
SELECT
  cl.id, cl.user_id, cl.consent_type, cl.consent_status,
  cl.granted_scopes, cl.denied_scopes, cl.previous_scopes,
  cl.revoked_at, cl.revocation_reason, cl.source_flow, cl.mode, cl.notes,
  cl.granted_at, cl.created_at,
  pf.name AS provider_family_name, pf.provider_key AS provider_family_key,
  pc.display_name AS capability_name, pc.capability_key
FROM public.consent_ledger cl
LEFT JOIN public.provider_families pf ON cl.provider_family_id = pf.id
LEFT JOIN public.provider_capabilities pc ON cl.provider_capability_id = pc.id;

CREATE OR REPLACE VIEW public.v_account_graph_summary AS
SELECT
  n.id AS node_id, n.user_id, n.node_type, n.display_name, n.email,
  n.entity_id, n.node_ref_id, n.provider_family_id,
  pf.name AS provider_family_name, pf.provider_key AS provider_family_key,
  (SELECT count(*) FROM public.unified_account_edges e
   WHERE e.source_node_id = n.id OR e.target_node_id = n.id) AS edge_count,
  n.created_at
FROM public.unified_account_nodes n
LEFT JOIN public.provider_families pf ON n.provider_family_id = pf.id;

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ipr_family ON public.identity_provider_registry(provider_family_id);
CREATE INDEX IF NOT EXISTS idx_pur_account ON public.permission_upgrade_requests(connected_service_account_id);
CREATE INDEX IF NOT EXISTS idx_pur_status ON public.permission_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_acsa_type ON public.auth_connector_separation_audits(issue_type);
CREATE INDEX IF NOT EXISTS idx_isa_user ON public.identity_session_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_isa_created ON public.identity_session_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cde_account ON public.connector_disconnection_events(connected_service_account_id);

-- ============================================================
-- 6. Triggers
-- ============================================================
CREATE TRIGGER update_identity_provider_registry_ts
  BEFORE UPDATE ON public.identity_provider_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
