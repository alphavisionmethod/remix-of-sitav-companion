-- Phase G — Sita Cognitive Cortex
-- 6 new tables: world_state, missions, mission_milestones, council_votes, app_open_log, journal_entries

-- 1. World State (one row per user, rolling snapshot)
CREATE TABLE public.sita_world_state (
  user_id UUID PRIMARY KEY,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_world_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_world_state_select" ON public.sita_world_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_own_world_state_insert" ON public.sita_world_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_own_world_state_update" ON public.sita_world_state FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_own_world_state_delete" ON public.sita_world_state FOR DELETE USING (auth.uid() = user_id);

-- 2. Missions
CREATE TABLE public.sita_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL DEFAULT 'general',
  success_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  priority INTEGER NOT NULL DEFAULT 3,
  target_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_missions_all" ON public.sita_missions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sita_missions_user_status ON public.sita_missions(user_id, status);

-- 3. Mission Milestones
CREATE TABLE public.sita_mission_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.sita_missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_at TIMESTAMPTZ,
  plan_id UUID,
  ordering INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_mission_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_milestones_all" ON public.sita_mission_milestones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sita_milestones_mission ON public.sita_mission_milestones(mission_id);

-- 4. Council Votes (pre-execution scoring per advisor)
CREATE TABLE public.sita_council_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  score NUMERIC(4,2) NOT NULL DEFAULT 0,
  vote TEXT NOT NULL DEFAULT 'abstain',
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_council_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_votes_all" ON public.sita_council_votes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sita_votes_plan ON public.sita_council_votes(plan_id);

-- 5. App Open Log (Markov input)
CREATE TABLE public.sita_app_open_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);
ALTER TABLE public.sita_app_open_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_app_log_all" ON public.sita_app_open_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sita_app_log_user_time ON public.sita_app_open_log(user_id, opened_at DESC);

-- 6. Journal Entries
CREATE TABLE public.sita_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  lessons JSONB NOT NULL DEFAULT '[]'::jsonb,
  wins JSONB NOT NULL DEFAULT '[]'::jsonb,
  blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);
ALTER TABLE public.sita_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_journal_all" ON public.sita_journal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sita_journal_user_date ON public.sita_journal_entries(user_id, entry_date DESC);

-- Updated-at trigger reuse
CREATE TRIGGER trg_sita_world_state_updated BEFORE UPDATE ON public.sita_world_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sita_missions_updated BEFORE UPDATE ON public.sita_missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sita_milestones_updated BEFORE UPDATE ON public.sita_mission_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();