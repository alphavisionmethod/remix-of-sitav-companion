
-- ============================================================
-- App Platform tables
-- ============================================================

-- Publishers
CREATE TABLE public.publishers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  trust_tier text NOT NULL DEFAULT 'unverified',
  website text,
  support_email text,
  owner_user_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.publishers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "publishers_public_read" ON public.publishers FOR SELECT USING (true);
CREATE POLICY "publishers_admin_write" ON public.publishers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Publisher signing keys
CREATE TABLE public.publisher_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id uuid NOT NULL REFERENCES public.publishers(id) ON DELETE CASCADE,
  key_id text NOT NULL,
  public_key text NOT NULL,
  algorithm text NOT NULL DEFAULT 'ed25519',
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(publisher_id, key_id)
);
ALTER TABLE public.publisher_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "publisher_keys_admin_only" ON public.publisher_keys FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_publisher_keys_publisher ON public.publisher_keys(publisher_id);

-- Extend apps table
ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS publisher_id uuid REFERENCES public.publishers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS runtime_target text NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS min_platform_version text NOT NULL DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS default_channel text NOT NULL DEFAULT 'stable';
-- manifest_json already exists per service code

CREATE INDEX IF NOT EXISTS idx_apps_publisher ON public.apps(publisher_id);

-- App assets (icons, screenshots, manifests)
CREATE TABLE public.app_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL,
  asset_type text NOT NULL,
  storage_path text NOT NULL,
  source_url text,
  width integer,
  height integer,
  mime_type text,
  checksum text,
  size_bytes integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_assets_public_read" ON public.app_assets FOR SELECT USING (true);
CREATE POLICY "app_assets_admin_write" ON public.app_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_app_assets_app ON public.app_assets(app_id);
CREATE INDEX idx_app_assets_type ON public.app_assets(asset_type);

-- App packages
CREATE TABLE public.app_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL,
  version text NOT NULL,
  package_type text NOT NULL DEFAULT 'sita-web',
  package_url text,
  checksum text,
  size_bytes bigint,
  signature_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  runtime_target text NOT NULL DEFAULT 'web',
  channel text NOT NULL DEFAULT 'stable',
  min_platform_version text NOT NULL DEFAULT '1.0.0',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, version, channel)
);
ALTER TABLE public.app_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_packages_public_read" ON public.app_packages FOR SELECT USING (true);
CREATE POLICY "app_packages_admin_write" ON public.app_packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_app_packages_app ON public.app_packages(app_id);
CREATE INDEX idx_app_packages_channel ON public.app_packages(app_id, channel);

-- App ingestion jobs
CREATE TABLE public.app_ingestion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL,
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  result_json jsonb,
  error_json jsonb,
  requested_by uuid,
  app_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_ingestion_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_ingestion_jobs_owner_or_admin_read" ON public.app_ingestion_jobs FOR SELECT TO authenticated
  USING (auth.uid() = requested_by OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "app_ingestion_jobs_admin_write" ON public.app_ingestion_jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_app_ingestion_jobs_status ON public.app_ingestion_jobs(status, created_at DESC);
CREATE INDEX idx_app_ingestion_jobs_requester ON public.app_ingestion_jobs(requested_by);

-- App signatures (verifies packages against publisher keys)
CREATE TABLE public.app_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL,
  package_id uuid NOT NULL REFERENCES public.app_packages(id) ON DELETE CASCADE,
  publisher_key_id uuid NOT NULL REFERENCES public.publisher_keys(id) ON DELETE RESTRICT,
  signature text NOT NULL,
  manifest_hash text,
  status text NOT NULL DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_signatures_public_read" ON public.app_signatures FOR SELECT USING (true);
CREATE POLICY "app_signatures_admin_write" ON public.app_signatures FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_app_signatures_package ON public.app_signatures(package_id);

-- App update channels (latest version per channel per app)
CREATE TABLE public.app_update_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL,
  channel text NOT NULL DEFAULT 'stable',
  latest_version text NOT NULL,
  package_id uuid REFERENCES public.app_packages(id) ON DELETE SET NULL,
  release_notes text,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, channel)
);
ALTER TABLE public.app_update_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_update_channels_public_read" ON public.app_update_channels FOR SELECT USING (true);
CREATE POLICY "app_update_channels_admin_write" ON public.app_update_channels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_app_update_channels_app ON public.app_update_channels(app_id);

-- App trust records
CREATE TABLE public.app_trust_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL,
  source_kind text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  badge text NOT NULL DEFAULT 'unverified',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_trust_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_trust_records_public_read" ON public.app_trust_records FOR SELECT USING (true);
CREATE POLICY "app_trust_records_admin_write" ON public.app_trust_records FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_app_trust_records_app ON public.app_trust_records(app_id, evaluated_at DESC);

-- Extend installed_apps
ALTER TABLE public.installed_apps
  ADD COLUMN IF NOT EXISTS package_id uuid REFERENCES public.app_packages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS update_channel text NOT NULL DEFAULT 'stable',
  ADD COLUMN IF NOT EXISTS last_update_check_at timestamptz;

-- updated_at triggers
CREATE TRIGGER trg_publishers_updated_at BEFORE UPDATE ON public.publishers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_app_ingestion_jobs_updated_at BEFORE UPDATE ON public.app_ingestion_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_app_update_channels_updated_at BEFORE UPDATE ON public.app_update_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Storage bucket: app-assets (public read)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "app_assets_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'app-assets');

CREATE POLICY "app_assets_storage_admin_write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'app-assets'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "app_assets_storage_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'app-assets'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "app_assets_storage_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'app-assets'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );
