-- Schedule the scheduler-dispatch function to run every 3 minutes via pg_cron
SELECT cron.schedule(
  'sita-scheduler-dispatch',
  '*/3 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/scheduler-dispatch',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
      body := concat('{"time": "', now(), '", "source": "pg_cron"}')::jsonb
    ) AS request_id;
  $$
);

-- Schedule runtime-probes health check every 15 minutes
SELECT cron.schedule(
  'sita-runtime-probes',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/runtime-probes',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
      body := concat('{"time": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);