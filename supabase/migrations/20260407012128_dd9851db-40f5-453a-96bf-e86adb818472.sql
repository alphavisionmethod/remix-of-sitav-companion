
-- Fix customer_journey_registry: admin-only write access
DROP POLICY IF EXISTS "auth insert registry" ON public.customer_journey_registry;
DROP POLICY IF EXISTS "auth update registry" ON public.customer_journey_registry;
DROP POLICY IF EXISTS "auth delete registry" ON public.customer_journey_registry;

CREATE POLICY "admin insert registry" ON public.customer_journey_registry
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update registry" ON public.customer_journey_registry
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin delete registry" ON public.customer_journey_registry
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix customer_journey_status: admin-only write access
DROP POLICY IF EXISTS "auth insert status" ON public.customer_journey_status;
DROP POLICY IF EXISTS "auth update status" ON public.customer_journey_status;

CREATE POLICY "admin insert status" ON public.customer_journey_status
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update status" ON public.customer_journey_status
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix journey_verification_runs: admin-only access
DROP POLICY IF EXISTS "auth insert runs" ON public.journey_verification_runs;
DROP POLICY IF EXISTS "auth read runs" ON public.journey_verification_runs;
DROP POLICY IF EXISTS "auth update runs" ON public.journey_verification_runs;

CREATE POLICY "admin read runs" ON public.journey_verification_runs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin insert runs" ON public.journey_verification_runs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update runs" ON public.journey_verification_runs
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix demo_scenario_entities: user-scoped read
DROP POLICY IF EXISTS "auth_read_dse" ON public.demo_scenario_entities;

CREATE POLICY "user_read_own_dse" ON public.demo_scenario_entities
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
