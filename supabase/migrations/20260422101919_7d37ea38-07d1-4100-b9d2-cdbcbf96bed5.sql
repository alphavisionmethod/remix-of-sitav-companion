
-- 1. conversion_experiments
CREATE TABLE public.conversion_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  variant_a TEXT NOT NULL DEFAULT 'Control',
  variant_b TEXT NOT NULL DEFAULT 'Variant B',
  status TEXT NOT NULL DEFAULT 'draft',
  conversion_rate_a NUMERIC DEFAULT 0,
  conversion_rate_b NUMERIC DEFAULT 0,
  sample_size INTEGER DEFAULT 0,
  confidence_level NUMERIC DEFAULT 0,
  winner TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversion_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conversion_experiments" ON public.conversion_experiments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_conversion_experiments BEFORE UPDATE ON public.conversion_experiments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. commercial_memory_events
CREATE TABLE public.commercial_memory_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'insight',
  domain TEXT NOT NULL DEFAULT 'revenue',
  summary TEXT NOT NULL,
  detail TEXT,
  impact_score NUMERIC DEFAULT 0,
  sentiment TEXT DEFAULT 'neutral',
  source_agent_id TEXT,
  source_ref TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  event_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.commercial_memory_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own commercial_memory_events" ON public.commercial_memory_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_commercial_memory_events BEFORE UPDATE ON public.commercial_memory_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. revenue_risk_areas
CREATE TABLE public.revenue_risk_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  area_name TEXT NOT NULL,
  risk_type TEXT NOT NULL DEFAULT 'operational',
  severity TEXT NOT NULL DEFAULT 'medium',
  impact_estimate_cents INTEGER DEFAULT 0,
  mitigation_status TEXT NOT NULL DEFAULT 'unmitigated',
  description TEXT,
  evidence_refs JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_risk_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own revenue_risk_areas" ON public.revenue_risk_areas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_revenue_risk_areas BEFORE UPDATE ON public.revenue_risk_areas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. customer_journey_stages
CREATE TABLE public.customer_journey_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL DEFAULT 0,
  entry_count INTEGER DEFAULT 0,
  exit_count INTEGER DEFAULT 0,
  avg_duration_days NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_journey_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customer_journey_stages" ON public.customer_journey_stages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_customer_journey_stages BEFORE UPDATE ON public.customer_journey_stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. customer_lifecycle_stages
CREATE TABLE public.customer_lifecycle_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  criteria TEXT,
  customer_count INTEGER DEFAULT 0,
  avg_revenue_cents INTEGER DEFAULT 0,
  color TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_lifecycle_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customer_lifecycle_stages" ON public.customer_lifecycle_stages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_customer_lifecycle_stages BEFORE UPDATE ON public.customer_lifecycle_stages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. customer_profile_snapshots
CREATE TABLE public.customer_profile_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  health_score NUMERIC DEFAULT 0,
  lifetime_revenue_cents INTEGER DEFAULT 0,
  engagement_level TEXT DEFAULT 'medium',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_profile_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customer_profile_snapshots" ON public.customer_profile_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. risk_register
CREATE TABLE public.risk_register (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  risk_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'operational',
  likelihood TEXT NOT NULL DEFAULT 'medium',
  impact TEXT NOT NULL DEFAULT 'medium',
  severity TEXT NOT NULL DEFAULT 'medium',
  owner TEXT,
  mitigation_plan TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_register ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own risk_register" ON public.risk_register FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_updated_at_risk_register BEFORE UPDATE ON public.risk_register FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
