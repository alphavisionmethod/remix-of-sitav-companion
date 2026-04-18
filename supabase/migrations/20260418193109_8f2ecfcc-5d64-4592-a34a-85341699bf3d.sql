-- Bump priority agent autonomy
UPDATE public.internal_agent_definitions
SET current_autonomy_level = 'constrained_action_ready', updated_at = now()
WHERE agent_id IN ('aw-incident-response', 'aw-ai-spend-control')
  AND current_autonomy_level IS DISTINCT FROM 'constrained_action_ready';

UPDATE public.internal_agent_definitions
SET current_autonomy_level = 'recommend', updated_at = now()
WHERE agent_id = 'aw-security-monitor'
  AND current_autonomy_level NOT IN ('recommend','diagnose','observe');

-- Helper to seed master kill-switch row for one admin user (idempotent)
CREATE OR REPLACE FUNCTION public.seed_master_internal_agent_kill_switch(_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.automation_kill_switches
    (user_id, switch_id, scope, scope_id, severity, enabled, reason, requires_approval, metadata)
  SELECT
    _user_id,
    'KS-INTERNAL-AGENTS-EXECUTE',
    'system',
    'internal-agents.execute',
    'critical',
    false,
    'Canonical master kill-switch for the constrained-action execution path. When enabled, the internal-agent-execute-action edge function refuses every action regardless of council, agent, or class.',
    true,
    jsonb_build_object(
      'category', 'internal-agents',
      'phase', 'phase-2-safe-actions',
      'governance', 'admin-only',
      'audit_required', true,
      'auto_seeded', true
    )
  WHERE NOT EXISTS (
    SELECT 1 FROM public.automation_kill_switches
    WHERE user_id = _user_id AND switch_id = 'KS-INTERNAL-AGENTS-EXECUTE'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Seed for every existing admin
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT user_id FROM public.user_roles WHERE role = 'admin'::public.app_role LOOP
    PERFORM public.seed_master_internal_agent_kill_switch(r.user_id);
  END LOOP;
END $$;

-- Trigger to seed for any new admin
CREATE OR REPLACE FUNCTION public.tg_seed_kill_switch_on_admin_grant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin'::public.app_role THEN
    PERFORM public.seed_master_internal_agent_kill_switch(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_kill_switch_on_admin_grant ON public.user_roles;
CREATE TRIGGER trg_seed_kill_switch_on_admin_grant
AFTER INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.tg_seed_kill_switch_on_admin_grant();

-- Error patrol RPCs
CREATE OR REPLACE FUNCTION public.record_error_patrol_detection(
  _pattern_key text,
  _subsystem text,
  _severity text,
  _signature_hash text,
  _raw_signal jsonb DEFAULT '{}'::jsonb,
  _affected_resource_type text DEFAULT NULL,
  _affected_resource_id text DEFAULT NULL,
  _user_id uuid DEFAULT NULL,
  _linked_incident_id uuid DEFAULT NULL,
  _linked_agent_action_id uuid DEFAULT NULL,
  _linked_intent_id uuid DEFAULT NULL,
  _follow_up_recommendation text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id uuid;
  v_id uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required to record error patrol detections' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_existing_id
  FROM public.error_patrol_detections
  WHERE signature_hash = _signature_hash
    AND status NOT IN ('resolved','muted')
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.error_patrol_detections
    SET frequency = frequency + 1,
        last_seen_at = now(),
        linked_agent_action_id = COALESCE(_linked_agent_action_id, linked_agent_action_id),
        linked_intent_id = COALESCE(_linked_intent_id, linked_intent_id),
        linked_incident_id = COALESCE(_linked_incident_id, linked_incident_id),
        follow_up_recommendation = COALESCE(_follow_up_recommendation, follow_up_recommendation),
        raw_signal = COALESCE(_raw_signal, raw_signal),
        updated_at = now()
    WHERE id = v_existing_id;
    RETURN v_existing_id;
  END IF;

  INSERT INTO public.error_patrol_detections (
    pattern_key, subsystem, severity, signature_hash, raw_signal,
    affected_resource_type, affected_resource_id, user_id,
    linked_incident_id, linked_agent_action_id, linked_intent_id,
    follow_up_recommendation, status, frequency,
    first_seen_at, last_seen_at
  ) VALUES (
    _pattern_key, _subsystem, _severity, _signature_hash, COALESCE(_raw_signal, '{}'::jsonb),
    _affected_resource_type, _affected_resource_id, _user_id,
    _linked_incident_id, _linked_agent_action_id, _linked_intent_id,
    _follow_up_recommendation, 'open', 1,
    now(), now()
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.acknowledge_error_patrol_detection(_detection_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.error_patrol_detections
  SET status = 'acknowledged', acknowledged_by = v_uid,
      acknowledged_at = now(), updated_at = now()
  WHERE id = _detection_id AND status = 'open';
  RETURN jsonb_build_object('ok', true, 'detection_id', _detection_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.mute_error_patrol_pattern(
  _pattern_key text, _hours int DEFAULT 24
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_uid uuid := auth.uid(); v_until timestamptz; v_count int;
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;
  v_until := now() + (_hours || ' hours')::interval;
  WITH upd AS (
    UPDATE public.error_patrol_detections
    SET status = 'muted', muted_until = v_until, updated_at = now()
    WHERE pattern_key = _pattern_key AND status IN ('open','acknowledged')
    RETURNING 1
  )
  SELECT count(*) INTO v_count FROM upd;
  RETURN jsonb_build_object('ok', true, 'muted_until', v_until, 'affected_count', v_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_error_patrol_detection(
  _detection_id uuid, _notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.error_patrol_detections
  SET status = 'resolved', resolved_at = now(),
      resolution_notes = COALESCE(_notes, resolution_notes), updated_at = now()
  WHERE id = _detection_id;
  RETURN jsonb_build_object('ok', true, 'detection_id', _detection_id);
END;
$$;

CREATE INDEX IF NOT EXISTS idx_error_patrol_detections_status_lastseen
  ON public.error_patrol_detections (status, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_patrol_detections_signature_active
  ON public.error_patrol_detections (signature_hash)
  WHERE status NOT IN ('resolved','muted');