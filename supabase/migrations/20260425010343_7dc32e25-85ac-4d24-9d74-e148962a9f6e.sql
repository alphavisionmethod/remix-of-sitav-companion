-- ═══════════════════════════════════════════════════════════════
-- Phase 1 — OS-state sensor bus
-- ═══════════════════════════════════════════════════════════════

-- 1) Signal bus table
CREATE TABLE public.os_state_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_kind TEXT NOT NULL,            -- e.g. cash.runway_dip, inbox.spike, calendar.conflict, ops.anomaly
  source TEXT NOT NULL DEFAULT 'system',-- which subsystem emitted (cash-monitor, inbox-watcher, ...)
  severity TEXT NOT NULL DEFAULT 'info',-- info | low | medium | high | critical
  summary TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  suggested_advisor_ids JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of advisor_id strings
  suggested_action_class TEXT,
  acted_on BOOLEAN NOT NULL DEFAULT false,
  acted_on_at TIMESTAMPTZ,
  acted_on_by_advisor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

CREATE INDEX idx_os_state_signals_user_kind_created
  ON public.os_state_signals (user_id, signal_kind, created_at DESC);
CREATE INDEX idx_os_state_signals_user_unacted
  ON public.os_state_signals (user_id, created_at DESC) WHERE acted_on = false;
CREATE INDEX idx_os_state_signals_expires
  ON public.os_state_signals (expires_at);

ALTER TABLE public.os_state_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own signals"
  ON public.os_state_signals FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "users insert own signals"
  ON public.os_state_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own signals"
  ON public.os_state_signals FOR UPDATE
  USING (auth.uid() = user_id);

-- Validation trigger: severity must be one of the allowed values
CREATE OR REPLACE FUNCTION public.validate_os_signal_severity()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.severity NOT IN ('info','low','medium','high','critical') THEN
    RAISE EXCEPTION 'invalid severity: %', NEW.severity USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER os_state_signals_validate_severity
  BEFORE INSERT OR UPDATE ON public.os_state_signals
  FOR EACH ROW EXECUTE FUNCTION public.validate_os_signal_severity();

-- 2) Subscriptions: which advisor wants which signal kind
CREATE TABLE public.os_state_signal_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  signal_kind TEXT NOT NULL,
  min_severity TEXT NOT NULL DEFAULT 'low',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, advisor_id, signal_kind)
);

ALTER TABLE public.os_state_signal_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own signal subs"
  ON public.os_state_signal_subscriptions FOR ALL
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER os_state_signal_subs_updated_at
  BEFORE UPDATE ON public.os_state_signal_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) Per-advisor runtime state machine
CREATE TABLE public.advisor_autonomy_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  current_state TEXT NOT NULL DEFAULT 'idle',
  -- allowed: idle | observing | proposing | awaiting_approval | executing | cooling_down | circuit_open
  last_signal_id UUID,
  last_action_id UUID,
  last_state_change_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consecutive_failures INT NOT NULL DEFAULT 0,
  consecutive_successes INT NOT NULL DEFAULT 0,
  circuit_open_until TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, advisor_id)
);

ALTER TABLE public.advisor_autonomy_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own autonomy state"
  ON public.advisor_autonomy_state FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- Insert allowed for the user (so a hook can lazily create the row)
CREATE POLICY "users insert own autonomy state"
  ON public.advisor_autonomy_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update only by admins/system; the controller edge fn will use service role
CREATE POLICY "admin updates autonomy state"
  ON public.advisor_autonomy_state FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Validation: state machine values
CREATE OR REPLACE FUNCTION public.validate_advisor_autonomy_state()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.current_state NOT IN
    ('idle','observing','proposing','awaiting_approval','executing','cooling_down','circuit_open') THEN
    RAISE EXCEPTION 'invalid autonomy state: %', NEW.current_state USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER advisor_autonomy_state_validate
  BEFORE INSERT OR UPDATE ON public.advisor_autonomy_state
  FOR EACH ROW EXECUTE FUNCTION public.validate_advisor_autonomy_state();

CREATE TRIGGER advisor_autonomy_state_updated_at
  BEFORE UPDATE ON public.advisor_autonomy_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_advisor_autonomy_state_user_advisor
  ON public.advisor_autonomy_state (user_id, advisor_id);
CREATE INDEX idx_advisor_autonomy_state_circuit
  ON public.advisor_autonomy_state (user_id) WHERE current_state = 'circuit_open';