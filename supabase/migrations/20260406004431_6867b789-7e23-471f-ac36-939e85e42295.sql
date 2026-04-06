
-- ══════════════════════════════════════════════════════════════
-- UAO Wave — Unified Ambient Operating System Tables
-- ══════════════════════════════════════════════════════════════

-- 1. Device Families
CREATE TABLE public.device_families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  family_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  interaction_type TEXT NOT NULL DEFAULT 'active',
  screen_class TEXT DEFAULT 'standard',
  notification_type TEXT DEFAULT 'push',
  quick_action_support BOOLEAN DEFAULT false,
  trust_level TEXT DEFAULT 'standard',
  sensor_support TEXT[] DEFAULT '{}',
  passive_usage_support BOOLEAN DEFAULT false,
  offline_behavior TEXT DEFAULT 'queue',
  continuity_support BOOLEAN DEFAULT true,
  handoff_support BOOLEAN DEFAULT true,
  launch_stage TEXT DEFAULT 'planned',
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_key, user_id)
);

-- 2. Connected Devices
CREATE TABLE public.connected_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_family_id UUID REFERENCES public.device_families(id) ON DELETE SET NULL,
  device_name TEXT NOT NULL,
  device_identifier TEXT,
  platform TEXT,
  os_version TEXT,
  app_version TEXT,
  trust_level TEXT DEFAULT 'standard',
  biometric_capable BOOLEAN DEFAULT false,
  push_token TEXT,
  last_seen_at TIMESTAMPTZ,
  reachable BOOLEAN DEFAULT true,
  health_status TEXT DEFAULT 'unknown',
  notification_eligible BOOLEAN DEFAULT true,
  approval_eligible BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  mode TEXT DEFAULT 'real',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Wearable Providers
CREATE TABLE public.wearable_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  api_type TEXT DEFAULT 'rest',
  auth_method TEXT DEFAULT 'oauth2',
  supported_signals TEXT[] DEFAULT '{}',
  health_data_support BOOLEAN DEFAULT false,
  activity_data_support BOOLEAN DEFAULT false,
  sleep_data_support BOOLEAN DEFAULT false,
  readiness_data_support BOOLEAN DEFAULT false,
  notification_support BOOLEAN DEFAULT false,
  micro_action_support BOOLEAN DEFAULT false,
  requires_native_app BOOLEAN DEFAULT false,
  requires_partner_program BOOLEAN DEFAULT false,
  launch_stage TEXT DEFAULT 'planned',
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_key, user_id)
);

-- 4. Wearable Signals
CREATE TABLE public.wearable_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wearable_provider_id UUID REFERENCES public.wearable_providers(id) ON DELETE SET NULL,
  connected_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  signal_type TEXT NOT NULL,
  signal_value NUMERIC,
  signal_unit TEXT,
  signal_quality TEXT DEFAULT 'normal',
  confidence NUMERIC DEFAULT 0.8,
  privacy_tier TEXT DEFAULT 'confidential',
  consented BOOLEAN DEFAULT true,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Readiness States
CREATE TABLE public.readiness_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  readiness_level TEXT DEFAULT 'available',
  availability TEXT DEFAULT 'available',
  energy_estimate TEXT,
  stress_estimate TEXT,
  activity_state TEXT DEFAULT 'idle',
  workout_active BOOLEAN DEFAULT false,
  sleep_state TEXT DEFAULT 'awake',
  focus_mode BOOLEAN DEFAULT false,
  dnd_active BOOLEAN DEFAULT false,
  interruption_tolerance TEXT DEFAULT 'normal',
  derived_from TEXT[] DEFAULT '{}',
  confidence NUMERIC DEFAULT 0.5,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Presence States
CREATE TABLE public.presence_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  active_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  active_surface TEXT DEFAULT 'web',
  recent_surfaces TEXT[] DEFAULT '{}',
  focus_state TEXT DEFAULT 'normal',
  interruption_tolerance TEXT DEFAULT 'normal',
  motion_state TEXT DEFAULT 'unknown',
  session_id TEXT,
  handoff_eligible BOOLEAN DEFAULT true,
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Context Continuity Records
CREATE TABLE public.context_continuity_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT,
  surface TEXT NOT NULL,
  device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  active_task_ids TEXT[] DEFAULT '{}',
  active_workflow_ids TEXT[] DEFAULT '{}',
  open_approval_ids TEXT[] DEFAULT '{}',
  assistant_thread_id TEXT,
  assistant_context JSONB DEFAULT '{}',
  boardroom_context JSONB DEFAULT '{}',
  urgency_stack JSONB DEFAULT '[]',
  recent_entities TEXT[] DEFAULT '{}',
  scroll_position JSONB DEFAULT '{}',
  resumable BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Handoff Sessions
