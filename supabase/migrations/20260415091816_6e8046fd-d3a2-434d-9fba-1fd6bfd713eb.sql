
-- Create founder_directives table
CREATE TABLE public.founder_directives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intent_text TEXT NOT NULL,
  domain_classification TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  decomposed_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  task_graph JSONB NOT NULL DEFAULT '{}'::jsonb,
  execution_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  outcome_summary TEXT,
  risk_assessment JSONB NOT NULL DEFAULT '{}'::jsonb,
  agent_assignments JSONB NOT NULL DEFAULT '[]'::jsonb,
  approvals_required BOOLEAN NOT NULL DEFAULT false,
  approvals_received JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_directives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own directives"
  ON public.founder_directives FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own directives"
  ON public.founder_directives FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own directives"
  ON public.founder_directives FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own directives"
  ON public.founder_directives FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_founder_directives_updated_at
  BEFORE UPDATE ON public.founder_directives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create platform_runbooks table
CREATE TABLE public.platform_runbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT 'ops',
  severity TEXT NOT NULL DEFAULT 'medium',
  trigger_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  agent_assignments JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_heal_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_heal_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  last_execution_result JSONB,
  incident_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_runbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own runbooks"
  ON public.platform_runbooks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own runbooks"
  ON public.platform_runbooks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own runbooks"
  ON public.platform_runbooks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own runbooks"
  ON public.platform_runbooks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_platform_runbooks_updated_at
  BEFORE UPDATE ON public.platform_runbooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_founder_directives_user_status ON public.founder_directives(user_id, status);
CREATE INDEX idx_founder_directives_domain ON public.founder_directives(domain_classification);
CREATE INDEX idx_platform_runbooks_user_domain ON public.platform_runbooks(user_id, domain);
CREATE INDEX idx_platform_runbooks_tags ON public.platform_runbooks USING GIN(tags);
