# Wave 7b — services-unclassified Classification

Generated: 2026-04-18T03:00:27.095Z
Total entries scanned: 224
Total files covered: 498

## Class Summary

| Class | Entries | Files |
|---|---:|---:|
| data | 9 | 18 |
| domain | 68 | 204 |
| integration | 12 | 36 |
| platform | 116 | 215 |
| runtime | 17 | 21 |
| shared-internal | 2 | 4 |

## data

| Entry | Files | Target | Reason |
|---|---:|---|---|
| `projections` | 9 | `src/data/persistence/projections` | persistence |
| `database` | 2 | `src/data/persistence/database` | persistence |
| `boot-persistence` | 1 | `src/data/persistence/boot-persistence` | persistence |
| `offline-queue` | 1 | `src/data/persistence/offline-queue` | persistence |
| `offline-sync` | 1 | `src/data/persistence/offline-sync` | persistence |
| `projection-service` | 1 | `src/data/persistence/projection-service` | persistence |
| `release-persistence-service.ts` | 1 | `src/data/persistence/release-persistence-service` | persistence |
| `session-persistence.ts` | 1 | `src/data/persistence/session-persistence` | persistence |
| `universal-state-sync` | 1 | `src/data/persistence/universal-state-sync` | persistence |

## domain

| Entry | Files | Target | Reason |
|---|---:|---|---|
| `finance-os` | 40 | `src/domains/finance/finance-os` | finance-context |
| `business-os` | 26 | `src/domains/business/business-os` | business-context |
| `concierge-os` | 21 | `src/domains/concierge/concierge-os` | concierge-context |
| `boardroom-service` | 9 | `src/domains/boardroom/boardroom-service` | boardroom-context |
| `app-store` | 8 | `src/domains/apps/app-store` | apps-domain |
| `setup` | 8 | `src/domains/setup/setup` | setup-context |
| `sovereign-calculation` | 8 | `src/domains/finance/sovereign-calculation` | finance-context |
| `ai-workforce` | 6 | `src/domains/ai-workforce/ai-workforce` | ai-workforce |
| `life-growth` | 6 | `src/domains/concierge/life-growth` | concierge-context |
| `native-apps` | 5 | `src/domains/apps/native-apps` | apps-domain |
| `revenue-growth` | 4 | `src/domains/business/revenue-growth` | business-context |
| `advisor-memory` | 2 | `src/domains/boardroom/advisor-memory` | boardroom-context |
| `ai-economics` | 2 | `src/domains/ai-workforce/ai-economics` | ai-workforce |
| `billing` | 2 | `src/domains/finance/billing` | finance-context |
| `council-orchestrator` | 2 | `src/domains/boardroom/council-orchestrator` | boardroom-context |
| `life-simulation` | 2 | `src/domains/concierge/life-simulation` | concierge-context |
| `payment-execution-service` | 2 | `src/domains/finance/payment-execution-service` | finance-context |
| `advisor-feedback` | 1 | `src/domains/boardroom/advisor-feedback` | boardroom-context |
| `advisor-knowledge` | 1 | `src/domains/boardroom/advisor-knowledge` | boardroom-context |
| `ai-memory-graph` | 1 | `src/domains/ai-workforce/ai-memory-graph` | ai-workforce |
| `app-ingestion` | 1 | `src/domains/apps/app-ingestion` | apps-domain |
| `attribution-analytics` | 1 | `src/domains/business/attribution-analytics` | business-context |
| `autonomous-negotiation` | 1 | `src/domains/business/autonomous-negotiation` | business-context |
| `board-api-client.ts` | 1 | `src/domains/boardroom/board-api-client` | boardroom-context |
| `boardroom-bridge.ts` | 1 | `src/domains/boardroom/boardroom-bridge` | boardroom-context |
| `booking-scheduling` | 1 | `src/domains/business/booking-scheduling` | business-context |
| `capital-allocation` | 1 | `src/domains/finance/capital-allocation` | finance-context |
| `chief-of-staff` | 1 | `src/domains/business/chief-of-staff` | business-context |
| `client-sentiment` | 1 | `src/domains/business/client-sentiment` | business-context |
| `competitive-intelligence` | 1 | `src/domains/business/competitive-intelligence` | business-context |
| `compound-life-score` | 1 | `src/domains/concierge/compound-life-score` | concierge-context |
| `decision-intelligence` | 1 | `src/domains/boardroom/decision-intelligence` | boardroom-context |
| `digital-legacy-vault` | 1 | `src/domains/concierge/digital-legacy-vault` | concierge-context |
| `engineering-governance` | 1 | `src/domains/strategic-intelligence/engineering-governance` | release/governance domain |
| `family-command-center` | 1 | `src/domains/concierge/family-command-center` | concierge-context |
| `family-constitution` | 1 | `src/domains/concierge/family-constitution` | concierge-context |
| `founder-orchestrator` | 1 | `src/domains/business/founder-orchestrator` | business-context |
| `habit-tracker` | 1 | `src/domains/concierge/habit-tracker` | concierge-context |
| `household-org-graph` | 1 | `src/domains/concierge/household-org-graph` | concierge-context |
| `integration-concierge` | 1 | `src/domains/setup/integration-concierge` | setup-context |
| `launch-gate` | 1 | `src/domains/strategic-intelligence/launch-gate` | release/governance domain |
| `launch-readiness` | 1 | `src/domains/strategic-intelligence/launch-readiness` | release/governance domain |
| `legacy-planning` | 1 | `src/domains/concierge/legacy-planning` | concierge-context |
| `life-score` | 1 | `src/domains/concierge/life-score` | concierge-context |
| `multi-agent-debate` | 1 | `src/domains/boardroom/multi-agent-debate` | boardroom-context |
| `natural-language-policy` | 1 | `src/domains/boardroom/natural-language-policy` | boardroom-context |
| `onboarding` | 1 | `src/domains/setup/onboarding` | setup-context |
| `onboarding-daemon` | 1 | `src/domains/setup/onboarding-daemon` | setup-context |
| `opportunity-engine` | 1 | `src/domains/business/opportunity-engine` | business-context |
| `opportunity-graph` | 1 | `src/domains/business/opportunity-graph` | business-context |
| `opportunity-radar` | 1 | `src/domains/business/opportunity-radar` | business-context |
| `owner-control-room` | 1 | `src/domains/business/owner-control-room` | business-context |
| `pack-management-service` | 1 | `src/domains/apps/pack-management-service` | apps-domain |
| `personal-graph` | 1 | `src/domains/concierge/personal-graph` | concierge-context |
| `personal-operating-model` | 1 | `src/domains/concierge/personal-operating-model` | concierge-context |
| `platform-readiness` | 1 | `src/domains/strategic-intelligence/platform-readiness` | release/governance domain |
| `relationship-intelligence` | 1 | `src/domains/business/relationship-intelligence` | business-context |
| `release-intelligence` | 1 | `src/domains/strategic-intelligence/release-intelligence` | release/governance domain |
| `revenue-autopilot` | 1 | `src/domains/business/revenue-autopilot` | business-context |
| `revenue-leak-detector` | 1 | `src/domains/business/revenue-leak-detector` | business-context |
| `revenue-ticker` | 1 | `src/domains/business/revenue-ticker` | business-context |
| `routine-detector.ts` | 1 | `src/domains/concierge/routine-detector` | concierge-context |
| `sovereign-exporter` | 1 | `src/domains/finance/sovereign-exporter` | finance-context |
| `sovereign-time` | 1 | `src/domains/concierge/sovereign-time` | concierge-context |
| `time-wealth` | 1 | `src/domains/concierge/time-wealth` | concierge-context |
| `timeline-calendar` | 1 | `src/domains/concierge/timeline-calendar` | concierge-context |
| `website-management` | 1 | `src/domains/business/website-management` | business-context |
| `widget-marketplace` | 1 | `src/domains/apps/widget-marketplace` | apps-domain |

