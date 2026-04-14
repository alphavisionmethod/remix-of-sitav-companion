CREATE TABLE public.crm_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  delay_minutes INTEGER DEFAULT 0,
  trust_gate TEXT NOT NULL DEFAULT 'suggested',
  status TEXT NOT NULL DEFAULT 'draft',
  target_entity TEXT NOT NULL DEFAULT 'contact',
  runs INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  execution_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own crm_automations"
  ON public.crm_automations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_crm_automations_updated_at
  BEFORE UPDATE ON public.crm_automations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();