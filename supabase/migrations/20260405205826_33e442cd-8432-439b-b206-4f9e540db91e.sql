
-- Extend reality_classifications with full scope/evidence/progression support
ALTER TABLE public.reality_classifications
  ADD COLUMN IF NOT EXISTS scope_level text NOT NULL DEFAULT 'feature',
  ADD COLUMN IF NOT EXISTS confidence integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS evidence_inputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS missing_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS blockers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS owner text,
  ADD COLUMN IF NOT EXISTS launch_impact text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS progression_criteria jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Add constraint for scope_level
ALTER TABLE public.reality_classifications
  ADD CONSTRAINT reality_classifications_scope_level_check
  CHECK (scope_level IN ('route', 'page', 'feature', 'component_group', 'service', 'domain', 'workspace', 'office'));

-- Add constraint for launch_impact
ALTER TABLE public.reality_classifications
  ADD CONSTRAINT reality_classifications_launch_impact_check
  CHECK (launch_impact IN ('blocking', 'degraded', 'none'));

-- Extend mock_replacements with sequencing and runtime validation
ALTER TABLE public.mock_replacements
  ADD COLUMN IF NOT EXISTS sequence_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS runtime_validated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS runtime_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dependencies text[] NOT NULL DEFAULT '{}';

-- Index for sequencing
CREATE INDEX IF NOT EXISTS idx_mock_replacements_sequence ON public.mock_replacements (sequence_order);
CREATE INDEX IF NOT EXISTS idx_reality_classifications_scope ON public.reality_classifications (scope_level);
CREATE INDEX IF NOT EXISTS idx_reality_classifications_launch ON public.reality_classifications (launch_impact);
