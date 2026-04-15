
-- ============================================================
-- BATCH 1: Multi-User Cloud Storage Platform — 11 New Tables
-- ============================================================

-- 1. cloud_folders
CREATE TABLE public.cloud_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.cloud_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled',
  path_cache TEXT NOT NULL DEFAULT '/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_folders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_folders_user ON public.cloud_folders(user_id);
CREATE INDEX idx_cloud_folders_parent ON public.cloud_folders(parent_id);

CREATE POLICY "Users manage own folders" ON public.cloud_folders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all folders" ON public.cloud_folders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cloud_folders_updated_at BEFORE UPDATE ON public.cloud_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. cloud_blobs
CREATE TABLE public.cloud_blobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  storage_key TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  checksum TEXT,
  compression TEXT DEFAULT 'none',
  encryption_class TEXT DEFAULT 'standard',
  storage_backend TEXT DEFAULT 'supabase',
  finalized BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_blobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_blobs_user ON public.cloud_blobs(user_id);
CREATE INDEX idx_cloud_blobs_key ON public.cloud_blobs(storage_key);

CREATE POLICY "Users manage own blobs" ON public.cloud_blobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all blobs" ON public.cloud_blobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. cloud_files
CREATE TABLE public.cloud_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.cloud_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT 'Untitled',
  blob_id UUID REFERENCES public.cloud_blobs(id),
  size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT DEFAULT 'application/octet-stream',
  checksum TEXT,
  version INT NOT NULL DEFAULT 1,
  deleted BOOLEAN NOT NULL DEFAULT false,
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_files ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_files_user ON public.cloud_files(user_id);
CREATE INDEX idx_cloud_files_folder ON public.cloud_files(folder_id);
CREATE INDEX idx_cloud_files_blob ON public.cloud_files(blob_id);

CREATE POLICY "Users manage own files" ON public.cloud_files FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all files" ON public.cloud_files FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cloud_files_updated_at BEFORE UPDATE ON public.cloud_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. cloud_file_versions
CREATE TABLE public.cloud_file_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_id UUID NOT NULL REFERENCES public.cloud_files(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  blob_id UUID REFERENCES public.cloud_blobs(id),
  size BIGINT NOT NULL DEFAULT 0,
  checksum TEXT,
  origin_device_id UUID,
  restore_point BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_file_versions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_file_versions_file ON public.cloud_file_versions(file_id);
CREATE INDEX idx_cloud_file_versions_user ON public.cloud_file_versions(user_id);

CREATE POLICY "Users manage own versions" ON public.cloud_file_versions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all versions" ON public.cloud_file_versions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. cloud_trash
CREATE TABLE public.cloud_trash (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  object_type TEXT NOT NULL DEFAULT 'file',
  object_id UUID NOT NULL,
  original_name TEXT,
  original_path TEXT,
  size BIGINT DEFAULT 0,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purge_after TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  deleted_by_device_id UUID
);
ALTER TABLE public.cloud_trash ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_trash_user ON public.cloud_trash(user_id);
CREATE INDEX idx_cloud_trash_purge ON public.cloud_trash(purge_after);

CREATE POLICY "Users manage own trash" ON public.cloud_trash FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all trash" ON public.cloud_trash FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. cloud_sync_objects
CREATE TABLE public.cloud_sync_objects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  namespace TEXT NOT NULL DEFAULT 'default',
  type TEXT NOT NULL DEFAULT 'generic',
  version INT NOT NULL DEFAULT 1,
  origin_device_id UUID,
  deleted BOOLEAN NOT NULL DEFAULT false,
  metadata_json JSONB DEFAULT '{}',
  blob_ref UUID,
  content_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_sync_objects ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_sync_objects_user ON public.cloud_sync_objects(user_id);
CREATE INDEX idx_cloud_sync_objects_ns ON public.cloud_sync_objects(user_id, namespace);

CREATE POLICY "Users manage own sync objects" ON public.cloud_sync_objects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all sync objects" ON public.cloud_sync_objects FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cloud_sync_objects_updated_at BEFORE UPDATE ON public.cloud_sync_objects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. cloud_sync_changes
CREATE TABLE public.cloud_sync_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  object_id UUID NOT NULL REFERENCES public.cloud_sync_objects(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL DEFAULT 'update',
  from_version INT,
  to_version INT,
  origin_device_id UUID,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_sync_changes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_sync_changes_user ON public.cloud_sync_changes(user_id);
CREATE INDEX idx_cloud_sync_changes_object ON public.cloud_sync_changes(object_id);

CREATE POLICY "Users manage own sync changes" ON public.cloud_sync_changes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all sync changes" ON public.cloud_sync_changes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. cloud_sync_checkpoints
CREATE TABLE public.cloud_sync_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id UUID NOT NULL,
  last_change_id UUID,
  namespace TEXT DEFAULT 'default',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_sync_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_cloud_sync_checkpoints_unique ON public.cloud_sync_checkpoints(user_id, device_id, namespace);

CREATE POLICY "Users manage own checkpoints" ON public.cloud_sync_checkpoints FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all checkpoints" ON public.cloud_sync_checkpoints FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cloud_sync_checkpoints_updated_at BEFORE UPDATE ON public.cloud_sync_checkpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. cloud_conflicts
CREATE TABLE public.cloud_conflicts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  object_id UUID NOT NULL,
  base_version INT NOT NULL DEFAULT 0,
  device_a UUID,
  device_b UUID,
  state TEXT NOT NULL DEFAULT 'pending',
  strategy TEXT DEFAULT 'last-write-wins',
  details JSONB DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_conflicts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_conflicts_user ON public.cloud_conflicts(user_id);
CREATE INDEX idx_cloud_conflicts_state ON public.cloud_conflicts(state);

CREATE POLICY "Users manage own conflicts" ON public.cloud_conflicts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all conflicts" ON public.cloud_conflicts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cloud_conflicts_updated_at BEFORE UPDATE ON public.cloud_conflicts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. cloud_shares
CREATE TABLE public.cloud_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL,
  target_user_id UUID,
  object_type TEXT NOT NULL DEFAULT 'file',
  object_id UUID NOT NULL,
  permission TEXT NOT NULL DEFAULT 'read',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_shares ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_shares_owner ON public.cloud_shares(owner_user_id);
CREATE INDEX idx_cloud_shares_target ON public.cloud_shares(target_user_id);

CREATE POLICY "Owners manage own shares" ON public.cloud_shares FOR ALL TO authenticated USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Targets can view shares" ON public.cloud_shares FOR SELECT TO authenticated USING (auth.uid() = target_user_id);
CREATE POLICY "Admins view all shares" ON public.cloud_shares FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cloud_shares_updated_at BEFORE UPDATE ON public.cloud_shares FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. cloud_device_sessions
CREATE TABLE public.cloud_device_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.cloud_devices(id) ON DELETE CASCADE,
  refresh_token_hash TEXT,
  push_token TEXT,
  last_ip TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_device_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_cloud_device_sessions_user ON public.cloud_device_sessions(user_id);
CREATE INDEX idx_cloud_device_sessions_device ON public.cloud_device_sessions(device_id);

CREATE POLICY "Users manage own sessions" ON public.cloud_device_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all sessions" ON public.cloud_device_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_cloud_device_sessions_updated_at BEFORE UPDATE ON public.cloud_device_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
