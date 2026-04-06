-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule agent-scheduler to run every 5 minutes
SELECT cron.schedule(
  'sita-agent-scheduler',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/agent-scheduler',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
      body := concat('{"time": "', now(), '", "source": "pg_cron"}')::jsonb
    ) AS request_id;
  $$
);

-- Schedule self-healing heartbeat every 10 minutes
SELECT cron.schedule(
  'sita-self-healing-heartbeat',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/agent-heartbeat',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
      body := concat('{"time": "', now(), '", "source": "pg_cron", "mode": "self-healing"}')::jsonb
    ) AS request_id;
  $$
);