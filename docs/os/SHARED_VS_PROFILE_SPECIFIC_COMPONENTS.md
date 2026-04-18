# SITA OS — Shared vs Profile-Specific Components

> **Source of truth:** `src/lib/architecture/plane-registry.ts` + `os/profiles/*.profile.json`

This is the canonical map of what is **shared across both profiles** vs. what
is **specific** to one profile. If you find duplication that violates this
matrix, it's a bug — file an issue.

---

## ✅ Shared (exists exactly once, used by both profiles)

| Component | Lives in | Plane |
|---|---|---|
| Image builder | `os/image-builder/build.sh` | core-os |
| Boot chain (UEFI + systemd-boot) | `os/image-builder/security/`, `os/scripts/sign-*.sh` | core-os |
| Trust chain (Secure Boot + TPM) | `os/scripts/seal-verity-to-tpm.sh`, `verify-*.sh` | core-os |
| dm-verity root integrity | `os/scripts/build-verity-root.sh` | core-os |
| A/B update system | `os/scripts/build-update-bundle.sh`, `verify-update-bundle.sh`, `rollback-to-previous.sh` | core-os |
| Recovery mode | `os/recovery/` (entry, status, collect, menu, repair-*) | core-os |
| Diagnostics collectors | `os/diagnostics/` | core-os |
| Support bundle generator | `os/scripts/generate-support-bundle.sh` | core-os |
| systemd service fleet | `os/image-builder/services/` | core-os |
| Operator CLI | `os/bin/sita-ops` | core-os |
| Electron host | `electron/` (15 hardened modules) | shell-runtime |
| Window compositor / launcher | `src/components/sita/os/`, `src/components/sita/shell/` | shell-runtime |
| Notifications | shell-runtime barrels | shell-runtime |
| Search / command palette | shell-runtime barrels | shell-runtime |
| Auth / session / RBAC | `src/lib/platform-plane/admin-rbac-engine.ts` | shared |
| Feature flags | `src/lib/runtime/deployment-profile.ts` + admin overrides | shared |
| Backend (Supabase, edge functions, DB, storage) | `supabase/`, `src/integrations/supabase/` | backend-services |
| Files app | `src/components/files/` | user (visible in both) |
| Settings | role-aware sections | shell-runtime |
| Notifications center | shared | shell-runtime |

---

## ❌ User-profile-specific

| Component | Lives in |
|---|---|
| Business OS | `src/components/business/`, `src/pages/business/` |
| Money OS | `src/components/money/`, `src/pages/money/` |
| Concierge | `src/components/concierge/`, `src/pages/concierge/` |
| Boardroom | `src/components/boardroom/`, `src/pages/boardroom/` |
| Workspace / personal AI panels | user plane modules |
| App Store (consumer view) | `packages/store-metadata/`, `src/pages/apps/` |
| User onboarding flows | user plane |

---

## ❌ Operator-profile-specific

| Component | Lives in |
|---|---|
| Admin Control Plane shell | `src/components/admin/shells/AdminControlPlaneShell.tsx` |
| 8 operator workflows | `src/lib/admin/admin-workflow-registry.ts` |
| Observability dashboards | `src/pages/admin/observability/` |
| Release readiness UI | `src/pages/admin/release/` |
| Verification center | `src/pages/admin/verification/` |
| Kill switch center | `src/pages/admin/security/` |
| Support diagnostics console | `src/pages/admin/support/` |
| AI governance | `src/pages/admin/ai/` |
| Platform / cloud control | `src/pages/admin/platform/` |
| User / org intervention | `src/pages/admin/users/` |
| Founder console | `src/pages/admin/founder/` |
| Engineering ops | `src/pages/admin/engineering/` |

---

## Hard rules

1. **Shared components MUST NOT import from user-only or admin-only modules.**
2. **User-profile code MUST NOT import from `src/planes/admin/` or `src/admin/`.**
3. **Operator-profile code MUST NOT import from user-only domain modules.**
4. **There MUST NOT be a second image builder, second Electron host, or second backend.** If you feel tempted to fork, file an architecture issue first.

Enforced by `scripts/architecture/checks/check-plane-boundaries.ts`.
