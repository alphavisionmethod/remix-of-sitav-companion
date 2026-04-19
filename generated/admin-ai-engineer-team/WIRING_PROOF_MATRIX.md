# Admin AI Engineer Hub — Wiring Proof Matrix

> Generated: 2026-04-19T19:27:52.198Z
> Tabs: 43 · Realtime: 8 · Mismatches: 29

Each tab is verified against its declared data sources by AST-scanning the panel source for `supabase.from`, `supabase.rpc`, `supabase.functions.invoke`, and `supabase.channel`.

| Tab | File | Tables Found | RPCs Found | Edge Fns Found | Realtime | Status |
|---|---|---|---|---|---|---|
| `team` | `AIT01TeamOverview` | — | — | — | — | ⚠️ mismatch |
| `internal-agents` | `InternalAgentsBoard` | — | — | — | ✅ live | ⚠️ mismatch |
| `internal-agent-intents` | `InternalAgentIntentTimeline` | internal_agent_action_intents | — | internal-agent-execute-action | ✅ live | ⚠️ mismatch |
| `councils` | `CouncilsBoard` | — | — | — | ✅ live | ⚠️ mismatch |
| `trust-ladder` | `TrustLadderBoard` | — | summarize_trust_ladder | internal-agent-trust-evaluator | ❌ claimed-not-found | ⚠️ mismatch |
| `reflection` | `ReflectionBoard` | internal_agent_reflections | summarize_internal_agent_learning | internal-agent-reflect | ℹ️ found-not-claimed | ⚠️ mismatch |
| `suggestions` | `SuggestionsBoard` | ai_implementation_suggestions | record_implementation_suggestion_decision, summarize_implementation_suggestions | internal-agent-suggestion-generator | ✅ live | ⚠️ mismatch |
| `weekly-digest` | `WeeklyDigestBoard` | internal_agent_weekly_digests | — | internal-agent-weekly-digest | ℹ️ found-not-claimed | ⚠️ mismatch |
| `dependency-findings` | `DependencyFindingsBoard` | dependency_upgrade_findings | — | — | ℹ️ found-not-claimed | ⚠️ mismatch |
| `policy-drafts` | `PolicyDraftReviewBoard` | internal_agent_policy_drafts | record_policy_draft_decision, summarize_policy_draft_health | internal-agent-policy-architect | ❌ claimed-not-found | ⚠️ mismatch |
| `cross-council` | `CrossCouncilBoard` | internal_agent_consensus_sessions, internal_agent_cost_proposals, internal_agent_runbook_executions | — | internal-agent-cost-optimizer | ❌ claimed-not-found | ⚠️ mismatch |
| `tenant-federation` | `TenantFederationBoard` | internal_agent_tenant_kill_switches, internal_agent_tenant_quotas, internal_agent_tenant_scopes | — | — | ❌ claimed-not-found | ⚠️ mismatch |
| `security-council` | `SecurityCouncilBoard` | security_council_findings | acknowledge_security_finding, summarize_security_council | security-council-tick | ✅ live | ⚠️ mismatch |
| `providers` | `AIG01ProviderRegistry` | — | — | — | ❌ claimed-not-found | ⚠️ mismatch |
| `models` | `AIG02ModelRegistry` | — | — | — | — | ⚠️ mismatch |
| `routing` | `AIG03RoutingMatrix` | — | — | — | — | ⚠️ mismatch |
| `budget` | `AIG04BudgetCenter` | ai_capability_routing, ai_model_registry, ai_provider_registry | — | — | ❌ claimed-not-found | ⚠️ mismatch |
| `governance` | `AIGovernancePage` | — | — | — | — | ⚠️ mismatch |
| `slo-observability` | `SLOObservabilityBoard` | internal_agent_anomaly_signals, internal_agent_canary_runs, internal_agent_drift_findings, internal_agent_slo_snapshots | — | internal-agent-slo-evaluator | ❌ claimed-not-found | ⚠️ mismatch |
| `efficiency` | `AIEfficiencyScoreboard` | — | — | — | — | ⚠️ mismatch |
| `cost` | `AIT05CostEfficiency` | — | — | — | ❌ claimed-not-found | ⚠️ mismatch |
| `assurance-chaos` | `AssuranceChaosBoard` | internal_agent_assurance_reports, internal_agent_auto_rollback_events, internal_agent_chaos_drills | — | internal-agent-canary-runner, internal-agent-chaos-scheduler | ❌ claimed-not-found | ⚠️ mismatch |
| `external-workforce-api` | `ExternalWorkforceApiBoard` | external_workforce_api_keys, external_workforce_subscriptions, external_workforce_webhook_deliveries | — | — | ❌ claimed-not-found | ⚠️ mismatch |
| `knowledge-federation` | `KnowledgeFederationBoard` | federated_knowledge_shares, federated_pattern_aggregates, tenant_federation_optins | — | federated-knowledge-aggregator | — | ⚠️ mismatch |
| `sovereign-dr` | `SovereignDeploymentDRBoard` | audit_export_bundles, dr_drills, signed_release_artifacts | — | audit-export-bundler, dr-drill-runner | ❌ claimed-not-found | ⚠️ mismatch |
| `compliance-attestation` | `ComplianceAttestationBoard` | attestation_packets, compliance_controls, compliance_evidence, policy_as_code_rules | — | attestation-packet-builder, compliance-evidence-collector | — | ✅ ok |
| `advisors` | `AdvisorBoardCatalog` | ai_workforce_launch_honesty | — | — | — | ⚠️ mismatch |
| `owner-copilot` | `OwnerCopilotBriefings` | — | — | owner-copilot-bff?op=handoff, owner-copilot-bff?op=list | ❌ claimed-not-found | ⚠️ mismatch |
| `nightly-truth` | `AIRuntimeNightlyTruthPanel` | — | — | — | ❌ claimed-not-found | ⚠️ mismatch |
| `connector-truth` | `ConnectorTruthSummaryPanel` | — | — | — | — | ⚠️ mismatch |
| `mobile-scope-truth` | `MobileScopeTruthPanel` | — | — | — | — | ✅ ok |
| `frontend-polish-truth` | `FrontendPolishTruthPanel` | — | — | — | — | ✅ ok |
| `admin-validation-truth` | `AdminValidationTruthPanel` | — | — | — | — | ✅ ok |
| `hardware-operator-truth` | `HardwareAndOperatorTruthPanel` | hardware_certification_runs, operator_drill_executions | — | — | — | ✅ ok |
| `security-portability-truth` | `SecurityAndPortabilityTruthPanel` | secret_rotation_log | — | — | — | ✅ ok |
| `architectural-cleanup-truth` | `ArchitecturalCleanupTruthPanel` | — | — | — | — | ✅ ok |
| `economic-trust-future-truth` | `EconomicTrustFutureTruthPanel` | ai_budget_decision_receipts, ai_user_hard_ceilings | — | — | — | ✅ ok |
| `architecture-hardening-truth` | `ArchitectureHardeningTruthPanel` | — | — | — | — | ✅ ok |
| `flagship-surface-closure-truth` | `FlagshipSurfaceClosureTruthPanel` | — | — | — | — | ✅ ok |
| `admin-empty-state-closure-truth` | `AdminEmptyStateClosureTruthPanel` | — | — | — | — | ✅ ok |
| `admin-coherence-closure-truth` | `AdminCoherenceClosureTruthPanel` | — | — | — | — | ✅ ok |
| `trust-state-and-copy-closure-truth` | `TrustStateAndCopyClosureTruthPanel` | — | — | — | — | ✅ ok |
| `frontend-truth-backing-closure-truth` | `FrontendTruthBackingClosureTruthPanel` | — | — | — | — | ✅ ok |

