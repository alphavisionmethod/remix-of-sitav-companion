
-- ============================================================
-- SITA OS — Consolidated Recommendation-to-Execution Migration
-- 20 tables + 4 views, correct dependency order
-- ============================================================

-- Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- TIER 1 — No dependencies
-- ============================================================

-- 1. ai_workforce_roles
CREATE TABLE IF NOT EXISTS public.ai_workforce_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  council text NOT NULL DEFAULT 'general',
  mission text,
  special_ability text,
  max_autonomy_level integer NOT NULL DEFAULT 2,
  allowed_tools jsonb NOT NULL DEFAULT '[]',
  forbidden_tools jsonb NOT NULL DEFAULT '[]',
  memory_scope text NOT NULL DEFAULT 'session',
  trigger_conditions jsonb NOT NULL DEFAULT '[]',
  escalation_targets jsonb NOT NULL DEFAULT '[]',
  kpis jsonb NOT NULL DEFAULT '[]',
  cost_budget_cents integer NOT NULL DEFAULT 100,
  maturity text NOT NULL DEFAULT 'scaffold',
  status text NOT NULL DEFAULT 'active',
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_roles" ON public.ai_workforce_roles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_roles_role_key ON public.ai_workforce_roles(role_key);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_roles_council ON public.ai_workforce_roles(council);
DROP TRIGGER IF EXISTS update_ai_workforce_roles_updated_at ON public.ai_workforce_roles;
CREATE TRIGGER update_ai_workforce_roles_updated_at BEFORE UPDATE ON public.ai_workforce_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ai_workforce_task_types
CREATE TABLE IF NOT EXISTS public.ai_workforce_task_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  council text NOT NULL DEFAULT 'general',
  input_schema jsonb NOT NULL DEFAULT '{}',
  output_schema jsonb NOT NULL DEFAULT '{}',
  default_model text,
  max_tokens integer NOT NULL DEFAULT 4000,
  temperature numeric(3,2) NOT NULL DEFAULT 0.7,
  requires_approval boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_task_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_task_types" ON public.ai_workforce_task_types FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_task_types_task_key ON public.ai_workforce_task_types(task_key);
DROP TRIGGER IF EXISTS update_ai_workforce_task_types_updated_at ON public.ai_workforce_task_types;
CREATE TRIGGER update_ai_workforce_task_types_updated_at BEFORE UPDATE ON public.ai_workforce_task_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. ai_workforce_budget_classes
CREATE TABLE IF NOT EXISTS public.ai_workforce_budget_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  priority_order integer NOT NULL DEFAULT 0,
  max_tokens_per_call integer NOT NULL DEFAULT 4000,
  max_cost_cents_per_call integer NOT NULL DEFAULT 50,
  max_calls_per_hour integer NOT NULL DEFAULT 10,
  allowed_models jsonb NOT NULL DEFAULT '[]',
  description text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_budget_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_budget_classes" ON public.ai_workforce_budget_classes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_ai_workforce_budget_classes_updated_at ON public.ai_workforce_budget_classes;
CREATE TRIGGER update_ai_workforce_budget_classes_updated_at BEFORE UPDATE ON public.ai_workforce_budget_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. flagship_loops
CREATE TABLE IF NOT EXISTS public.flagship_loops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  primary_persona text NOT NULL DEFAULT 'user',
  launch_importance text NOT NULL DEFAULT 'important_to_launch',
  status text NOT NULL DEFAULT 'active',
  core_routes jsonb NOT NULL DEFAULT '[]',
  core_journeys jsonb NOT NULL DEFAULT '[]',
  primary_services jsonb NOT NULL DEFAULT '[]',
  owner_team text,
  ux_quality_target text NOT NULL DEFAULT 'premium',
  proof_required boolean NOT NULL DEFAULT true,
  launch_honesty_class text NOT NULL DEFAULT 'needs_proof',
  proof_status text NOT NULL DEFAULT 'not_started',
  blocker_count integer NOT NULL DEFAULT 0,
  demo_vs_real text NOT NULL DEFAULT 'demo',
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.flagship_loops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own flagship_loops" ON public.flagship_loops FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_flagship_loops_loop_key ON public.flagship_loops(loop_key);
CREATE INDEX IF NOT EXISTS idx_flagship_loops_status ON public.flagship_loops(status);
DROP TRIGGER IF EXISTS update_flagship_loops_updated_at ON public.flagship_loops;
CREATE TRIGGER update_flagship_loops_updated_at BEFORE UPDATE ON public.flagship_loops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. remediation_programs
CREATE TABLE IF NOT EXISTS public.remediation_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  focus_area text NOT NULL DEFAULT 'general',
  program_status text NOT NULL DEFAULT 'active',
  flagship_loop_key text,
  owner_team text,
  owner_user_id uuid,
  start_at timestamptz,
  target_at timestamptz,
  completed_at timestamptz,
  launch_impact_class text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.remediation_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own remediation_programs" ON public.remediation_programs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_remediation_programs_program_key ON public.remediation_programs(program_key);
