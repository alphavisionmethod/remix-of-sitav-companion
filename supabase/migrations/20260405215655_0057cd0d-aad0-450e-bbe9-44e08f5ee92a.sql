
-- ═══════════════════════════════════════════════════════════════
-- SITA Delivery Operating System — Core Schema
-- ═══════════════════════════════════════════════════════════════

-- Feature Archetypes
CREATE TABLE public.feature_archetypes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archetype_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  default_persistence_class TEXT NOT NULL DEFAULT 'operational',
  default_trust_level TEXT NOT NULL DEFAULT 'standard',
  default_interaction_criticality TEXT NOT NULL DEFAULT 'medium',
  expected_components JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_probes JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_shells JSONB NOT NULL DEFAULT '[]'::jsonb,
  loading_states JSONB NOT NULL DEFAULT '{"loading":true,"error":true,"empty":true,"degraded":false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_archetypes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Archetypes are readable by authenticated users" ON public.feature_archetypes FOR SELECT TO authenticated USING (true);

-- Feature Blueprints
CREATE TABLE public.feature_blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  archetype_key TEXT REFERENCES public.feature_archetypes(archetype_key),
  description TEXT,
  user_intent TEXT,
  persistence_class TEXT NOT NULL DEFAULT 'operational',
  contract_class TEXT NOT NULL DEFAULT 'standard',
  interaction_criticality TEXT NOT NULL DEFAULT 'medium',
  journey_criticality TEXT NOT NULL DEFAULT 'medium',
  trust_needs TEXT NOT NULL DEFAULT 'standard',
  ai_compute_class TEXT NOT NULL DEFAULT 'none',
  launch_criticality TEXT NOT NULL DEFAULT 'standard',
  reality_target TEXT NOT NULL DEFAULT 'persisted',
  route_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  schema_needs JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_location TEXT,
  ownership TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own blueprints" ON public.feature_blueprints FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_blueprints_domain ON public.feature_blueprints(domain);
CREATE INDEX idx_blueprints_status ON public.feature_blueprints(status);

-- Feature Lifecycle Stages
CREATE TABLE public.feature_lifecycle_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blueprint_id UUID REFERENCES public.feature_blueprints(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'proposed',
  stage_order INT NOT NULL DEFAULT 0,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ,
  actor TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_lifecycle_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lifecycle" ON public.feature_lifecycle_stages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_lifecycle_feature ON public.feature_lifecycle_stages(feature_id);
CREATE INDEX idx_lifecycle_stage ON public.feature_lifecycle_stages(stage);

-- Domain Methodology Packs
CREATE TABLE public.domain_methodology_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  expected_routes JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_shells JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_boards JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_interactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_proofs JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_flows JSONB NOT NULL DEFAULT '[]'::jsonb,
  readiness_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  maturity_target TEXT NOT NULL DEFAULT 'persisted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain_key)
);
ALTER TABLE public.domain_methodology_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own packs" ON public.domain_methodology_packs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Delivery Templates
CREATE TABLE public.delivery_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archetype_key TEXT NOT NULL REFERENCES public.feature_archetypes(archetype_key),
  template_name TEXT NOT NULL,
  expected_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_components JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_persistence JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_interactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_journey_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_truth_registration JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_shell TEXT,
  loading_error_degraded JSONB NOT NULL DEFAULT '{"loading":true,"error":true,"degraded":false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates readable by authenticated" ON public.delivery_templates FOR SELECT TO authenticated USING (true);