## Mismatches

### `team`
- Missing in source: `table:advisor_registry`, `rpc:get_internal_agent_health_summary`
### `internal-agents`
- Missing in source: `table:internal_agent_runtime_state`, `table:internal_agent_action_intents`
### `internal-agent-intents`
- Missing in source: `table:internal_agent_gate_verdicts`
### `councils`
- Missing in source: `table:internal_agent_council_state`, `table:internal_agent_escalations`
### `trust-ladder`
- Missing in source: `table:internal_agent_trust_ladder`, `table:internal_agent_knowledge_bus`
- Declared realtime=true but no `supabase.channel(...)` found.
### `reflection`
- Missing in source: `rpc:get_agent_reflection_summary`
### `suggestions`
- Missing in source: `edge:ai-suggestion-generator`
### `weekly-digest`
- Missing in source: `table:ai_weekly_digests`, `edge:ai-weekly-digest-generator`
### `dependency-findings`
- Missing in source: `table:ai_dependency_findings`, `edge:ai-dependency-upgrade-proposer`
### `policy-drafts`
- Missing in source: `edge:ai-policy-architect`
- Declared realtime=true but no `supabase.channel(...)` found.
### `cross-council`
- Missing in source: `table:internal_agent_runbooks`
- Declared realtime=true but no `supabase.channel(...)` found.
### `tenant-federation`
- Missing in source: `table:tenant_federation_state`, `table:tenant_kill_switches`
- Declared realtime=true but no `supabase.channel(...)` found.
### `security-council`
- Missing in source: `table:sita_security_council_findings`, `rpc:sita-security-council-tick`
### `providers`
- Missing in source: `table:ai_provider_registry`, `table:ai_provider_health`
- Declared realtime=true but no `supabase.channel(...)` found.
### `models`
- Missing in source: `table:ai_model_registry`
### `routing`
- Missing in source: `table:ai_capability_routing`, `table:ai_routing_policies`
### `budget`
- Missing in source: `table:ai_budget_alerts`, `table:ai_budget_decision_receipts`
- Declared realtime=true but no `supabase.channel(...)` found.
### `governance`
- Missing in source: `table:advisor_autonomy_policies`, `table:ai_prompt_families`
### `slo-observability`
- Missing in source: `table:ai_slo_evaluations`, `table:ai_anomaly_events`, `edge:ai-slo-evaluator`
- Declared realtime=true but no `supabase.channel(...)` found.
### `efficiency`
- Missing in source: `table:advisor_feedback`, `table:advisor_board_reflections`
### `cost`
- Missing in source: `table:ai_usage_ledger`, `table:ai_invocations`
- Declared realtime=true but no `supabase.channel(...)` found.
### `assurance-chaos`
- Missing in source: `table:ai_chaos_drills`, `table:ai_assurance_reports`, `table:ai_auto_rollback_events`
- Declared realtime=true but no `supabase.channel(...)` found.
### `external-workforce-api`
- Missing in source: `table:external_workforce_endpoints`, `table:external_workforce_webhooks`
- Declared realtime=true but no `supabase.channel(...)` found.
### `knowledge-federation`
- Missing in source: `table:knowledge_federation_optins`, `table:knowledge_federation_dp_budget`
### `sovereign-dr`
- Missing in source: `table:sovereign_dr_drills`, `table:sovereign_dr_failover_requests`
- Declared realtime=true but no `supabase.channel(...)` found.
### `advisors`
- Missing in source: `table:advisor_registry`, `table:advisor_profiles`
### `owner-copilot`
- Missing in source: `table:owner_copilot_briefings`, `edge:owner-copilot-bff`
- Declared realtime=true but no `supabase.channel(...)` found.
### `nightly-truth`
- Missing in source: `table:ai_runtime_nightly_runs`, `table:ai_runtime_failure_alerts`, `edge:ai-runtime-nightly-verify`
- Declared realtime=true but no `supabase.channel(...)` found.
### `connector-truth`
- Missing in source: `table:connector_refresh_nightly_runs`, `rpc:get_connector_refresh_streak_summary`