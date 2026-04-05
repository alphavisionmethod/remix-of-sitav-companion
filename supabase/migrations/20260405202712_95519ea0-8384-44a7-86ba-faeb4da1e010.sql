
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Engine Persistence Foundation
-- Generic adapter tables + dedicated high-value tables
-- ═══════════════════════════════════════════════════════════════

-- 1. Generic engine state (one row per user per engine)
CREATE TABLE IF NOT EXISTS public.engine_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  engine_name TEXT NOT NULL,
  state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, engine_name)
);
ALTER TABLE public.engine_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own engine state" ON public.engine_state FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_engine_state_updated_at BEFORE UPDATE ON public.engine_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Engine events (append-only log)
CREATE TABLE IF NOT EXISTS public.engine_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  engine_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.engine_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own engine events" ON public.engine_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own engine events" ON public.engine_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_engine_events_user_engine ON public.engine_events(user_id, engine_name, created_at DESC);

-- 3. Intelligence Assets Library (dedicated)
CREATE TABLE IF NOT EXISTS public.intelligence_assets_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'other',
  domain TEXT NOT NULL DEFAULT 'platform',
  title TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0.5,
  evidence_grade TEXT NOT NULL DEFAULT 'observed',
  reuse_count INTEGER NOT NULL DEFAULT 0,
  adapted_reuse_count INTEGER NOT NULL DEFAULT 0,
  cost_avoided_cents INTEGER NOT NULL DEFAULT 0,
  freshness_score NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  decay_rate NUMERIC(5,4) NOT NULL DEFAULT 0.01,
  invalidated BOOLEAN NOT NULL DEFAULT false,
  invalidation_reason TEXT,
  source_mission_id TEXT,
  source_agent_id TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_assets_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence assets" ON public.intelligence_assets_library FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_intel_assets_domain ON public.intelligence_assets_library(user_id, domain, asset_type);
CREATE INDEX idx_intel_assets_reuse ON public.intelligence_assets_library(user_id, reuse_count DESC);
CREATE TRIGGER update_intel_assets_updated_at BEFORE UPDATE ON public.intelligence_assets_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Quality Floor Configs (dedicated)
CREATE TABLE IF NOT EXISTS public.quality_floor_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_class TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'platform',
  min_confidence NUMERIC(5,4) NOT NULL DEFAULT 0.7,
  min_evidence_completeness NUMERIC(5,4) NOT NULL DEFAULT 0.6,
  min_verification_standard TEXT NOT NULL DEFAULT 'basic',
  min_freshness NUMERIC(5,4) NOT NULL DEFAULT 0.5,
  enforcement_mode TEXT NOT NULL DEFAULT 'warn',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_class, domain)
);
ALTER TABLE public.quality_floor_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quality floor configs" ON public.quality_floor_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_quality_floor_updated_at BEFORE UPDATE ON public.quality_floor_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Compute Budget Snapshots (dedicated)
CREATE TABLE IF NOT EXISTS public.compute_budget_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  domain TEXT NOT NULL DEFAULT 'platform',
  allocated_cents INTEGER NOT NULL DEFAULT 0,
  used_cents INTEGER NOT NULL DEFAULT 0,
  cache_hit_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  margin_posture TEXT NOT NULL DEFAULT 'healthy',
  deep_reasoning_pct NUMERIC(5,4) NOT NULL DEFAULT 0,
  model_mix JSONB NOT NULL DEFAULT '{}'::jsonb,
  anomaly_flags TEXT[] DEFAULT '{}',
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compute_budget_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own compute snapshots" ON public.compute_budget_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_compute_snapshots_period ON public.compute_budget_snapshots(user_id, period, snapshot_at DESC);

-- 6. Operator Taste Profiles (dedicated)
CREATE TABLE IF NOT EXISTS public.operator_taste_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  learned_from TEXT NOT NULL DEFAULT 'observation',
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0.5,
  times_applied INTEGER NOT NULL DEFAULT 0,
  last_applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, preference_key)
);
ALTER TABLE public.operator_taste_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own taste profiles" ON public.operator_taste_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_taste_profiles_updated_at BEFORE UPDATE ON public.operator_taste_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
