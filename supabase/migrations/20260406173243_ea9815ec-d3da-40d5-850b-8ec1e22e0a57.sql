
-- ══ TABLE 1: reality_mode_registry ══
CREATE TABLE public.reality_mode_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  allows_real_side_effects boolean NOT NULL DEFAULT false,
  allows_demo_side_effects boolean NOT NULL DEFAULT false,
  analytics_bucket text NOT NULL,
  user_visible boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reality_mode_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 2: surface_class_registry ══
CREATE TABLE public.surface_class_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surface_class_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  operator_only boolean NOT NULL DEFAULT false,
  user_facing boolean NOT NULL DEFAULT false,
  launch_stage text NOT NULL DEFAULT 'planned',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.surface_class_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 3: route_surface_registry ══
CREATE TABLE public.route_surface_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_key text UNIQUE NOT NULL,
  route_path text NOT NULL,
  surface_class_id uuid NOT NULL REFERENCES public.surface_class_registry(id) ON DELETE CASCADE,
  shell_key text NOT NULL,
  domain_family text NOT NULL,
  capability_family text,
  launch_stage text NOT NULL DEFAULT 'planned',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_route_surface_sc ON public.route_surface_registry(surface_class_id);
CREATE INDEX idx_route_surface_sh ON public.route_surface_registry(shell_key);
ALTER TABLE public.route_surface_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 4: capability_reality_bindings ══
CREATE TABLE public.capability_reality_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_key text UNIQUE NOT NULL,
  surface_class_id uuid REFERENCES public.surface_class_registry(id),
  preferred_mode_key text NOT NULL,
  allowed_modes jsonb NOT NULL DEFAULT '["real"]',
  requires_real_provider boolean NOT NULL DEFAULT false,
  allows_demo_provider boolean NOT NULL DEFAULT false,
  allows_internal_test_provider boolean NOT NULL DEFAULT false,
  side_effect_policy_key text NOT NULL,
  launch_honesty_class text NOT NULL DEFAULT 'qualified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.capability_reality_bindings ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 5: provider_activation_registry ══
CREATE TABLE public.provider_activation_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_family_key text NOT NULL,
  provider_capability_key text NOT NULL,
  activation_state text NOT NULL,
  real_mode_supported boolean NOT NULL DEFAULT false,
  demo_mode_supported boolean NOT NULL DEFAULT false,
  internal_test_supported boolean NOT NULL DEFAULT false,
  health_state text NOT NULL DEFAULT 'unknown',
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pa_family ON public.provider_activation_registry(provider_family_key);
CREATE INDEX idx_pa_cap ON public.provider_activation_registry(provider_capability_key);
CREATE INDEX idx_pa_state ON public.provider_activation_registry(activation_state);
ALTER TABLE public.provider_activation_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 6: demo_provider_registry ══
CREATE TABLE public.demo_provider_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_provider_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  domain_family text NOT NULL,
  capability_keys jsonb NOT NULL DEFAULT '[]',
  supports_interaction boolean NOT NULL DEFAULT true,
  supports_simulated_writes boolean NOT NULL DEFAULT false,
  launch_honesty_class text NOT NULL DEFAULT 'demo_governed',
  scenario_pack_required boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dp_domain ON public.demo_provider_registry(domain_family);
ALTER TABLE public.demo_provider_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 7: demo_scenario_packs ══
CREATE TABLE public.demo_scenario_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_pack_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  theme_family text NOT NULL,
  surface_classes jsonb NOT NULL DEFAULT '[]',
  enabled_demo_providers jsonb NOT NULL DEFAULT '[]',
  storyline_metadata jsonb NOT NULL DEFAULT '{}',
  default_for_demo_mode boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.demo_scenario_packs ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 8: Alter existing demo_scenario_entities ══
ALTER TABLE public.demo_scenario_entities
  ADD COLUMN scenario_pack_id uuid REFERENCES public.demo_scenario_packs(id) ON DELETE CASCADE,
  ADD COLUMN display_name text,
  ADD COLUMN entity_payload jsonb NOT NULL DEFAULT '{}';
CREATE INDEX idx_dse_pack ON public.demo_scenario_entities(scenario_pack_id);

-- ══ TABLE 9: demo_interaction_policies ══
CREATE TABLE public.demo_interaction_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_provider_id uuid NOT NULL REFERENCES public.demo_provider_registry(id) ON DELETE CASCADE,
  interaction_key text NOT NULL,
  interaction_behavior text NOT NULL,
  user_visible_label text,
  side_effect_policy_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dip_prov ON public.demo_interaction_policies(demo_provider_id);
