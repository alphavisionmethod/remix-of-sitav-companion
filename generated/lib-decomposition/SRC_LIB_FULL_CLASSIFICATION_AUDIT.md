# SITA OS — src/lib Full Classification Audit (Wave 0)

Generated: 2026-04-18T02:42:31.489Z

## Totals

- **Files scanned:** 1681
- **Imported externally:** 719
- **Wrapper-only files:** 159

### By classification

| Class | Count |
|-------|------:|
| domain | 240 |
| platform | 1085 |
| runtime | 113 |
| data | 171 |
| integration | 9 |
| contract | 23 |
| shared-internal | 14 |
| legacy | 26 |

## By top-level folder

| Folder | Files | Dominant class | Class breakdown |
|--------|------:|----------------|-----------------|
| `services` | 480 | platform | platform:447, domain:32, data:1 |
| `core-services` | 210 | platform | platform:210 |
| `runtime` | 63 | runtime | runtime:63 |
| `engines` | 60 | domain | domain:60 |
| `architecture` | 46 | platform | platform:46 |
| `nova-sdk` | 46 | platform | platform:46 |
| `orchestration` | 46 | platform | platform:46 |
| `sync-engine` | 38 | data | data:38 |
| `data-services` | 33 | data | data:33 |
| `os-services` | 33 | platform | platform:33 |
| `demo-data` | 30 | data | data:30 |
| `truth-manifests` | 28 | platform | platform:28 |
| `mock-data` | 27 | data | data:27 |
| `app-platform` | 21 | domain | domain:21 |
| `dual-reality` | 20 | runtime | runtime:20 |
| `capabilities` | 19 | platform | platform:19 |
| `os-security` | 19 | platform | platform:19 |
| `types` | 19 | contract | contract:19 |
| `observability` | 18 | platform | platform:18 |
| `ai` | 16 | platform | platform:16 |
| `persistence` | 16 | data | data:16 |
| `platform` | 16 | platform | platform:16 |
| `backend-topology` | 15 | platform | platform:15 |
| `db` | 14 | data | data:14 |
| `internal-agents` | 13 | domain | domain:13 |
| `strategic-intelligence` | 13 | domain | domain:13 |
| `ai-engineering` | 12 | platform | platform:12 |
| `deployment` | 12 | platform | platform:12 |
| `domain-system` | 12 | domain | domain:12 |
| `intelligence-architecture` | 12 | domain | domain:12 |
| `advisor-intelligence` | 11 | domain | domain:11 |
| `cloud-backbone` | 11 | platform | platform:11 |
| `devices` | 10 | runtime | runtime:10 |
| `hooks` | 10 | shared-internal | shared-internal:10 |
| `platform-plane` | 10 | platform | platform:10 |
| `policy` | 10 | platform | platform:10 |
| `admin-ai` | 9 | domain | domain:9 |
| `customer-journey` | 9 | domain | domain:9 |
| `domain-engines` | 9 | domain | domain:9 |
| `no-hallucination` | 9 | platform | platform:9 |
| `control-plane` | 8 | platform | platform:8 |
| `delivery-methodology` | 8 | domain | domain:8 |
| `surfaces` | 8 | runtime | runtime:8 |
| `compute-governance` | 7 | platform | platform:7 |
| `migration` | 7 | platform | platform:7 |
| `operations` | 7 | platform | platform:7 |
| `support` | 7 | platform | platform:7 |
| `boardroom` | 6 | domain | domain:6 |
| `reality` | 6 | runtime | runtime:6 |
| `api` | 5 | integration | integration:5 |
| `ci` | 5 | platform | platform:5 |
| `demo-scenarios` | 5 | data | data:5 |
| `design-system` | 5 | legacy | legacy:5 |
| `meta-arch` | 5 | platform | platform:5 |
| `ux-trust` | 5 | domain | domain:5 |
| `advisor-protocol` | 4 | domain | domain:4 |
| `context-menu` | 4 | legacy | legacy:4 |
| `seed` | 4 | data | data:4 |
| `deploy` | 3 | platform | platform:3 |
| `detection` | 3 | runtime | runtime:3 |
| `engine` | 3 | legacy | legacy:3 |
| `setup` | 3 | domain | domain:3 |
| `simulation` | 3 | legacy | legacy:3 |
| `utils` | 3 | shared-internal | shared-internal:3 |
| `verification` | 3 | platform | platform:3 |
| `web-platform` | 3 | legacy | legacy:3 |
| `constants` | 2 | contract | contract:2 |
| `contracts` | 2 | contract | contract:2 |
| `fip` | 2 | platform | platform:2 |
| `investment-office` | 2 | domain | domain:2 |
| `platform-law` | 2 | platform | platform:2 |
| `reality-records` | 2 | runtime | runtime:2 |
| `security` | 2 | platform | platform:2 |
| `shopify` | 2 | integration | integration:2 |
| `sovereign-ai-gateway` | 2 | platform | platform:2 |
| `storage` | 2 | data | data:2 |
| `admin` | 1 | legacy | legacy:1 |
| `advisor-topology.ts` | 1 | domain | domain:1 |
| `ai-gateway` | 1 | platform | platform:1 |
| `app-store-launcher.ts` | 1 | domain | domain:1 |
| `business-journey-config.ts` | 1 | domain | domain:1 |
| `business-launcher.ts` | 1 | domain | domain:1 |
| `canonical-backend` | 1 | legacy | legacy:1 |
| `concierge-launcher.ts` | 1 | domain | domain:1 |
| `continuity-engine.ts` | 1 | domain | domain:1 |
| `cross-domain.ts` | 1 | domain | domain:1 |
| `degraded-state-classes.ts` | 1 | legacy | legacy:1 |
| `export-engine.ts` | 1 | domain | domain:1 |
| `finance-launcher.ts` | 1 | domain | domain:1 |
| `incidents` | 1 | platform | platform:1 |
| `integrations` | 1 | integration | integration:1 |
| `mission-control-launcher.ts` | 1 | domain | domain:1 |
| `offline-db.ts` | 1 | data | data:1 |
| `pack-store` | 1 | domain | domain:1 |
| `query-config.ts` | 1 | legacy | legacy:1 |
| `reality-audit` | 1 | runtime | runtime:1 |
| `service-facade.ts` | 1 | legacy | legacy:1 |
| `sita-kernel.ts` | 1 | legacy | legacy:1 |
| `sound-engine.ts` | 1 | legacy | legacy:1 |
| `supabase-helpers.ts` | 1 | integration | integration:1 |
| `system-menu` | 1 | legacy | legacy:1 |
| `utils.ts` | 1 | shared-internal | shared-internal:1 |

