-- ═══════════════════════════════════════════════════════════
-- Fix 1: connector_sync_history — restrict to authenticated
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users insert own sync history" ON public.connector_sync_history;
DROP POLICY IF EXISTS "Users view own sync history" ON public.connector_sync_history;

CREATE POLICY "Authenticated users view own sync history"
  ON public.connector_sync_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users insert own sync history"
  ON public.connector_sync_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- Fix 2: user_roles — prevent privilege escalation
-- Split ALL into separate INSERT/DELETE, block UPDATE entirely
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Prevent self role grant" ON public.user_roles;

-- Admins can grant roles to OTHER users (not themselves)
CREATE POLICY "Admins can grant roles to others"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND user_id != auth.uid()
  );

-- Admins can revoke roles from OTHER users (not themselves)
CREATE POLICY "Admins can revoke roles from others"
  ON public.user_roles FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND user_id != auth.uid()
  );

-- No UPDATE on user_roles — must delete + re-insert to change roles
-- This prevents subtle escalation via UPDATE of the role column