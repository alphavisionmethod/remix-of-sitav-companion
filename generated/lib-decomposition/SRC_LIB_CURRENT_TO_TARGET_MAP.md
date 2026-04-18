# SITA OS — src/lib Current → Target Map (Wave 1)

Generated: 2026-04-18T02:44:25.859Z

- **Files mapped:** 1681
- **Distinct destination roots scaffolded:** 63
- **Total destination folders touched:** 372

## Migration strategy distribution

| Strategy | Count |
|----------|------:|
| stay-in-place | 14 |
| move-with-wrapper-shim-required | 2 |
| archive-or-review | 26 |
| move-with-wrapper-shim | 617 |
| delete-after-rewire | 155 |
| move-direct | 867 |

## Highest-risk moves (≥50 importers)

| Importers | Current | → Target | Strategy |
|----------:|---------|----------|----------|
| 761 | `src/lib/utils.ts` | `src/lib/utils.ts` | stay-in-place |
| 224 | `src/lib/supabase-helpers.ts` | `src/integrations/supabase/helpers.ts` | move-with-wrapper-shim-required |
| 75 | `src/lib/demo-data/admin-platform.tsx` | `src/data/seed/admin-platform.tsx` | move-with-wrapper-shim-required |
| 50 | `src/lib/design-system/sita-design-tokens.ts` | `src/legacy/unclassified/design-system/sita-design-tokens.ts` | archive-or-review |

## Full mapping (sample of first 200 — full data in JSON)

