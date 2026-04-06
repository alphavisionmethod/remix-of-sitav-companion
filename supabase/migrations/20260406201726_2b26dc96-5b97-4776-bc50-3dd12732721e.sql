
-- ═══════════════════════════════════════════════════════
-- SITA OS — Behavioral Truth Verification System Tables
-- ═══════════════════════════════════════════════════════

-- Surface Inventory: every route, button, form, action
CREATE TABLE public.verification_surfaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_key TEXT NOT NULL,
  route_path TEXT NOT NULL,
  shell TEXT NOT NULL DEFAULT 'user',
  surface_class TEXT NOT NULL DEFAULT 'page',
  domain TEXT,
  component_name TEXT,
  action_type TEXT NOT NULL DEFAULT 'navigation',
  action_label TEXT,
  action_selector TEXT,
  expected_result TEXT,
  backend_dependency TEXT,
  supported_modes TEXT[] NOT NULL DEFAULT '{real,demo}',
  launch_honesty_class TEXT NOT NULL DEFAULT 'real',
  test_priority TEXT NOT NULL DEFAULT 'P2',
  owner TEXT,
  verification_status TEXT NOT NULL DEFAULT 'untested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_surfaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own surfaces" ON public.verification_surfaces FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_vs_route ON public.verification_surfaces(route_key);
CREATE INDEX idx_vs_priority ON public.verification_surfaces(test_priority);
CREATE INDEX idx_vs_status ON public.verification_surfaces(verification_status);

CREATE TRIGGER update_verification_surfaces_updated_at BEFORE UPDATE ON public.verification_surfaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verification Runs: each test execution
CREATE TABLE public.verification_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface_id UUID REFERENCES public.verification_surfaces(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL DEFAULT 'manual',
  mode TEXT NOT NULL DEFAULT 'real',
  environment TEXT NOT NULL DEFAULT 'preview',
  passed BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  duration_ms INTEGER,
  evidence_refs JSONB DEFAULT '[]'::jsonb,
  launched_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own runs" ON public.verification_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_vr_surface ON public.verification_runs(surface_id);
CREATE INDEX idx_vr_passed ON public.verification_runs(passed);
CREATE INDEX idx_vr_created ON public.verification_runs(created_at DESC);

-- Verification Evidence: screenshots, logs, traces
CREATE TABLE public.verification_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.verification_runs(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL DEFAULT 'log',
  content TEXT,
  file_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own evidence" ON public.verification_evidence FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ve_run ON public.verification_evidence(run_id);

-- Verification Blockers: launch blockers from failures
CREATE TABLE public.verification_blockers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface_id UUID REFERENCES public.verification_surfaces(id) ON DELETE CASCADE,
  blocker_type TEXT NOT NULL DEFAULT 'functional',
  severity TEXT NOT NULL DEFAULT 'high',
  description TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_blockers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own blockers" ON public.verification_blockers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_vb_surface ON public.verification_blockers(surface_id);
CREATE INDEX idx_vb_resolved ON public.verification_blockers(resolved);

CREATE TRIGGER update_verification_blockers_updated_at BEFORE UPDATE ON public.verification_blockers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
