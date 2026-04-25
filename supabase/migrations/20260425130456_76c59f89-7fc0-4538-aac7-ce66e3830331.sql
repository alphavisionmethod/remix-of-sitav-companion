
CREATE TABLE IF NOT EXISTS public.health_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  date_of_birth DATE,
  sex_at_birth TEXT,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  blood_type TEXT,
  encrypted_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  encryption_key_version TEXT NOT NULL DEFAULT 'v1',
  consent_share_with_advisors BOOLEAN NOT NULL DEFAULT false,
  consent_share_with_routing BOOLEAN NOT NULL DEFAULT false,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_health_profile" ON public.health_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_health_profile" ON public.health_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_health_profile" ON public.health_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_health_profile" ON public.health_profiles FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_health_profiles_updated_at BEFORE UPDATE ON public.health_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.health_metric_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_kind TEXT NOT NULL,
  value_numeric NUMERIC,
  value_text TEXT,
  unit TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  source_ref TEXT,
  sensitivity TEXT NOT NULL DEFAULT 'standard',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_metric_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_health_metric_logs_user_recorded ON public.health_metric_logs (user_id, recorded_at DESC);
CREATE INDEX idx_health_metric_logs_user_kind ON public.health_metric_logs (user_id, metric_kind, recorded_at DESC);
CREATE POLICY "owner_select_health_metrics" ON public.health_metric_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_health_metrics" ON public.health_metric_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_health_metrics" ON public.health_metric_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_health_metrics" ON public.health_metric_logs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_health_metric_logs_updated_at BEFORE UPDATE ON public.health_metric_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.wearable_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  account_label TEXT,
  scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  last_sync_at TIMESTAMPTZ,
  sync_cursor TEXT,
  encrypted_credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  encryption_key_version TEXT NOT NULL DEFAULT 'v1',
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, account_label)
);
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_wearable_connections_user ON public.wearable_connections (user_id, status);
CREATE POLICY "owner_select_wearable_conn" ON public.wearable_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_wearable_conn" ON public.wearable_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_wearable_conn" ON public.wearable_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_wearable_conn" ON public.wearable_connections FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_wearable_connections_updated_at BEFORE UPDATE ON public.wearable_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.wearable_sync_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES public.wearable_connections(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress',
  signal_count INTEGER NOT NULL DEFAULT 0,
  receipt_id UUID,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wearable_sync_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_wearable_sync_events_user ON public.wearable_sync_events (user_id, started_at DESC);
CREATE INDEX idx_wearable_sync_events_conn ON public.wearable_sync_events (connection_id, started_at DESC);
CREATE POLICY "owner_select_wearable_sync" ON public.wearable_sync_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_wearable_sync" ON public.wearable_sync_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_wearable_sync" ON public.wearable_sync_events FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.health_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_kind TEXT NOT NULL DEFAULT 'medication',
  title TEXT NOT NULL,
  description TEXT,
  rrule TEXT,
  channel TEXT NOT NULL DEFAULT 'in_app',
  next_fire_at TIMESTAMPTZ,
  last_fired_at TIMESTAMPTZ,
  paused BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_reminders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_health_reminders_user_next ON public.health_reminders (user_id, next_fire_at);
CREATE POLICY "owner_select_health_reminders" ON public.health_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_health_reminders" ON public.health_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_health_reminders" ON public.health_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_health_reminders" ON public.health_reminders FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_health_reminders_updated_at BEFORE UPDATE ON public.health_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.health_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  specialty TEXT,
  appointment_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_appointments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_health_appointments_user_when ON public.health_appointments (user_id, appointment_at DESC);
CREATE POLICY "owner_select_health_appts" ON public.health_appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_health_appts" ON public.health_appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_health_appts" ON public.health_appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_health_appts" ON public.health_appointments FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_health_appointments_updated_at BEFORE UPDATE ON public.health_appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

UPDATE public.module_registry
   SET lifecycle = 'experimental', updated_at = now()
 WHERE pillar = 'health'
   AND module_id IN ('health.nutrition', 'health.wearables', 'health.medical', 'health.fitness', 'health.recovery', 'health.reminders');

INSERT INTO public.trust_action_catalog (action_key, pillar, label, description, risk_tier, require_approval, reversible, default_authority_level)
VALUES
  ('health.wearable.connect',   'health', 'Connect wearable device',  'Authorize a wearable provider and store credentials.', 'high',   true,  true, 'ask'),
  ('health.wearable.sync',      'health', 'Sync wearable data',       'Pull metrics from a connected wearable provider.',     'medium', false, true, 'pre_approved'),
  ('health.wearable.revoke',    'health', 'Revoke wearable',          'Disconnect a wearable provider and purge tokens.',     'medium', false, true, 'pre_approved'),
  ('health.appointment.cancel', 'health', 'Cancel appointment',       'Cancel a scheduled clinician appointment.',            'medium', false, true, 'ask'),
  ('health.reminder.create',    'health', 'Create health reminder',   'Schedule a medication or check-in reminder.',          'low',    false, true, 'pre_approved')
ON CONFLICT (action_key) DO NOTHING;
