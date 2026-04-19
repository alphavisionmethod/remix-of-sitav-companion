-- ============================================================
-- Phase 4 — Security Council Runtime: tables, RLS, RPCs
-- ============================================================

-- =========== TABLE: security_council_findings ===============
CREATE TABLE IF NOT EXISTS public.security_council_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  council text NOT NULL DEFAULT 'security-trust',
  finding_type text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_signal_ref text NOT NULL,
  source_signal_type text NOT NULL DEFAULT 'observation',
  status text NOT NULL DEFAULT 'open',
  routed_suggestion_id uuid REFERENCES public.ai_implementation_suggestions(id) ON DELETE SET NULL,
  occurrences int NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,
  resolution_notes text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT security_council_findings_severity_chk
    CHECK (severity = ANY (ARRAY['low','medium','high','critical'])),
  CONSTRAINT security_council_findings_status_chk
    CHECK (status = ANY (ARRAY['open','acknowledged','routed','resolved','muted'])),
  CONSTRAINT security_council_findings_signal_unique
    UNIQUE (source_signal_type, source_signal_ref)
);

CREATE INDEX IF NOT EXISTS idx_scf_agent_status
  ON public.security_council_findings (agent_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scf_severity_status
  ON public.security_council_findings (severity, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scf_created_at
  ON public.security_council_findings (created_at DESC);

ALTER TABLE public.security_council_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scf_admin_select"
  ON public.security_council_findings FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_admin_permission(auth.uid(), 'audit.view')
  );

CREATE POLICY "scf_block_direct_writes_insert"
  ON public.security_council_findings FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "scf_block_direct_writes_update"
  ON public.security_council_findings FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "scf_block_direct_writes_delete"
  ON public.security_council_findings FOR DELETE
  TO authenticated
  USING (false);

-- =========== TABLE: kill_switch_recommendations ===============
CREATE TABLE IF NOT EXISTS public.kill_switch_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_id text NOT NULL,
  source_finding_id uuid REFERENCES public.security_council_findings(id) ON DELETE SET NULL,
  source_agent_id text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  recommended_action text NOT NULL DEFAULT 'activate',
  reason text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  blast_radius text NOT NULL DEFAULT 'unknown',
  urgency text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  approval_id uuid REFERENCES public.kill_switch_approvals(id) ON DELETE SET NULL,
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ksr_severity_chk
    CHECK (severity = ANY (ARRAY['low','medium','high','critical'])),
  CONSTRAINT ksr_action_chk
    CHECK (recommended_action = ANY (ARRAY['activate','deactivate'])),
  CONSTRAINT ksr_status_chk
    CHECK (status = ANY (ARRAY['pending','acknowledged','queued_for_approval','approved','rejected','superseded','expired'])),
  CONSTRAINT ksr_urgency_chk
    CHECK (urgency = ANY (ARRAY['low','normal','high','critical'])),
  CONSTRAINT ksr_blast_chk
    CHECK (blast_radius = ANY (ARRAY['unknown','single-tenant','single-service','multi-service','platform-wide']))
);

CREATE UNIQUE INDEX IF NOT EXISTS ksr_open_per_switch
  ON public.kill_switch_recommendations (switch_id, source_finding_id)
  WHERE status IN ('pending','acknowledged','queued_for_approval');

CREATE INDEX IF NOT EXISTS idx_ksr_switch_status
  ON public.kill_switch_recommendations (switch_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ksr_severity
  ON public.kill_switch_recommendations (severity, status, created_at DESC);

ALTER TABLE public.kill_switch_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ksr_admin_select"
  ON public.kill_switch_recommendations FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_admin_permission(auth.uid(), 'audit.view')
    OR public.has_admin_permission(auth.uid(), 'flags.view')
  );

CREATE POLICY "ksr_block_direct_insert"
  ON public.kill_switch_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "ksr_admin_update_ack"
  ON public.kill_switch_recommendations FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_admin_permission(auth.uid(), 'flags.toggle')
  );

CREATE POLICY "ksr_block_delete"
  ON public.kill_switch_recommendations FOR DELETE
  TO authenticated
  USING (false);

-- =========== TABLE: secret_rotation_triggers ===============
CREATE TABLE IF NOT EXISTS public.secret_rotation_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_finding_id uuid REFERENCES public.security_council_findings(id) ON DELETE SET NULL,
  source_agent_id text NOT NULL,
  secret_scope text NOT NULL,
  provider_key text,
  anomaly_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  anomaly_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  orchestrator_dryrun_result jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'dryrun_pending',
  receipt_id uuid,
  rotation_executed_at timestamptz,
  rotation_executed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT srt_severity_chk
    CHECK (severity = ANY (ARRAY['low','medium','high','critical'])),
  CONSTRAINT srt_status_chk
    CHECK (status = ANY (ARRAY['dryrun_pending','dryrun_complete','dryrun_failed','approved_for_execution','executed','rejected','superseded']))
);

CREATE UNIQUE INDEX IF NOT EXISTS srt_open_per_scope
  ON public.secret_rotation_triggers (secret_scope, source_finding_id)
  WHERE status IN ('dryrun_pending','dryrun_complete','approved_for_execution');

