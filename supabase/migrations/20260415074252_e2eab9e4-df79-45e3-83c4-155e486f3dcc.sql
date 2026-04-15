
-- Fix the permissive INSERT policy on platform_notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.platform_notifications;
CREATE POLICY "Users can insert own notifications" ON public.platform_notifications FOR INSERT TO authenticated WITH CHECK (
  (target_user_id = auth.uid()) OR public.has_admin_permission(auth.uid(), 'platform.admin')
);
