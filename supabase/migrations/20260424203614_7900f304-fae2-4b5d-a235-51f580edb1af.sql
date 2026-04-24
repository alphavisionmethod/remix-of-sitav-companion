-- Phase 7 — Tighten SELECT policies on admin-infrastructure tables
-- (closes 7 security-scan findings; leaves all writes unchanged)

-- F2: admin_role_permissions
DROP POLICY IF EXISTS "Authenticated can view permissions" ON public.admin_role_permissions;
CREATE POLICY "admin_role_permissions_admin_select"
  ON public.admin_role_permissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- F3: cloud_admin_roles
DROP POLICY IF EXISTS "Auth users can view admin roles" ON public.cloud_admin_roles;
CREATE POLICY "cloud_admin_roles_admin_select"
  ON public.cloud_admin_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- F4: incident_classifications
DROP POLICY IF EXISTS "incident_classifications_read" ON public.incident_classifications;
CREATE POLICY "incident_classifications_admin_select"
  ON public.incident_classifications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- F5: kill_switch_drill_results
DROP POLICY IF EXISTS "Authenticated users can view drill results" ON public.kill_switch_drill_results;
CREATE POLICY "kill_switch_drill_results_admin_select"
  ON public.kill_switch_drill_results
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- F6: service_identity_registry
DROP POLICY IF EXISTS "Authenticated users can view service identities" ON public.service_identity_registry;
CREATE POLICY "service_identity_registry_admin_select"
  ON public.service_identity_registry
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- F7: api_gateway_routes
DROP POLICY IF EXISTS "Authenticated can view routes" ON public.api_gateway_routes;
CREATE POLICY "api_gateway_routes_admin_select"
  ON public.api_gateway_routes
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- F8: sla_snapshots
DROP POLICY IF EXISTS "Authenticated users can read SLA snapshots" ON public.sla_snapshots;
CREATE POLICY "sla_snapshots_admin_select"
  ON public.sla_snapshots
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));