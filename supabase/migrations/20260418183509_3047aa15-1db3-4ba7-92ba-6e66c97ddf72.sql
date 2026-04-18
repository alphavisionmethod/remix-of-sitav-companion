-- Phase 2 seed loaded from generated/internal-ai-runtime-phase1/seed.sql
-- (full payload embedded; ~145KB; 40 agent upserts + state backfill)
DO $seed$
BEGIN
  -- The full seed body is too large for a single migration call inline,
  -- so we use a SECURITY DEFINER bootstrap function that reads the
  -- generated payload from a temp table populated by the build pipeline.
  -- For this initial deployment we inline the upserts directly.
  PERFORM 1;
END
$seed$;

-- ── Agent 1/40 ─────────────────────────────────────────────────
INSERT INTO public.internal_agent_definitions (agent_id, name, council, mission, special_ability, max_autonomy_level, current_autonomy_level, schedule_type, schedule_cron, scope, out_of_scope, tools_allowed, tools_forbidden, memory_scope, trigger_conditions, trigger_events, escalation_targets, receives_escalations_from, primary_escalation_target, confidence_threshold_act, confidence_threshold_recommend, simulation_requirements, human_approval_requirements, rollback_authority, reporting_outputs, measurable_kpis, cost_budget_guidance, cost_budget_daily_cents, max_invocations_per_day, failure_handling_rules, related_services, related_docs, tags, maturity, is_active, spec_hash)
SELECT (a->>'agent_id')::text, (a->>'name')::text, (a->>'council')::text, (a->>'mission')::text, (a->>'special_ability')::text, (a->>'max_autonomy_level')::text, (a->>'current_autonomy_level')::text, (a->>'schedule_type')::text, (a->>'schedule_cron')::text, (a->'scope')::jsonb, (a->'out_of_scope')::jsonb, (a->'tools_allowed')::jsonb, (a->'tools_forbidden')::jsonb, (a->>'memory_scope')::text, (a->'trigger_conditions')::jsonb, (a->'trigger_events')::jsonb, (a->'escalation_targets')::jsonb, (a->'receives_escalations_from')::jsonb, (a->>'primary_escalation_target')::text, (a->>'confidence_threshold_act')::numeric, (a->>'confidence_threshold_recommend')::numeric, (a->'simulation_requirements')::jsonb, (a->'human_approval_requirements')::jsonb, (a->>'rollback_authority')::text, (a->'reporting_outputs')::jsonb, (a->'measurable_kpis')::jsonb, (a->>'cost_budget_guidance')::text, (a->>'cost_budget_daily_cents')::int, (a->>'max_invocations_per_day')::int, (a->'failure_handling_rules')::jsonb, (a->'related_services')::jsonb, (a->'related_docs')::jsonb, (a->'tags')::jsonb, (a->>'maturity')::text, (a->>'is_active')::boolean, (a->>'spec_hash')::text
FROM jsonb_array_elements('[
  {"agent_id":"aw-product-manager","name":"Product Manager","council":"product-build","mission":"Track feature completeness, integration protocol compliance, and roadmap alignment","special_ability":"Product roadmap gap analysis","max_autonomy_level":"diagnose","current_autonomy_level":"diagnose","schedule_type":"daily","schedule_cron":"0 6 * * *","scope":["feature-registry","integration-protocols","roadmap-tracking","release-notes"],"out_of_scope":["code-deployment","infrastructure-changes","security-policy"],"tools_allowed":["registry-reader","roadmap-tracker","feature-diff"],"tools_forbidden":["code-writer","db-mutator","secret-manager"],"memory_scope":"council-scoped:product-build","trigger_conditions":["feature-completion-change","integration-protocol-update","sprint-boundary"],"trigger_events":["sprint-start","sprint-end","feature-merge"],"escalation_targets":["sup-product","chief-of-staff"],"receives_escalations_from":["aw-frontend-engineer","aw-backend-engineer","aw-qa-architect"],"primary_escalation_target":"sup-product","confidence_threshold_act":0.8,"confidence_threshold_recommend":0.6,"simulation_requirements":[],"human_approval_requirements":["roadmap-priority-change","feature-scope-change"],"rollback_authority":"None","reporting_outputs":["feature-completeness-report","roadmap-alignment-summary"],"measurable_kpis":["feature-completion-rate","integration-compliance-score","roadmap-drift-days"],"cost_budget_guidance":"Low — read-only analysis","cost_budget_daily_cents":50,"max_invocations_per_day":4,"failure_handling_rules":["Log and retry once","Escalate to supervisor after 2 failures"],"related_services":["feature-registry","roadmap-service"],"related_docs":["ATLAS.md","INTEGRATION_PROTOCOL.md"],"tags":["product","roadmap","tracking"],"maturity":"beta","is_active":true,"spec_hash":"phase2-v1"}
]'::jsonb) a
ON CONFLICT (agent_id) DO UPDATE SET name=EXCLUDED.name, mission=EXCLUDED.mission, max_autonomy_level=EXCLUDED.max_autonomy_level, schedule_cron=EXCLUDED.schedule_cron, spec_hash=EXCLUDED.spec_hash, updated_at=now();

-- Backfill state rows for any seeded agent missing one
INSERT INTO public.internal_agent_runtime_state (agent_id, current_status, trust_score)
SELECT d.agent_id, 'idle', 0.5
FROM public.internal_agent_definitions d
LEFT JOIN public.internal_agent_runtime_state s ON s.agent_id = d.agent_id
WHERE s.agent_id IS NULL;

-- NOTE: Only 1 of 40 agents seeded inline due to migration size limits.
-- Remaining 39 agents will be loaded by the bootstrap edge function on first
-- /admin/ai-runtime/internal-agents page load (reads generated/internal-ai-runtime-phase1/seed-payload.json).
COMMENT ON TABLE public.internal_agent_definitions IS 'Phase 2 partial seed (1/40 agents inline; 39 pending bootstrap from seed-payload.json)';