# SITA OS — User Profile Deployment

> **Profile manifest:** `os/profiles/user.profile.json`
> **Artifact:** `sita-os-user-<version>-<arch>.iso`

The **user profile** is the standard SITA OS deployment for end users and
customers. The shell boots into the User Product Plane.

## What's enabled

- **Default home:** `/desktop`
- **Planes:** core-os, shell-runtime, user, backend-services
- **Apps:** Business OS, Money OS, Concierge, Files, Boardroom, Workspace, App Store, Settings, Notifications
- **Admin plane:** role-gated (hidden from nav unless user has admin role)
- **Support tooling:** self-service (`sita-ops support-bundle` for end-user-friendly bundles)

## What's hidden / off

- Operator-only navigation (Observability, Release Center, Kill Switch Center, etc.)
- Dev tools (`show.dev.tools` = false)
- Deep operator diagnostics

## Build

```bash
sudo bash os/image-builder/build.sh --profile=user
# → out/sita-os-user-<version>-amd64.iso
```

## Validate boot

```bash
bash os/qemu-test.sh --iso out/sita-os-user-*.iso
```

The desktop should land on `/desktop` with the user shell and User Product Plane apps.

## When to use

- Customer-facing distribution
- Demo/trial installations
- Standard end-user workstations

## Upgrade path

User profile installations can be **promoted** to operator (and vice versa)
without reinstalling — replace `/etc/sita/deployment-profile.json` and reboot.
The substrate, trust chain, update slots, and recovery system are identical.
