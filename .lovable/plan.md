

# SITA OS — Control Plane / Product Plane / Shared Core Separation

## Current State Assessment

The codebase already has significant infrastructure:
- **150+ admin pages** under `/admin/*` (protected by `AdminRoute` + `useRequireAdmin`)
- **32 cloud admin tabs** in `CloudBackboneAdmin`
- **7 user-facing cloud components** in `src/components/cloud/`
- **11 cloud backbone services** in `src/lib/cloud-backbone/`
- **65+ edge functions** deployed
- **DB RBAC** via `user_roles` table + `has_role()` security definer
- **Role-permission engine** (in-memory) in `src/lib/services/role-permission-engine/`
- **Enterprise control plane service** exists but is thin
- **Tenant sovereignty** types exist in `src/lib/architecture/tenant-sovereignty.ts`

**What's missing for true 3-plane separation:**
1. No formal plane registry / boundary enforcement between Control, Product, and Shared Core
2. Admin RBAC is binary (admin vs not-admin) — no granular admin roles enforced in backend
3. No token class separation (user vs admin vs service)
4. No environment-aware config system
5. No API gateway separation (admin vs user)
6. No Support Console distinct from Admin Console at the access level
7. No formal admin action audit trail in backend
8. No device ownership model separating "user's own devices" from "admin device management"

---

## Implementation Plan — 4 Batches

### Batch 1: Database — Granular Admin RBAC + Plane Registry + Admin Audit (1 migration)

**New tables:**

| Table | Purpose |
|-------|---------|
| `platform_planes` | Registry of planes (control, product, shared-core) with metadata |
| `plane_service_assignments` | Maps each service/capability to its owning plane |
| `admin_role_permissions` | Granular permissions per admin role (support.view_user, storage.repair, security.audit, etc.) |
| `admin_action_audit` | Every admin action logged with actor, target, action, plane, justification, timestamp |
| `admin_sessions` | Separate session tracking for admin logins with stronger TTL |
| `environment_configs` | Environment registry (dev/staging/prod) with per-env feature flag context |
| `token_classes` | Token class definitions (user, admin, service) with scope templates |
| `api_gateway_routes` | Route registry mapping endpoints to planes and required token class |
| `device_ownership` | Enhanced device-to-user binding with admin vs user action scoping |
| `support_access_grants` | Time-limited, audited support access grants to user accounts |

**Seed data:**
- 3 planes: `control`, `product`, `shared-core`
- 7 admin roles with permissions: super-admin (all), platform-admin, storage-admin, security-admin, support-admin, billing-admin, read-only-auditor
- 3 environments: dev, staging, production
- 3 token classes: user, admin, service

**RLS:** Admin-only via `has_role`, with support-admin getting read-only on support-scoped tables.

---

### Batch 2: Shared Core Services + Edge Functions (3 services, 2 edge functions)

**New backbone services:**

1. **`src/lib/platform-plane/plane-registry.ts`** — Plane boundary enforcement
   - `resolvePlane(serviceId)` — Which plane owns this service
   - `validateCrossPlaneAccess(sourcePlane, targetPlane, action)` — Enforce boundaries
   - `getPlaneServices(plane)` — List services in a plane
   - `auditPlaneViolation(source, target, action)` — Log violations

2. **`src/lib/platform-plane/admin-rbac-engine.ts`** — Granular admin RBAC
   - `hasAdminPermission(userId, permission)` — Check granular permission
   - `getAdminPermissions(userId)` — All permissions for admin user
   - `requirePermission(userId, permission)` — Throw if missing
   - Permission categories: `users.*`, `devices.*`, `storage.*`, `sync.*`, `policy.*`, `flags.*`, `audit.*`, `support.*`, `maintenance.*`

3. **`src/lib/platform-plane/environment-config.ts`** — Environment awareness
   - `getCurrentEnvironment()` — Detect current env
   - `getEnvConfig(key)` — Environment-specific config
   - `isProduction()` / `isStaging()` / `isDev()`

