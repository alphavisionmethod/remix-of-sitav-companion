-- ═══════════════════════════════════════════════════════════════
-- Phase 1 — Internal AI Workforce Runtime Bridge: DB Foundation
-- ═══════════════════════════════════════════════════════════════

-- ── Table 1: internal_agent_definitions ────────────────────────
CREATE TABLE public.internal_agent_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  council TEXT NOT NULL,
  mission TEXT NOT NULL DEFAULT '',
  special_ability TEXT NOT NULL DEFAULT '',
  max_autonomy_level TEXT NOT NULL DEFAULT 'observe',
  current_autonomy_level TEXT NOT NULL DEFAULT 'observe',
  schedule_type TEXT NOT NULL DEFAULT 'daily',
  schedule_cron TEXT,
  scope JSONB NOT NULL DEFAULT '[]'::jsonb,
  out_of_scope JSONB NOT NULL DEFAULT '[]'::jsonb,
  tools_allowed JSONB NOT NULL DEFAULT '[]'::jsonb,
  tools_forbidden JSONB NOT NULL DEFAULT '[]'::jsonb,
  memory_scope TEXT NOT NULL DEFAULT 'agent-local',
  trigger_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  trigger_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  escalation_targets JSONB NOT NULL DEFAULT '[]'::jsonb,
  receives_escalations_from JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_escalation_target TEXT,
  confidence_threshold_act NUMERIC NOT NULL DEFAULT 0.8,
  confidence_threshold_recommend NUMERIC NOT NULL DEFAULT 0.5,
  simulation_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  human_approval_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  rollback_authority TEXT NOT NULL DEFAULT 'None',
  reporting_outputs JSONB NOT NULL DEFAULT '[]'::jsonb,
  measurable_kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  cost_budget_guidance TEXT NOT NULL DEFAULT '',
  cost_budget_daily_cents INTEGER NOT NULL DEFAULT 100,
  max_invocations_per_day INTEGER NOT NULL DEFAULT 24,
  failure_handling_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_docs JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  maturity TEXT NOT NULL DEFAULT 'scaffold',
  is_active BOOLEAN NOT NULL DEFAULT true,
  spec_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_iad_council_active ON public.internal_agent_definitions(council, is_active);
CREATE INDEX idx_iad_maturity ON public.internal_agent_definitions(maturity);
CREATE INDEX idx_iad_schedule_type ON public.internal_agent_definitions(schedule_type) WHERE is_active = true;

ALTER TABLE public.internal_agent_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iad_admin_select" ON public.internal_agent_definitions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iad_admin_insert" ON public.internal_agent_definitions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iad_admin_update" ON public.internal_agent_definitions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iad_admin_delete" ON public.internal_agent_definitions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_iad_updated_at
  BEFORE UPDATE ON public.internal_agent_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── Table 2: internal_agent_runtime_state ──────────────────────
CREATE TABLE public.internal_agent_runtime_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE REFERENCES public.internal_agent_definitions(agent_id) ON DELETE CASCADE,
  current_status TEXT NOT NULL DEFAULT 'idle', -- idle | running | cooldown | suspended | error
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  last_error_message TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  total_runs BIGINT NOT NULL DEFAULT 0,
  total_successes BIGINT NOT NULL DEFAULT 0,
  total_failures BIGINT NOT NULL DEFAULT 0,
  total_escalations BIGINT NOT NULL DEFAULT 0,
  total_actions_recorded BIGINT NOT NULL DEFAULT 0,
  trust_score NUMERIC NOT NULL DEFAULT 0.5, -- 0.0 to 1.0
  cooldown_until TIMESTAMP WITH TIME ZONE,
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspended_by UUID,
  suspension_reason TEXT,
  last_invocation_id UUID REFERENCES public.ai_workforce_invocations(id) ON DELETE SET NULL,
  current_run_correlation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_iars_status ON public.internal_agent_runtime_state(current_status);
CREATE INDEX idx_iars_last_run ON public.internal_agent_runtime_state(last_run_at DESC NULLS LAST);
CREATE INDEX idx_iars_suspended ON public.internal_agent_runtime_state(suspended_at DESC NULLS LAST) WHERE suspended_at IS NOT NULL;

ALTER TABLE public.internal_agent_runtime_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iars_admin_select" ON public.internal_agent_runtime_state
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iars_admin_insert" ON public.internal_agent_runtime_state
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iars_admin_update" ON public.internal_agent_runtime_state
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iars_admin_delete" ON public.internal_agent_runtime_state
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_iars_updated_at
  BEFORE UPDATE ON public.internal_agent_runtime_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── Table 3: council_escalations (declared early so internal_agent_actions can FK it) ──────────────
CREATE TABLE public.council_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_agent_id TEXT NOT NULL REFERENCES public.internal_agent_definitions(agent_id) ON DELETE CASCADE,
  source_council TEXT NOT NULL,
  target_supervisor TEXT NOT NULL,
  escalation_reason TEXT NOT NULL DEFAULT 'unspecified', -- low_confidence | repeat_failure | policy_block | budget_block | manual | meta_escalation
  severity TEXT NOT NULL DEFAULT 'medium', -- low | medium | high | critical
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open', -- open | acknowledged | resolved | escalated_to_meta | dismissed
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  meta_escalated_at TIMESTAMP WITH TIME ZONE,
  correlation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ce_status_created ON public.council_escalations(status, created_at DESC);
