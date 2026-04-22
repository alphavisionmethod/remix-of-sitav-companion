-- ═══════════════════════════════════════════════════════════════
-- RLS Hardening: Replace permissive true with explicit service_role checks
-- ═══════════════════════════════════════════════════════════════

-- 1. advisor_action_proof_packs (RESTRICTIVE FOR ALL with true)
DROP POLICY IF EXISTS "Service role can manage advisor proof packs" ON public.advisor_action_proof_packs;
CREATE POLICY "Service role can manage advisor proof packs" ON public.advisor_action_proof_packs
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');

-- 2. compliance_evidence (RESTRICTIVE FOR ALL with true)
DROP POLICY IF EXISTS "service role manages compliance evidence" ON public.compliance_evidence;
CREATE POLICY "service role manages compliance evidence" ON public.compliance_evidence
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');

-- 3. cron_run_receipts (RESTRICTIVE FOR ALL with true)
DROP POLICY IF EXISTS "Service role can manage cron run receipts" ON public.cron_run_receipts;
CREATE POLICY "Service role can manage cron run receipts" ON public.cron_run_receipts
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');

-- 4. evidence_graph_edges (RESTRICTIVE FOR ALL with true)
DROP POLICY IF EXISTS "Service role can manage evidence graph edges" ON public.evidence_graph_edges;
CREATE POLICY "Service role can manage evidence graph edges" ON public.evidence_graph_edges
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');

-- 5. evidence_graph_nodes (RESTRICTIVE FOR ALL with true)
DROP POLICY IF EXISTS "Service role can manage evidence graph nodes" ON public.evidence_graph_nodes;
CREATE POLICY "Service role can manage evidence graph nodes" ON public.evidence_graph_nodes
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');

-- 6. installed_apps_receipts (RESTRICTIVE FOR ALL with true)
DROP POLICY IF EXISTS "Service role can manage install receipts" ON public.installed_apps_receipts;
CREATE POLICY "Service role can manage install receipts" ON public.installed_apps_receipts
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');

-- 7. recovery_jobs (PERMISSIVE FOR ALL with true — tighten to explicit check)
DROP POLICY IF EXISTS "Service role full access to recovery_jobs" ON public.recovery_jobs;
CREATE POLICY "Service role full access to recovery_jobs" ON public.recovery_jobs
  FOR ALL TO service_role USING ((select auth.role()) = 'service_role') WITH CHECK ((select auth.role()) = 'service_role');

-- 8. boardroom_followthrough_sla_alerts (INSERT with true)
DROP POLICY IF EXISTS "l7_sla_service_insert" ON public.boardroom_followthrough_sla_alerts;
CREATE POLICY "l7_sla_service_insert" ON public.boardroom_followthrough_sla_alerts
  FOR INSERT TO service_role WITH CHECK ((select auth.role()) = 'service_role');

-- 9. ai_budget_decision_receipts (INSERT with true)
DROP POLICY IF EXISTS "Service role inserts decision receipts" ON public.ai_budget_decision_receipts;
CREATE POLICY "Service role inserts decision receipts" ON public.ai_budget_decision_receipts
  FOR INSERT TO service_role WITH CHECK ((select auth.role()) = 'service_role');

-- 10. kill_switch_ttl_expiry_receipts (INSERT with true)
DROP POLICY IF EXISTS "Service role can insert kill switch ttl expiry receipts" ON public.kill_switch_ttl_expiry_receipts;
CREATE POLICY "Service role can insert kill switch ttl expiry receipts" ON public.kill_switch_ttl_expiry_receipts
  FOR INSERT TO service_role WITH CHECK ((select auth.role()) = 'service_role');

-- 11. release_decisions (INSERT with true)
DROP POLICY IF EXISTS "Service role can insert release decisions" ON public.release_decisions;
CREATE POLICY "Service role can insert release decisions" ON public.release_decisions
  FOR INSERT TO service_role WITH CHECK ((select auth.role()) = 'service_role');

-- 12. runbook_drill_results (INSERT with true)
DROP POLICY IF EXISTS "Service role can insert drill results" ON public.runbook_drill_results;
CREATE POLICY "Service role can insert drill results" ON public.runbook_drill_results
  FOR INSERT TO service_role WITH CHECK ((select auth.role()) = 'service_role');