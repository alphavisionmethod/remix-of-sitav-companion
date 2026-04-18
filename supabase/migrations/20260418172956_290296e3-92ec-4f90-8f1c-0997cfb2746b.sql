-- Enable required extensions for scheduled HTTP probes
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotently (re)schedule the hourly OAuth refresh probe
DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'oauth-refresh-probe-hourly';
  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;

  PERFORM cron.schedule(
    'oauth-refresh-probe-hourly',
    '7 * * * *',
    $job$
    SELECT net.http_post(
      url := 'https://fctupowhcljejygjfpty.supabase.co/functions/v1/oauth-refresh-probe',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHVwb3doY2xqZWp5Z2pmcHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTQ3MzUsImV4cCI6MjA5MTU3MDczNX0.1Px9wwiVMD7q8uTyFAswhYiTNXf3yBg4Vbl54rvXxJc'
      ),
      body := jsonb_build_object('source', 'pg_cron', 'cadence', 'hourly')
    );
    $job$
  );
END $$;

-- Nightly kill-switch TTL expiry (idempotent)
DO $$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'kill-switch-expiry-nightly';
  IF v_job_id IS NULL THEN
    PERFORM cron.schedule(
      'kill-switch-expiry-nightly',
      '0 3 * * *',
      $job$ SELECT public.expire_overdue_kill_switches(); $job$
    );
  END IF;
END $$;