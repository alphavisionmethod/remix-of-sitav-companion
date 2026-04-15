
-- =============================================
-- BATCH 1: Platform Plane Separation Tables
-- =============================================

-- 1. Platform Planes Registry
CREATE TABLE public.platform_planes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plane_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#888888',
  icon TEXT NOT NULL DEFAULT 'layers',
  service_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_planes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage planes" ON public.platform_planes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view planes" ON public.platform_planes FOR SELECT TO authenticated USING (true);

-- 2. Plane Service Assignments
CREATE TABLE public.plane_service_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plane_id UUID NOT NULL REFERENCES public.platform_planes(id) ON DELETE CASCADE,
  service_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL DEFAULT 'backbone',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plane_id, service_key)
);
ALTER TABLE public.plane_service_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage assignments" ON public.plane_service_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view assignments" ON public.plane_service_assignments FOR SELECT TO authenticated USING (true);

-- 3. Admin Role Permissions (granular)
CREATE TABLE public.admin_role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_key TEXT NOT NULL,
  permission TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_key, permission)
);
ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage permissions" ON public.admin_role_permissions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view permissions" ON public.admin_role_permissions FOR SELECT TO authenticated USING (true);

-- 4. Admin Action Audit
CREATE TABLE public.admin_action_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  plane TEXT NOT NULL DEFAULT 'control',
  justification TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  session_id UUID,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_audit_actor ON public.admin_action_audit(actor_user_id);
CREATE INDEX idx_admin_audit_action ON public.admin_action_audit(action);
CREATE INDEX idx_admin_audit_created ON public.admin_action_audit(created_at DESC);
CREATE INDEX idx_admin_audit_plane ON public.admin_action_audit(plane);
ALTER TABLE public.admin_action_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit" ON public.admin_action_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert audit" ON public.admin_action_audit FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Admin Sessions
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 hours'),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  mfa_verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_sessions_user ON public.admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_status ON public.admin_sessions(status);
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.admin_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON public.admin_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage sessions" ON public.admin_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Environment Configs
CREATE TABLE public.environment_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  env_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  api_base_url TEXT,
  feature_flag_context JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  is_current BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.environment_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view envs" ON public.environment_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage envs" ON public.environment_configs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Token Classes
CREATE TABLE public.token_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  default_ttl_seconds INTEGER NOT NULL DEFAULT 3600,
  max_ttl_seconds INTEGER NOT NULL DEFAULT 86400,
  scope_template JSONB DEFAULT '[]',
  requires_mfa BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.token_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage tokens" ON public.token_classes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view tokens" ON public.token_classes FOR SELECT TO authenticated USING (true);

-- 8. API Gateway Routes
CREATE TABLE public.api_gateway_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_pattern TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  plane TEXT NOT NULL DEFAULT 'shared-core',
  required_token_class TEXT NOT NULL DEFAULT 'user',
  required_permission TEXT,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  description TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(route_pattern, method)
);
ALTER TABLE public.api_gateway_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage routes" ON public.api_gateway_routes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view routes" ON public.api_gateway_routes FOR SELECT TO authenticated USING (true);

-- 9. Device Ownership
CREATE TABLE public.device_ownership (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  device_type TEXT NOT NULL DEFAULT 'desktop',
  platform TEXT NOT NULL DEFAULT 'web',
  trust_level TEXT NOT NULL DEFAULT 'standard',
  permissions JSONB DEFAULT '[]',
  capabilities JSONB DEFAULT '[]',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  selective_sync_config JSONB DEFAULT '{}',
  revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID,
  revoke_scope TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(device_id, owner_user_id)
);
CREATE INDEX idx_device_ownership_owner ON public.device_ownership(owner_user_id);
CREATE INDEX idx_device_ownership_device ON public.device_ownership(device_id);
ALTER TABLE public.device_ownership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices" ON public.device_ownership FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can manage own devices" ON public.device_ownership FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can register devices" ON public.device_ownership FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Admins can view all devices" ON public.device_ownership FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all devices" ON public.device_ownership FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Support Access Grants
CREATE TABLE public.support_access_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_user_id UUID NOT NULL,
  granted_to_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'read-only',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  revoked_at TIMESTAMPTZ,
  actions_performed JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_support_grants_target ON public.support_access_grants(target_user_id);
CREATE INDEX idx_support_grants_grantee ON public.support_access_grants(granted_to_user_id);
ALTER TABLE public.support_access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Target user can view grants" ON public.support_access_grants FOR SELECT TO authenticated USING (auth.uid() = target_user_id);
CREATE POLICY "Grantee can view own grants" ON public.support_access_grants FOR SELECT TO authenticated USING (auth.uid() = granted_to_user_id);
CREATE POLICY "Admins can manage grants" ON public.support_access_grants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_platform_planes_updated_at BEFORE UPDATE ON public.platform_planes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plane_service_assignments_updated_at BEFORE UPDATE ON public.plane_service_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_role_permissions_updated_at BEFORE UPDATE ON public.admin_role_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_sessions_updated_at BEFORE UPDATE ON public.admin_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_environment_configs_updated_at BEFORE UPDATE ON public.environment_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_token_classes_updated_at BEFORE UPDATE ON public.token_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_gateway_routes_updated_at BEFORE UPDATE ON public.api_gateway_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_device_ownership_updated_at BEFORE UPDATE ON public.device_ownership FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_access_grants_updated_at BEFORE UPDATE ON public.support_access_grants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer for granular admin permission check
CREATE OR REPLACE FUNCTION public.has_admin_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_role_permissions arp
    JOIN public.cloud_admin_role_assignments cara ON cara.user_id = _user_id
    JOIN public.cloud_admin_roles car ON car.id = cara.role_id AND car.role_key = arp.role_key
    WHERE arp.permission = _permission
      AND arp.granted = true
  )
$$;
