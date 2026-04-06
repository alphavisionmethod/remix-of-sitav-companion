
-- ═══════════════════════════════════════════════════════════════
-- PART 1: Extend ai_workforce_recommendations
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.ai_workforce_recommendations
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS approval_decision_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS rejected_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS deferred_reason text,
  ADD COLUMN IF NOT EXISTS execution_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS execution_priority text,
  ADD COLUMN IF NOT EXISTS flagship_loop_key text,
  ADD COLUMN IF NOT EXISTS customer_journey_impact_key text,
  ADD COLUMN IF NOT EXISTS launch_blocker_impact_class text,
  ADD COLUMN IF NOT EXISTS outcome_verification_required boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_awr_lifecycle_status ON public.ai_workforce_recommendations (lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_awr_execution_required ON public.ai_workforce_recommendations (execution_required);
CREATE INDEX IF NOT EXISTS idx_awr_flagship_loop_key ON public.ai_workforce_recommendations (flagship_loop_key);

-- ═══════════════════════════════════════════════════════════════
-- PART 2: Extend remediation_programs
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.remediation_programs
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS owner_team text,
  ADD COLUMN IF NOT EXISTS owner_user_id uuid,
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS target_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS launch_impact_class text;

-- ═══════════════════════════════════════════════════════════════
-- PART 3: Extend flagship_loops
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.flagship_loops
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS primary_persona text,
  ADD COLUMN IF NOT EXISTS launch_importance text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS owner_team text,
  ADD COLUMN IF NOT EXISTS ux_quality_target text,
  ADD COLUMN IF NOT EXISTS proof_required boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_honesty_class text DEFAULT 'demo_only';

-- ═══════════════════════════════════════════════════════════════
-- PART 4: recommendation_execution_bindings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.recommendation_execution_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  approval_queue_item_id uuid,
  binding_type text NOT NULL,
  binding_status text NOT NULL DEFAULT 'bound',
  linked_program_id uuid,
  linked_task_id uuid,
  owner_team text,
  owner_user_id uuid,
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_execution_bindings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own execution bindings"
  ON public.recommendation_execution_bindings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reb_recommendation_id ON public.recommendation_execution_bindings (recommendation_id);
CREATE INDEX IF NOT EXISTS idx_reb_binding_status ON public.recommendation_execution_bindings (binding_status);
CREATE INDEX IF NOT EXISTS idx_reb_binding_type ON public.recommendation_execution_bindings (binding_type);
CREATE INDEX IF NOT EXISTS idx_reb_owner_team ON public.recommendation_execution_bindings (owner_team);

CREATE TRIGGER update_reb_updated_at BEFORE UPDATE ON public.recommendation_execution_bindings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- PART 5: remediation_tasks
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.remediation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  program_id uuid REFERENCES public.remediation_programs(id) ON DELETE SET NULL,
  task_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  task_status text NOT NULL DEFAULT 'new',
  execution_type text NOT NULL,
  owner_team text,
  owner_user_id uuid,
  related_route_key text,
  related_service_key text,
  related_customer_journey_key text,
  related_flagship_loop_key text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.remediation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own remediation tasks"
  ON public.remediation_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rt_program_id ON public.remediation_tasks (program_id);
CREATE INDEX IF NOT EXISTS idx_rt_task_status ON public.remediation_tasks (task_status);
CREATE INDEX IF NOT EXISTS idx_rt_related_route ON public.remediation_tasks (related_route_key);
CREATE INDEX IF NOT EXISTS idx_rt_related_service ON public.remediation_tasks (related_service_key);
CREATE INDEX IF NOT EXISTS idx_rt_related_cj ON public.remediation_tasks (related_customer_journey_key);

CREATE TRIGGER update_rt_updated_at BEFORE UPDATE ON public.remediation_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- PART 6: recommendation_execution_events
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.recommendation_execution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  binding_id uuid NOT NULL REFERENCES public.recommendation_execution_bindings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  summary text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_execution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own execution events"
  ON public.recommendation_execution_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ree_binding_id ON public.recommendation_execution_events (binding_id);
CREATE INDEX IF NOT EXISTS idx_ree_event_type ON public.recommendation_execution_events (event_type);

-- ═══════════════════════════════════════════════════════════════
-- PART 7: recommendation_outcome_verifications
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.recommendation_outcome_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  binding_id uuid REFERENCES public.recommendation_execution_bindings(id) ON DELETE SET NULL,
  verification_method text NOT NULL,
  expected_improvement text NOT NULL,
  actual_improvement text,
  verification_status text NOT NULL DEFAULT 'pending',
  customer_journey_delta text,
  launch_truth_delta text,
  notes text,
  verified_by_user_id uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_outcome_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own outcome verifications"
  ON public.recommendation_outcome_verifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rov_recommendation_id ON public.recommendation_outcome_verifications (recommendation_id);
CREATE INDEX IF NOT EXISTS idx_rov_verification_status ON public.recommendation_outcome_verifications (verification_status);

-- ═══════════════════════════════════════════════════════════════
-- PART 8: recommendation_learning_signals
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.recommendation_learning_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  signal_strength numeric(5,2) NOT NULL,
  signal_source text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_learning_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own learning signals"
  ON public.recommendation_learning_signals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rls_recommendation_id ON public.recommendation_learning_signals (recommendation_id);
CREATE INDEX IF NOT EXISTS idx_rls_signal_type ON public.recommendation_learning_signals (signal_type);

-- ═══════════════════════════════════════════════════════════════
-- PART 9: Views
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.v_recommendation_closure_summary AS
SELECT
  r.id,
  r.user_id,
  r.title,
  r.recommendation_type,
  r.domain,
  r.severity,
  r.lifecycle_status,
  r.execution_required,
  r.execution_priority,
  r.flagship_loop_key,
  r.customer_journey_impact_key,
  r.launch_blocker_impact_class,
  r.outcome_verification_required,
  r.created_at,
  b.id AS binding_id,
  b.binding_type,
  b.binding_status,
  b.linked_program_id,
  b.owner_team AS binding_owner_team,
  ov.id AS verification_id,
  ov.verification_status,
  ov.verification_method,
  ov.actual_improvement
FROM public.ai_workforce_recommendations r
LEFT JOIN public.recommendation_execution_bindings b ON b.recommendation_id = r.id
LEFT JOIN public.recommendation_outcome_verifications ov ON ov.recommendation_id = r.id;

CREATE OR REPLACE VIEW public.v_remediation_program_summary AS
SELECT
  p.id,
  p.user_id,
  p.program_key,
  p.title,
  p.display_name,
  p.focus_area,
  p.status,
  p.linked_flagship_loop AS flagship_loop_key,
  p.owner_team,
  p.launch_impact_class,
  p.start_at,
  p.target_at,
  p.completed_at,
  COALESCE(p.open_items_count, 0) AS open_items,
  COALESCE(p.completed_items_count, 0) AS completed_items,
  (SELECT COUNT(*) FROM public.remediation_tasks t WHERE t.program_id = p.id) AS total_tasks,
  (SELECT COUNT(*) FROM public.remediation_tasks t WHERE t.program_id = p.id AND t.task_status = 'done') AS done_tasks
FROM public.remediation_programs p;

CREATE OR REPLACE VIEW public.v_recommendation_execution_pipeline AS
SELECT
  r.lifecycle_status,
  r.domain,
  r.recommendation_type,
  r.flagship_loop_key,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE r.execution_required) AS execution_required_count,
  COUNT(*) FILTER (WHERE b.id IS NOT NULL) AS bound_count,
  COUNT(*) FILTER (WHERE ov.id IS NOT NULL) AS verified_count
FROM public.ai_workforce_recommendations r
LEFT JOIN public.recommendation_execution_bindings b ON b.recommendation_id = r.id
LEFT JOIN public.recommendation_outcome_verifications ov ON ov.recommendation_id = r.id
GROUP BY r.lifecycle_status, r.domain, r.recommendation_type, r.flagship_loop_key;

CREATE OR REPLACE VIEW public.v_outcome_verification_summary AS
SELECT
  ov.verification_status,
  ov.verification_method,
  r.domain,
  r.recommendation_type,
  r.flagship_loop_key,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE ov.verification_status = 'verified_positive') AS positive_count,
  COUNT(*) FILTER (WHERE ov.verification_status = 'verified_negative') AS negative_count,
  COUNT(*) FILTER (WHERE ov.verification_status = 'verified_neutral') AS neutral_count
FROM public.recommendation_outcome_verifications ov
JOIN public.ai_workforce_recommendations r ON r.id = ov.recommendation_id
GROUP BY ov.verification_status, ov.verification_method, r.domain, r.recommendation_type, r.flagship_loop_key;
