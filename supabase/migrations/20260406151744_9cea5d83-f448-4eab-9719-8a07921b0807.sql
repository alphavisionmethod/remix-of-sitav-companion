
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Apple + Android Ecosystem Runtime Tables
-- ═══════════════════════════════════════════════════════════════

-- 1. Ecosystem Devices (unified Apple + Android)
CREATE TABLE public.ecosystem_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  surface TEXT NOT NULL,
  device_model TEXT NOT NULL,
  os_version TEXT NOT NULL DEFAULT '',
  manufacturer TEXT DEFAULT '',
  push_token TEXT,
  push_channel TEXT NOT NULL DEFAULT 'none',
  trust_class TEXT NOT NULL DEFAULT 'untrusted',
  biometric_capable BOOLEAN DEFAULT false,
  biometric_types TEXT[] DEFAULT '{}',
  play_services_available BOOLEAN,
  continuity_eligible BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ecosystem devices" ON public.ecosystem_devices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ecosystem_devices_user ON public.ecosystem_devices(user_id);
CREATE INDEX idx_ecosystem_devices_ecosystem ON public.ecosystem_devices(ecosystem, surface);
CREATE TRIGGER update_ecosystem_devices_updated_at BEFORE UPDATE ON public.ecosystem_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Ecosystem Trust Records
CREATE TABLE public.ecosystem_trust_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.ecosystem_devices(id) ON DELETE CASCADE,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  trust_class TEXT NOT NULL DEFAULT 'untrusted',
  biometric_verified BOOLEAN DEFAULT false,
  biometric_type TEXT,
  keystore_secured BOOLEAN DEFAULT false,
  attestation_verified BOOLEAN DEFAULT false,
  approval_eligible_classes TEXT[] DEFAULT '{}',
  risk_tier_ceiling TEXT NOT NULL DEFAULT 'low' CHECK (risk_tier_ceiling IN ('low', 'medium', 'high')),
  escalation_target TEXT,
  device_bound_receipts BOOLEAN DEFAULT false,
  session_duration TEXT DEFAULT '24h',
  reauth_method TEXT DEFAULT 'biometric',
  last_verified_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_trust_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trust records" ON public.ecosystem_trust_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ecosystem_trust_user ON public.ecosystem_trust_records(user_id);
CREATE INDEX idx_ecosystem_trust_device ON public.ecosystem_trust_records(device_id);
CREATE TRIGGER update_ecosystem_trust_updated_at BEFORE UPDATE ON public.ecosystem_trust_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Ecosystem Health Consents
CREATE TABLE public.ecosystem_health_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  signal_type TEXT NOT NULL,
  read_permission BOOLEAN DEFAULT false,
  routing_influence_consent BOOLEAN DEFAULT false,
  assistant_use_consent BOOLEAN DEFAULT false,
  boardroom_visibility_consent BOOLEAN DEFAULT false,
  privacy_explanation_shown BOOLEAN DEFAULT false,
  consented_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ecosystem, signal_type)
);

ALTER TABLE public.ecosystem_health_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health consents" ON public.ecosystem_health_consents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_health_consents_user ON public.ecosystem_health_consents(user_id, ecosystem);
CREATE TRIGGER update_health_consents_updated_at BEFORE UPDATE ON public.ecosystem_health_consents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Ecosystem Push Routes
CREATE TABLE public.ecosystem_push_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.ecosystem_devices(id) ON DELETE CASCADE,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  channel TEXT NOT NULL,
  urgency_filter TEXT NOT NULL DEFAULT 'all' CHECK (urgency_filter IN ('all', 'high_and_critical', 'critical_only')),
  focus_mode_aware BOOLEAN DEFAULT false,
  dnd_aware BOOLEAN DEFAULT false,
  calm_router_integrated BOOLEAN DEFAULT false,
  routing_priority INTEGER DEFAULT 0,
  notification_channel_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_push_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push routes" ON public.ecosystem_push_routes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_push_routes_user ON public.ecosystem_push_routes(user_id);
CREATE TRIGGER update_push_routes_updated_at BEFORE UPDATE ON public.ecosystem_push_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Ecosystem Wearable Configs (Watch / Wear OS)
CREATE TABLE public.ecosystem_wearable_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.ecosystem_devices(id) ON DELETE CASCADE,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  watch_model TEXT NOT NULL DEFAULT '',
  watch_os_version TEXT NOT NULL DEFAULT '',
  complications_supported TEXT[] DEFAULT '{}',
  tiles_supported TEXT[] DEFAULT '{}',
  micro_actions_enabled BOOLEAN DEFAULT false,
  glanceable_states_enabled BOOLEAN DEFAULT false,
  haptic_routing_enabled BOOLEAN DEFAULT false,
  filtered_alerts_only BOOLEAN DEFAULT true,
  escalate_to_phone_enabled BOOLEAN DEFAULT true,
  max_risk_tier TEXT DEFAULT 'low' CHECK (max_risk_tier IN ('low', 'medium')),
  auto_escalate_sec INTEGER DEFAULT 120,
  urgency_patterns TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_wearable_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wearable configs" ON public.ecosystem_wearable_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wearable_configs_user ON public.ecosystem_wearable_configs(user_id);
CREATE TRIGGER update_wearable_configs_updated_at BEFORE UPDATE ON public.ecosystem_wearable_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Ecosystem Continuity Events
CREATE TABLE public.ecosystem_continuity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  source_device_id UUID REFERENCES public.ecosystem_devices(id) ON DELETE SET NULL,
  target_device_id UUID REFERENCES public.ecosystem_devices(id) ON DELETE SET NULL,
  source_surface TEXT NOT NULL,
  target_surface TEXT NOT NULL,
  handoff_type TEXT NOT NULL,
  context_ref TEXT,
  state TEXT NOT NULL DEFAULT 'available' CHECK (state IN ('available', 'active', 'completed', 'failed')),
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_continuity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own continuity events" ON public.ecosystem_continuity_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_continuity_events_user ON public.ecosystem_continuity_events(user_id);

-- 7. Ecosystem Launch Readiness
CREATE TABLE public.ecosystem_launch_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  target TEXT NOT NULL,
  target_name TEXT NOT NULL DEFAULT '',
  launch_stage TEXT NOT NULL DEFAULT 'planned' CHECK (launch_stage IN ('planned', 'internal', 'demo', 'pilot', 'launch_ready', 'production')),
  blockers TEXT[] DEFAULT '{}',
  demo_available BOOLEAN DEFAULT false,
  pilot_ready BOOLEAN DEFAULT false,
  launch_ready BOOLEAN DEFAULT false,
  evidence JSONB DEFAULT '{}',
  last_assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ecosystem, target)
);

ALTER TABLE public.ecosystem_launch_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own launch readiness" ON public.ecosystem_launch_readiness FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_launch_readiness_user ON public.ecosystem_launch_readiness(user_id, ecosystem);
CREATE TRIGGER update_launch_readiness_updated_at BEFORE UPDATE ON public.ecosystem_launch_readiness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
