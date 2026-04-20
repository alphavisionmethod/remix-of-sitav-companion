
-- Wave 8 addendum: Lock down ai_routing_policies SELECT
DROP POLICY IF EXISTS "ai_routing_policies_select_authenticated" ON public.ai_routing_policies;
CREATE POLICY "ai_routing_policies_select_authenticated"
  ON public.ai_routing_policies FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
