
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — AI Provider Gateway & Budget Intelligence Schema
-- Full advanced implementation
-- ═══════════════════════════════════════════════════════════════

-- ── TABLE 1: ai_provider_registry ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_provider_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider_key text NOT NULL,
  display_name text NOT NULL,
  api_style text NOT NULL DEFAULT 'chat_completions',
  secret_env_name text,
  base_url text,
  supports_tools boolean NOT NULL DEFAULT false,
  supports_structured_output boolean NOT NULL DEFAULT false,
  supports_streaming boolean NOT NULL DEFAULT false,
  supports_demo_mode boolean NOT NULL DEFAULT false,
  launch_stage text NOT NULL DEFAULT 'planned',
  is_active boolean NOT NULL DEFAULT true,
  mode text NOT NULL DEFAULT 'real',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_provider_registry_key ON public.ai_provider_registry(user_id, provider_key);

ALTER TABLE public.ai_provider_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own provider registry"
  ON public.ai_provider_registry FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Extend ai_model_registry ───────────────────────────────────
ALTER TABLE public.ai_model_registry
  ADD COLUMN IF NOT EXISTS quality_tier text DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS supports_streaming boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS supports_json_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recommended_use_cases jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS max_output_tokens_default integer,
  ADD COLUMN IF NOT EXISTS provider_registry_id uuid REFERENCES public.ai_provider_registry(id),
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'real';

-- ── Extend ai_routing_policies ─────────────────────────────────
ALTER TABLE public.ai_routing_policies
  ADD COLUMN IF NOT EXISTS routing_class text DEFAULT 'balanced_assistant',
  ADD COLUMN IF NOT EXISTS quality_requirement text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS tool_use_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_fallback_to_demo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_fallback_to_unavailable boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_honesty_class text DEFAULT 'qualified';

-- ── Extend ai_provider_health ──────────────────────────────────
ALTER TABLE public.ai_provider_health
  ADD COLUMN IF NOT EXISTS health_state text DEFAULT 'healthy',
  ADD COLUMN IF NOT EXISTS last_success_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_failure_at timestamptz,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS provider_registry_id uuid REFERENCES public.ai_provider_registry(id);

