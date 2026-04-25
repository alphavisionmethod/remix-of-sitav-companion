-- Phase 8: Standing Missions — persistent advisor mandates

CREATE TABLE public.advisor_standing_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  trigger_kind TEXT NOT NULL DEFAULT 'interval', -- 'interval' | 'signal' | 'composite'
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- examples:
  --   interval: { "every_minutes": 1440 }
  --   signal:   { "signal_kind": "cash.runway_dip", "min_severity": "medium" }
  --   composite:{ "every_minutes": 360, "signal_kind": "inbox.spike" }
  emit_signal_kind TEXT NOT NULL,
  emit_severity TEXT NOT NULL DEFAULT 'medium',
  emit_summary_template TEXT NOT NULL DEFAULT 'Standing mission triggered',
  paused BOOLEAN NOT NULL DEFAULT false,
  paused_reason TEXT,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER NOT NULL DEFAULT 0,
  fire_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT advisor_standing_missions_trigger_kind_chk
    CHECK (trigger_kind IN ('interval', 'signal', 'composite')),
  CONSTRAINT advisor_standing_missions_severity_chk
    CHECK (emit_severity IN ('info','low','medium','high','critical'))
);

CREATE INDEX idx_advisor_standing_missions_user
  ON public.advisor_standing_missions (user_id, paused, next_run_at);
CREATE INDEX idx_advisor_standing_missions_advisor
  ON public.advisor_standing_missions (advisor_id);

ALTER TABLE public.advisor_standing_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own missions"
  ON public.advisor_standing_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all missions"
  ON public.advisor_standing_missions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners create own missions"
  ON public.advisor_standing_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners update own missions"
  ON public.advisor_standing_missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners delete own missions"
  ON public.advisor_standing_missions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_advisor_standing_missions_updated_at
  BEFORE UPDATE ON public.advisor_standing_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Run log
CREATE TABLE public.advisor_mission_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.advisor_standing_missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fired BOOLEAN NOT NULL DEFAULT false,
  decision_reason TEXT NOT NULL DEFAULT '',
  emitted_signal_id UUID,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '60 days')
);

CREATE INDEX idx_advisor_mission_runs_mission
  ON public.advisor_mission_runs (mission_id, ran_at DESC);
CREATE INDEX idx_advisor_mission_runs_user
  ON public.advisor_mission_runs (user_id, ran_at DESC);

ALTER TABLE public.advisor_mission_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own mission runs"
  ON public.advisor_mission_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all mission runs"
  ON public.advisor_mission_runs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners insert own mission runs"
  ON public.advisor_mission_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);