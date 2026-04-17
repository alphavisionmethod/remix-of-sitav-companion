
-- ═══════════════════════════════════════════════════════════════
-- Phase 21 — AI/Advisor Reality Closure
-- 8 new tables for AI registry, prompt versioning, advisor registry
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. ai_provider_registry ───
CREATE TABLE IF NOT EXISTS public.ai_provider_registry (
  provider_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  base_url TEXT,
  auth_kind TEXT NOT NULL DEFAULT 'bearer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  region TEXT DEFAULT 'global',
  sla_tier TEXT NOT NULL DEFAULT 'standard',
  deprecated_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_provider_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_provider_registry_select_authenticated"
  ON public.ai_provider_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_provider_registry_admin_write"
  ON public.ai_provider_registry FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER trg_ai_provider_registry_updated
  BEFORE UPDATE ON public.ai_provider_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 2. ai_model_registry ───
CREATE TABLE IF NOT EXISTS public.ai_model_registry (
  model_id TEXT PRIMARY KEY,
  provider_key TEXT NOT NULL REFERENCES public.ai_provider_registry(provider_key) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  model_class TEXT NOT NULL DEFAULT 'general',
  quality_tier TEXT NOT NULL DEFAULT 'standard',
  cost_tier TEXT NOT NULL DEFAULT 'standard',
  latency_tier TEXT NOT NULL DEFAULT 'standard',
  context_length INTEGER NOT NULL DEFAULT 128000,
  max_tokens_in INTEGER,
  max_tokens_out INTEGER,
  cost_per_1k_in_cents NUMERIC(10,4) DEFAULT 0,
  cost_per_1k_out_cents NUMERIC(10,4) DEFAULT 0,
  tool_calling_support BOOLEAN NOT NULL DEFAULT false,
  structured_output_support BOOLEAN NOT NULL DEFAULT false,
  recommended_use_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_deprecated BOOLEAN NOT NULL DEFAULT false,
  deprecated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_model_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_model_registry_select_authenticated"
  ON public.ai_model_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_model_registry_admin_write"
  ON public.ai_model_registry FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_ai_model_registry_provider ON public.ai_model_registry(provider_key);
CREATE TRIGGER trg_ai_model_registry_updated
  BEFORE UPDATE ON public.ai_model_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 3. ai_provider_health ───
CREATE TABLE IF NOT EXISTS public.ai_provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key TEXT NOT NULL REFERENCES public.ai_provider_registry(provider_key) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unknown',
  last_probed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  latency_ms_p50 INTEGER,
  latency_ms_p95 INTEGER,
  error_rate_pct NUMERIC(5,2) DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_end TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_provider_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_provider_health_select_authenticated"
  ON public.ai_provider_health FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_provider_health_admin_write"
  ON public.ai_provider_health FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_ai_provider_health_provider_time ON public.ai_provider_health(provider_key, last_probed_at DESC);

-- ─── 4. ai_routing_policies ───
CREATE TABLE IF NOT EXISTS public.ai_routing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id TEXT NOT NULL,
  primary_model TEXT NOT NULL REFERENCES public.ai_model_registry(model_id),
  fallback_models TEXT[] NOT NULL DEFAULT '{}',
  risk_tier TEXT NOT NULL DEFAULT 'R1',
  max_cost_cents INTEGER NOT NULL DEFAULT 100,
  enabled BOOLEAN NOT NULL DEFAULT true,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_routing_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_routing_policies_select_authenticated"
  ON public.ai_routing_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_routing_policies_admin_write"
  ON public.ai_routing_policies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_ai_routing_policies_capability ON public.ai_routing_policies(capability_id);
CREATE TRIGGER trg_ai_routing_policies_updated
  BEFORE UPDATE ON public.ai_routing_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 5. ai_capability_routing ───
CREATE TABLE IF NOT EXISTS public.ai_capability_routing (
  capability_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  primary_model TEXT NOT NULL REFERENCES public.ai_model_registry(model_id),
  fallback_chain JSONB NOT NULL DEFAULT '[]'::jsonb,
  task_class TEXT NOT NULL DEFAULT 'general',
  risk_tier TEXT NOT NULL DEFAULT 'R1',
  budget_class TEXT NOT NULL DEFAULT 'standard',
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_capability_routing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_capability_routing_select_authenticated"
  ON public.ai_capability_routing FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_capability_routing_admin_write"
  ON public.ai_capability_routing FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER trg_ai_capability_routing_updated
  BEFORE UPDATE ON public.ai_capability_routing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 6. ai_prompt_families ───
CREATE TABLE IF NOT EXISTS public.ai_prompt_families (
  family_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  owner_domain TEXT NOT NULL DEFAULT 'shared',
  current_version_id UUID,
  description TEXT,
  capability_keys TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_prompt_families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_prompt_families_select_authenticated"
  ON public.ai_prompt_families FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_prompt_families_admin_write"
  ON public.ai_prompt_families FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER trg_ai_prompt_families_updated
  BEFORE UPDATE ON public.ai_prompt_families
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 7. ai_prompt_versions ───
CREATE TABLE IF NOT EXISTS public.ai_prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id TEXT NOT NULL REFERENCES public.ai_prompt_families(family_id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  system_prompt TEXT NOT NULL DEFAULT '',
  template TEXT NOT NULL DEFAULT '',
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  hash TEXT NOT NULL,
  created_by UUID,
  activated_at TIMESTAMPTZ,
  deprecated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ai_prompt_versions_status_check CHECK (status IN ('draft','active','deprecated'))
);
ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_prompt_versions_select_authenticated"
  ON public.ai_prompt_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_prompt_versions_admin_write"
  ON public.ai_prompt_versions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_ai_prompt_versions_family_status ON public.ai_prompt_versions(family_id, status);
CREATE TRIGGER trg_ai_prompt_versions_updated
  BEFORE UPDATE ON public.ai_prompt_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 8. ai_prompt_invocations ───
CREATE TABLE IF NOT EXISTS public.ai_prompt_invocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invocation_id UUID,
  family_id TEXT NOT NULL,
  version_id UUID,
  capability_key TEXT,
  advisor_id TEXT,
  user_id UUID NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_prompt_invocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_prompt_invocations_select_own_or_admin"
  ON public.ai_prompt_invocations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "ai_prompt_invocations_admin_write"
  ON public.ai_prompt_invocations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_ai_prompt_invocations_family_ts ON public.ai_prompt_invocations(family_id, ts DESC);

-- ─── 9. advisor_registry ───
CREATE TABLE IF NOT EXISTS public.advisor_registry (
  advisor_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  council TEXT NOT NULL DEFAULT 'customer-facing',
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_model TEXT,
  prompt_family_id TEXT,
  autonomy_level TEXT NOT NULL DEFAULT 'L2-recommend',
  risk_tier TEXT NOT NULL DEFAULT 'R2',
  maturity TEXT NOT NULL DEFAULT 'scaffold',
  confidence_threshold NUMERIC(3,2) DEFAULT 0.7,
  blocked_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_inputs JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advisor_registry_select_authenticated"
  ON public.advisor_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "advisor_registry_admin_write"
  ON public.advisor_registry FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER trg_advisor_registry_updated
  BEFORE UPDATE ON public.advisor_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
