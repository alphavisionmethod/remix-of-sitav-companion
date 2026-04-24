
-- 1) RPC to read cron status for the daily Sita briefings job.
--    SECURITY DEFINER because the cron schema is locked down.
--    Returns a single row of: schedule, active, last_run_at, last_status, last_message.
CREATE OR REPLACE FUNCTION public.get_jarvis_cron_status(_jobname text DEFAULT 'sita-briefings-daily-0600')
RETURNS TABLE (
  jobname text,
  schedule text,
  active boolean,
  last_run_at timestamptz,
  last_status text,
  last_message text,
  next_expected_after timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.jobname::text,
    j.schedule::text,
    j.active,
    r.start_time AS last_run_at,
    r.status::text AS last_status,
    r.return_message::text AS last_message,
    -- best-effort hint: 24h after last run for daily jobs
    (r.start_time + interval '24 hours') AS next_expected_after
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT start_time, status, return_message
    FROM cron.job_run_details d
    WHERE d.jobid = j.jobid
    ORDER BY d.start_time DESC
    LIMIT 1
  ) r ON TRUE
  WHERE j.jobname = _jobname;
END;
$$;

-- Allow authenticated users to read the status (no PII; just schedule + last run).
GRANT EXECUTE ON FUNCTION public.get_jarvis_cron_status(text) TO authenticated;

-- 2) Realtime: ensure briefings table is in supabase_realtime publication
--    and emits full row payloads so the client can correlate inserts/updates.
ALTER TABLE public.sita_proactive_briefings REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'sita_proactive_briefings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.sita_proactive_briefings';
  END IF;
END$$;
