
-- Feature Integration Protocol Enforcement System Tables

-- 1. Feature Intake Records
CREATE TABLE public.feature_intake_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_type TEXT NOT NULL DEFAULT 'greenfield',
  wedge_priority TEXT DEFAULT 'medium',
  outcome_statement TEXT,
  non_goals TEXT[] DEFAULT '{}',
  primary_owner TEXT,
  owner_rationale TEXT,
  why_not_elsewhere TEXT,
  capability_classes TEXT[] DEFAULT '{}',
  risk_tier TEXT DEFAULT 'standard',
  autonomy_tier TEXT DEFAULT 'observe',
  trust_bearing BOOLEAN DEFAULT false,
  support_owner TEXT,
  product_owner TEXT,
  engineering_owner TEXT,
  launch_intent TEXT DEFAULT 'internal',
  surface_map JSONB DEFAULT '[]',
  affected_domains TEXT[] DEFAULT '{}',
  intake_status TEXT DEFAULT 'draft',
  completeness_score NUMERIC DEFAULT 0,
  intake_questions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_intake_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feature intakes" ON public.feature_intake_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_intake_records_updated_at BEFORE UPDATE ON public.feature_intake_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Capability Registry
CREATE TABLE public.capability_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  capability_class TEXT NOT NULL DEFAULT 'observe',
  name TEXT NOT NULL,
  description TEXT,
  owner_service TEXT NOT NULL,
  feature_id TEXT,
  risk_tier TEXT DEFAULT 'standard',
  autonomy_tier TEXT DEFAULT 'observe',
  required_scopes TEXT[] DEFAULT '{}',
  required_policy_family TEXT,
  approval_type TEXT DEFAULT 'none',
  receipt_requirement TEXT DEFAULT 'none',
  event_subjects TEXT[] DEFAULT '{}',
  replayability_class TEXT DEFAULT 'safe',
  entitlement_dependency TEXT,
  sandbox_support BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  version TEXT DEFAULT '1.0.0',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, capability_id)
);
ALTER TABLE public.capability_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capabilities" ON public.capability_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_capability_registry_updated_at BEFORE UPDATE ON public.capability_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Feature Spec Records
CREATE TABLE public.feature_spec_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  spec_version TEXT DEFAULT '1.0.0',
  outcome_statement TEXT,
  capability_map JSONB DEFAULT '[]',
  owner_map JSONB DEFAULT '{}',
  surface_map JSONB DEFAULT '[]',
  contract_schema_map JSONB DEFAULT '{}',
  workflow_model JSONB DEFAULT '{}',
  policy_trust_model JSONB DEFAULT '{}',
  execution_model JSONB DEFAULT '{}',
  memory_graph_effects JSONB DEFAULT '{}',
  observability_support JSONB DEFAULT '{}',
  testing_model JSONB DEFAULT '{}',
  rollout_recovery JSONB DEFAULT '{}',
  generated_truth_updates JSONB DEFAULT '[]',
  completeness_score NUMERIC DEFAULT 0,
  missing_sections TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_spec_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feature specs" ON public.feature_spec_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_spec_records_updated_at BEFORE UPDATE ON public.feature_spec_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Feature Owner Decisions
CREATE TABLE public.feature_owner_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  primary_owner TEXT NOT NULL,
  owner_rationale TEXT,
  alternate_candidates JSONB DEFAULT '[]',
  smallest_correct_owner TEXT,
  boundary_violations JSONB DEFAULT '[]',
  second_brain_risk BOOLEAN DEFAULT false,
  module_drift_risk BOOLEAN DEFAULT false,
  unsupported_root_risk BOOLEAN DEFAULT false,
  recommendation TEXT DEFAULT 'extend_existing',
  decision_status TEXT DEFAULT 'proposed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_owner_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own owner decisions" ON public.feature_owner_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_owner_decisions_updated_at BEFORE UPDATE ON public.feature_owner_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Feature Compliance Records
