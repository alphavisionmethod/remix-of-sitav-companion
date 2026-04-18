# SITA OS — Deployment Profiles

> **Status:** Canonical
> **Manifests:** `os/profiles/user.profile.json`, `os/profiles/operator.profile.json`
> **Schema:** `os/profiles/profile.schema.json`
> **Runtime reader:** `src/lib/runtime/deployment-profile.ts`

SITA OS ships as **one substrate** with **two deployment profiles**.
There is **no separate user OS or admin OS** — they are compositions of the same
core, shell, and backend.

---

## The Two Profiles

| | `user` | `operator` |
|---|---|---|
| **Artifact** | `sita-os-user-<version>-<arch>.iso` | `sita-os-operator-<version>-<arch>.iso` |
| **Default home** | `/desktop` (User Product Plane) | `/admin` (Admin Control Plane) |
| **Admin plane** | role-gated (hidden by default) | default visible |
| **User apps** | full | minimized to Files/Settings/Notifications |
| **Support tooling** | self-service | operator-full (deep diagnostics) |
| **Audience** | end users / customers | platform operators / SRE / support |

Both profiles share:
- the same `os/image-builder/build.sh`
- the same boot/trust/update/recovery chain
- the same Electron shell (`electron/`)
- the same backend (Supabase + edge functions)

---

## Building a Profile

```bash
# User profile (default)
sudo bash os/image-builder/build.sh --profile=user

# Operator profile
sudo bash os/image-builder/build.sh --profile=operator
```

The selected profile manifest is embedded at `/etc/sita/deployment-profile.json`
inside the image.

---

## Runtime Resolution

At runtime, `getDeploymentProfile()` (in `src/lib/runtime/deployment-profile.ts`)
resolves the profile in this order:

1. `window.__SITA_DEPLOYMENT_PROFILE__` — injected by the Electron preload from `/etc/sita/deployment-profile.json`
2. `localStorage["sita.deploymentProfile"]` — dev-only override
3. Fallback to baked-in `user` profile (web preview)

`<ShellComposer>` reads this and:
- redirects `/` → `defaultShellHome` for the active profile
- tags `<html data-sita-profile="…">` for theme variants
- exposes `useRouteVisibleInProfile()` for nav components

---

## CI Validation

- `scripts/architecture/checks/check-deployment-profile-coverage.ts` — every plane/app declared in a profile must resolve to real code.
- `.github/workflows/os-build-iso.yml` — matrix builds **both** profiles in parallel and runs QEMU smoke per profile.

---

## See also

- `docs/architecture/CORE_OS_USER_ADMIN_BACKEND_MODEL.md`
- `docs/os/USER_PROFILE_DEPLOYMENT.md`
- `docs/os/OPERATOR_PROFILE_DEPLOYMENT.md`
- `docs/os/SHARED_VS_PROFILE_SPECIFIC_COMPONENTS.md`
