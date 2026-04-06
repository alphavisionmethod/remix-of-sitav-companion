
-- ============================================================
-- PART 1: Enhance existing tables
-- ============================================================

ALTER TABLE public.ai_workforce_roles
  ADD COLUMN IF NOT EXISTS domain_family text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS fallback_budget_class text,
  ADD COLUMN IF NOT EXISTS default_routing_class text NOT NULL DEFAULT 'balanced_assistant',
  ADD COLUMN IF NOT EXISTS autonomy_level text NOT NULL DEFAULT 'recommend_only',
  ADD COLUMN IF NOT EXISTS approval_requirement_class text NOT NULL DEFAULT 'recommended',
  ADD COLUMN IF NOT EXISTS launch_honesty_class text NOT NULL DEFAULT 'internal_only',
  ADD COLUMN IF NOT EXISTS supports_demo_mode boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_wf_roles_domain ON public.ai_workforce_roles(domain_family);

ALTER TABLE public.ai_workforce_task_types
  ADD COLUMN IF NOT EXISTS task_family text NOT NULL DEFAULT 'summarize',
  ADD COLUMN IF NOT EXISTS structured_output_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS requires_human_review_for_proposals boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allows_cached_output boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS supports_scope_diffing boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_stage text NOT NULL DEFAULT 'internal';

CREATE INDEX IF NOT EXISTS idx_wf_tasks_family ON public.ai_workforce_task_types(task_family);

ALTER TABLE public.ai_workforce_invocations
  ADD COLUMN IF NOT EXISTS scope_type text NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS scope_ref text,
  ADD COLUMN IF NOT EXISTS scope_payload jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requested_budget_posture text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS resolved_routing_class text,
  ADD COLUMN IF NOT EXISTS used_cached_output boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cached_output_ref uuid,
  ADD COLUMN IF NOT EXISTS ai_usage_ledger_id uuid,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS invoked_by_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_wf_inv_scope ON public.ai_workforce_invocations(scope_type);
CREATE INDEX IF NOT EXISTS idx_wf_inv_invoker ON public.ai_workforce_invocations(invoked_by_user_id);

ALTER TABLE public.ai_workforce_recommendations
  ADD COLUMN IF NOT EXISTS output_id uuid,
  ADD COLUMN IF NOT EXISTS recommendation_type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS risk_tier text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS estimated_impact text,
  ADD COLUMN IF NOT EXISTS estimated_effort text,
  ADD COLUMN IF NOT EXISTS budget_impact_class text,
  ADD COLUMN IF NOT EXISTS launch_impact_class text,
  ADD COLUMN IF NOT EXISTS evidence_refs jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS linked_approval_queue_item_id uuid,
  ADD COLUMN IF NOT EXISTS linked_remediation_program_id uuid;

CREATE INDEX IF NOT EXISTS idx_wf_rec_type ON public.ai_workforce_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_wf_rec_risk ON public.ai_workforce_recommendations(risk_tier);

ALTER TABLE public.ai_workforce_approval_queue
  ADD COLUMN IF NOT EXISTS recommendation_id uuid,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS budget_impact_class text,
  ADD COLUMN IF NOT EXISTS launch_impact_class text,
  ADD COLUMN IF NOT EXISTS evidence_refs jsonb NOT NULL DEFAULT '[]';

-- ============================================================
-- PART 2: Create missing tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_workforce_role_task_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.ai_workforce_roles(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.ai_workforce_task_types(id) ON DELETE CASCADE,
  allowed boolean NOT NULL DEFAULT true,
  preferred_budget_class text,
  preferred_routing_class text,
  requires_approval_override boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_id, task_id)
);
ALTER TABLE public.ai_workforce_role_task_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own role-task perms" ON public.ai_workforce_role_task_permissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ai_workforce_budget_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  budget_class_key text NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  priority_order integer NOT NULL DEFAULT 0,
  premium_allowed boolean NOT NULL DEFAULT false,
  default_max_request_cost_usd numeric(12,4),
  default_daily_budget_usd numeric(12,4),
  default_weekly_budget_usd numeric(12,4),
  default_monthly_budget_usd numeric(12,4),
  fallback_budget_class_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, budget_class_key)
);
ALTER TABLE public.ai_workforce_budget_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budget classes" ON public.ai_workforce_budget_classes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_wf_budget_classes_ts BEFORE UPDATE ON public.ai_workforce_budget_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ai_workforce_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  invocation_id uuid NOT NULL REFERENCES public.ai_workforce_invocations(id) ON DELETE CASCADE,
  output_type text NOT NULL DEFAULT 'summary',
  title text,
  summary_text text,
  structured_payload jsonb NOT NULL DEFAULT '{}',
  confidence_class text,
  launch_honesty_class text,
  contains_recommendations boolean NOT NULL DEFAULT false,
  contains_proposed_actions boolean NOT NULL DEFAULT false,
  contains_sensitive_suggestions boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own outputs" ON public.ai_workforce_outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wf_outputs_inv ON public.ai_workforce_outputs(invocation_id);
