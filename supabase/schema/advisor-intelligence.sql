-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: advisor-intelligence
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 5
-- Last generated: 2026-04-16T21:35:49.932Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260405072503_a3f7068e-413d-4a9c-a787-69d54a9a41ef.sql ──
-- Advisor Knowledge Base
CREATE TABLE public.advisor_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual',
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor knowledge"
  ON public.advisor_knowledge FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_knowledge_advisor ON public.advisor_knowledge (advisor_id, user_id);
CREATE INDEX idx_advisor_knowledge_tags ON public.advisor_knowledge USING GIN (tags);

CREATE TRIGGER update_advisor_knowledge_updated_at
  BEFORE UPDATE ON public.advisor_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Advisor Memories
CREATE TABLE public.advisor_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'summary',
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor memories"
  ON public.advisor_memories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_memories_lookup ON public.advisor_memories (advisor_id, user_id, memory_type);

-- Advisor Feedback
CREATE TABLE public.advisor_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  message_id TEXT,
  feedback_type TEXT NOT NULL DEFAULT 'rating',
  original_response TEXT,
  corrected_response TEXT,
  rating INTEGER,
  category TEXT DEFAULT 'general',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor feedback"
  ON public.advisor_feedback FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_feedback_advisor ON public.advisor_feedback (advisor_id, user_id);

-- ── 20260413031516_57ccd012-b404-455d-b0ef-8f31b019b64a.sql ──
-- Advisor Agents registry
CREATE TABLE public.advisor_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  autonomy_level INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  personality JSONB NOT NULL DEFAULT '{}'::jsonb,
  scope_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_threshold NUMERIC NOT NULL DEFAULT 0.8,
  budget_daily_tokens INTEGER NOT NULL DEFAULT 10000,
  tokens_used_today INTEGER NOT NULL DEFAULT 0,
  invocations_today INTEGER NOT NULL DEFAULT 0,
  max_invocations_per_hour INTEGER NOT NULL DEFAULT 5,
  last_observation_at TIMESTAMPTZ,
  last_action_at TIMESTAMPTZ,
  escalation_target TEXT NOT NULL DEFAULT 'human',
  mission TEXT,
  special_ability TEXT,
  maturity TEXT NOT NULL DEFAULT 'alpha',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, advisor_id)
);

ALTER TABLE public.advisor_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor_agents"
  ON public.advisor_agents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_advisor_agents_updated_at
  BEFORE UPDATE ON public.advisor_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Advisor Action Queue
CREATE TABLE public.advisor_action_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'recommend',
  domain TEXT NOT NULL DEFAULT 'general',
  summary TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'proposed',
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  receipt_hash TEXT,
  rollback_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_action_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor_action_queue"
  ON public.advisor_action_queue FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_advisor_action_queue_updated_at
  BEFORE UPDATE ON public.advisor_action_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260413121921_18c65a6d-9a87-4659-83f5-eb71eb45b96b.sql ──
-- ═══════════════════════════════════════════════════════════════
-- Advisor Knowledge, Memories, and Feedback tables
-- ═══════════════════════════════════════════════════════════════

-- 1. advisor_knowledge
CREATE TABLE public.advisor_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  confidence NUMERIC NOT NULL DEFAULT 0.8,
  source TEXT NOT NULL DEFAULT 'system',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own and system advisor_knowledge"
  ON public.advisor_knowledge FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users insert own advisor_knowledge"
  ON public.advisor_knowledge FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users update own advisor_knowledge"
  ON public.advisor_knowledge FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users delete own advisor_knowledge"
  ON public.advisor_knowledge FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

CREATE INDEX idx_advisor_knowledge_lookup ON public.advisor_knowledge (user_id, advisor_id, domain, status);

CREATE TRIGGER update_advisor_knowledge_updated_at
  BEFORE UPDATE ON public.advisor_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. advisor_memories
CREATE TABLE public.advisor_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  memory_type TEXT NOT NULL DEFAULT 'observation',
  content TEXT NOT NULL DEFAULT '',
  importance NUMERIC NOT NULL DEFAULT 0.5,
  context_ref TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor_memories"
  ON public.advisor_memories FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_memories_lookup ON public.advisor_memories (user_id, advisor_id, domain, status);

CREATE TRIGGER update_advisor_memories_updated_at
  BEFORE UPDATE ON public.advisor_memories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. advisor_feedback
CREATE TABLE public.advisor_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  feedback_type TEXT NOT NULL DEFAULT 'rating',
  rating INTEGER,
  comment TEXT,
  request_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor_feedback"
  ON public.advisor_feedback FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_feedback_lookup ON public.advisor_feedback (user_id, advisor_id, domain);

-- ── 20260413123759_f7a6573e-b000-458e-bfac-ed111a47f5f5.sql ──
CREATE TABLE public.advisor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  personality_traits JSONB DEFAULT '{}',
  visual_style TEXT DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(advisor_id, user_id)
);

ALTER TABLE public.advisor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own advisor profiles"
ON public.advisor_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advisor profiles"
ON public.advisor_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advisor profiles"
ON public.advisor_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advisor profiles"
ON public.advisor_profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_advisor_profiles_updated_at
BEFORE UPDATE ON public.advisor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260415213335_7a7d1ea1-82fa-49e4-943f-8374bac847a5.sql ──
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
