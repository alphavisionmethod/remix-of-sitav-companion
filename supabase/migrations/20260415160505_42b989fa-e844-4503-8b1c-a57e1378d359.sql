-- notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel TEXT NOT NULL DEFAULT 'in_app',
  scope TEXT NOT NULL DEFAULT 'all',
  enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  urgency_filter TEXT NOT NULL DEFAULT 'all',
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel, scope)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification prefs"
  ON public.notification_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- communication_metrics table
CREATE TABLE IF NOT EXISTS public.communication_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  user_id UUID NOT NULL,
  device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.communication_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own comm metrics"
  ON public.communication_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own comm metrics"
  ON public.communication_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_comm_metrics_type ON public.communication_metrics(metric_type);
CREATE INDEX idx_comm_metrics_user ON public.communication_metrics(user_id);
CREATE INDEX idx_comm_metrics_created ON public.communication_metrics(created_at DESC);