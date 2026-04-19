-- Secret rotation evidence log (durable cadence proof)
CREATE TABLE IF NOT EXISTS public.secret_rotation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_class text NOT NULL,
  secret_name text NOT NULL,
  rotated_at timestamptz NOT NULL DEFAULT now(),
  rotated_by uuid,
  dry_run boolean NOT NULL DEFAULT false,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  cadence_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_secret_rotation_log_class_time
  ON public.secret_rotation_log (secret_class, rotated_at DESC);

CREATE INDEX IF NOT EXISTS idx_secret_rotation_log_due
  ON public.secret_rotation_log (cadence_due_at);

ALTER TABLE public.secret_rotation_log ENABLE ROW LEVEL SECURITY;

-- Admin-only SELECT (uses existing has_role function)
CREATE POLICY "Admins can view secret rotation log"
  ON public.secret_rotation_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin-only INSERT (orchestrator runs as service role; this covers admin-initiated entries)
CREATE POLICY "Admins can insert secret rotation log entries"
  ON public.secret_rotation_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- No UPDATE / DELETE policies — append-only by design

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.secret_rotation_log;
ALTER TABLE public.secret_rotation_log REPLICA IDENTITY FULL;