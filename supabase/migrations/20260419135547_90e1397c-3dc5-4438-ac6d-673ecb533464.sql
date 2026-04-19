-- Hardware certification runs: durable evidence of real-device validation
CREATE TABLE public.hardware_certification_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  device_class TEXT NOT NULL,
  device_model TEXT,
  firmware TEXT,
  secure_boot_pass BOOLEAN NOT NULL DEFAULT false,
  tpm_pass BOOLEAN NOT NULL DEFAULT false,
  dm_verity_pass BOOLEAN NOT NULL DEFAULT false,
  ab_rollback_pass BOOLEAN NOT NULL DEFAULT false,
  recovery_pass BOOLEAN NOT NULL DEFAULT false,
  overall_pass BOOLEAN NOT NULL DEFAULT false,
  attestation_quote_b64 TEXT,
  log_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  runner_id UUID,
  run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_hwcr_device_class ON public.hardware_certification_runs(device_class);
CREATE INDEX idx_hwcr_run_at ON public.hardware_certification_runs(run_at DESC);

ALTER TABLE public.hardware_certification_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view hardware certification runs"
ON public.hardware_certification_runs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert hardware certification runs"
ON public.hardware_certification_runs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hardware certification runs"
ON public.hardware_certification_runs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_hwcr_updated_at
BEFORE UPDATE ON public.hardware_certification_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Operator drill executions: durable evidence of real human-use drills
CREATE TABLE public.operator_drill_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drill_id TEXT NOT NULL,
  scenario TEXT NOT NULL,
  scenario_category TEXT NOT NULL DEFAULT 'general',
  operator_id UUID,
  operator_label TEXT,
  mttd_seconds INTEGER,
  mttr_seconds INTEGER,
  detect_pass BOOLEAN NOT NULL DEFAULT false,
  select_runbook_pass BOOLEAN NOT NULL DEFAULT false,
  kill_switch_pass BOOLEAN NOT NULL DEFAULT false,
  evidence_pass BOOLEAN NOT NULL DEFAULT false,
  rollback_pass BOOLEAN NOT NULL DEFAULT false,
  confirm_pass BOOLEAN NOT NULL DEFAULT false,
  overall_pass BOOLEAN NOT NULL DEFAULT false,
  friction_notes TEXT,
  runbook_id TEXT,
  kill_switch_id TEXT,
  signoff_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ode_scenario ON public.operator_drill_executions(scenario);
CREATE INDEX idx_ode_executed_at ON public.operator_drill_executions(executed_at DESC);
CREATE INDEX idx_ode_runbook ON public.operator_drill_executions(runbook_id) WHERE runbook_id IS NOT NULL;
CREATE INDEX idx_ode_kill_switch ON public.operator_drill_executions(kill_switch_id) WHERE kill_switch_id IS NOT NULL;

ALTER TABLE public.operator_drill_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view operator drill executions"
ON public.operator_drill_executions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert operator drill executions"
ON public.operator_drill_executions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update operator drill executions"
ON public.operator_drill_executions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ode_updated_at
BEFORE UPDATE ON public.operator_drill_executions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live AI Engineer hub updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.hardware_certification_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.operator_drill_executions;