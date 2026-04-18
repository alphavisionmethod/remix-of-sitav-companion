# SITA OS — Canonical Architecture Model

> **Status:** Canonical
> **Source of truth:** `src/lib/architecture/plane-registry.ts`
> **Last reorganized:** Part 3 (5-Plane Reorganization)

SITA OS is organized as **one shared substrate** with **five horizontal planes**.
There is **one OS**, **one Electron shell**, **one image builder**, and **one
backend** — composed differently by **deployment profile** (`user` vs `operator`).

---

## The 5 Canonical Planes

| Plane | Owns | Shared? |
|---|---|---|
| **Core OS** | Image builder, boot/trust chain, dm-verity, A/B updates, recovery, diagnostics, support bundles | ✅ Shared by all profiles |
| **Shell Runtime** | Electron host, window manager, launcher, notifications, command palette, IPC bridge | ✅ Shared by all profiles |
| **User Product Plane** | Business OS, Money, Concierge, Files, Boardroom, Workspace, user Settings | ❌ User profile only |
| **Admin Control Plane** | Observability, release readiness, support, verification, security, AI governance | ❌ Operator profile only |
| **Backend Services** | Supabase, edge functions, DB, storage, auth, AI gateway, sync | ✅ Shared (governed by admin) |

---

## Shared vs Non-Shared Matrix

### ✅ Shared (exists exactly once)

- Native OS substrate (`os/`)
- Image builder (`os/image-builder/build.sh` — single script, `--profile` flag)
- Boot/trust/update/recovery (`os/scripts/`, `os/recovery/`)
- Electron host (`electron/`)
- Shell runtime barrels (`src/runtimes/shell/`)
- Identity/session/auth, RBAC, feature flags
- Observability plumbing, support bundle schema
- Backend (Supabase, edge functions)

### ❌ Plane-specific (separate)

| User Plane | Admin Plane |
|---|---|
| User navigation & dashboards | Admin navigation & operator workflows |
| Personal/business surfaces | Incident/release/support tools |
| User-safe command palette | Privileged operator commands |
| Personal AI panels | AI governance / kill-switches |
| User app store entries | Backend control surfaces |

---

## Deployment Model

There is **one OS substrate**. Two deployment profiles:

- **`user` profile** → `sita-os-user-<version>.iso`
  Default shell home = user product plane. Admin plane present only behind role-gates.
- **`operator` profile** → `sita-os-operator-<version>.iso`
  Default shell home = `AdminControlPlaneShell`. User plane minimized.

Profile manifest lives at `/etc/sita/deployment-profile.json` on disk and is read
at runtime by `src/lib/runtime/deployment-profile.ts`.

See: `docs/os/DEPLOYMENT_PROFILES.md`.

---

## Hard Rules

1. **No second OS.** One substrate, one image builder.
2. **No second shell.** One Electron host.
3. **No second backend.** Admin plane *governs* — does not replace — backend.
4. **User plane MUST NOT import from `src/planes/admin/`.**
5. **Admin plane MUST NOT import from user-only domains.**
6. **All routes/apps declare `plane` membership** in `route-plane-map.ts` / app registry.

Boundaries enforced by:
- `scripts/architecture/checks/check-plane-boundaries.ts`
- `scripts/architecture/checks/check-route-plane-coverage.ts`
- `scripts/architecture/checks/check-deployment-profile-coverage.ts`
