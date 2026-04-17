-- ═══════════════════════════════════════════════════════════════
-- Migration: User Seed Receipts (C-020)
-- Domain: onboarding
-- Owner: platform-foundation
-- Risk: low
-- Reversible: yes
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_seed_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'seeded' CHECK (status IN ('seeded', 'skipped', 'failed')),
  reason text,
  seed_version integer NOT NULL DEFAULT 1,
  tables_count integer NOT NULL DEFAULT 0,
  rows_count integer NOT NULL DEFAULT 0,
  error_summary text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '180 days')
);

CREATE INDEX IF NOT EXISTS idx_user_seed_runs_user_created
  ON public.user_seed_runs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_seed_runs_status
  ON public.user_seed_runs (status, created_at DESC);

ALTER TABLE public.user_seed_runs ENABLE ROW LEVEL SECURITY;

-- Owner can read their own receipts
CREATE POLICY "Users can view their own seed runs"
  ON public.user_seed_runs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all receipts (platform health)
CREATE POLICY "Admins can view all seed runs"
  ON public.user_seed_runs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Inserts only via service role (edge function); no client-side INSERT policy.
-- (service_role bypasses RLS; absence of a policy denies authenticated INSERTs.)

-- Ensure the canonical demo profile exists and is unseeded so demo
-- sessions get realistic fixtures on the next seed invocation.
INSERT INTO public.profiles (user_id, display_name, avatar_url, preferences)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'SITA Admin',
  NULL,
  '{}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;
