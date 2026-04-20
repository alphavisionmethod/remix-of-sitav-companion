
-- Drop the auth.role() expression-based policies and replace with
-- pure TO service_role bindings (Postgres role-binding is enforced
-- by the engine; service_role bypasses RLS, so this is functionally
-- equivalent to the prior policies but linter-clean).

DROP POLICY IF EXISTS "Service role can manage advisor proof packs"
  ON public.advisor_action_proof_packs;
CREATE POLICY "Service role can manage advisor proof packs"
ON public.advisor_action_proof_packs
AS RESTRICTIVE
FOR ALL TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service role manages compliance evidence"
  ON public.compliance_evidence;
CREATE POLICY "service role manages compliance evidence"
ON public.compliance_evidence
AS RESTRICTIVE
FOR ALL TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage cron run receipts"
  ON public.cron_run_receipts;
CREATE POLICY "Service role can manage cron run receipts"
ON public.cron_run_receipts
AS RESTRICTIVE
FOR ALL TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage evidence graph edges"
  ON public.evidence_graph_edges;
CREATE POLICY "Service role can manage evidence graph edges"
ON public.evidence_graph_edges
AS RESTRICTIVE
FOR ALL TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage evidence graph nodes"
  ON public.evidence_graph_nodes;
CREATE POLICY "Service role can manage evidence graph nodes"
ON public.evidence_graph_nodes
AS RESTRICTIVE
FOR ALL TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage install receipts"
  ON public.installed_apps_receipts;
CREATE POLICY "Service role can manage install receipts"
ON public.installed_apps_receipts
AS RESTRICTIVE
FOR ALL TO service_role
USING (true) WITH CHECK (true);
