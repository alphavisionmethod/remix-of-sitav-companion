-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: cloud-infrastructure
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 2
-- Last generated: 2026-04-16T21:25:36.058Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260415064703_3d3342c8-4dd3-41a3-a234-2d3c5a447a37.sql ──
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

-- ── 20260415070235_4adee37e-dd6e-4748-b088-92573df26421.sql ──
-- ============================================================
-- SITA OS Part 2 Batch 1: Deep Platform Operations (~27 tables)
-- ============================================================

-- === TENANT / ORGANIZATION ===

CREATE TABLE public.cloud_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'team',
  region text DEFAULT 'us-east-1',
  residency text DEFAULT 'standard',
  status text NOT NULL DEFAULT 'active',
  owner_user_id uuid NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_tenants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.cloud_tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  invited_by uuid,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
ALTER TABLE public.cloud_tenant_memberships ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_tenant_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.cloud_tenants(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.cloud_plans(id),
  storage_limit_bytes bigint NOT NULL DEFAULT 10737418240,
  max_members int NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_tenant_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_tenant_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.cloud_tenants(id) ON DELETE CASCADE,
  used_bytes bigint NOT NULL DEFAULT 0,
  quota_bytes bigint NOT NULL DEFAULT 10737418240,
  file_count int NOT NULL DEFAULT 0,
  last_reconciled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_tenant_quotas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_tenant_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.cloud_tenants(id) ON DELETE CASCADE,
  policy_key text NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  value_json jsonb NOT NULL DEFAULT '{}',
  enforced boolean NOT NULL DEFAULT true,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, policy_key)
);
ALTER TABLE public.cloud_tenant_policies ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_shared_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.cloud_tenants(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  owner_user_id uuid NOT NULL,
  visibility text NOT NULL DEFAULT 'internal',
  settings jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_shared_workspaces ENABLE ROW LEVEL SECURITY;

-- === STORAGE BACKEND & TIERING ===

CREATE TABLE public.cloud_storage_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  provider_type text NOT NULL DEFAULT 's3',
  endpoint text DEFAULT '',
  region text DEFAULT '',
  bucket_name text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  capabilities jsonb DEFAULT '[]',
  config jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_storage_providers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_storage_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  provider_id uuid REFERENCES public.cloud_storage_providers(id),
  cost_per_gb_cents numeric NOT NULL DEFAULT 0,
  retrieval_latency_ms int NOT NULL DEFAULT 0,
  min_retention_days int NOT NULL DEFAULT 0,
  tier_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_storage_tiers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_lifecycle_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  rule_name text NOT NULL DEFAULT '',
  source_tier text DEFAULT 'hot',
  target_tier text DEFAULT 'cold',
  condition_type text NOT NULL DEFAULT 'age_days',
  condition_value int NOT NULL DEFAULT 90,
  applies_to text NOT NULL DEFAULT 'all',
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_lifecycle_rules ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_archive_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  object_id uuid NOT NULL,
  object_type text NOT NULL DEFAULT 'file',
  direction text NOT NULL DEFAULT 'archive',
  source_tier text DEFAULT 'hot',
  target_tier text DEFAULT 'cold',
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_archive_jobs ENABLE ROW LEVEL SECURITY;

-- === PROCESSING & SEARCH ===

CREATE TABLE public.cloud_preview_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_id uuid NOT NULL,
  job_type text NOT NULL DEFAULT 'thumbnail',
  status text NOT NULL DEFAULT 'pending',
  input_mime text,
  output_key text,
  output_mime text,
  dimensions jsonb,
  error_message text,
  attempts int NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_preview_jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  object_id uuid NOT NULL,
  object_type text NOT NULL DEFAULT 'file',
  name text NOT NULL DEFAULT '',
  path text DEFAULT '',
  mime_type text,
  tags text[] DEFAULT '{}',
  content_snippet text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  indexed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_search_index ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_activity_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT 'unknown',
  object_id uuid,
  object_type text,
  object_name text,
  device_id uuid,
  device_name text,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_activity_journal ENABLE ROW LEVEL SECURITY;

-- === WORKERS ===

CREATE TABLE public.cloud_worker_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL DEFAULT 'generic',
  status text NOT NULL DEFAULT 'pending',
  priority int NOT NULL DEFAULT 5,
  payload jsonb NOT NULL DEFAULT '{}',
  result jsonb,
  error_message text,
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 3,
  locked_by text,
  locked_at timestamptz,
  scheduled_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  dead_letter boolean NOT NULL DEFAULT false,
  idempotency_key text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_worker_jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_worker_jobs_status_priority ON public.cloud_worker_jobs(status, priority DESC, scheduled_at);
CREATE INDEX idx_worker_jobs_dead_letter ON public.cloud_worker_jobs(dead_letter) WHERE dead_letter = true;

-- === ADMIN RBAC ===

CREATE TABLE public.cloud_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  permissions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_admin_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_admin_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.cloud_admin_roles(id) ON DELETE CASCADE,
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);
ALTER TABLE public.cloud_admin_role_assignments ENABLE ROW LEVEL SECURITY;

