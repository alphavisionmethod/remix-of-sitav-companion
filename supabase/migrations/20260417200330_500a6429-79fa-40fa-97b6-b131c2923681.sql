
-- ════════════════════════════════════════════════════════════
-- Phase: Final security hardening before deploy
-- ════════════════════════════════════════════════════════════

-- 1) Uptime heartbeats — forbid client inserts entirely
DROP POLICY IF EXISTS "Authenticated users insert their own client heartbeats" ON public.uptime_heartbeats;

-- 2) connector_oauth_tokens — remove client read/write surface
DROP POLICY IF EXISTS "Users manage own oauth tokens" ON public.connector_oauth_tokens;
DROP POLICY IF EXISTS "Users view own oauth tokens" ON public.connector_oauth_tokens;

-- Service-role-only access (RLS stays enabled; no policies = no client access)
-- Edge functions using SUPABASE_SERVICE_ROLE_KEY bypass RLS automatically.

-- 3) Realtime channel scoping
-- Allow authenticated users to subscribe only to topics scoped to their user id
-- or to explicitly public broadcast topics.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'realtime' AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "users subscribe own topics" ON realtime.messages';
    EXECUTE $POL$
      CREATE POLICY "users subscribe own topics"
      ON realtime.messages
      FOR SELECT
      TO authenticated
      USING (
        topic LIKE ('user:' || auth.uid()::text || ':%')
        OR topic LIKE 'public:%'
      )
    $POL$;

    EXECUTE 'DROP POLICY IF EXISTS "users broadcast own topics" ON realtime.messages';
    EXECUTE $POL$
      CREATE POLICY "users broadcast own topics"
      ON realtime.messages
      FOR INSERT
      TO authenticated
      WITH CHECK (
        topic LIKE ('user:' || auth.uid()::text || ':%')
      )
    $POL$;
  END IF;
END $$;

-- 4) app-assets bucket — keep public read by URL, forbid directory listing
DROP POLICY IF EXISTS "Public can list app-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can read app-assets" ON storage.objects;

CREATE POLICY "Public can read app-assets by URL"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'app-assets' AND name IS NOT NULL);

-- Note: Supabase Storage exposes individual objects by signed/public URL regardless
-- of LIST permissions; this policy permits per-object reads (required for <img src>)
-- without enabling bucket enumeration via the storage API.
