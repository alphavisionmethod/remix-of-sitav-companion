
-- Customer Journey Proof System

-- Journey status enum
DO $$ BEGIN
  CREATE TYPE public.journey_status AS ENUM ('working','partial','demo_governed','degraded_usable','broken','planned','internal_only');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Launch impact enum
DO $$ BEGIN
  CREATE TYPE public.journey_launch_impact AS ENUM ('launch_blocker','pilot_blocker','claim_risk','important_non_blocker','non_blocking');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Proof confidence enum
DO $$ BEGIN
  CREATE TYPE public.journey_proof_confidence AS ENUM ('verified_e2e','verified_interaction','verified_component_only','manually_confirmed','unverified');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. customer_journeys — full journey inventory
CREATE TABLE public.customer_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'user',
  domain TEXT NOT NULL DEFAULT 'core',
  route_family TEXT,
  primary_modes TEXT[] DEFAULT '{"real","demo"}',
  steps JSONB DEFAULT '[]',
  expected_outcome TEXT,
  launch_importance TEXT DEFAULT 'important_non_blocker',
  dependencies TEXT[] DEFAULT '{}',
  owner TEXT,
  current_status TEXT DEFAULT 'unverified',
  last_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, journey_key)
);

ALTER TABLE public.customer_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journeys" ON public.customer_journeys FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_customer_journeys_updated_at BEFORE UPDATE ON public.customer_journeys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. customer_journey_runs — execution records
CREATE TABLE public.customer_journey_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id UUID REFERENCES public.customer_journeys(id) ON DELETE CASCADE,
  journey_key TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'real',
  status TEXT NOT NULL DEFAULT 'working',
  launch_impact TEXT DEFAULT 'non_blocking',
  proof_confidence TEXT DEFAULT 'unverified',
  steps_passed INT DEFAULT 0,
  steps_failed INT DEFAULT 0,
  steps_total INT DEFAULT 0,
  expected_outcome TEXT,
  actual_outcome TEXT,
  degraded_reason TEXT,
  demo_governed BOOLEAN DEFAULT false,
  provider_source_type TEXT,
  evidence_refs JSONB DEFAULT '[]',
  recommended_fix TEXT,
  root_cause_layer TEXT,
  severity TEXT DEFAULT 'medium',
  owner TEXT,
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_journey_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey runs" ON public.customer_journey_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. customer_journey_steps — individual step records
CREATE TABLE public.customer_journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.customer_journey_runs(id) ON DELETE CASCADE,
  step_order INT NOT NULL DEFAULT 0,
  step_name TEXT NOT NULL,
  expected_behavior TEXT,
  actual_behavior TEXT,
  result TEXT DEFAULT 'pending',
  evidence_ref TEXT,
  root_cause TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_journey_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey steps" ON public.customer_journey_steps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. customer_journey_blockers — launch blockers from failures
CREATE TABLE public.customer_journey_blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_key TEXT NOT NULL,
  run_id UUID REFERENCES public.customer_journey_runs(id) ON DELETE SET NULL,
  blocker_type TEXT NOT NULL DEFAULT 'launch_blocker',
  severity TEXT DEFAULT 'high',
  summary TEXT,
  recommended_fix TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_journey_blockers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey blockers" ON public.customer_journey_blockers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_customer_journey_blockers_updated_at BEFORE UPDATE ON public.customer_journey_blockers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_cj_user_key ON public.customer_journeys(user_id, journey_key);
CREATE INDEX idx_cjr_journey ON public.customer_journey_runs(journey_id);
CREATE INDEX idx_cjr_user ON public.customer_journey_runs(user_id);
CREATE INDEX idx_cjs_run ON public.customer_journey_steps(run_id);
CREATE INDEX idx_cjb_user ON public.customer_journey_blockers(user_id, resolved);
