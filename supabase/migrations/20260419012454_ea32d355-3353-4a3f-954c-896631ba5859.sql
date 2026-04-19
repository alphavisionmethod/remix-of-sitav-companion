-- Phase 4 Security Council — operator action RPC
-- Allows admins (or holders of audit.view permission) to acknowledge / resolve / mute
-- a security_council_findings row from the admin board. Bypasses the
-- "block_direct_writes" RLS policy via SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.acknowledge_security_finding(
  _finding_id uuid,
  _new_status text,
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_authorized boolean;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'auth required' USING ERRCODE = '42501';
  END IF;

  v_authorized := has_role(v_caller, 'admin'::app_role)
    OR has_admin_permission(v_caller, 'audit.view');

  IF NOT v_authorized THEN
    RAISE EXCEPTION 'forbidden: admin or audit.view required' USING ERRCODE = '42501';
  END IF;

  IF _new_status NOT IN ('acknowledged', 'resolved', 'muted') THEN
    RAISE EXCEPTION 'invalid status: %', _new_status USING ERRCODE = '22023';
  END IF;

  UPDATE public.security_council_findings
     SET status = _new_status,
         resolved_at = CASE WHEN _new_status = 'resolved' THEN now() ELSE resolved_at END,
         resolution_notes = COALESCE(_notes, resolution_notes),
         updated_at = now()
   WHERE id = _finding_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'finding not found: %', _finding_id USING ERRCODE = 'P0002';
  END IF;

  -- Best-effort audit (admin_action_audit table exists — see schema)
  INSERT INTO public.admin_action_audit (
    actor_user_id, action, target_type, target_id, severity, plane, metadata
  )
  VALUES (
    v_caller,
    'security_council_finding_' || _new_status,
    'security_council_finding',
    _finding_id::text,
    'medium',
    'admin',
    jsonb_build_object('notes', _notes, 'new_status', _new_status)
  );

  RETURN _finding_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.acknowledge_security_finding(uuid, text, text) TO authenticated;