

# Part 7: Complete Multi-Plane Architecture Hardening

## Problem

The Part 6 implementation created the scaffolding but left significant gaps. The barrels are skeletal (backend exports ~15 of 50+ services), migration scripts miss ~40% of directories, and critical documentation artifacts are absent. This plan fills every gap.

## Deliverables

### 1. Complete All Barrel Re-Exports (~5 files)

**`src/planes/backend.ts`** — Expand from 15 exports to full coverage:
- All core-services: trust-governor, policy-engine, workflow-engine, memory-service, event-bus, executor-service, verification-engine, self-healing, security, search-fabric, projection-service, fraud-sentinel, governance-simulator, etc.
- All cloud-backbone services (10 services)
- AI gateway + sovereign AI gateway
- Observability, persistence abstractions
- Platform-plane services (already partially in admin barrel)

**`src/planes/os.ts`** — Add:
- All os-services (33 daemon/services: healthd, powerd, crashd, audiod, etc.)
- All os-security (17 modules: authd, policyd, sessiond, secretsd, etc.)
- Nova SDK system/ui/extensions layers
- Sync engine

**`src/planes/admin.ts`** — Add:
- Admin AI services from `src/lib/admin-ai/`
- Admin route truth service
- Compute governance references

**`src/planes/founder.ts`** — Add:
- Founder orchestrator from services
- Strategic intelligence references
- Delivery methodology references

**`src/planes/mobile.ts`** — Add:
- Surface detection service
- Push notification service
- Device mesh service
- Biometric auth references

### 2. Complete Migration Script (`scripts/migrate/execute-migration.sh`) (~1 file)

Add missing directory moves for:
- `src/lib/os-services/*` → `os/services/`
- `src/lib/os-security/*` → `os/security/`
- `src/lib/cloud-backbone/*` → `backend/services/cloud/`
- `src/lib/persistence/*` → `backend/libs/persistence/`
- `src/lib/observability/*` → `backend/libs/observability/`
- `src/lib/ai-engineering/*` → `backend/services/ai-engineering/`
- `src/lib/intelligence-architecture/*` → `backend/services/intelligence/`
- `src/lib/simulation/*` → `internal-tools/simulations/`
- `src/lib/internal-agents/*` → `backend/workers/agents/`
- `src/lib/sync-engine/*` → `os/services/sync/`
- `src/lib/sovereign-ai-gateway/*` → `backend/gateway/ai/`
- `src/lib/ai-gateway/*` → `backend/gateway/ai-legacy/`
- `src/lib/advisor-intelligence/*` → `backend/services/advisor/`
- `src/lib/advisor-protocol/*` → `backend/services/advisor-protocol/`
- `src/lib/boardroom/*` → `backend/services/boardroom/`
- `src/lib/fip/*` → `internal-tools/fip/`
- `src/lib/detection/*` → `backend/services/detection/`
- `src/lib/verification/*` → `backend/services/verification/`
- `src/lib/strategic-intelligence/*` → `backend/services/strategic/`
- `src/lib/domain-engines/*` → `backend/services/domain-engines/`
- `src/lib/dual-reality/*` → `internal-tools/dual-reality/`
- `src/lib/reality-audit/*` → `internal-tools/reality-audit/`
- `src/lib/reality-records/*` → `internal-tools/reality-records/`
- `src/components/admin/*` → `apps/admin-console/src/components/`
- `src/components/admin-os/*` → `apps/admin-console/src/components/os/`
- `src/components/admin-ai/*` → `apps/admin-console/src/components/ai/`
- `src/components/mobile/*` → `apps/mobile/src/components/`
- `src/components/governance/*` → `apps/admin-console/src/components/governance/`
- All remaining `src/packages/*` subdirectories (enterprise-contracts, moat-contracts, policy-contracts, proof-model, telemetry, advisor-config, boardroom-contracts, etc.)
- `src/components/sita/shell/*` → `os/shell/`
- `src/components/sita/os/*` → `os/ui/`
- `src/components/sita/boot/*` → `os/boot/`
- `src/components/sita/kernel/*` → `os/kernel/ui/`

### 3. Complete Import Rewriter (`scripts/migrate/rewrite-imports.ts`) (~1 file)

Add missing patterns for:
- `@/lib/os-services/` → `@sita/os/services/`
- `@/lib/os-security/` → `@sita/os/security/`
- `@/lib/cloud-backbone/` → `@sita/backend/cloud/`
- `@/lib/persistence/` → `@sita/backend/persistence/`
- `@/lib/observability/` → `@sita/backend/observability/`
- `@/lib/simulation/` → `@sita/internal-tools/simulations/`
- `@/lib/sync-engine/` → `@sita/os/sync/`
- `@/lib/sovereign-ai-gateway/` → `@sita/backend/ai-gateway/`
- `@/lib/ai-engineering/` → `@sita/backend/ai-engineering/`
- `@/lib/intelligence-architecture/` → `@sita/backend/intelligence/`
- `@/lib/advisor-intelligence/` → `@sita/backend/advisor/`
- `@/lib/boardroom/` → `@sita/backend/boardroom/`
- `@/lib/strategic-intelligence/` → `@sita/backend/strategic/`
- `@/lib/domain-engines/` → `@sita/backend/domain-engines/`
- `@/lib/detection/` → `@sita/backend/detection/`
- `@/lib/fip/` → `@sita/internal-tools/fip/`
- `@/components/admin/` → `@sita/admin/components/`
- `@/components/mobile/` → `@sita/mobile/components/`
- `@/components/sita/shell/` → `@sita/os/shell/`
- `@/components/sita/os/` → `@sita/os/ui/`
- All remaining `@/packages/*` subpackages