CREATE TABLE public.feature_compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  owner_declared BOOLEAN DEFAULT false,
  capabilities_registered BOOLEAN DEFAULT false,
  contracts_defined BOOLEAN DEFAULT false,
  workflow_defined BOOLEAN DEFAULT false,
  policy_defined BOOLEAN DEFAULT false,
  execution_path_defined BOOLEAN DEFAULT false,
  receipts_defined BOOLEAN DEFAULT false,
  memory_effects_declared BOOLEAN DEFAULT false,
  boardroom_integration BOOLEAN DEFAULT false,
  observability_defined BOOLEAN DEFAULT false,
  testing_defined BOOLEAN DEFAULT false,
  rollout_defined BOOLEAN DEFAULT false,
  generated_truth_updated BOOLEAN DEFAULT false,
  deprecation_planned BOOLEAN DEFAULT false,
  violation_count INTEGER DEFAULT 0,
  violation_severity TEXT DEFAULT 'none',
  violations JSONB DEFAULT '[]',
  readiness_stage TEXT DEFAULT 'spec-ready',
  completeness_score NUMERIC DEFAULT 0,
  last_evaluated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_compliance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own compliance records" ON public.feature_compliance_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_compliance_records_updated_at BEFORE UPDATE ON public.feature_compliance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Feature Execution Paths
CREATE TABLE public.feature_execution_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  ingress_point TEXT,
  brain_core_involvement BOOLEAN DEFAULT false,
  policy_decision_point TEXT,
  capability_routing_point TEXT,
  executor_entry TEXT,
  connector_runner_path TEXT,
  receipt_emission_point TEXT,
  event_emission_point TEXT,
  verification_point TEXT,
  idempotency_key_source TEXT,
  duplicate_suppression TEXT,
  replay_safe BOOLEAN DEFAULT false,
  conflict_behavior TEXT,
  partial_success_handling TEXT,
  rollback_behavior TEXT,
  execution_graph JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_execution_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own execution paths" ON public.feature_execution_paths FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_execution_paths_updated_at BEFORE UPDATE ON public.feature_execution_paths FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Feature Rollout Records
CREATE TABLE public.feature_rollout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_flags JSONB DEFAULT '[]',
  rollout_mode TEXT DEFAULT 'dev-only',
  kill_switch_class TEXT DEFAULT 'ui-hide',
  rollback_steps TEXT[] DEFAULT '{}',
  config_owner TEXT,
  monitoring_owner TEXT,
  migration_requirements TEXT[] DEFAULT '{}',
  shadow_sim_progression JSONB DEFAULT '[]',
  promotion_gates JSONB DEFAULT '[]',
  current_ring TEXT DEFAULT 'dev',
  launch_criteria JSONB DEFAULT '[]',
  status TEXT DEFAULT 'planned',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_rollout_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rollout records" ON public.feature_rollout_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_rollout_records_updated_at BEFORE UPDATE ON public.feature_rollout_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Feature Deprecation Records
CREATE TABLE public.feature_deprecation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  replacement_owner TEXT,
  migration_path TEXT,
  compatibility_window TEXT,
  contract_deprecation_plan JSONB DEFAULT '{}',
  ui_removal_plan TEXT,
  support_implications TEXT,
  generated_truth_cleanup TEXT[] DEFAULT '{}',
  retirement_status TEXT DEFAULT 'active',
  deprecated_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_deprecation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deprecation records" ON public.feature_deprecation_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_deprecation_records_updated_at BEFORE UPDATE ON public.feature_deprecation_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Feature Readiness Gates
CREATE TABLE public.feature_readiness_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  current_stage TEXT DEFAULT 'spec-ready',
  stage_evidence JSONB DEFAULT '{}',
  missing_evidence TEXT[] DEFAULT '{}',
  blockers JSONB DEFAULT '[]',
  red_team_answers JSONB DEFAULT '{}',
  support_signoff BOOLEAN DEFAULT false,
  launch_honesty_risk TEXT DEFAULT 'unknown',
  gate_history JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_readiness_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own readiness gates" ON public.feature_readiness_gates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_readiness_gates_updated_at BEFORE UPDATE ON public.feature_readiness_gates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Feature Generated Truth Impacts
CREATE TABLE public.feature_generated_truth_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  artifact_path TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  impact_description TEXT,
  current_state TEXT DEFAULT 'missing',
  expected_entries JSONB DEFAULT '[]',
  impact_severity TEXT DEFAULT 'medium',
  updated_by TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_generated_truth_impacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own truth impacts" ON public.feature_generated_truth_impacts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_generated_truth_impacts_updated_at BEFORE UPDATE ON public.feature_generated_truth_impacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit triggers on sensitive tables
CREATE TRIGGER audit_capability_registry_changes AFTER INSERT OR UPDATE OR DELETE ON public.capability_registry FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
CREATE TRIGGER audit_feature_compliance_changes AFTER INSERT OR UPDATE OR DELETE ON public.feature_compliance_records FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
CREATE TRIGGER audit_feature_readiness_gates_changes AFTER INSERT OR UPDATE OR DELETE ON public.feature_readiness_gates FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
