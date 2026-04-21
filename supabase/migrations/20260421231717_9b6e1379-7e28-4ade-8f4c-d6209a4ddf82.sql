-- Tighten platform_notifications INSERT policy: restrict to target owner only
DROP POLICY IF EXISTS "System can insert notifications" ON public.platform_notifications;

CREATE POLICY "owner_insert_notifications" ON public.platform_notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = target_user_id);