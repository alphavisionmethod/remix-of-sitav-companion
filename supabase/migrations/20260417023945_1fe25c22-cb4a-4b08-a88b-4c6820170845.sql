
-- Backfill columns expected by scheduler-dispatch + admin pages
ALTER TABLE public.scheduled_jobs
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS target_function TEXT NOT NULL DEFAULT 'internal:noop',
  ADD COLUMN IF NOT EXISTS cron_expression TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS fail_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_retries INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS run_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_run_status TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS domain TEXT;

UPDATE public.scheduled_jobs SET cron_expression = COALESCE(cron_expression, schedule_cron) WHERE cron_expression IS NULL;
UPDATE public.scheduled_jobs SET name = COALESCE(name, display_name) WHERE name IS NULL;
UPDATE public.scheduled_jobs SET domain = COALESCE(domain, job_class) WHERE domain IS NULL;

ALTER TABLE public.job_executions
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS triggered_by TEXT NOT NULL DEFAULT 'scheduler',
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'real',
  ADD COLUMN IF NOT EXISTS policy_decision TEXT NOT NULL DEFAULT 'allowed',
  ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS retryable BOOLEAN NOT NULL DEFAULT false;
