-- ═══════════════════════════════════════════════════════════════
-- Phase 9B — Tenant Self-Service Console
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.tenant_self_service_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid,
  action_kind text NOT NULL CHECK (action_kind IN (
    'kill_switch_toggle','quota_change','federation_optin','federation_optout',
    'webhook_subscribe','webhook_unsubscribe','api_key_create','api_key_revoke'
  )),
  target_ref text NOT NULL,
  before_state jsonb,
  after_state jsonb,
  justification text,
  receipt_hash text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','reverted')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_self_service_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenants read own tssa" ON public.tenant_self_service_actions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tenants insert own tssa" ON public.tenant_self_service_actions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins read all tssa" ON public.tenant_self_service_actions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.tenant_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid,
  quota_key text NOT NULL,
  quota_value bigint NOT NULL DEFAULT 0,
  hard_ceiling bigint NOT NULL DEFAULT 0,
  current_usage bigint NOT NULL DEFAULT 0,
  reset_period text NOT NULL DEFAULT 'daily' CHECK (reset_period IN ('hourly','daily','weekly','monthly')),
  last_reset_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quota_key)
);
ALTER TABLE public.tenant_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenants read own tq" ON public.tenant_quotas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tenants update own tq" ON public.tenant_quotas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND quota_value <= hard_ceiling);
CREATE POLICY "admins all tq" ON public.tenant_quotas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

-- ═══════════════════════════════════════════════════════════════
-- Phase 9C — Autonomous Compliance & Attestation
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.compliance_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework text NOT NULL CHECK (framework IN ('soc2','iso27001','hipaa','gdpr','pci-dss','custom')),
  control_id text NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  required boolean NOT NULL DEFAULT true,
  evidence_query text,
  collection_cadence text NOT NULL DEFAULT 'daily' CHECK (collection_cadence IN ('continuous','hourly','daily','weekly','monthly')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (framework, control_id)
);
ALTER TABLE public.compliance_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins all cc" ON public.compliance_controls FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid NOT NULL REFERENCES public.compliance_controls(id) ON DELETE CASCADE,
  collected_at timestamptz NOT NULL DEFAULT now(),
  evidence_kind text NOT NULL CHECK (evidence_kind IN ('query-result','log-snapshot','config-snapshot','attestation','manual')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  sha256 text NOT NULL,
  pass boolean NOT NULL DEFAULT true,
  failure_reason text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '400 days')
);
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins all ce" ON public.compliance_evidence FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.policy_as_code_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  rule_body text NOT NULL,
  rule_format text NOT NULL DEFAULT 'rego' CHECK (rule_format IN ('rego','cel','jsonlogic','sql')),
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','deprecated')),
  enforcement text NOT NULL DEFAULT 'warn' CHECK (enforcement IN ('warn','block','audit-only')),
  bound_controls jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.policy_as_code_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins all pacr" ON public.policy_as_code_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.attestation_packets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  packet_key text NOT NULL UNIQUE,
  framework text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  controls_total integer NOT NULL DEFAULT 0,
  controls_passing integer NOT NULL DEFAULT 0,
  evidence_count integer NOT NULL DEFAULT 0,
  bundle_sha256 text NOT NULL,
  signature text NOT NULL,
  signed_by text NOT NULL DEFAULT 'sita-attestation-key-v1',
  storage_path text,
  status text NOT NULL DEFAULT 'sealed' CHECK (status IN ('building','sealed','delivered','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);
ALTER TABLE public.attestation_packets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins all ap" ON public.attestation_packets FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS idx_tssa_user ON public.tenant_self_service_actions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ce_control ON public.compliance_evidence(control_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_pacr_status ON public.policy_as_code_rules(status, rule_key);
CREATE INDEX IF NOT EXISTS idx_ap_period ON public.attestation_packets(period_end DESC);