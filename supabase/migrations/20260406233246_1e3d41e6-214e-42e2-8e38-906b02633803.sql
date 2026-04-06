-- Add truth score columns to flagship_loops table
ALTER TABLE public.flagship_loops
  ADD COLUMN IF NOT EXISTS truth_pct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS structural_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS runtime_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proof_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ux_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_actions text[] DEFAULT '{}';
