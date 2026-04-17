
-- ═══════════════════════════════════════════════════════════════
-- PHASE 23 — WORKFLOW & AUTOMATION REALITY CLOSURE
-- ═══════════════════════════════════════════════════════════════

-- 1. workflows
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'system',
  version INTEGER NOT NULL DEFAULT 1,
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  policy_family TEXT,
  kill_switch_class TEXT,
  retry_policy JSONB NOT NULL DEFAULT '{"maxRetries":3,"backoffMs":1000,"backoffMultiplier":2}'::jsonb,
  approval_required BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_workflows_user ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_enabled ON public.workflows(enabled) WHERE enabled = true;

CREATE POLICY "wf_select_own" ON public.workflows FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "wf_insert_own" ON public.workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wf_update_own" ON public.workflows FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "wf_delete_own" ON public.workflows FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. workflow_runs
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  current_step INTEGER NOT NULL DEFAULT 0,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_progress_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_retry_at TIMESTAMPTZ,
  error TEXT,
  force_terminated_by UUID,
  replayed_from UUID REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workflow_runs_status_chk CHECK (status IN ('pending','running','paused','awaiting-approval','completed','failed','cancelled','stuck'))
);
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_runs_user ON public.workflow_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_workflow ON public.workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON public.workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_progress ON public.workflow_runs(last_progress_at) WHERE status = 'running';

CREATE POLICY "wfr_select_own" ON public.workflow_runs FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "wfr_insert_own" ON public.workflow_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wfr_update_own" ON public.workflow_runs FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "wfr_delete_admin" ON public.workflow_runs FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER workflow_runs_updated_at BEFORE UPDATE ON public.workflow_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. workflow_steps
CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  step_id TEXT NOT NULL,
  step_type TEXT NOT NULL DEFAULT 'action',
  status TEXT NOT NULL DEFAULT 'pending',
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  retries INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  receipt_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_steps_run ON public.workflow_steps(run_id);
CREATE INDEX IF NOT EXISTS idx_steps_user ON public.workflow_steps(user_id);

CREATE POLICY "wfs_select_own" ON public.workflow_steps FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "wfs_insert_own" ON public.workflow_steps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wfs_update_own" ON public.workflow_steps FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER workflow_steps_updated_at BEFORE UPDATE ON public.workflow_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. workflow_state_transitions (append-only)
CREATE TABLE IF NOT EXISTS public.workflow_state_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  reason TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  ts TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_state_transitions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_transitions_run ON public.workflow_state_transitions(run_id);

CREATE POLICY "wft_select_own" ON public.workflow_state_transitions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "wft_insert_own" ON public.workflow_state_transitions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. workflow_receipts (append-only)
CREATE TABLE IF NOT EXISTS public.workflow_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  hash TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_receipts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_receipts_run ON public.workflow_receipts(run_id);

CREATE POLICY "wfrcpt_select_own" ON public.workflow_receipts FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "wfrcpt_insert_own" ON public.workflow_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. scheduled_jobs
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  schedule_cron TEXT NOT NULL,
  job_class TEXT NOT NULL DEFAULT 'system',
  policy_family TEXT,
  kill_switch_class TEXT,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sched_user ON public.scheduled_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_sched_next_run ON public.scheduled_jobs(next_run_at) WHERE enabled = true;

CREATE POLICY "sj_select_own" ON public.scheduled_jobs FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "sj_insert_own" ON public.scheduled_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sj_update_own" ON public.scheduled_jobs FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "sj_delete_own" ON public.scheduled_jobs FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER scheduled_jobs_updated_at BEFORE UPDATE ON public.scheduled_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. job_executions
CREATE TABLE IF NOT EXISTS public.job_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.scheduled_jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  retries INTEGER NOT NULL DEFAULT 0,
  output JSONB,
  error TEXT,
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_executions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_jobexec_job ON public.job_executions(job_id);
CREATE INDEX IF NOT EXISTS idx_jobexec_user ON public.job_executions(user_id);

CREATE POLICY "je_select_own" ON public.job_executions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "je_insert_own" ON public.job_executions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "je_update_own" ON public.job_executions FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- 8. automation_kill_switches
CREATE TABLE IF NOT EXISTS public.automation_kill_switches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global',
  scope_id TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  activated_by UUID,
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT aks_scope_chk CHECK (scope IN ('global','domain','job_class','workflow_id'))
);
ALTER TABLE public.automation_kill_switches ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_aks_user ON public.automation_kill_switches(user_id);
CREATE INDEX IF NOT EXISTS idx_aks_enabled ON public.automation_kill_switches(enabled) WHERE enabled = true;

CREATE POLICY "aks_select_own" ON public.automation_kill_switches FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "aks_insert_own" ON public.automation_kill_switches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "aks_update_own" ON public.automation_kill_switches FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "aks_delete_admin" ON public.automation_kill_switches FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER automation_kill_switches_updated_at BEFORE UPDATE ON public.automation_kill_switches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