ALTER TABLE public.demo_interaction_policies ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 10: side_effect_policies ══
CREATE TABLE public.side_effect_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  real_mode_behavior text NOT NULL,
  demo_mode_behavior text NOT NULL,
  internal_test_behavior text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.side_effect_policies ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 11: launch_honesty_surface_bindings ══
CREATE TABLE public.launch_honesty_surface_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  binding_type text NOT NULL,
  binding_key text NOT NULL,
  launch_honesty_class text NOT NULL,
  public_claim_allowed boolean NOT NULL DEFAULT false,
  qualifier_required boolean NOT NULL DEFAULT true,
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lhsb_type ON public.launch_honesty_surface_bindings(binding_type);
CREATE INDEX idx_lhsb_key ON public.launch_honesty_surface_bindings(binding_key);
ALTER TABLE public.launch_honesty_surface_bindings ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 12: reality_mode_resolution_log ══
CREATE TABLE public.reality_mode_resolution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  route_key text,
  capability_key text,
  surface_class_key text,
  requested_mode text,
  resolved_mode text NOT NULL,
  provider_source_type text NOT NULL,
  provider_source_key text,
  launch_honesty_class text NOT NULL,
  side_effect_policy_key text,
  analytics_bucket text NOT NULL,
  resolution_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rmrl_route ON public.reality_mode_resolution_log(route_key);
CREATE INDEX idx_rmrl_cap ON public.reality_mode_resolution_log(capability_key);
CREATE INDEX idx_rmrl_mode ON public.reality_mode_resolution_log(resolved_mode);
CREATE INDEX idx_rmrl_ts ON public.reality_mode_resolution_log(created_at DESC);
ALTER TABLE public.reality_mode_resolution_log ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 13: analytics_mode_policies ══
CREATE TABLE public.analytics_mode_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_key text NOT NULL,
  analytics_bucket text NOT NULL,
  mix_with_real_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(mode_key, analytics_bucket)
);
ALTER TABLE public.analytics_mode_policies ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 14: mode_segregation_audits ══
CREATE TABLE public.mode_segregation_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type text NOT NULL,
  severity text NOT NULL,
  route_key text,
  capability_key text,
  details jsonb NOT NULL DEFAULT '{}',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX idx_msa_type ON public.mode_segregation_audits(issue_type);
CREATE INDEX idx_msa_sev ON public.mode_segregation_audits(severity);
CREATE INDEX idx_msa_res ON public.mode_segregation_audits(resolved);
ALTER TABLE public.mode_segregation_audits ENABLE ROW LEVEL SECURITY;

-- ══ TRIGGERS ══
CREATE TRIGGER trg_route_surface_updated BEFORE UPDATE ON public.route_surface_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cap_bindings_updated BEFORE UPDATE ON public.capability_reality_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_prov_act_updated BEFORE UPDATE ON public.provider_activation_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_demo_prov_updated BEFORE UPDATE ON public.demo_provider_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_demo_packs_updated BEFORE UPDATE ON public.demo_scenario_packs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══ RLS POLICIES ══
CREATE POLICY "auth_read_rmr" ON public.reality_mode_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_rmr" ON public.reality_mode_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_scr" ON public.surface_class_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_scr" ON public.surface_class_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_rsr" ON public.route_surface_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_rsr" ON public.route_surface_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_crb" ON public.capability_reality_bindings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_crb" ON public.capability_reality_bindings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_par" ON public.provider_activation_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_par" ON public.provider_activation_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_dpr" ON public.demo_provider_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_dpr" ON public.demo_provider_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_dsp" ON public.demo_scenario_packs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_dsp" ON public.demo_scenario_packs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_dse" ON public.demo_scenario_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_dse" ON public.demo_scenario_entities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_dip" ON public.demo_interaction_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_dip" ON public.demo_interaction_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_sep" ON public.side_effect_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_sep" ON public.side_effect_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_lhsb" ON public.launch_honesty_surface_bindings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_lhsb" ON public.launch_honesty_surface_bindings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own_read_rmrl" ON public.reality_mode_resolution_log FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_read_rmrl" ON public.reality_mode_resolution_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "auth_insert_rmrl" ON public.reality_mode_resolution_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_read_amp" ON public.analytics_mode_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_amp" ON public.analytics_mode_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_read_msa" ON public.mode_segregation_audits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_all_msa" ON public.mode_segregation_audits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ══ VIEWS ══
CREATE OR REPLACE VIEW public.v_reality_mode_surface_summary AS
SELECT rsr.route_key, rsr.route_path, rsr.shell_key, rsr.domain_family, rsr.launch_stage AS route_launch_stage,
  scr.surface_class_key, scr.display_name AS surface_display_name, scr.operator_only,
  crb.capability_key, crb.preferred_mode_key, crb.allowed_modes, crb.launch_honesty_class, crb.side_effect_policy_key,
  lhsb.launch_honesty_class AS honesty_binding_class, lhsb.public_claim_allowed, lhsb.qualifier_required
