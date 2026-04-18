-- ════════════════════════════════════════════════════════════════
-- Phase 4 — Autonomous Security Policy Drafting
-- Drafts are PROPOSED by aw-policy-architect, NEVER auto-applied
-- ════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.internal_agent_policy_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL DEFAULT 'aw-policy-architect',
  draft_kind text NOT NULL CHECK (draft_kind IN ('rls_policy','secret_rotation','role_grant_review','column_grant_review')),
  target_resource text NOT NULL,
  target_schema text NOT NULL DEFAULT 'public',
  title text NOT NULL,
  rationale text NOT NULL DEFAULT '',
  current_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  proposed_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  sql_preview text NOT NULL DEFAULT '',
  risk_assessment text NOT NULL DEFAULT 'medium' CHECK (risk_assessment IN ('low','medium','high','critical')),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','approved','rejected','changes_requested','archived','applied_externally')),
  reviewer_user_id uuid,
  reviewer_notes text,
  reviewed_at timestamptz,
  applied_externally_at timestamptz,
  applied_externally_evidence text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iapd_status ON public.internal_agent_policy_drafts(status);
CREATE INDEX IF NOT EXISTS idx_iapd_kind ON public.internal_agent_policy_drafts(draft_kind);
CREATE INDEX IF NOT EXISTS idx_iapd_target ON public.internal_agent_policy_drafts(target_schema, target_resource);
CREATE INDEX IF NOT EXISTS idx_iapd_created ON public.internal_agent_policy_drafts(created_at DESC);

ALTER TABLE public.internal_agent_policy_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read policy drafts"
  ON public.internal_agent_policy_drafts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins manage policy drafts"
  ON public.internal_agent_policy_drafts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_iapd_updated_at
  BEFORE UPDATE ON public.internal_agent_policy_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Append-only review log ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internal_agent_policy_review_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.internal_agent_policy_drafts(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('viewed','requested_changes','approved','rejected','archived','applied_externally','reopened')),
  reviewer_user_id uuid,
  notes text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iaprl_draft ON public.internal_agent_policy_review_log(draft_id, created_at DESC);

ALTER TABLE public.internal_agent_policy_review_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read policy review log"
  ON public.internal_agent_policy_review_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins insert policy review log"
  ON public.internal_agent_policy_review_log FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ── SECURITY DEFINER helpers ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_policy_draft_decision(
  _draft_id uuid,
  _action text,
  _notes text DEFAULT NULL,
  _evidence jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_new_status text;
  v_draft record;
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_draft FROM public.internal_agent_policy_drafts WHERE id = _draft_id;
  IF v_draft IS NULL THEN
    RAISE EXCEPTION 'draft % not found', _draft_id;
  END IF;

  v_new_status := CASE _action
    WHEN 'approved' THEN 'approved'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'requested_changes' THEN 'changes_requested'
    WHEN 'archived' THEN 'archived'
    WHEN 'applied_externally' THEN 'applied_externally'
    WHEN 'reopened' THEN 'pending_review'
    ELSE v_draft.status
  END;

  UPDATE public.internal_agent_policy_drafts
  SET status = v_new_status,
      reviewer_user_id = v_uid,
      reviewer_notes = COALESCE(_notes, reviewer_notes),
      reviewed_at = CASE WHEN _action IN ('approved','rejected','requested_changes','archived') THEN now() ELSE reviewed_at END,
      applied_externally_at = CASE WHEN _action = 'applied_externally' THEN now() ELSE applied_externally_at END,
      applied_externally_evidence = CASE WHEN _action = 'applied_externally' THEN _notes ELSE applied_externally_evidence END,
      updated_at = now()
  WHERE id = _draft_id;

  INSERT INTO public.internal_agent_policy_review_log (draft_id, action, reviewer_user_id, notes, evidence)
  VALUES (_draft_id, _action, v_uid, _notes, COALESCE(_evidence, '{}'::jsonb));

  RETURN jsonb_build_object('ok', true, 'draft_id', _draft_id, 'new_status', v_new_status, 'action', _action);
END;
$$;

CREATE OR REPLACE FUNCTION public.summarize_policy_draft_health()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total int;
  v_pending int;
  v_approved int;
  v_rejected int;
  v_changes int;
  v_critical_pending int;
  v_by_kind jsonb;
  v_by_risk jsonb;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_total FROM public.internal_agent_policy_drafts;
  SELECT count(*) INTO v_pending FROM public.internal_agent_policy_drafts WHERE status = 'pending_review';
  SELECT count(*) INTO v_approved FROM public.internal_agent_policy_drafts WHERE status = 'approved';
  SELECT count(*) INTO v_rejected FROM public.internal_agent_policy_drafts WHERE status = 'rejected';
  SELECT count(*) INTO v_changes FROM public.internal_agent_policy_drafts WHERE status = 'changes_requested';
  SELECT count(*) INTO v_critical_pending FROM public.internal_agent_policy_drafts
    WHERE status = 'pending_review' AND risk_assessment IN ('high','critical');

  SELECT COALESCE(jsonb_object_agg(draft_kind, c), '{}'::jsonb) INTO v_by_kind FROM (
    SELECT draft_kind, count(*) AS c FROM public.internal_agent_policy_drafts GROUP BY draft_kind
  ) k;

  SELECT COALESCE(jsonb_object_agg(risk_assessment, c), '{}'::jsonb) INTO v_by_risk FROM (
    SELECT risk_assessment, count(*) AS c FROM public.internal_agent_policy_drafts GROUP BY risk_assessment
  ) r;

  RETURN jsonb_build_object(
    'total', v_total,
    'pending_review', v_pending,
    'approved', v_approved,
    'rejected', v_rejected,
    'changes_requested', v_changes,
    'critical_pending', v_critical_pending,
    'by_kind', v_by_kind,
    'by_risk', v_by_risk,
    'generated_at', now()
  );
END;
$$;