-- ============================================================
-- Section B — Operational Safety Hardening (Phase 28+)
-- ============================================================

-- 1. Extend automation_kill_switches with operational fields
ALTER TABLE public.automation_kill_switches
  ADD COLUMN IF NOT EXISTS switch_id TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'moderate'
    CHECK (severity IN ('minimal','moderate','significant','severe')),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS deactivated_by UUID;

-- Backfill switch_id from scope_id where present
UPDATE public.automation_kill_switches
SET switch_id = COALESCE(scope_id, 'KS-LEGACY-' || id::text)
WHERE switch_id IS NULL;

CREATE INDEX IF NOT EXISTS automation_kill_switches_switch_id_enabled_idx
  ON public.automation_kill_switches(switch_id, enabled);

CREATE INDEX IF NOT EXISTS automation_kill_switches_expires_at_idx
  ON public.automation_kill_switches(expires_at)
  WHERE enabled = true AND expires_at IS NOT NULL;

-- 2. Append-only audit log for kill-switch state changes
CREATE TABLE IF NOT EXISTS public.kill_switch_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_id TEXT NOT NULL,
  switch_row_id UUID,
  action TEXT NOT NULL CHECK (action IN ('activated','deactivated','expired','approved','rejected','updated')),
  actor_user_id UUID,
  reason TEXT,
  before_state JSONB,
  after_state JSONB,
  runbook_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kill_switch_audit_log_switch_id_idx
  ON public.kill_switch_audit_log(switch_id, created_at DESC);

ALTER TABLE public.kill_switch_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kill_switch_audit_admin_read" ON public.kill_switch_audit_log;
CREATE POLICY "kill_switch_audit_admin_read"
  ON public.kill_switch_audit_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_admin_permission(auth.uid(), 'flags.view'));

DROP POLICY IF EXISTS "kill_switch_audit_service_insert" ON public.kill_switch_audit_log;
CREATE POLICY "kill_switch_audit_service_insert"
  ON public.kill_switch_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_admin_permission(auth.uid(), 'flags.toggle')
  );
-- No UPDATE / DELETE policies → append-only

-- 3. Dual-approval records for severe switches
CREATE TABLE IF NOT EXISTS public.kill_switch_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_id TEXT NOT NULL,
  initiated_by UUID NOT NULL,
  approver_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired','executed')),
  reason TEXT NOT NULL,
  intended_action TEXT NOT NULL CHECK (intended_action IN ('activate','deactivate')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  decided_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT approver_must_differ CHECK (approver_user_id IS NULL OR approver_user_id <> initiated_by)
);

CREATE INDEX IF NOT EXISTS kill_switch_approvals_switch_status_idx
  ON public.kill_switch_approvals(switch_id, status, created_at DESC);

ALTER TABLE public.kill_switch_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kill_switch_approvals_admin_read" ON public.kill_switch_approvals;
CREATE POLICY "kill_switch_approvals_admin_read"
  ON public.kill_switch_approvals
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_admin_permission(auth.uid(), 'flags.view'));

DROP POLICY IF EXISTS "kill_switch_approvals_admin_insert" ON public.kill_switch_approvals;
CREATE POLICY "kill_switch_approvals_admin_insert"
  ON public.kill_switch_approvals
  FOR INSERT TO authenticated
  WITH CHECK (
    initiated_by = auth.uid()
    AND (public.has_role(auth.uid(), 'admin'::public.app_role)
         OR public.has_admin_permission(auth.uid(), 'flags.toggle'))
  );

DROP POLICY IF EXISTS "kill_switch_approvals_admin_update" ON public.kill_switch_approvals;
CREATE POLICY "kill_switch_approvals_admin_update"
  ON public.kill_switch_approvals
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_admin_permission(auth.uid(), 'flags.toggle')
  );

CREATE TRIGGER kill_switch_approvals_updated_at
  BEFORE UPDATE ON public.kill_switch_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Incident classifications (subsystem + symptom → runbook + switch)
CREATE TABLE IF NOT EXISTS public.incident_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsystem TEXT NOT NULL,
  symptom_code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  recommended_runbook_id TEXT NOT NULL,
  recommended_switch_id TEXT,
  escalation_owner TEXT NOT NULL DEFAULT 'platform',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subsystem, symptom_code)
);