FROM public.route_surface_registry rsr
JOIN public.surface_class_registry scr ON rsr.surface_class_id = scr.id
LEFT JOIN public.capability_reality_bindings crb ON crb.surface_class_id = scr.id
LEFT JOIN public.launch_honesty_surface_bindings lhsb ON lhsb.binding_key = rsr.route_key AND lhsb.binding_type = 'route'
WHERE rsr.is_active = true;

CREATE OR REPLACE VIEW public.v_demo_provider_summary AS
SELECT dpr.demo_provider_key, dpr.display_name, dpr.domain_family, dpr.capability_keys,
  dpr.supports_interaction, dpr.supports_simulated_writes, dpr.launch_honesty_class, dpr.is_active,
  COUNT(DISTINCT dsp.id) AS scenario_pack_count, COUNT(DISTINCT dip.id) AS interaction_policy_count
FROM public.demo_provider_registry dpr
LEFT JOIN public.demo_scenario_packs dsp ON dsp.enabled_demo_providers ? dpr.demo_provider_key
LEFT JOIN public.demo_interaction_policies dip ON dip.demo_provider_id = dpr.id
GROUP BY dpr.id;

CREATE OR REPLACE VIEW public.v_provider_activation_summary AS
SELECT provider_family_key, provider_capability_key, activation_state, real_mode_supported,
  demo_mode_supported, internal_test_supported, health_state, notes, last_verified_at, updated_at
FROM public.provider_activation_registry ORDER BY provider_family_key;

CREATE OR REPLACE VIEW public.v_mode_resolution_recent AS
SELECT id, user_id, route_key, capability_key, surface_class_key, requested_mode, resolved_mode,
  provider_source_type, provider_source_key, launch_honesty_class, analytics_bucket, resolution_reason, created_at
FROM public.reality_mode_resolution_log ORDER BY created_at DESC LIMIT 500;

CREATE OR REPLACE VIEW public.v_launch_honesty_by_surface AS
SELECT lhsb.binding_type, lhsb.binding_key, lhsb.launch_honesty_class, lhsb.public_claim_allowed,
  lhsb.qualifier_required, lhsb.notes, lhsb.last_verified_at,
  CASE WHEN lhsb.binding_type = 'route' THEN rsr.route_path ELSE NULL END AS route_path,
  CASE WHEN lhsb.binding_type = 'route' THEN scr.surface_class_key
       WHEN lhsb.binding_type = 'surface_class' THEN lhsb.binding_key ELSE NULL END AS surface_class_key
FROM public.launch_honesty_surface_bindings lhsb
LEFT JOIN public.route_surface_registry rsr ON lhsb.binding_type = 'route' AND lhsb.binding_key = rsr.route_key
LEFT JOIN public.surface_class_registry scr ON rsr.surface_class_id = scr.id
ORDER BY lhsb.binding_type, lhsb.binding_key;

-- ══ SEED DATA ══
INSERT INTO public.reality_mode_registry (mode_key, display_name, description, allows_real_side_effects, allows_demo_side_effects, analytics_bucket, user_visible) VALUES
  ('real', 'Real Mode', 'Production runtime with real auth, data, persistence, and side effects', true, false, 'real', true),
  ('demo', 'Demo Mode', 'Investor/sales demo with curated scenario data, blocked real side effects', false, true, 'demo', true),
  ('internal_test', 'Internal Test', 'Internal testing/staging with partial real systems', false, true, 'internal_test', false),
  ('unavailable', 'Unavailable', 'Capability or provider is not available', false, false, 'discard', true),
  ('planned', 'Planned', 'Architecture defined, implementation pending', false, false, 'discard', true);

INSERT INTO public.surface_class_registry (surface_class_key, display_name, description, operator_only, user_facing, launch_stage) VALUES
  ('admin_os', 'Admin OS', 'Internal operating system for operators, admins, AI governance', true, false, 'active'),
  ('user_app', 'User App', 'Elegant daily-use product experience', false, true, 'active'),
  ('mobile_app', 'Mobile App', 'Mobile-optimized user app surface', false, true, 'planned'),
  ('device_surface', 'Device Surface', 'Ambient device interfaces', false, false, 'planned'),
  ('internal_tool', 'Internal Tool', 'Internal development and experiment tools', true, false, 'active');

