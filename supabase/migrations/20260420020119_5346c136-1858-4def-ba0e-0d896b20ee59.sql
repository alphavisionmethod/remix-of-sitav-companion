-- Onboarding resume checkpoints — first-use re-entry persistence
CREATE TABLE IF NOT EXISTS public.onboarding_resume_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  current_screen smallint NOT NULL,
  branch text NOT NULL,
  profile_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  conditional_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_completed_screen smallint,
  resume_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_resume_checkpoints_user_session_uniq UNIQUE (user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_resume_checkpoints_user_active
  ON public.onboarding_resume_checkpoints (user_id, expires_at);

CREATE INDEX IF NOT EXISTS idx_onboarding_resume_checkpoints_token
  ON public.onboarding_resume_checkpoints (resume_token);

-- Validation trigger (no CHECK constraints per project rules)
CREATE OR REPLACE FUNCTION public.validate_onboarding_resume_checkpoint()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.current_screen < 1 OR NEW.current_screen > 29 THEN
    RAISE EXCEPTION 'current_screen must be between 1 and 29 (got %)', NEW.current_screen
      USING ERRCODE = '22023';
  END IF;
  IF NEW.branch NOT IN ('quick','balanced','deep') THEN
    RAISE EXCEPTION 'branch must be one of quick|balanced|deep (got %)', NEW.branch
      USING ERRCODE = '22023';
  END IF;
  IF NEW.last_completed_screen IS NOT NULL
     AND (NEW.last_completed_screen < 0 OR NEW.last_completed_screen > 29) THEN
    RAISE EXCEPTION 'last_completed_screen must be 0..29 (got %)', NEW.last_completed_screen
      USING ERRCODE = '22023';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_onboarding_resume_checkpoint
  ON public.onboarding_resume_checkpoints;
CREATE TRIGGER trg_validate_onboarding_resume_checkpoint
  BEFORE INSERT OR UPDATE ON public.onboarding_resume_checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.validate_onboarding_resume_checkpoint();

-- RLS
ALTER TABLE public.onboarding_resume_checkpoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own_resume_checkpoint ON public.onboarding_resume_checkpoints;
CREATE POLICY users_select_own_resume_checkpoint
  ON public.onboarding_resume_checkpoints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS users_insert_own_resume_checkpoint ON public.onboarding_resume_checkpoints;
CREATE POLICY users_insert_own_resume_checkpoint
  ON public.onboarding_resume_checkpoints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS users_update_own_resume_checkpoint ON public.onboarding_resume_checkpoints;
CREATE POLICY users_update_own_resume_checkpoint
  ON public.onboarding_resume_checkpoints
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);