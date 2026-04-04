
-- 1. on_incident_created → auto-notify via notifications_queue
CREATE OR REPLACE FUNCTION public.notify_on_incident()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _urgency TEXT;
BEGIN
  _urgency := CASE NEW.severity
    WHEN 'critical' THEN 'critical'
    WHEN 'high'     THEN 'high'
    WHEN 'medium'   THEN 'normal'
    ELSE 'low'
  END;

  INSERT INTO public.notifications_queue (
    user_id, category, channel, title, body, urgency, action_url, metadata
  ) VALUES (
    NEW.user_id,
    'incident',
    'push',
    'Incident: ' || COALESCE(NEW.title, 'Untitled'),
    'Severity: ' || COALESCE(NEW.severity, 'unknown') || '. ' || COALESCE(LEFT(NEW.description, 200), ''),
    _urgency,
    '/system/incidents/' || NEW.id::TEXT,
    jsonb_build_object('incident_id', NEW.id, 'severity', NEW.severity, 'source', COALESCE(NEW.source, 'unknown'))
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_incident_created
  AFTER INSERT ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_incident();

-- 2. on_approval_status_changed → auto-notify requester
CREATE OR REPLACE FUNCTION public.notify_on_approval_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications_queue (
    user_id, category, channel, title, body, urgency, action_url, metadata
  ) VALUES (
    COALESCE(NEW.requested_by, NEW.user_id),
    'approval',
    'push',
    'Approval ' || NEW.status || ': ' || COALESCE(NEW.action_type, 'Request'),
    'Your approval request has been ' || NEW.status || '.' ||
      CASE WHEN NEW.reviewed_by IS NOT NULL THEN ' Reviewed by a team member.' ELSE '' END,
    CASE NEW.status WHEN 'approved' THEN 'normal' WHEN 'rejected' THEN 'high' ELSE 'normal' END,
    '/system/approvals/' || NEW.id::TEXT,
    jsonb_build_object('approval_id', NEW.id, 'action_type', NEW.action_type, 'new_status', NEW.status)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_approval_status_changed
  AFTER UPDATE OF status ON public.approval_queue
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.notify_on_approval_change();

-- 3. on_workflow_run_failed → auto-create incident
CREATE OR REPLACE FUNCTION public.incident_on_workflow_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.incidents (
    user_id, title, description, severity, source, status, metadata
  ) VALUES (
    NEW.user_id,
    'Workflow Failed: ' || COALESCE(NEW.workflow_id::TEXT, 'unknown'),
    'Workflow run ' || NEW.id::TEXT || ' failed.' ||
      CASE WHEN NEW.error IS NOT NULL THEN ' Error: ' || LEFT(NEW.error, 500) ELSE '' END,
    'high',
    'workflow_engine',
    'open',
    jsonb_build_object('workflow_run_id', NEW.id, 'workflow_id', NEW.workflow_id, 'error', NEW.error)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workflow_run_failed
  AFTER UPDATE OF status ON public.workflow_runs
  FOR EACH ROW
  WHEN (NEW.status = 'failed' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.incident_on_workflow_failure();
