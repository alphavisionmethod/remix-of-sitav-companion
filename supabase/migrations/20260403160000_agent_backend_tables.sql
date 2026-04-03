-- Agent Backend Infrastructure Tables

CREATE TABLE IF NOT EXISTS public.agent_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('escalation', 'data-request', 'finding', 'alert', 'broadcast')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'expired')),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.agent_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent signals" ON public.agent_signals FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_agent_signals_to ON public.agent_signals (to_agent, status, created_at DESC);
CREATE INDEX idx_agent_signals_from ON public.agent_signals (from_agent, created_at DESC);

CREATE TABLE IF NOT EXISTS public.agent_action_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  input_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.000 CHECK (confidence >= 0 AND confidence <= 1),
  health TEXT NOT NULL DEFAULT 'healthy' CHECK (health IN ('healthy', 'degraded', 'warning', 'critical')),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  cost_tokens INTEGER NOT NULL DEFAULT 0,
  receipt_hash TEXT NOT NULL,
  parent_receipt_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_action_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own agent receipts" ON public.agent_action_receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert agent receipts" ON public.agent_action_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_agent_receipts_agent ON public.agent_action_receipts (agent_id, created_at DESC);
CREATE INDEX idx_agent_receipts_hash ON public.agent_action_receipts (receipt_hash);

CREATE TABLE IF NOT EXISTS public.agent_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  schedule_type TEXT NOT NULL DEFAULT 'daily' CHECK (schedule_type IN ('continuous', 'hourly', 'daily', 'on-event', 'disabled')),
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id)
);

ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent schedules" ON public.agent_schedules FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_agent_schedules_next ON public.agent_schedules (next_run_at, is_active) WHERE is_active = true;

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_action_receipts;