CREATE INDEX IF NOT EXISTS incident_classifications_subsystem_idx
  ON public.incident_classifications(subsystem) WHERE is_active = true;

ALTER TABLE public.incident_classifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "incident_classifications_read" ON public.incident_classifications;
CREATE POLICY "incident_classifications_read"
  ON public.incident_classifications
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "incident_classifications_admin_write" ON public.incident_classifications;
CREATE POLICY "incident_classifications_admin_write"
  ON public.incident_classifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER incident_classifications_updated_at
  BEFORE UPDATE ON public.incident_classifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Audit trigger on kill-switch changes
CREATE OR REPLACE FUNCTION public.audit_kill_switch_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := CASE WHEN NEW.enabled THEN 'activated' ELSE 'updated' END;
    INSERT INTO public.kill_switch_audit_log
      (switch_id, switch_row_id, action, actor_user_id, reason, before_state, after_state, metadata)
    VALUES
      (COALESCE(NEW.switch_id, NEW.scope_id, 'unknown'),
       NEW.id, v_action, NEW.activated_by, NEW.reason,
       NULL,
       jsonb_build_object('enabled', NEW.enabled, 'scope', NEW.scope, 'severity', NEW.severity,
                          'expires_at', NEW.expires_at, 'requires_approval', NEW.requires_approval),
       COALESCE(NEW.metadata, '{}'::jsonb));
  ELSIF TG_OP = 'UPDATE' AND (OLD.enabled IS DISTINCT FROM NEW.enabled
                              OR OLD.reason IS DISTINCT FROM NEW.reason
                              OR OLD.expires_at IS DISTINCT FROM NEW.expires_at) THEN
    v_action := CASE
      WHEN NEW.enabled = false AND OLD.enabled = true THEN 'deactivated'
      WHEN NEW.enabled = true  AND OLD.enabled = false THEN 'activated'
      ELSE 'updated'
    END;
    INSERT INTO public.kill_switch_audit_log
      (switch_id, switch_row_id, action, actor_user_id, reason, before_state, after_state, metadata)
    VALUES
      (COALESCE(NEW.switch_id, NEW.scope_id, 'unknown'),
       NEW.id, v_action,
       COALESCE(NEW.deactivated_by, NEW.activated_by),
       COALESCE(NEW.reason, OLD.reason),
       jsonb_build_object('enabled', OLD.enabled, 'reason', OLD.reason,
                          'expires_at', OLD.expires_at),
       jsonb_build_object('enabled', NEW.enabled, 'reason', NEW.reason,
                          'expires_at', NEW.expires_at, 'severity', NEW.severity),
       COALESCE(NEW.metadata, '{}'::jsonb));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_kill_switch_change_trg ON public.automation_kill_switches;
CREATE TRIGGER audit_kill_switch_change_trg
  AFTER INSERT OR UPDATE ON public.automation_kill_switches
  FOR EACH ROW EXECUTE FUNCTION public.audit_kill_switch_change();

-- 6. TTL auto-deactivation function
CREATE OR REPLACE FUNCTION public.expire_overdue_kill_switches()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
  rec record;
BEGIN
  FOR rec IN
    SELECT id, switch_id, scope_id
    FROM public.automation_kill_switches
    WHERE enabled = true
      AND expires_at IS NOT NULL
      AND expires_at <= now()
  LOOP
    UPDATE public.automation_kill_switches
    SET enabled = false,
        deactivated_at = now(),
        reason = COALESCE(reason, '') || ' [auto-expired at ' || now()::text || ']',
        updated_at = now()
    WHERE id = rec.id;

    INSERT INTO public.kill_switch_audit_log
      (switch_id, switch_row_id, action, reason, metadata)
    VALUES
      (COALESCE(rec.switch_id, rec.scope_id, 'unknown'),
       rec.id, 'expired',
       'TTL reached — auto-deactivated by expiry job',
       jsonb_build_object('auto_expired', true));

    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

-- 7. Schedule the expiry cron
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    PERFORM cron.unschedule('kill-switch-expiry-1m')
      WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='kill-switch-expiry-1m');
    PERFORM cron.schedule(
      'kill-switch-expiry-1m',
      '* * * * *',
      $cron$ SELECT public.expire_overdue_kill_switches(); $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron scheduling skipped: %', SQLERRM;
END $$;