## Top 30 most-consumed files (highest blast radius)

| Importers | File | Class | Target |
|----------:|------|-------|--------|
| 761 | `src/lib/utils.ts` | shared-internal | `src/lib/utils.ts` |
| 224 | `src/lib/supabase-helpers.ts` | integration | `src/integrations/supabase/helpers.ts` |
| 75 | `src/lib/demo-data/admin-platform.tsx` | data | `src/data/seed/admin-platform.tsx` |
| 50 | `src/lib/design-system/sita-design-tokens.ts` | legacy | `src/legacy/unclassified/design-system/sita-design-tokens.ts` |
| 35 | `src/lib/demo-data/revenue-office.ts` | data | `src/data/seed/revenue-office.ts` |
| 32 | `src/lib/engines/business-identity-layers.ts` | domain | `src/domains/engines/business-identity-layers.ts` |
| 26 | `src/lib/demo-data/core-pages.ts` | data | `src/data/seed/core-pages.ts` |
| 26 | `src/lib/demo-data/investment.ts` | data | `src/data/seed/investment.ts` |
| 21 | `src/lib/nova-sdk/ui/components.tsx` | platform | `src/platform/nova-sdk/ui/components.tsx` |
| 20 | `src/lib/nova-sdk/ui/layout.tsx` | platform | `src/platform/nova-sdk/ui/layout.tsx` |
| 18 | `src/lib/demo-data/digital-presence.ts` | data | `src/data/seed/digital-presence.ts` |
| 18 | `src/lib/engines/lead-scoring-engine.ts` | domain | `src/domains/engines/lead-scoring-engine.ts` |
| 17 | `src/lib/design-system/app-window-system.ts` | legacy | `src/legacy/unclassified/design-system/app-window-system.ts` |
| 16 | `src/lib/engines/business-module-adaptations.ts` | domain | `src/domains/engines/business-module-adaptations.ts` |
| 16 | `src/lib/engines/business-profile-engine.ts` | domain | `src/domains/engines/business-profile-engine.ts` |
| 14 | `src/lib/app-platform/types.ts` | domain | `src/domains/apps/types.ts` |
| 14 | `src/lib/customer-journey/journey-registry.ts` | domain | `src/domains/customer-journey/journey-registry.ts` |
| 14 | `src/lib/hooks/useOSRuntime.tsx` | shared-internal | `src/hooks/useOSRuntime.tsx` |
| 14 | `src/lib/verification/verification-hooks.ts` | platform | `src/platform/verification/verification-hooks.ts` |
| 13 | `src/lib/reality-audit/reality-audit-registry.ts` | runtime | `src/runtimes/reality/reality-audit-registry.ts` |
| 13 | `src/lib/verification/surface-registry.ts` | platform | `src/platform/verification/surface-registry.ts` |
| 12 | `src/lib/data-services/crm-data-service.ts` | data | `src/data/repositories/crm-data-service.ts` |
| 12 | `src/lib/design-system/nova-os.ts` | legacy | `src/legacy/unclassified/design-system/nova-os.ts` |
| 12 | `src/lib/investment-office/mock-data.ts` | domain | `src/domains/investment/mock-data.ts` |
| 11 | `src/lib/platform-law/platform-law-registry.ts` | platform | `src/platform/governance/platform-law-registry.ts` |
| 11 | `src/lib/sound-engine.ts` | legacy | `src/legacy/unclassified/sound-engine.ts` |
| 10 | `src/lib/cloud-backbone/cloud-storage-service.ts` | platform | `src/platform/cloud/cloud-storage-service.ts` |
| 10 | `src/lib/engines/business-advisor-engine.ts` | domain | `src/domains/engines/business-advisor-engine.ts` |
| 10 | `src/lib/engines/business-advisor-personas.ts` | domain | `src/domains/engines/business-advisor-personas.ts` |
| 10 | `src/lib/engines/business-profitability-engine.ts` | domain | `src/domains/engines/business-profitability-engine.ts` |

