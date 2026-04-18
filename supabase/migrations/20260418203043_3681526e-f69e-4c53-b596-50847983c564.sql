-- ═══════════════════════════════════════════════════════════════
-- Phase 6 — Cross-Council Coordination, Cost Optimization, Self-Healing
-- L3 hard ceiling enforced at the RPC layer for all cross-council actions
-- ═══════════════════════════════════════════════════════════════

-- ── 6A: Consensus Sessions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internal_agent_consensus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL UNIQUE,
  topic text NOT NULL,
  initiating_agent_id text NOT NULL,
  participating_councils text[] NOT NULL DEFAULT '{}',
  participating_agent_ids text[] NOT NULL DEFAULT '{}',
  quorum_required int NOT NULL DEFAULT 3,
  action_class text NOT NULL DEFAULT 'recommendation',
  proposed_autonomy_level int NOT NULL DEFAULT 0,
  effective_autonomy_level int NOT NULL DEFAULT 0,
  ceiling_capped boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  conflict_detected boolean NOT NULL DEFAULT false,
  resolution_summary text,
  resolution_payload jsonb,
  resolved_at timestamptz,
  resolved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  CONSTRAINT consensus_status_check CHECK (status IN ('open','quorum_reached','conflict','resolved','expired','withdrawn')),
  CONSTRAINT consensus_action_class_check CHECK (action_class IN ('recommendation','policy_change','runbook_execute','cost_proposal','escalation')),
  CONSTRAINT consensus_autonomy_check CHECK (proposed_autonomy_level BETWEEN 0 AND 6 AND effective_autonomy_level BETWEEN 0 AND 6)
);

CREATE INDEX IF NOT EXISTS idx_consensus_sessions_status ON public.internal_agent_consensus_sessions(status);
CREATE INDEX IF NOT EXISTS idx_consensus_sessions_initiator ON public.internal_agent_consensus_sessions(initiating_agent_id);
CREATE INDEX IF NOT EXISTS idx_consensus_sessions_created ON public.internal_agent_consensus_sessions(created_at DESC);

-- ── 6A: Consensus Votes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internal_agent_consensus_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.internal_agent_consensus_sessions(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  council text NOT NULL,
  position text NOT NULL,
  confidence numeric(4,3) NOT NULL DEFAULT 0.0,
  rationale text NOT NULL DEFAULT '',
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  cast_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  CONSTRAINT vote_position_check CHECK (position IN ('approve','reject','abstain','escalate')),
  CONSTRAINT vote_confidence_range CHECK (confidence >= 0 AND confidence <= 1),
  UNIQUE (session_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_consensus_votes_session ON public.internal_agent_consensus_votes(session_id);
CREATE INDEX IF NOT EXISTS idx_consensus_votes_agent ON public.internal_agent_consensus_votes(agent_id);

-- ── 6B: Cost Optimization Proposals ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.internal_agent_cost_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_key text NOT NULL UNIQUE,
  proposing_agent_id text NOT NULL,
  proposal_type text NOT NULL,
  scope text NOT NULL DEFAULT 'global',
  target_capability text,
  current_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  proposed_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  estimated_monthly_savings_usd numeric(10,2) NOT NULL DEFAULT 0,
  estimated_quality_delta numeric(4,3) NOT NULL DEFAULT 0,
  rationale text NOT NULL,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_assessment text NOT NULL DEFAULT 'low',
  reviewer_user_id uuid,
  status text NOT NULL DEFAULT 'draft_pending_review',
  decision_notes text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '180 days'),
  CONSTRAINT cost_proposal_type_check CHECK (proposal_type IN ('model_downgrade','prompt_cache','budget_reallocation','rate_limit_change','provider_swap')),
  CONSTRAINT cost_proposal_status_check CHECK (status IN ('draft_pending_review','approved_for_manual_apply','rejected','superseded','expired')),
  CONSTRAINT cost_proposal_risk_check CHECK (risk_assessment IN ('low','medium','high','critical'))
);

