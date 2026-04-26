ALTER TABLE public.recovery_jobs
  ADD COLUMN IF NOT EXISTS appointment_id uuid;

CREATE INDEX IF NOT EXISTS idx_recovery_jobs_appointment_id
  ON public.recovery_jobs (appointment_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recovery_jobs'
      AND policyname = 'Users can insert their own recovery jobs'
  ) THEN
    CREATE POLICY "Users can insert their own recovery jobs"
      ON public.recovery_jobs
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recovery_jobs'
      AND policyname = 'Users can update their own recovery jobs'
  ) THEN
    CREATE POLICY "Users can update their own recovery jobs"
      ON public.recovery_jobs
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;