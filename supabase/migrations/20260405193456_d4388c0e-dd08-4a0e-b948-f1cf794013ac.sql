
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Ultra-Efficient Intelligence Architecture Schema
-- 15 canonical tables for intelligence reuse, differential
-- reasoning, efficiency scoring, and outcome economics.
-- ═══════════════════════════════════════════════════════════════

-- A. intelligence_assets
CREATE TABLE public.intelligence_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'other',
  domain TEXT NOT NULL DEFAULT 'engineering',
  title TEXT NOT NULL,
  summary TEXT,
  structured_payload JSONB DEFAULT '{}'::jsonb,
  evidence_refs TEXT[] DEFAULT '{}',
  source_action_refs TEXT[] DEFAULT '{}',
  source_entity_refs TEXT[] DEFAULT '{}',
  source_environment TEXT,
  confidence_score NUMERIC DEFAULT 0,
  freshness_score NUMERIC DEFAULT 0,
  reuse_eligibility BOOLEAN DEFAULT true,
  verification_state TEXT DEFAULT 'unverified',
  invalidation_triggers TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_assets" ON public.intelligence_assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_intelligence_assets_updated_at BEFORE UPDATE ON public.intelligence_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_intelligence_assets_domain ON public.intelligence_assets(domain);
CREATE INDEX idx_intelligence_assets_type ON public.intelligence_assets(asset_type);

-- B. intelligence_asset_usages
CREATE TABLE public.intelligence_asset_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intelligence_asset_id UUID REFERENCES public.intelligence_assets(id) ON DELETE CASCADE,
  tenant_id TEXT,
  workspace TEXT,
  mission_id TEXT,
  agent_id TEXT,
  usage_mode TEXT NOT NULL DEFAULT 'direct_reuse',
  reuse_confidence NUMERIC DEFAULT 0,
  applicability_score NUMERIC DEFAULT 0,
  outcome_quality NUMERIC,
  cost_avoided_estimate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_asset_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_asset_usages" ON public.intelligence_asset_usages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- C. intelligence_patterns
CREATE TABLE public.intelligence_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL DEFAULT 'other',
  domain TEXT NOT NULL DEFAULT 'engineering',
  label TEXT NOT NULL,
  description TEXT,
  fingerprint_data JSONB DEFAULT '{}'::jsonb,
  confidence NUMERIC DEFAULT 0,
  false_positive_rate NUMERIC DEFAULT 0,
  source_count INTEGER DEFAULT 0,
  privacy_class TEXT DEFAULT 'tenant_private',
  reusable_across_tenants BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_patterns" ON public.intelligence_patterns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_intelligence_patterns_updated_at BEFORE UPDATE ON public.intelligence_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- D. differential_reasoning_records
CREATE TABLE public.differential_reasoning_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  owner_type TEXT,
  owner_id TEXT,
  previous_state_ref TEXT,
  current_state_ref TEXT,
  detected_changes JSONB DEFAULT '[]'::jsonb,
  materiality_score NUMERIC DEFAULT 0,
  invalidated_assets TEXT[] DEFAULT '{}',
  preserved_assets TEXT[] DEFAULT '{}',
  recommended_reasoning_mode TEXT DEFAULT 'none',
  reasoning_savings_estimate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.differential_reasoning_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own differential_reasoning_records" ON public.differential_reasoning_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- E. intelligence_packets
CREATE TABLE public.intelligence_packets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  packet_type TEXT NOT NULL DEFAULT 'engineering',
  tenant_id TEXT,
  scope_type TEXT,
  scope_id TEXT,
  summarized_state JSONB DEFAULT '{}'::jsonb,
  recent_changes JSONB DEFAULT '[]'::jsonb,
  active_risks JSONB DEFAULT '[]'::jsonb,
  active_constraints JSONB DEFAULT '[]'::jsonb,
  prior_recommendations JSONB DEFAULT '[]'::jsonb,
  evidence_refs TEXT[] DEFAULT '{}',
  unresolved_questions TEXT[] DEFAULT '{}',
  confidence_profile JSONB DEFAULT '{}'::jsonb,
  freshness_state TEXT DEFAULT 'fresh',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_packets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_packets" ON public.intelligence_packets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_intelligence_packets_updated_at BEFORE UPDATE ON public.intelligence_packets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- F. packet_compilation_records
CREATE TABLE public.packet_compilation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intelligence_packet_id UUID REFERENCES public.intelligence_packets(id) ON DELETE CASCADE,
  compiler_version TEXT DEFAULT '1.0',
  source_refs TEXT[] DEFAULT '{}',
  compression_ratio NUMERIC DEFAULT 0,
  compile_cost_estimate NUMERIC DEFAULT 0,
  compile_latency_ms INTEGER DEFAULT 0,
  quality_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packet_compilation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own packet_compilation_records" ON public.packet_compilation_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- G. reasoning_escalation_records
