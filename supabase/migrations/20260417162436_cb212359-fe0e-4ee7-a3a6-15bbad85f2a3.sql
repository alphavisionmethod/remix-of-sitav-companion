
-- ═══════════════════════════════════════════════════════════════
-- C-007: REX Loop wiring — indexes, views, compatibility shim
-- ═══════════════════════════════════════════════════════════════

-- 1. Index for resolved-tab ordering on decision_at
CREATE INDEX IF NOT EXISTS idx_ai_workforce_approval_queue_decision_at
  ON public.ai_workforce_approval_queue(user_id, decision_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_ai_workforce_approval_queue_status_user
  ON public.ai_workforce_approval_queue(user_id, status, created_at DESC);

-- 2. Helper view: one-shot read of pending approvals + recommendation
CREATE OR REPLACE VIEW public.v_user_pending_approvals
WITH (security_invoker=on) AS
SELECT
  q.id,
  q.user_id,
  q.recommendation_id,
  q.title,
  q.summary,
  q.priority,
  q.status,
  q.evidence_links,
  q.cost_implications,
  q.launch_implications,
  q.escalated,
  q.created_at,
  q.decision_at,
  q.reviewer_user_id,
  q.reviewer_comments,
  r.domain                         AS rec_domain,
  r.severity                       AS rec_severity,
  r.confidence                     AS rec_confidence,
  r.lifecycle_status               AS rec_lifecycle_status,
  r.execution_required             AS rec_execution_required,
  r.flagship_loop_key              AS rec_flagship_loop_key,
  r.evidence                       AS rec_evidence,
  r.role_key                       AS rec_role_key,
  r.task_key                       AS rec_task_key
FROM public.ai_workforce_approval_queue q
LEFT JOIN public.ai_workforce_recommendations r
  ON r.id = q.recommendation_id;

-- 3. Compatibility view `approval_queue`
--    Maps legacy column names used across 18 client files to the
--    canonical `ai_workforce_approval_queue` table, so existing reads
--    succeed without code rewrites.
CREATE OR REPLACE VIEW public.approval_queue
WITH (security_invoker=on) AS
SELECT
  q.id,
  q.user_id,
  q.recommendation_id,
  q.title                                         AS title,
  q.title                                         AS action_summary,
  q.summary                                       AS description,
  q.priority,
  q.status,
  CASE
    WHEN q.priority = 'urgent'   THEN 'high'
    WHEN q.priority = 'high'     THEN 'high'
    WHEN q.priority = 'normal'   THEN 'medium'
    WHEN q.priority = 'low'      THEN 'low'
    ELSE 'medium'
  END                                             AS risk_level,
  COALESCE(r.domain, 'general')                   AS domain,
  COALESCE(r.role_key, 'system')                  AS action_type,
  q.evidence_links                                AS evidence,
  q.cost_implications,
  q.launch_implications,
  q.reviewer_user_id                              AS reviewed_by,
  q.reviewer_comments                             AS decision_reason,
  q.decision_at                                   AS decided_at,
  q.decision_at                                   AS resolved_at,
  q.escalated,
  q.remediation_binding_id,
  q.created_at,
  q.updated_at,
  jsonb_build_object(
    'recommendation_id', q.recommendation_id,
    'role_key',          r.role_key,
    'flagship_loop_key', r.flagship_loop_key,
    'confidence',        r.confidence,
    'severity',          r.severity,
    'amount',            (r.details->>'amount')::numeric
  )                                               AS proposed_action
FROM public.ai_workforce_approval_queue q
LEFT JOIN public.ai_workforce_recommendations r
  ON r.id = q.recommendation_id;

-- 4. INSTEAD OF triggers so legacy UPDATE/INSERT keep working

CREATE OR REPLACE FUNCTION public.approval_queue_instead_of_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_workforce_approval_queue
  SET
    status            = COALESCE(NEW.status, status),
    reviewer_user_id  = COALESCE(NEW.reviewed_by, reviewer_user_id),
    reviewer_comments = COALESCE(NEW.decision_reason, reviewer_comments),
    decision_at       = COALESCE(NEW.decided_at, NEW.resolved_at, decision_at),
    title             = COALESCE(NEW.title, NEW.action_summary, title),
    summary           = COALESCE(NEW.description, summary),
    priority          = COALESCE(NEW.priority, priority),
    cost_implications = COALESCE(NEW.cost_implications, cost_implications),
    launch_implications = COALESCE(NEW.launch_implications, launch_implications),
    escalated         = COALESCE(NEW.escalated, escalated),
    updated_at        = now()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS approval_queue_update_trigger ON public.approval_queue;
CREATE TRIGGER approval_queue_update_trigger
  INSTEAD OF UPDATE ON public.approval_queue
  FOR EACH ROW EXECUTE FUNCTION public.approval_queue_instead_of_update();

CREATE OR REPLACE FUNCTION public.approval_queue_instead_of_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.ai_workforce_approval_queue (
    user_id, recommendation_id, title, summary, priority, status,
    evidence_links, cost_implications, launch_implications,
    reviewer_user_id, reviewer_comments, decision_at
  ) VALUES (
    COALESCE(NEW.user_id, auth.uid()),
    NEW.recommendation_id,
    COALESCE(NEW.title, NEW.action_summary, 'Untitled'),
    COALESCE(NEW.description, ''),
    COALESCE(NEW.priority, 'normal'),
    COALESCE(NEW.status, 'pending'),
    COALESCE(NEW.evidence, '[]'::jsonb),
    NEW.cost_implications,
    NEW.launch_implications,
    NEW.reviewed_by,
    NEW.decision_reason,
    COALESCE(NEW.decided_at, NEW.resolved_at)
  )
  RETURNING id INTO new_id;
  NEW.id := new_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS approval_queue_insert_trigger ON public.approval_queue;
CREATE TRIGGER approval_queue_insert_trigger
  INSTEAD OF INSERT ON public.approval_queue
  FOR EACH ROW EXECUTE FUNCTION public.approval_queue_instead_of_insert();

CREATE OR REPLACE FUNCTION public.approval_queue_instead_of_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ai_workforce_approval_queue WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS approval_queue_delete_trigger ON public.approval_queue;
CREATE TRIGGER approval_queue_delete_trigger
  INSTEAD OF DELETE ON public.approval_queue
  FOR EACH ROW EXECUTE FUNCTION public.approval_queue_instead_of_delete();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_queue TO authenticated;
GRANT SELECT ON public.v_user_pending_approvals TO authenticated;
