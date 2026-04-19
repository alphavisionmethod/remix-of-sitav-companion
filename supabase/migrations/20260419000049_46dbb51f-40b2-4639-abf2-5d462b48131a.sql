-- Re-apply 3 implementation-suggestion RPCs (original migration left them undeployed)

CREATE OR REPLACE FUNCTION public.propose_implementation_suggestion(
  p_source_agent_id text,
  p_source_council text,
  p_source_signal_type text,
  p_source_signal_ref text,
  p_title text,
  p_summary text,
  p_rationale text,
  p_evidence_refs jsonb DEFAULT '[]'::jsonb,
  p_proposed_change_type text DEFAULT 'reliability',
  p_estimated_effort text DEFAULT 'unknown',
  p_expected_value text DEFAULT 'unknown',
  p_priority text DEFAULT 'normal'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role or service role required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.ai_implementation_suggestions (
    source_agent_id, source_council, source_signal_type, source_signal_ref,
    title, summary, rationale, evidence_refs,
    proposed_change_type, estimated_effort, expected_value, priority
  ) VALUES (
    p_source_agent_id, p_source_council, p_source_signal_type, p_source_signal_ref,
    p_title, COALESCE(p_summary,''), COALESCE(p_rationale,''),
    COALESCE(p_evidence_refs,'[]'::jsonb),
    p_proposed_change_type, p_estimated_effort, p_expected_value, p_priority
  )
  ON CONFLICT (source_signal_type, source_signal_ref) DO UPDATE
    SET evidence_refs = EXCLUDED.evidence_refs,
        rationale = CASE WHEN public.ai_implementation_suggestions.status IN ('proposed','under_review')
                         THEN EXCLUDED.rationale
                         ELSE public.ai_implementation_suggestions.rationale END,
        priority = CASE WHEN public.ai_implementation_suggestions.status IN ('proposed','under_review')
                        THEN EXCLUDED.priority
                        ELSE public.ai_implementation_suggestions.priority END,
        updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END $$;

REVOKE ALL ON FUNCTION public.propose_implementation_suggestion(text,text,text,text,text,text,text,jsonb,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.propose_implementation_suggestion(text,text,text,text,text,text,text,jsonb,text,text,text,text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.record_implementation_suggestion_decision(
  p_suggestion_id uuid,
  p_action text,
  p_comments text DEFAULT NULL,
  p_supersedes uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_new_status text;
  v_row public.ai_implementation_suggestions;
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM public.ai_implementation_suggestions WHERE id = p_suggestion_id;
  IF v_row IS NULL THEN
    RAISE EXCEPTION 'suggestion % not found', p_suggestion_id;
  END IF;

  v_new_status := CASE p_action
    WHEN 'accept' THEN 'accepted'
    WHEN 'reject' THEN 'rejected'
    WHEN 'review' THEN 'under_review'
    WHEN 'in_progress' THEN 'in_progress'
    WHEN 'done' THEN 'done'
    WHEN 'supersede' THEN 'superseded'
    WHEN 'reopen' THEN 'proposed'
    ELSE v_row.status
  END;

  UPDATE public.ai_implementation_suggestions
     SET status = v_new_status,
         review_comments = COALESCE(p_comments, review_comments),
         reviewer_user_id = v_uid,
         reviewed_at = CASE WHEN p_action <> 'reopen' THEN now() ELSE reviewed_at END,
         superseded_by = CASE WHEN p_action = 'supersede' THEN p_supersedes ELSE superseded_by END,
         updated_at = now()
   WHERE id = p_suggestion_id;

  RETURN jsonb_build_object('ok', true, 'suggestion_id', p_suggestion_id, 'new_status', v_new_status, 'action', p_action);
END $$;

REVOKE ALL ON FUNCTION public.record_implementation_suggestion_decision(uuid,text,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_implementation_suggestion_decision(uuid,text,text,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.summarize_implementation_suggestions()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total int; v_proposed int; v_review int; v_accepted int; v_rejected int;
  v_in_progress int; v_done int; v_urgent_open int;
  v_by_type jsonb; v_by_council jsonb; v_by_source jsonb;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_total FROM public.ai_implementation_suggestions;
  SELECT count(*) INTO v_proposed FROM public.ai_implementation_suggestions WHERE status = 'proposed';
  SELECT count(*) INTO v_review FROM public.ai_implementation_suggestions WHERE status = 'under_review';
  SELECT count(*) INTO v_accepted FROM public.ai_implementation_suggestions WHERE status = 'accepted';
  SELECT count(*) INTO v_rejected FROM public.ai_implementation_suggestions WHERE status = 'rejected';
  SELECT count(*) INTO v_in_progress FROM public.ai_implementation_suggestions WHERE status = 'in_progress';
  SELECT count(*) INTO v_done FROM public.ai_implementation_suggestions WHERE status = 'done';
  SELECT count(*) INTO v_urgent_open
    FROM public.ai_implementation_suggestions
    WHERE priority IN ('urgent','high') AND status IN ('proposed','under_review');

  SELECT COALESCE(jsonb_object_agg(proposed_change_type, c), '{}'::jsonb) INTO v_by_type FROM (
    SELECT proposed_change_type, count(*) AS c FROM public.ai_implementation_suggestions GROUP BY proposed_change_type
  ) t;

  SELECT COALESCE(jsonb_object_agg(source_council, c), '{}'::jsonb) INTO v_by_council FROM (
    SELECT source_council, count(*) AS c FROM public.ai_implementation_suggestions GROUP BY source_council
  ) c;

  SELECT COALESCE(jsonb_object_agg(source_signal_type, c), '{}'::jsonb) INTO v_by_source FROM (
    SELECT source_signal_type, count(*) AS c FROM public.ai_implementation_suggestions GROUP BY source_signal_type
  ) s;

  RETURN jsonb_build_object(
    'total', v_total,
    'proposed', v_proposed,
    'under_review', v_review,
    'accepted', v_accepted,
    'rejected', v_rejected,
    'in_progress', v_in_progress,
    'done', v_done,
    'urgent_open', v_urgent_open,
    'by_change_type', v_by_type,
    'by_council', v_by_council,
    'by_source', v_by_source,
    'generated_at', now()
  );
END $$;

REVOKE ALL ON FUNCTION public.summarize_implementation_suggestions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.summarize_implementation_suggestions() TO authenticated;