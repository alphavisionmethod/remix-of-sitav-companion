-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Phase 10 Foundations
-- 1) cross_workspace_approvals: explicit operator approval workflow
--    for sensitive cross-workspace actions emerging from federation.
-- 2) attribution_summary_v: aggregates explainability traces by
--    peer workspace so the UI can show federated provenance counts.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. cross_workspace_approvals table ─────────────────────────
CREATE TABLE IF NOT EXISTS public.cross_workspace_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requester_workspace_id uuid NOT NULL,
  target_workspace_id uuid NOT NULL,
  federation_id uuid NULL REFERENCES public.workspace_federations(id) ON DELETE SET NULL,
  action_kind text NOT NULL CHECK (action_kind IN (
    'promote_memory','share_chunk','grant_voice','elevate_sensitivity','custom'
  )),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  rationale text NOT NULL DEFAULT '',
  sensitivity text NOT NULL DEFAULT 'internal'
    CHECK (sensitivity IN ('public','internal','confidential','restricted')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','expired','cancelled','executed')),
  decided_by uuid NULL,
  decided_at timestamptz NULL,
  decision_notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_cross_ws_appr_user_status
  ON public.cross_workspace_approvals (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cross_ws_appr_target_status
  ON public.cross_workspace_approvals (target_workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_cross_ws_appr_federation
  ON public.cross_workspace_approvals (federation_id);

ALTER TABLE public.cross_workspace_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cwa_select_own ON public.cross_workspace_approvals;
CREATE POLICY cwa_select_own ON public.cross_workspace_approvals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS cwa_insert_own ON public.cross_workspace_approvals;
CREATE POLICY cwa_insert_own ON public.cross_workspace_approvals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS cwa_update_own ON public.cross_workspace_approvals;
CREATE POLICY cwa_update_own ON public.cross_workspace_approvals
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public._cwa_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cwa_updated_at ON public.cross_workspace_approvals;
CREATE TRIGGER trg_cwa_updated_at
  BEFORE UPDATE ON public.cross_workspace_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public._cwa_touch_updated_at();

-- ── 2. RPC: request_cross_workspace_approval ───────────────────
CREATE OR REPLACE FUNCTION public.request_cross_workspace_approval(
  _requester_workspace_id uuid,
  _target_workspace_id uuid,
  _action_kind text,
  _payload jsonb DEFAULT '{}'::jsonb,
  _rationale text DEFAULT '',
  _sensitivity text DEFAULT 'internal',
  _federation_id uuid DEFAULT NULL,
  _expires_in_hours integer DEFAULT 168
)
RETURNS public.cross_workspace_approvals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.cross_workspace_approvals;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;
  IF _action_kind NOT IN ('promote_memory','share_chunk','grant_voice','elevate_sensitivity','custom') THEN
    RAISE EXCEPTION 'invalid_action_kind: %', _action_kind;
  END IF;
  INSERT INTO public.cross_workspace_approvals (
    user_id, requester_workspace_id, target_workspace_id,
    federation_id, action_kind, payload, rationale, sensitivity,
    expires_at
  ) VALUES (
    v_uid, _requester_workspace_id, _target_workspace_id,
    _federation_id, _action_kind, COALESCE(_payload,'{}'::jsonb),
    COALESCE(_rationale,''), COALESCE(_sensitivity,'internal'),
    now() + make_interval(hours => COALESCE(_expires_in_hours,168))
  )
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_cross_workspace_approval(uuid,uuid,text,jsonb,text,text,uuid,integer) TO authenticated;

-- ── 3. RPC: decide_cross_workspace_approval ────────────────────
CREATE OR REPLACE FUNCTION public.decide_cross_workspace_approval(
  _approval_id uuid,
  _decision text,
  _notes text DEFAULT NULL
)
RETURNS public.cross_workspace_approvals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.cross_workspace_approvals;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth_required';
  END IF;
  IF _decision NOT IN ('approved','rejected','cancelled','executed') THEN
    RAISE EXCEPTION 'invalid_decision: %', _decision;
  END IF;
  UPDATE public.cross_workspace_approvals
     SET status = _decision,
         decided_by = v_uid,
         decided_at = now(),
         decision_notes = COALESCE(_notes, decision_notes)
   WHERE id = _approval_id
     AND user_id = v_uid
     AND status IN ('pending','approved')
   RETURNING * INTO v_row;
  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'approval_not_found_or_not_actionable';
  END IF;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decide_cross_workspace_approval(uuid,text,text) TO authenticated;

-- ── 4. attribution_summary_v ───────────────────────────────────
CREATE OR REPLACE VIEW public.attribution_summary_v
WITH (security_invoker = true)
AS
SELECT
  t.invocation_id,
  t.user_id,
  COALESCE(NULLIF(t.metadata->>'peer_workspace_id',''), '__own__') AS peer_workspace_id,
  NULLIF(t.metadata->>'via_federation','') AS federation_id,
  COALESCE(NULLIF(t.metadata->>'retrieval_kind',''), 'manual') AS retrieval_kind,
  count(*)::int AS hit_count,
  avg(NULLIF((t.metadata->>'similarity')::float8, 0))::float8 AS avg_similarity,
  max(NULLIF((t.metadata->>'similarity')::float8, 0))::float8 AS max_similarity,
  max(t.created_at) AS last_used_at
FROM public.ai_explainability_traces t
WHERE t.user_id = auth.uid()
GROUP BY 1,2,3,4,5;

GRANT SELECT ON public.attribution_summary_v TO authenticated;

COMMENT ON TABLE public.cross_workspace_approvals IS
  'Phase 10 — explicit operator approval workflow for sensitive cross-workspace actions emerging from federated retrieval.';
COMMENT ON VIEW public.attribution_summary_v IS
  'Phase 10 — per-invocation attribution rollup (own vs federated peers) sourced from ai_explainability_traces.metadata.';