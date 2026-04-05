-- AI Engineering Missions
CREATE TABLE public.ai_engineering_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL DEFAULT 'fix',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'suggested',
  assigned_agents TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  confidence INTEGER DEFAULT 0,
  evidence JSONB DEFAULT '[]',
  blast_radius TEXT,
  rollback_plan TEXT,
  autonomy_mode TEXT NOT NULL DEFAULT 'approval_required',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_engineering_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own missions" ON public.ai_engineering_missions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_engineering_missions_ts BEFORE UPDATE ON public.ai_engineering_missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Change Plans
CREATE TABLE public.ai_change_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID REFERENCES public.ai_engineering_missions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_files TEXT[] DEFAULT '{}',
  target_surfaces TEXT[] DEFAULT '{}',
  intended_effect TEXT,
  affected_services TEXT[] DEFAULT '{}',
  confidence INTEGER DEFAULT 0,
  tests_needed TEXT[] DEFAULT '{}',
  rollback_strategy TEXT,
  deployment_scope TEXT DEFAULT 'preview',
  evidence_refs JSONB DEFAULT '[]',
  approval_required BOOLEAN DEFAULT true,
  autonomy_mode TEXT NOT NULL DEFAULT 'approval_required',
  status TEXT NOT NULL DEFAULT 'draft',
  proposed_by_agent TEXT,
  reviewed_by TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_change_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own change plans" ON public.ai_change_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_change_plans_ts BEFORE UPDATE ON public.ai_change_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Fix Proposals
CREATE TABLE public.ai_fix_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  root_cause TEXT,
  affected_area TEXT,
  proposed_patch TEXT,
  confidence INTEGER DEFAULT 0,
  test_impact TEXT,
  auto_fix_eligible BOOLEAN DEFAULT false,
  approval_needed BOOLEAN DEFAULT true,
  rollback_safety TEXT DEFAULT 'safe',
  status TEXT NOT NULL DEFAULT 'detected',
  detected_by_agent TEXT,
  error_cluster_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_fix_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own fix proposals" ON public.ai_fix_proposals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_fix_proposals_ts BEFORE UPDATE ON public.ai_fix_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Self-Healing Rules
CREATE TABLE public.ai_self_healing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  trigger_condition TEXT NOT NULL,
  action_type TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'low',
  scope_boundary TEXT,
  max_frequency TEXT DEFAULT '1/hour',
  verification_method TEXT,
  enabled BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  total_triggers INTEGER DEFAULT 0,
  total_successes INTEGER DEFAULT 0,
  total_failures INTEGER DEFAULT 0,
  downgraded_at TIMESTAMPTZ,
  downgrade_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_self_healing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own healing rules" ON public.ai_self_healing_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_self_healing_rules_ts BEFORE UPDATE ON public.ai_self_healing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Learning Patterns
CREATE TABLE public.ai_learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_description TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  frequency TEXT,
  confidence INTEGER DEFAULT 0,
  action_taken TEXT,
  impact_result TEXT,
  pattern_type TEXT NOT NULL DEFAULT 'failure',
  status TEXT NOT NULL DEFAULT 'proposed',
  first_detected_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  contributing_events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_learning_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own learning patterns" ON public.ai_learning_patterns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_learning_patterns_ts BEFORE UPDATE ON public.ai_learning_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Agent Debate Records
CREATE TABLE public.ai_agent_debate_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  consensus_score INTEGER DEFAULT 0,
  resolution TEXT,
  participants JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_agent_debate_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own debate records" ON public.ai_agent_debate_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_agent_debate_records_ts BEFORE UPDATE ON public.ai_agent_debate_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Design Diffs
CREATE TABLE public.ai_design_diffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  area TEXT,
  before_state JSONB DEFAULT '{}',
  after_state JSONB DEFAULT '{}',
  rationale TEXT,
  confidence INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  impact_level TEXT DEFAULT 'medium',
  design_tokens_used TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'proposal',
  proposed_by_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_design_diffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own design diffs" ON public.ai_design_diffs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_design_diffs_ts BEFORE UPDATE ON public.ai_design_diffs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_ai_missions_status ON public.ai_engineering_missions(status);
CREATE INDEX idx_ai_missions_user ON public.ai_engineering_missions(user_id);
CREATE INDEX idx_ai_change_plans_mission ON public.ai_change_plans(mission_id);
CREATE INDEX idx_ai_change_plans_status ON public.ai_change_plans(status);
CREATE INDEX idx_ai_fix_proposals_severity ON public.ai_fix_proposals(severity);
CREATE INDEX idx_ai_fix_proposals_status ON public.ai_fix_proposals(status);
CREATE INDEX idx_ai_healing_rules_enabled ON public.ai_self_healing_rules(enabled);
CREATE INDEX idx_ai_learning_patterns_status ON public.ai_learning_patterns(status);
CREATE INDEX idx_ai_design_diffs_status ON public.ai_design_diffs(status);