DROP POLICY "auth read status" ON public.customer_journey_status;
CREATE POLICY "admin read status" ON public.customer_journey_status
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));