CREATE INDEX IF NOT EXISTS idx_remediation_programs_focus_area ON public.remediation_programs(focus_area);
CREATE INDEX IF NOT EXISTS idx_remediation_programs_status ON public.remediation_programs(program_status);
CREATE INDEX IF NOT EXISTS idx_remediation_programs_flagship ON public.remediation_programs(flagship_loop_key);
DROP TRIGGER IF EXISTS update_remediation_programs_updated_at ON public.remediation_programs;
CREATE TRIGGER update_remediation_programs_updated_at BEFORE UPDATE ON public.remediation_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TIER 2 — Depends on Tier 1
-- ============================================================

-- 6. ai_workforce_invocations
CREATE TABLE IF NOT EXISTS public.ai_workforce_invocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  task_key text NOT NULL,
  scope_type text,
  scope_ref text,
  scope_payload jsonb NOT NULL DEFAULT '{}',
  budget_posture text NOT NULL DEFAULT 'normal',
  mode text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'pending',
  model_used text,
  tokens_in integer,
  tokens_out integer,
  cost_cents numeric(10,4),
  duration_ms integer,
  error_message text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_invocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_invocations" ON public.ai_workforce_invocations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_invocations_role ON public.ai_workforce_invocations(role_key);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_invocations_task ON public.ai_workforce_invocations(task_key);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_invocations_status ON public.ai_workforce_invocations(status);
DROP TRIGGER IF EXISTS update_ai_workforce_invocations_updated_at ON public.ai_workforce_invocations;
CREATE TRIGGER update_ai_workforce_invocations_updated_at BEFORE UPDATE ON public.ai_workforce_invocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. ai_workforce_recommendations
CREATE TABLE IF NOT EXISTS public.ai_workforce_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invocation_id uuid REFERENCES public.ai_workforce_invocations(id) ON DELETE SET NULL,
  role_key text NOT NULL,
  task_key text,
  domain text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}',
  evidence jsonb NOT NULL DEFAULT '[]',
  severity text NOT NULL DEFAULT 'info',
  confidence numeric(5,2) NOT NULL DEFAULT 0.5,
  status text NOT NULL DEFAULT 'new',
  lifecycle_status text NOT NULL DEFAULT 'new',
  approval_decision_at timestamptz,
  approved_by_user_id uuid,
  rejected_by_user_id uuid,
  deferred_reason text,
  execution_required boolean NOT NULL DEFAULT false,
  execution_priority text,
  flagship_loop_key text,
  customer_journey_impact_key text,
  launch_blocker_impact_class text,
  outcome_verification_required boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_recommendations" ON public.ai_workforce_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_status ON public.ai_workforce_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_lifecycle ON public.ai_workforce_recommendations(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_role ON public.ai_workforce_recommendations(role_key);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_domain ON public.ai_workforce_recommendations(domain);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_exec ON public.ai_workforce_recommendations(execution_required);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_flagship ON public.ai_workforce_recommendations(flagship_loop_key);
DROP TRIGGER IF EXISTS update_ai_workforce_recommendations_updated_at ON public.ai_workforce_recommendations;
CREATE TRIGGER update_ai_workforce_recommendations_updated_at BEFORE UPDATE ON public.ai_workforce_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. ai_workforce_approval_queue
CREATE TABLE IF NOT EXISTS public.ai_workforce_approval_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  reviewer_user_id uuid,
  reviewer_comments text,
  evidence_links jsonb NOT NULL DEFAULT '[]',
  cost_implications text,
  launch_implications text,
  remediation_binding_id uuid,
  decision_at timestamptz,
  escalated boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_approval_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_approval_queue" ON public.ai_workforce_approval_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_approval_queue_status ON public.ai_workforce_approval_queue(status);
