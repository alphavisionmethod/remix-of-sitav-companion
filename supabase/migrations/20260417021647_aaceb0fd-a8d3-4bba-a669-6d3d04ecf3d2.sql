-- ═══════════════════════════════════════════════════════════════
-- Phase 22 — Connector Reality Closure
-- ═══════════════════════════════════════════════════════════════

-- ── 1. connector_registry (catalog) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.connector_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connector_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  connector_class TEXT NOT NULL DEFAULT 'integration',
  auth_method TEXT NOT NULL DEFAULT 'oauth2',
  read_supported BOOLEAN NOT NULL DEFAULT true,
  write_supported BOOLEAN NOT NULL DEFAULT false,
  sync_supported BOOLEAN NOT NULL DEFAULT true,
  webhook_supported BOOLEAN NOT NULL DEFAULT false,
  refresh_supported BOOLEAN NOT NULL DEFAULT true,
  launch_stage TEXT NOT NULL DEFAULT 'beta',
  default_scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  icon_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view connector registry"
  ON public.connector_registry FOR SELECT
  USING (true);
CREATE POLICY "Admins can manage connector registry"
  ON public.connector_registry FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_connector_registry_provider ON public.connector_registry(provider);
CREATE INDEX idx_connector_registry_class ON public.connector_registry(connector_class);

-- ── 2. connector_accounts ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connector_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  registry_id UUID REFERENCES public.connector_registry(id) ON DELETE SET NULL,
  connector_type TEXT NOT NULL,
  display_name TEXT,
  account_email TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  disconnected_at TIMESTAMPTZ,
  last_health_at TIMESTAMPTZ,
  last_health_status TEXT,
  demo_mode BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(connector_type, user_id)
);
ALTER TABLE public.connector_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own connector accounts"
  ON public.connector_accounts FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Users insert own connector accounts"
  ON public.connector_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own connector accounts"
  ON public.connector_accounts FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own connector accounts"
  ON public.connector_accounts FOR DELETE
  USING (auth.uid() = user_id);
CREATE INDEX idx_connector_accounts_user ON public.connector_accounts(user_id);
CREATE INDEX idx_connector_accounts_status ON public.connector_accounts(status);

-- ── 3. connector_oauth_tokens ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connector_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL UNIQUE REFERENCES public.connector_accounts(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  scopes_granted TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  expires_at TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  rotation_count INTEGER NOT NULL DEFAULT 0,
  reauth_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own oauth tokens"
  ON public.connector_oauth_tokens FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users manage own oauth tokens"
  ON public.connector_oauth_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_oauth_tokens_user ON public.connector_oauth_tokens(user_id);
CREATE INDEX idx_connector_oauth_tokens_expires ON public.connector_oauth_tokens(expires_at) WHERE refresh_token IS NOT NULL;

-- ── 4. connector_receipts (append-only) ───────────────────────
CREATE TABLE IF NOT EXISTS public.connector_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID,
  event_type TEXT NOT NULL,
  connector_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own connector receipts"
  ON public.connector_receipts FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Users insert own connector receipts"
  ON public.connector_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_receipts_user ON public.connector_receipts(user_id, created_at DESC);
CREATE INDEX idx_connector_receipts_account ON public.connector_receipts(account_id);

-- ── 5. connector_configs ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connector_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  sync_interval_min INTEGER NOT NULL DEFAULT 60,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, service)
);
ALTER TABLE public.connector_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own connector configs"
  ON public.connector_configs FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Users manage own connector configs"
  ON public.connector_configs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_configs_user ON public.connector_configs(user_id);

-- ── 6. consent_scope_records ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consent_scope_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_family TEXT NOT NULL,
  scope_value TEXT NOT NULL,
  scope_label TEXT,
  scope_category TEXT NOT NULL DEFAULT 'general',
  consent_type TEXT NOT NULL DEFAULT 'oauth',
  granted BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_scope_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own consent records"
  ON public.consent_scope_records FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Users insert own consent records"
  ON public.consent_scope_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own consent records"
  ON public.consent_scope_records FOR UPDATE
  USING (auth.uid() = user_id);
CREATE INDEX idx_consent_scope_user ON public.consent_scope_records(user_id, provider_family);

-- ── 7. webhook_events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  event_type TEXT,
  external_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature TEXT,
  signature_valid BOOLEAN,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  dead_letter BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, external_id)
);
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view all webhook events"
  ON public.webhook_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins manage webhook events"
  ON public.webhook_events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status, received_at) WHERE status = 'pending';
CREATE INDEX idx_webhook_events_dlq ON public.webhook_events(provider) WHERE dead_letter = true;
CREATE INDEX idx_webhook_events_provider ON public.webhook_events(provider, received_at DESC);

-- ── 8. connector_sync_cursors ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.connector_sync_cursors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.connector_accounts(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  cursor TEXT,
  etag TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(account_id, resource_type)
);
ALTER TABLE public.connector_sync_cursors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sync cursors"
  ON public.connector_sync_cursors FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Users manage own sync cursors"
  ON public.connector_sync_cursors FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_sync_cursors_account ON public.connector_sync_cursors(account_id);

-- ── 9. EXTEND connector_sync_runs ─────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='connector_sync_runs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connector_sync_runs' AND column_name='cursor') THEN
      ALTER TABLE public.connector_sync_runs ADD COLUMN cursor TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connector_sync_runs' AND column_name='last_cursor') THEN
      ALTER TABLE public.connector_sync_runs ADD COLUMN last_cursor TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connector_sync_runs' AND column_name='resource_type') THEN
      ALTER TABLE public.connector_sync_runs ADD COLUMN resource_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connector_sync_runs' AND column_name='direction') THEN
      ALTER TABLE public.connector_sync_runs ADD COLUMN direction TEXT DEFAULT 'pull';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connector_sync_runs' AND column_name='error') THEN
      ALTER TABLE public.connector_sync_runs ADD COLUMN error TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connector_sync_runs' AND column_name='dead_letter') THEN
      ALTER TABLE public.connector_sync_runs ADD COLUMN dead_letter BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END IF;
END $$;

-- ── 10. Updated_at triggers ───────────────────────────────────
CREATE TRIGGER update_connector_registry_updated_at BEFORE UPDATE ON public.connector_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_accounts_updated_at BEFORE UPDATE ON public.connector_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_oauth_tokens_updated_at BEFORE UPDATE ON public.connector_oauth_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_configs_updated_at BEFORE UPDATE ON public.connector_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connector_sync_cursors_updated_at BEFORE UPDATE ON public.connector_sync_cursors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();