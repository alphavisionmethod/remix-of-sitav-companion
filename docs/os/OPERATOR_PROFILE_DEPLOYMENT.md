# SITA OS — Operator Profile Deployment

> **Profile manifest:** `os/profiles/operator.profile.json`
> **Artifact:** `sita-os-operator-<version>-<arch>.iso`

The **operator profile** is the SITA OS deployment for platform operators,
SRE, and support engineers. The shell boots into the Admin Control Plane.

## What's enabled

- **Default home:** `/admin` (`AdminControlPlaneShell`)
- **Planes:** core-os, shell-runtime, user, admin, backend-services
- **Apps:** Files, Settings, Notifications + 9 admin tools (Observability, Release Center, Verification Center, Kill Switch Center, Support Diagnostics, AI Governance, Platform Control, User/Org Intervention, Incident Triage)
- **Admin plane:** default-visible
- **Support tooling:** operator-full (rich diagnostics, support bundles, kill switches, repair toolkit)
- **Dev tools:** enabled (`show.dev.tools` = true)

## What's minimized

- User product apps (Business OS, Money OS, Concierge, Boardroom, App Store, Workspace) are **not** in the launcher by default. They remain reachable by direct URL for cross-checking customer issues.

## Build

```bash
sudo bash os/image-builder/build.sh --profile=operator
# → out/sita-os-operator-<version>-amd64.iso
```

## Validate boot

```bash
bash os/qemu-test.sh --iso out/sita-os-operator-*.iso
```

The desktop should land on `/admin` with `AdminControlPlaneShell` and the 8
operator workflows visible.

## When to use

- SRE / platform engineering workstations
- Customer-support operator stations
- Internal admin/release/verification operator devices
- Incident-response operator laptops

## Operator workflows

The admin shell surfaces 8 canonical workflows (see
`docs/admin/ADMIN_CONTROL_PLANE_GOLDEN_PATHS.md`):

1. Incident Triage
2. Release Readiness
3. Support Diagnostics
4. Truth & Verification
5. Security & Kill-Switch
6. AI Governance
7. Platform / Cloud Control
8. User / Org Intervention

## Operator entry-point

`os/bin/sita-ops` is the single CLI wrapper for operator actions:
status, support-bundle, rollback, recovery, repair-*. Available in both profiles
but pre-configured with operator defaults here.