CREATE INDEX idx_ce_supervisor ON public.council_escalations(target_supervisor, status);
CREATE INDEX idx_ce_council ON public.council_escalations(source_council, status);
CREATE INDEX idx_ce_agent ON public.council_escalations(source_agent_id, created_at DESC);

ALTER TABLE public.council_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ce_admin_select" ON public.council_escalations
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "ce_admin_insert" ON public.council_escalations
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "ce_admin_update" ON public.council_escalations
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "ce_admin_delete" ON public.council_escalations
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_ce_updated_at
  BEFORE UPDATE ON public.council_escalations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── Table 4: internal_agent_actions ────────────────────────────
CREATE TABLE public.internal_agent_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES public.internal_agent_definitions(agent_id) ON DELETE CASCADE,
  council TEXT NOT NULL,
  invocation_id UUID REFERENCES public.ai_workforce_invocations(id) ON DELETE SET NULL,
  approval_request_id UUID REFERENCES public.ai_workforce_approval_queue(id) ON DELETE SET NULL,
  escalation_id UUID REFERENCES public.council_escalations(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL DEFAULT 'observe', -- observe | diagnose | recommend | draft | simulate | approval_queued | constrained_action | escalated
  autonomy_level_used TEXT NOT NULL DEFAULT 'observe',
  confidence NUMERIC NOT NULL DEFAULT 0.0,
  summary TEXT NOT NULL DEFAULT '',
  rationale TEXT,
  observation_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  simulation_result JSONB,
  execution_result JSONB,
  rollback_data JSONB,
  status TEXT NOT NULL DEFAULT 'recorded', -- recorded | queued_for_approval | executed | failed | rolled_back | escalated
  error_message TEXT,
  correlation_id TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_iaa_agent_created ON public.internal_agent_actions(agent_id, created_at DESC);
CREATE INDEX idx_iaa_council_created ON public.internal_agent_actions(council, created_at DESC);
CREATE INDEX idx_iaa_status ON public.internal_agent_actions(status, created_at DESC);
CREATE INDEX idx_iaa_invocation ON public.internal_agent_actions(invocation_id) WHERE invocation_id IS NOT NULL;
CREATE INDEX idx_iaa_approval ON public.internal_agent_actions(approval_request_id) WHERE approval_request_id IS NOT NULL;
CREATE INDEX idx_iaa_escalation ON public.internal_agent_actions(escalation_id) WHERE escalation_id IS NOT NULL;

ALTER TABLE public.internal_agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iaa_admin_select" ON public.internal_agent_actions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iaa_admin_insert" ON public.internal_agent_actions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iaa_admin_update" ON public.internal_agent_actions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "iaa_admin_delete" ON public.internal_agent_actions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_iaa_updated_at
  BEFORE UPDATE ON public.internal_agent_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── Table 5: supervisor_decisions ──────────────────────────────
CREATE TABLE public.supervisor_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_key TEXT NOT NULL,
  decision_type TEXT NOT NULL, -- approve | reject | override | suspend | resume | downgrade | upgrade | escalate_meta | dismiss
  target_agent_id TEXT REFERENCES public.internal_agent_definitions(agent_id) ON DELETE SET NULL,
  target_action_id UUID REFERENCES public.internal_agent_actions(id) ON DELETE SET NULL,
  target_escalation_id UUID REFERENCES public.council_escalations(id) ON DELETE SET NULL,
  rationale TEXT NOT NULL DEFAULT '',
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  previous_state JSONB,
  new_state JSONB,
  decided_by UUID,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  correlation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_sd_supervisor ON public.supervisor_decisions(supervisor_key, created_at DESC);
CREATE INDEX idx_sd_agent ON public.supervisor_decisions(target_agent_id, created_at DESC) WHERE target_agent_id IS NOT NULL;
CREATE INDEX idx_sd_escalation ON public.supervisor_decisions(target_escalation_id) WHERE target_escalation_id IS NOT NULL;
CREATE INDEX idx_sd_decision_type ON public.supervisor_decisions(decision_type, created_at DESC);

ALTER TABLE public.supervisor_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sd_admin_select" ON public.supervisor_decisions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "sd_admin_insert" ON public.supervisor_decisions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "sd_admin_update" ON public.supervisor_decisions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "sd_admin_delete" ON public.supervisor_decisions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_sd_updated_at
  BEFORE UPDATE ON public.supervisor_decisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── Comments for documentation ─────────────────────────────────
COMMENT ON TABLE public.internal_agent_definitions IS 'Phase 1 Runtime Bridge — durable definitions for the 40 internal AI workforce agents (seeded from src/lib/internal-agents/agents/*.ts)';
COMMENT ON TABLE public.internal_agent_runtime_state IS 'Phase 1 Runtime Bridge — live mutable state per agent (one row per agent, auto-created at seed)';
COMMENT ON TABLE public.internal_agent_actions IS 'Phase 1 Runtime Bridge — every meaningful agent action, FK to canonical ai_workforce_invocations + approval queue + escalations';
COMMENT ON TABLE public.council_escalations IS 'Phase 1 Runtime Bridge — escalation persistence routed agent → supervisor → meta-supervisor';
COMMENT ON TABLE public.supervisor_decisions IS 'Phase 1 Runtime Bridge — supervisor decision audit trail (approve/reject/override/suspend/downgrade/escalate_meta)';
