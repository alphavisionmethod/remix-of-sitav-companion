
-- Workflow Steps
CREATE TABLE public.workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  run_id uuid REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_index integer DEFAULT 0,
  action_type text NOT NULL DEFAULT 'execute',
  status text DEFAULT 'pending',
  input jsonb DEFAULT '{}'::jsonb,
  output jsonb DEFAULT '{}'::jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own steps" ON public.workflow_steps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Financial Documents
CREATE TABLE public.financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  filename text NOT NULL,
  category text DEFAULT 'general',
  sensitivity text DEFAULT 'internal',
  status text DEFAULT 'uploaded',
  file_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own fin docs" ON public.financial_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_financial_documents_updated_at BEFORE UPDATE ON public.financial_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
