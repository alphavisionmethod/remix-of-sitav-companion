

The user wants a comprehensive architectural reorganization: Core OS + Shared Shell + User Plane + Admin Plane + Backend Services Plane with deployment profiles. Let me audit current state to scope correctly.

Existing state from context:
- `src/planes/` already exists with 7 planes (backend, os, shared, admin, founder, product, internal-tools) — already has 4-plane model
- `src/runtimes/shell/` exists (canonical shell barrel)
- `src/admin/routes/` exists
- `src/app/` exists
- `src/components/platform/PlaneBoundaryGuard.tsx` exists with 4 PlaneKey enum
- `os/` has full image builder, scripts, recovery, diagnostics, systemd units (Part 1+2 done)
- `electron/` has 15 hardened modules
- 8 readiness gates passing, release readiness aggregator at YELLOW
- `AdminControlPlaneShell` consolidates 12 admin domains
- `feature-runtime-tier-registry` already declares 4 tiers
- 956 pages, 84 edge functions, 201 tables

Gaps for this restructure (real, non-duplicate):
1. **Plane key collision** — `planes/index.ts` has 7 namespaces but `PlaneKey` type only has 4 (control/product/shared-core/internal-execution). Need canonical 5-plane reconciliation: core-os, shell-runtime, user, admin, backend-services.
2. **No deployment profile system** — image builder produces one ISO; needs `user` vs `operator` profile selection.
3. **Route plane membership** — routes don't declare plane ownership in a registry.
4. **App registry plane membership** — apps in launcher don't declare visibility per plane/profile.
5. **Shell composition mode** — no runtime selector for "which plane's home is default" based on role/profile.
6. **Missing canonical docs**: `CORE_OS_USER_ADMIN_BACKEND_MODEL`, `DEPLOYMENT_PROFILES`, `USER_PROFILE_DEPLOYMENT`, `OPERATOR_PROFILE_DEPLOYMENT`, `SHARED_VS_PROFILE_SPECIFIC_COMPONENTS`, `ADMIN_CONTROL_PLANE_GOLDEN_PATHS`, `ROUTE_AND_APP_PLANE_MAP`.
7. **Build pipeline** — `os/scripts/build-iso.sh` (or equivalent) needs `--profile=user|operator` flag.
8. **CI** — needs matrix build for both profiles + validation that profile manifests match reality.
9. **Plane boundary enforcement** — `PlaneBoundaryGuard` needs the 5-plane key set; `check-layer-boundaries.ts` needs profile awareness.

Constraints:
- Reuse existing `src/planes/` — don't create `src/core-os/` or `src/shell-runtime/` as new top-level dirs (would duplicate). Instead: rename/consolidate within existing `src/planes/` to the canonical 5.
- Reuse existing `os/` substrate — single image builder, profile flag only.
- Reuse existing `electron/` — single shell, profile-aware composition.
- Reuse existing `AdminControlPlaneShell` for admin plane home.
- Reuse existing route/app registries — add `plane` and `profiles[]` fields, don't fork them.

Plan: 5 phases, each independently deployable.

<lov-plan>

## Core OS + 5-Plane + Deployment Profile Reorganization

### Phase 1 — Canonical 5-Plane Model (Truth Layer)
**Reconcile the existing plane sprawl into one canonical 5-plane model without forking dirs.**

- `src/lib/architecture/plane-registry.ts` (new) — single source of truth for the 5 planes:
  - `core-os` (substrate: image builder, boot, trust, update, recovery → maps to `os/` + `src/planes/os/`)
  - `shell-runtime` (Electron + window/launcher/notifications → maps to `electron/` + `src/runtimes/shell/`)
  - `user` (Business/Money/Concierge/Files/Boardroom → consolidates `src/planes/product/` + `src/planes/founder/`)
  - `admin` (control plane → `src/planes/admin/`)
  - `backend-services` (Supabase/edge functions → `src/planes/backend/`)
- Update `src/components/platform/PlaneBoundaryGuard.tsx` `PLANE_INFO` to the canonical 5 keys (deprecate old 4 with shim mapping).
- Update `src/planes/index.ts` barrel to expose only the 5 canonical namespaces; archive `founder`, `internal-tools`, `mobile` references with a deprecation shim.
- `docs/architecture/CORE_OS_USER_ADMIN_BACKEND_MODEL.md` — canonical architecture doc with shared-vs-non-shared matrix.

### Phase 2 — Route & App Plane Membership Registry
**Make plane ownership explicit and queryable for every route/app.**

- `src/lib/architecture/route-plane-map.ts` (new) — maps every route prefix to one of the 5 planes + role gate + profile visibility.
- Extend existing app registry entries (in `packages/store-metadata` / `src/lib/apps/`) with `plane: PlaneKey` and `profiles: ProfileKey[]` fields.
- `scripts/architecture/checks/check-route-plane-coverage.ts` — fails CI if any route lacks a plane assignment.
- `docs/architecture/ROUTE_AND_APP_PLANE_MAP.md` — generated summary of route/app → plane mapping.