-- === SUPPORT & ABUSE ===

CREATE TABLE public.cloud_support_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  support_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  actions_taken jsonb DEFAULT '[]',
  redacted_fields text[] DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_support_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_abuse_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL DEFAULT 'unknown',
  severity text NOT NULL DEFAULT 'medium',
  description text NOT NULL DEFAULT '',
  pattern_data jsonb DEFAULT '{}',
  device_id uuid,
  ip_address text,
  action_taken text DEFAULT 'none',
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_abuse_events ENABLE ROW LEVEL SECURITY;

-- === INTEGRITY & OPERATIONS ===

CREATE TABLE public.cloud_reconciliation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type text NOT NULL DEFAULT 'full',
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  orphaned_blobs int DEFAULT 0,
  missing_blobs int DEFAULT 0,
  size_mismatches int DEFAULT 0,
  quota_drifts int DEFAULT 0,
  broken_chains int DEFAULT 0,
  stale_tombstones int DEFAULT 0,
  repairs_applied int DEFAULT 0,
  affected_users int DEFAULT 0,
  details jsonb DEFAULT '{}',
  triggered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_reconciliation_runs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_import_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_type text NOT NULL DEFAULT 'export',
  source text DEFAULT '',
  destination text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  progress_pct int DEFAULT 0,
  total_items int DEFAULT 0,
  processed_items int DEFAULT 0,
  error_message text,
  download_url text,
  expires_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_import_export_jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_backup_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_type text NOT NULL DEFAULT 'full',
  status text NOT NULL DEFAULT 'pending',
  region text DEFAULT 'us-east-1',
  size_bytes bigint DEFAULT 0,
  object_count int DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  restore_tested_at timestamptz,
  retention_days int DEFAULT 30,
  triggered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_backup_snapshots ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_account_closure_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text DEFAULT '',
  stage text NOT NULL DEFAULT 'requested',
  export_completed boolean NOT NULL DEFAULT false,
  export_job_id uuid REFERENCES public.cloud_import_export_jobs(id),
  cancellation_deadline timestamptz,
  purge_completed_at timestamptz,
  secrets_destroyed boolean NOT NULL DEFAULT false,
  tombstone_finalized boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_account_closure_requests ENABLE ROW LEVEL SECURITY;

-- === GOVERNANCE ===

CREATE TABLE public.cloud_namespace_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  owner_type text NOT NULL DEFAULT 'system',
  owner_id text,
  schema_version int NOT NULL DEFAULT 1,
  data_class text NOT NULL DEFAULT 'standard',
  retention_class text NOT NULL DEFAULT 'default',
  encryption_class text NOT NULL DEFAULT 'standard',
  conflict_strategy text NOT NULL DEFAULT 'last-write-wins',
  searchable boolean NOT NULL DEFAULT true,
  exportable boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_namespace_registry ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_maintenance_modes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_key text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  active boolean NOT NULL DEFAULT false,
  activated_by uuid,
  activated_at timestamptz,
  deactivated_at timestamptz,
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_maintenance_modes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_compliance_hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_type text NOT NULL DEFAULT 'legal_hold',
  target_type text NOT NULL DEFAULT 'user',
  target_id uuid,
  status text NOT NULL DEFAULT 'active',
  reason text DEFAULT '',
  activated_by uuid,
  activated_at timestamptz DEFAULT now(),
  deactivated_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_compliance_hooks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_bootstrap_markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id uuid,
  marker_type text NOT NULL DEFAULT 'first_device',
  status text NOT NULL DEFAULT 'completed',
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_bootstrap_markers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cloud_metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key text NOT NULL DEFAULT '',
  metric_value numeric NOT NULL DEFAULT 0,
  dimensions jsonb DEFAULT '{}',
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- === INDEXES ===