CREATE TABLE public.handoff_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_surface TEXT NOT NULL,
  source_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  target_surface TEXT NOT NULL,
  target_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  continuity_record_id UUID REFERENCES public.context_continuity_records(id) ON DELETE SET NULL,
  handoff_status TEXT DEFAULT 'initiated',
  handoff_quality TEXT DEFAULT 'unknown',
  friction_notes TEXT,
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Ambient Notification Routes
CREATE TABLE public.ambient_notification_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_name TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'normal',
  category TEXT,
  target_surface TEXT NOT NULL,
  target_device_family TEXT,
  condition_rules JSONB DEFAULT '{}',
  presence_requirement TEXT,
  readiness_requirement TEXT,
  quiet_hours_override BOOLEAN DEFAULT false,
  fatigue_aware BOOLEAN DEFAULT true,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Notification Fatigue Profiles
CREATE TABLE public.notification_fatigue_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  max_notifications_per_hour INTEGER DEFAULT 10,
  max_watch_notifications_per_hour INTEGER DEFAULT 3,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'UTC',
  focus_mode_behavior TEXT DEFAULT 'suppress_low',
  workout_behavior TEXT DEFAULT 'urgent_only',
  sleep_behavior TEXT DEFAULT 'silent',
  cooldown_minutes INTEGER DEFAULT 5,
  escalation_only_after_minutes INTEGER DEFAULT 15,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Device Trust Records
CREATE TABLE public.device_trust_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connected_device_id UUID REFERENCES public.connected_devices(id) ON DELETE CASCADE,
  trust_level TEXT DEFAULT 'standard',
  biometric_verified BOOLEAN DEFAULT false,
  approval_tier TEXT DEFAULT 'low',
  max_approval_amount_cents INTEGER,
  financial_actions_allowed BOOLEAN DEFAULT false,
  high_risk_actions_allowed BOOLEAN DEFAULT false,
  last_trust_verification_at TIMESTAMPTZ,
  trust_downgrade_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Micro Approval Policies
CREATE TABLE public.micro_approval_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_family_key TEXT NOT NULL,
  approval_class TEXT NOT NULL,
  allowed BOOLEAN DEFAULT false,
  requires_biometric BOOLEAN DEFAULT false,
  max_value_cents INTEGER,
  cooldown_seconds INTEGER DEFAULT 60,
  escalation_target TEXT DEFAULT 'phone',
  receipt_required BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Device Approval Receipts
CREATE TABLE public.device_approval_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connected_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  device_family_key TEXT,
  approval_class TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_summary TEXT,
  decision TEXT NOT NULL,
  biometric_used BOOLEAN DEFAULT false,
  trust_level_at_time TEXT,
  value_cents INTEGER,
  receipt_hash TEXT,
  metadata JSONB DEFAULT '{}',
  decided_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Assistant Role Presences
CREATE TABLE public.assistant_role_presences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_key TEXT NOT NULL,
  role_name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  intensity TEXT DEFAULT 'normal',
  proactive_mode BOOLEAN DEFAULT true,
  tone TEXT DEFAULT 'professional',
  escalation_behavior TEXT DEFAULT 'suggest',
  handoff_targets TEXT[] DEFAULT '{}',
  schedule TEXT DEFAULT 'always',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_key, user_id)
);

-- 15. Proactive Interventions
CREATE TABLE public.proactive_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intervention_type TEXT NOT NULL,
  source_role TEXT,
  title TEXT NOT NULL,
  body TEXT,
  urgency TEXT DEFAULT 'low',
  target_surface TEXT,
  consented BOOLEAN DEFAULT true,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  accepted BOOLEAN,
  dismissed BOOLEAN DEFAULT false,
  reversible BOOLEAN DEFAULT true,
  confidence NUMERIC DEFAULT 0.7,
  explanation TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Interruption Policies
CREATE TABLE public.interruption_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  policy_name TEXT NOT NULL,
  time_range_start TIME,
  time_range_end TIME,
  timezone TEXT DEFAULT 'UTC',
  activity_states TEXT[] DEFAULT '{}',
  device_families TEXT[] DEFAULT '{}',
  allowed_urgencies TEXT[] DEFAULT '{critical}',
  suppress_categories TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Health Signal Consents
CREATE TABLE public.health_signal_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_category TEXT NOT NULL,
  wearable_provider_id UUID REFERENCES public.wearable_providers(id) ON DELETE SET NULL,
  consented BOOLEAN DEFAULT false,
  consent_granted_at TIMESTAMPTZ,
  consent_revoked_at TIMESTAMPTZ,
  consent_reason TEXT,
  data_retention_days INTEGER DEFAULT 90,
  share_with_advisors BOOLEAN DEFAULT false,
  share_with_routing BOOLEAN DEFAULT true,
  visibility TEXT DEFAULT 'private',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(signal_category, wearable_provider_id, user_id)
);