CREATE INDEX IF NOT EXISTS idx_approval_queue_rec ON public.ai_workforce_approval_queue(recommendation_id);
DROP TRIGGER IF EXISTS update_ai_workforce_approval_queue_updated_at ON public.ai_workforce_approval_queue;
CREATE TRIGGER update_ai_workforce_approval_queue_updated_at BEFORE UPDATE ON public.ai_workforce_approval_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. ai_workforce_cached_outputs
CREATE TABLE IF NOT EXISTS public.ai_workforce_cached_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL,
  role_key text NOT NULL,
  task_key text NOT NULL,
  output jsonb NOT NULL DEFAULT '{}',
  model_used text,
  tokens_used integer,
  cost_cents numeric(10,4),
  expires_at timestamptz,
  hit_count integer NOT NULL DEFAULT 0,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_cached_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_cached_outputs" ON public.ai_workforce_cached_outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cached_outputs_cache_key ON public.ai_workforce_cached_outputs(cache_key);
DROP TRIGGER IF EXISTS update_ai_workforce_cached_outputs_updated_at ON public.ai_workforce_cached_outputs;
CREATE TRIGGER update_ai_workforce_cached_outputs_updated_at BEFORE UPDATE ON public.ai_workforce_cached_outputs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. remediation_tasks
CREATE TABLE IF NOT EXISTS public.remediation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.remediation_programs(id) ON DELETE SET NULL,
  task_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  task_status text NOT NULL DEFAULT 'new',
  execution_type text NOT NULL DEFAULT 'frontend',
  owner_team text,
  owner_user_id uuid,
  related_route_key text,
  related_service_key text,
  related_customer_journey_key text,
  related_flagship_loop_key text,
  due_at timestamptz,
  completed_at timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.remediation_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own remediation_tasks" ON public.remediation_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_key ON public.remediation_tasks(task_key);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_program ON public.remediation_tasks(program_id);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_status ON public.remediation_tasks(task_status);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_route ON public.remediation_tasks(related_route_key);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_service ON public.remediation_tasks(related_service_key);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_journey ON public.remediation_tasks(related_customer_journey_key);
DROP TRIGGER IF EXISTS update_remediation_tasks_updated_at ON public.remediation_tasks;
CREATE TRIGGER update_remediation_tasks_updated_at BEFORE UPDATE ON public.remediation_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TIER 3 — Depends on Tier 2
-- ============================================================

-- 11. ai_workforce_outputs
CREATE TABLE IF NOT EXISTS public.ai_workforce_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invocation_id uuid REFERENCES public.ai_workforce_invocations(id) ON DELETE CASCADE NOT NULL,
  output_type text NOT NULL DEFAULT 'text',
  content jsonb NOT NULL DEFAULT '{}',
  quality_score numeric(5,2),
  flagged boolean NOT NULL DEFAULT false,
  flag_reason text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_outputs" ON public.ai_workforce_outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_outputs_invocation ON public.ai_workforce_outputs(invocation_id);

-- 12. ai_workforce_recommendation_scores
CREATE TABLE IF NOT EXISTS public.ai_workforce_recommendation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  score_overall numeric(5,2) NOT NULL DEFAULT 0,
  score_accuracy numeric(5,2),
  score_usefulness numeric(5,2),
  score_actionability numeric(5,2),
  score_evidence_quality numeric(5,2),
  score_cost_efficiency numeric(5,2),
  score_launch_honesty_alignment numeric(5,2),
  score_execution_success_likelihood numeric(5,2),
  score_realized_outcome_value numeric(5,2),
  review_method text NOT NULL DEFAULT 'human',
  reviewed_by_user_id uuid,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_recommendation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_recommendation_scores" ON public.ai_workforce_recommendation_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_rec_scores_rec ON public.ai_workforce_recommendation_scores(recommendation_id);

