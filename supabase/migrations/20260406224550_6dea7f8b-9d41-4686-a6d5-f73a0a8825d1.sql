
-- ══════════════════════════════════════════════════════════════
-- Remediation Programs
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.remediation_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_key TEXT NOT NULL,
  title TEXT NOT NULL,
  focus_area TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'draft',
  linked_flagship_loop TEXT,
  open_items_count INTEGER NOT NULL DEFAULT 0,
  completed_items_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.remediation_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own remediation_programs" ON public.remediation_programs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_remediation_programs_updated_at BEFORE UPDATE ON public.remediation_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══════════════════════════════════════════════════════════════
-- Outcome Verifications
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.outcome_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_id UUID REFERENCES public.ai_workforce_recommendations(id) ON DELETE SET NULL,
  execution_ref TEXT,
  expected_improvement TEXT,
  actual_improvement TEXT,
  journey_delta JSONB DEFAULT '{}'::jsonb,
  launch_truth_delta JSONB DEFAULT '{}'::jsonb,
  score_adjustment NUMERIC DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verifier_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.outcome_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own outcome_verifications" ON public.outcome_verifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- Flagship Loops
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.flagship_loops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loop_key TEXT NOT NULL,
  title TEXT NOT NULL,
  owner TEXT,
  target_persona TEXT,
  routes JSONB DEFAULT '[]'::jsonb,
  capabilities JSONB DEFAULT '[]'::jsonb,
  primary_services JSONB DEFAULT '[]'::jsonb,
  cj_entries JSONB DEFAULT '[]'::jsonb,
  launch_blockers JSONB DEFAULT '[]'::jsonb,
  proof_status TEXT NOT NULL DEFAULT 'unverified',
  ux_quality TEXT NOT NULL DEFAULT 'draft',
  launch_claim_status TEXT NOT NULL DEFAULT 'not_claimable',
  demo_vs_real TEXT NOT NULL DEFAULT 'demo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flagship_loops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own flagship_loops" ON public.flagship_loops FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_flagship_loops_updated_at BEFORE UPDATE ON public.flagship_loops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══════════════════════════════════════════════════════════════
-- ALTER ai_workforce_recommendations
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.ai_workforce_recommendations
  ADD COLUMN IF NOT EXISTS execution_binding_status TEXT NOT NULL DEFAULT 'unbound',
  ADD COLUMN IF NOT EXISTS outcome_verification_id UUID REFERENCES public.outcome_verifications(id) ON DELETE SET NULL;