### Phase 3 — Deployment Profile System (user vs operator)
**One image builder, two profile artifacts.**

- `os/profiles/user.profile.json` + `os/profiles/operator.profile.json` — declare: enabled planes, default shell home route, allowed app IDs, default feature flags, support tooling level, branding override.
- `os/scripts/build-iso.sh` — accept `--profile=user|operator`, embed profile manifest at `/etc/sita/deployment-profile.json`, output `sita-os-{profile}-{version}.iso`.
- `src/lib/runtime/deployment-profile.ts` (new) — runtime reader for `/etc/sita/deployment-profile.json` (with web fallback to `user`).
- `src/runtimes/shell/ShellComposer.tsx` (new, thin) — selects default home route by reading profile + user role; reuses existing `AdminControlPlaneShell` for operator default and existing user shell for user default. **No new shell, just composition.**
- `docs/os/DEPLOYMENT_PROFILES.md`, `docs/os/USER_PROFILE_DEPLOYMENT.md`, `docs/os/OPERATOR_PROFILE_DEPLOYMENT.md`, `docs/os/SHARED_VS_PROFILE_SPECIFIC_COMPONENTS.md`.

### Phase 4 — Admin Plane Workflow Consolidation
**Reorganize admin pages around 8 canonical operator workflows (not page museum).**

- `src/admin/workflows/` (new index) — 8 canonical workflows mapped to existing pages: Incident Triage, Release Readiness, Support Diagnostics, Truth/Verification, Security/Kill-Switch, AI Governance, Platform/Cloud Control, User/Org Intervention.
- `src/lib/admin/admin-workflow-registry.ts` — registry mapping each workflow → primary page + supporting pages + required permission.
- Update `AdminControlPlaneShell` primary nav to surface the 8 workflows (existing 12 domains become sub-navigation under workflows).
- `docs/admin/ADMIN_CONTROL_PLANE_GOLDEN_PATHS.md` — operator runbook for each of the 8 workflows.
- **No page deletions** — existing 12 admin domains keep their routes; reorganization is navigation/IA only.

### Phase 5 — CI Matrix Build & Profile Validation
**Build, validate, and release both profile artifacts in one pipeline.**

- `.github/workflows/os-build-iso.yml` — convert to matrix: `[user, operator]`, builds both ISOs in parallel, runs QEMU smoke per profile.
- `scripts/architecture/checks/check-deployment-profile-coverage.ts` — validates every `plane`/`app` declared in profile manifests resolves to real code (no orphan profile entries).
- `scripts/architecture/checks/check-plane-boundaries.ts` — extends existing `check-layer-boundaries.ts` to enforce: user plane code MUST NOT import from `src/planes/admin/`, admin plane MUST NOT import user-only domains.
- Wire both checks into `.github/workflows/native-readiness.yml` and the existing `check-os-release-readiness.ts` aggregator.
- Update `generated/os-release-readiness-report.json` to emit per-profile verdict.

### Constraints enforced
- **No new top-level dirs** — `src/core-os/`, `src/shell-runtime/`, `src/backend-services/` are NOT created. Canonical truth lives in `src/lib/architecture/plane-registry.ts`; existing `src/planes/`, `os/`, `electron/`, `src/admin/`, `src/runtimes/shell/` map to the 5 planes via the registry.
- **One image builder** — `os/scripts/build-iso.sh` gets a `--profile` flag; no fork.
- **One Electron shell** — `electron/main.cjs` reads profile manifest; no second host.
- **One admin shell** — `AdminControlPlaneShell` stays canonical; workflows are IA reorganization only.
- **No page deletions** in Phase 4 — pages keep working under existing routes; nav restructures.
- **Backwards compatibility** — `PlaneBoundaryGuard`'s old 4 keys keep working via shim mapping during migration.

### Files (scope summary)
- **Create code (8):** plane-registry.ts, route-plane-map.ts, deployment-profile.ts (runtime), ShellComposer.tsx, admin-workflow-registry.ts, check-route-plane-coverage.ts, check-deployment-profile-coverage.ts, check-plane-boundaries.ts
- **Create configs (2):** os/profiles/user.profile.json, os/profiles/operator.profile.json
- **Create docs (7):** CORE_OS_USER_ADMIN_BACKEND_MODEL, DEPLOYMENT_PROFILES, USER_PROFILE_DEPLOYMENT, OPERATOR_PROFILE_DEPLOYMENT, SHARED_VS_PROFILE_SPECIFIC_COMPONENTS, ADMIN_CONTROL_PLANE_GOLDEN_PATHS, ROUTE_AND_APP_PLANE_MAP
- **Update (6):** PlaneBoundaryGuard.tsx (5-plane keys + shim), src/planes/index.ts (canonical 5), AdminControlPlaneShell (8-workflow nav), os/scripts/build-iso.sh (--profile flag), .github/workflows/os-build-iso.yml (matrix), check-os-release-readiness.ts (per-profile)

