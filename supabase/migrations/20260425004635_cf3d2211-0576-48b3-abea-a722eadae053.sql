-- Cross-advisor consistency findings table
CREATE TABLE public.advisor_consistency_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  finding_kind TEXT NOT NULL DEFAULT 'opposing_category',
  severity TEXT NOT NULL DEFAULT 'warn',
  summary TEXT NOT NULL,
  advisor_a TEXT NOT NULL,
  advisor_b TEXT NOT NULL,
  recommendation_a_id UUID REFERENCES public.advisor_board_recommendations(id) ON DELETE CASCADE,
  recommendation_b_id UUID REFERENCES public.advisor_board_recommendations(id) ON DELETE CASCADE,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  run_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT acf_severity_check CHECK (severity IN ('info','warn','critical')),
  CONSTRAINT acf_status_check CHECK (status IN ('open','acknowledged','resolved')),
  CONSTRAINT acf_kind_check CHECK (finding_kind IN ('opposing_category','timeline_contradiction','resource_conflict','mutual_exclusion'))
);

-- Prevent duplicate open findings for the same recommendation pair
CREATE UNIQUE INDEX idx_acf_unique_open_pair
  ON public.advisor_consistency_findings (user_id, recommendation_a_id, recommendation_b_id, finding_kind)
  WHERE status = 'open';

CREATE INDEX idx_acf_user_status ON public.advisor_consistency_findings (user_id, status, created_at DESC);
CREATE INDEX idx_acf_user_domain ON public.advisor_consistency_findings (user_id, domain);
CREATE INDEX idx_acf_run ON public.advisor_consistency_findings (run_id);

ALTER TABLE public.advisor_consistency_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consistency findings"
  ON public.advisor_consistency_findings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own consistency findings"
  ON public.advisor_consistency_findings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own consistency findings"
  ON public.advisor_consistency_findings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role inserts findings on behalf of users (nightly job)
CREATE POLICY "Service role inserts consistency findings"
  ON public.advisor_consistency_findings FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Users can also insert their own (for manual re-runs from the UI)
CREATE POLICY "Users insert own consistency findings"
  ON public.advisor_consistency_findings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_advisor_consistency_findings_updated_at
  BEFORE UPDATE ON public.advisor_consistency_findings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();