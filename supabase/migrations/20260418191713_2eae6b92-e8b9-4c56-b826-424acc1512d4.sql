-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Phase 2 Safe Autonomous Actions DB Foundation
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. internal_agent_action_whitelist ────────────────────────
CREATE TABLE public.internal_agent_action_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_class TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_resource_type TEXT NOT NULL,
  max_autonomy_required TEXT NOT NULL DEFAULT 'constrained_action_ready',
  requires_approval_above_confidence NUMERIC NOT NULL DEFAULT 1.0,
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 10,
  requires_rollback BOOLEAN NOT NULL DEFAULT true,
  is_reversible BOOLEAN NOT NULL DEFAULT true,
  reverse_action_class TEXT,
  gate_function_name TEXT NOT NULL DEFAULT 'evaluate_action_safety_gates',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.internal_agent_action_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read action whitelist"
  ON public.internal_agent_action_whitelist FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins manage action whitelist"
  ON public.internal_agent_action_whitelist FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_iawl_active ON public.internal_agent_action_whitelist(is_active) WHERE is_active = true;

CREATE TRIGGER trg_iawl_updated_at BEFORE UPDATE ON public.internal_agent_action_whitelist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 6 canonical action classes
INSERT INTO public.internal_agent_action_whitelist
  (action_class, display_name, description, target_resource_type,
   max_autonomy_required, requires_approval_above_confidence,
   rate_limit_per_hour, requires_rollback, is_reversible, reverse_action_class)
VALUES
  ('restart_workflow', 'Restart Workflow Run',
   'Reset a stuck workflow run to pending and re-queue execution.',
   'workflow_run', 'constrained_action_ready', 0.95, 10, true, true, 'cancel_workflow_run'),
  ('replay_workflow', 'Replay Workflow Run',
   'Create a new workflow run replaying a failed/completed run from its last checkpoint.',
   'workflow_run', 'constrained_action_ready', 0.95, 10, true, true, 'cancel_workflow_run'),
  ('clear_stale_lock', 'Clear Stale Workflow Lock',
   'Release a workflow lock whose holder is no longer active.',
   'workflow_run', 'constrained_action_ready', 0.99, 20, true, false, NULL),
  ('rotate_expired_token', 'Rotate Expired Connector Token',
   'Trigger refresh of a connector OAuth token whose access token has expired.',
   'connector_account', 'constrained_action_ready', 0.99, 30, false, false, NULL),
  ('disable_unhealthy_connector', 'Pause Unhealthy Connector',
   'Mark a connector account as paused due to repeated health failures.',
   'connector_account', 'constrained_action_ready', 0.85, 5, true, true, 'enable_connector'),
  ('trigger_safe_repair_path', 'Trigger Safe Self-Healing Repair',
   'Invoke a registered self-healing repair path (read-only diagnostic + low-risk remediation).',
   'incident', 'constrained_action_ready', 0.90, 10, false, false, NULL);

-- ─── 2. internal_agent_action_intents ──────────────────────────
CREATE TABLE public.internal_agent_action_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL REFERENCES public.internal_agent_definitions(agent_id) ON DELETE CASCADE,
  action_class TEXT NOT NULL REFERENCES public.internal_agent_action_whitelist(action_class) ON DELETE RESTRICT,
  target_id TEXT NOT NULL,
  target_resource_type TEXT NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0,
  precondition_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  precondition_check_passed BOOLEAN NOT NULL DEFAULT false,
  rollback_plan JSONB,
  rollback_capable BOOLEAN NOT NULL DEFAULT false,
  gate_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  approval_request_id UUID REFERENCES public.ai_workforce_approval_queue(id) ON DELETE SET NULL,
  invocation_id UUID REFERENCES public.ai_workforce_invocations(id) ON DELETE SET NULL,
  action_id UUID REFERENCES public.internal_agent_actions(id) ON DELETE SET NULL,
  receipt_id UUID REFERENCES public.ai_action_receipts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approval_pending','executing','executed','failed','denied','rolled_back')),
  denial_reason TEXT,
  error_message TEXT,
  execution_result JSONB,
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID,
  rollback_intent_id UUID REFERENCES public.internal_agent_action_intents(id) ON DELETE SET NULL,
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ
);

