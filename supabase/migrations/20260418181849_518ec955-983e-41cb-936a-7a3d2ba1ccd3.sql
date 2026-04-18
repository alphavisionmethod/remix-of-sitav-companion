
-- 1. Ledger table
CREATE TABLE IF NOT EXISTS public.boardroom_followthrough_sla_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid NOT NULL REFERENCES public.boardroom_followthrough_dispatches(id) ON DELETE CASCADE,
  boardroom_item_id uuid NOT NULL,
  user_id uuid NOT NULL,
  state text NOT NULL,
  bucket text NOT NULL CHECK (bucket IN ('warning','critical')),
  age_hours numeric NOT NULL,
  severity text NOT NULL CHECK (severity IN ('warning','error','critical')),
  triggered_by text NOT NULL DEFAULT 'cron',
  alert_router_ok boolean NOT NULL DEFAULT false,
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_l7_sla_dispatch_bucket
  ON public.boardroom_followthrough_sla_alerts (dispatch_id, bucket, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_l7_sla_user
  ON public.boardroom_followthrough_sla_alerts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_l7_sla_unack
  ON public.boardroom_followthrough_sla_alerts (created_at DESC) WHERE acknowledged_at IS NULL;

ALTER TABLE public.boardroom_followthrough_sla_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "l7_sla_owner_select" ON public.boardroom_followthrough_sla_alerts;
CREATE POLICY "l7_sla_owner_select" ON public.boardroom_followthrough_sla_alerts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "l7_sla_admin_all" ON public.boardroom_followthrough_sla_alerts;
CREATE POLICY "l7_sla_admin_all" ON public.boardroom_followthrough_sla_alerts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "l7_sla_service_insert" ON public.boardroom_followthrough_sla_alerts;
CREATE POLICY "l7_sla_service_insert" ON public.boardroom_followthrough_sla_alerts
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 2. Schedule the SLA scan every 30 minutes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'boardroom-l7-sla-scan') THEN
    PERFORM cron.unschedule('boardroom-l7-sla-scan');
  END IF;
END $$;

SELECT cron.schedule(
  'boardroom-l7-sla-scan',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://fctupowhcljejygjfpty.supabase.co/functions/v1/boardroom-followthrough-sla',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHVwb3doY2xqZWp5Z2pmcHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTQ3MzUsImV4cCI6MjA5MTU3MDczNX0.1Px9wwiVMD7q8uTyFAswhYiTNXf3yBg4Vbl54rvXxJc'
    ),
    body := jsonb_build_object('triggered_by', 'cron')
  ) AS request_id;
  $$
);
