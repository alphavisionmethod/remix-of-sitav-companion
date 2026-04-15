# SITA OS — Move Map (Old → New Path Mapping)

> Complete inventory of every source directory and its migration target.

## Shared Plane
| Old Path | New Path | Notes |
|----------|----------|-------|
| `src/packages/contracts/` | `shared/contracts/core/` | Kernel contracts |
| `src/packages/business-contracts/` | `shared/contracts/business/` | |
| `src/packages/finance-contracts/` | `shared/contracts/finance/` | |
| `src/packages/concierge-contracts/` | `shared/contracts/concierge/` | |
| `src/packages/boardroom-contracts/` | `shared/contracts/boardroom/` | |
| `src/packages/enterprise-contracts/` | `shared/contracts/enterprise/` | |
| `src/packages/moat-contracts/` | `shared/contracts/moat/` | |
| `src/packages/policy-contracts/` | `shared/contracts/policy/` | |
| `src/packages/proof-model/` | `shared/contracts/proof/` | |
| `src/packages/reality-contracts/` | `shared/contracts/reality/` | |
| `src/packages/protocols/` | `shared/contracts/protocols/` | |
| `src/packages/event-types/` | `shared/events/` | |
| `src/packages/design-tokens/` | `shared/design-tokens/` | |
| `src/packages/auth/` | `shared/auth/` | |
| `src/packages/database-schemas/` | `shared/database-schemas/` | |
| `src/packages/client-sdk/` | `shared/sdk/` | |
| `src/packages/shell-grammar/` | `shared/contracts/shell-grammar/` | |
| `src/packages/workflow-primitives/` | `shared/contracts/workflow/` | |
| `src/packages/feature-flags/` | `shared/feature-flags/` | |
| `src/packages/entitlements/` | `shared/entitlements/` | |
| `src/packages/store-metadata/` | `shared/store-metadata/` | |
| `src/packages/template-registry/` | `shared/template-registry/` | |
| `src/packages/microinteraction-engine/` | `shared/microinteraction-engine/` | |
| `src/packages/pack-manifests/` | `shared/pack-manifests/` | |
| `src/packages/telemetry/` | `shared/telemetry/` | |
| `src/packages/advisor-config/` | `shared/advisor-config/` | |
| `src/packages/feature-governance/` | `shared/feature-governance/` | |
| `src/packages/internal-agent-config/` | `shared/internal-agent-config/` | |
| `src/packages/audit-contracts/` | `shared/contracts/audit/` | |

## OS Plane
| Old Path | New Path | Notes |
|----------|----------|-------|
| `src/lib/nova-sdk/kernel/` | `os/kernel/` | Kernel simulation |
| `src/lib/nova-sdk/runtime/` | `os/runtime/` | App runtime |
| `src/lib/nova-sdk/core/` | `os/sdk/core/` | Manifest, registry |
| `src/lib/nova-sdk/services/` | `os/sdk/services/` | System services |
| `src/lib/nova-sdk/ui/` | `os/sdk/ui/` | Nova UI components |
| `src/lib/nova-sdk/system/` | `os/sdk/system/` | Bridge, window API |
| `src/lib/nova-sdk/extensions/` | `os/sdk/extensions/` | Plugins, widgets |
| `src/lib/nova-sdk/graphics/` | `os/graphics/` | GPU, compositor |
| `src/lib/nova-sdk/input/` | `os/input/` | Input handling |
| `src/lib/nova-sdk/hooks/` | `os/sdk/hooks/` | React hooks |
| `src/lib/os-services/` | `os/services/` | 33 platform daemons |
| `src/lib/os-security/` | `os/security/` | 17 security modules |
| `src/lib/sync-engine/` | `os/services/sync/` | Sync state machine |
| `src/components/sita/shell/` | `os/shell/` | Shell UI |
| `src/components/sita/os/` | `os/ui/` | OS UI surfaces |
| `src/components/sita/boot/` | `os/boot/` | Boot sequence |
| `src/components/sita/kernel/` | `os/kernel/ui/` | Kernel debug UI |

