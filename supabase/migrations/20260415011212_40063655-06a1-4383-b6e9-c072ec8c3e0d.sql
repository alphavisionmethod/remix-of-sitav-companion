
-- 0. Role system foundation
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 1. Cloud Devices
CREATE TABLE public.cloud_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  platform TEXT NOT NULL DEFAULT 'web',
  client_version TEXT DEFAULT '1.0.0',
  trust_state TEXT NOT NULL DEFAULT 'trusted',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  is_current BOOLEAN DEFAULT false,
  requires_reauth BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own devices" ON public.cloud_devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own devices" ON public.cloud_devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all devices" ON public.cloud_devices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_cloud_devices_user ON public.cloud_devices(user_id);

-- 2. Cloud Storage Usage
CREATE TABLE public.cloud_storage_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  used_bytes BIGINT NOT NULL DEFAULT 0,
  quota_bytes BIGINT NOT NULL DEFAULT 5368709120,
  file_count INT NOT NULL DEFAULT 0,
  largest_file_bytes BIGINT DEFAULT 0,
  orphaned_blobs INT DEFAULT 0,
  failed_uploads INT DEFAULT 0,
  failed_downloads INT DEFAULT 0,
  last_reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_storage_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own storage" ON public.cloud_storage_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all storage" ON public.cloud_storage_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Cloud Sync Jobs
CREATE TABLE public.cloud_sync_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL DEFAULT 'reindex',
  target_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  progress_pct INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result_summary TEXT,
  error_message TEXT,
  triggered_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sync jobs" ON public.cloud_sync_jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Cloud Plans
CREATE TABLE public.cloud_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 5368709120,
  max_devices INT NOT NULL DEFAULT 3,
  max_file_size_bytes BIGINT NOT NULL DEFAULT 104857600,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_cents INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views plans" ON public.cloud_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage plans" ON public.cloud_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Cloud User Plans
CREATE TABLE public.cloud_user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_id UUID REFERENCES public.cloud_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  bonus_storage_bytes BIGINT DEFAULT 0,
  overage_allowed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own plan" ON public.cloud_user_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage user plans" ON public.cloud_user_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Cloud Audit Events
CREATE TABLE public.cloud_audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit" ON public.cloud_audit_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert audit" ON public.cloud_audit_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_cloud_audit_created ON public.cloud_audit_events(created_at DESC);

-- 7. Cloud Feature Flags
CREATE TABLE public.cloud_feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  scope TEXT NOT NULL DEFAULT 'global',
  conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage flags" ON public.cloud_feature_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Cloud Policies
CREATE TABLE public.cloud_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  enforced BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads policies" ON public.cloud_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage policies" ON public.cloud_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_cloud_devices_ts BEFORE UPDATE ON public.cloud_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_storage_ts BEFORE UPDATE ON public.cloud_storage_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_sync_jobs_ts BEFORE UPDATE ON public.cloud_sync_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_plans_ts BEFORE UPDATE ON public.cloud_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_user_plans_ts BEFORE UPDATE ON public.cloud_user_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_flags_ts BEFORE UPDATE ON public.cloud_feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_policies_ts BEFORE UPDATE ON public.cloud_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed plans
INSERT INTO public.cloud_plans (plan_key, display_name, storage_limit_bytes, max_devices, max_file_size_bytes, price_cents, features) VALUES
  ('free', 'Free', 5368709120, 3, 104857600, 0, '["5GB storage","3 devices","100MB file limit"]'::jsonb),
  ('pro', 'Pro', 107374182400, 10, 1073741824, 999, '["100GB storage","10 devices","1GB file limit","Priority sync","Version history"]'::jsonb),
  ('enterprise', 'Enterprise', 1099511627776, 50, 5368709120, 4999, '["1TB storage","50 devices","5GB file limit","Priority sync","Version history","Admin tools","SSO"]'::jsonb);