CREATE TABLE public.reasoning_escalation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT,
  tenant_id TEXT,
  domain TEXT,
  previous_reasoning_level TEXT,
  new_reasoning_level TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'low_confidence',
  justification TEXT,
  estimated_incremental_cost NUMERIC DEFAULT 0,
  expected_value NUMERIC DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reasoning_escalation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reasoning_escalation_records" ON public.reasoning_escalation_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- H. ai_efficiency_scores
CREATE TABLE public.ai_efficiency_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL DEFAULT 'agent',
  scope_id TEXT NOT NULL,
  quality_score NUMERIC DEFAULT 0,
  cost_efficiency_score NUMERIC DEFAULT 0,
  acceptance_rate NUMERIC DEFAULT 0,
  override_rate NUMERIC DEFAULT 0,
  false_positive_rate NUMERIC DEFAULT 0,
  verification_success_rate NUMERIC DEFAULT 0,
  reuse_rate NUMERIC DEFAULT 0,
  cache_contribution_rate NUMERIC DEFAULT 0,
  downstream_value_score NUMERIC DEFAULT 0,
  composite_efficiency_score NUMERIC DEFAULT 0,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_efficiency_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_efficiency_scores" ON public.ai_efficiency_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- I. outcome_economics_records
CREATE TABLE public.outcome_economics_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  outcome_type TEXT NOT NULL DEFAULT 'other',
  tenant_id TEXT,
  mission_id TEXT,
  total_ai_cost_estimate NUMERIC DEFAULT 0,
  verification_cost_estimate NUMERIC DEFAULT 0,
  total_cost_estimate NUMERIC DEFAULT 0,
  value_estimate NUMERIC DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  payback_ratio NUMERIC DEFAULT 0,
  success_state TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.outcome_economics_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcome_economics_records" ON public.outcome_economics_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- J. intelligence_reuse_opportunities
CREATE TABLE public.intelligence_reuse_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id TEXT,
  domain TEXT,
  current_task_ref TEXT,
  candidate_asset_ids TEXT[] DEFAULT '{}',
  similarity_score NUMERIC DEFAULT 0,
  expected_cost_avoided NUMERIC DEFAULT 0,
  expected_quality_gain NUMERIC DEFAULT 0,
  recommendation_state TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_reuse_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_reuse_opportunities" ON public.intelligence_reuse_opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- K. zero_waste_prompt_profiles
CREATE TABLE public.zero_waste_prompt_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  task_type TEXT,
  prompt_template_version TEXT DEFAULT '1.0',
  max_context_class TEXT DEFAULT 'B',
  reusable_instruction_refs TEXT[] DEFAULT '{}',
  packet_driven BOOLEAN DEFAULT true,
  retrieval_mode TEXT DEFAULT 'hybrid',
  redundancy_score NUMERIC DEFAULT 0,
  average_cost_reduction NUMERIC DEFAULT 0,
  quality_impact_score NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.zero_waste_prompt_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own zero_waste_prompt_profiles" ON public.zero_waste_prompt_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_zero_waste_prompt_profiles_updated_at BEFORE UPDATE ON public.zero_waste_prompt_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- L. cross_tenant_pattern_learning_records
CREATE TABLE public.cross_tenant_pattern_learning_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  pattern_id UUID REFERENCES public.intelligence_patterns(id) ON DELETE SET NULL,
  anonymization_method TEXT DEFAULT 'k_anonymity',
  source_tenant_count INTEGER DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  approved_for_use BOOLEAN DEFAULT false,
  restrictions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cross_tenant_pattern_learning_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cross_tenant_pattern_learning_records" ON public.cross_tenant_pattern_learning_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- M. intelligence_digests
CREATE TABLE public.intelligence_digests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  digest_type TEXT NOT NULL DEFAULT 'daily_summary',
  tenant_id TEXT,
  workspace TEXT,
  summary TEXT,
  evidence_refs TEXT[] DEFAULT '{}',
  confidence NUMERIC DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cache_status TEXT DEFAULT 'fresh'
);
ALTER TABLE public.intelligence_digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_digests" ON public.intelligence_digests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- N. reasoning_path_performance_records
CREATE TABLE public.reasoning_path_performance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  path_label TEXT NOT NULL,
  task_type TEXT,
  domain TEXT,
  average_cost NUMERIC DEFAULT 0,
  average_latency NUMERIC DEFAULT 0,
  average_quality NUMERIC DEFAULT 0,
  escalation_rate NUMERIC DEFAULT 0,
  reuse_rate NUMERIC DEFAULT 0,
  operator_acceptance_rate NUMERIC DEFAULT 0,
  measured_window TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reasoning_path_performance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reasoning_path_performance_records" ON public.reasoning_path_performance_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_reasoning_path_performance_updated_at BEFORE UPDATE ON public.reasoning_path_performance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- O. intelligence_quality_feedback
CREATE TABLE public.intelligence_quality_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'helpful',
  actor_id TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_quality_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_quality_feedback" ON public.intelligence_quality_feedback FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
