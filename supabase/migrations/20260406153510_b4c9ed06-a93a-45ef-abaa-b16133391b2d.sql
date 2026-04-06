
-- Add missing columns to ai_workforce_approval_queue for Part 4 spec
ALTER TABLE public.ai_workforce_approval_queue
  ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS impacted_domain text,
  ADD COLUMN IF NOT EXISTS recommendation_type text DEFAULT 'recommendation',
  ADD COLUMN IF NOT EXISTS estimated_impact text,
  ADD COLUMN IF NOT EXISTS budget_impact text,
  ADD COLUMN IF NOT EXISTS launch_impact text,
  ADD COLUMN IF NOT EXISTS originating_receipt_id text,
  ADD COLUMN IF NOT EXISTS proposed_action_summary text,
  ADD COLUMN IF NOT EXISTS evidence_summary text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewer_notes text;