-- 13. ai_workforce_role_task_permissions
CREATE TABLE IF NOT EXISTS public.ai_workforce_role_task_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  task_key text NOT NULL,
  permission_level text NOT NULL DEFAULT 'allowed',
  max_autonomy integer NOT NULL DEFAULT 2,
  requires_approval boolean NOT NULL DEFAULT true,
  budget_class_key text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_key, task_key, user_id)
);
ALTER TABLE public.ai_workforce_role_task_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_role_task_permissions" ON public.ai_workforce_role_task_permissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. ai_workforce_role_health
CREATE TABLE IF NOT EXISTS public.ai_workforce_role_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  health_status text NOT NULL DEFAULT 'healthy',
  total_invocations integer NOT NULL DEFAULT 0,
  successful_invocations integer NOT NULL DEFAULT 0,
  failed_invocations integer NOT NULL DEFAULT 0,
  avg_latency_ms integer,
  avg_cost_cents numeric(10,4),
  avg_quality_score numeric(5,2),
  last_invocation_at timestamptz,
  last_error text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_role_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_role_health" ON public.ai_workforce_role_health FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_role_health_role ON public.ai_workforce_role_health(role_key);
DROP TRIGGER IF EXISTS update_ai_workforce_role_health_updated_at ON public.ai_workforce_role_health;
CREATE TRIGGER update_ai_workforce_role_health_updated_at BEFORE UPDATE ON public.ai_workforce_role_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. ai_workforce_launch_honesty
CREATE TABLE IF NOT EXISTS public.ai_workforce_launch_honesty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  launch_claim text NOT NULL DEFAULT '',
  actual_status text NOT NULL DEFAULT 'scaffold',
  honesty_score numeric(5,2) NOT NULL DEFAULT 0,
  evidence jsonb NOT NULL DEFAULT '[]',
  last_audit_at timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_launch_honesty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_launch_honesty" ON public.ai_workforce_launch_honesty FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_launch_honesty_role ON public.ai_workforce_launch_honesty(role_key);
DROP TRIGGER IF EXISTS update_ai_workforce_launch_honesty_updated_at ON public.ai_workforce_launch_honesty;
CREATE TRIGGER update_ai_workforce_launch_honesty_updated_at BEFORE UPDATE ON public.ai_workforce_launch_honesty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. recommendation_execution_bindings
CREATE TABLE IF NOT EXISTS public.recommendation_execution_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  approval_queue_item_id uuid REFERENCES public.ai_workforce_approval_queue(id) ON DELETE SET NULL,
  binding_type text NOT NULL DEFAULT 'remediation_task',
  binding_status text NOT NULL DEFAULT 'bound',
  linked_program_id uuid REFERENCES public.remediation_programs(id) ON DELETE SET NULL,
  linked_task_id uuid REFERENCES public.remediation_tasks(id) ON DELETE SET NULL,
  owner_team text,
  owner_user_id uuid,
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendation_execution_bindings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation_execution_bindings" ON public.recommendation_execution_bindings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_exec_bindings_rec ON public.recommendation_execution_bindings(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_exec_bindings_status ON public.recommendation_execution_bindings(binding_status);
CREATE INDEX IF NOT EXISTS idx_exec_bindings_type ON public.recommendation_execution_bindings(binding_type);
CREATE INDEX IF NOT EXISTS idx_exec_bindings_team ON public.recommendation_execution_bindings(owner_team);
DROP TRIGGER IF EXISTS update_recommendation_execution_bindings_updated_at ON public.recommendation_execution_bindings;
CREATE TRIGGER update_recommendation_execution_bindings_updated_at BEFORE UPDATE ON public.recommendation_execution_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. outcome_verifications (legacy compatibility)
CREATE TABLE IF NOT EXISTS public.outcome_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  verification_type text NOT NULL DEFAULT 'manual',
  expected_outcome text NOT NULL DEFAULT '',
  actual_outcome text,
  status text NOT NULL DEFAULT 'pending',
  verified_by_user_id uuid,
  verified_at timestamptz,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.outcome_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcome_verifications" ON public.outcome_verifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_outcome_verifications_rec ON public.outcome_verifications(recommendation_id);
DROP TRIGGER IF EXISTS update_outcome_verifications_updated_at ON public.outcome_verifications;
CREATE TRIGGER update_outcome_verifications_updated_at BEFORE UPDATE ON public.outcome_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TIER 4 — Depends on Tier 3
-- ============================================================

-- 18. recommendation_execution_events
CREATE TABLE IF NOT EXISTS public.recommendation_execution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  binding_id uuid REFERENCES public.recommendation_execution_bindings(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  summary text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}',
  created_by_user_id uuid,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendation_execution_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation_execution_events" ON public.recommendation_execution_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_exec_events_binding ON public.recommendation_execution_events(binding_id);
CREATE INDEX IF NOT EXISTS idx_exec_events_type ON public.recommendation_execution_events(event_type);

