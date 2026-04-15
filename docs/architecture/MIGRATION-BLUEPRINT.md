# SITA OS — Platform Migration Blueprint
# From Monolithic SPA to Multi-Plane Monorepo

> **Purpose**: This document maps every directory in the current `src/` to its
> target plane in the new monorepo structure. Execute this after exporting
> from Lovable to a self-hosted Nx/Turborepo workspace.

---

## 1. Target Monorepo Structure

```
sita-os/
├── apps/
│   ├── product-shell/          # User-facing SPA (current main app)
│   ├── admin-console/          # Operator/admin web app
│   ├── founder-center/         # Founder command center
│   └── mobile/                 # React Native or Flutter
├── os/
│   ├── kernel/                 # Nova kernel simulation
│   ├── runtime/                # OS runtime services
│   ├── shell/                  # Desktop shell, dock, windows
│   ├── sdk/                    # Nova SDK
│   ├── security/               # OS-level security
│   ├── services/               # OS-local services
│   ├── recovery/               # Self-healing, rollback
│   └── telemetry/              # OS telemetry
├── backend/
│   ├── edge-functions/         # Supabase edge functions (current supabase/functions/)
│   ├── services/               # Backend domain services
│   ├── workers/                # Background jobs
│   ├── bff-user/               # User BFF
│   ├── bff-admin/              # Admin BFF
│   ├── bff-founder/            # Founder BFF
│   ├── gateway/                # API gateway, AI gateway
│   └── realtime/               # WebSocket/Realtime
├── shared/
│   ├── contracts/              # All shared type contracts
│   ├── events/                 # Event type definitions
│   ├── models/                 # Shared domain models
│   ├── design-tokens/          # Design system tokens
│   ├── auth/                   # Auth scopes, roles
│   ├── policy/                 # Policy contracts
│   ├── capabilities/           # Capability definitions
│   ├── sdk/                    # Client SDK
│   └── utils/                  # Shared utilities
├── internal-tools/
│   ├── architecture-checks/    # CI boundary enforcement
│   ├── simulations/            # Simulation engines
│   ├── forensics/              # Debug/audit tools
│   └── prompt-lab/             # AI prompt engineering
├── infra/
│   ├── docker/                 # Dockerfiles
│   ├── nginx/                  # Nginx configs
│   ├── deploy/                 # Deployment scripts
│   └── ci/                     # CI/CD pipelines
├── docs/
│   ├── architecture/
│   ├── adrs/
│   ├── runbooks/
│   └── generated/
├── scripts/                    # Build/validation scripts
└── tests/                      # Cross-plane integration tests
```

---

## 2. File Migration Map

### 2.1 — To `shared/contracts/`

| Current Path | Target |
|---|---|
| `src/packages/contracts/` | `shared/contracts/core/` |
| `src/packages/business-contracts/` | `shared/contracts/business/` |
| `src/packages/finance-contracts/` | `shared/contracts/finance/` |
| `src/packages/concierge-contracts/` | `shared/contracts/concierge/` |
| `src/packages/boardroom-contracts/` | `shared/contracts/boardroom/` |
| `src/packages/enterprise-contracts/` | `shared/contracts/enterprise/` |
| `src/packages/audit-contracts/` | `shared/contracts/audit/` |
| `src/packages/moat-contracts/` | `shared/contracts/moat/` |
| `src/packages/reality-contracts/` | `shared/contracts/reality/` |
| `src/packages/policy-contracts/` | `shared/contracts/policy/` |
| `src/packages/proof-model/` | `shared/contracts/proof/` |
| `src/packages/workflow-primitives/` | `shared/contracts/workflow/` |
| `src/lib/contracts/` | `shared/contracts/legacy/` (merge into core) |
| `src/lib/types/` | `shared/models/` |

### 2.2 — To `shared/` (other)

| Current Path | Target |
|---|---|
| `src/packages/design-tokens/` | `shared/design-tokens/` |
| `src/packages/event-types/` | `shared/events/` |
| `src/packages/auth/` | `shared/auth/` |
| `src/packages/entitlements/` | `shared/auth/entitlements/` |
| `src/packages/telemetry/` | `shared/telemetry/` |
| `src/packages/client-sdk/` | `shared/sdk/` |
| `src/packages/database-schemas/` | `shared/models/database/` |
| `src/packages/feature-flags/` | `shared/capabilities/feature-flags/` |
| `src/packages/feature-governance/` | `shared/capabilities/governance/` |
| `src/packages/shell-grammar/` | `shared/sdk/shell-grammar/` |
| `src/packages/template-registry/` | `shared/capabilities/templates/` |
| `src/packages/store-metadata/` | `shared/capabilities/store/` |
| `src/packages/pack-manifests/` | `shared/capabilities/packs/` |
| `src/packages/microinteraction-engine/` | `shared/design-tokens/microinteractions/` |
| `src/lib/utils/` | `shared/utils/` |
| `src/lib/constants/` | `shared/constants/` |

### 2.3 — To `os/`