CREATE INDEX idx_tenant_memberships_user ON public.cloud_tenant_memberships(user_id);
CREATE INDEX idx_tenant_memberships_tenant ON public.cloud_tenant_memberships(tenant_id);
CREATE INDEX idx_activity_journal_user ON public.cloud_activity_journal(user_id, created_at DESC);
CREATE INDEX idx_search_index_user ON public.cloud_search_index(user_id);
CREATE INDEX idx_search_index_name ON public.cloud_search_index USING gin(to_tsvector('english', name));
CREATE INDEX idx_preview_jobs_status ON public.cloud_preview_jobs(status);
CREATE INDEX idx_archive_jobs_status ON public.cloud_archive_jobs(status);
CREATE INDEX idx_abuse_events_user ON public.cloud_abuse_events(user_id, created_at DESC);
CREATE INDEX idx_reconciliation_status ON public.cloud_reconciliation_runs(status);
CREATE INDEX idx_import_export_user ON public.cloud_import_export_jobs(user_id);
CREATE INDEX idx_compliance_hooks_target ON public.cloud_compliance_hooks(target_type, target_id);
CREATE INDEX idx_bootstrap_markers_user ON public.cloud_bootstrap_markers(user_id);
CREATE INDEX idx_metrics_snapshots_key ON public.cloud_metrics_snapshots(metric_key, snapshot_at DESC);
CREATE INDEX idx_lifecycle_rules_user ON public.cloud_lifecycle_rules(user_id);
CREATE INDEX idx_account_closure_user ON public.cloud_account_closure_requests(user_id);

-- === UPDATED_AT TRIGGERS ===

CREATE TRIGGER update_cloud_tenants_updated_at BEFORE UPDATE ON public.cloud_tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_tenant_memberships_updated_at BEFORE UPDATE ON public.cloud_tenant_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_tenant_plans_updated_at BEFORE UPDATE ON public.cloud_tenant_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_tenant_quotas_updated_at BEFORE UPDATE ON public.cloud_tenant_quotas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_tenant_policies_updated_at BEFORE UPDATE ON public.cloud_tenant_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_shared_workspaces_updated_at BEFORE UPDATE ON public.cloud_shared_workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_storage_providers_updated_at BEFORE UPDATE ON public.cloud_storage_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_storage_tiers_updated_at BEFORE UPDATE ON public.cloud_storage_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_lifecycle_rules_updated_at BEFORE UPDATE ON public.cloud_lifecycle_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_archive_jobs_updated_at BEFORE UPDATE ON public.cloud_archive_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_preview_jobs_updated_at BEFORE UPDATE ON public.cloud_preview_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_search_index_updated_at BEFORE UPDATE ON public.cloud_search_index FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_worker_jobs_updated_at BEFORE UPDATE ON public.cloud_worker_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_admin_roles_updated_at BEFORE UPDATE ON public.cloud_admin_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_admin_role_assignments_updated_at BEFORE UPDATE ON public.cloud_admin_role_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_support_sessions_updated_at BEFORE UPDATE ON public.cloud_support_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_abuse_events_updated_at BEFORE UPDATE ON public.cloud_abuse_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_reconciliation_runs_updated_at BEFORE UPDATE ON public.cloud_reconciliation_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_import_export_jobs_updated_at BEFORE UPDATE ON public.cloud_import_export_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_backup_snapshots_updated_at BEFORE UPDATE ON public.cloud_backup_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_account_closure_requests_updated_at BEFORE UPDATE ON public.cloud_account_closure_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_namespace_registry_updated_at BEFORE UPDATE ON public.cloud_namespace_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_maintenance_modes_updated_at BEFORE UPDATE ON public.cloud_maintenance_modes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_compliance_hooks_updated_at BEFORE UPDATE ON public.cloud_compliance_hooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- === TENANT MEMBERSHIP CHECK FUNCTION ===

CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cloud_tenant_memberships
    WHERE user_id = _user_id AND tenant_id = _tenant_id
  )
$$;

