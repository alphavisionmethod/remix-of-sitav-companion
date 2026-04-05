-- Remove tables from realtime publication (no IF EXISTS in this syntax)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
  EXCEPTION WHEN undefined_object THEN
    NULL; -- table not in publication
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.agent_telemetry;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;
END $$;