CREATE INDEX IF NOT EXISTS idx_cost_proposals_status ON public.internal_agent_cost_proposals(status);
CREATE INDEX IF NOT EXISTS idx_cost_proposals_agent ON public.internal_agent_cost_proposals(proposing_agent_id);

-- ── 6C: Runbook Bindings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internal_agent_runbook_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  runbook_id text NOT NULL,
  max_autonomy_level int NOT NULL DEFAULT 1,
  prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
  rollback_required boolean NOT NULL DEFAULT true,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT runbook_binding_autonomy_check CHECK (max_autonomy_level BETWEEN 0 AND 3),
  UNIQUE (agent_id, runbook_id)
);

CREATE INDEX IF NOT EXISTS idx_runbook_bindings_agent ON public.internal_agent_runbook_bindings(agent_id);
CREATE INDEX IF NOT EXISTS idx_runbook_bindings_runbook ON public.internal_agent_runbook_bindings(runbook_id);

-- ── 6C: Runbook Executions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.internal_agent_runbook_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_key text NOT NULL UNIQUE,
  binding_id uuid REFERENCES public.internal_agent_runbook_bindings(id) ON DELETE SET NULL,
  agent_id text NOT NULL,
  runbook_id text NOT NULL,
  trigger_reason text NOT NULL,
  trigger_evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  autonomy_level_used int NOT NULL DEFAULT 0,
  ceiling_capped boolean NOT NULL DEFAULT false,
  steps_executed jsonb NOT NULL DEFAULT '[]'::jsonb,
  rollback_data jsonb,
  outcome_status text NOT NULL DEFAULT 'pending',
  outcome_summary text,
  duration_ms int,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '180 days'),
  CONSTRAINT runbook_exec_outcome_check CHECK (outcome_status IN ('pending','succeeded','partial','failed','rolled_back','aborted')),
  CONSTRAINT runbook_exec_autonomy_check CHECK (autonomy_level_used BETWEEN 0 AND 3)
);

CREATE INDEX IF NOT EXISTS idx_runbook_exec_agent ON public.internal_agent_runbook_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_runbook_exec_runbook ON public.internal_agent_runbook_executions(runbook_id);
CREATE INDEX IF NOT EXISTS idx_runbook_exec_started ON public.internal_agent_runbook_executions(started_at DESC);

-- ── RLS ─────────────────────────────────────────────────────────
ALTER TABLE public.internal_agent_consensus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_agent_consensus_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_agent_cost_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_agent_runbook_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_agent_runbook_executions ENABLE ROW LEVEL SECURITY;