-- === RLS POLICIES ===

-- cloud_tenants: owner or member can see, owner can modify
CREATE POLICY "Tenant members can view" ON public.cloud_tenants FOR SELECT TO authenticated
  USING (public.is_tenant_member(auth.uid(), id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can update tenant" ON public.cloud_tenants FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Auth users can create tenants" ON public.cloud_tenants FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Owner can delete tenant" ON public.cloud_tenants FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- cloud_tenant_memberships
CREATE POLICY "Members can view memberships" ON public.cloud_tenant_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenant members can insert memberships" ON public.cloud_tenant_memberships FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Own membership or admin can update" ON public.cloud_tenant_memberships FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Own membership or admin can delete" ON public.cloud_tenant_memberships FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- cloud_tenant_plans, quotas, policies: tenant members can view, admins can modify
CREATE POLICY "Tenant members can view plans" ON public.cloud_tenant_plans FOR SELECT TO authenticated
  USING (public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can manage tenant plans" ON public.cloud_tenant_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenant members can view quotas" ON public.cloud_tenant_quotas FOR SELECT TO authenticated
  USING (public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can manage tenant quotas" ON public.cloud_tenant_quotas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenant members can view policies" ON public.cloud_tenant_policies FOR SELECT TO authenticated
  USING (public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can manage tenant policies" ON public.cloud_tenant_policies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- cloud_shared_workspaces
CREATE POLICY "Tenant members can view workspaces" ON public.cloud_shared_workspaces FOR SELECT TO authenticated
  USING (public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenant members can create workspaces" ON public.cloud_shared_workspaces FOR INSERT TO authenticated
  WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));
CREATE POLICY "Owner or admin can update workspace" ON public.cloud_shared_workspaces FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner or admin can delete workspace" ON public.cloud_shared_workspaces FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Global config tables: authenticated read, admin write
CREATE POLICY "Auth users can view providers" ON public.cloud_storage_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage providers" ON public.cloud_storage_providers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth users can view tiers" ON public.cloud_storage_tiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage tiers" ON public.cloud_storage_tiers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth users can view admin roles" ON public.cloud_admin_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage admin roles" ON public.cloud_admin_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth users can view maintenance" ON public.cloud_maintenance_modes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage maintenance" ON public.cloud_maintenance_modes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth users can view namespaces" ON public.cloud_namespace_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage namespaces" ON public.cloud_namespace_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User-scoped tables
CREATE POLICY "Users own lifecycle rules" ON public.cloud_lifecycle_rules FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view lifecycle rules" ON public.cloud_lifecycle_rules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users own archive jobs" ON public.cloud_archive_jobs FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view archive jobs" ON public.cloud_archive_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users own preview jobs" ON public.cloud_preview_jobs FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view preview jobs" ON public.cloud_preview_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users own search index" ON public.cloud_search_index FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view search index" ON public.cloud_search_index FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users own activity journal" ON public.cloud_activity_journal FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view activity journal" ON public.cloud_activity_journal FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users own import export jobs" ON public.cloud_import_export_jobs FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view import export" ON public.cloud_import_export_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users own account closure" ON public.cloud_account_closure_requests FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view account closure" ON public.cloud_account_closure_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users own bootstrap markers" ON public.cloud_bootstrap_markers FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can view bootstrap markers" ON public.cloud_bootstrap_markers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Worker jobs: user can see own, admin sees all
CREATE POLICY "Users own worker jobs" ON public.cloud_worker_jobs FOR ALL TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Admin can manage worker jobs" ON public.cloud_worker_jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only tables
CREATE POLICY "Admin can manage role assignments" ON public.cloud_admin_role_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own role assignments" ON public.cloud_admin_role_assignments FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admin can manage support sessions" ON public.cloud_support_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Support user can view own sessions" ON public.cloud_support_sessions FOR SELECT TO authenticated USING (support_user_id = auth.uid());

CREATE POLICY "Admin can manage abuse events" ON public.cloud_abuse_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage reconciliation" ON public.cloud_reconciliation_runs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage backups" ON public.cloud_backup_snapshots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage compliance" ON public.cloud_compliance_hooks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage metrics" ON public.cloud_metrics_snapshots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Auth users can view metrics" ON public.cloud_metrics_snapshots FOR SELECT TO authenticated USING (true);
