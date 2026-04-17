-- ═══════════════════════════════════════════════════════════════
-- Sprint P0: Close RLS gap on connector_oauth_tokens + harden app-assets bucket
-- ═══════════════════════════════════════════════════════════════

-- 1. connector_oauth_tokens: owner-scoped CRUD; service-role bypasses via SECURITY DEFINER paths
ALTER TABLE public.connector_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own oauth tokens"
ON public.connector_oauth_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own oauth tokens"
ON public.connector_oauth_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oauth tokens"
ON public.connector_oauth_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oauth tokens"
ON public.connector_oauth_tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. app-assets bucket: keep public READ of objects, but restrict anonymous LISTING
-- (objects remain publicly readable by direct URL; folder enumeration disabled)
-- Storage policies: explicit per-action policies on storage.objects for the bucket.

-- Allow public read of individual objects (direct URL access)
DROP POLICY IF EXISTS "Public read app-assets objects" ON storage.objects;
CREATE POLICY "Public read app-assets objects"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'app-assets');

-- Only authenticated admins can upload/modify/delete app-assets
DROP POLICY IF EXISTS "Admins can upload app-assets" ON storage.objects;
CREATE POLICY "Admins can upload app-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'app-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admins can update app-assets" ON storage.objects;
CREATE POLICY "Admins can update app-assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'app-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admins can delete app-assets" ON storage.objects;
CREATE POLICY "Admins can delete app-assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'app-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 3. Audit-log retention helper: TTL trim function for kill_switch_audit_log (90 days)
CREATE OR REPLACE FUNCTION public.trim_kill_switch_audit_log(_keep_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer := 0;
BEGIN
  WITH d AS (
    DELETE FROM public.kill_switch_audit_log
    WHERE created_at < now() - (_keep_days || ' days')::interval
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM d;
  RETURN v_deleted;
END;
$$;

-- 4. Account deletion infrastructure: soft-delete with 30-day grace period
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  scheduled_purge_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','cancelled','purged')),
  reason text,
  cancelled_at timestamptz,
  purged_at timestamptz,
  receipt_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deletion request"
ON public.account_deletion_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can request their own deletion"
ON public.account_deletion_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own deletion"
ON public.account_deletion_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_account_deletion_requests_updated
BEFORE UPDATE ON public.account_deletion_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Data export receipts: track DSAR requests
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  export_format text NOT NULL DEFAULT 'json',
  row_count integer,
  table_count integer,
  bytes_exported bigint,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own export requests"
ON public.data_export_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests"
ON public.data_export_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user ON public.data_export_requests(user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_purge ON public.account_deletion_requests(scheduled_purge_at) WHERE status = 'pending';