-- ── TABLE 3: ai_capability_routing ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_capability_routing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  default_provider_id uuid REFERENCES public.ai_provider_registry(id),
  default_model_id uuid REFERENCES public.ai_model_registry(id),
  fallback_provider_id uuid REFERENCES public.ai_provider_registry(id),
  fallback_model_id uuid REFERENCES public.ai_model_registry(id),
  routing_class text NOT NULL DEFAULT 'balanced_assistant',
  budget_class text NOT NULL DEFAULT 'standard',
  quality_requirement text NOT NULL DEFAULT 'standard',
  structured_output_required boolean NOT NULL DEFAULT false,
  tool_use_required boolean NOT NULL DEFAULT false,
  max_latency_class text NOT NULL DEFAULT 'medium',
  can_fallback_to_demo boolean NOT NULL DEFAULT false,
  can_fallback_to_unavailable boolean NOT NULL DEFAULT true,
  launch_honesty_class text NOT NULL DEFAULT 'qualified',
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_capability_routing_key ON public.ai_capability_routing(user_id, capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_capability_routing_class ON public.ai_capability_routing(routing_class);

ALTER TABLE public.ai_capability_routing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own capability routing"
  ON public.ai_capability_routing FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 4: ai_budget_policies ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_budget_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  policy_key text NOT NULL,
  scope_type text NOT NULL DEFAULT 'global',
  scope_ref text,
  daily_budget_usd numeric(12,4),
  weekly_budget_usd numeric(12,4),
  monthly_budget_usd numeric(12,4),
  max_request_cost_usd numeric(12,4),
  max_daily_requests integer,
  premium_allowed boolean NOT NULL DEFAULT true,
  fallback_on_exceeded boolean NOT NULL DEFAULT true,
  fallback_model_id uuid REFERENCES public.ai_model_registry(id),
  block_on_exceeded boolean NOT NULL DEFAULT false,
  alert_threshold_percent numeric(5,2) NOT NULL DEFAULT 80.00,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_budget_policies_key ON public.ai_budget_policies(user_id, policy_key);
CREATE INDEX IF NOT EXISTS idx_ai_budget_policies_scope ON public.ai_budget_policies(scope_type);

ALTER TABLE public.ai_budget_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own budget policies"
  ON public.ai_budget_policies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 5: ai_usage_ledger ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  session_id uuid,
  capability_key text NOT NULL,
  provider_id uuid REFERENCES public.ai_provider_registry(id),
  model_id uuid REFERENCES public.ai_model_registry(id),
  mode text NOT NULL DEFAULT 'real',
  request_class text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'success',
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  estimated_cost_usd numeric(12,6),
  latency_ms integer,
  structured_output_valid boolean,
  tool_invocations_count integer NOT NULL DEFAULT 0,
  receipt_id uuid,
  error_code text,
  error_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_user ON public.ai_usage_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_capability ON public.ai_usage_ledger(capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_provider ON public.ai_usage_ledger(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_created ON public.ai_usage_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_status ON public.ai_usage_ledger(status);

ALTER TABLE public.ai_usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage ledger"
  ON public.ai_usage_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own usage ledger"
  ON public.ai_usage_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 7: ai_fallback_events ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_fallback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  primary_provider_id uuid REFERENCES public.ai_provider_registry(id),
  primary_model_id uuid REFERENCES public.ai_model_registry(id),
  fallback_provider_id uuid REFERENCES public.ai_provider_registry(id),
  fallback_model_id uuid REFERENCES public.ai_model_registry(id),
  fallback_reason text NOT NULL,
  result_state text NOT NULL DEFAULT 'fallback_success',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_fallback_events_cap ON public.ai_fallback_events(capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_fallback_events_created ON public.ai_fallback_events(created_at DESC);

ALTER TABLE public.ai_fallback_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own fallback events"
  ON public.ai_fallback_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own fallback events"
  ON public.ai_fallback_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 8: ai_launch_honesty ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_launch_honesty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  launch_honesty_class text NOT NULL DEFAULT 'planned',
  public_claim_allowed boolean NOT NULL DEFAULT false,
  qualifier_required boolean NOT NULL DEFAULT true,
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_launch_honesty_key ON public.ai_launch_honesty(user_id, capability_key);

ALTER TABLE public.ai_launch_honesty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own launch honesty"
  ON public.ai_launch_honesty FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 9: ai_receipt_records ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_receipt_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  capability_key text NOT NULL,
  provider_id uuid REFERENCES public.ai_provider_registry(id),
  model_id uuid REFERENCES public.ai_model_registry(id),
  mode text NOT NULL DEFAULT 'real',
  request_summary text,
  response_summary text,
  structured_output_valid boolean,
  decision_class text,
  degraded_reason text,
  usage_ledger_id uuid REFERENCES public.ai_usage_ledger(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_receipt_records_cap ON public.ai_receipt_records(capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_receipt_records_created ON public.ai_receipt_records(created_at DESC);

ALTER TABLE public.ai_receipt_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own receipt records"
  ON public.ai_receipt_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own receipt records"
  ON public.ai_receipt_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 10: ai_budget_alerts ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_budget_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  policy_id uuid REFERENCES public.ai_budget_policies(id),
  scope_type text NOT NULL,
  scope_ref text,
  threshold_percent numeric(5,2) NOT NULL,
  observed_cost_usd numeric(12,4) NOT NULL,
  period_class text NOT NULL DEFAULT 'daily',
  alert_state text NOT NULL DEFAULT 'warning',
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_budget_alerts_policy ON public.ai_budget_alerts(policy_id);
CREATE INDEX IF NOT EXISTS idx_ai_budget_alerts_state ON public.ai_budget_alerts(alert_state);

ALTER TABLE public.ai_budget_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own budget alerts"
  ON public.ai_budget_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own budget alerts"
  ON public.ai_budget_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── VIEWS ──────────────────────────────────────────────────────

-- v_ai_capability_status: routing + provider + model + launch honesty
CREATE OR REPLACE VIEW public.v_ai_capability_status
WITH (security_invoker = on) AS
SELECT
  cr.id,
  cr.user_id,
  cr.capability_key,
  cr.routing_class,
  cr.budget_class,
  cr.quality_requirement,
  cr.is_active,
  dp.provider_key AS default_provider_key,
  dp.display_name AS default_provider_name,
  dp.is_active AS provider_active,
  dm.model_id AS default_model_key,
  dm.display_name AS default_model_name,
  dm.quality_tier,
  dm.cost_tier,
  fp.provider_key AS fallback_provider_key,
  fm.model_id AS fallback_model_key,
  lh.launch_honesty_class,
  lh.public_claim_allowed,
  lh.qualifier_required,
  ph.health_state AS provider_health_state,
  cr.created_at,
  cr.updated_at
FROM public.ai_capability_routing cr
LEFT JOIN public.ai_provider_registry dp ON cr.default_provider_id = dp.id
LEFT JOIN public.ai_model_registry dm ON cr.default_model_id = dm.id
LEFT JOIN public.ai_provider_registry fp ON cr.fallback_provider_id = fp.id
LEFT JOIN public.ai_model_registry fm ON cr.fallback_model_id = fm.id
LEFT JOIN public.ai_launch_honesty lh ON cr.capability_key = lh.capability_key AND cr.user_id = lh.user_id
LEFT JOIN public.ai_provider_health ph ON dp.provider_key = ph.provider AND cr.user_id = ph.user_id;

-- v_ai_budget_summary: aggregated spend
CREATE OR REPLACE VIEW public.v_ai_budget_summary
WITH (security_invoker = on) AS
SELECT
  ul.user_id,
  date_trunc('day', ul.created_at) AS period_day,
  ul.capability_key,
  ul.status,
  COUNT(*) AS request_count,
  SUM(ul.prompt_tokens) AS total_prompt_tokens,
  SUM(ul.completion_tokens) AS total_completion_tokens,
  SUM(ul.total_tokens) AS total_tokens,
  SUM(ul.estimated_cost_usd) AS total_cost_usd,
  AVG(ul.latency_ms) AS avg_latency_ms
FROM public.ai_usage_ledger ul
GROUP BY ul.user_id, date_trunc('day', ul.created_at), ul.capability_key, ul.status;

-- v_ai_provider_status: provider + health + config
CREATE OR REPLACE VIEW public.v_ai_provider_status
WITH (security_invoker = on) AS
SELECT
  pr.id,
  pr.user_id,
  pr.provider_key,
  pr.display_name,
  pr.api_style,
  pr.secret_env_name,
  pr.supports_tools,
  pr.supports_structured_output,
  pr.supports_streaming,
  pr.launch_stage,
  pr.is_active,
  pr.mode,
  ph.health_state,
  ph.last_success_at,
  ph.last_failure_at,
  ph.failure_reason,
  ph.avg_latency_ms,
  ph.error_rate,
  ph.total_requests,
  ph.total_failures
FROM public.ai_provider_registry pr
LEFT JOIN public.ai_provider_health ph ON pr.provider_key = ph.provider AND pr.user_id = ph.user_id;

-- v_ai_usage_recent: recent invocations readable
CREATE OR REPLACE VIEW public.v_ai_usage_recent
WITH (security_invoker = on) AS
SELECT
  ul.id,
  ul.user_id,
  ul.capability_key,
  ul.mode,
  ul.request_class,
  ul.status,
  ul.prompt_tokens,
  ul.completion_tokens,
  ul.total_tokens,
  ul.estimated_cost_usd,
  ul.latency_ms,
  ul.structured_output_valid,
  ul.error_code,
  ul.error_summary,
  pr.provider_key,
  pr.display_name AS provider_name,
  mr.model_id AS model_key,
  mr.display_name AS model_name,
  mr.quality_tier,
  ul.created_at
FROM public.ai_usage_ledger ul
LEFT JOIN public.ai_provider_registry pr ON ul.provider_id = pr.id
LEFT JOIN public.ai_model_registry mr ON ul.model_id = mr.id
ORDER BY ul.created_at DESC;

-- ── Triggers for updated_at ────────────────────────────────────
CREATE TRIGGER update_ai_provider_registry_updated_at
  BEFORE UPDATE ON public.ai_provider_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_capability_routing_updated_at
  BEFORE UPDATE ON public.ai_capability_routing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_budget_policies_updated_at
  BEFORE UPDATE ON public.ai_budget_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_launch_honesty_updated_at
  BEFORE UPDATE ON public.ai_launch_honesty
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
