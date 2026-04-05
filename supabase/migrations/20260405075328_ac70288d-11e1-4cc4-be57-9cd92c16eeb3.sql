
-- AI Token Usage: logs every LLM call
CREATE TABLE public.ai_token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_id text NOT NULL DEFAULT 'general',
  model text NOT NULL,
  provider text DEFAULT 'google',
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  total_tokens integer GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cost_cents numeric DEFAULT 0,
  session_id text,
  domain text DEFAULT 'general',
  category text DEFAULT 'inference',
  cached boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own token usage" ON public.ai_token_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own token usage" ON public.ai_token_usage
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all token usage" ON public.ai_token_usage
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ai_token_usage_user ON public.ai_token_usage(user_id, created_at DESC);
CREATE INDEX idx_ai_token_usage_advisor ON public.ai_token_usage(advisor_id, created_at DESC);

-- User AI Budgets
CREATE TABLE public.user_ai_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period text NOT NULL DEFAULT 'monthly',
  limit_tokens integer DEFAULT 1000000,
  limit_cost_cents integer DEFAULT 5000,
  used_tokens integer DEFAULT 0,
  used_cost_cents numeric DEFAULT 0,
  auto_downgrade_model boolean DEFAULT true,
  hard_limit boolean DEFAULT false,
  reset_at timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period)
);

ALTER TABLE public.user_ai_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own budgets" ON public.user_ai_budgets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own budgets" ON public.user_ai_budgets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own budgets" ON public.user_ai_budgets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all budgets" ON public.user_ai_budgets
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Advisor Performance
CREATE TABLE public.advisor_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_id text NOT NULL,
  period text DEFAULT 'monthly',
  total_calls integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  total_cost_cents numeric DEFAULT 0,
  avg_satisfaction numeric DEFAULT 0,
  correction_count integer DEFAULT 0,
  self_learning_events integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.advisor_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own advisor perf" ON public.advisor_performance
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own advisor perf" ON public.advisor_performance
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own advisor perf" ON public.advisor_performance
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all advisor perf" ON public.advisor_performance
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_advisor_perf_user ON public.advisor_performance(user_id, advisor_id);

-- System Config
CREATE TABLE public.system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  description text,
  category text DEFAULT 'general',
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read system config" ON public.system_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage system config" ON public.system_config
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Timestamp triggers
CREATE TRIGGER update_user_ai_budgets_updated_at BEFORE UPDATE ON public.user_ai_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_performance_updated_at BEFORE UPDATE ON public.advisor_performance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