| Current Path | Target |
|---|---|
| `src/lib/nova-sdk/` | `os/sdk/` |
| `src/lib/os-services/` | `os/services/` |
| `src/lib/os-security/` | `os/security/` |
| `src/lib/sync-engine/` | `os/runtime/sync/` |
| `src/components/sita/shell/` | `os/shell/components/` |
| `src/components/sita/os/` | `os/shell/os-components/` |
| `src/contexts/NovaSDKContext.tsx` | `os/sdk/context.tsx` |
| `src/contexts/SitaOSContext.tsx` | `os/runtime/context.tsx` |
| `src/contexts/SitaKernelContext.tsx` | `os/kernel/context.tsx` |
| `src/contexts/WindowManagerContext.tsx` | `os/shell/window-context.tsx` |
| `src/contexts/RuntimeProvider.tsx` | `os/runtime/provider.tsx` |
| `src/contexts/CalmEngineContext.tsx` | `os/runtime/calm-engine-context.tsx` |
| `src/contexts/ConnectivityContext.tsx` | `os/runtime/connectivity-context.tsx` |

### 2.4 — To `backend/`

| Current Path | Target |
|---|---|
| `supabase/functions/` | `backend/edge-functions/` |
| `src/lib/core-services/` | `backend/services/core/` (canonical logic only) |
| `src/lib/services/` | `backend/services/domain/` (shim layer becomes proxy) |
| `src/lib/cloud-backbone/` | `backend/services/cloud/` |
| `src/lib/platform-plane/` | `backend/services/platform/` |
| `src/lib/persistence/` | `backend/services/persistence/` |
| `src/lib/ai-gateway/` | `backend/gateway/ai/` |
| `src/lib/sovereign-ai-gateway/` | `backend/gateway/sovereign-ai/` |
| `src/lib/ai-engineering/` | `backend/services/ai-engineering/` |
| `src/lib/intelligence-architecture/` | `backend/services/intelligence/` |
| `src/lib/observability/` | `backend/services/observability/` |
| `src/lib/data-services/` | `backend/services/data/` |
| `src/lib/verification/` | `backend/services/verification/` |
| `src/lib/reality-audit/` | `backend/services/reality-audit/` |
| `src/lib/reality-records/` | `backend/services/reality-records/` |
| `src/lib/no-hallucination/` | `backend/services/no-hallucination/` |
| `src/lib/compute-governance/` | `backend/services/compute-governance/` |
| `src/lib/platform-law/` | `backend/services/platform-law/` |
| `src/lib/ux-trust/` | `backend/services/ux-trust/` |
| `src/lib/detection/` | `backend/services/detection/` |
| `src/lib/delivery-methodology/` | `backend/services/delivery/` |
| `src/lib/customer-journey/` | `backend/services/customer-journey/` |
| `src/lib/strategic-intelligence/` | `backend/services/strategic-intelligence/` |

### 2.5 — To `apps/product-shell/` (remains as SPA)

| Current Path | Target |
|---|---|
| `src/pages/` (non-admin, non-mobile) | `apps/product-shell/src/pages/` |
| `src/components/business/` | `apps/product-shell/src/components/business/` |
| `src/components/finance/` | `apps/product-shell/src/components/finance/` |
| `src/components/concierge/` | `apps/product-shell/src/components/concierge/` |
| `src/components/investment/` | `apps/product-shell/src/components/investment/` |
| `src/components/advisors/` | `apps/product-shell/src/components/advisors/` |
| `src/components/files/` | `apps/product-shell/src/components/files/` |
| `src/components/money/` | `apps/product-shell/src/components/money/` |
| `src/components/notifications/` | `apps/product-shell/src/components/notifications/` |
| `src/components/shared/` | `apps/product-shell/src/components/shared/` |
| `src/components/ui/` | `apps/product-shell/src/components/ui/` |
| `src/components/user-app/` | `apps/product-shell/src/components/user-app/` |
| `src/components/platform/` | `apps/product-shell/src/components/platform/` |
| `src/components/reality/` | `apps/product-shell/src/components/reality/` |
| `src/components/cloud/` | `apps/product-shell/src/components/cloud/` |
| `src/components/auth/` | `apps/product-shell/src/components/auth/` |
| `src/hooks/` | `apps/product-shell/src/hooks/` |
| `src/contexts/AuthContext.tsx` | `apps/product-shell/src/contexts/AuthContext.tsx` |
| `src/contexts/ThemeContext.tsx` | `apps/product-shell/src/contexts/ThemeContext.tsx` |
| `src/lib/demo-data/` | `apps/product-shell/src/demo-data/` |
| `src/lib/demo-scenarios/` | `apps/product-shell/src/demo-scenarios/` |
| `src/lib/mock-data/` | `apps/product-shell/src/mock-data/` |

### 2.6 — To `apps/admin-console/`

| Current Path | Target |
|---|---|
| `src/pages/admin/` | `apps/admin-console/src/pages/` |
| `src/components/admin/` | `apps/admin-console/src/components/` |
| `src/components/admin-ai/` | `apps/admin-console/src/components/admin-ai/` |
| `src/components/admin-os/` | `apps/admin-console/src/components/admin-os/` |
| `src/components/governance/` | `apps/admin-console/src/components/governance/` |
| `src/lib/admin-ai/` | `apps/admin-console/src/lib/admin-ai/` |

