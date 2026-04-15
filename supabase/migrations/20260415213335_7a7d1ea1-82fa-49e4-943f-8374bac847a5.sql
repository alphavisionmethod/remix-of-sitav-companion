
-- ============================================================
-- Board of Advisors Part 2 — Advanced Intelligence Tables
-- ============================================================

-- 1. Advisor Board Memory (5-layer persistent memory)
CREATE TABLE public.advisor_board_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  memory_layer TEXT NOT NULL DEFAULT 'short_term',
  category TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  context_ref TEXT,
  importance NUMERIC NOT NULL DEFAULT 0.5,
  confidence NUMERIC NOT NULL DEFAULT 0.7,
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_board_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor memory" ON public.advisor_board_memory FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_abm_user_advisor ON public.advisor_board_memory (user_id, advisor_id);
CREATE INDEX idx_abm_layer ON public.advisor_board_memory (user_id, memory_layer);
CREATE INDEX idx_abm_status ON public.advisor_board_memory (status);

-- 2. Advisor Board Recommendations
CREATE TABLE public.advisor_board_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  rationale TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT 'business',
  category TEXT NOT NULL DEFAULT 'general',
  confidence_score NUMERIC NOT NULL DEFAULT 0.5,
  urgency_score NUMERIC NOT NULL DEFAULT 0.5,
  business_impact_score NUMERIC NOT NULL DEFAULT 0.5,
  reversibility_score NUMERIC NOT NULL DEFAULT 0.8,
  profitability_score NUMERIC NOT NULL DEFAULT 0.5,
  relationship_risk_score NUMERIC NOT NULL DEFAULT 0.2,
  operational_risk_score NUMERIC NOT NULL DEFAULT 0.2,
  clarity_score NUMERIC NOT NULL DEFAULT 0.7,
  contributing_advisors JSONB DEFAULT '[]',
  evidence_refs JSONB DEFAULT '[]',
  action_plan JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_board_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendations" ON public.advisor_board_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_abr_user_status ON public.advisor_board_recommendations (user_id, status);
CREATE INDEX idx_abr_advisor ON public.advisor_board_recommendations (user_id, advisor_id);
CREATE INDEX idx_abr_urgency ON public.advisor_board_recommendations (urgency_score DESC);

-- 3. Advisor Board Actions (full lifecycle)
CREATE TABLE public.advisor_board_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_id UUID REFERENCES public.advisor_board_recommendations(id) ON DELETE SET NULL,
  advisor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  action_type TEXT NOT NULL DEFAULT 'task',
  domain TEXT NOT NULL DEFAULT 'business',
  risk_tier TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'proposed',
  confidence NUMERIC NOT NULL DEFAULT 0.7,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  reverted_at TIMESTAMPTZ,
  error_message TEXT,
  proof_receipt JSONB DEFAULT '{}',
  rollback_data JSONB,
  parameters JSONB DEFAULT '{}',
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_board_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own actions" ON public.advisor_board_actions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_aba_user_status ON public.advisor_board_actions (user_id, status);
CREATE INDEX idx_aba_advisor ON public.advisor_board_actions (user_id, advisor_id);

-- 4. Advisor Board Tool Executions (audit log)
CREATE TABLE public.advisor_board_tool_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_id UUID REFERENCES public.advisor_board_actions(id) ON DELETE SET NULL,
  advisor_id TEXT NOT NULL,
  tool_category TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  result JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  approval_state TEXT NOT NULL DEFAULT 'pending',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT,
  rollback_capable BOOLEAN NOT NULL DEFAULT false,
  rollback_data JSONB,
  rolled_back_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_board_tool_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tool executions" ON public.advisor_board_tool_executions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_abte_user ON public.advisor_board_tool_executions (user_id);
CREATE INDEX idx_abte_action ON public.advisor_board_tool_executions (action_id);

-- 5. Business Health Scores (time-series)
CREATE TABLE public.business_health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dimension TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0.5,
  previous_score NUMERIC,
  trend TEXT NOT NULL DEFAULT 'stable',
  contributing_signals JSONB DEFAULT '[]',
  biggest_drag TEXT,
  biggest_mover TEXT,
  improvement_opportunity TEXT,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_health_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health scores" ON public.business_health_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_bhs_user_dim ON public.business_health_scores (user_id, dimension);
CREATE INDEX idx_bhs_scored ON public.business_health_scores (scored_at DESC);

-- 6. Profit Signals
CREATE TABLE public.profit_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'leak',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  estimated_impact_cents INTEGER,
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  urgency TEXT NOT NULL DEFAULT 'medium',
  source_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'detected',
  resolved_at TIMESTAMPTZ,
  resolution_outcome TEXT,
  actual_impact_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profit_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profit signals" ON public.profit_signals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ps_user_status ON public.profit_signals (user_id, status);
CREATE INDEX idx_ps_category ON public.profit_signals (user_id, category);

-- 7. Advisor Board Reflections (learning from owner actions)
CREATE TABLE public.advisor_board_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_id UUID REFERENCES public.advisor_board_recommendations(id) ON DELETE SET NULL,
  advisor_id TEXT NOT NULL,
  owner_action TEXT NOT NULL DEFAULT 'ignored',
  owner_feedback TEXT,
  outcome_observed TEXT,
  outcome_quality NUMERIC,
  lesson_learned TEXT,
  should_repeat BOOLEAN,
  pattern_tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_board_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reflections" ON public.advisor_board_reflections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_abrefl_user ON public.advisor_board_reflections (user_id, advisor_id);

-- 8. Advisor Autonomy Policies
CREATE TABLE public.advisor_autonomy_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL DEFAULT 'global',
  autonomy_level INTEGER NOT NULL DEFAULT 1,
  max_financial_impact_cents INTEGER NOT NULL DEFAULT 0,
  allow_communication BOOLEAN NOT NULL DEFAULT false,
  allow_scheduling BOOLEAN NOT NULL DEFAULT false,
  allow_financial BOOLEAN NOT NULL DEFAULT false,
  allow_client_facing BOOLEAN NOT NULL DEFAULT false,
  require_approval_above_confidence NUMERIC NOT NULL DEFAULT 0.8,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  emergency_stop BOOLEAN NOT NULL DEFAULT false,
  paused_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, domain)
);

ALTER TABLE public.advisor_autonomy_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own autonomy policies" ON public.advisor_autonomy_policies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_aap_user ON public.advisor_autonomy_policies (user_id);

-- Updated_at triggers for all tables
CREATE TRIGGER update_advisor_board_memory_updated_at BEFORE UPDATE ON public.advisor_board_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advisor_board_recommendations_updated_at BEFORE UPDATE ON public.advisor_board_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advisor_board_actions_updated_at BEFORE UPDATE ON public.advisor_board_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advisor_board_tool_executions_updated_at BEFORE UPDATE ON public.advisor_board_tool_executions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_health_scores_updated_at BEFORE UPDATE ON public.business_health_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profit_signals_updated_at BEFORE UPDATE ON public.profit_signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advisor_board_reflections_updated_at BEFORE UPDATE ON public.advisor_board_reflections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advisor_autonomy_policies_updated_at BEFORE UPDATE ON public.advisor_autonomy_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.advisor_board_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advisor_board_recommendations;
