-- Phase 2 closure: backfill master kill-switch for every existing admin
DO $$
DECLARE
  r RECORD;
  v_count int := 0;
BEGIN
  FOR r IN SELECT user_id FROM public.user_roles WHERE role = 'admin'::public.app_role LOOP
    PERFORM public.seed_master_internal_agent_kill_switch(r.user_id);
    v_count := v_count + 1;
  END LOOP;
  RAISE NOTICE 'KS-INTERNAL-AGENTS-EXECUTE backfilled for % admin users', v_count;
END $$;

-- Phase 2 priority-bridge helpers (service-role only)
CREATE OR REPLACE FUNCTION public.list_stale_locked_workflow_runs(_max_age_minutes int DEFAULT 30)
RETURNS TABLE(id uuid, user_id uuid, workflow_id uuid, status text, last_progress_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, workflow_id, status, last_progress_at
  FROM public.workflow_runs
  WHERE status = 'running'
    AND last_progress_at IS NOT NULL
    AND last_progress_at < now() - (_max_age_minutes || ' minutes')::interval
  ORDER BY last_progress_at ASC
  LIMIT 25;
$$;

COMMENT ON FUNCTION public.list_stale_locked_workflow_runs IS
'Phase 2 priority-bridge helper: stale-locked workflow_runs candidates for clear_stale_lock action.';

CREATE OR REPLACE FUNCTION public.list_unhealthy_connector_accounts()
RETURNS TABLE(id uuid, user_id uuid, connector_type text, display_name text, status text, last_health_status text, last_health_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ca.id,
    ca.user_id,
    ca.connector_type,
    ca.display_name,
    ca.status,
    ca.last_health_status,
    ca.last_health_at
  FROM public.connector_accounts ca
  WHERE (ca.status IN ('error','degraded','expired','disconnected')
         OR ca.last_health_status IN ('error','degraded','expired'))
    AND ca.demo_mode = false
  ORDER BY ca.last_health_at DESC NULLS LAST
  LIMIT 25;
$$;

COMMENT ON FUNCTION public.list_unhealthy_connector_accounts IS
'Phase 2 priority-bridge helper: unhealthy connector accounts for disable_unhealthy_connector action.';

CREATE OR REPLACE FUNCTION public.list_unescalated_security_events(_lookback_minutes int DEFAULT 60)
RETURNS TABLE(audit_id uuid, action text, severity text, target_type text, target_id text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id as audit_id,
    a.action,
    a.severity,
    a.target_type,
    a.target_id,
    a.created_at
  FROM public.admin_action_audit a
  WHERE a.severity IN ('high','critical')
    AND a.created_at >= now() - (_lookback_minutes || ' minutes')::interval
    AND NOT EXISTS (
      SELECT 1 FROM public.council_escalations e
      WHERE e.source_agent_id = 'aw-security-monitor'
        AND (e.evidence->>'audit_id') = a.id::text
        AND e.created_at >= now() - interval '24 hours'
    )
  ORDER BY a.created_at DESC
  LIMIT 25;
$$;

COMMENT ON FUNCTION public.list_unescalated_security_events IS
'Phase 2 priority-bridge helper: critical admin_action_audit rows not yet escalated by aw-security-monitor.';

GRANT EXECUTE ON FUNCTION public.list_stale_locked_workflow_runs(int) TO service_role;
GRANT EXECUTE ON FUNCTION public.list_unhealthy_connector_accounts() TO service_role;
GRANT EXECUTE ON FUNCTION public.list_unescalated_security_events(int) TO service_role;