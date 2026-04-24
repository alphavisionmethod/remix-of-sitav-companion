-- Phase 7B — Close residual RLS findings

-- Tighten reads on infrastructure tables
DROP POLICY IF EXISTS "Authenticated users can view drill results" ON public.runbook_drill_results;
CREATE POLICY "runbook_drill_results_admin_select"
  ON public.runbook_drill_results
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Authenticated users can view release compat" ON public.release_compatibility_matrix;
CREATE POLICY "release_compatibility_matrix_admin_select"
  ON public.release_compatibility_matrix
  FOR SELECT
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'platform.admin'::text));

-- Close null-user_id loopholes (system-level rows must not be reachable by any auth user)

-- cloud_worker_jobs: keep user-owned-only access; admins / service-role retain full access via existing admin-ALL policy
DROP POLICY IF EXISTS "Users own worker jobs" ON public.cloud_worker_jobs;
CREATE POLICY "Users own worker jobs"
  ON public.cloud_worker_jobs
  FOR ALL
  TO authenticated
  USING (user_id IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (user_id IS NOT NULL AND user_id = auth.uid());

-- observability_metrics: remove the "OR user_id IS NULL" path from SELECT;
-- system metrics remain readable to admins only (existing admins-manage-ALL policy covers them).
DROP POLICY IF EXISTS "users view own or global obs_metrics" ON public.observability_metrics;
CREATE POLICY "users view own obs_metrics"
  ON public.observability_metrics
  FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- INSERT remains permissive (system can insert null-user metrics via service role; users insert their own).

-- policies: same pattern — strip the "global rows readable to all" loophole.
DROP POLICY IF EXISTS "users view own or global policies" ON public.policies;
CREATE POLICY "users view own policies"
  ON public.policies
  FOR SELECT
  TO authenticated
  USING (user_id IS NOT NULL AND auth.uid() = user_id);
-- Global (user_id IS NULL) policies remain accessible via existing "admins manage global policies" ALL policy.