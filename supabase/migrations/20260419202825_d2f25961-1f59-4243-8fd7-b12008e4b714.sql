
-- Phase 5–7 closure pack: Receipt completeness, connector reauth telemetry, security probes

-- 1. AI receipt completeness counter (materialized snapshot updated by cron)
CREATE TABLE IF NOT EXISTS public.ai_receipt_completeness_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  total_invocations bigint NOT NULL DEFAULT 0,
  invocations_with_receipt bigint NOT NULL DEFAULT 0,
  receipt_coverage_pct numeric(5,2) NOT NULL DEFAULT 0,
  missing_receipt_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_receipt_completeness_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_ai_receipt_snapshots"
  ON public.ai_receipt_completeness_snapshots FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Connector reauth events (UX telemetry: how many users hit reauth flow, time-to-resolve)
CREATE TABLE IF NOT EXISTS public.connector_reauth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  trigger_reason text NOT NULL,
  prompted_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolution_state text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_reauth_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own_reauth_events"
  ON public.connector_reauth_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users_insert_own_reauth_events"
  ON public.connector_reauth_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_reauth_events"
  ON public.connector_reauth_events FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_connector_reauth_user_provider
  ON public.connector_reauth_events (user_id, provider, prompted_at DESC);

-- 3. Security fabric runtime probes (live checks of 7-layer fabric components)
CREATE TABLE IF NOT EXISTS public.security_fabric_probe_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_name text NOT NULL,
  probe_id text NOT NULL,
  status text NOT NULL,
  observed_at timestamptz NOT NULL DEFAULT now(),
  expected jsonb NOT NULL DEFAULT '{}'::jsonb,
  observed jsonb NOT NULL DEFAULT '{}'::jsonb,
  severity text NOT NULL DEFAULT 'info',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.security_fabric_probe_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_security_probes"
  ON public.security_fabric_probe_results FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_security_probes_layer_observed
  ON public.security_fabric_probe_results (layer_name, observed_at DESC);

-- 4. App SDK extension manager registry (Phase 9 partial: plugin/widget extension lifecycle)
CREATE TABLE IF NOT EXISTS public.app_sdk_extensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL,
  extension_kind text NOT NULL,
  extension_id text NOT NULL,
  version text NOT NULL,
  manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  signature text,
  status text NOT NULL DEFAULT 'registered',
  registered_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (app_id, extension_kind, extension_id, version)
);
ALTER TABLE public.app_sdk_extensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_app_sdk_extensions"
  ON public.app_sdk_extensions FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "admins_write_app_sdk_extensions"
  ON public.app_sdk_extensions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger for app_sdk_extensions
CREATE TRIGGER trg_app_sdk_extensions_updated_at
  BEFORE UPDATE ON public.app_sdk_extensions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
