-- Sita Phase F: Spatial & Multi-Device tables

-- 1. Handoff sessions (multi-device task handoff)
CREATE TABLE public.sita_handoff_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_device TEXT NOT NULL,
  target_device TEXT,
  intent TEXT NOT NULL,
  plan_id UUID,
  status TEXT NOT NULL DEFAULT 'offered',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 minutes')
);

CREATE INDEX idx_sita_handoff_sessions_user_status
  ON public.sita_handoff_sessions(user_id, status, created_at DESC);

ALTER TABLE public.sita_handoff_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own handoff sessions"
  ON public.sita_handoff_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own handoff sessions"
  ON public.sita_handoff_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own handoff sessions"
  ON public.sita_handoff_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own handoff sessions"
  ON public.sita_handoff_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Spatial layout (one row per user)
CREATE TABLE public.sita_spatial_layout (
  user_id UUID NOT NULL PRIMARY KEY,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sita_spatial_layout ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own spatial layout"
  ON public.sita_spatial_layout FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own spatial layout"
  ON public.sita_spatial_layout FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own spatial layout"
  ON public.sita_spatial_layout FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own spatial layout"
  ON public.sita_spatial_layout FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Spatial events (learning trail, 30-day TTL)
CREATE TABLE public.sita_spatial_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

CREATE INDEX idx_sita_spatial_events_user_created
  ON public.sita_spatial_events(user_id, created_at DESC);

CREATE INDEX idx_sita_spatial_events_expires
  ON public.sita_spatial_events(expires_at);

ALTER TABLE public.sita_spatial_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own spatial events"
  ON public.sita_spatial_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own spatial events"
  ON public.sita_spatial_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own spatial events"
  ON public.sita_spatial_events FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger for spatial layout
CREATE TRIGGER trg_sita_spatial_layout_updated_at
  BEFORE UPDATE ON public.sita_spatial_layout
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for handoff sessions
ALTER TABLE public.sita_handoff_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sita_handoff_sessions;