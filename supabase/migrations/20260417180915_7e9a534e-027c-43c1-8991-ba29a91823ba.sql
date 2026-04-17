-- ═══════════════════════════════════════════════════════════════
-- C-014: Data Retention / TTL infrastructure
-- ═══════════════════════════════════════════════════════════════

-- 1) Add expires_at to high-volume tables
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days');

ALTER TABLE public.ai_workforce_invocations
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days');

ALTER TABLE public.ai_workforce_outputs
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '180 days');

ALTER TABLE public.ai_inference_receipts
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '365 days');

ALTER TABLE public.cloud_audit_events
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '730 days');

ALTER TABLE public.error_events
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days');

ALTER TABLE public.cloud_activity_journal
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (now() + interval '180 days');

-- 2) Indexes for cleanup queries
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_workforce_invocations_expires_at ON public.ai_workforce_invocations (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_workforce_outputs_expires_at ON public.ai_workforce_outputs (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_inference_receipts_expires_at ON public.ai_inference_receipts (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cloud_audit_events_expires_at ON public.cloud_audit_events (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_error_events_expires_at ON public.error_events (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cloud_activity_journal_expires_at ON public.cloud_activity_journal (expires_at) WHERE expires_at IS NOT NULL;

-- 3) Backfill existing rows so cleanup catches legacy data on a sane schedule
UPDATE public.notifications SET expires_at = COALESCE(expires_at, created_at + interval '90 days') WHERE expires_at IS NULL;
UPDATE public.ai_workforce_invocations SET expires_at = COALESCE(expires_at, created_at + interval '90 days') WHERE expires_at IS NULL;
UPDATE public.ai_workforce_outputs SET expires_at = COALESCE(expires_at, created_at + interval '180 days') WHERE expires_at IS NULL;
UPDATE public.ai_inference_receipts SET expires_at = COALESCE(expires_at, created_at + interval '365 days') WHERE expires_at IS NULL;
UPDATE public.cloud_audit_events SET expires_at = COALESCE(expires_at, created_at + interval '730 days') WHERE expires_at IS NULL;
UPDATE public.error_events SET expires_at = COALESCE(expires_at, created_at + interval '90 days') WHERE expires_at IS NULL;
UPDATE public.cloud_activity_journal SET expires_at = COALESCE(expires_at, created_at + interval '180 days') WHERE expires_at IS NULL;

-- 4) Audit table for cleanup runs
CREATE TABLE IF NOT EXISTS public.data_retention_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  table_name TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'expires_at',
  rows_deleted INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  dry_run BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_data_retention_runs_ran_at ON public.data_retention_runs (ran_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_retention_runs_table_name ON public.data_retention_runs (table_name);

ALTER TABLE public.data_retention_runs ENABLE ROW LEVEL SECURITY;

-- Admins can view; service role bypasses RLS for inserts
DROP POLICY IF EXISTS "Admins can view data retention runs" ON public.data_retention_runs;
CREATE POLICY "Admins can view data retention runs"
ON public.data_retention_runs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Explicitly deny client writes (service role bypasses)
DROP POLICY IF EXISTS "Block client writes on retention runs" ON public.data_retention_runs;
CREATE POLICY "Block client writes on retention runs"
ON public.data_retention_runs
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);
