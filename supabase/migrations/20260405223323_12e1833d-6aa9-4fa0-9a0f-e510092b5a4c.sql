
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Sovereign AI Gateway Database Schema
-- ═══════════════════════════════════════════════════════════════

-- 1. AI Model Registry
CREATE TABLE public.ai_model_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_model_name TEXT NOT NULL,
  model_class TEXT NOT NULL DEFAULT 'standard',
  reasoning_strength TEXT DEFAULT 'standard',
  structured_output_support BOOLEAN DEFAULT false,
  tool_calling_support BOOLEAN DEFAULT false,
  context_length INTEGER DEFAULT 8192,
  latency_tier TEXT DEFAULT 'standard',
  cost_tier TEXT DEFAULT 'standard',
  cost_per_1k_input NUMERIC DEFAULT 0,
  cost_per_1k_output NUMERIC DEFAULT 0,
  reliability_score NUMERIC DEFAULT 0.95,
  safety_notes TEXT,
  allowed_domains TEXT[] DEFAULT '{}',
  disallowed_domains TEXT[] DEFAULT '{}',
  launch_stage TEXT DEFAULT 'active',
  fallback_suitability TEXT DEFAULT 'standard',
  preferred_task_classes TEXT[] DEFAULT '{}',
  deprecated BOOLEAN DEFAULT false,
  deprecated_at TIMESTAMPTZ,
  health_score NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, model_id)
);

ALTER TABLE public.ai_model_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own models" ON public.ai_model_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_model_registry_ts BEFORE UPDATE ON public.ai_model_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. AI Prompt Families
CREATE TABLE public.ai_prompt_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  domain TEXT,
  feature_ids TEXT[] DEFAULT '{}',
  allowed_capability_classes TEXT[] DEFAULT '{}',
  context_sources JSONB DEFAULT '[]',
  redaction_strategy TEXT DEFAULT 'none',
  max_context_tokens INTEGER DEFAULT 4096,
  grounding_requirements JSONB DEFAULT '{}',
  output_schema JSONB,
  hallucination_containment TEXT DEFAULT 'standard',
  system_prompt TEXT,
  version INTEGER DEFAULT 1,
  deprecated BOOLEAN DEFAULT false,
  cost_profile TEXT DEFAULT 'standard',
  quality_notes TEXT,
  test_fixtures JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, prompt_family_id, version)
);

ALTER TABLE public.ai_prompt_families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prompts" ON public.ai_prompt_families FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_prompt_families_ts BEFORE UPDATE ON public.ai_prompt_families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. AI Routing Policies
CREATE TABLE public.ai_routing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_id TEXT NOT NULL,
  task_class TEXT NOT NULL DEFAULT 'general',
  domain TEXT,
  risk_tier TEXT DEFAULT 'standard',
  default_provider TEXT,
  default_model TEXT,
  fallback_provider TEXT,
  fallback_model TEXT,
  fallback_chain JSONB DEFAULT '[]',
  budget_class TEXT DEFAULT 'standard',
  max_cost_cents INTEGER DEFAULT 100,
  verification_policy TEXT DEFAULT 'none',
  premium_escalation_conditions JSONB DEFAULT '{}',
  async_eligible BOOLEAN DEFAULT false,
  latency_target_ms INTEGER,
  confidence_target NUMERIC DEFAULT 0.8,
  structured_output_required BOOLEAN DEFAULT false,
  reuse_eligible BOOLEAN DEFAULT true,
  allowed_providers TEXT[] DEFAULT '{}',
  disallowed_providers TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_routing_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own routing" ON public.ai_routing_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_routing_policies_ts BEFORE UPDATE ON public.ai_routing_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. AI Task Requests (inference log)
