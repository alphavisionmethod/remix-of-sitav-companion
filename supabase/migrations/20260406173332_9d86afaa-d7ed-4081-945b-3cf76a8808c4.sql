
-- Fix views to use SECURITY INVOKER
ALTER VIEW public.v_reality_mode_surface_summary SET (security_invoker = on);
ALTER VIEW public.v_demo_provider_summary SET (security_invoker = on);
ALTER VIEW public.v_provider_activation_summary SET (security_invoker = on);
ALTER VIEW public.v_mode_resolution_recent SET (security_invoker = on);
ALTER VIEW public.v_launch_honesty_by_surface SET (security_invoker = on);

-- Tighten resolution log INSERT policy
DROP POLICY IF EXISTS "auth_insert_rmrl" ON public.reality_mode_resolution_log;
CREATE POLICY "auth_insert_rmrl" ON public.reality_mode_resolution_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