CREATE INDEX IF NOT EXISTS idx_srt_scope_status
  ON public.secret_rotation_triggers (secret_scope, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_srt_severity
  ON public.secret_rotation_triggers (severity, status, created_at DESC);

ALTER TABLE public.secret_rotation_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srt_admin_select"
  ON public.secret_rotation_triggers FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_admin_permission(auth.uid(), 'audit.view')
  );

CREATE POLICY "srt_block_direct_insert"
  ON public.secret_rotation_triggers FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "srt_admin_update"
  ON public.secret_rotation_triggers FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "srt_block_delete"
  ON public.secret_rotation_triggers FOR DELETE
  TO authenticated
  USING (false);

-- =========== updated_at triggers ===============
CREATE TRIGGER scf_set_updated_at
  BEFORE UPDATE ON public.security_council_findings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER ksr_set_updated_at
  BEFORE UPDATE ON public.kill_switch_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER srt_set_updated_at
  BEFORE UPDATE ON public.secret_rotation_triggers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========== RPC: record_security_finding ===============
CREATE OR REPLACE FUNCTION public.record_security_finding(
  _agent_id text,
  _finding_type text,
  _severity text,
  _title text,
  _summary text,
  _evidence jsonb,
  _source_signal_type text,
  _source_signal_ref text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_existing uuid;
BEGIN
  -- Service-role only (auth.uid() is null in service role context)
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'service role or admin required to record security findings'
      USING ERRCODE = '42501';
  END IF;

  IF _agent_id IS NULL OR _finding_type IS NULL OR _source_signal_ref IS NULL THEN
    RAISE EXCEPTION 'agent_id, finding_type, and source_signal_ref are required';
  END IF;

  IF _severity NOT IN ('low','medium','high','critical') THEN
    RAISE EXCEPTION 'invalid severity: %', _severity;
  END IF;

  SELECT id INTO v_existing
  FROM public.security_council_findings
  WHERE source_signal_type = _source_signal_type
    AND source_signal_ref = _source_signal_ref;

  IF v_existing IS NOT NULL THEN
    UPDATE public.security_council_findings
    SET occurrences = occurrences + 1,
        last_seen_at = now(),
        severity = CASE
          WHEN _severity = 'critical' THEN 'critical'
          WHEN _severity = 'high' AND severity NOT IN ('critical') THEN 'high'
          WHEN _severity = 'medium' AND severity IN ('low') THEN 'medium'
          ELSE severity
        END,
        evidence = _evidence,
        updated_at = now()
    WHERE id = v_existing;
    RETURN v_existing;
  END IF;

  INSERT INTO public.security_council_findings (
    agent_id, finding_type, severity, title, summary,
    evidence, source_signal_type, source_signal_ref, status
  ) VALUES (
    _agent_id, _finding_type, _severity, _title, COALESCE(_summary,''),
    COALESCE(_evidence,'{}'::jsonb), _source_signal_type, _source_signal_ref, 'open'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_security_finding(text,text,text,text,text,jsonb,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_security_finding(text,text,text,text,text,jsonb,text,text) TO authenticated;

-- =========== RPC: propose_kill_switch_recommendation ===============
CREATE OR REPLACE FUNCTION public.propose_kill_switch_recommendation(
  _switch_id text,
  _source_finding_id uuid,
  _source_agent_id text,
  _severity text,
  _recommended_action text,
  _reason text,
  _evidence jsonb,
  _blast_radius text,
  _urgency text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_existing uuid;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'service role or admin required'
      USING ERRCODE = '42501';
  END IF;

  IF _switch_id IS NULL OR _source_agent_id IS NULL OR _reason IS NULL THEN
    RAISE EXCEPTION 'switch_id, source_agent_id, and reason are required';
  END IF;

  -- Idempotency: one open recommendation per (switch, finding)
  SELECT id INTO v_existing
  FROM public.kill_switch_recommendations
  WHERE switch_id = _switch_id
    AND source_finding_id IS NOT DISTINCT FROM _source_finding_id
    AND status IN ('pending','acknowledged','queued_for_approval');

  IF v_existing IS NOT NULL THEN
    UPDATE public.kill_switch_recommendations
    SET evidence = _evidence,
        severity = CASE
          WHEN _severity = 'critical' THEN 'critical'
          WHEN _severity = 'high' AND severity NOT IN ('critical') THEN 'high'
          ELSE severity
        END,
        urgency = COALESCE(_urgency, urgency),
        reason = _reason,
        updated_at = now()
    WHERE id = v_existing;
    RETURN v_existing;
  END IF;

  INSERT INTO public.kill_switch_recommendations (
    switch_id, source_finding_id, source_agent_id, severity,
    recommended_action, reason, evidence, blast_radius, urgency, status
  ) VALUES (
    _switch_id, _source_finding_id, _source_agent_id, COALESCE(_severity,'medium'),
    COALESCE(_recommended_action,'activate'), _reason,
    COALESCE(_evidence,'{}'::jsonb),
    COALESCE(_blast_radius,'unknown'),
    COALESCE(_urgency,'normal'),
    'pending'
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.propose_kill_switch_recommendation(text,uuid,text,text,text,text,jsonb,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.propose_kill_switch_recommendation(text,uuid,text,text,text,text,jsonb,text,text) TO authenticated;

-- =========== RPC: trigger_anomaly_secret_rotation ===============
CREATE OR REPLACE FUNCTION public.trigger_anomaly_secret_rotation(
  _source_finding_id uuid,
  _source_agent_id text,
  _secret_scope text,
  _provider_key text,
  _anomaly_type text,
  _severity text,
  _anomaly_evidence jsonb,
  _dryrun_result jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_existing uuid;
  v_status text;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'service role or admin required'
      USING ERRCODE = '42501';
  END IF;

  IF _secret_scope IS NULL OR _source_agent_id IS NULL OR _anomaly_type IS NULL THEN
    RAISE EXCEPTION 'secret_scope, source_agent_id, and anomaly_type are required';
  END IF;

  v_status := CASE
    WHEN _dryrun_result ? 'error' THEN 'dryrun_failed'
    WHEN _dryrun_result ? 'ok' THEN 'dryrun_complete'
    ELSE 'dryrun_pending'
  END;

  SELECT id INTO v_existing
  FROM public.secret_rotation_triggers
  WHERE secret_scope = _secret_scope
    AND source_finding_id IS NOT DISTINCT FROM _source_finding_id
    AND status IN ('dryrun_pending','dryrun_complete','approved_for_execution');

  IF v_existing IS NOT NULL THEN
    UPDATE public.secret_rotation_triggers
    SET orchestrator_dryrun_result = _dryrun_result,
        anomaly_evidence = _anomaly_evidence,
        status = v_status,
        updated_at = now()
    WHERE id = v_existing;
    RETURN v_existing;
  END IF;

  INSERT INTO public.secret_rotation_triggers (
    source_finding_id, source_agent_id, secret_scope, provider_key,
    anomaly_type, severity, anomaly_evidence, orchestrator_dryrun_result, status
  ) VALUES (
    _source_finding_id, _source_agent_id, _secret_scope, _provider_key,
    _anomaly_type, COALESCE(_severity,'medium'),
    COALESCE(_anomaly_evidence,'{}'::jsonb),
    COALESCE(_dryrun_result,'{}'::jsonb),
    v_status
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_anomaly_secret_rotation(uuid,text,text,text,text,text,jsonb,jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.trigger_anomaly_secret_rotation(uuid,text,text,text,text,text,jsonb,jsonb) TO authenticated;

-- =========== RPC: summarize_security_council ===============
CREATE OR REPLACE FUNCTION public.summarize_security_council()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total int; v_open int; v_critical_open int;
  v_by_agent jsonb; v_by_severity jsonb;
  v_recommendations jsonb; v_rotations jsonb;
BEGIN
  IF auth.uid() IS NOT NULL
    AND NOT public.has_role(auth.uid(), 'admin'::public.app_role)
    AND NOT public.has_admin_permission(auth.uid(), 'audit.view') THEN
    RAISE EXCEPTION 'admin role or audit.view required' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_total FROM public.security_council_findings;
  SELECT count(*) INTO v_open FROM public.security_council_findings WHERE status = 'open';
  SELECT count(*) INTO v_critical_open
    FROM public.security_council_findings
    WHERE status = 'open' AND severity IN ('high','critical');

  SELECT COALESCE(jsonb_object_agg(agent_id, c), '{}'::jsonb) INTO v_by_agent FROM (
    SELECT agent_id, count(*) AS c FROM public.security_council_findings GROUP BY agent_id
  ) a;

  SELECT COALESCE(jsonb_object_agg(severity, c), '{}'::jsonb) INTO v_by_severity FROM (
    SELECT severity, count(*) AS c FROM public.security_council_findings GROUP BY severity
  ) s;

  SELECT jsonb_build_object(
    'pending', count(*) FILTER (WHERE status = 'pending'),
    'queued', count(*) FILTER (WHERE status = 'queued_for_approval'),
    'approved', count(*) FILTER (WHERE status = 'approved'),
    'rejected', count(*) FILTER (WHERE status = 'rejected')
  ) INTO v_recommendations FROM public.kill_switch_recommendations;

  SELECT jsonb_build_object(
    'dryrun_pending', count(*) FILTER (WHERE status = 'dryrun_pending'),
    'dryrun_complete', count(*) FILTER (WHERE status = 'dryrun_complete'),
    'dryrun_failed', count(*) FILTER (WHERE status = 'dryrun_failed'),
    'executed', count(*) FILTER (WHERE status = 'executed')
  ) INTO v_rotations FROM public.secret_rotation_triggers;

  RETURN jsonb_build_object(
    'total_findings', v_total,
    'open_findings', v_open,
    'critical_open', v_critical_open,
    'by_agent', v_by_agent,
    'by_severity', v_by_severity,
    'kill_switch_recommendations', v_recommendations,
    'secret_rotation_triggers', v_rotations,
    'generated_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.summarize_security_council() FROM public;
GRANT EXECUTE ON FUNCTION public.summarize_security_council() TO authenticated;