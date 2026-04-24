-- Phase 7E — Audit-trail integrity hardening

-- config_change_history: require security.audit permission on INSERT
DROP POLICY IF EXISTS "Admins can insert config changes" ON public.config_change_history;
CREATE POLICY "config_change_history_admin_insert"
  ON public.config_change_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_admin_permission(auth.uid(), 'security.audit'::text)
    AND auth.uid() = actor_user_id
  );

-- admin_action_confirmations: require security.audit permission on INSERT
DROP POLICY IF EXISTS "Admins can create confirmations" ON public.admin_action_confirmations;
CREATE POLICY "admin_action_confirmations_admin_insert"
  ON public.admin_action_confirmations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_admin_permission(auth.uid(), 'security.audit'::text)
    AND auth.uid() = actor_user_id
  );

-- audit_logs: restrict INSERT to service role only (backend writes audit entries; users cannot fabricate)
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role inserts audit logs" ON public.audit_logs;
CREATE POLICY "audit_logs_service_role_insert"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'service_role'::text);