CREATE TABLE public.ai_task_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  capability_id TEXT,
  feature_id TEXT,
  prompt_family_id TEXT,
  task_class TEXT NOT NULL DEFAULT 'general',
  domain TEXT,
  risk_tier TEXT DEFAULT 'standard',
  autonomy_tier TEXT DEFAULT 'observe',
  input_hash TEXT,
  input_summary TEXT,
  route_decision JSONB DEFAULT '{}',
  provider_chosen TEXT,
  model_chosen TEXT,
  status TEXT DEFAULT 'pending',
  cost_estimate_cents NUMERIC DEFAULT 0,
  cost_actual_cents NUMERIC DEFAULT 0,
  latency_ms INTEGER,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cache_hit BOOLEAN DEFAULT false,
  reuse_hit BOOLEAN DEFAULT false,
  fallback_used BOOLEAN DEFAULT false,
  fallback_provider TEXT,
  verification_result TEXT,
  verification_confidence NUMERIC,
  structured_output_valid BOOLEAN,
  error TEXT,
  output_summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.ai_task_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own requests" ON public.ai_task_requests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_task_requests_capability ON public.ai_task_requests(capability_id);
CREATE INDEX idx_ai_task_requests_provider ON public.ai_task_requests(provider_chosen);
CREATE INDEX idx_ai_task_requests_created ON public.ai_task_requests(created_at DESC);

-- 5. AI Inference Receipts
CREATE TABLE public.ai_inference_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_request_id UUID REFERENCES public.ai_task_requests(id),
  capability_id TEXT,
  prompt_family_id TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  route_reason TEXT,
  context_sources_used JSONB DEFAULT '[]',
  output_schema_used TEXT,
  cost_estimate_cents NUMERIC DEFAULT 0,
  cost_actual_cents NUMERIC DEFAULT 0,
  latency_ms INTEGER,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  fallback_chain JSONB DEFAULT '[]',
  cache_hits INTEGER DEFAULT 0,
  reuse_artifacts TEXT[] DEFAULT '{}',
  verification_outcome TEXT DEFAULT 'none',
  verification_confidence NUMERIC,
  redaction_applied BOOLEAN DEFAULT false,
  policy_decision_ref TEXT,
  action_refs JSONB DEFAULT '[]',
  hash TEXT,
  previous_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_inference_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own receipts" ON public.ai_inference_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_receipts_task ON public.ai_inference_receipts(task_request_id);
CREATE INDEX idx_ai_receipts_created ON public.ai_inference_receipts(created_at DESC);

-- 6. AI Provider Health
CREATE TABLE public.ai_provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT,
  avg_latency_ms NUMERIC DEFAULT 0,
  p95_latency_ms NUMERIC DEFAULT 0,
  error_rate NUMERIC DEFAULT 0,
  rate_limit_pressure NUMERIC DEFAULT 0,
  availability NUMERIC DEFAULT 1.0,
  structured_output_success_rate NUMERIC DEFAULT 1.0,
  cost_drift_pct NUMERIC DEFAULT 0,
  incident_status TEXT DEFAULT 'none',
  incident_description TEXT,
  total_requests INTEGER DEFAULT 0,
  total_failures INTEGER DEFAULT 0,
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_provider_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health" ON public.ai_provider_health FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_provider_health_ts BEFORE UPDATE ON public.ai_provider_health FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. AI Portfolio Allocations
CREATE TABLE public.ai_portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allocation_class TEXT NOT NULL,
  domain TEXT,
  budget_cents INTEGER NOT NULL DEFAULT 1000,
  spent_cents NUMERIC DEFAULT 0,
  period TEXT DEFAULT 'monthly',
  priority INTEGER DEFAULT 5,
  max_premium_pct NUMERIC DEFAULT 20,
  current_premium_pct NUMERIC DEFAULT 0,
  request_count INTEGER DEFAULT 0,
  avg_cost_per_request NUMERIC DEFAULT 0,
  efficiency_score NUMERIC DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_portfolio_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own allocations" ON public.ai_portfolio_allocations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_portfolio_ts BEFORE UPDATE ON public.ai_portfolio_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. AI Compliance Violations
CREATE TABLE public.ai_compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  feature_id TEXT,
  capability_id TEXT,
  description TEXT NOT NULL,
  source_file TEXT,
  evidence JSONB DEFAULT '{}',
  remediation TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  blocks_launch BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_compliance_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own violations" ON public.ai_compliance_violations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_violations_ts BEFORE UPDATE ON public.ai_compliance_violations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
