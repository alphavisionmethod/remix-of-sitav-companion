-- ═══════════════════════════════════════════════════════════
-- Fix 1: user_roles — explicitly block UPDATE to prevent escalation
-- ═══════════════════════════════════════════════════════════
-- Create a restrictive policy that blocks ALL updates
CREATE POLICY "No role updates allowed"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

-- ═══════════════════════════════════════════════════════════
-- Fix 2: audit_logs — remove user INSERT, only triggers write
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;