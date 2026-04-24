SELECT cron.schedule(
  'sita-dream-consolidate-nightly',
  '0 4 * * *',
  $$
    SELECT net.http_post(
      url := 'https://fctupowhcljejygjfpty.supabase.co/functions/v1/sita-dream-consolidate',
      headers := jsonb_build_object('Content-Type','application/json'),
      body := jsonb_build_object('source','pg_cron','cadence','nightly')
    ) AS request_id;
  $$
);

-- Also purge old episodes weekly (>180d)
SELECT cron.schedule(
  'sita-purge-episodes-weekly',
  '13 4 * * 0',
  $$ DELETE FROM public.sita_episodes WHERE started_at < now() - interval '180 days'; $$
);

-- And expire affect events past their TTL hourly
SELECT cron.schedule(
  'sita-purge-affect-hourly',
  '37 * * * *',
  $$ DELETE FROM public.sita_affect_events WHERE expires_at < now(); $$
);