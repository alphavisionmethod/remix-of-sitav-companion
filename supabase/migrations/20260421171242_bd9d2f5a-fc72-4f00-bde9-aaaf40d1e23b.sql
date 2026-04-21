-- ═══════════════════════════════════════════════════════════
-- 1. Alert Suppression Rules
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.alert_suppression_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subsystem TEXT,
  source TEXT,
  fingerprint_pattern TEXT,
  severity_filter TEXT[] DEFAULT '{}',
  reason TEXT NOT NULL DEFAULT '',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'manual',
  is_active BOOLEAN NOT NULL DEFAULT true,
  match_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alert_suppression_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own suppression rules" ON public.alert_suppression_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_suppression_rules_active ON public.alert_suppression_rules (is_active, expires_at) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════
-- 2. Alert Dedup Log
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.alert_dedup_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  dedup_key TEXT,
  occurrence_count INT NOT NULL DEFAULT 1,
  suppression_rule_id UUID REFERENCES public.alert_suppression_rules(id) ON DELETE SET NULL,
  was_deduplicated BOOLEAN NOT NULL DEFAULT false,
  was_suppressed BOOLEAN NOT NULL DEFAULT false,
  original_severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alert_dedup_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own dedup log" ON public.alert_dedup_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own dedup log" ON public.alert_dedup_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_dedup_log_fingerprint ON public.alert_dedup_log (fingerprint, created_at DESC);
CREATE INDEX idx_dedup_log_alert ON public.alert_dedup_log (alert_id);

-- ═══════════════════════════════════════════════════════════
-- 3. SLA Breach Contributing Events
-- ═══════════════════════════════════════════════════════════
CREATE TABLE public.sla_breach_contributing_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sla_alert_id UUID NOT NULL REFERENCES public.boardroom_followthrough_sla_alerts(id) ON DELETE CASCADE,
  contributing_alert_id UUID REFERENCES public.alerts(id) ON DELETE SET NULL,
  drill_result_id UUID,
  event_type TEXT NOT NULL DEFAULT 'alert',
  contribution_summary TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'medium',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sla_breach_contributing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own SLA breach events" ON public.sla_breach_contributing_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_sla_breach_events_sla ON public.sla_breach_contributing_events (sla_alert_id);
CREATE INDEX idx_sla_breach_events_alert ON public.sla_breach_contributing_events (contributing_alert_id);