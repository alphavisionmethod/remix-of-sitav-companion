
-- CI Runs
CREATE TABLE public.ci_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  branch TEXT,
  commit_sha TEXT,
  trigger_type TEXT DEFAULT 'push',
  status TEXT DEFAULT 'pending',
  environment TEXT DEFAULT 'ci',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  summary JSONB DEFAULT '{}',
  artifact_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ci_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci_runs_select" ON public.ci_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ci_runs_insert" ON public.ci_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- CI Jobs
CREATE TABLE public.ci_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ci_run_id UUID REFERENCES public.ci_runs(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  duration_ms INTEGER,
  exit_code INTEGER,
  log_excerpt TEXT,
  artifact_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ci_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci_jobs_select" ON public.ci_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ci_jobs_insert" ON public.ci_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- E2E Journeys
CREATE TABLE public.e2e_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT DEFAULT 'core',
  criticality TEXT DEFAULT 'p0',
  mode TEXT DEFAULT 'real',
  route_family TEXT,
  feature_id TEXT,
  description TEXT,
  steps_count INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.e2e_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "e2e_journeys_select" ON public.e2e_journeys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "e2e_journeys_insert" ON public.e2e_journeys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- E2E Runs
CREATE TABLE public.e2e_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id UUID REFERENCES public.e2e_journeys(id) ON DELETE SET NULL,
  ci_run_id UUID REFERENCES public.ci_runs(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  environment TEXT DEFAULT 'ci',
  duration_ms INTEGER,
  steps_passed INTEGER DEFAULT 0,
  steps_failed INTEGER DEFAULT 0,
  screenshot_urls JSONB DEFAULT '[]',
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.e2e_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "e2e_runs_select" ON public.e2e_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "e2e_runs_insert" ON public.e2e_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- E2E Steps
CREATE TABLE public.e2e_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  e2e_run_id UUID REFERENCES public.e2e_runs(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  action TEXT NOT NULL,
  selector TEXT,
  expected_outcome TEXT,
  actual_outcome TEXT,
  status TEXT DEFAULT 'pending',
  duration_ms INTEGER,
  screenshot_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.e2e_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "e2e_steps_select" ON public.e2e_steps FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "e2e_steps_insert" ON public.e2e_steps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Runtime Probes
CREATE TABLE public.runtime_probes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  probe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_system TEXT NOT NULL,
  environment TEXT DEFAULT 'production',
  cadence_seconds INTEGER DEFAULT 300,
  severity TEXT DEFAULT 'high',
  launch_impact TEXT DEFAULT 'blocks',
  owner TEXT,
  success_criteria TEXT,
  failure_criteria TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.runtime_probes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runtime_probes_select" ON public.runtime_probes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "runtime_probes_insert" ON public.runtime_probes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Runtime Probe Runs
CREATE TABLE public.runtime_probe_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  probe_id UUID REFERENCES public.runtime_probes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pass',
  latency_ms INTEGER,
  response_snapshot JSONB,
  error_message TEXT,
  trace_id TEXT,
  environment TEXT DEFAULT 'production',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.runtime_probe_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runtime_probe_runs_select" ON public.runtime_probe_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "runtime_probe_runs_insert" ON public.runtime_probe_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Launch Gates
CREATE TABLE public.launch_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'default',
  state TEXT DEFAULT 'blocked',
  blockers_count INTEGER DEFAULT 0,
  criteria_met INTEGER DEFAULT 0,
  criteria_total INTEGER DEFAULT 0,
  truth_threshold NUMERIC DEFAULT 0.8,
  current_truth_score NUMERIC DEFAULT 0,
  environment TEXT DEFAULT 'production',
  last_evaluated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "launch_gates_select" ON public.launch_gates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "launch_gates_insert" ON public.launch_gates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Launch Gate Criteria
CREATE TABLE public.launch_gate_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gate_id UUID REFERENCES public.launch_gates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'not_met',
  evidence_refs JSONB DEFAULT '[]',
  last_checked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_gate_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "launch_gate_criteria_select" ON public.launch_gate_criteria FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "launch_gate_criteria_insert" ON public.launch_gate_criteria FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Launch Blockers
CREATE TABLE public.launch_blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gate_id UUID REFERENCES public.launch_gates(id) ON DELETE CASCADE,
  severity TEXT DEFAULT 'critical',
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_blockers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "launch_blockers_select" ON public.launch_blockers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "launch_blockers_insert" ON public.launch_blockers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Route Truth Records
CREATE TABLE public.route_truth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  route TEXT NOT NULL,
  journey_id TEXT,
  interaction_type TEXT DEFAULT 'page_load',
  status TEXT DEFAULT 'pass',
  provider_mode TEXT DEFAULT 'real',
  latency_ms INTEGER,
  diagnostics JSONB DEFAULT '{}',
  failure_notes TEXT,
  environment TEXT DEFAULT 'production',
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.route_truth_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "route_truth_select" ON public.route_truth_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "route_truth_insert" ON public.route_truth_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Behavioral Regressions
CREATE TABLE public.behavioral_regressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id TEXT,
  route TEXT,
  domain TEXT,
  severity TEXT DEFAULT 'high',
  regression_type TEXT DEFAULT 'new_failure',
  description TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  occurrence_count INTEGER DEFAULT 1,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  linked_commit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.behavioral_regressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regressions_select" ON public.behavioral_regressions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "regressions_insert" ON public.behavioral_regressions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ci_runs_status ON public.ci_runs(status);
CREATE INDEX idx_ci_jobs_run ON public.ci_jobs(ci_run_id);
CREATE INDEX idx_e2e_runs_journey ON public.e2e_runs(journey_id);
CREATE INDEX idx_e2e_steps_run ON public.e2e_steps(e2e_run_id);
CREATE INDEX idx_probe_runs_probe ON public.runtime_probe_runs(probe_id);
CREATE INDEX idx_launch_blockers_gate ON public.launch_blockers(gate_id);
CREATE INDEX idx_route_truth_route ON public.route_truth_records(route);
CREATE INDEX idx_regressions_resolved ON public.behavioral_regressions(resolved);
