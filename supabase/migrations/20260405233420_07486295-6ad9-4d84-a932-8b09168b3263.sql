
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Cron / Scheduler / Automation Reality Tables
-- ═══════════════════════════════════════════════════════════════

-- 1. Scheduled Jobs Registry
CREATE TABLE public.scheduled_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'system',
  job_class TEXT NOT NULL DEFAULT 'maintenance',
  cron_expression TEXT NOT NULL DEFAULT '0 * * * *',
  target_function TEXT NOT NULL,
  description TEXT,
  risk_tier TEXT NOT NULL DEFAULT 'low',
  autonomy_tier TEXT NOT NULL DEFAULT 'supervised',
  state TEXT NOT NULL DEFAULT 'configured',
  policy_family TEXT,
  kill_switch_class TEXT DEFAULT 'global',
  retry_policy TEXT NOT NULL DEFAULT 'exponential',
  max_retries INTEGER NOT NULL DEFAULT 3,
  environment TEXT NOT NULL DEFAULT 'production',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  run_count INTEGER NOT NULL DEFAULT 0,
  fail_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own scheduled jobs"
  ON public.scheduled_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_scheduled_jobs_state ON public.scheduled_jobs(state);
CREATE INDEX idx_scheduled_jobs_next_run ON public.scheduled_jobs(next_run_at);
CREATE INDEX idx_scheduled_jobs_domain ON public.scheduled_jobs(domain);

-- 2. Job Executions History
CREATE TABLE public.job_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.scheduled_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  attempt_number INTEGER NOT NULL DEFAULT 1,
  output JSONB,
  error_message TEXT,
  error_class TEXT,
  duration_ms INTEGER,
  policy_decision TEXT DEFAULT 'allowed',
  verification_result TEXT,
  triggered_by TEXT NOT NULL DEFAULT 'scheduler',
  mode TEXT NOT NULL DEFAULT 'real',
  retryable BOOLEAN DEFAULT false,
  escalated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own job executions"
  ON public.job_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create their own job executions"
  ON public.job_executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_job_executions_job ON public.job_executions(job_id);
CREATE INDEX idx_job_executions_status ON public.job_executions(status);
CREATE INDEX idx_job_executions_started ON public.job_executions(started_at DESC);

-- 3. Automation Kill Switches
CREATE TABLE public.automation_kill_switches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global',
  scope_id TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  activated_by TEXT DEFAULT 'operator',
  activated_at TIMESTAMPTZ DEFAULT now(),
  deactivated_at TIMESTAMPTZ,
  deactivated_by TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_kill_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own kill switches"
  ON public.automation_kill_switches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_kill_switches_scope ON public.automation_kill_switches(scope, scope_id);

-- Timestamp triggers
CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kill_switches_updated_at
  BEFORE UPDATE ON public.automation_kill_switches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