INSERT INTO public.side_effect_policies (policy_key, display_name, real_mode_behavior, demo_mode_behavior, internal_test_behavior, notes) VALUES
  ('allow_all', 'Allow All', 'allow', 'block', 'block', 'Full real writes, blocked in demo/test'),
  ('allow_with_trust', 'Allow With Trust', 'allow_with_trust', 'block', 'block', 'Trust-weighted real writes'),
  ('simulate_demo', 'Simulate in Demo', 'allow', 'simulate_only', 'simulate_only', 'Real writes in real, simulated in demo'),
  ('write_demo_store', 'Write Demo Store', 'allow', 'write_demo_store', 'allow_test_store', 'Writes to segregated demo/test stores'),
  ('read_only', 'Read Only', 'allow', 'read_only', 'read_only', 'No writes in any mode'),
  ('block_all', 'Block All', 'block', 'block', 'block', 'All writes blocked');

INSERT INTO public.analytics_mode_policies (mode_key, analytics_bucket, mix_with_real_allowed, notes) VALUES
  ('real', 'real', false, 'Real analytics must never be contaminated'),
  ('demo', 'demo', false, 'Demo analytics segregated from real'),
  ('internal_test', 'internal_test', false, 'Internal test analytics isolated'),
  ('unavailable', 'discard', false, 'Unavailable modes discard analytics'),
  ('planned', 'discard', false, 'Planned modes discard analytics');

INSERT INTO public.demo_provider_registry (demo_provider_key, display_name, domain_family, capability_keys, supports_interaction, supports_simulated_writes, launch_honesty_class) VALUES
  ('demo_boardroom', 'Boardroom Demo', 'boardroom', '["boardroom.weekly.summary","boardroom.strategic.view"]', true, false, 'demo_governed'),
  ('demo_advisor', 'AI Advisor Demo', 'advisor', '["advisor.chat.primary","advisor.summary"]', true, true, 'demo_governed'),
  ('demo_business_crm', 'Business CRM Demo', 'business', '["business.pipeline","business.contacts","business.revenue"]', true, true, 'demo_governed'),
  ('demo_investment', 'Investment Demo', 'investment', '["investment.portfolio","investment.analysis"]', true, false, 'demo_governed'),
  ('demo_money', 'Money Demo', 'money', '["money.accounts","money.transactions"]', true, false, 'demo_governed'),
  ('demo_workspace', 'Workspace Demo', 'workspace', '["workspace.projects","workspace.tasks"]', true, true, 'demo_governed'),
  ('demo_connectors', 'Connectors Demo', 'connectors', '["connector.registry","connector.health"]', true, false, 'demo_governed'),
  ('demo_files', 'Files Demo', 'files', '["files.list","files.preview"]', true, false, 'demo_governed'),
  ('demo_approvals', 'Approvals Demo', 'approvals', '["approvals.queue","approvals.review"]', true, true, 'demo_governed'),
  ('demo_pulse', 'Daily Pulse Demo', 'pulse', '["pulse.morning","pulse.summary"]', true, false, 'demo_governed');

INSERT INTO public.demo_scenario_packs (scenario_pack_key, display_name, description, theme_family, surface_classes, enabled_demo_providers, default_for_demo_mode) VALUES
  ('founder_operator_demo', 'Founder/Operator Life', 'A day in the life of a tech founder managing business, investments, and personal finances', 'founder', '["user_app","admin_os"]', '["demo_boardroom","demo_advisor","demo_business_crm","demo_investment","demo_money","demo_approvals","demo_pulse"]', true),
  ('family_office_demo', 'Family Office', 'Multi-entity wealth management with household operations and generational planning', 'wealth', '["user_app"]', '["demo_boardroom","demo_investment","demo_money","demo_advisor"]', false),
  ('business_growth_demo', 'Business Growth', 'SaaS founder scaling revenue with CRM, pipeline management, and operational intelligence', 'business', '["user_app"]', '["demo_business_crm","demo_advisor","demo_workspace","demo_connectors"]', false),
  ('connected_services_demo', 'Connected Services', 'Integration ecosystem showcase with external services and data sources', 'integration', '["user_app","admin_os"]', '["demo_connectors","demo_workspace","demo_advisor"]', false),
  ('admin_operator_demo', 'Admin Operator', 'System operator walkthrough of internal control plane and governance', 'operations', '["admin_os"]', '["demo_advisor","demo_connectors"]', false);