### 2.7 — To `apps/founder-center/`

| Current Path | Target |
|---|---|
| `src/pages/owner/` | `apps/founder-center/src/pages/` |
| `src/pages/owner-mode/` | `apps/founder-center/src/pages/owner-mode/` |
| `src/pages/mission-control/` | `apps/founder-center/src/pages/mission-control/` |
| `src/pages/enterprise/` | `apps/founder-center/src/pages/enterprise/` |

### 2.8 — To `apps/mobile/`

| Current Path | Target |
|---|---|
| `src/pages/mobile/` | `apps/mobile/src/pages/` |
| `src/components/mobile/` | `apps/mobile/src/components/` |

### 2.9 — To `internal-tools/`

| Current Path | Target |
|---|---|
| `src/lib/simulation/` | `internal-tools/simulations/` |
| `src/components/simulation/` | `internal-tools/simulations/ui/` |
| `src/lib/engine/` | `internal-tools/simulations/engine/` |
| `src/lib/engines/` | Split: domain → backend, simulation → internal-tools |
| `src/lib/fip/` | `internal-tools/architecture-checks/fip/` |
| `src/lib/architecture/` | `internal-tools/architecture-checks/` |
| `scripts/architecture/` | `internal-tools/architecture-checks/scripts/` |
| `src/packages/advisor-config/` | `internal-tools/agent-config/advisor/` |
| `src/packages/internal-agent-config/` | `internal-tools/agent-config/internal/` |

### 2.10 — To `infra/`

| Current Path | Target |
|---|---|
| `Dockerfile` | `infra/docker/Dockerfile` |
| `docker-compose.yml` | `infra/docker/docker-compose.yml` |
| `nginx/` | `infra/nginx/` |
| `scripts/release/` | `infra/deploy/release/` |
| `scripts/build-ova.sh` | `infra/deploy/build-ova.sh` |
| `scripts/validate-deployment.sh` | `infra/ci/validate-deployment.sh` |
| `.env.production.example` | `infra/env/.env.production.example` |

---

## 3. Dependency Rules (Enforced Post-Migration)

```
ALLOWED DEPENDENCIES:

shared/        → (nothing — leaf node)
os/            → shared/
backend/       → shared/
apps/product/  → shared/, os/ (shell only)
apps/admin/    → shared/
apps/founder/  → shared/
apps/mobile/   → shared/
internal-tools/→ shared/, backend/ (read-only types)

FORBIDDEN:

shared/        → os/, backend/, apps/, internal-tools/
os/            → apps/, backend/ (except shared contracts)
backend/       → apps/, os/ (except shared contracts)
apps/*         → backend/ internals (must use BFF/API)
apps/*         → other apps/ (complete isolation)
internal-tools/→ apps/ (no UI dependencies)
```

---

## 4. Migration Execution Order

1. **Phase 0: Export** — Push to GitHub from Lovable
2. **Phase 1: Scaffold** — Create monorepo workspace (Nx or Turborepo)
3. **Phase 2: Extract shared/** — Move all contracts, events, types, tokens
4. **Phase 3: Extract os/** — Move kernel, SDK, shell, OS services
5. **Phase 4: Extract backend/** — Move edge functions, core services, gateways
6. **Phase 5: Extract apps/** — Split admin, founder, mobile from product shell
7. **Phase 6: Extract internal-tools/** — Move simulations, architecture checks
8. **Phase 7: Wire** — Update all imports to use workspace packages
9. **Phase 8: CI** — Add import boundary enforcement to CI pipeline
10. **Phase 9: Verify** — Independent builds for each plane

---

## 5. Workspace Package Names

```json
{
  "@sita/shared-contracts": "shared/contracts",
  "@sita/shared-events": "shared/events",
  "@sita/shared-models": "shared/models",
  "@sita/shared-auth": "shared/auth",
  "@sita/shared-utils": "shared/utils",
  "@sita/design-tokens": "shared/design-tokens",
  "@sita/os-kernel": "os/kernel",
  "@sita/os-sdk": "os/sdk",
  "@sita/os-shell": "os/shell",
  "@sita/os-runtime": "os/runtime",
  "@sita/backend-services": "backend/services",
  "@sita/backend-gateway": "backend/gateway",
  "@sita/product-shell": "apps/product-shell",
  "@sita/admin-console": "apps/admin-console",
  "@sita/founder-center": "apps/founder-center"
}
```

---

## 6. Post-Migration Verification Checklist

- [ ] `nx build @sita/shared-contracts` — passes independently
- [ ] `nx build @sita/os-kernel` — passes independently
- [ ] `nx build @sita/product-shell` — passes independently
- [ ] `nx build @sita/admin-console` — passes independently
- [ ] `nx build @sita/founder-center` — passes independently
- [ ] `nx lint` — no cross-plane import violations
- [ ] `nx test` — all unit tests pass
- [ ] Edge functions deploy independently
- [ ] No `@/lib/core-services` imports in app-layer code
- [ ] No `@/pages` imports in backend/edge functions
- [ ] No `@/components` imports in shared/contracts