## Wrapper-only files (likely already deprecated bridges)

Total wrapper-only: 159. Showing first 50:

| File | Importers | Target |
|------|----------:|--------|
| `src/lib/platform-plane/index.ts` | 10 | `src/platform/core/index.ts` |
| `src/lib/core-services/ai-gateway/index.ts` | 8 | `src/platform/core-services/ai-gateway/index.ts` |
| `src/lib/types/dwe-types.ts` | 7 | `src/contracts/types/dwe-types.ts` |
| `src/lib/core-services/ai-workforce/workforce-orchestrator.ts` | 6 | `src/platform/core-services/ai-workforce/workforce-orchestrator.ts` |
| `src/lib/core-services/launch-readiness/launch-readiness-engine.ts` | 6 | `src/platform/core-services/launch-readiness/launch-readiness-engine.ts` |
| `src/lib/core-services/security/security-posture-engine.ts` | 6 | `src/platform/core-services/security/security-posture-engine.ts` |
| `src/lib/core-services/service-registry/service-ownership-registry.ts` | 6 | `src/platform/core-services/service-registry/service-ownership-registry.ts` |
| `src/lib/dual-reality/index.ts` | 6 | `src/runtimes/reality/index.ts` |
| `src/lib/core-services/service-registry/route-to-service-inventory.ts` | 5 | `src/platform/core-services/service-registry/route-to-service-inventory.ts` |
| `src/lib/app-platform/index.ts` | 4 | `src/domains/apps/index.ts` |
| `src/lib/core-services/truth-indices/truth-index-aggregator.ts` | 4 | `src/platform/core-services/truth-indices/truth-index-aggregator.ts` |
| `src/lib/no-hallucination/index.ts` | 4 | `src/platform/ai/index.ts` |
| `src/lib/boardroom/index.ts` | 3 | `src/domains/boardroom/index.ts` |
| `src/lib/core-services/flagship-loops/flagship-loop-service.ts` | 3 | `src/platform/core-services/flagship-loops/flagship-loop-service.ts` |
| `src/lib/ai-engineering/index.ts` | 2 | `src/platform/ai/index.ts` |
| `src/lib/backend-topology/index.ts` | 2 | `src/platform/topology/index.ts` |
| `src/lib/core-services/ai-workforce/admin-budget-routing-policy.ts` | 2 | `src/platform/core-services/ai-workforce/admin-budget-routing-policy.ts` |
| `src/lib/core-services/biometric-auth/index.ts` | 2 | `src/platform/core-services/biometric-auth/index.ts` |
| `src/lib/core-services/canonical-pipeline/index.ts` | 2 | `src/platform/core-services/canonical-pipeline/index.ts` |
| `src/lib/core-services/device-presence-service/index.ts` | 2 | `src/platform/core-services/device-presence-service/index.ts` |
| `src/lib/core-services/frontend/frontend-quality-engine.ts` | 2 | `src/platform/core-services/frontend/frontend-quality-engine.ts` |
| `src/lib/core-services/handoff/index.ts` | 2 | `src/platform/core-services/handoff/index.ts` |
| `src/lib/core-services/identity-auth/index.ts` | 2 | `src/platform/core-services/identity-auth/index.ts` |
| `src/lib/core-services/recommendation-execution/recommendation-loop-service.ts` | 2 | `src/platform/core-services/recommendation-execution/recommendation-loop-service.ts` |
| `src/lib/core-services/self-healing/index.ts` | 2 | `src/platform/core-services/self-healing/index.ts` |
| `src/lib/delivery-methodology/index.ts` | 2 | `src/domains/delivery/index.ts` |
| `src/lib/services/life-simulation/index.ts` | 2 | `src/platform/services-unclassified/life-simulation/index.ts` |
| `src/lib/strategic-intelligence/index.ts` | 2 | `src/domains/strategic-intelligence/index.ts` |
| `src/lib/admin-ai/index.ts` | 1 | `src/domains/ai-workforce/index.ts` |
| `src/lib/advisor-intelligence/index.ts` | 1 | `src/domains/advisors/index.ts` |
| `src/lib/capabilities/index.ts` | 1 | `src/platform/capabilities/index.ts` |
| `src/lib/cloud-backbone/index.ts` | 1 | `src/platform/cloud/index.ts` |
| `src/lib/core-services/ai-gateway/diagnostics.service.ts` | 1 | `src/platform/core-services/ai-gateway/diagnostics.service.ts` |
| `src/lib/core-services/approval-engine/index.ts` | 1 | `src/platform/core-services/approval-engine/index.ts` |
| `src/lib/core-services/architecture/god-tier-integration-engine.ts` | 1 | `src/platform/core-services/architecture/god-tier-integration-engine.ts` |
| `src/lib/core-services/brain-core/index.ts` | 1 | `src/platform/core-services/brain-core/index.ts` |
| `src/lib/core-services/ci-launch-gate-service/index.ts` | 1 | `src/platform/core-services/ci-launch-gate-service/index.ts` |
| `src/lib/core-services/conscience-gate/index.ts` | 1 | `src/platform/core-services/conscience-gate/index.ts` |
| `src/lib/core-services/epistemic-firewall/assumption-registry.ts` | 1 | `src/platform/core-services/epistemic-firewall/assumption-registry.ts` |
| `src/lib/core-services/epistemic-firewall/cortex-loop.ts` | 1 | `src/platform/core-services/epistemic-firewall/cortex-loop.ts` |
| `src/lib/core-services/epistemic-firewall/evidence-grader.ts` | 1 | `src/platform/core-services/epistemic-firewall/evidence-grader.ts` |
| `src/lib/core-services/epistemic-firewall/index.ts` | 1 | `src/platform/core-services/epistemic-firewall/index.ts` |
| `src/lib/core-services/epistemic-firewall/negative-receipt.ts` | 1 | `src/platform/core-services/epistemic-firewall/negative-receipt.ts` |
| `src/lib/core-services/epistemic-firewall/sentinel-engine.ts` | 1 | `src/platform/core-services/epistemic-firewall/sentinel-engine.ts` |
| `src/lib/core-services/epistemic-firewall/tool-grounding.ts` | 1 | `src/platform/core-services/epistemic-firewall/tool-grounding.ts` |
| `src/lib/core-services/flagship-loops/index.ts` | 1 | `src/platform/core-services/flagship-loops/index.ts` |
| `src/lib/core-services/google-provider-family/types.ts` | 1 | `src/platform/core-services/google-provider-family/types.ts` |
| `src/lib/core-services/launch-readiness/index.ts` | 1 | `src/platform/core-services/launch-readiness/index.ts` |
| `src/lib/core-services/recommendation-execution/index.ts` | 1 | `src/platform/core-services/recommendation-execution/index.ts` |
| `src/lib/core-services/security/index.ts` | 1 | `src/platform/core-services/security/index.ts` |