-- Admin-only read; service role writes via RPC
CREATE POLICY "admins_read_consensus_sessions" ON public.internal_agent_consensus_sessions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_read_consensus_votes" ON public.internal_agent_consensus_votes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_read_cost_proposals" ON public.internal_agent_cost_proposals
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_read_runbook_bindings" ON public.internal_agent_runbook_bindings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_read_runbook_executions" ON public.internal_agent_runbook_executions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins may update cost proposals (decision recording)
CREATE POLICY "admins_decide_cost_proposals" ON public.internal_agent_cost_proposals
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ── RPC: Open consensus session ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.open_internal_agent_consensus(
  p_session_key text,
  p_topic text,
  p_initiating_agent_id text,
  p_participating_councils text[],
  p_participating_agent_ids text[],
  p_quorum_required int,
  p_action_class text,
  p_proposed_autonomy_level int
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_effective_level int;
  v_capped boolean := false;
  v_id uuid;
BEGIN
  -- Hard L3 ceiling for cross-council actions
  IF p_proposed_autonomy_level > 3 THEN
    v_effective_level := 3;
    v_capped := true;
  ELSE
    v_effective_level := p_proposed_autonomy_level;
  END IF;

  INSERT INTO public.internal_agent_consensus_sessions (
    session_key, topic, initiating_agent_id, participating_councils,
    participating_agent_ids, quorum_required, action_class,
    proposed_autonomy_level, effective_autonomy_level, ceiling_capped, status
  ) VALUES (
    p_session_key, p_topic, p_initiating_agent_id, p_participating_councils,
    p_participating_agent_ids, GREATEST(1, p_quorum_required), p_action_class,
    p_proposed_autonomy_level, v_effective_level, v_capped, 'open'
  )
  ON CONFLICT (session_key) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── RPC: Cast vote ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cast_internal_agent_consensus_vote(
  p_session_id uuid,
  p_agent_id text,
  p_council text,
  p_position text,
  p_confidence numeric,
  p_rationale text,
  p_evidence_refs jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.internal_agent_consensus_votes (
    session_id, agent_id, council, position, confidence, rationale, evidence_refs
  ) VALUES (
    p_session_id, p_agent_id, p_council, p_position,
    GREATEST(0, LEAST(1, p_confidence)), p_rationale, p_evidence_refs
  )
  ON CONFLICT (session_id, agent_id) DO UPDATE SET
    position = EXCLUDED.position,
    confidence = EXCLUDED.confidence,
    rationale = EXCLUDED.rationale,
    evidence_refs = EXCLUDED.evidence_refs,
    cast_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── RPC: Resolve consensus ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.resolve_internal_agent_consensus(
  p_session_id uuid,
  p_resolved_by text DEFAULT 'system'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session record;
  v_approve int;
  v_reject int;
  v_abstain int;
  v_escalate int;
  v_total int;
  v_status text;
  v_conflict boolean := false;
  v_summary text;
BEGIN
  SELECT * INTO v_session FROM public.internal_agent_consensus_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error','session_not_found');
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE position = 'approve'),
    COUNT(*) FILTER (WHERE position = 'reject'),
    COUNT(*) FILTER (WHERE position = 'abstain'),
    COUNT(*) FILTER (WHERE position = 'escalate'),
    COUNT(*)
  INTO v_approve, v_reject, v_abstain, v_escalate, v_total
  FROM public.internal_agent_consensus_votes WHERE session_id = p_session_id;

  IF v_escalate > 0 OR (v_approve > 0 AND v_reject > 0) THEN
    v_conflict := true;
  END IF;

  IF v_total < v_session.quorum_required THEN
    v_status := 'open';
    v_summary := format('Quorum not reached (%s/%s)', v_total, v_session.quorum_required);
  ELSIF v_conflict THEN
    v_status := 'conflict';
    v_summary := format('Conflict: %s approve, %s reject, %s escalate', v_approve, v_reject, v_escalate);
  ELSIF v_approve >= v_session.quorum_required THEN
    v_status := 'resolved';
    v_summary := format('Approved by quorum (%s/%s)', v_approve, v_session.quorum_required);
  ELSE
    v_status := 'resolved';
    v_summary := format('Rejected (%s approve / %s reject)', v_approve, v_reject);
  END IF;

  UPDATE public.internal_agent_consensus_sessions
  SET status = v_status,
      conflict_detected = v_conflict,
      resolution_summary = v_summary,
      resolution_payload = jsonb_build_object(
        'approve', v_approve, 'reject', v_reject,
        'abstain', v_abstain, 'escalate', v_escalate, 'total', v_total
      ),
      resolved_at = CASE WHEN v_status IN ('resolved','conflict') THEN now() ELSE NULL END,
      resolved_by = p_resolved_by,
      updated_at = now()
  WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'status', v_status, 'summary', v_summary, 'conflict', v_conflict,
    'votes', jsonb_build_object('approve', v_approve, 'reject', v_reject, 'abstain', v_abstain, 'escalate', v_escalate, 'total', v_total)
  );
END;
$$;

-- ── RPC: Propose cost optimization (NEVER auto-applies) ─────────
CREATE OR REPLACE FUNCTION public.propose_internal_cost_optimization(
  p_proposal_key text,
  p_proposing_agent_id text,
  p_proposal_type text,
  p_scope text,
  p_target_capability text,
  p_current_state jsonb,
  p_proposed_state jsonb,
  p_estimated_monthly_savings_usd numeric,
  p_estimated_quality_delta numeric,
  p_rationale text,
  p_evidence_refs jsonb DEFAULT '[]'::jsonb,
  p_risk_assessment text DEFAULT 'low'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.internal_agent_cost_proposals (
    proposal_key, proposing_agent_id, proposal_type, scope, target_capability,
    current_state, proposed_state, estimated_monthly_savings_usd,
    estimated_quality_delta, rationale, evidence_refs, risk_assessment,
    status
  ) VALUES (
    p_proposal_key, p_proposing_agent_id, p_proposal_type, p_scope, p_target_capability,
    p_current_state, p_proposed_state, p_estimated_monthly_savings_usd,
    p_estimated_quality_delta, p_rationale, p_evidence_refs, p_risk_assessment,
    'draft_pending_review'  -- Hard rule: NEVER auto-approves
  )
  ON CONFLICT (proposal_key) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── RPC: Record runbook execution (L3 ceiling) ──────────────────
CREATE OR REPLACE FUNCTION public.record_internal_runbook_execution(
  p_execution_key text,
  p_agent_id text,
  p_runbook_id text,
  p_trigger_reason text,
  p_trigger_evidence_refs jsonb,
  p_requested_autonomy_level int,
  p_steps_executed jsonb,
  p_rollback_data jsonb,
  p_outcome_status text,
  p_outcome_summary text,
  p_duration_ms int
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_binding record;
  v_effective_level int;
  v_capped boolean := false;
BEGIN
  -- Find binding; reject if missing or disabled
  SELECT * INTO v_binding
  FROM public.internal_agent_runbook_bindings
  WHERE agent_id = p_agent_id AND runbook_id = p_runbook_id AND enabled = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agent % is not bound to runbook % (or binding disabled)', p_agent_id, p_runbook_id;
  END IF;

  -- Hard L3 ceiling, plus per-binding cap
  v_effective_level := LEAST(p_requested_autonomy_level, v_binding.max_autonomy_level, 3);
  IF v_effective_level < p_requested_autonomy_level THEN
    v_capped := true;
  END IF;

  INSERT INTO public.internal_agent_runbook_executions (
    execution_key, binding_id, agent_id, runbook_id, trigger_reason,
    trigger_evidence_refs, autonomy_level_used, ceiling_capped,
    steps_executed, rollback_data, outcome_status, outcome_summary,
    duration_ms, completed_at
  ) VALUES (
    p_execution_key, v_binding.id, p_agent_id, p_runbook_id, p_trigger_reason,
    p_trigger_evidence_refs, v_effective_level, v_capped,
    p_steps_executed, p_rollback_data, p_outcome_status, p_outcome_summary,
    p_duration_ms,
    CASE WHEN p_outcome_status IN ('succeeded','partial','failed','rolled_back','aborted') THEN now() ELSE NULL END
  )
  ON CONFLICT (execution_key) DO UPDATE SET
    outcome_status = EXCLUDED.outcome_status,
    outcome_summary = EXCLUDED.outcome_summary,
    duration_ms = EXCLUDED.duration_ms,
    completed_at = EXCLUDED.completed_at
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── Triggers for updated_at ─────────────────────────────────────
CREATE TRIGGER trg_consensus_sessions_updated
  BEFORE UPDATE ON public.internal_agent_consensus_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_cost_proposals_updated
  BEFORE UPDATE ON public.internal_agent_cost_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_runbook_bindings_updated
  BEFORE UPDATE ON public.internal_agent_runbook_bindings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();