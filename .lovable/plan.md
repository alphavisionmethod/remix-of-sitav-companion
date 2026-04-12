

# SITA OS — Architecture Enhancement & Boundary Hardening Plan

## Current State After Last Round

**What's working:**
- 6-layer manifest exists with typed constants, route→layer, service→layer maps
- Boundary rules with import direction rules and forbidden patterns
- Route registry with risk tiers and flagship loop tagging
- Service ownership manifest with duplicate tracking and budget enforcement
- CI boundary check script (passes clean)
- Admin routes consolidated into 3 AdminShellLayout blocks (lines 1050, 1544, 1829)
- Layer awareness wired into SitaOSContext and SitaKernelContext

**Critical issues found that need fixing:**

### 1. Duplicate Route — `/admin/pfa/google` registered twice (line 1570-1571)
A copy/paste artifact. Must remove the duplicate.

### 2. 39 Duplicate Service Directories Between `services/` and `core-services/`
The manifest only tracks 9 duplicates. The actual count is **39** shared directory names (brain-core, conscience-gate, ai-gateway, canonical-pipeline, capability-router, executor-service, approval-engine, epistemic-firewall, event-bus, finance-os, etc.). The manifest must be updated to reflect reality.

### 3. App Pages Importing Kernel Directly (Boundary Violation)
6 non-admin pages import from `@/lib/core-services/` — violating the "App must not import OS Kernel" rule:
- `LifeSimulator.tsx` → life-simulation
- `PolicySimulatorHub.tsx` → governance-simulator
- `SettingsPage.tsx` → governance-simulator
- `FilesSearch.tsx` → search-fabric
- `MoneyOverview.tsx` → fraud-sentinel
- `GoogleConnectedAccounts.tsx` → google-provider-family

The boundary check script doesn't catch these because it only scans `src/pages/auth/` for web-layer violations, not all app pages for kernel imports.

### 4. Boundary Check Script Too Narrow
Only checks: auth pages importing kernel, admin importing app pages, services importing pages, contracts importing runtime, cross-domain imports. Missing:
- All app-layer pages importing `core-services/` (the kernel layer)
- Owner pages (treated as admin but not checked)
- Hooks importing across boundaries

### 5. No Visual Admin Board for Layer Architecture
The manifests and registries exist as data but have no UI for operators to see boundary health, layer distribution, violations, and service budget status in real-time.

### 6. `useLocation()` with `eslint-disable` in SitaOSContext
The `useLocation()` call is wrapped in try/catch with an eslint-disable for rules-of-hooks — it works but is fragile. Should use a proper pattern (child component or custom hook).

---

## Enhancement Plan

### Phase 1 — Fix Active Violations

**A. Remove duplicate route** in `src/App.tsx` line 1571 (`/admin/pfa/google`).

**B. Update boundary check script** (`scripts/architecture/check-layer-boundaries.ts`) — add Rule 6: scan ALL `src/pages/` (excluding `src/pages/admin/`) for imports from `@/lib/core-services/` and flag as `APP_IMPORTS_KERNEL` warnings.

**C. Update service ownership manifest** to include all 39 actual duplicates (not just 9). Add the missing 30: epistemic-firewall, event-bus, finance-os, flagship-loops, frontend, google-provider-family, handoff, identity-auth, inference-gateway, integration-hub, launch-readiness, life-simulation, memory-service, mnemosyne, model-router, policy-engine, projection-service, receipt-service, recommendation-execution, security, self-healing, service-registry, system-updates, trust-governor, truth-indices, verification-engine, workflow-engine, architecture, index.ts.

### Phase 2 — Fix `useLocation()` Pattern in Context

Replace the try/catch `useLocation()` hack in `SitaOSContext.tsx` with a proper `LayerAwareProvider` child component that uses `useLocation()` safely and passes layer info up via callback.

### Phase 3 — Create Architecture Boundary Admin Board

**New file: `src/pages/admin/architecture/ArchitectureBoundaryBoard.tsx`**

A premium admin dashboard showing:
- **Layer Ring Diagram**: Concentric rings showing the 6 layers with route counts per layer, animated with the brand color scheme
- **Service Budget Gauge**: Visual showing 31/45 canonical services used, overage warnings
- **Duplicate Service Tracker**: List of all 39 duplicate directories with canonical pointers, severity badges
- **Boundary Violation Scanner**: Live violations list from the manifest rules, showing file, rule, severity
- **Route Family Matrix**: Table of 16 route families with layer, status, flagship loop, risk tier
- **Import Direction Diagram**: Visual of the allowed/forbidden import directions between layers

**Route**: `/admin/architecture/boundaries` inside AdminShell.

### Phase 4 — Add Proxy Re-exports for Kernel Imports

For the 6 app pages that import `core-services/` directly, create thin re-export hooks/facades in `src/lib/services/` (OS Services layer) so app pages consume kernel through the proper layer:
- `src/lib/services/life-simulation/index.ts` → re-exports types from core-services
- `src/lib/services/governance-simulator/index.ts` → re-exports types
- `src/lib/services/search-fabric/index.ts` → re-exports types
- `src/lib/services/fraud-sentinel/index.ts` → re-exports types

Then update the 6 pages to import from `@/lib/services/` instead of `@/lib/core-services/`.

---

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/App.tsx` | Remove duplicate `/admin/pfa/google` route (line 1571) |
| Modify | `scripts/architecture/check-layer-boundaries.ts` | Add app→kernel import scanning |
| Modify | `src/lib/architecture/service-ownership-manifest.ts` | Add all 39 duplicate entries |
| Modify | `src/contexts/SitaOSContext.tsx` | Fix useLocation pattern |
| Create | `src/pages/admin/architecture/ArchitectureBoundaryBoard.tsx` | Visual boundary dashboard |
| Create | `src/lib/services/life-simulation/index.ts` | Proxy re-export for app layer |
| Create | `src/lib/services/governance-simulator/index.ts` | Proxy re-export |
| Create | `src/lib/services/search-fabric/index.ts` | Proxy re-export |
| Create | `src/lib/services/fraud-sentinel/index.ts` | Proxy re-export |
| Modify | 6 page files | Update imports to use services/ instead of core-services/ |

## What Does NOT Change
- No new service directories beyond proxy re-exports of existing types
- No route deletions
- No edge functions
- Existing layer manifest, boundary rules, route registry stay as-is (already correct)

