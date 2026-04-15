

# Part 8: Final Architecture Hardening — Fix All Remaining Gaps

## Status Assessment

After thorough review, the existing implementation covers ~85% of the architecture. The remaining gaps are:

### Critical Bugs
1. **Syntax error in `check-plane-boundaries.ts`** — Line 130-132: `PLANE_MEMBERSHIP` object is missing its closing `};` before `ALLOWED_DEPS`, making the script unparseable.

### Missing Plane Membership Mappings
2. **`src/lib/services/`** (202 subdirectories) — The largest directory in the project is NOT mapped in `PLANE_MEMBERSHIP` or covered by the backend barrel. Only `src/lib/services/ai-gateway/` is mapped. The remaining ~200 subdirs (trust-governor, policy-engine, executor-service, receipt-service, event-bus, workflow-engine, memory-service, verification-engine, fraud-sentinel, governance-simulator, search-fabric, projection-service, self-healing, security, etc.) are unmapped.
3. **`src/lib/ai-gateway/`** (budget-gate.ts) — Not mapped in `PLANE_MEMBERSHIP`.
4. **`src/lib/engines/`** — Not mapped.
5. **`src/lib/__tests__/`** — Not mapped.

### Backend Barrel Gap
6. **`src/planes/backend.ts`** — Currently exports from `@/lib/core-services/*` but the massive `src/lib/services/` tree (200+ service directories) is almost entirely absent from the barrel. Only `ai-gateway` is re-exported. Services like `founder-orchestrator`, `release-intelligence`, `digest-engine`, `protocol-bridge`, `degraded-mode`, `fleet-ota`, `incident-management`, `edge-device-runtime`, `cloud-control-plane-infra`, etc. are not accessible through the plane barrel.

### Migration Script Gaps
7. **`execute-migration.sh`** — Missing moves for `src/lib/services/*` (200+ subdirs), `src/lib/ai-gateway/`, `src/lib/engines/`.
8. **`rewrite-imports.ts`** — Missing pattern for `@/lib/services/` (non-ai-gateway subpaths) and `@/lib/ai-gateway/`.

### Documentation Gaps
9. **`docs/refactor/move-map.md`** — Missing entries for `src/lib/services/*` subdirectories.
10. **`generated/plane-ownership.json`** — Missing `src/lib/services/`, `src/lib/ai-gateway/`, `src/lib/engines/`.

## Deliverables

### 1. Fix `check-plane-boundaries.ts` Syntax Error
Add missing `};` to close the `PLANE_MEMBERSHIP` object at line 131. Add mappings for `src/lib/services/`, `src/lib/ai-gateway/`, `src/lib/engines/`, `src/lib/__tests__/`.

### 2. Expand Backend Barrel (`src/planes/backend.ts`)
Add namespaced re-exports for the `src/lib/services/` tree. Since 200+ subdirs would cause massive collision risk, group them by domain:
- `export * as Services from "@/lib/services"` (using the existing `src/lib/services/index.ts` if it has a barrel, or creating one)
- Or selective high-value re-exports for the most critical services not already covered by `core-services` re-exports.

### 3. Create `src/lib/services/index.ts` Barrel
If not already comprehensive, expand to re-export the key service subdirectories (many of these are shim re-exports of core-services, so we need to verify which ones add unique logic vs. which are proxies).

### 4. Update Migration Script
Add moves for:
- `src/lib/services/*` → `backend/services/` (the 200+ subdirs)
- `src/lib/ai-gateway/` → `backend/gateway/budget/`
- `src/lib/engines/` → `backend/services/engines/`

### 5. Update Import Rewriter
Add pattern for:
- `@/lib/services/` (non-ai-gateway) → `@sita/backend/services/`
- `@/lib/ai-gateway/` → `@sita/backend/budget-gate/`
- `@/lib/engines/` → `@sita/backend/engines/`

### 6. Update `generated/plane-ownership.json`
Add `src/lib/services/`, `src/lib/ai-gateway/`, `src/lib/engines/` to backend plane.

### 7. Update `docs/refactor/move-map.md`
Add entries for the `src/lib/services/` tree.

### 8. Verify Zero Build Errors
Run `npx tsc --noEmit` to confirm everything compiles.

## Technical Details

- The `src/lib/services/` directory is the project's largest (~200 subdirs), acting as the canonical shim layer between the app and `core-services`. Most services re-export from `core-services` but many add unique logic (founder-orchestrator, release-intelligence, digest-engine, protocol-bridge, etc.).
- The existing `src/lib/services/index.ts` barrel exists but its coverage needs verification.
- The boundary checker syntax error means the script currently cannot run at all — this is a P0 fix.

## File Count
~7 files modified, 0-1 created.

## Execution Order
1. Fix syntax error in `check-plane-boundaries.ts`
2. Verify/expand `src/lib/services/index.ts`
3. Update `src/planes/backend.ts` barrel
4. Update migration script, import rewriter, ownership manifest, move-map
5. Run `npx tsc --noEmit`

