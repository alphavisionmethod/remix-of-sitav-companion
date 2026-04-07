CREATE TABLE public.constitution_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  natural_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority INTEGER NOT NULL DEFAULT 50,
  enforcement_mode TEXT NOT NULL DEFAULT 'advisory',
  is_active BOOLEAN NOT NULL DEFAULT true,
  compiled_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.constitution_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rules"
  ON public.constitution_rules FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_constitution_rules_updated_at
  BEFORE UPDATE ON public.constitution_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();