## Backend Plane
| Old Path | New Path | Notes |
|----------|----------|-------|
| `src/lib/core-services/` | `backend/services/` | ~45 canonical services |
| `src/lib/cloud-backbone/` | `backend/services/cloud/` | 10 cloud services |
| `src/lib/platform-plane/` | `backend/gateway/` | BFF, RBAC, safety |
| `src/lib/persistence/` | `backend/libs/persistence/` | DB adapters |
| `src/lib/observability/` | `backend/libs/observability/` | Logging, tracing |
| `src/lib/ai/` | `backend/services/ai/` | AI capability client |
| `src/lib/services/ai-gateway/` | `backend/gateway/ai/` | AI gateway |
| `src/lib/intelligence-architecture/` | `backend/services/intelligence/` | Intel pipeline |
| `src/lib/advisor-intelligence/` | `backend/services/advisor/` | Advisor engine |
| `src/lib/advisor-protocol/` | `backend/services/advisor-protocol/` | Handoff/escalation |
| `src/lib/boardroom/` | `backend/services/boardroom/` | Decision orchestration |
| `src/lib/strategic-intelligence/` | `backend/services/strategic/` | Cost/quality/portfolio |
| `src/lib/domain-engines/` | `backend/services/domain-engines/` | Biz/Fin/Concierge |
| `src/lib/compute-governance/` | `backend/services/compute-governance/` | Budget/routing |
| `src/lib/no-hallucination/` | `backend/services/no-hallucination/` | Anti-hallucination |
| `src/lib/ai-engineering/` | `backend/services/ai-engineering/` | Monte Carlo |
| `src/lib/detection/` | `backend/services/detection/` | Reality detection |
| `src/lib/verification/` | `backend/services/verification/` | Verification hooks |
| `src/lib/shopify/` | `backend/services/shopify/` | Shopify connector |
| `supabase/functions/` | `backend/edge-functions/` | Deno edge functions |

## Admin Plane
| Old Path | New Path | Notes |
|----------|----------|-------|
| `src/pages/admin/` | `apps/admin-console/src/pages/` | Admin routes |
| `src/components/admin/` | `apps/admin-console/src/components/` | Admin UI |
| `src/components/admin-ai/` | `apps/admin-console/src/components/ai/` | AI workforce UI |
| `src/components/admin-os/` | `apps/admin-console/src/components/os/` | OS admin UI |
| `src/components/governance/` | `apps/admin-console/src/components/governance/` | Governance |
| `src/lib/admin-ai/` | `apps/admin-console/src/lib/ai/` | AI workforce client |

## Founder Plane
| Old Path | New Path | Notes |
|----------|----------|-------|
| `src/pages/owner/` | `apps/founder-center/src/pages/` | Founder routes |
| `src/pages/owner-mode/` | `apps/founder-center/src/pages/mode/` | Owner mode |
| `src/pages/mission-control/` | `apps/founder-center/src/pages/mission/` | Mission control |
| `src/pages/enterprise/` | `apps/founder-center/src/pages/enterprise/` | Enterprise mgmt |

## Mobile Plane
| Old Path | New Path | Notes |
|----------|----------|-------|
| `src/pages/mobile/` | `apps/mobile/src/pages/` | Mobile routes |
| `src/components/mobile/` | `apps/mobile/src/components/` | Mobile UI |

## Internal Tools
| Old Path | New Path | Notes |
|----------|----------|-------|
| `src/lib/simulation/` | `internal-tools/simulations/` | Simulation engines |
| `src/lib/fip/` | `internal-tools/fip/` | Feature governance |
| `src/lib/dual-reality/` | `internal-tools/dual-reality/` | Dual reality framework |
| `src/lib/reality-audit/` | `internal-tools/reality-audit/` | Reality audit |
| `src/lib/reality-records/` | `internal-tools/reality-records/` | Reality classification |
| `src/lib/demo-data/` | `internal-tools/demo-data/` | Demo data generators |
| `src/lib/seed/` | `internal-tools/seed/` | Database seed scripts |

## Product Plane (stays in src/)
| Path | Description |
|------|-------------|
| `src/pages/` (non-admin, non-founder, non-mobile) | Product routes |
| `src/components/` (non-admin, non-mobile, non-sita) | Product UI |
| `src/hooks/` | Product React hooks |
| `src/lib/engines/` | Product domain engines |
| `src/lib/services/` | Product service layer |
| `src/lib/customer-journey/` | Customer journey engine |
| `src/lib/app-platform/` | App platform |
| `src/lib/design-system/` | Design system |
| `src/lib/investment-office/` | Investment office |
| `src/lib/pack-store/` | Pack store |
| `src/lib/ux-trust/` | UX trust engine |