ALTER TABLE public.internal_agent_action_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read action intents"
  ON public.internal_agent_action_intents FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins insert action intents"
  ON public.internal_agent_action_intents FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins update action intents"
  ON public.internal_agent_action_intents FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_iaai_agent_created ON public.internal_agent_action_intents(agent_id, created_at DESC);
CREATE INDEX idx_iaai_status ON public.internal_agent_action_intents(status, created_at DESC);
CREATE INDEX idx_iaai_action_class ON public.internal_agent_action_intents(action_class, created_at DESC);
CREATE INDEX idx_iaai_target ON public.internal_agent_action_intents(target_resource_type, target_id);
CREATE INDEX idx_iaai_action ON public.internal_agent_action_intents(action_id) WHERE action_id IS NOT NULL;

CREATE TRIGGER trg_iaai_updated_at BEFORE UPDATE ON public.internal_agent_action_intents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 3. error_patrol_detections ────────────────────────────────
CREATE TABLE public.error_patrol_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_key TEXT NOT NULL,
  subsystem TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high','critical')),
  signature_hash TEXT NOT NULL,
  raw_signal JSONB NOT NULL DEFAULT '{}'::jsonb,
  affected_resource_type TEXT,
  affected_resource_id TEXT,
  user_id UUID,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  frequency INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','acknowledged','agent_handling','resolved','muted','escalated')),
  linked_incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  linked_agent_action_id UUID REFERENCES public.internal_agent_actions(id) ON DELETE SET NULL,
  linked_intent_id UUID REFERENCES public.internal_agent_action_intents(id) ON DELETE SET NULL,
  follow_up_recommendation TEXT,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  muted_until TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_epd_signature_open
  ON public.error_patrol_detections(signature_hash)
  WHERE status IN ('open','acknowledged','agent_handling');

CREATE INDEX idx_epd_status_severity ON public.error_patrol_detections(status, severity, last_seen_at DESC);
CREATE INDEX idx_epd_subsystem ON public.error_patrol_detections(subsystem, last_seen_at DESC);
CREATE INDEX idx_epd_linked_incident ON public.error_patrol_detections(linked_incident_id) WHERE linked_incident_id IS NOT NULL;

ALTER TABLE public.error_patrol_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read patrol detections"
  ON public.error_patrol_detections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins update patrol detections"
  ON public.error_patrol_detections FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins insert patrol detections"
  ON public.error_patrol_detections FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_epd_updated_at BEFORE UPDATE ON public.error_patrol_detections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 4. error_patrol_triage_view ───────────────────────────────
CREATE OR REPLACE VIEW public.error_patrol_triage_view
WITH (security_invoker = true) AS
SELECT
  d.id,
  d.pattern_key,
  d.subsystem,
  d.severity,
  d.status,
  d.frequency,
  d.first_seen_at,
  d.last_seen_at,
  d.follow_up_recommendation,
  d.affected_resource_type,
  d.affected_resource_id,
  d.linked_incident_id,
  d.linked_agent_action_id,
  d.linked_intent_id,
  d.acknowledged_at,
  d.muted_until,
  d.resolved_at,
  i.title AS incident_title,
  i.severity AS incident_severity,
  a.agent_id AS responding_agent_id,
  a.council AS responding_agent_council,
  a.action_type AS agent_action_type,
  a.confidence AS agent_confidence,
  a.status AS agent_action_status,
  intent.action_class AS intent_action_class,
  intent.status AS intent_status,
  intent.rollback_capable,
  intent.rolled_back_at,
  intent.receipt_id AS intent_receipt_id,
  intent.executed_at AS intent_executed_at,
  CASE
    WHEN intent.id IS NULL THEN 'none'
    WHEN intent.rolled_back_at IS NOT NULL THEN 'already_rolled_back'
    WHEN intent.rollback_capable AND intent.status = 'executed' THEN 'available'
    ELSE 'none'
  END AS rollback_availability
FROM public.error_patrol_detections d
LEFT JOIN public.incidents i ON i.id = d.linked_incident_id
LEFT JOIN public.internal_agent_actions a ON a.id = d.linked_agent_action_id
LEFT JOIN public.internal_agent_action_intents intent ON intent.id = d.linked_intent_id;