CREATE INDEX idx_wf_outputs_type ON public.ai_workforce_outputs(output_type);

CREATE TABLE IF NOT EXISTS public.ai_workforce_recommendation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  score_overall numeric(5,2) NOT NULL DEFAULT 0,
  score_accuracy numeric(5,2),
  score_usefulness numeric(5,2),
  score_actionability numeric(5,2),
  score_evidence_quality numeric(5,2),
  score_cost_efficiency numeric(5,2),
  score_launch_honesty_alignment numeric(5,2),
  review_method text NOT NULL DEFAULT 'auto_heuristic',
  reviewed_by_user_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_recommendation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rec scores" ON public.ai_workforce_recommendation_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wf_rec_scores_rec ON public.ai_workforce_recommendation_scores(recommendation_id);
CREATE INDEX idx_wf_rec_scores_overall ON public.ai_workforce_recommendation_scores(score_overall);

CREATE TABLE IF NOT EXISTS public.ai_workforce_role_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.ai_workforce_roles(id) ON DELETE CASCADE,
  health_state text NOT NULL DEFAULT 'healthy',
  health_reason text,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_used_at timestamptz,
  fallback_rate_24h numeric(5,2),
  avg_cost_24h numeric(12,4),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_role_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own role health" ON public.ai_workforce_role_health FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wf_role_health_role ON public.ai_workforce_role_health(role_id);
CREATE INDEX idx_wf_role_health_state ON public.ai_workforce_role_health(health_state);
CREATE TRIGGER update_wf_role_health_ts BEFORE UPDATE ON public.ai_workforce_role_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ai_workforce_launch_honesty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid REFERENCES public.ai_workforce_roles(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.ai_workforce_task_types(id) ON DELETE CASCADE,
  launch_honesty_class text NOT NULL DEFAULT 'internal_only',
  public_claim_allowed boolean NOT NULL DEFAULT false,
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_launch_honesty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own launch honesty" ON public.ai_workforce_launch_honesty FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PART 3: Views
-- ============================================================

CREATE OR REPLACE VIEW public.v_ai_workforce_role_summary AS
SELECT
  r.id, r.user_id, r.role_key, r.display_name, r.domain_family,
  r.budget_class, r.autonomy_level, r.launch_honesty_class, r.is_active,
  rh.health_state, rh.last_used_at, rh.avg_cost_24h, rh.fallback_rate_24h,
  r.total_invocations, r.total_cost_cents
FROM public.ai_workforce_roles r
LEFT JOIN public.ai_workforce_role_health rh ON rh.role_id = r.id;

CREATE OR REPLACE VIEW public.v_ai_workforce_recent_activity AS
SELECT
  i.id, i.user_id, i.role_key, i.task_type, i.status, i.mode,
  i.budget_class, i.cost_cents, i.tokens_used, i.latency_ms,
  i.fallback_occurred, i.created_at, i.completed_at,
  i.scope_type, i.scope_ref, i.used_cached_output,
  r.display_name as role_display_name
FROM public.ai_workforce_invocations i
LEFT JOIN public.ai_workforce_roles r ON r.role_key = i.role_key AND r.user_id = i.user_id;

CREATE OR REPLACE VIEW public.v_ai_workforce_recommendation_summary AS
SELECT
  rec.id, rec.user_id, rec.title, rec.severity, rec.status,
  rec.recommendation_type, rec.risk_tier, rec.domain,
  rec.estimated_impact, rec.budget_impact_class, rec.launch_impact_class,
  rec.created_at, rec.updated_at,
  rs.score_overall, rs.score_accuracy, rs.score_usefulness,
  rs.score_actionability, rs.review_method,
  rec.linked_approval_queue_item_id
FROM public.ai_workforce_recommendations rec
LEFT JOIN public.ai_workforce_recommendation_scores rs ON rs.recommendation_id = rec.id;

CREATE OR REPLACE VIEW public.v_ai_workforce_queue_summary AS
SELECT
  aq.id, aq.user_id, aq.title, aq.summary, aq.risk_tier,
  aq.severity, aq.status, aq.impacted_domain,
  aq.budget_impact_class, aq.launch_impact_class,
  aq.created_at, aq.resolved_at,
  aq.recommendation_id, aq.invocation_id,
  rec.recommendation_type, rec.role_key as rec_role_key,
  i.role_key as inv_role_key, i.task_type as inv_task_type
FROM public.ai_workforce_approval_queue aq
LEFT JOIN public.ai_workforce_recommendations rec ON rec.id = aq.recommendation_id
LEFT JOIN public.ai_workforce_invocations i ON i.id = aq.invocation_id;
