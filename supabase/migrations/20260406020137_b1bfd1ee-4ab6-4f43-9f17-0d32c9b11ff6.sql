
-- 1. personal_operating_graph_nodes
CREATE TABLE public.personal_operating_graph_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id TEXT,
  workspace_id TEXT,
  node_type TEXT NOT NULL DEFAULT 'other',
  node_ref TEXT,
  label TEXT NOT NULL,
  state TEXT DEFAULT 'active',
  visibility_scope TEXT DEFAULT 'private',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.personal_operating_graph_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own graph nodes" ON public.personal_operating_graph_nodes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_personal_operating_graph_nodes_updated_at BEFORE UPDATE ON public.personal_operating_graph_nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_pogn_user ON public.personal_operating_graph_nodes(user_id);
CREATE INDEX idx_pogn_type ON public.personal_operating_graph_nodes(node_type);

-- 2. personal_operating_graph_edges
CREATE TABLE public.personal_operating_graph_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_node_id UUID REFERENCES public.personal_operating_graph_nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES public.personal_operating_graph_nodes(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL DEFAULT 'related',
  weight NUMERIC DEFAULT 1.0,
  visibility_scope TEXT DEFAULT 'private',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.personal_operating_graph_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own graph edges" ON public.personal_operating_graph_edges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_poge_user ON public.personal_operating_graph_edges(user_id);
CREATE INDEX idx_poge_from ON public.personal_operating_graph_edges(from_node_id);
CREATE INDEX idx_poge_to ON public.personal_operating_graph_edges(to_node_id);

-- 3. intent_resolutions
CREATE TABLE public.intent_resolutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  source_surface TEXT,
  source_device_id TEXT,
  raw_input TEXT,
  resolved_intent TEXT,
  confidence NUMERIC DEFAULT 0,
  target_capability TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intent_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intents" ON public.intent_resolutions FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE INDEX idx_ir_actor ON public.intent_resolutions(actor_id);

-- 4. command_orchestrations
CREATE TABLE public.command_orchestrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_resolution_id UUID REFERENCES public.intent_resolutions(id) ON DELETE SET NULL,
  actor_id UUID NOT NULL,
  capability_key TEXT,
  workflow_ref TEXT,
  policy_decision_ref TEXT,
  trust_decision_ref TEXT,
  execution_state TEXT DEFAULT 'pending',
  receipt_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.command_orchestrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own orchestrations" ON public.command_orchestrations FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE TRIGGER update_command_orchestrations_updated_at BEFORE UPDATE ON public.command_orchestrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_co_actor ON public.command_orchestrations(actor_id);

-- 5. priority_stacks
CREATE TABLE public.priority_stacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT DEFAULT 'default',
  stack_date DATE NOT NULL DEFAULT CURRENT_DATE,
  top_items_json JSONB DEFAULT '[]'::jsonb,
  urgency_summary TEXT,
  attention_posture TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.priority_stacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own priority stacks" ON public.priority_stacks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_priority_stacks_updated_at BEFORE UPDATE ON public.priority_stacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ps_user_date ON public.priority_stacks(user_id, stack_date);

-- 6. attention_decisions
CREATE TABLE public.attention_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_ref TEXT,
  urgency_class TEXT DEFAULT 'normal',
  routing_decision TEXT,
  selected_surface TEXT,
  selected_device_id TEXT,
  deferred BOOLEAN DEFAULT false,
  defer_until TIMESTAMPTZ,
  reason TEXT,
  fatigue_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attention_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own attention decisions" ON public.attention_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ad_user ON public.attention_decisions(user_id);

-- 7. cai_continuity_sessions (prefixed to avoid conflict with existing continuity_sessions)
CREATE TABLE public.cai_continuity_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_surface TEXT,
  target_surface TEXT,
  source_device_id TEXT,
  target_device_id TEXT,
  context_ref TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.cai_continuity_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cai continuity sessions" ON public.cai_continuity_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ccs_user ON public.cai_continuity_sessions(user_id);

-- 8. handoff_contexts
CREATE TABLE public.handoff_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  continuity_session_id UUID REFERENCES public.cai_continuity_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  context_type TEXT DEFAULT 'state',
  payload_ref TEXT,
  urgency_class TEXT DEFAULT 'normal',
  resumable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handoff_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own handoff contexts" ON public.handoff_contexts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hc_session ON public.handoff_contexts(continuity_session_id);

-- 9. trust_weighted_actions
CREATE TABLE public.trust_weighted_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_ref TEXT,
  risk_tier TEXT DEFAULT 'low',
  trust_class TEXT DEFAULT 'standard',
  device_trust_class TEXT DEFAULT 'unknown',
  mode TEXT DEFAULT 'live',
  routing TEXT DEFAULT 'auto',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trust_weighted_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trust weighted actions" ON public.trust_weighted_actions FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE INDEX idx_twa_actor ON public.trust_weighted_actions(actor_id);

-- 10. action_escalations
CREATE TABLE public.action_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trust_weighted_action_id UUID REFERENCES public.trust_weighted_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  from_state TEXT,
  to_state TEXT,
  escalation_reason TEXT,
  target_surface TEXT,
  target_device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.action_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own action escalations" ON public.action_escalations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ae_action ON public.action_escalations(trust_weighted_action_id);

-- 11. assistant_role_states
CREATE TABLE public.assistant_role_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_key TEXT NOT NULL DEFAULT 'other',
  state TEXT DEFAULT 'idle',
  posture TEXT DEFAULT 'calm',
  confidence NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assistant_role_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assistant role states" ON public.assistant_role_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_assistant_role_states_updated_at BEFORE UPDATE ON public.assistant_role_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ars_user_role ON public.assistant_role_states(user_id, role_key);

-- 12. coordinated_assistant_sessions
CREATE TABLE public.coordinated_assistant_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  active_roles TEXT[] DEFAULT '{}',
  current_objective TEXT,
  current_context_ref TEXT,
  support_intensity TEXT DEFAULT 'calm',
  calmness_profile TEXT DEFAULT 'balanced',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coordinated_assistant_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assistant sessions" ON public.coordinated_assistant_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_coordinated_assistant_sessions_updated_at BEFORE UPDATE ON public.coordinated_assistant_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cas_user ON public.coordinated_assistant_sessions(user_id);

-- 13. timing_intelligence_decisions
CREATE TABLE public.timing_intelligence_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trigger_ref TEXT,
  recommendation TEXT DEFAULT 'queue',
  reason TEXT,
  readiness_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timing_intelligence_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own timing decisions" ON public.timing_intelligence_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_tid_user ON public.timing_intelligence_decisions(user_id);

-- 14. relationship_contexts
CREATE TABLE public.relationship_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  related_person_ref TEXT,
  relationship_type TEXT DEFAULT 'contact',
  importance_tier TEXT DEFAULT 'normal',
  last_interaction_at TIMESTAMPTZ,
  open_loops_json JSONB DEFAULT '[]'::jsonb,
  obligations_json JSONB DEFAULT '[]'::jsonb,
  visibility_scope TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.relationship_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own relationship contexts" ON public.relationship_contexts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_relationship_contexts_updated_at BEFORE UPDATE ON public.relationship_contexts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_rc_user ON public.relationship_contexts(user_id);

-- 15. human_obligations
CREATE TABLE public.human_obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  related_person_ref TEXT,
  obligation_type TEXT DEFAULT 'follow_up',
  due_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  source_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.human_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own obligations" ON public.human_obligations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_human_obligations_updated_at BEFORE UPDATE ON public.human_obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ho_user_status ON public.human_obligations(user_id, status);

-- 16. digest_compilations
CREATE TABLE public.digest_compilations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  digest_type TEXT NOT NULL DEFAULT 'daily_pulse',
  mode TEXT DEFAULT 'live',
  source_refs TEXT[] DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_surface TEXT,
  summary_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digest_compilations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own digests" ON public.digest_compilations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_dc_user_type ON public.digest_compilations(user_id, digest_type);

-- 17. operating_modes
CREATE TABLE public.operating_modes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode_key TEXT NOT NULL DEFAULT 'default',
  active BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.operating_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own operating modes" ON public.operating_modes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_om_user_active ON public.operating_modes(user_id, active);

-- 18. adaptive_interface_profiles
CREATE TABLE public.adaptive_interface_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface TEXT NOT NULL DEFAULT 'web',
  current_mode TEXT DEFAULT 'default',
  cognitive_load_class TEXT DEFAULT 'normal',
  density_preference TEXT DEFAULT 'comfortable',
  summary_depth TEXT DEFAULT 'standard',
  quick_action_bias TEXT DEFAULT 'balanced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adaptive_interface_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interface profiles" ON public.adaptive_interface_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_adaptive_interface_profiles_updated_at BEFORE UPDATE ON public.adaptive_interface_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_aip_user_surface ON public.adaptive_interface_profiles(user_id, surface);

-- 19. opportunity_signals
CREATE TABLE public.opportunity_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT DEFAULT 'general',
  signal_type TEXT DEFAULT 'detected',
  title TEXT NOT NULL,
  summary TEXT,
  importance_tier TEXT DEFAULT 'normal',
  confidence NUMERIC DEFAULT 0,
  source_refs TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunity_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own opportunity signals" ON public.opportunity_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_opportunity_signals_updated_at BEFORE UPDATE ON public.opportunity_signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_os_user_status ON public.opportunity_signals(user_id, status);

-- 20. memory_governance_records
CREATE TABLE public.memory_governance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_ref TEXT NOT NULL,
  user_id UUID NOT NULL,
  confidence NUMERIC DEFAULT 1.0,
  freshness TEXT DEFAULT 'current',
  correction_state TEXT DEFAULT 'uncorrected',
  archival_state TEXT DEFAULT 'active',
  visibility_scope TEXT DEFAULT 'private',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memory_governance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory governance" ON public.memory_governance_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_memory_governance_records_updated_at BEFORE UPDATE ON public.memory_governance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_mgr_user ON public.memory_governance_records(user_id);

-- 21. memory_corrections
CREATE TABLE public.memory_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_ref TEXT NOT NULL,
  actor_id UUID NOT NULL,
  correction_type TEXT DEFAULT 'factual',
  old_value_ref TEXT,
  new_value_ref TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memory_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory corrections" ON public.memory_corrections FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE INDEX idx_mc_actor ON public.memory_corrections(actor_id);

-- 22. boundary_policies
CREATE TABLE public.boundary_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  boundary_type TEXT NOT NULL DEFAULT 'personal',
  policy_json JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.boundary_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own boundary policies" ON public.boundary_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_boundary_policies_updated_at BEFORE UPDATE ON public.boundary_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_bp_user_type ON public.boundary_policies(user_id, boundary_type);

-- 23. experience_signature_rules
CREATE TABLE public.experience_signature_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface TEXT NOT NULL DEFAULT 'web',
  context_type TEXT DEFAULT 'default',
  urgency_class TEXT DEFAULT 'normal',
  tone_profile TEXT DEFAULT 'calm',
  summary_style TEXT DEFAULT 'concise',
  proof_style TEXT DEFAULT 'minimal',
  escalation_style TEXT DEFAULT 'graduated',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experience_signature_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experience rules" ON public.experience_signature_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_esr_user_surface ON public.experience_signature_rules(user_id, surface);