**New edge functions:**

1. **`admin-gateway`** — Unified admin API gateway
   - Validates admin token class
   - Checks granular permission per route
   - Logs every action to `admin_action_audit`
   - Routes: `/users/*`, `/devices/*`, `/storage/*`, `/sync/*`, `/policy/*`, `/flags/*`, `/audit/*`, `/support/*`

2. **`support-gateway`** — Support-scoped API gateway
   - Limited permission set (view-only + safe repairs)
   - Cannot modify policies, quotas, or flags
   - All actions audited with justification field
   - Routes: `/support/user-lookup`, `/support/device-inspect`, `/support/sync-trace`, `/support/run-diagnostic`, `/support/safe-repair`

---

### Batch 3: Admin UI — 6 New Pages + Support Console Separation

| Page | Purpose |
|------|---------|
| `PlatformPlaneOverview.tsx` | Visual 3-plane architecture map with service counts, health, and boundary violations |
| `AdminRBACConsole.tsx` | Manage admin roles, assign permissions, view role hierarchy |
| `AdminAuditExplorer.tsx` | Search/filter all admin actions by actor, target, time, plane |
| `EnvironmentSwitcher.tsx` | Environment-aware dashboard showing config per env, flag contexts |
| `SupportConsoleSafe.tsx` | Separated support console — user lookup, device inspect, sync trace, diagnostics (read-only + safe repairs only) |
| `AdminTokenManager.tsx` | Token class management, session viewer, admin session TTL controls |

**Update existing:**
- `CloudAdminLayout.tsx` — Add "Platform" tab group (Planes, RBAC, Audit, Environments, Tokens)
- `CloudBackboneAdmin.tsx` — Wire 6 new tabs
- `AdminRoutes.tsx` — Add routes for new pages

---

### Batch 4: Product Plane Boundary + User Device Ownership + Wiring

**New user-facing components:**

1. **`src/components/cloud/CloudDeviceOwnership.tsx`** — User's own device management
   - Rename, revoke own devices
   - See sync status per device
   - See last-seen timestamps
   - Trust status badges
   - Cannot see other users' devices

2. **`src/components/platform/PlaneBoundaryGuard.tsx`** — Route-level guard
   - Wraps admin routes to enforce plane + permission checks
   - Shows "Insufficient permissions" for wrong admin role
   - Logs boundary violations

**Wiring updates:**

- Update `useRequireAdmin` → `useRequireAdminPermission(permission)` for granular checks
- Add `useCurrentPlane()` hook — returns which plane the current route belongs to
- Add plane badges to admin page headers showing "Control Plane" context
- Update `AdminRoute` to accept optional `requiredPermission` prop
- Wire `admin_action_audit` logging into existing admin action buttons across all 32 cloud admin tabs
- Add environment indicator badge to admin layout header

---

## File Summary

| Batch | Type | Count |
|-------|------|-------|
| 1 | Migration | 1 (10 tables + seeds) |
| 2 | Services + Edge Functions | 3 services + 2 edge functions |
| 3 | Admin Pages | 6 new + 3 updates |
| 4 | User Components + Wiring | 2 components + 5 hook/guard updates |

**Total: ~1 migration, 2 edge functions, 3 services, 6 admin pages, 2 user components, ~8 wiring updates**

## Technical Notes
- Granular permissions use dot-notation: `users.view`, `users.suspend`, `storage.repair`, `policy.edit`, `flags.rollout`
- Support console enforces `support.*` permissions only — cannot access `policy.*` or `flags.*`
- Admin audit uses `admin_action_audit` table with RLS restricted to `security-admin` and `super-admin` roles
- Environment detection uses `VITE_SUPABASE_URL` hostname pattern matching
- Plane boundary violations are logged but not hard-blocked (advisory mode first, enforced mode later via feature flag)
- All UI follows existing glassmorphic dark-first SITA OS design

