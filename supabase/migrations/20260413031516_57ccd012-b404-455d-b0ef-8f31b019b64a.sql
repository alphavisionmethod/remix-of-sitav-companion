
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
