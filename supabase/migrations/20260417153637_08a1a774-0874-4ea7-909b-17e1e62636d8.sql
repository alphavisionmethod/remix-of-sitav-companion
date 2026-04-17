
-- Flagship Loop Completion Receipts: durable proof that an end-to-end user journey actually happened.
-- One row per (user, loop_key, traversal). Used by FL01/FL02/FL03 admin boards and the Launch Honesty gate.

CREATE TABLE IF NOT EXISTS public.flagship_loop_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  loop_key TEXT NOT NULL,
  step_key TEXT NOT NULL,                -- e.g. 'sign_in', 'pulse_view', 'file_upload', 'ai_classify', 'boardroom_summary', 'sync_run', 'approval_decision'
  outcome TEXT NOT NULL DEFAULT 'success', -- 'success' | 'failure' | 'partial'
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb, -- correlation refs (file_id, approval_id, session_id, etc)
  latency_ms INTEGER,
  emitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flc_user_loop ON public.flagship_loop_completions (user_id, loop_key, emitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_flc_loop_recent ON public.flagship_loop_completions (loop_key, emitted_at DESC);

ALTER TABLE public.flagship_loop_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own loop completions" ON public.flagship_loop_completions;
CREATE POLICY "Users view own loop completions"
  ON public.flagship_loop_completions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users emit own loop completions" ON public.flagship_loop_completions;
CREATE POLICY "Users emit own loop completions"
  ON public.flagship_loop_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all loop completions" ON public.flagship_loop_completions;
CREATE POLICY "Admins view all loop completions"
  ON public.flagship_loop_completions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
