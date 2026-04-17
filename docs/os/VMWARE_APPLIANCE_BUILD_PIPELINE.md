# SITA OS — VMware Appliance Build Pipeline

## What is real today

- `os/vmware/build-ova.sh` produces an OVA from the latest ISO.
- The OVA boots **live-from-CD** (the ISO is embedded as a CD device).
  This is sufficient for evaluation, demos, and short-lived appliances.
- Output artifacts:
  - `out/sita-os-<version>-amd64.ova`
  - `out/sita-os-<version>-amd64.ova.sha256`
  - `out/sita-os-<version>-amd64.ova.manifest.json`

## Validated targets

| Hypervisor | Result |
|---|---|
| VMware Workstation 17 | ✅ boots, network, runtime shell |
| VMware Fusion 13 | ✅ boots |
| ESXi 7 / vSphere 8 | ✅ boots (set vmx-19) |

## Phase 2 (planned)

- Unattended installer driven by VMware OVF properties (`hostname`,
  `username`, `channel`) consumed via `cloud-init`.
- Fixed-size 32 GB qcow2 with the install already applied — eliminates
  the live-from-CD step.

## Build

```bash
sudo bash os/image-builder/build.sh        # produce ISO
bash os/vmware/build-ova.sh                # wrap into OVA
sha256sum -c out/*.ova.sha256              # verify
```

CI runs the build on `workflow_dispatch` only (OVA is large; not built per
commit). See `.github/workflows/os-build-iso.yml` for the trigger.
