
-- ═══════════════════════════════════════════════════════════════
-- APP PLATFORM — Canonical schema (Phase 1)
-- ═══════════════════════════════════════════════════════════════

-- ── 1. apps (canonical catalog) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  short_name text,
  description text,
  publisher text,
  app_type text NOT NULL CHECK (app_type IN ('internal','web','pwa','external_desktop','pack')),
  launch_strategy text NOT NULL CHECK (launch_strategy IN (
    'internal_route','embedded_webview','external_browser','pwa_window',
    'native_binary','deep_link','electron_child_process'
  )),
  launch_target jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text,
  tags text[] DEFAULT ARRAY[]::text[],
  icon_url text,
  banner_url text,
  screenshots jsonb DEFAULT '[]'::jsonb,
  permissions_required jsonb DEFAULT '[]'::jsonb,
  supported_surfaces text[] DEFAULT ARRAY['desktop']::text[],
  installability text NOT NULL DEFAULT 'installable' CHECK (installability IN ('installable','preinstalled','unavailable','desktop_only')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified','publisher_verified','unverified','community')),
  trust_level text NOT NULL DEFAULT 'standard' CHECK (trust_level IN ('first_party','trusted','standard','restricted')),
  version text NOT NULL DEFAULT '1.0.0',
  latest_version text NOT NULL DEFAULT '1.0.0',
  update_channel text NOT NULL DEFAULT 'stable',
  enabled boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  pinned_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  requires_auth boolean NOT NULL DEFAULT true,
  requires_shell boolean NOT NULL DEFAULT true,
  offline_support text NOT NULL DEFAULT 'none' CHECK (offline_support IN ('none','partial','full')),
  window_defaults jsonb DEFAULT '{}'::jsonb,
  manifest_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_apps_category_type ON public.apps(category, app_type) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_apps_featured ON public.apps(featured, sort_order) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_apps_tags ON public.apps USING GIN(tags);

ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apps_public_read"
  ON public.apps FOR SELECT
  USING (enabled = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "apps_admin_insert"
  ON public.apps FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "apps_admin_update"
  ON public.apps FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "apps_admin_delete"
  ON public.apps FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER apps_set_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 2. installed_apps (per-user install state) ───────────────
CREATE TABLE IF NOT EXISTS public.installed_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_id text NOT NULL,
  install_status text NOT NULL DEFAULT 'installed' CHECK (install_status IN (
    'not_installed','installing','installed','updating','update_available','uninstalling','blocked'
  )),
  enabled boolean NOT NULL DEFAULT true,
  pinned boolean NOT NULL DEFAULT false,
  favorite boolean NOT NULL DEFAULT false,
  pinned_order integer NOT NULL DEFAULT 0,
  launch_count integer NOT NULL DEFAULT 0,
  last_launched_at timestamptz,
  version_installed text,
  permissions_granted jsonb DEFAULT '{}'::jsonb,
  config_json jsonb DEFAULT '{}'::jsonb,
  source_channel text NOT NULL DEFAULT 'store',
  installed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_installed_apps_user ON public.installed_apps(user_id, install_status);
CREATE INDEX IF NOT EXISTS idx_installed_apps_pinned ON public.installed_apps(user_id, pinned, pinned_order) WHERE pinned = true;
CREATE INDEX IF NOT EXISTS idx_installed_apps_recent ON public.installed_apps(user_id, last_launched_at DESC NULLS LAST);

ALTER TABLE public.installed_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "installed_apps_owner_select"
  ON public.installed_apps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "installed_apps_owner_insert"
  ON public.installed_apps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "installed_apps_owner_update"
  ON public.installed_apps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "installed_apps_owner_delete"
  ON public.installed_apps FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER installed_apps_set_updated_at
  BEFORE UPDATE ON public.installed_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 3. app_versions (release history) ────────────────────────
CREATE TABLE IF NOT EXISTS public.app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL,
  version text NOT NULL,
  release_notes text,
  manifest_json jsonb DEFAULT '{}'::jsonb,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_latest boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (app_id, version)
);

CREATE INDEX IF NOT EXISTS idx_app_versions_app ON public.app_versions(app_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_versions_latest ON public.app_versions(app_id) WHERE is_latest = true;

ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_versions_public_read"
  ON public.app_versions FOR SELECT USING (true);

CREATE POLICY "app_versions_admin_write"
  ON public.app_versions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ── 4. app_launch_events (telemetry, append-only) ────────────
CREATE TABLE IF NOT EXISTS public.app_launch_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_id text NOT NULL,
  launch_context jsonb DEFAULT '{}'::jsonb,
  launch_result text NOT NULL DEFAULT 'success' CHECK (launch_result IN ('success','degraded','failed','cancelled')),
  surface text NOT NULL DEFAULT 'desktop',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_launch_events_user ON public.app_launch_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_launch_events_expiry ON public.app_launch_events(expires_at);

ALTER TABLE public.app_launch_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_launch_events_owner_select"
  ON public.app_launch_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "app_launch_events_owner_insert"
  ON public.app_launch_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── 5. app_permissions_overrides ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_permissions_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_id text NOT NULL,
  permission_key text NOT NULL,
  permission_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  granted boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, app_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_app_perms_user_app ON public.app_permissions_overrides(user_id, app_id);

ALTER TABLE public.app_permissions_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_perms_owner_all"
  ON public.app_permissions_overrides FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER app_perms_set_updated_at
  BEFORE UPDATE ON public.app_permissions_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 6. app_sources (publisher / trust metadata) ──────────────
CREATE TABLE IF NOT EXISTS public.app_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL,
  source_type text NOT NULL DEFAULT 'first_party' CHECK (source_type IN ('first_party','publisher','community','enterprise','sideload')),
  source_url text,
  verified boolean NOT NULL DEFAULT false,
  signature_info jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (app_id, source_type)
);

CREATE INDEX IF NOT EXISTS idx_app_sources_app ON public.app_sources(app_id);

ALTER TABLE public.app_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_sources_public_read"
  ON public.app_sources FOR SELECT USING (true);

CREATE POLICY "app_sources_admin_write"
  ON public.app_sources FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER app_sources_set_updated_at
  BEFORE UPDATE ON public.app_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- SEED CATALOG — 28 apps across all 4 types
-- ═══════════════════════════════════════════════════════════════

-- Internal apps (8)
INSERT INTO public.apps (app_id, slug, name, short_name, description, publisher, app_type, launch_strategy, launch_target, category, tags, supported_surfaces, installability, verification_status, trust_level, featured, pinned_default, sort_order, requires_shell, offline_support) VALUES
('sita.business', 'business', 'Business OS', 'Business', 'Run your entire business — clients, ops, sales, projects.', 'SITA OS', 'internal', 'internal_route', '{"route":"/business"}'::jsonb, 'productivity', ARRAY['business','crm','ops'], ARRAY['desktop','mobile'], 'preinstalled', 'verified', 'first_party', true, true, 1, true, 'partial'),
('sita.money', 'money', 'Money', 'Money', 'Finance, accounting, taxes, invoices in one place.', 'SITA OS', 'internal', 'internal_route', '{"route":"/money"}'::jsonb, 'finance', ARRAY['finance','accounting','tax'], ARRAY['desktop','mobile'], 'preinstalled', 'verified', 'first_party', true, true, 2, true, 'partial'),
('sita.concierge', 'concierge', 'Concierge', 'Concierge', 'Your AI workforce — agents that work for you.', 'SITA OS', 'internal', 'internal_route', '{"route":"/concierge"}'::jsonb, 'productivity', ARRAY['ai','agents','automation'], ARRAY['desktop','mobile'], 'preinstalled', 'verified', 'first_party', true, true, 3, true, 'none'),
('sita.boardroom', 'boardroom', 'Boardroom', 'Boardroom', 'Strategic advisory board with AI partners.', 'SITA OS', 'internal', 'internal_route', '{"route":"/boardroom"}'::jsonb, 'productivity', ARRAY['strategy','advisory','board'], ARRAY['desktop'], 'preinstalled', 'verified', 'first_party', true, true, 4, true, 'none'),
('sita.mission-control', 'mission-control', 'Mission Control', 'Mission', 'OS-wide command and control surface.', 'SITA OS', 'internal', 'internal_route', '{"route":"/mission-control"}'::jsonb, 'productivity', ARRAY['os','control','dashboard'], ARRAY['desktop'], 'preinstalled', 'verified', 'first_party', true, true, 5, true, 'partial'),
('sita.files', 'files', 'Files', 'Files', 'Documents, vault, and AI-powered file intelligence.', 'SITA OS', 'internal', 'internal_route', '{"route":"/files"}'::jsonb, 'productivity', ARRAY['files','docs','vault'], ARRAY['desktop','mobile'], 'preinstalled', 'verified', 'first_party', true, true, 6, true, 'full'),
('sita.app-store', 'app-store', 'App Store', 'Store', 'Discover and install apps for SITA OS.', 'SITA OS', 'internal', 'internal_route', '{"route":"/apps/store"}'::jsonb, 'productivity', ARRAY['store','apps'], ARRAY['desktop','mobile'], 'preinstalled', 'verified', 'first_party', false, true, 7, true, 'partial'),
('sita.settings', 'settings', 'Settings', 'Settings', 'Manage your OS, account, security, and preferences.', 'SITA OS', 'internal', 'internal_route', '{"route":"/settings"}'::jsonb, 'productivity', ARRAY['settings','preferences'], ARRAY['desktop','mobile'], 'preinstalled', 'verified', 'first_party', false, false, 8, true, 'partial')
ON CONFLICT (app_id) DO NOTHING;

-- Web apps (8)
INSERT INTO public.apps (app_id, slug, name, short_name, description, publisher, app_type, launch_strategy, launch_target, category, tags, supported_surfaces, installability, verification_status, trust_level, featured, sort_order, window_defaults, offline_support) VALUES
('chatgpt', 'chatgpt', 'ChatGPT', 'ChatGPT', 'Conversational AI assistant from OpenAI.', 'OpenAI', 'web', 'embedded_webview', '{"url":"https://chat.openai.com","fallback":"external_browser"}'::jsonb, 'productivity', ARRAY['ai','chat','assistant','openai'], ARRAY['desktop','mobile'], 'installable', 'publisher_verified', 'trusted', true, 100, '{"width":1200,"height":800}'::jsonb, 'none'),
('whatsapp-web', 'whatsapp-web', 'WhatsApp Web', 'WhatsApp', 'Web client for WhatsApp messaging.', 'Meta', 'web', 'embedded_webview', '{"url":"https://web.whatsapp.com","fallback":"external_browser"}'::jsonb, 'communication', ARRAY['chat','messaging','meta'], ARRAY['desktop'], 'installable', 'publisher_verified', 'trusted', true, 101, '{"width":1100,"height":760}'::jsonb, 'partial'),
('gmail', 'gmail', 'Gmail', 'Gmail', 'Google email client in a dedicated window.', 'Google', 'web', 'embedded_webview', '{"url":"https://mail.google.com","fallback":"external_browser"}'::jsonb, 'communication', ARRAY['email','google'], ARRAY['desktop','mobile'], 'installable', 'publisher_verified', 'trusted', true, 102, '{"width":1280,"height":820}'::jsonb, 'partial'),
('google-calendar', 'google-calendar', 'Google Calendar', 'Calendar', 'Schedule and manage events with Google Calendar.', 'Google', 'web', 'embedded_webview', '{"url":"https://calendar.google.com","fallback":"external_browser"}'::jsonb, 'productivity', ARRAY['calendar','schedule','google'], ARRAY['desktop','mobile'], 'installable', 'publisher_verified', 'trusted', false, 103, '{"width":1280,"height":800}'::jsonb, 'partial'),
('notion', 'notion-web', 'Notion', 'Notion', 'All-in-one workspace for notes, docs, and projects.', 'Notion Labs', 'web', 'embedded_webview', '{"url":"https://www.notion.so","fallback":"external_browser"}'::jsonb, 'productivity', ARRAY['notes','docs','wiki'], ARRAY['desktop','mobile'], 'installable', 'publisher_verified', 'trusted', true, 104, '{"width":1280,"height":820}'::jsonb, 'partial'),
('slack-web', 'slack-web', 'Slack', 'Slack', 'Team messaging and collaboration.', 'Salesforce', 'web', 'embedded_webview', '{"url":"https://app.slack.com","fallback":"external_browser"}'::jsonb, 'communication', ARRAY['team','chat','workspace'], ARRAY['desktop','mobile'], 'installable', 'publisher_verified', 'trusted', false, 105, '{"width":1280,"height":820}'::jsonb, 'none'),
('figma-web', 'figma-web', 'Figma', 'Figma', 'Collaborative design and prototyping.', 'Figma', 'web', 'embedded_webview', '{"url":"https://www.figma.com/files","fallback":"external_browser"}'::jsonb, 'productivity', ARRAY['design','ui','collaboration'], ARRAY['desktop'], 'installable', 'publisher_verified', 'trusted', true, 106, '{"width":1440,"height":900}'::jsonb, 'none'),
('github-web', 'github-web', 'GitHub', 'GitHub', 'Code hosting, reviews, and collaboration.', 'GitHub', 'web', 'embedded_webview', '{"url":"https://github.com","fallback":"external_browser"}'::jsonb, 'developer-tools', ARRAY['code','git','collaboration'], ARRAY['desktop','mobile'], 'installable', 'publisher_verified', 'trusted', false, 107, '{"width":1280,"height":820}'::jsonb, 'none')
ON CONFLICT (app_id) DO NOTHING;

-- PWA-capable (6)
INSERT INTO public.apps (app_id, slug, name, short_name, description, publisher, app_type, launch_strategy, launch_target, category, tags, supported_surfaces, installability, verification_status, trust_level, sort_order, window_defaults, offline_support) VALUES
('linear-pwa', 'linear', 'Linear', 'Linear', 'Issue tracking and product planning.', 'Linear', 'pwa', 'pwa_window', '{"url":"https://linear.app","manifest":"https://linear.app/manifest.json","fallback":"embedded_webview"}'::jsonb, 'developer-tools', ARRAY['issues','planning','tracking'], ARRAY['desktop','pwa'], 'installable', 'publisher_verified', 'trusted', 200, '{"width":1280,"height":800}'::jsonb, 'partial'),
('canva-pwa', 'canva', 'Canva', 'Canva', 'Design anything: posters, presentations, social.', 'Canva', 'pwa', 'pwa_window', '{"url":"https://www.canva.com","fallback":"embedded_webview"}'::jsonb, 'productivity', ARRAY['design','graphics'], ARRAY['desktop','pwa'], 'installable', 'publisher_verified', 'trusted', 201, '{"width":1440,"height":900}'::jsonb, 'partial'),
('spotify-pwa', 'spotify-web', 'Spotify Web', 'Spotify', 'Music streaming in your browser or PWA.', 'Spotify', 'pwa', 'pwa_window', '{"url":"https://open.spotify.com","fallback":"embedded_webview"}'::jsonb, 'media', ARRAY['music','audio'], ARRAY['desktop','pwa'], 'installable', 'publisher_verified', 'trusted', 202, '{"width":1200,"height":760}'::jsonb, 'partial'),
('google-drive-pwa', 'google-drive', 'Google Drive', 'Drive', 'Cloud storage and file sharing.', 'Google', 'pwa', 'pwa_window', '{"url":"https://drive.google.com","fallback":"embedded_webview"}'::jsonb, 'productivity', ARRAY['storage','files','google'], ARRAY['desktop','pwa'], 'installable', 'publisher_verified', 'trusted', 203, '{"width":1280,"height":820}'::jsonb, 'partial'),
('twitter-pwa', 'twitter', 'X', 'X', 'Real-time conversations and news.', 'X Corp', 'pwa', 'pwa_window', '{"url":"https://x.com","fallback":"embedded_webview"}'::jsonb, 'communication', ARRAY['social','news'], ARRAY['desktop','pwa'], 'installable', 'publisher_verified', 'trusted', 204, '{"width":1100,"height":820}'::jsonb, 'partial'),
('youtube-pwa', 'youtube', 'YouTube', 'YouTube', 'Watch videos and live streams.', 'Google', 'pwa', 'pwa_window', '{"url":"https://www.youtube.com","fallback":"embedded_webview"}'::jsonb, 'media', ARRAY['video','streaming'], ARRAY['desktop','pwa','mobile'], 'installable', 'publisher_verified', 'trusted', 205, '{"width":1440,"height":900}'::jsonb, 'partial')
ON CONFLICT (app_id) DO NOTHING;

-- External desktop apps (6)
INSERT INTO public.apps (app_id, slug, name, short_name, description, publisher, app_type, launch_strategy, launch_target, category, tags, supported_surfaces, installability, verification_status, trust_level, sort_order, offline_support) VALUES
('chrome-desktop', 'chrome', 'Google Chrome', 'Chrome', 'Native Google Chrome browser.', 'Google', 'external_desktop', 'native_binary', '{"darwin":"/Applications/Google Chrome.app","win32":"chrome.exe","linux":"google-chrome","fallback_url":"https://www.google.com/chrome/"}'::jsonb, 'browsers', ARRAY['browser','google'], ARRAY['desktop'], 'desktop_only', 'publisher_verified', 'trusted', 300, 'full'),
('whatsapp-desktop', 'whatsapp', 'WhatsApp Desktop', 'WhatsApp', 'Native WhatsApp desktop client.', 'Meta', 'external_desktop', 'native_binary', '{"darwin":"/Applications/WhatsApp.app","win32":"WhatsApp.exe","fallback_url":"https://www.whatsapp.com/download"}'::jsonb, 'communication', ARRAY['chat','messaging'], ARRAY['desktop'], 'desktop_only', 'publisher_verified', 'trusted', 301, 'partial'),
('vscode-desktop', 'vscode', 'Visual Studio Code', 'VS Code', 'Powerful native code editor.', 'Microsoft', 'external_desktop', 'native_binary', '{"darwin":"/Applications/Visual Studio Code.app","win32":"Code.exe","linux":"code","fallback_url":"https://code.visualstudio.com/"}'::jsonb, 'developer-tools', ARRAY['code','editor'], ARRAY['desktop'], 'desktop_only', 'publisher_verified', 'trusted', 302, 'full'),
('cursor-desktop', 'cursor', 'Cursor', 'Cursor', 'AI-first code editor.', 'Anysphere', 'external_desktop', 'native_binary', '{"darwin":"/Applications/Cursor.app","win32":"Cursor.exe","fallback_url":"https://cursor.sh/"}'::jsonb, 'developer-tools', ARRAY['code','editor','ai'], ARRAY['desktop'], 'desktop_only', 'publisher_verified', 'trusted', 303, 'full'),
('spotify-desktop', 'spotify', 'Spotify', 'Spotify', 'Native Spotify desktop client.', 'Spotify', 'external_desktop', 'native_binary', '{"darwin":"/Applications/Spotify.app","win32":"Spotify.exe","fallback_url":"https://www.spotify.com/download/"}'::jsonb, 'media', ARRAY['music','audio'], ARRAY['desktop'], 'desktop_only', 'publisher_verified', 'trusted', 304, 'partial'),
('notion-desktop', 'notion', 'Notion Desktop', 'Notion', 'Native Notion desktop client.', 'Notion Labs', 'external_desktop', 'native_binary', '{"darwin":"/Applications/Notion.app","win32":"Notion.exe","fallback_url":"https://www.notion.so/desktop"}'::jsonb, 'productivity', ARRAY['notes','wiki'], ARRAY['desktop'], 'desktop_only', 'publisher_verified', 'trusted', 305, 'partial')
ON CONFLICT (app_id) DO NOTHING;

-- App versions (latest entries)
INSERT INTO public.app_versions (app_id, version, release_notes, is_latest)
SELECT app_id, latest_version, 'Initial release in catalog', true
FROM public.apps
ON CONFLICT (app_id, version) DO NOTHING;

-- App sources (publisher metadata)
INSERT INTO public.app_sources (app_id, source_type, source_url, verified, notes)
SELECT
  app_id,
  CASE WHEN trust_level = 'first_party' THEN 'first_party' ELSE 'publisher' END,
  CASE app_id
    WHEN 'chatgpt' THEN 'https://openai.com'
    WHEN 'whatsapp-web' THEN 'https://whatsapp.com'
    WHEN 'whatsapp-desktop' THEN 'https://whatsapp.com'
    WHEN 'gmail' THEN 'https://google.com'
    WHEN 'google-calendar' THEN 'https://google.com'
    WHEN 'google-drive-pwa' THEN 'https://google.com'
    WHEN 'chrome-desktop' THEN 'https://google.com'
    WHEN 'youtube-pwa' THEN 'https://google.com'
    WHEN 'notion' THEN 'https://notion.so'
    WHEN 'notion-desktop' THEN 'https://notion.so'
    WHEN 'slack-web' THEN 'https://slack.com'
    WHEN 'figma-web' THEN 'https://figma.com'
    WHEN 'github-web' THEN 'https://github.com'
    WHEN 'linear-pwa' THEN 'https://linear.app'
    WHEN 'canva-pwa' THEN 'https://canva.com'
    WHEN 'spotify-pwa' THEN 'https://spotify.com'
    WHEN 'spotify-desktop' THEN 'https://spotify.com'
    WHEN 'twitter-pwa' THEN 'https://x.com'
    WHEN 'vscode-desktop' THEN 'https://code.visualstudio.com'
    WHEN 'cursor-desktop' THEN 'https://cursor.sh'
    ELSE 'https://sita.os'
  END,
  true,
  'Seeded by app platform migration'
FROM public.apps
ON CONFLICT (app_id, source_type) DO NOTHING;
