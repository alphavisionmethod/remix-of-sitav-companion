# SITA OS — Build & Release Profiles

> **Status:** Canonical
> **Companion:** `docs/os/DEPLOYMENT_PROFILES.md`, `docs/os/USER_PROFILE_DEPLOYMENT.md`, `docs/os/OPERATOR_PROFILE_DEPLOYMENT.md`

This document is the ground truth for **how** SITA OS is built and released
for each deployment profile (`user`, `operator`). It complements the
architectural model in `DEPLOYMENT_PROFILES.md` with the concrete commands,
CI matrices, signing flow, and attestation chain.

---

## 1. The Two Build Targets

| | `sita-os-user` | `sita-os-operator` |
|---|---|---|
| **Manifest** | `os/profiles/user.profile.json` | `os/profiles/operator.profile.json` |
| **Default home** | `/desktop` | `/admin` (→ `OperatorHome`) |
| **Enabled planes** | core-os, shell-runtime, user, backend-services | + admin |
| **Branding suffix** | (none) | ` — Operator` |
| **Theme variant** | `user-default` | `operator-default` |
| **Support tooling** | self-service | operator-full |

Both targets are produced by the **same** `os/image-builder/build.sh`.
There is no fork.

---

## 2. Local Build Commands

```bash
# User edition
sudo bash os/image-builder/build.sh --profile=user

# Operator edition
sudo bash os/image-builder/build.sh --profile=operator
```

The selected profile manifest is copied verbatim to
`/etc/sita/deployment-profile.json` inside the rootfs. At runtime the
Electron preload (`electron/preload.cjs`) reads this file and injects it as
`window.__SITA_DEPLOYMENT_PROFILE__` before any renderer code runs.

---

## 3. CI Matrix Build

`.github/workflows/os-build-iso.yml` runs both profiles in parallel:

```yaml
strategy:
  matrix:
    profile: [user, operator]
```

Each matrix leg:

1. Builds the ISO with the matching profile.
2. Computes SHA-256 + ed25519 signature.
3. Boots the artifact in QEMU and runs the smoke suite.
4. Uploads the ISO + signature + SBOM as a workflow artifact.

A successful matrix produces 2 ISOs per release: one user, one operator.

---

## 4. Generated Composition / Readiness Reports

`scripts/architecture/checks/emit-profile-composition.ts` derives all
profile-aware truth from the canonical registries:

| File | Source registries |
|---|---|
| `generated/profile-composition-user.json` | plane-registry · route-plane-map · app-plane-map · `os/profiles/user.profile.json` |
| `generated/profile-composition-operator.json` | … + admin-workflow-registry |
| `generated/profile-visibility-report.json` | route-plane-map · app-plane-map (cross-profile diff) |
| `generated/user-profile-readiness-report.json` | composition + heuristics |
| `generated/operator-readiness-report.json` | composition + heuristics |

The emitter is wired into `.github/workflows/native-readiness.yml` and the
`check-os-release-readiness.ts` aggregator. **No hand-authored JSON.**

---

## 5. Signing & Attestation

Both profiles share the same signing chain:

1. **Hash:** SHA-256 of the ISO image.
2. **Sign:** ed25519 signature with the SITA OS release key.
3. **SBOM:** CycloneDX 1.5, signed alongside the ISO.
4. **Attestation manifest:** `attestation.json` baked into `/etc/sita/`
   contains `{ profile, version, channel, sha256, signature, sbomHash }`.
5. **First-boot verification:** `sita-firstboot` validates the attestation
   before unlocking the runtime.

The attestation manifest **embeds the profile id** so a deployed device
cannot lie about whether it is `user` or `operator`.

---

## 6. Release Channels per Profile

| Channel | User | Operator |
|---|---|---|
| `dev` | nightly | nightly |
| `internal` | weekly | weekly |
| `beta` | per release | per release |
| `production` | gated by readiness GREEN | gated by readiness GREEN + operator runbook signoff |

Channel selection is recorded in `/etc/sita/channel`. A device cannot move
from `production-user` to `production-operator` without re-imaging — these
are different artifacts, not different settings.

---

## 7. Deploying

| Audience | Recommended artifact |
|---|---|
| End users / customers | `sita-os-user-<version>-<arch>.iso` |
| Internal SRE / support / ops | `sita-os-operator-<version>-<arch>.iso` |
| Engineering bring-up / lab | `sita-os-operator-<version>-<arch>.iso` |

For a fleet that needs both, ship two SKUs from the same release.

---

## 8. CI Gates

These gates must pass before a release is signable:

- `check-deployment-profile-coverage.ts`
- `check-route-plane-coverage.ts`
- `check-app-plane-coverage.ts`
- `check-5-plane-boundaries.ts`
- `emit-profile-composition.ts` (no errors)
- `check-os-release-readiness.ts` (aggregator)

The aggregator emits `generated/os-release-readiness-summary.md` per profile.

---

## 9. See also

- `docs/architecture/CORE_OS_USER_ADMIN_BACKEND_MODEL.md`
- `docs/os/DEPLOYMENT_PROFILES.md`
- `docs/os/USER_PROFILE_DEPLOYMENT.md`
- `docs/os/OPERATOR_PROFILE_DEPLOYMENT.md`
- `docs/os/SHARED_VS_PROFILE_SPECIFIC_COMPONENTS.md`
- `docs/admin/ADMIN_CONTROL_PLANE_GOLDEN_PATHS.md`
- `docs/architecture/ROUTE_AND_APP_PLANE_MAP.md`
