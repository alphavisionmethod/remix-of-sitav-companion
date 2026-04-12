

# SITA OS — Architecture Hardening & Deployment Readiness Enhancement

## Current State (Verified)

**What's already solid:**
- 6-layer manifest with typed constants, route/service/component layer maps ✅
- Boundary rules with import direction enforcement ✅  
- Route registry with risk tiers and flagship loop tagging ✅
- Service ownership manifest tracking 38 duplicates ✅
- CI boundary check script with 6 rules ✅
- All admin routes inside AdminShellLayout (3 blocks: lines 1051, 1545, 1830) ✅
- No app-layer pages importing core-services directly (proxy re-exports working) ✅
- Layer awareness in both SitaOSContext and SitaKernelContext ✅
- Architecture Boundary Board at `/admin/architecture/boundaries` ✅
- `docs/architecture/LAYER_SEPARATION.md` exists ✅
- `src/lib/architecture/index.ts` barrel with 23 subsystems ✅

**Issues Found:**

### 1. Boundary Check Script Missing Owner/Mission Rules
The script checks `src/pages/admin/` but not `src/pages/owner/` or `src/pages/mission/`. These are ADMIN_OPERATOR layer but not validated.

### 2. Architecture Boundary Board Lacks Live Violation Scanning
Currently shows static manifest data. No runtime import scanning or violation detection. The board should show actual detected violations.

### 3. No Hooks-Level Boundary Enforcement  
`src/hooks/` files are not scanned by the boundary check. Hooks importing `core-services` would bypass the app→kernel rule silently.

### 4. Service Ownership Manifest Missing Admin-Layer Services
The `SERVICE_LAYER_MAP` in `layer-manifest.ts` only lists 31 services. Missing many that exist in practice (e.g., `incident-management`, `fleet-ota`, `edge-device-runtime`, `cloud-control-plane-infra`, `emergency-halt`, etc.).

### 5. No Architecture Sidebar Link in Admin Nav
The Architecture Boundary Board has no link in the admin sidebar — operators can't find it.

### 6. LAYER_SEPARATION.md Is Thin (93 lines)
Missing: service directory audit checklist, advanced capability discipline verdicts, verification command examples, full structural maturity matrix.

### 7. Route Registry Missing Route Families
Current `ROUTE_FAMILIES` has 16 entries but missing: `/connectors`, `/advisors`, `/policies`, `/governance`, `/enterprise`, `/workspace`, `/observability`, `/notifications`, `/search`, `/onboarding`, `/nova-desktop`.

---

## Enhancement Plan

### Phase 1 — Harden Boundary Check Script
**File: `scripts/architecture/check-layer-boundaries.ts`**
- Add Rule 7: Scan `src/hooks/` for imports from `@/lib/core-services/` — flag as `HOOK_IMPORTS_KERNEL` warning
- Add Rule 8: Scan `src/pages/owner/` and `src/pages/mission/` to confirm they only import allowed layers (same as admin — kernel allowed)
- Add Rule 9: Verify no `src/lib/services/` file imports from `src/pages/` or `src/components/` (already Rule 3 but extend to catch `../pages/` relative imports)

### Phase 2 — Enhance Architecture Boundary Board
**File: `src/pages/admin/architecture/ArchitectureBoundaryBoard.tsx`**
- Add **Separation Maturity Matrix** section: 6 layers x 5 dimensions (boundary_explicit, imports_enforced, routing_correct, ownership_declared, ci_checked) with visual health indicators
- Add **Capability Discipline Verdicts** section: shows build_now/defer/partial for advanced capabilities (adaptive router, consensus verification, long-term memory, etc.)
- Add **Missing Route Families** to ROUTE_FAMILIES data
- Add **Advanced Implementation Discipline** card showing deferred capabilities and why
- Add animated layer ring visualization (concentric circles) using CSS/SVG

### Phase 3 — Expand Route Registry
**File: `src/lib/architecture/route-registry.ts`**
Add missing route families: `/connectors`, `/advisors`, `/policies`, `/governance`, `/enterprise`, `/workspace`, `/observability`, `/notifications`, `/search`, `/onboarding`, `/nova-desktop`

### Phase 4 — Expand Service Layer Map  
**File: `src/lib/architecture/layer-manifest.ts`**
Add missing services to `SERVICE_LAYER_MAP`: `incident-management`, `fleet-ota`, `edge-device-runtime`, `cloud-control-plane-infra`, `emergency-halt`, `device-presence-service`, `support-diagnostics`, `analytics-service`, `agent-orchestrator`, `api-gateway`, `role-permission-engine`

### Phase 5 — Add Admin Sidebar Link
**File: `src/components/admin/AdminSidebarConfig.ts` (or equivalent)**
Add link to `/admin/architecture/boundaries` under the architecture section of admin nav.

### Phase 6 — Expand LAYER_SEPARATION.md to Full Bible Part 2
**File: `docs/architecture/LAYER_SEPARATION.md`**
Expand to include:
- Implementation Discipline section (build_now/defer verdicts for 14 advanced capabilities)
- Full separation maturity matrix
- Structural verification commands
- File placement audit summary
- Canonical ownership matrix for all 20 major systems
- Boundary violation register template
- "How to know it's built correctly" checklist (expanded to 25+ items)

---

## Files Changed

| Action | File | Purpose |
|--------|------|---------|
| Modify | `scripts/architecture/check-layer-boundaries.ts` | Add rules 7-9 (hooks, owner, mission) |
| Modify | `src/pages/admin/architecture/ArchitectureBoundaryBoard.tsx` | Add maturity matrix, discipline verdicts, layer rings |
| Modify | `src/lib/architecture/route-registry.ts` | Add 11 missing route families |
| Modify | `src/lib/architecture/layer-manifest.ts` | Add ~11 missing services to SERVICE_LAYER_MAP |
| Modify | `docs/architecture/LAYER_SEPARATION.md` | Expand to full Bible Part 2 (~400 lines) |
| Modify | Admin sidebar config | Add architecture boundaries link |

## What Does NOT Change
- No new service directories
- No route deletions or moves
- No edge functions
- No database changes
- Existing manifests, rules, proxy re-exports all stay

## Anti-Sprawl Discipline
This is enhancement-only work. Every change makes existing architecture enforcement deeper and more visible — no new abstractions, no new services, no speculative features.