-- Dependency Maps
CREATE TABLE public.dependency_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blueprint_id UUID REFERENCES public.feature_blueprints(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  required_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_policies JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_proofs JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_projections JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_journey_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_probes JSONB NOT NULL DEFAULT '[]'::jsonb,
  launch_gates JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolved_count INT NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dependency_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deps" ON public.dependency_maps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Change Impact Records
CREATE TABLE public.change_impact_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  change_title TEXT NOT NULL,
  change_type TEXT NOT NULL DEFAULT 'feature',
  source_blueprint_id UUID REFERENCES public.feature_blueprints(id),
  affected_routes JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_probes JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_journeys JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_launch_gates JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_domains JSONB NOT NULL DEFAULT '[]'::jsonb,
  migration_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  rollout_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  bundle_perf_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  trust_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  severity TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.change_impact_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own impacts" ON public.change_impact_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Delivery Waves
CREATE TABLE public.delivery_waves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wave_name TEXT NOT NULL,
  wave_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'planning',
  domain_focus JSONB NOT NULL DEFAULT '[]'::jsonb,
  feature_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  dependency_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  launch_impact TEXT NOT NULL DEFAULT 'standard',
  migration_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_start TIMESTAMPTZ,
  target_end TIMESTAMPTZ,
  completion_pct NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_waves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own waves" ON public.delivery_waves FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Platform Maturity Scores
CREATE TABLE public.platform_maturity_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL DEFAULT 'domain',
  scope_id TEXT NOT NULL,
  scope_label TEXT NOT NULL,
  truth_level NUMERIC NOT NULL DEFAULT 0,
  automation_level NUMERIC NOT NULL DEFAULT 0,
  persistence_level NUMERIC NOT NULL DEFAULT 0,
  proof_level NUMERIC NOT NULL DEFAULT 0,
  launch_readiness NUMERIC NOT NULL DEFAULT 0,
  interaction_coverage NUMERIC NOT NULL DEFAULT 0,
  contract_coverage NUMERIC NOT NULL DEFAULT 0,
  composite_score NUMERIC NOT NULL DEFAULT 0,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_maturity_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own maturity" ON public.platform_maturity_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_maturity_scope ON public.platform_maturity_scores(scope_type, scope_id);

-- Remediation Suggestions
CREATE TABLE public.remediation_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  gap_type TEXT NOT NULL,
  gap_description TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  suggested_artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority TEXT NOT NULL DEFAULT 'medium',
  auto_fixable BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.remediation_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own remediations" ON public.remediation_suggestions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_remediation_status ON public.remediation_suggestions(status);

-- Seed canonical feature archetypes
INSERT INTO public.feature_archetypes (archetype_key, display_name, description, default_persistence_class, default_trust_level, default_interaction_criticality) VALUES
  ('boardroom', 'Boardroom', 'Executive intelligence surface with synthesis, advisor views, and strategic overlays', 'durable', 'high', 'high'),
  ('office', 'Office / Workspace', 'Full-featured workspace with multiple panels, actions, and deep domain logic', 'durable', 'high', 'high'),
  ('simulator', 'Simulator', 'Scenario simulation with projections, what-if analysis, and outcome modeling', 'operational', 'standard', 'medium'),
  ('workflow', 'Workflow', 'Multi-step process with approvals, state transitions, and audit trail', 'durable', 'high', 'critical'),
  ('onboarding', 'Setup / Onboarding Flow', 'Multi-stage guided setup with branching, validation, and completion tracking', 'durable', 'standard', 'high'),
  ('crud', 'CRUD Surface', 'Standard create/read/update/delete interface for a domain entity', 'operational', 'standard', 'medium'),
  ('action-center', 'Action Center', 'Aggregated actionable items requiring user decision or response', 'operational', 'standard', 'high'),
  ('dashboard', 'Dashboard', 'Read-heavy overview with KPIs, charts, and status summaries', 'operational', 'standard', 'low'),
  ('detail-view', 'Detail View', 'Single-entity deep inspection with related data, history, and actions', 'operational', 'standard', 'medium'),
  ('connector-flow', 'Connector Flow', 'Integration setup with auth, mapping, sync, and health monitoring', 'durable', 'high', 'high'),
  ('intelligence', 'Intelligence Surface', 'AI-powered analysis with confidence, evidence, and recommendations', 'durable', 'high', 'medium'),
  ('proof-evidence', 'Proof / Evidence Surface', 'Trust and audit display with receipts, lineage, and verification', 'durable', 'critical', 'high'),
  ('admin-control', 'Admin Control Surface', 'System administration with configuration, monitoring, and governance', 'durable', 'critical', 'high'),
  ('timeline', 'Timeline / History', 'Chronological event display with filtering, correlation, and drill-down', 'operational', 'standard', 'low'),
  ('settings', 'Settings / Configuration', 'User or system preference management with validation and preview', 'durable', 'standard', 'medium');

-- Triggers for updated_at
CREATE TRIGGER update_feature_archetypes_updated_at BEFORE UPDATE ON public.feature_archetypes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_blueprints_updated_at BEFORE UPDATE ON public.feature_blueprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_domain_methodology_packs_updated_at BEFORE UPDATE ON public.domain_methodology_packs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_templates_updated_at BEFORE UPDATE ON public.delivery_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dependency_maps_updated_at BEFORE UPDATE ON public.dependency_maps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_change_impact_records_updated_at BEFORE UPDATE ON public.change_impact_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_waves_updated_at BEFORE UPDATE ON public.delivery_waves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_remediation_suggestions_updated_at BEFORE UPDATE ON public.remediation_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
