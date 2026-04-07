

# Fix Section 11: Wire 151 Orphaned Database Tables

## Problem
151 database tables exist in migrations but have zero `.from("table")` references in source code. They need data service files that expose CRUD operations.

## Approach
Follow the existing `cai-data-service.ts` pattern — a shared `queryTable`/`insertRow`/`updateRow`/`deleteRow` helper set, with domain-grouped table registrations. Each new data service file will register all tables in that domain via the generic helper pattern. This ensures every table has at least one `.from()` reference in the codebase.

## New Data Service Files (13 files)

| File | Tables | Count |
|------|--------|-------|
| `platform-ops-data-service.ts` | `platform_admin_durability_states`, `platform_admin_mutations`, `platform_concierge_continuity`, `platform_connector_health`, `platform_connector_lifecycle`, `platform_degraded_states`, `platform_deployment_gates`, `platform_docs_runtime_drift`, `platform_environment_truth`, `platform_launch_blockers`, `platform_launch_gates`, `platform_mutation_receipts`, `platform_operator_incidents`, `platform_projection_states`, `platform_promotion_readiness`, `platform_proof_coverage`, `platform_read_model_health`, `platform_rollback_verifications`, `platform_runbook_executions`, `platform_security_posture`, `platform_truth_manifests`, `platform_truth_sync_log`, `platform_validation_scores` | 23 |
| `revenue-ops-data-service.ts` | `revenue_advisor_stances`, `revenue_booking_services`, `revenue_bookings`, `revenue_campaigns`, `revenue_experiment_variants`, `revenue_experiments`, `revenue_funnel_steps`, `revenue_funnels`, `revenue_journey_touchpoints`, `revenue_memory_events`, `revenue_offer_sales`, `revenue_offers`, `revenue_reputation_metrics`, `revenue_retention_signals`, `revenue_reviews`, `revenue_segments`, `revenue_winback_queue` | 17 |
| `investment-ops-data-service.ts` | `investment_accounts`, `investment_advisor_debates`, `investment_advisor_observations`, `investment_advisor_profiles`, `investment_behavioral_signals`, `investment_constitutions`, `investment_decision_records`, `investment_execution_records`, `investment_journal_entries`, `investment_office_profiles`, `investment_receipts`, `investment_scenario_sets`, `investment_signals`, `connected_investment_platforms`, `thesis_records`, `market_memory_events` | 16 |
| `feature-lifecycle-data-service.ts` | `feature_compliance_records`, `feature_deprecation_records`, `feature_execution_paths`, `feature_generated_truth_impacts`, `feature_intake_records`, `feature_owner_decisions`, `feature_readiness_gates`, `feature_rollout_records`, `feature_spec_records` | 9 |
| `ai-ops-data-service.ts` | `ai_agent_debate_records`, `ai_change_plans`, `ai_compliance_violations`, `ai_design_diffs`, `ai_efficiency_scores`, `ai_engineering_missions`, `ai_fix_proposals`, `ai_learning_patterns` | 8 |
| `intelligence-ops-data-service.ts` | `intelligence_asset_usages`, `intelligence_assets`, `intelligence_digests`, `intelligence_packets`, `intelligence_patterns`, `intelligence_quality_feedback`, `intelligence_reuse_opportunities` | 7 |
| `integration-ops-data-service.ts` | `integration_action_requests`, `integration_audit_logs`, `integration_connections`, `integration_credentials`, `integration_providers`, `integration_routing_rules`, `integration_sync_runs` | 7 |
| `digital-presence-data-service.ts` | `digital_agent_debates`, `digital_agent_observations`, `digital_agents`, `digital_presence_profiles`, `digital_twins`, `website_twins`, `product_presence` | 7 |
| `surface-mode-data-service.ts` | `surface_class_registry`, `surface_constraint_records`, `surface_notification_grammars`, `surface_trust_presentations`, `reality_modes`, `reality_mode_registry`, `reality_mode_resolution_log`, `mode_access_policies`, `mode_segregation_audits`, `analytics_mode_policies`, `route_surface_registry` | 11 |
| `capability-launch-data-service.ts` | `capability_portability_records`, `capability_reality_bindings`, `capability_registry`, `launch_honesty_surface_bindings`, `launch_records`, `experience_grammar_records` | 6 |
| `demo-governance-data-service.ts` | `demo_interaction_policies`, `demo_provider_registry`, `demo_scenario_packs`, `provider_activation_registry` | 4 |
| `connector-ops-data-service.ts` | `connector_auth_sessions`, `connector_sync_logs` | 2 |
| `system-misc-data-service.ts` | `boardroom_decisions`, `brand_kits`, `catalyst_events`, `change_plans`, `chief_digital_synthesis`, `content_freshness`, `cross_tenant_pattern_learning_records`, `delivery_templates`, `device_auth_clients`, `differential_reasoning_records`, `domain_methodology_packs`, `e2e_steps`, `encrypted_secrets`, `media_items`, `outcome_economics_records`, `packet_compilation_records`, `patch_executions`, `playbook_metrics`, `presence_receipts`, `presence_timeline_events`, `reasoning_escalation_records`, `reasoning_path_performance_records`, `side_effect_policies`, `site_issues`, `site_opportunities`, `site_registry`, `sita_memory_entries`, `sovereign_exports`, `strategy_dna_profiles`, `system_config`, `tenant_firewall_logs`, `time_machine_snapshots`, `zero_waste_prompt_profiles`, `compute_budget_snapshots`, `operator_taste_profiles`, `quality_floor_configs` | 36 |

## Pattern for Each File

Each file follows the `cai-data-service.ts` pattern:

```text
1. Import supabase client
2. Shared uid(), queryTable(), insertRow(), updateRow(), deleteRow() helpers
3. Named exports per table group:
   export const platformMutations = {
     list: (f?) => queryTable("platform_admin_mutations", f),
     create: (row) => insertRow("platform_admin_mutations", row),
     update: (id, u) => updateRow("platform_admin_mutations", id, u),
     delete: (id) => deleteRow("platform_admin_mutations", id),
   };
```

## Existing Persistence Files — Already Referenced

Some tables listed as "orphaned" are actually referenced via `const TABLE = "..."` in persistence files (`compute_budget_snapshots`, `quality_floor_configs`, `operator_taste_profiles`, `intelligence_assets_library`). The `system-misc-data-service.ts` will add additional CRUD references for these to eliminate any ambiguity.

## Implementation Steps

1. Create all 13 data service files in `src/lib/data-services/`
2. Each uses the generic CRUD helper pattern from `cai-data-service.ts`
3. Verify with `npx tsc --noEmit` — 0 errors
4. Verify with grep that all 151 tables now have `.from()` references

## Files Changed
- 13 new files in `src/lib/data-services/`
- No existing files modified

