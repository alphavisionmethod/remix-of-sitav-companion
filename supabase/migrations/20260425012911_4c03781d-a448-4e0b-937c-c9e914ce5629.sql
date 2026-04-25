CREATE TABLE IF NOT EXISTS public.autonomy_simulation_receipts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  advisor_id      TEXT NOT NULL,
  domain          TEXT NOT NULL DEFAULT 'general',
  action_key      TEXT NOT NULL,
  summary         TEXT NOT NULL DEFAULT '',
  risk_class      TEXT NOT NULL DEFAULT 'reversible_safe'
                  CHECK (risk_class IN ('reversible_safe','reversible_risky','irreversible')),
  confidence      NUMERIC NOT NULL DEFAULT 0,
  decision        TEXT NOT NULL
                  CHECK (decision IN ('auto_execute','queue_for_approval','blocked')),
  decision_reason TEXT NOT NULL DEFAULT '',
  signal_id       UUID,
  signal_kind     TEXT,
  queue_id        UUID,
  financial_impact_cents INTEGER NOT NULL DEFAULT 0,
  is_client_facing BOOLEAN NOT NULL DEFAULT FALSE,
  draft_only      BOOLEAN NOT NULL DEFAULT TRUE,
  projected_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  side_effects    JSONB NOT NULL DEFAULT '[]'::jsonb,
  rollback_plan   JSONB NOT NULL DEFAULT '{}'::jsonb,
  policy_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '60 days')
);

CREATE INDEX IF NOT EXISTS autonomy_sim_receipts_user_idx
  ON public.autonomy_simulation_receipts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS autonomy_sim_receipts_advisor_idx
  ON public.autonomy_simulation_receipts (user_id, advisor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS autonomy_sim_receipts_queue_idx
  ON public.autonomy_simulation_receipts (queue_id);
CREATE INDEX IF NOT EXISTS autonomy_sim_receipts_expires_idx
  ON public.autonomy_simulation_receipts (expires_at);

ALTER TABLE public.autonomy_simulation_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own simulation receipts"
  ON public.autonomy_simulation_receipts;
CREATE POLICY "Users read own simulation receipts"
  ON public.autonomy_simulation_receipts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Users insert own simulation receipts"
  ON public.autonomy_simulation_receipts;
CREATE POLICY "Users insert own simulation receipts"
  ON public.autonomy_simulation_receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages simulation receipts"
  ON public.autonomy_simulation_receipts;
CREATE POLICY "Service role manages simulation receipts"
  ON public.autonomy_simulation_receipts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);