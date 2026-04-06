
-- 1. customer_journey_registry
CREATE TABLE public.customer_journey_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  persona text NOT NULL,
  surface_class text NOT NULL,
  domain_family text NOT NULL,
  route_key text NULL,
  priority_class text NOT NULL DEFAULT 'p1',
  launch_importance text NOT NULL DEFAULT 'important',
  expected_outcome text NOT NULL,
  supported_modes jsonb NOT NULL DEFAULT '[]'::jsonb,
  launch_honesty_class text NULL,
  owner_team text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cjr_priority ON public.customer_journey_registry(priority_class);
CREATE INDEX idx_cjr_importance ON public.customer_journey_registry(launch_importance);
CREATE INDEX idx_cjr_surface ON public.customer_journey_registry(surface_class);
CREATE INDEX idx_cjr_domain ON public.customer_journey_registry(domain_family);
ALTER TABLE public.customer_journey_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read registry" ON public.customer_journey_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert registry" ON public.customer_journey_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update registry" ON public.customer_journey_registry FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth delete registry" ON public.customer_journey_registry FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_cjr_updated_at BEFORE UPDATE ON public.customer_journey_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. journey_verification_runs
CREATE TABLE public.journey_verification_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.customer_journey_registry(id) ON DELETE CASCADE,
  mode text NOT NULL,
  environment text NOT NULL,
  verification_type text NOT NULL,
  status text NOT NULL,
  proof_confidence text NOT NULL,
  steps_passed integer NOT NULL DEFAULT 0,
  steps_failed integer NOT NULL DEFAULT 0,
  steps_skipped integer NOT NULL DEFAULT 0,
  launch_impact text NULL,
  summary text NULL,
  evidence_bundle_ref text NULL,
  run_identifier text NULL,
  commit_sha text NULL,
  branch_name text NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_jvr_journey ON public.journey_verification_runs(journey_id);
CREATE INDEX idx_jvr_mode ON public.journey_verification_runs(mode);
CREATE INDEX idx_jvr_env ON public.journey_verification_runs(environment);
CREATE INDEX idx_jvr_status ON public.journey_verification_runs(status);
CREATE INDEX idx_jvr_created ON public.journey_verification_runs(created_at DESC);
ALTER TABLE public.journey_verification_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read runs" ON public.journey_verification_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert runs" ON public.journey_verification_runs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update runs" ON public.journey_verification_runs FOR UPDATE TO authenticated USING (true);

-- 3. customer_journey_status
CREATE TABLE public.customer_journey_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid UNIQUE NOT NULL REFERENCES public.customer_journey_registry(id) ON DELETE CASCADE,
  current_status text NOT NULL DEFAULT 'unverified',
  last_verified_run_id uuid NULL REFERENCES public.journey_verification_runs(id) ON DELETE SET NULL,
  last_verified_at timestamptz NULL,
  launch_impact text NULL,
  proof_confidence text NULL,
  actual_outcome_summary text NULL,
  recommended_fix text NULL,
  owner_team text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cjs_status ON public.customer_journey_status(current_status);
CREATE INDEX idx_cjs_impact ON public.customer_journey_status(launch_impact);
ALTER TABLE public.customer_journey_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read status" ON public.customer_journey_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert status" ON public.customer_journey_status FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update status" ON public.customer_journey_status FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_cjs_updated_at BEFORE UPDATE ON public.customer_journey_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. ALTER existing tables
ALTER TABLE public.ui_action_inventory ADD COLUMN IF NOT EXISTS owner_team text NULL;
ALTER TABLE public.verification_evidence_assets ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.launch_blocker_scores ADD COLUMN IF NOT EXISTS journey_id uuid NULL REFERENCES public.customer_journey_registry(id) ON DELETE SET NULL;

-- 5. Views

CREATE OR REPLACE VIEW public.v_customer_journey_summary AS
SELECT r.id AS registry_id, r.journey_key, r.display_name, r.persona, r.surface_class, r.domain_family,
  r.priority_class, r.launch_importance, r.expected_outcome, r.launch_honesty_class, r.owner_team, r.is_active,
  s.current_status, s.last_verified_at, s.launch_impact, s.proof_confidence, s.actual_outcome_summary, s.recommended_fix,
  v.status AS last_run_status, v.mode AS last_run_mode, v.environment AS last_run_environment,
  v.steps_passed AS last_run_steps_passed, v.steps_failed AS last_run_steps_failed, v.commit_sha AS last_run_commit_sha
FROM public.customer_journey_registry r
LEFT JOIN public.customer_journey_status s ON s.journey_id = r.id
LEFT JOIN public.journey_verification_runs v ON v.id = s.last_verified_run_id;

CREATE OR REPLACE VIEW public.v_customer_journey_blockers AS
SELECT b.id AS blocker_id, b.blocker_type, b.severity_score, b.reason_summary,
  b.affects_demo, b.affects_real, b.affects_admin, b.affects_user, b.resolved, b.created_at AS blocker_created_at, b.resolved_at,
  r.journey_key, r.display_name, r.domain_family, r.priority_class, r.launch_importance, r.owner_team
FROM public.launch_blocker_scores b
LEFT JOIN public.customer_journey_registry r ON r.id = b.journey_id
WHERE b.resolved = false;

CREATE OR REPLACE VIEW public.v_customer_journey_mode_deltas AS
SELECT mc.id AS comparison_id, mc.real_status, mc.demo_status, mc.comparison_summary, mc.claim_risk, mc.updated_at,
  r.journey_key, r.display_name, r.domain_family, r.persona, r.priority_class
FROM public.customer_journey_mode_comparisons mc
LEFT JOIN public.customer_journey_registry r ON r.journey_key = mc.journey_key;

CREATE OR REPLACE VIEW public.v_route_verification_summary AS
SELECT surface_class, COUNT(*) AS total_routes, SUM(total_actions) AS total_actions,
  SUM(verified_actions) AS total_verified_actions, SUM(p0_actions) AS total_p0_actions,
  SUM(p0_verified_actions) AS total_p0_verified,
  CASE WHEN SUM(total_actions) > 0 THEN ROUND((SUM(verified_actions)::numeric / SUM(total_actions)::numeric) * 100, 2) ELSE 0 END AS overall_coverage_percent,
  MAX(last_verified_at) AS latest_verification
FROM public.route_verification_coverage GROUP BY surface_class;

CREATE OR REPLACE VIEW public.v_customer_journey_recent_failures AS
SELECT v.id AS run_id, v.status, v.mode, v.environment, v.verification_type,
  v.steps_passed, v.steps_failed, v.steps_skipped, v.summary, v.commit_sha, v.branch_name,
  v.started_at, v.completed_at, v.created_at,
  r.journey_key, r.display_name, r.domain_family, r.priority_class, r.launch_importance
FROM public.journey_verification_runs v
JOIN public.customer_journey_registry r ON r.id = v.journey_id
WHERE v.status IN ('fail', 'partial', 'blocked')
ORDER BY v.created_at DESC LIMIT 100;
