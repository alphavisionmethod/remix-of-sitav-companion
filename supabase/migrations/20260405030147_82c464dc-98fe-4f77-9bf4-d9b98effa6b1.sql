-- ═══════════════════════════════════════════════════════════
-- Fix 1: user_roles — add RESTRICTIVE policy layer
-- ═══════════════════════════════════════════════════════════
CREATE POLICY "Only admins can ever insert roles"
  ON public.user_roles AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════════════════════
-- Fix 2: connector_credentials — add WITH CHECK to UPDATE
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users update own connector credentials" ON public.connector_credentials;

CREATE POLICY "Users update own connector credentials"
  ON public.connector_credentials FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);