## integration

| Entry | Files | Target | Reason |
|---|---:|---|---|
| `connector-control-plane` | 15 | `src/integrations/external/connector-control-plane` | external-provider |
| `google-provider-family` | 5 | `src/integrations/external/google-provider-family` | external-provider |
| `integration-hub` | 4 | `src/integrations/external/integration-hub` | external-provider |
| `realtime-gateway` | 3 | `src/integrations/external/realtime-gateway` | external-provider |
| `push-notification` | 2 | `src/integrations/external/push-notification` | external-provider |
| `connector-health-service.ts` | 1 | `src/integrations/external/connector-health-service` | external-provider |
| `connector-notification-honesty-seed.ts` | 1 | `src/integrations/external/connector-notification-honesty-seed` | external-provider |
| `connector-runners` | 1 | `src/integrations/external/connector-runners` | external-provider |
| `connector-truth` | 1 | `src/integrations/external/connector-truth` | external-provider |
| `inference-gateway` | 1 | `src/integrations/external/inference-gateway` | external-provider |
| `messaging-gateway` | 1 | `src/integrations/external/messaging-gateway` | external-provider |
| `provider-family` | 1 | `src/integrations/external/provider-family` | external-provider |

## platform

| Entry | Files | Target | Reason |
|---|---:|---|---|
| `ai-gateway` | 10 | `src/platform/ai/ai-gateway` | platform-ai |
| `brain-core` | 10 | `src/platform/orchestration/brain-core` | orchestration |
| `epistemic-firewall` | 8 | `src/platform/security/epistemic-firewall` | platform-security |
| `identity-auth` | 8 | `src/platform/core-services/identity-auth` | platform-core-service |
| `orchestration-pipeline` | 8 | `src/platform/orchestration/orchestration-pipeline` | orchestration |
| `memory-service` | 7 | `src/platform/ai/memory-service` | platform-ai |
| `verification-engine` | 6 | `src/platform/core-services/verification-engine` | platform-core-service |
| `approval-engine` | 5 | `src/platform/core-services/approval-engine` | platform-core-service |
| `event-bus` | 5 | `src/platform/core-services/event-bus` | platform-core-service |
| `policy-engine` | 5 | `src/platform/core-services/policy-engine` | platform-core-service |
| `receipt-service` | 5 | `src/platform/services-unclassified/receipt-service` | fallback-needs-review |
| `support-diagnostics` | 5 | `src/platform/core-services/support-diagnostics` | platform-core-service |
| `capability-router` | 4 | `src/platform/orchestration/capability-router` | orchestration |
| `executor-service` | 4 | `src/platform/orchestration/executor-service` | orchestration |
| `observability` | 4 | `src/platform/observability/observability` | platform-observability |
| `service-registry` | 4 | `src/platform/core-services/service-registry` | platform-core-service |
| `conscience-gate` | 3 | `src/platform/security/conscience-gate` | platform-security |
| `personalization-engine` | 3 | `src/platform/ai/personalization-engine` | platform-ai |
| `admin-service` | 2 | `src/platform/core-services/admin-service` | platform-core-service |
| `analytics` | 2 | `src/platform/services-unclassified/analytics` | fallback-needs-review |
| `auth` | 2 | `src/platform/core-services/auth` | platform-core-service |
| `canonical-pipeline` | 2 | `src/platform/orchestration/canonical-pipeline` | orchestration |
| `degraded-mode` | 2 | `src/platform/core-services/degraded-mode` | platform-core-service |
| `desk` | 2 | `src/platform/core-services/desk` | platform-core-service |
| `ecosystem-orchestrator` | 2 | `src/platform/orchestration/ecosystem-orchestrator` | orchestration |
| `meta-governance` | 2 | `src/platform/core-services/meta-governance` | platform-core-service |
| `mnemosyne` | 2 | `src/platform/ai/mnemosyne` | platform-ai |
| `model-router` | 2 | `src/platform/ai/model-router` | platform-ai |
| `security-privacy` | 2 | `src/platform/security/security-privacy` | platform-security |
| `self-healing` | 2 | `src/platform/ai/self-healing` | platform-ai |
| `truth-indices` | 2 | `src/platform/core-services/truth-indices` | platform-core-service |
| `accuracy-classifier` | 1 | `src/platform/ai/accuracy-classifier` | platform-ai |
| `action-queue` | 1 | `src/platform/core-services/action-queue` | platform-core-service |
| `action-safety` | 1 | `src/platform/core-services/action-safety` | platform-core-service |
| `adaptive-interface` | 1 | `src/platform/ai/adaptive-interface` | platform-ai |
| `admin-route-truth-service.ts` | 1 | `src/platform/core-services/admin-route-truth-service` | platform-core-service |
| `alerting` | 1 | `src/platform/observability/alerting` | platform-observability |
| `anomaly-alert` | 1 | `src/platform/observability/anomaly-alert` | platform-observability |
| `api-gateway` | 1 | `src/platform/core-services/api-gateway` | platform-core-service |
| `architecture` | 1 | `src/platform/core-services/architecture` | platform-core-service |
| `attention-os` | 1 | `src/platform/ai/attention-os` | platform-ai |
| `audit-ledger` | 1 | `src/platform/observability/audit-ledger` | platform-observability |
| `audit-trail-timeline` | 1 | `src/platform/observability/audit-trail-timeline` | platform-observability |
| `auto-proposal` | 1 | `src/platform/core-services/auto-proposal` | platform-core-service |
| `boundary-engine` | 1 | `src/platform/core-services/boundary-engine` | platform-core-service |
| `ci-launch-gate-service.ts` | 1 | `src/platform/core-services/ci-launch-gate-service` | platform-core-service |
| `cloud-control-plane-infra` | 1 | `src/platform/core-services/cloud-control-plane-infra` | platform-core-service |
| `communication-service` | 1 | `src/platform/core-services/communication-service` | platform-core-service |
| `constitution-compiler` | 1 | `src/platform/core-services/constitution-compiler` | platform-core-service |
| `constitution-engine` | 1 | `src/platform/core-services/constitution-engine` | platform-core-service |
| `context-graph` | 1 | `src/platform/ai/context-graph` | platform-ai |
| `continuity-engine` | 1 | `src/platform/core-services/continuity-engine` | platform-core-service |
| `data-scope-model` | 1 | `src/platform/core-services/data-scope-model` | platform-core-service |
| `demo-governance` | 1 | `src/platform/services-unclassified/demo-governance` | fallback-needs-review |
| `device-presence-service.ts` | 1 | `src/platform/services-unclassified/device-presence-service` | fallback-needs-review |
| `digest-engine` | 1 | `src/platform/ai/digest-engine` | platform-ai |
| `digest-journal` | 1 | `src/platform/ai/digest-journal` | platform-ai |
| `digital-twins` | 1 | `src/platform/core-services/digital-twins` | platform-core-service |
| `document-engine` | 1 | `src/platform/core-services/document-engine` | platform-core-service |
| `document-signature` | 1 | `src/platform/core-services/document-signature` | platform-core-service |
| `duress-detection` | 1 | `src/platform/security/duress-detection` | platform-security |
| `emergency-halt` | 1 | `src/platform/core-services/emergency-halt` | platform-core-service |
| `enterprise-control-plane` | 1 | `src/platform/core-services/enterprise-control-plane` | platform-core-service |
| `entity-graph` | 1 | `src/platform/core-services/entity-graph` | platform-core-service |
| `error-monitoring-service.ts` | 1 | `src/platform/observability/error-monitoring-service` | platform-observability |
| `experience-signature` | 1 | `src/platform/ai/experience-signature` | platform-ai |
| `explainability` | 1 | `src/platform/ai/explainability` | platform-ai |
| `file-ingestion` | 1 | `src/platform/core-services/file-ingestion` | platform-core-service |
| `flagship-loops` | 1 | `src/platform/orchestration/flagship-loops` | orchestration |
| `fraud-sentinel` | 1 | `src/platform/security/fraud-sentinel` | platform-security |
| `frontend` | 1 | `src/platform/core-services/frontend` | platform-core-service |
| `golden-trace-runner` | 1 | `src/platform/observability/golden-trace-runner` | platform-observability |
| `governance-simulator` | 1 | `src/platform/core-services/governance-simulator` | platform-core-service |
| `handoff` | 1 | `src/platform/orchestration/handoff` | orchestration |
| `i18n` | 1 | `src/platform/core-services/i18n` | platform-core-service |
| `identity` | 1 | `src/platform/core-services/identity` | platform-core-service |
| `immune-controller` | 1 | `src/platform/ai/immune-controller` | platform-ai |
| `incident-management` | 1 | `src/platform/core-services/incident-management` | platform-core-service |
| `injection-firewall` | 1 | `src/platform/security/injection-firewall` | platform-security |
| `intent-inbox` | 1 | `src/platform/core-services/intent-inbox` | platform-core-service |
| `intent-orchestrator` | 1 | `src/platform/orchestration/intent-orchestrator` | orchestration |
| `keyvault` | 1 | `src/platform/security/keyvault` | platform-security |
| `lease-manager` | 1 | `src/platform/core-services/lease-manager` | platform-core-service |
| `memory-governance` | 1 | `src/platform/ai/memory-governance` | platform-ai |
| `notifications` | 1 | `src/platform/core-services/notifications` | platform-core-service |
| `observability-hub` | 1 | `src/platform/observability/observability-hub` | platform-observability |
| `operating-autopilot` | 1 | `src/platform/orchestration/operating-autopilot` | orchestration |
| `os-orchestration` | 1 | `src/platform/orchestration/os-orchestration` | orchestration |
| `os-unification` | 1 | `src/platform/orchestration/os-unification` | orchestration |
| `outcome-engine` | 1 | `src/platform/orchestration/outcome-engine` | orchestration |
| `performance-monitor` | 1 | `src/platform/observability/performance-monitor` | platform-observability |
| `predictive-intent` | 1 | `src/platform/ai/predictive-intent` | platform-ai |
| `predictive-needs` | 1 | `src/platform/ai/predictive-needs` | platform-ai |
| `preferences` | 1 | `src/platform/core-services/preferences` | platform-core-service |
| `profiles` | 1 | `src/platform/core-services/profiles` | platform-core-service |
| `prompt-assembler` | 1 | `src/platform/ai/prompt-assembler` | platform-ai |
| `proof-orchestrator` | 1 | `src/platform/orchestration/proof-orchestrator` | orchestration |
| `protocol-bridge` | 1 | `src/platform/orchestration/protocol-bridge` | orchestration |
| `recommendation-execution` | 1 | `src/platform/orchestration/recommendation-execution` | orchestration |
| `rex` | 1 | `src/platform/orchestration/rex` | orchestration |
| `role-permission-engine` | 1 | `src/platform/core-services/role-permission-engine` | platform-core-service |
| `search-fabric` | 1 | `src/platform/core-services/search-fabric` | platform-core-service |
| `security` | 1 | `src/platform/security/security` | platform-security |
| `self-learning` | 1 | `src/platform/ai/self-learning` | platform-ai |
| `session-resume` | 1 | `src/platform/services-unclassified/session-resume` | fallback-needs-review |
| `simulator` | 1 | `src/platform/core-services/simulator` | platform-core-service |
| `system-updates` | 1 | `src/platform/core-services/system-updates` | platform-core-service |
| `tenant-firewall` | 1 | `src/platform/security/tenant-firewall` | platform-security |
| `timing-intelligence` | 1 | `src/platform/ai/timing-intelligence` | platform-ai |
| `trust-actions` | 1 | `src/platform/security/trust-actions` | platform-security |
| `trust-governor` | 1 | `src/platform/security/trust-governor` | platform-security |
| `trust-state-service` | 1 | `src/platform/security/trust-state-service` | platform-security |
| `update-daemon` | 1 | `src/platform/core-services/update-daemon` | platform-core-service |
| `voice-command` | 1 | `src/platform/services-unclassified/voice-command` | fallback-needs-review |
| `workflow-engine` | 1 | `src/platform/orchestration/workflow-engine` | orchestration |
| `workspace-intelligence` | 1 | `src/platform/ai/workspace-intelligence` | platform-ai |

