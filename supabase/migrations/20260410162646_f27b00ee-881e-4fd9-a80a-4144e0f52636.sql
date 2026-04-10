
ALTER TABLE public.implementation_spec_registry
  ADD COLUMN IF NOT EXISTS required_shells text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_endpoints text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_schemas text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_docs text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_screens text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_projections text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS drift_state text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS architecture_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS test_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS docs_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proof_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS policy_score int DEFAULT 0;
