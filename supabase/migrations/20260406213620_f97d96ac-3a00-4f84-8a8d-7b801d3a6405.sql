
-- ═══════════════════════════════════════════════════════
-- Customer Journey Proof System — 6 New Tables
-- ═══════════════════════════════════════════════════════

-- 1. ui_action_inventory
CREATE TABLE public.ui_action_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_key TEXT NOT NULL,
  surface_class TEXT NOT NULL DEFAULT 'user_app',
  component_name TEXT,
  action_key TEXT NOT NULL,
  action_label TEXT,
  action_type TEXT NOT NULL DEFAULT 'click',
  selector_hint TEXT,
  test_id TEXT,
  expected_outcome TEXT,
  supported_modes JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority_class TEXT NOT NULL DEFAULT 'p2',
  launch_honesty_class TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, route_key, action_key)
);

ALTER TABLE public.ui_action_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own action inventory"
  ON public.ui_action_inventory FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_ui_action_inventory_updated_at
  BEFORE UPDATE ON public.ui_action_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. journey_step_results
CREATE TABLE public.journey_step_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verification_run_id UUID NOT NULL,
  journey_step_id UUID,
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'skipped',
  actual_behavior TEXT,
  error_summary TEXT,
  screenshot_ref TEXT,
  trace_ref TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journey_step_results_run ON public.journey_step_results (verification_run_id);
CREATE INDEX idx_journey_step_results_step ON public.journey_step_results (journey_step_id);

ALTER TABLE public.journey_step_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own step results"
  ON public.journey_step_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. launch_blocker_scores
CREATE TABLE public.launch_blocker_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_key TEXT,
  verification_run_id UUID,
  blocker_type TEXT NOT NULL DEFAULT 'non_blocking',
  severity_score INTEGER NOT NULL DEFAULT 0,
  reason_summary TEXT NOT NULL DEFAULT '',
  affects_demo BOOLEAN NOT NULL DEFAULT false,
  affects_real BOOLEAN NOT NULL DEFAULT false,
  affects_admin BOOLEAN NOT NULL DEFAULT false,
  affects_user BOOLEAN NOT NULL DEFAULT true,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_launch_blocker_scores_journey ON public.launch_blocker_scores (journey_key);
CREATE INDEX idx_launch_blocker_scores_type ON public.launch_blocker_scores (blocker_type);

ALTER TABLE public.launch_blocker_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own blocker scores"
  ON public.launch_blocker_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. customer_journey_mode_comparisons
CREATE TABLE public.customer_journey_mode_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_key TEXT NOT NULL,
  real_status TEXT,
  demo_status TEXT,
  internal_test_status TEXT,
  comparison_summary TEXT,
  claim_risk BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, journey_key)
);

ALTER TABLE public.customer_journey_mode_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mode comparisons"
  ON public.customer_journey_mode_comparisons FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_cj_mode_comparisons_updated_at
  BEFORE UPDATE ON public.customer_journey_mode_comparisons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. verification_evidence_assets
CREATE TABLE public.verification_evidence_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verification_run_id UUID NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'screenshot',
  asset_ref TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_evidence_assets_run ON public.verification_evidence_assets (verification_run_id);

ALTER TABLE public.verification_evidence_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own evidence assets"
  ON public.verification_evidence_assets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. route_verification_coverage
CREATE TABLE public.route_verification_coverage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_key TEXT NOT NULL,
  surface_class TEXT NOT NULL DEFAULT 'user_app',
  total_actions INTEGER NOT NULL DEFAULT 0,
  verified_actions INTEGER NOT NULL DEFAULT 0,
  p0_actions INTEGER NOT NULL DEFAULT 0,
  p0_verified_actions INTEGER NOT NULL DEFAULT 0,
  p1_actions INTEGER NOT NULL DEFAULT 0,
  p1_verified_actions INTEGER NOT NULL DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  coverage_percent NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, route_key)
);

ALTER TABLE public.route_verification_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own route coverage"
  ON public.route_verification_coverage FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_route_verification_coverage_updated_at
  BEFORE UPDATE ON public.route_verification_coverage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
