
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Onboarding + Update System Tables
-- ═══════════════════════════════════════════════════════════════

-- Onboarding Sessions
CREATE TABLE public.onboarding_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  device_id TEXT NOT NULL,
  boot_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  state TEXT NOT NULL DEFAULT 'not_started',
  current_step TEXT NOT NULL DEFAULT 'welcome',
  version TEXT NOT NULL DEFAULT '1.0.0',
  interrupted BOOLEAN NOT NULL DEFAULT false,
  resume_token TEXT,
  managed_enrollment_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Steps
CREATE TABLE public.onboarding_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  step_name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  entered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  validation_error_code TEXT,
  validation_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Choices
CREATE TABLE public.onboarding_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value JSONB,
  source TEXT NOT NULL DEFAULT 'user',
  applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Hardware Detection
CREATE TABLE public.onboarding_hardware_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  hardware_model TEXT,
  battery_present BOOLEAN DEFAULT false,
  biometric_present BOOLEAN DEFAULT false,
  tpm_present BOOLEAN DEFAULT false,
  wifi_present BOOLEAN DEFAULT false,
  ethernet_present BOOLEAN DEFAULT false,
  bluetooth_present BOOLEAN DEFAULT false,
  display_resolution TEXT,
  storage_bytes BIGINT,
  memory_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Restore Sources
CREATE TABLE public.onboarding_restore_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'cloud',
  selected BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'available',
  metadata_ref TEXT,
  validation_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Completion Markers
CREATE TABLE public.onboarding_completion_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  marker_name TEXT NOT NULL,
  satisfied BOOLEAN NOT NULL DEFAULT false,
  satisfied_at TIMESTAMPTZ,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Channels
CREATE TABLE public.update_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL DEFAULT 'stable',
  enabled BOOLEAN NOT NULL DEFAULT true,
  user_selectable BOOLEAN NOT NULL DEFAULT true,
  policy_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Catalog
CREATE TABLE public.update_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  build_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'stable',
  update_type TEXT NOT NULL DEFAULT 'full',
  package_format TEXT DEFAULT 'image',
  metadata_hash TEXT,
  signature_ref TEXT,
  payload_size BIGINT DEFAULT 0,
  delta_from_version TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  critical BOOLEAN NOT NULL DEFAULT false,
  min_supported_version TEXT,
  rollout_percentage INTEGER DEFAULT 100,
  release_notes TEXT,
  components JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Preflight Results
CREATE TABLE public.update_preflight_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  battery_percent INTEGER,
  charger_connected BOOLEAN DEFAULT false,
  free_storage_bytes BIGINT,
  network_type TEXT,
  policy_allowed BOOLEAN DEFAULT true,
  channel_allowed BOOLEAN DEFAULT true,
  slot_available BOOLEAN DEFAULT true,
  passed BOOLEAN NOT NULL DEFAULT false,
  reason_code TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Staging
CREATE TABLE public.update_staging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  target_slot TEXT NOT NULL DEFAULT 'B',
  snapshot_id TEXT,
  state TEXT NOT NULL DEFAULT 'pending',
  integrity_verified BOOLEAN DEFAULT false,
  staged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Boot Attempts
CREATE TABLE public.update_boot_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  target_slot TEXT NOT NULL,
  reboot_requested_at TIMESTAMPTZ,
  booted_at TIMESTAMPTZ,
  startup_validation_ok BOOLEAN,
  health_validation_ok BOOLEAN,
  rollback_triggered BOOLEAN DEFAULT false,
  rollback_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update History
CREATE TABLE public.update_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  from_version TEXT,
  to_version TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'installed',
  actor TEXT NOT NULL DEFAULT 'system',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rollback Events
CREATE TABLE public.rollback_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  source_slot TEXT NOT NULL,
  rollback_to_slot TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'auto',
  reason_code TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Health Validation Results
CREATE TABLE public.health_validation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  component TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  details TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Slots (A/B partition tracking)
CREATE TABLE public.system_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  slot_id TEXT NOT NULL,
  version TEXT NOT NULL,
  build_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  boot_count INTEGER DEFAULT 0,
  health_status TEXT DEFAULT 'unknown',
  integrity_verified BOOLEAN DEFAULT false,
  last_boot_at TIMESTAMPTZ,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_hardware_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_restore_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_completion_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_preflight_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_boot_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_slots ENABLE ROW LEVEL SECURITY;

-- Users can manage their own data
CREATE POLICY "Users manage own onboarding sessions" ON public.onboarding_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own onboarding steps" ON public.onboarding_steps FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own onboarding choices" ON public.onboarding_choices FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own hw detection" ON public.onboarding_hardware_detection FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own restore sources" ON public.onboarding_restore_sources FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own completion markers" ON public.onboarding_completion_markers FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own update channels" ON public.update_channels FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read update catalog" ON public.update_catalog FOR SELECT USING (true);
CREATE POLICY "Users manage own preflight results" ON public.update_preflight_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own update staging" ON public.update_staging FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own boot attempts" ON public.update_boot_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own update history" ON public.update_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own rollback events" ON public.rollback_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own health validation" ON public.health_validation_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own system slots" ON public.system_slots FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_onboarding_sessions_user ON public.onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_steps_session ON public.onboarding_steps(session_id);
CREATE INDEX idx_onboarding_choices_session ON public.onboarding_choices(session_id);
CREATE INDEX idx_update_catalog_channel ON public.update_catalog(channel);
CREATE INDEX idx_update_history_user ON public.update_history(user_id);
CREATE INDEX idx_rollback_events_user ON public.rollback_events(user_id);
CREATE INDEX idx_system_slots_user ON public.system_slots(user_id);
