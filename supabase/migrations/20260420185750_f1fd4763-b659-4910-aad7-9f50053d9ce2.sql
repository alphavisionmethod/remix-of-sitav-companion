
-- ═══════════════════════════════════════════════════════════════
-- Migration: Wave 8.4 — Remove sensitive tables from Realtime
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'hardware_certification_runs'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.hardware_certification_runs;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'secret_rotation_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.secret_rotation_log;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'operator_drill_executions'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.operator_drill_executions;
  END IF;
END $$;