| Current | → Target | Class | Importers |
|---------|----------|-------|----------:|
| `src/lib/utils.ts` | `src/lib/utils.ts` | shared-internal | 761 |
| `src/lib/supabase-helpers.ts` | `src/integrations/supabase/helpers.ts` | integration | 224 |
| `src/lib/demo-data/admin-platform.tsx` | `src/data/seed/admin-platform.tsx` | data | 75 |
| `src/lib/design-system/sita-design-tokens.ts` | `src/legacy/unclassified/design-system/sita-design-tokens.ts` | legacy | 50 |
| `src/lib/demo-data/revenue-office.ts` | `src/data/seed/revenue-office.ts` | data | 35 |
| `src/lib/engines/business-identity-layers.ts` | `src/domains/engines/business-identity-layers.ts` | domain | 32 |
| `src/lib/demo-data/core-pages.ts` | `src/data/seed/core-pages.ts` | data | 26 |
| `src/lib/demo-data/investment.ts` | `src/data/seed/investment.ts` | data | 26 |
| `src/lib/nova-sdk/ui/components.tsx` | `src/platform/nova-sdk/ui/components.tsx` | platform | 21 |
| `src/lib/nova-sdk/ui/layout.tsx` | `src/platform/nova-sdk/ui/layout.tsx` | platform | 20 |
| `src/lib/demo-data/digital-presence.ts` | `src/data/seed/digital-presence.ts` | data | 18 |
| `src/lib/engines/lead-scoring-engine.ts` | `src/domains/engines/lead-scoring-engine.ts` | domain | 18 |
| `src/lib/design-system/app-window-system.ts` | `src/legacy/unclassified/design-system/app-window-system.ts` | legacy | 17 |
| `src/lib/engines/business-module-adaptations.ts` | `src/domains/engines/business-module-adaptations.ts` | domain | 16 |
| `src/lib/engines/business-profile-engine.ts` | `src/domains/engines/business-profile-engine.ts` | domain | 16 |
| `src/lib/app-platform/types.ts` | `src/domains/apps/types.ts` | domain | 14 |
| `src/lib/customer-journey/journey-registry.ts` | `src/domains/customer-journey/journey-registry.ts` | domain | 14 |
| `src/lib/hooks/useOSRuntime.tsx` | `src/hooks/useOSRuntime.tsx` | shared-internal | 14 |
| `src/lib/verification/verification-hooks.ts` | `src/platform/verification/verification-hooks.ts` | platform | 14 |
| `src/lib/reality-audit/reality-audit-registry.ts` | `src/runtimes/reality/reality-audit-registry.ts` | runtime | 13 |
| `src/lib/verification/surface-registry.ts` | `src/platform/verification/surface-registry.ts` | platform | 13 |
| `src/lib/data-services/crm-data-service.ts` | `src/data/repositories/crm-data-service.ts` | data | 12 |
| `src/lib/design-system/nova-os.ts` | `src/legacy/unclassified/design-system/nova-os.ts` | legacy | 12 |
| `src/lib/investment-office/mock-data.ts` | `src/domains/investment/mock-data.ts` | domain | 12 |
| `src/lib/platform-law/platform-law-registry.ts` | `src/platform/governance/platform-law-registry.ts` | platform | 11 |
| `src/lib/sound-engine.ts` | `src/legacy/unclassified/sound-engine.ts` | legacy | 11 |
| `src/lib/cloud-backbone/cloud-storage-service.ts` | `src/platform/cloud/cloud-storage-service.ts` | platform | 10 |
| `src/lib/engines/business-advisor-engine.ts` | `src/domains/engines/business-advisor-engine.ts` | domain | 10 |
| `src/lib/engines/business-advisor-personas.ts` | `src/domains/engines/business-advisor-personas.ts` | domain | 10 |
| `src/lib/engines/business-profitability-engine.ts` | `src/domains/engines/business-profitability-engine.ts` | domain | 10 |
| `src/lib/persistence/index.ts` | `src/data/persistence/index.ts` | data | 10 |
| `src/lib/platform-plane/index.ts` | `src/platform/core/index.ts` | platform | 10 |
| `src/lib/compute-governance/index.ts` | `src/platform/governance/index.ts` | platform | 9 |
| `src/lib/customer-journey/journey-hooks.ts` | `src/domains/customer-journey/journey-hooks.ts` | domain | 9 |
| `src/lib/core-services/ai-gateway/index.ts` | `src/platform/core-services/ai-gateway/index.ts` | platform | 8 |
| `src/lib/core-services/policy-engine.ts` | `src/platform/core-services/policy-engine.ts` | platform | 8 |
| `src/lib/data-services/file-explorer-service.ts` | `src/data/repositories/file-explorer-service.ts` | data | 8 |
| `src/lib/demo-data/admin-intelligence.ts` | `src/data/seed/admin-intelligence.ts` | data | 8 |
| `src/lib/hooks/useEngineEventsData.ts` | `src/hooks/useEngineEventsData.ts` | shared-internal | 8 |
| `src/lib/pack-store/index.ts` | `src/domains/apps/index.ts` | domain | 8 |
| `src/lib/services/engineering-governance/index.ts` | `src/platform/services-unclassified/engineering-governance/index.ts` | platform | 8 |
| `src/lib/types/relation-parsers.ts` | `src/contracts/types/relation-parsers.ts` | contract | 8 |
| `src/lib/architecture/admin-route-registry.ts` | `src/platform/architecture/admin-route-registry.ts` | platform | 7 |
| `src/lib/core-services/event-bus.ts` | `src/platform/core-services/event-bus.ts` | platform | 7 |
| `src/lib/engines/cross-os-integration.ts` | `src/domains/engines/cross-os-integration.ts` | domain | 7 |
| `src/lib/hooks/use-meta-governance.ts` | `src/hooks/use-meta-governance.ts` | shared-internal | 7 |
| `src/lib/hooks/useAction.ts` | `src/hooks/useAction.ts` | shared-internal | 7 |
| `src/lib/services/board-api-client.ts` | `src/platform/services-unclassified/board-api-client.ts` | platform | 7 |
| `src/lib/simulation/monte-carlo-engine.ts` | `src/legacy/simulation/monte-carlo-engine.ts` | legacy | 7 |
| `src/lib/types/dwe-types.ts` | `src/contracts/types/dwe-types.ts` | contract | 7 |
| `src/lib/advisor-protocol/index.ts` | `src/domains/advisors/index.ts` | domain | 6 |
| `src/lib/advisor-topology.ts` | `src/domains/advisors/topology.ts` | domain | 6 |
| `src/lib/constants/ui-config.ts` | `src/contracts/constants/ui-config.ts` | contract | 6 |
| `src/lib/core-services/ai-workforce/workforce-orchestrator.ts` | `src/platform/core-services/ai-workforce/workforce-orchestrator.ts` | platform | 6 |
| `src/lib/core-services/launch-readiness/launch-readiness-engine.ts` | `src/platform/core-services/launch-readiness/launch-readiness-engine.ts` | platform | 6 |
| `src/lib/core-services/receipt-service.ts` | `src/platform/core-services/receipt-service.ts` | platform | 6 |
| `src/lib/core-services/security/security-posture-engine.ts` | `src/platform/core-services/security/security-posture-engine.ts` | platform | 6 |
| `src/lib/core-services/service-registry/service-ownership-registry.ts` | `src/platform/core-services/service-registry/service-ownership-registry.ts` | platform | 6 |
| `src/lib/customer-journey/journey-ingestion-hooks.ts` | `src/domains/customer-journey/journey-ingestion-hooks.ts` | domain | 6 |
| `src/lib/demo-data/apps.ts` | `src/data/seed/apps.ts` | data | 6 |
| `src/lib/dual-reality/index.ts` | `src/runtimes/reality/index.ts` | runtime | 6 |
| `src/lib/fip/types.ts` | `src/platform/fip/types.ts` | platform | 6 |
| `src/lib/hooks/useIntelligenceAPI.ts` | `src/hooks/useIntelligenceAPI.ts` | shared-internal | 6 |
| `src/lib/hooks/useIntelligencePersistence.ts` | `src/hooks/useIntelligencePersistence.ts` | shared-internal | 6 |
| `src/lib/nova-sdk/graphics/context.ts` | `src/platform/nova-sdk/graphics/context.ts` | platform | 6 |
| `src/lib/nova-sdk/kernel/memory-manager.ts` | `src/platform/nova-sdk/kernel/memory-manager.ts` | platform | 6 |
| `src/lib/os-security/types.ts` | `src/platform/security/types.ts` | platform | 6 |
| `src/lib/runtime/deployment-profile.ts` | `src/runtimes/core/deployment-profile.ts` | runtime | 6 |
| `src/lib/services/orchestration-pipeline/module-advisor-consumer.ts` | `src/platform/services-unclassified/orchestration-pipeline/module-advisor-consumer.ts` | platform | 6 |
| `src/lib/sovereign-ai-gateway/types.ts` | `src/platform/ai-gateway/types.ts` | platform | 6 |
| `src/lib/system-menu/menu-actions.ts` | `src/legacy/unclassified/system-menu/menu-actions.ts` | legacy | 6 |
| `src/lib/ai/ai-state-types.ts` | `src/platform/ai/ai-state-types.ts` | platform | 5 |
| `src/lib/ai/ai-surface-grammar.ts` | `src/platform/ai/ai-surface-grammar.ts` | platform | 5 |
| `src/lib/architecture/layer-manifest.ts` | `src/platform/architecture/layer-manifest.ts` | platform | 5 |
| `src/lib/cloud-backbone/cloud-device-service.ts` | `src/platform/cloud/cloud-device-service.ts` | platform | 5 |
| `src/lib/core-services/service-registry/route-to-service-inventory.ts` | `src/platform/core-services/service-registry/route-to-service-inventory.ts` | platform | 5 |
| `src/lib/core-services/workflow-engine.ts` | `src/platform/core-services/workflow-engine.ts` | platform | 5 |
| `src/lib/demo-data/concierge.ts` | `src/data/seed/concierge.ts` | data | 5 |
| `src/lib/demo-data/integrations.ts` | `src/data/seed/integrations.ts` | data | 5 |
| `src/lib/demo-data/notification-calm.ts` | `src/data/seed/notification-calm.ts` | data | 5 |
| `src/lib/domain-engines/autopilot-engine.ts` | `src/domains/engines/autopilot-engine.ts` | domain | 5 |
| `src/lib/dual-reality/reality-mode-context.tsx` | `src/runtimes/reality/reality-mode-context.tsx` | runtime | 5 |
| `src/lib/engines/lead-recovery-engine.ts` | `src/domains/engines/lead-recovery-engine.ts` | domain | 5 |
| `src/lib/engines/readiness-engine.ts` | `src/domains/engines/readiness-engine.ts` | domain | 5 |
| `src/lib/mock-data/advisor-mission-control.ts` | `src/data/seed/advisor-mission-control.ts` | data | 5 |
| `src/lib/nova-sdk/kernel/process-manager.ts` | `src/platform/nova-sdk/kernel/process-manager.ts` | platform | 5 |
| `src/lib/orchestration/index.ts` | `src/platform/orchestration/index.ts` | platform | 5 |
| `src/lib/os-security/index.ts` | `src/platform/security/index.ts` | platform | 5 |
| `src/lib/runtime/runtime-context.tsx` | `src/runtimes/core/runtime-context.tsx` | runtime | 5 |
| `src/lib/services/ambient-context-engine.ts` | `src/platform/services-unclassified/ambient-context-engine.ts` | platform | 5 |
| `src/lib/services/founder-orchestrator/index.ts` | `src/platform/services-unclassified/founder-orchestrator/index.ts` | platform | 5 |
| `src/lib/services/update-daemon/index.ts` | `src/platform/services-unclassified/update-daemon/index.ts` | platform | 5 |
| `src/lib/app-platform/index.ts` | `src/domains/apps/index.ts` | domain | 4 |
| `src/lib/architecture/route-plane-map.ts` | `src/platform/architecture/route-plane-map.ts` | platform | 4 |
| `src/lib/boardroom/types.ts` | `src/domains/boardroom/types.ts` | domain | 4 |
| `src/lib/cloud-backbone/cloud-sync-service.ts` | `src/platform/cloud/cloud-sync-service.ts` | platform | 4 |
| `src/lib/control-plane/kill-switch-db-client.ts` | `src/platform/control-plane/kill-switch-db-client.ts` | platform | 4 |
| `src/lib/core-services/capability-router.ts` | `src/platform/core-services/capability-router.ts` | platform | 4 |
| `src/lib/core-services/cloud-sync-manager.ts` | `src/platform/core-services/cloud-sync-manager.ts` | platform | 4 |
| `src/lib/core-services/security/ai-output-firewall.ts` | `src/platform/core-services/security/ai-output-firewall.ts` | platform | 4 |
| `src/lib/core-services/truth-indices/truth-index-aggregator.ts` | `src/platform/core-services/truth-indices/truth-index-aggregator.ts` | platform | 4 |
| `src/lib/data-services/business-data-service.ts` | `src/data/repositories/business-data-service.ts` | data | 4 |
| `src/lib/demo-data/health-signals.ts` | `src/data/seed/health-signals.ts` | data | 4 |
| `src/lib/demo-data/index.ts` | `src/data/seed/index.ts` | data | 4 |
| `src/lib/dual-reality/reality-mode-registry.ts` | `src/runtimes/reality/reality-mode-registry.ts` | runtime | 4 |
| `src/lib/engines/business-action-pipeline.ts` | `src/domains/engines/business-action-pipeline.ts` | domain | 4 |
| `src/lib/engines/continuous-profit-engine.ts` | `src/domains/engines/continuous-profit-engine.ts` | domain | 4 |
| `src/lib/export-engine.ts` | `src/domains/shared/export-engine.ts` | domain | 4 |
| `src/lib/hooks/useRealityProvider.ts` | `src/hooks/useRealityProvider.ts` | shared-internal | 4 |
| `src/lib/investment-office/types.ts` | `src/domains/investment/types.ts` | domain | 4 |
| `src/lib/mock-data/legacy-display-mocks.ts` | `src/data/seed/legacy-display-mocks.ts` | data | 4 |
| `src/lib/no-hallucination/index.ts` | `src/platform/ai/index.ts` | platform | 4 |
| `src/lib/nova-sdk/kernel/compositor.ts` | `src/platform/nova-sdk/kernel/compositor.ts` | platform | 4 |
| `src/lib/nova-sdk/kernel/scheduler.ts` | `src/platform/nova-sdk/kernel/scheduler.ts` | platform | 4 |
| `src/lib/os-services/btd.ts` | `src/platform/os-services/btd.ts` | platform | 4 |
| `src/lib/os-services/powerd.ts` | `src/platform/os-services/powerd.ts` | platform | 4 |
| `src/lib/os-services/wifid.ts` | `src/platform/os-services/wifid.ts` | platform | 4 |
| `src/lib/services/orchestration-pipeline/app-board-synthesizer.ts` | `src/platform/services-unclassified/orchestration-pipeline/app-board-synthesizer.ts` | platform | 4 |
| `src/lib/services/orchestration-pipeline/types.ts` | `src/platform/services-unclassified/orchestration-pipeline/types.ts` | platform | 4 |
| `src/lib/services/sita-modes/index.ts` | `src/platform/services-unclassified/sita-modes/index.ts` | platform | 4 |
| `src/lib/simulation/market-intelligence.ts` | `src/legacy/simulation/market-intelligence.ts` | legacy | 4 |
| `src/lib/ai/ai-capability-client.ts` | `src/platform/ai/ai-capability-client.ts` | platform | 3 |
| `src/lib/architecture/boundary-rules.ts` | `src/platform/architecture/boundary-rules.ts` | platform | 3 |
| `src/lib/boardroom/index.ts` | `src/domains/boardroom/index.ts` | domain | 3 |
| `src/lib/business-journey-config.ts` | `src/domains/business/journey-config.ts` | domain | 3 |
| `src/lib/cloud-backbone/cloud-lifecycle-service.ts` | `src/platform/cloud/cloud-lifecycle-service.ts` | platform | 3 |
| `src/lib/cloud-backbone/cloud-quota-service.ts` | `src/platform/cloud/cloud-quota-service.ts` | platform | 3 |
| `src/lib/core-services/flagship-loops/flagship-loop-service.ts` | `src/platform/core-services/flagship-loops/flagship-loop-service.ts` | platform | 3 |
| `src/lib/core-services/memory-service.ts` | `src/platform/core-services/memory-service.ts` | platform | 3 |
| `src/lib/core-services/verification-engine.ts` | `src/platform/core-services/verification-engine.ts` | platform | 3 |
| `src/lib/data-services/calendar-data-service.ts` | `src/data/repositories/calendar-data-service.ts` | data | 3 |
| `src/lib/delivery-methodology/domain-packs.ts` | `src/domains/delivery/domain-packs.ts` | domain | 3 |
| `src/lib/domain-engines/business-os.ts` | `src/domains/engines/business-os.ts` | domain | 3 |
| `src/lib/domain-engines/concierge-os.ts` | `src/domains/engines/concierge-os.ts` | domain | 3 |
| `src/lib/domain-engines/finance-os.ts` | `src/domains/engines/finance-os.ts` | domain | 3 |
| `src/lib/dual-reality/demo-policy-engine.ts` | `src/runtimes/reality/demo-policy-engine.ts` | runtime | 3 |
| `src/lib/dual-reality/surface-class-registry.ts` | `src/runtimes/reality/surface-class-registry.ts` | runtime | 3 |
| `src/lib/engines/advisor-memory-engine.ts` | `src/domains/engines/advisor-memory-engine.ts` | domain | 3 |
| `src/lib/engines/business-autonomy-engine.ts` | `src/domains/engines/business-autonomy-engine.ts` | domain | 3 |
| `src/lib/engines/business-context-graph.ts` | `src/domains/engines/business-context-graph.ts` | domain | 3 |
| `src/lib/internal-agents/index.ts` | `src/domains/ai-workforce/index.ts` | domain | 3 |
| `src/lib/internal-agents/rights.ts` | `src/domains/ai-workforce/rights.ts` | domain | 3 |
| `src/lib/internal-agents/types.ts` | `src/domains/ai-workforce/types.ts` | domain | 3 |
| `src/lib/meta-arch/use-armed-kill-switches.ts` | `src/platform/architecture/use-armed-kill-switches.ts` | platform | 3 |
| `src/lib/mock-data/workspace.ts` | `src/data/seed/workspace.ts` | data | 3 |
| `src/lib/nova-sdk/input/events.ts` | `src/platform/nova-sdk/input/events.ts` | platform | 3 |
| `src/lib/nova-sdk/kernel/syscall.ts` | `src/platform/nova-sdk/kernel/syscall.ts` | platform | 3 |
| `src/lib/nova-sdk/runtime/lifecycle.ts` | `src/platform/nova-sdk/runtime/lifecycle.ts` | platform | 3 |
| `src/lib/nova-sdk/services/service-manager.ts` | `src/platform/nova-sdk/services/service-manager.ts` | platform | 3 |
| `src/lib/nova-sdk/services/settings-service.ts` | `src/platform/nova-sdk/services/settings-service.ts` | platform | 3 |
| `src/lib/nova-sdk/system/bridge.ts` | `src/platform/nova-sdk/system/bridge.ts` | platform | 3 |
| `src/lib/os-security/policyd.ts` | `src/platform/security/policyd.ts` | platform | 3 |
| `src/lib/os-security/sessiond.ts` | `src/platform/security/sessiond.ts` | platform | 3 |
| `src/lib/persistence/reality-classification-persistence.ts` | `src/data/persistence/reality-classification-persistence.ts` | data | 3 |
| `src/lib/runtime/feature-runtime-tier-registry.ts` | `src/runtimes/core/feature-runtime-tier-registry.ts` | runtime | 3 |
| `src/lib/services/app-ingestion/ingestion.service.ts` | `src/platform/services-unclassified/app-ingestion/ingestion.service.ts` | platform | 3 |
| `src/lib/services/boardroom-bridge.ts` | `src/platform/services-unclassified/boardroom-bridge.ts` | platform | 3 |
| `src/lib/services/device-mesh/index.ts` | `src/platform/services-unclassified/device-mesh/index.ts` | platform | 3 |
| `src/lib/services/digest-engine/digest-engine.ts` | `src/platform/services-unclassified/digest-engine/digest-engine.ts` | platform | 3 |
| `src/lib/services/error-monitoring-service.ts` | `src/platform/services-unclassified/error-monitoring-service.ts` | platform | 3 |
| `src/lib/services/explainability/index.ts` | `src/platform/services-unclassified/explainability/index.ts` | platform | 3 |
| `src/lib/services/finance-os/investment-memory.service.ts` | `src/platform/services-unclassified/finance-os/investment-memory.service.ts` | platform | 3 |
| `src/lib/services/governance-simulator/index.ts` | `src/platform/services-unclassified/governance-simulator/index.ts` | platform | 3 |
| `src/lib/services/identity-auth/mfa.service.ts` | `src/platform/services-unclassified/identity-auth/mfa.service.ts` | platform | 3 |
| `src/lib/services/orchestration-pipeline/signal-emitter.ts` | `src/platform/services-unclassified/orchestration-pipeline/signal-emitter.ts` | platform | 3 |
| `src/lib/services/provider-family/types.ts` | `src/platform/services-unclassified/provider-family/types.ts` | platform | 3 |
| `src/lib/setup/reflection-copy.ts` | `src/domains/setup/reflection-copy.ts` | domain | 3 |
| `src/lib/sita-kernel.ts` | `src/legacy/unclassified/sita-kernel.ts` | legacy | 3 |
| `src/lib/sync-engine/sync-namespaces.ts` | `src/data/sync/sync-namespaces.ts` | data | 3 |
| `src/lib/ux-trust/microcopy-system.ts` | `src/domains/ux-trust/microcopy-system.ts` | domain | 3 |
| `src/lib/ai/workforce-executor.ts` | `src/platform/ai/workforce-executor.ts` | platform | 2 |
| `src/lib/ai-engineering/index.ts` | `src/platform/ai/index.ts` | platform | 2 |
| `src/lib/api/os-api-client.ts` | `src/integrations/api/os-api-client.ts` | integration | 2 |
| `src/lib/architecture/owner-workflow-map.ts` | `src/platform/architecture/owner-workflow-map.ts` | platform | 2 |
| `src/lib/architecture/service-ownership-manifest.ts` | `src/platform/architecture/service-ownership-manifest.ts` | platform | 2 |
| `src/lib/backend-topology/index.ts` | `src/platform/topology/index.ts` | platform | 2 |
| `src/lib/capabilities/capability-registry.ts` | `src/platform/capabilities/capability-registry.ts` | platform | 2 |
| `src/lib/cloud-backbone/cloud-audit-service.ts` | `src/platform/cloud/cloud-audit-service.ts` | platform | 2 |
| `src/lib/control-plane/kill-switch-dependency-map.ts` | `src/platform/control-plane/kill-switch-dependency-map.ts` | platform | 2 |
| `src/lib/control-plane/kill-switch-registry.ts` | `src/platform/control-plane/kill-switch-registry.ts` | platform | 2 |
| `src/lib/core-services/ai-workforce/admin-budget-routing-policy.ts` | `src/platform/core-services/ai-workforce/admin-budget-routing-policy.ts` | platform | 2 |
| `src/lib/core-services/analytics-service.ts` | `src/platform/core-services/analytics-service.ts` | platform | 2 |
| `src/lib/core-services/api-gateway.ts` | `src/platform/core-services/api-gateway.ts` | platform | 2 |
| `src/lib/core-services/approval-service.ts` | `src/platform/core-services/approval-service.ts` | platform | 2 |
| `src/lib/core-services/billing-service.ts` | `src/platform/core-services/billing-service.ts` | platform | 2 |
| `src/lib/core-services/biometric-auth/index.ts` | `src/platform/core-services/biometric-auth/index.ts` | platform | 2 |
| `src/lib/core-services/budget-automation.ts` | `src/platform/core-services/budget-automation.ts` | platform | 2 |
| `src/lib/core-services/canonical-pipeline/index.ts` | `src/platform/core-services/canonical-pipeline/index.ts` | platform | 2 |
| `src/lib/core-services/connector-control.ts` | `src/platform/core-services/connector-control.ts` | platform | 2 |
| `src/lib/core-services/device-presence-service/index.ts` | `src/platform/core-services/device-presence-service/index.ts` | platform | 2 |
| `src/lib/core-services/error-patrol.ts` | `src/platform/core-services/error-patrol.ts` | platform | 2 |
| `src/lib/core-services/executor-service.ts` | `src/platform/core-services/executor-service.ts` | platform | 2 |
| `src/lib/core-services/feature-proposal-engine.ts` | `src/platform/core-services/feature-proposal-engine.ts` | platform | 2 |
| `src/lib/core-services/file-ingestion.ts` | `src/platform/core-services/file-ingestion.ts` | platform | 2 |
| `src/lib/core-services/fraud-sentinel.ts` | `src/platform/core-services/fraud-sentinel.ts` | platform | 2 |
| `src/lib/core-services/frontend/frontend-quality-engine.ts` | `src/platform/core-services/frontend/frontend-quality-engine.ts` | platform | 2 |
| `src/lib/core-services/governance-simulator.ts` | `src/platform/core-services/governance-simulator.ts` | platform | 2 |
| `src/lib/core-services/handoff/index.ts` | `src/platform/core-services/handoff/index.ts` | platform | 2 |
| `src/lib/core-services/identity-auth/index.ts` | `src/platform/core-services/identity-auth/index.ts` | platform | 2 |
| `src/lib/core-services/index.ts` | `src/platform/core-services/index.ts` | platform | 2 |