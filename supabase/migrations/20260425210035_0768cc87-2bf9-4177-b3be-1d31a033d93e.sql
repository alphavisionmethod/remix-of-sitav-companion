CREATE TABLE public.autopilot_configs (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_onboarded boolean NOT NULL DEFAULT false,
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.autopilot_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own autopilot config"
  ON public.autopilot_configs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own autopilot config"
  ON public.autopilot_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own autopilot config"
  ON public.autopilot_configs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users delete own autopilot config"
  ON public.autopilot_configs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_autopilot_configs_updated_at
  BEFORE UPDATE ON public.autopilot_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();