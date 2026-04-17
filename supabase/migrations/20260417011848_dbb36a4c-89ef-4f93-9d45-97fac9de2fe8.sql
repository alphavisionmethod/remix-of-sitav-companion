
-- ═══════════════════════════════════════════════════════════════
-- Phase 20 — Production Operations Reality Closure
-- 4 tables + 1 view + RLS for error monitoring, tracing, uptime, alerts
-- ═══════════════════════════════════════════════════════════════

-- ─── error_events ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.error_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('fatal','error','warning','info','debug')),
  source TEXT NOT NULL DEFAULT 'frontend' CHECK (source IN ('frontend','edge','cron','worker','external')),
  route TEXT,
  user_id UUID,
  tenant_id UUID,
  correlation_id TEXT,
  release TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  sentry_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_events_fingerprint_window
  ON public.error_events (fingerprint, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_events_severity_recent
  ON public.error_events (severity, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_events_user
  ON public.error_events (user_id, last_seen_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_error_events_unresolved
  ON public.error_events (last_seen_at DESC) WHERE resolved_at IS NULL;

ALTER TABLE public.error_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read all error events"
  ON public.error_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users read their own error events"
  ON public.error_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins update error events"
  ON public.error_events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- (writes happen via service role from edge functions)

-- ─── trace_spans ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trace_spans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trace_id TEXT NOT NULL,
  span_id TEXT NOT NULL,
  parent_span_id TEXT,
  service TEXT NOT NULL,
  operation TEXT NOT NULL,
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok','error','timeout','cancelled')),
  http_status INTEGER,
  user_id UUID,
  correlation_id TEXT,
  tags JSONB NOT NULL DEFAULT '{}'::jsonb,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trace_spans_trace ON public.trace_spans (trace_id);
CREATE INDEX IF NOT EXISTS idx_trace_spans_recent ON public.trace_spans (start_ts DESC);
CREATE INDEX IF NOT EXISTS idx_trace_spans_service_op ON public.trace_spans (service, operation, start_ts DESC);
CREATE INDEX IF NOT EXISTS idx_trace_spans_correlation ON public.trace_spans (correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trace_spans_errors ON public.trace_spans (start_ts DESC) WHERE status <> 'ok';

ALTER TABLE public.trace_spans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read trace spans"
  ON public.trace_spans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users read their own trace spans"
  ON public.trace_spans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ─── uptime_heartbeats ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uptime_heartbeats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL CHECK (source IN ('client','monitor','cron','external')),
  subsystem TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy','degraded','down','unknown')),
  latency_ms INTEGER,
  region TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_uptime_recent ON public.uptime_heartbeats (ts DESC);
CREATE INDEX IF NOT EXISTS idx_uptime_subsystem ON public.uptime_heartbeats (subsystem, ts DESC);
CREATE INDEX IF NOT EXISTS idx_uptime_source ON public.uptime_heartbeats (source, ts DESC);

ALTER TABLE public.uptime_heartbeats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read uptime heartbeats"
  ON public.uptime_heartbeats FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated users insert their own client heartbeats"
  ON public.uptime_heartbeats FOR INSERT TO authenticated
  WITH CHECK (source = 'client');

-- ─── uptime_status view ───────────────────────────────────────
CREATE OR REPLACE VIEW public.uptime_status
WITH (security_invoker = true)
AS
WITH windows AS (
  SELECT subsystem,
    COUNT(*) FILTER (WHERE ts > now() - interval '24 hours') AS h24_total,
    COUNT(*) FILTER (WHERE ts > now() - interval '24 hours' AND status = 'healthy') AS h24_healthy,
    COUNT(*) FILTER (WHERE ts > now() - interval '7 days') AS d7_total,
    COUNT(*) FILTER (WHERE ts > now() - interval '7 days' AND status = 'healthy') AS d7_healthy,
    COUNT(*) FILTER (WHERE ts > now() - interval '30 days') AS d30_total,
    COUNT(*) FILTER (WHERE ts > now() - interval '30 days' AND status = 'healthy') AS d30_healthy,
    MAX(ts) AS last_check_at,
    (ARRAY_AGG(status ORDER BY ts DESC))[1] AS current_status
  FROM public.uptime_heartbeats
  WHERE source IN ('cron','monitor')
  GROUP BY subsystem
)
SELECT subsystem,
  current_status,
  last_check_at,
  CASE WHEN h24_total = 0 THEN NULL ELSE ROUND(100.0 * h24_healthy / h24_total, 3) END AS uptime_24h_pct,
  CASE WHEN d7_total = 0 THEN NULL ELSE ROUND(100.0 * d7_healthy / d7_total, 3) END AS uptime_7d_pct,
  CASE WHEN d30_total = 0 THEN NULL ELSE ROUND(100.0 * d30_healthy / d30_total, 3) END AS uptime_30d_pct,
  h24_total, d7_total, d30_total
FROM windows;

-- ─── alerts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  source TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low','info')),
  subsystem TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','acknowledged','suppressed','resolved')),
  runbook_id TEXT,
  assignee_user_id UUID,
  dedup_key TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ack_at TIMESTAMPTZ,
  ack_by UUID,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  suppressed_until TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  related_incident_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_fingerprint ON public.alerts (fingerprint, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON public.alerts (last_seen_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts (severity, status, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_subsystem ON public.alerts (subsystem, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_assignee ON public.alerts (assignee_user_id, status) WHERE assignee_user_id IS NOT NULL;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read alerts"
  ON public.alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update alerts"
  ON public.alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ─── alert_routes ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alert_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_pattern TEXT NOT NULL,
  severity_min TEXT NOT NULL DEFAULT 'medium' CHECK (severity_min IN ('critical','high','medium','low','info')),
  channel TEXT NOT NULL CHECK (channel IN ('ui','email','push','webhook','sms')),
  target TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_routes_enabled ON public.alert_routes (enabled, severity_min);

ALTER TABLE public.alert_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage alert routes"
  ON public.alert_routes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ─── triggers ─────────────────────────────────────────────────
DROP TRIGGER IF EXISTS update_error_events_updated_at ON public.error_events;
CREATE TRIGGER update_error_events_updated_at
  BEFORE UPDATE ON public.error_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_alerts_updated_at ON public.alerts;
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_alert_routes_updated_at ON public.alert_routes;
CREATE TRIGGER update_alert_routes_updated_at
  BEFORE UPDATE ON public.alert_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── seed default UI alert route ──────────────────────────────
INSERT INTO public.alert_routes (source_pattern, severity_min, channel, target, enabled)
VALUES ('*', 'low', 'ui', 'admin-alert-board', true)
ON CONFLICT DO NOTHING;
