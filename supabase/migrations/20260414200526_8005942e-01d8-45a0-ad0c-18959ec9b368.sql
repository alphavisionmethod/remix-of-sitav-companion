
-- OS Security Foundation: 10 tables with RLS

-- 1. os_user_accounts
CREATE TABLE public.os_user_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'active',
  password_hash_ref TEXT,
  profile_ref TEXT,
  enrolled_methods TEXT[] NOT NULL DEFAULT '{}',
  failed_attempts INT NOT NULL DEFAULT 0,
  lockout_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_user_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_user_accounts" ON public.os_user_accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_os_user_accounts_updated_at BEFORE UPDATE ON public.os_user_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. os_auth_methods
CREATE TABLE public.os_auth_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  method_type TEXT NOT NULL DEFAULT 'password',
  enabled BOOLEAN NOT NULL DEFAULT true,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  policy_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_auth_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_auth_methods" ON public.os_auth_methods FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_os_auth_methods_updated_at BEFORE UPDATE ON public.os_auth_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. os_sessions
CREATE TABLE public.os_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'standard',
  state TEXT NOT NULL DEFAULT 'active',
  locked BOOLEAN NOT NULL DEFAULT false,
  auth_fresh_until TIMESTAMPTZ,
  display_id TEXT DEFAULT ':0',
  seat_id TEXT DEFAULT 'seat0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_sessions" ON public.os_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_os_sessions_updated_at BEFORE UPDATE ON public.os_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. os_capabilities
CREATE TABLE public.os_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  sensitivity_level TEXT NOT NULL DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_capabilities" ON public.os_capabilities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. os_role_capabilities
CREATE TABLE public.os_role_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  default_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_role_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_role_capabilities" ON public.os_role_capabilities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. os_service_identities
CREATE TABLE public.os_service_identities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_uid TEXT NOT NULL,
  privileged BOOLEAN NOT NULL DEFAULT false,
  allowed_actions TEXT[] DEFAULT '{}',
  secret_scope TEXT[] DEFAULT '{}',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_service_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_service_identities" ON public.os_service_identities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. os_secrets_metadata
CREATE TABLE public.os_secrets_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  secret_id TEXT NOT NULL,
  owner_scope TEXT NOT NULL DEFAULT 'user',
  secret_type TEXT NOT NULL,
  keyring_id TEXT NOT NULL,
  label TEXT DEFAULT '',
  exportable BOOLEAN NOT NULL DEFAULT false,
  hardware_backed BOOLEAN NOT NULL DEFAULT false,
  access_policy_id TEXT,
  version INT NOT NULL DEFAULT 1,
  revoked BOOLEAN NOT NULL DEFAULT false,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_secrets_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_secrets_metadata" ON public.os_secrets_metadata FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_os_secrets_metadata_updated_at BEFORE UPDATE ON public.os_secrets_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. os_keyrings
CREATE TABLE public.os_keyrings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  keyring_id TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'user',
  protection_class TEXT NOT NULL DEFAULT 'standard',
  hardware_backed BOOLEAN NOT NULL DEFAULT false,
  secret_count INT NOT NULL DEFAULT 0,
  rotated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_keyrings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_keyrings" ON public.os_keyrings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. os_elevation_tokens
CREATE TABLE public.os_elevation_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_service TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  single_use BOOLEAN NOT NULL DEFAULT true,
  nonce TEXT,
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_elevation_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_elevation_tokens" ON public.os_elevation_tokens FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. os_audit_events
CREATE TABLE public.os_audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id TEXT NOT NULL,
  actor_session_id TEXT,
  actor_service TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  decision TEXT NOT NULL DEFAULT 'allowed',
  reason TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  correlation_id TEXT,
  auth_method TEXT,
  metadata JSONB DEFAULT '{}',
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_audit_events" ON public.os_audit_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_os_audit_events_severity ON public.os_audit_events(severity);
CREATE INDEX idx_os_audit_events_action ON public.os_audit_events(action);
CREATE INDEX idx_os_audit_events_ts ON public.os_audit_events(ts DESC);
