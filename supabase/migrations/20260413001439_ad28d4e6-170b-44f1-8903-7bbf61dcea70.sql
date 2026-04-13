
-- Fix security definer views by recreating with security_invoker = true

CREATE OR REPLACE VIEW public.v_recommendation_closure_summary
WITH (security_invoker = true) AS
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

CREATE OR REPLACE VIEW public.v_remediation_program_summary
WITH (security_invoker = true) AS
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

CREATE OR REPLACE VIEW public.v_recommendation_execution_pipeline
WITH (security_invoker = true) AS
SELECT
  lifecycle_status AS stage,
  COUNT(*) AS count,
  user_id
FROM public.ai_workforce_recommendations
GROUP BY lifecycle_status, user_id;

CREATE OR REPLACE VIEW public.v_outcome_verification_summary
WITH (security_invoker = true) AS
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
