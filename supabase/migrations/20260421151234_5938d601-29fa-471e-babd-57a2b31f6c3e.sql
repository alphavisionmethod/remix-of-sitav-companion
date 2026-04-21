
-- SLA definitions table
CREATE TABLE public.sla_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  metric_key TEXT NOT NULL UNIQUE,
  target_value NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT '%',
  time_window TEXT NOT NULL DEFAULT '24h',
  breach_severity TEXT NOT NULL DEFAULT 'high',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage SLA definitions"
  ON public.sla_definitions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER set_sla_definitions_updated_at
  BEFORE UPDATE ON public.sla_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.sla_definitions (name, metric_key, target_value, unit, time_window, breach_severity) VALUES
  ('Platform Uptime', 'uptime_pct', 99.9, '%', '30d', 'critical'),
  ('API p95 Latency', 'api_p95_latency_ms', 200, 'ms', '24h', 'high'),
  ('Error Rate', 'error_rate_pct', 0.1, '%', '24h', 'high'),
  ('Incident MTTR', 'mttr_minutes', 240, 'min', '30d', 'high'),
  ('Data Recovery RTO', 'rto_minutes', 60, 'min', '30d', 'critical'),
  ('Alert Response Time', 'alert_response_minutes', 5, 'min', '24h', 'medium');

-- SLA snapshots table
CREATE TABLE public.sla_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sla_id UUID NOT NULL REFERENCES public.sla_definitions(id) ON DELETE CASCADE,
  current_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,
  met BOOLEAN NOT NULL DEFAULT true,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read SLA snapshots"
  ON public.sla_snapshots FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can write SLA snapshots"
  ON public.sla_snapshots FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_sla_snapshots_sla_id ON public.sla_snapshots (sla_id, computed_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.sla_snapshots;

-- Add escalation tracking to alerts
ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS escalation_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_escalated_at TIMESTAMPTZ;
