
-- ══════════════════════════════════════════════════════════════
-- SITA OS — App Platform persistence tables
-- ══════════════════════════════════════════════════════════════

-- 1. Installed apps per user
CREATE TABLE public.installed_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  install_status TEXT NOT NULL DEFAULT 'installed',
  install_scope TEXT NOT NULL DEFAULT 'user',
  sandbox_level TEXT NOT NULL DEFAULT 'standard',
  source_origin TEXT NOT NULL DEFAULT 'sita-store',
  package_type TEXT NOT NULL DEFAULT 'native-application',
  update_mode TEXT NOT NULL DEFAULT 'store-managed',
  permissions_granted JSONB NOT NULL DEFAULT '[]'::jsonb,
  dock_pinned BOOLEAN NOT NULL DEFAULT false,
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  startup_behavior TEXT NOT NULL DEFAULT 'none',
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, app_id)
);

ALTER TABLE public.installed_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own installed apps (select)"
  ON public.installed_apps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own installed apps (insert)"
  ON public.installed_apps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own installed apps (update)"
  ON public.installed_apps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own installed apps (delete)"
  ON public.installed_apps FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_installed_apps_updated_at
  BEFORE UPDATE ON public.installed_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Default app associations per user
CREATE TABLE public.app_default_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  app_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.app_default_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own app associations (select)"
  ON public.app_default_associations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own app associations (insert)"
  ON public.app_default_associations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own app associations (update)"
  ON public.app_default_associations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own app associations (delete)"
  ON public.app_default_associations FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_app_default_associations_updated_at
  BEFORE UPDATE ON public.app_default_associations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_installed_apps_user ON public.installed_apps (user_id);
CREATE INDEX idx_installed_apps_app ON public.installed_apps (user_id, app_id);
CREATE INDEX idx_app_default_assoc_user ON public.app_default_associations (user_id);
