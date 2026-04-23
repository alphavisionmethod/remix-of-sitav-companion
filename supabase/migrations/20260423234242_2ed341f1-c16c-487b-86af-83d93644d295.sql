-- Phase E — Sita Agent
CREATE TABLE IF NOT EXISTS public.sita_agent_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  org_id       uuid NULL,
  intent       text NOT NULL,
  domain       text NOT NULL DEFAULT 'business',
  plan         jsonb NOT NULL DEFAULT '{}'::jsonb,
  status       text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','executing','completed','failed','cancelled')),
  autonomy_tier int NOT NULL DEFAULT 1 CHECK (autonomy_tier BETWEEN 0 AND 4),
  result       jsonb NULL,
  error        text NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  approved_at  timestamptz NULL,
  completed_at timestamptz NULL,
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '90 days')
);

CREATE INDEX IF NOT EXISTS idx_sita_agent_plans_user
  ON public.sita_agent_plans (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sita_agent_plans_status
  ON public.sita_agent_plans (user_id, status);

ALTER TABLE public.sita_agent_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sita_agent_plans_select_own"
  ON public.sita_agent_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sita_agent_plans_insert_own"
  ON public.sita_agent_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sita_agent_plans_update_own"
  ON public.sita_agent_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sita_agent_plans_delete_own"
  ON public.sita_agent_plans FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.sita_autonomy_preferences (
  user_id    uuid PRIMARY KEY,
  tiers      jsonb NOT NULL DEFAULT '{"business":1,"finance":1,"concierge":1}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sita_autonomy_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sita_autonomy_select_own"
  ON public.sita_autonomy_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sita_autonomy_insert_own"
  ON public.sita_autonomy_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sita_autonomy_update_own"
  ON public.sita_autonomy_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sita_autonomy_delete_own"
  ON public.sita_autonomy_preferences FOR DELETE USING (auth.uid() = user_id);
