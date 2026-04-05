
-- System Update Releases
CREATE TABLE public.system_update_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'stable',
  release_notes TEXT,
  download_url TEXT,
  checksum_sha256 TEXT,
  size_bytes BIGINT,
  is_critical BOOLEAN DEFAULT false,
  min_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_update_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read releases" ON public.system_update_releases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage releases" ON public.system_update_releases FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- System Update Devices
CREATE TABLE public.system_update_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  hostname TEXT,
  current_version TEXT NOT NULL DEFAULT '0.0.0',
  channel TEXT NOT NULL DEFAULT 'stable',
  hardware_profile JSONB DEFAULT '{}'::jsonb,
  last_check_at TIMESTAMPTZ,
  last_update_at TIMESTAMPTZ,
  auto_update_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);
ALTER TABLE public.system_update_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own devices" ON public.system_update_devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_system_update_devices_updated_at BEFORE UPDATE ON public.system_update_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- System Update Log
CREATE TABLE public.system_update_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.system_update_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  from_version TEXT,
  to_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_update_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own update logs" ON public.system_update_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own update logs" ON public.system_update_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own logs" ON public.system_update_log FOR UPDATE TO authenticated USING (auth.uid() = user_id);