GRANT SELECT ON public.error_patrol_triage_view TO authenticated;

-- ─── 5. evaluate_action_safety_gates RPC ───────────────────────
CREATE OR REPLACE FUNCTION public.evaluate_action_safety_gates(
  _agent_id TEXT,
  _action_class TEXT,
  _target_id TEXT,
  _confidence NUMERIC,
  _precondition_evidence JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_def record;
  v_state record;
  v_wl record;
  v_recent_count int;
  v_kill_active boolean := false;
  v_gate_results jsonb := '[]'::jsonb;
  v_allowed boolean := true;
  v_denial text := NULL;
  v_requires_approval boolean := false;
  v_rollback_plan jsonb := NULL;
  v_autonomy_rank jsonb := jsonb_build_object(
    'observe', 0,
    'diagnose', 1,
    'recommend', 2,
    'draft', 3,
    'simulate', 4,
    'approval_ready', 5,
    'constrained_action_ready', 6
  );
  v_current_rank int;
  v_required_rank int;
BEGIN
  -- Caller gate: admin or service role only
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required to evaluate action safety gates' USING ERRCODE = '42501';
  END IF;

  -- Load whitelist row
  SELECT * INTO v_wl FROM public.internal_agent_action_whitelist
   WHERE action_class = _action_class AND is_active = true;
  IF v_wl IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'denial_reason', format('action_class %s not in active whitelist', _action_class),
      'gate_results', jsonb_build_array(jsonb_build_object('gate','whitelist','passed',false)),
      'requires_approval', false,
      'rollback_plan', NULL
    );
  END IF;
  v_gate_results := v_gate_results || jsonb_build_object('gate','whitelist','passed',true);

  -- Load agent definition
  SELECT * INTO v_def FROM public.internal_agent_definitions WHERE agent_id = _agent_id;
  IF v_def IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'denial_reason', format('agent %s not found', _agent_id),
      'gate_results', v_gate_results || jsonb_build_object('gate','agent_exists','passed',false),
      'requires_approval', false,
      'rollback_plan', NULL
    );
  END IF;
  v_gate_results := v_gate_results || jsonb_build_object('gate','agent_exists','passed',true);

  -- Load runtime state
  SELECT * INTO v_state FROM public.internal_agent_runtime_state WHERE agent_id = _agent_id;

  -- GATE 1: Precondition (caller must supply non-empty evidence)
  IF _precondition_evidence IS NULL OR _precondition_evidence = '{}'::jsonb THEN
    v_allowed := false;
    v_denial := COALESCE(v_denial, 'precondition_evidence_missing');
    v_gate_results := v_gate_results || jsonb_build_object('gate','precondition','passed',false,'detail','no evidence supplied');
  ELSE
    v_gate_results := v_gate_results || jsonb_build_object('gate','precondition','passed',true);
  END IF;

  -- GATE 2: Rollback plan
  IF v_wl.requires_rollback AND v_wl.is_reversible THEN
    v_rollback_plan := jsonb_build_object(
      'reverse_action_class', v_wl.reverse_action_class,
      'target_id', _target_id,
      'target_resource_type', v_wl.target_resource_type,
      'rollback_evidence', _precondition_evidence
    );
    v_gate_results := v_gate_results || jsonb_build_object('gate','rollback_plan','passed',true);
  ELSIF v_wl.requires_rollback AND NOT v_wl.is_reversible THEN
    v_allowed := false;
    v_denial := COALESCE(v_denial, 'reversible_rollback_required_but_class_not_reversible');
    v_gate_results := v_gate_results || jsonb_build_object('gate','rollback_plan','passed',false);
  ELSE
    v_gate_results := v_gate_results || jsonb_build_object('gate','rollback_plan','passed',true,'detail','rollback not required for this class');
  END IF;

  -- GATE 3: Receipt slot
  v_gate_results := v_gate_results || jsonb_build_object('gate','receipt_required','passed',true,'detail','receipt will be created on execution');

  -- GATE 4: Rate limit
  SELECT count(*) INTO v_recent_count
    FROM public.internal_agent_action_intents
   WHERE agent_id = _agent_id
     AND action_class = _action_class
     AND created_at >= now() - interval '1 hour'
     AND status IN ('executing','executed','approval_pending');
  IF v_recent_count >= v_wl.rate_limit_per_hour THEN
    v_allowed := false;
    v_denial := COALESCE(v_denial, format('rate_limit_exceeded:%s/h', v_wl.rate_limit_per_hour));
    v_gate_results := v_gate_results || jsonb_build_object('gate','rate_limit','passed',false,'recent_count',v_recent_count,'limit',v_wl.rate_limit_per_hour);
  ELSE
    v_gate_results := v_gate_results || jsonb_build_object('gate','rate_limit','passed',true,'recent_count',v_recent_count);
  END IF;

  -- GATE 5: Kill-switch
  SELECT EXISTS(
    SELECT 1 FROM public.automation_kill_switches
    WHERE enabled = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (
        switch_id = 'KS-INTERNAL-AGENTS-EXECUTE'
        OR scope_id = 'internal-agents.execute'
        OR scope_id = format('internal-agents.%s', v_def.council)
        OR scope_id = format('internal-agents.%s.%s', v_def.council, _agent_id)
        OR scope_id = format('internal-agents.action.%s', _action_class)
      )
  ) INTO v_kill_active;

  IF v_kill_active THEN
    v_allowed := false;
    v_denial := COALESCE(v_denial, 'kill_switch_active');
    v_gate_results := v_gate_results || jsonb_build_object('gate','kill_switch','passed',false);
  ELSE
    v_gate_results := v_gate_results || jsonb_build_object('gate','kill_switch','passed',true);
  END IF;

  -- GATE 6: Autonomy validation + suspension
  v_current_rank := COALESCE((v_autonomy_rank->>v_def.current_autonomy_level)::int, -1);
  v_required_rank := COALESCE((v_autonomy_rank->>v_wl.max_autonomy_required)::int, 999);
  IF v_current_rank < v_required_rank THEN
    v_allowed := false;
    v_denial := COALESCE(v_denial, format('autonomy_insufficient:%s<%s', v_def.current_autonomy_level, v_wl.max_autonomy_required));
    v_gate_results := v_gate_results || jsonb_build_object('gate','autonomy','passed',false,'current',v_def.current_autonomy_level,'required',v_wl.max_autonomy_required);
  ELSE
    v_gate_results := v_gate_results || jsonb_build_object('gate','autonomy','passed',true);
  END IF;

  IF v_state.current_status = 'suspended' THEN
    v_allowed := false;
    v_denial := COALESCE(v_denial, 'agent_suspended');
    v_gate_results := v_gate_results || jsonb_build_object('gate','suspension','passed',false);
  ELSE
    v_gate_results := v_gate_results || jsonb_build_object('gate','suspension','passed',true);
  END IF;

  -- GATE 7: Approval-above-threshold
  IF _confidence < v_wl.requires_approval_above_confidence THEN
    v_requires_approval := true;
    v_gate_results := v_gate_results || jsonb_build_object('gate','approval_threshold','passed',true,'requires_approval',true,'confidence',_confidence,'threshold',v_wl.requires_approval_above_confidence);
  ELSE
    v_gate_results := v_gate_results || jsonb_build_object('gate','approval_threshold','passed',true,'requires_approval',false);
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'denial_reason', v_denial,
    'gate_results', v_gate_results,
    'requires_approval', v_requires_approval,
    'rollback_plan', v_rollback_plan,
    'whitelist_row', jsonb_build_object(
      'action_class', v_wl.action_class,
      'target_resource_type', v_wl.target_resource_type,
      'is_reversible', v_wl.is_reversible,
      'reverse_action_class', v_wl.reverse_action_class
    ),
    'agent', jsonb_build_object(
      'agent_id', v_def.agent_id,
      'council', v_def.council,
      'current_autonomy_level', v_def.current_autonomy_level
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.evaluate_action_safety_gates(TEXT,TEXT,TEXT,NUMERIC,JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_action_safety_gates(TEXT,TEXT,TEXT,NUMERIC,JSONB) TO service_role;