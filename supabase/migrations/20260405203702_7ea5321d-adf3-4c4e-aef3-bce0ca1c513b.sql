
-- Reality Classification Matrix
CREATE TABLE public.reality_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_path TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  classification TEXT NOT NULL DEFAULT 'presentational' CHECK (classification IN ('presentational','simulated','persisted','proven')),
  mock_sources TEXT[] DEFAULT '{}',
  backend_target TEXT,
  contract_status TEXT DEFAULT 'none' CHECK (contract_status IN ('none','partial','aligned','verified')),
  verification_evidence JSONB DEFAULT '[]',
  readiness_score INTEGER DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  notes TEXT,
  classified_by TEXT DEFAULT 'manual',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, route_path)
);

ALTER TABLE public.reality_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own classifications" ON public.reality_classifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_reality_classifications_updated_at BEFORE UPDATE ON public.reality_classifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mock Replacement Program
CREATE TABLE public.mock_replacements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  mock_source TEXT NOT NULL,
  mock_type TEXT NOT NULL DEFAULT 'hardcoded' CHECK (mock_type IN ('hardcoded','local_array','localstorage','in_memory_engine','pure_function','demo_flow')),
  real_backend_target TEXT,
  expected_contract TEXT,
  migration_status TEXT NOT NULL DEFAULT 'identified' CHECK (migration_status IN ('identified','planned','in_progress','blocked','completed','validated')),
  migration_owner TEXT,
  migration_priority TEXT NOT NULL DEFAULT 'medium' CHECK (migration_priority IN ('critical','high','medium','low')),
  blockers TEXT[] DEFAULT '{}',
  validation_evidence JSONB DEFAULT '[]',
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_replacements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mock replacements" ON public.mock_replacements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_mock_replacements_updated_at BEFORE UPDATE ON public.mock_replacements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_reality_classifications_domain ON public.reality_classifications(domain);
CREATE INDEX idx_reality_classifications_classification ON public.reality_classifications(classification);
CREATE INDEX idx_mock_replacements_status ON public.mock_replacements(migration_status);
CREATE INDEX idx_mock_replacements_priority ON public.mock_replacements(migration_priority);
