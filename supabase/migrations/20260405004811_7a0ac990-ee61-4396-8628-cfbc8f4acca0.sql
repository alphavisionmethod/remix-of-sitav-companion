
-- Phase 1: Admin Durability Tables

-- 1. policy_versions table
CREATE TABLE public.policy_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  diff_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  changed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own policy versions"
  ON public.policy_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own policy versions"
  ON public.policy_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_policy_versions_policy_id ON public.policy_versions(policy_id);

-- 2. connector_sync_history table
CREATE TABLE public.connector_sync_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connector_id UUID NOT NULL REFERENCES public.connector_configs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  records_synced INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sync history"
  ON public.connector_sync_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sync history"
  ON public.connector_sync_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_connector_sync_history_connector ON public.connector_sync_history(connector_id);

-- 3. operator_actions table (append-only)
CREATE TABLE public.operator_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own operator actions"
  ON public.operator_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own operator actions"
  ON public.operator_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_operator_actions_user ON public.operator_actions(user_id, created_at DESC);

-- 4. Add columns to proof_records (if not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'proof_records' AND column_name = 'parent_proof_id'
  ) THEN
    ALTER TABLE public.proof_records ADD COLUMN parent_proof_id UUID REFERENCES public.proof_records(id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proof_records_correlation ON public.proof_records(correlation_id);
CREATE INDEX IF NOT EXISTS idx_proof_records_parent ON public.proof_records(parent_proof_id);