-- 19. recommendation_outcome_verifications
CREATE TABLE IF NOT EXISTS public.recommendation_outcome_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  binding_id uuid REFERENCES public.recommendation_execution_bindings(id) ON DELETE SET NULL,
  verification_method text NOT NULL DEFAULT 'manual_review',
  expected_improvement text NOT NULL DEFAULT '',
  actual_improvement text,
  verification_status text NOT NULL DEFAULT 'pending',
  customer_journey_delta text,
  launch_truth_delta text,
  notes text,
  verified_by_user_id uuid,
  verified_at timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendation_outcome_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation_outcome_verifications" ON public.recommendation_outcome_verifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_outcome_ver_rec ON public.recommendation_outcome_verifications(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_outcome_ver_status ON public.recommendation_outcome_verifications(verification_status);

-- 20. recommendation_learning_signals
CREATE TABLE IF NOT EXISTS public.recommendation_learning_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  signal_type text NOT NULL,
  signal_strength numeric(5,2) NOT NULL DEFAULT 0,
  signal_source text NOT NULL DEFAULT 'human_review',
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendation_learning_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation_learning_signals" ON public.recommendation_learning_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_learning_signals_rec ON public.recommendation_learning_signals(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_learning_signals_type ON public.recommendation_learning_signals(signal_type);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.v_recommendation_closure_summary AS
SELECT
  r.id AS recommendation_id,
  r.title,
  r.role_key,
  r.domain,
  r.lifecycle_status,
  r.flagship_loop_key,
  r.execution_required,
  r.outcome_verification_required,
  COALESCE(s.avg_score, 0) AS avg_score,
  aq.status AS approval_status,
  eb.binding_status,
  eb.binding_type,
  rp.display_name AS program_name,
  ov.verification_status AS outcome_status,
  r.user_id,
  r.created_at
FROM public.ai_workforce_recommendations r
LEFT JOIN LATERAL (
  SELECT AVG(score_overall) AS avg_score
  FROM public.ai_workforce_recommendation_scores
  WHERE recommendation_id = r.id
) s ON true
LEFT JOIN public.ai_workforce_approval_queue aq ON aq.recommendation_id = r.id
LEFT JOIN public.recommendation_execution_bindings eb ON eb.recommendation_id = r.id
LEFT JOIN public.remediation_programs rp ON rp.id = eb.linked_program_id
LEFT JOIN public.recommendation_outcome_verifications ov ON ov.recommendation_id = r.id;

CREATE OR REPLACE VIEW public.v_remediation_program_summary AS
SELECT
  rp.id AS program_id,
  rp.program_key,
  rp.display_name,
  rp.focus_area,
  rp.program_status,
  rp.flagship_loop_key,
  rp.owner_team,
  rp.launch_impact_class,
  COALESCE(t.total_tasks, 0) AS total_tasks,
  COALESCE(t.done_tasks, 0) AS done_tasks,
  COALESCE(t.blocked_tasks, 0) AS blocked_tasks,
  COALESCE(b.linked_recs, 0) AS linked_recommendations,
  rp.user_id,
  rp.created_at
FROM public.remediation_programs rp
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_tasks,
    COUNT(*) FILTER (WHERE task_status = 'done') AS done_tasks,
    COUNT(*) FILTER (WHERE task_status = 'blocked') AS blocked_tasks
  FROM public.remediation_tasks
  WHERE program_id = rp.id
) t ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS linked_recs
  FROM public.recommendation_execution_bindings
  WHERE linked_program_id = rp.id
) b ON true;

CREATE OR REPLACE VIEW public.v_recommendation_execution_pipeline AS
SELECT
  lifecycle_status AS stage,
  COUNT(*) AS count,
  user_id
FROM public.ai_workforce_recommendations
GROUP BY lifecycle_status, user_id;

CREATE OR REPLACE VIEW public.v_outcome_verification_summary AS
SELECT
  r.domain,
  r.role_key,
  r.flagship_loop_key,
  ov.verification_status,
  ov.verification_method,
  COUNT(*) AS count,
  r.user_id
FROM public.recommendation_outcome_verifications ov
JOIN public.ai_workforce_recommendations r ON r.id = ov.recommendation_id
GROUP BY r.domain, r.role_key, r.flagship_loop_key, ov.verification_status, ov.verification_method, r.user_id;
