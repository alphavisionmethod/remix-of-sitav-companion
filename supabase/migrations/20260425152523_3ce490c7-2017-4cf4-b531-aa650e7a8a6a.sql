-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Phase 11 Foundations
-- 1) Add provenance columns to cross_workspace_approvals so we can
--    distinguish operator-initiated from auto-emitted requests and
--    trace back to the originating AI invocation.
-- 2) Helper RPC `auto_request_federated_approval` so edge fns can
--    bulk-create one pending approval per peer workspace.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.cross_workspace_approvals
  ADD COLUMN IF NOT EXISTS auto_emitted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_invocation_id uuid NULL;

CREATE INDEX IF NOT EXISTS idx_cross_ws_appr_invocation
  ON public.cross_workspace_approvals (source_invocation_id);

CREATE OR REPLACE FUNCTION public.auto_request_federated_approval(
  _requester_workspace_id uuid,
  _peer_workspace_ids uuid[],
  _action_summary text,
  _sensitivity text DEFAULT 'internal',
  _source_invocation_id uuid DEFAULT NULL,
  _expires_in_hours integer DEFAULT 168
)
RETURNS SETOF public.cross_workspace_approvals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_peer uuid;
  v_row public.cross_workspace_approvals;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;
  IF _peer_workspace_ids IS NULL OR array_length(_peer_workspace_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  FOREACH v_peer IN ARRAY _peer_workspace_ids LOOP
    -- Skip own workspace and obvious sentinel values.
    IF v_peer IS NULL OR v_peer = _requester_workspace_id THEN
      CONTINUE;
    END IF;

    -- Avoid duplicate pending auto-emitted approvals for the same
    -- (invocation, peer) pair.
    IF _source_invocation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.cross_workspace_approvals
       WHERE user_id = v_uid
         AND source_invocation_id = _source_invocation_id
         AND target_workspace_id = v_peer
         AND status = 'pending'
    ) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.cross_workspace_approvals (
      user_id, requester_workspace_id, target_workspace_id,
      action_kind, payload, rationale, sensitivity,
      auto_emitted, source_invocation_id, expires_at
    ) VALUES (
      v_uid, _requester_workspace_id, v_peer,
      'custom',
      jsonb_build_object(
        'auto_emitted', true,
        'invocation_id', _source_invocation_id,
        'summary', COALESCE(_action_summary, '')
      ),
      COALESCE(_action_summary, ''),
      COALESCE(_sensitivity, 'internal'),
      true, _source_invocation_id,
      now() + make_interval(hours => COALESCE(_expires_in_hours, 168))
    )
    RETURNING * INTO v_row;
    RETURN NEXT v_row;
  END LOOP;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_request_federated_approval(uuid,uuid[],text,text,uuid,integer) TO authenticated;

COMMENT ON COLUMN public.cross_workspace_approvals.auto_emitted IS
  'Phase 11 — true when the row was inserted automatically by the orchestrator/planner because federated context drove a sensitive action.';
COMMENT ON COLUMN public.cross_workspace_approvals.source_invocation_id IS
  'Phase 11 — links auto-emitted approvals back to the AI invocation that triggered them (ai_invocation_plans.id).';