-- 18. Health Signal Privacy
CREATE TABLE public.health_signal_privacy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_category TEXT NOT NULL,
  privacy_tier TEXT DEFAULT 'confidential',
  local_only BOOLEAN DEFAULT false,
  anonymize BOOLEAN DEFAULT false,
  redact_from_exports BOOLEAN DEFAULT true,
  retention_days INTEGER DEFAULT 90,
  visible_in_boardroom BOOLEAN DEFAULT false,
  visible_in_timeline BOOLEAN DEFAULT false,
  visible_to_advisors BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(signal_category, user_id)
);

-- 19. User Device Graph Edges
CREATE TABLE public.user_device_graph_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relationship TEXT NOT NULL,
  trust_level TEXT DEFAULT 'standard',
  consent_status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Surface Context States
CREATE TABLE public.surface_context_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface TEXT NOT NULL,
  device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  current_route TEXT,
  current_view TEXT,
  open_panels TEXT[] DEFAULT '{}',
  scroll_state JSONB DEFAULT '{}',
  active_filters JSONB DEFAULT '{}',
  last_active_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Ambient Launch Readiness
CREATE TABLE public.ambient_launch_readiness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_key TEXT NOT NULL,
  target_name TEXT NOT NULL,
  launch_label TEXT DEFAULT 'planned',
  supported BOOLEAN DEFAULT false,
  demo_available BOOLEAN DEFAULT false,
  internal_only BOOLEAN DEFAULT false,
  pilot_ready BOOLEAN DEFAULT false,
  launch_ready BOOLEAN DEFAULT false,
  blockers TEXT[] DEFAULT '{}',
  evidence JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(target_type, target_key, user_id)
);

-- ══════════════════════════════════════════════════════════════
-- RLS Policies
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.device_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_continuity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoff_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_notification_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_fatigue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_trust_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_approval_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_role_presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proactive_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interruption_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_signal_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_signal_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_device_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surface_context_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_launch_readiness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own device_families" ON public.device_families FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own connected_devices" ON public.connected_devices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own wearable_providers" ON public.wearable_providers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own wearable_signals" ON public.wearable_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own readiness_states" ON public.readiness_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own presence_states" ON public.presence_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own context_continuity_records" ON public.context_continuity_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own handoff_sessions" ON public.handoff_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own ambient_notification_routes" ON public.ambient_notification_routes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own notification_fatigue_profiles" ON public.notification_fatigue_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own device_trust_records" ON public.device_trust_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own micro_approval_policies" ON public.micro_approval_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own device_approval_receipts" ON public.device_approval_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own assistant_role_presences" ON public.assistant_role_presences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own proactive_interventions" ON public.proactive_interventions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own interruption_policies" ON public.interruption_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own health_signal_consents" ON public.health_signal_consents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own health_signal_privacy" ON public.health_signal_privacy FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own user_device_graph_edges" ON public.user_device_graph_edges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own surface_context_states" ON public.surface_context_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own ambient_launch_readiness" ON public.ambient_launch_readiness FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- Updated_at Triggers
-- ══════════════════════════════════════════════════════════════

CREATE TRIGGER update_device_families_updated_at BEFORE UPDATE ON public.device_families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connected_devices_updated_at BEFORE UPDATE ON public.connected_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wearable_providers_updated_at BEFORE UPDATE ON public.wearable_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_readiness_states_updated_at BEFORE UPDATE ON public.readiness_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_presence_states_updated_at BEFORE UPDATE ON public.presence_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_context_continuity_records_updated_at BEFORE UPDATE ON public.context_continuity_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ambient_notification_routes_updated_at BEFORE UPDATE ON public.ambient_notification_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_fatigue_profiles_updated_at BEFORE UPDATE ON public.notification_fatigue_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_device_trust_records_updated_at BEFORE UPDATE ON public.device_trust_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assistant_role_presences_updated_at BEFORE UPDATE ON public.assistant_role_presences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interruption_policies_updated_at BEFORE UPDATE ON public.interruption_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_signal_consents_updated_at BEFORE UPDATE ON public.health_signal_consents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_signal_privacy_updated_at BEFORE UPDATE ON public.health_signal_privacy FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_device_graph_edges_updated_at BEFORE UPDATE ON public.user_device_graph_edges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surface_context_states_updated_at BEFORE UPDATE ON public.surface_context_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ambient_launch_readiness_updated_at BEFORE UPDATE ON public.ambient_launch_readiness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