## runtime

| Entry | Files | Target | Reason |
|---|---:|---|---|
| `surface-portability` | 3 | `src/runtimes/core/surface-portability` | runtime-substrate |
| `domain-runtime` | 2 | `src/runtimes/core/domain-runtime` | runtime-substrate |
| `os-awareness` | 2 | `src/runtimes/core/os-awareness` | runtime-substrate |
| `adaptive-visual-system.ts` | 1 | `src/runtimes/core/adaptive-visual-system` | runtime-substrate |
| `ambient-context-engine.ts` | 1 | `src/runtimes/core/ambient-context-engine` | runtime-substrate |
| `background-intelligence.ts` | 1 | `src/runtimes/core/background-intelligence` | runtime-substrate |
| `biometric-auth` | 1 | `src/runtimes/core/biometric-auth` | runtime-substrate |
| `device-mesh` | 1 | `src/runtimes/core/device-mesh` | runtime-substrate |
| `edge-device-runtime` | 1 | `src/runtimes/core/edge-device-runtime` | runtime-substrate |
| `fleet` | 1 | `src/runtimes/core/fleet` | runtime-substrate |
| `fleet-health` | 1 | `src/runtimes/core/fleet-health` | runtime-substrate |
| `fleet-ota` | 1 | `src/runtimes/core/fleet-ota` | runtime-substrate |
| `predictive-prefetch.ts` | 1 | `src/runtimes/core/predictive-prefetch` | runtime-substrate |
| `sita-modes` | 1 | `src/runtimes/core/sita-modes` | runtime-substrate |
| `surface-detection` | 1 | `src/runtimes/core/surface-detection` | runtime-substrate |
| `trusted-device` | 1 | `src/runtimes/core/trusted-device` | runtime-substrate |
| `window-physics.ts` | 1 | `src/runtimes/core/window-physics` | runtime-substrate |

## shared-internal

| Entry | Files | Target | Reason |
|---|---:|---|---|
| `__tests__` | 3 | `src/lib/__tests__/__tests__` | tests-stay |
| `index.ts` | 1 | `src/lib/services/index` | barrel-stay |