### 4. Enhanced Verify Script (`scripts/migrate/verify-migration.ts`) (~1 file)

Add checks for:
- Demo/prod import leakage (no `demo-data`, `mock-data`, `demo-scenarios` imported in production paths)
- Runtime tagging validation (each plane has correct runtime metadata)
- Duplicate authority detection (no two planes define the same service)
- Route/service budget check (~45 canonical services max)
- Internal-tools isolation check

### 5. Plane Manifest Documents (~7 files)

Create `PLANE_MANIFEST.md` for each plane:
- `src/planes/BACKEND_MANIFEST.md`
- `src/planes/OS_MANIFEST.md`
- `src/planes/ADMIN_MANIFEST.md`
- `src/planes/FOUNDER_MANIFEST.md`
- `src/planes/MOBILE_MANIFEST.md`
- `src/planes/SHARED_MANIFEST.md`
- `src/planes/INTERNAL_TOOLS_MANIFEST.md`

Each contains: purpose, ownership, allowed/forbidden dependencies, deployment target, build pipeline, trust level, env schema.

### 6. Refactor Documentation (~4 files)

- `docs/refactor/move-map.md` — Every old→new path mapping (~150 entries)
- `docs/refactor/dependency-matrix.md` — Allowed/forbidden import table per plane
- `docs/refactor/runtime-map.md` — Runtime target per module (browser, Deno, Node, Flutter, Electron)
- `docs/refactor/rewiring-plan.md` — Trust, approval, eventing, communication rewiring plan

### 7. ESLint Rule Expansion (~1 file)

Add patterns to `eslint.config.js` for:
- `@/lib/os-services/*` → use `@/planes/os`
- `@/lib/os-security/*` → use `@/planes/os`
- `@/lib/cloud-backbone/*` → use `@/planes/backend`
- `@/lib/persistence/*` → use `@/planes/backend`
- `@/lib/simulation/*` → use `@/planes/shared` or internal-tools
- `@/lib/sync-engine/*` → use `@/planes/os`
- `@/lib/sovereign-ai-gateway/*` → use `@/planes/backend`
- `@/components/admin/*` from non-admin pages
- `@/components/mobile/*` from non-mobile pages
- `@/lib/demo-data/*` from non-demo paths

### 8. Boundary Checker Enhancement (~1 file)

Expand `scripts/architecture/check-plane-boundaries.ts` PLANE_MEMBERSHIP to include all ~50 directories not yet mapped:
- `src/lib/advisor-intelligence/` → backend
- `src/lib/advisor-protocol/` → backend
- `src/lib/boardroom/` → backend
- `src/lib/cloud-backbone/` → backend
- `src/lib/detection/` → backend
- `src/lib/domain-engines/` → backend
- `src/lib/strategic-intelligence/` → backend
- `src/lib/sync-engine/` → os
- `src/lib/dual-reality/` → internal-tools
- `src/lib/reality-audit/` → internal-tools
- `src/lib/reality-records/` → internal-tools
- `src/lib/ai-engineering/` → backend
- `src/lib/customer-journey/` → product
- `src/lib/app-platform/` → product
- `src/lib/design-system/` → product
- `src/lib/demo-data/` → internal-tools
- `src/lib/mock-data/` → internal-tools
- `src/lib/demo-scenarios/` → internal-tools
- `src/lib/setup/` → product
- `src/lib/seed/` → internal-tools
- `src/lib/investment-office/` → product
- `src/lib/compute-governance/` → backend
- `src/lib/pack-store/` → product
- `src/lib/shopify/` → backend
- `src/lib/ux-trust/` → product
- `src/lib/no-hallucination/` → backend
- All remaining `src/packages/*` subdirectories → shared

### 9. Mobile Deployment Manifest (~1 file)

Create `infra/deploy/mobile.yaml` — Flutter build config, signing, push notification config, biometric requirements.

### 10. Ownership Manifest Update (~1 file)

Expand `generated/plane-ownership.json` to include all ~50 unmapped directories with correct plane ownership.

## File Count

- ~5 barrel file updates
- ~3 migration script updates
- ~7 plane manifest docs
- ~4 refactor docs
- ~1 ESLint update
- ~1 boundary checker update
- ~1 mobile deployment manifest
- ~1 ownership manifest update

**Total: ~23 files created/modified**

## Execution Order

1. Update barrels (backend, os, admin, founder, mobile) — ensures current codebase compiles correctly with expanded public APIs
2. Update ESLint rules and boundary checker — enforces correctness
3. Create plane manifests and refactor docs — documents the architecture
4. Complete migration script + import rewriter + verifier — enables post-export migration
5. Add mobile deployment manifest and update ownership manifest
6. Verify zero build errors with `tsc --noEmit`

