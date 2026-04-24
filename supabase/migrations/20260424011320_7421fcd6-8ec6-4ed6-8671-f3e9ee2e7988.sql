-- Phase J: Continuum Layer
-- Episodes: bounded "focus sessions" with summary
CREATE TABLE IF NOT EXISTS public.sita_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  primary_surface TEXT,
  intent_summary TEXT,
  signals_count INTEGER NOT NULL DEFAULT 0,
  energy_score NUMERIC NOT NULL DEFAULT 0.5,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sita_episodes_user_started ON public.sita_episodes (user_id, started_at DESC);

ALTER TABLE public.sita_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own episodes" ON public.sita_episodes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own episodes" ON public.sita_episodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own episodes" ON public.sita_episodes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own episodes" ON public.sita_episodes
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_sita_episodes_updated
  BEFORE UPDATE ON public.sita_episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Affect events: micro-feedback (thumbs, dismissals, replays)
CREATE TABLE IF NOT EXISTS public.sita_affect_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal TEXT NOT NULL,           -- 'thumbs_up' | 'thumbs_down' | 'dismiss' | 'replay' | 'correct' | 'accept' | 'reject'
  target_kind TEXT NOT NULL,      -- 'whisper' | 'briefing' | 'agent_plan' | 'voice_reply' | 'persona' | 'knowledge_node'
  target_ref TEXT,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days')
);

CREATE INDEX IF NOT EXISTS idx_sita_affect_user_created ON public.sita_affect_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sita_affect_target ON public.sita_affect_events (target_kind, target_ref);

ALTER TABLE public.sita_affect_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own affect" ON public.sita_affect_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own affect" ON public.sita_affect_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own affect" ON public.sita_affect_events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own affect" ON public.sita_affect_events
  FOR DELETE USING (auth.uid() = user_id);