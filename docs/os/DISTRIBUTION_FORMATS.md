# SITA OS — Distribution Formats

> Status: **shipped**. Three first-class formats. One canonical build, three
> packaging tails. All signed. All checksummed. All reproducible from a
> single `pnpm os:release`.

## 1. The three formats

| Format | File | Use case | Builder |
|---|---|---|---|
| **ISO** | `sita-os-<v>-amd64.iso` | installer media, USB/optical boot, live preview | `os/image-builder/build.sh` |
| **IMG** | `sita-os-<v>-amd64.img` | direct `dd` flash, cloud raw import | `os/scripts/build-raw-img.sh` |
| **OVA** | `sita-os-<v>-amd64.ova` | VMware Workstation/ESXi/Fusion, vSphere | `os/vmware/build-ova.sh` |

A fourth artifact, the **A/B update bundle** (`.bundle` + `.bundle.sig`), is
not a distribution format — it is the OTA payload consumed by an
already-installed system. See
[`UPDATE_AND_ROLLBACK_STRATEGY.md`](./UPDATE_AND_ROLLBACK_STRATEGY.md).

## 2. Decision matrix

| Question | Use this format |
|---|---|
| End-user installs from USB? | **ISO** |
| Bare-metal mass-imaging via Clonezilla / iPXE? | **IMG** |
| Booting in AWS / GCP / Azure as a custom image? | **IMG** (raw import) |
| Booting in VMware Workstation / Fusion / ESXi? | **OVA** |
| Booting in QEMU/KVM for testing? | **ISO** (or **IMG** for persistent state) |
| Pre-provisioning a fleet appliance (no installer)? | **IMG** |
| Hyper-V / Proxmox? | **IMG** (then convert to vhdx/qcow2) |

## 3. ISO — installer media

```bash
sudo pnpm os:build:iso
```

Produces a hybrid BIOS+UEFI bootable image suitable for `dd`, Rufus, balenaEtcher,
or burning to optical media.

**Boot path**: GRUB → SITA installer (Electron-based) → A/B partition layout
→ first-boot service → desktop shell.

**Contents**: live squashfs root, signed kernel, signed initramfs, GRUB
config, MOK certificate (if production-signed).

**Verification**:

```bash
sha256sum -c out/sita-os-*.iso.sha256
sbverify --cert /path/to/mok.crt out/sita-os-*-amd64.iso  # if signed
```

## 4. IMG — flashable raw disk

```bash
sudo VERSION=0.2.0 bash os/scripts/build-raw-img.sh
# or
sudo pnpm os:build:img
```

Produces a **fully-laid-out GPT disk image** (not just a rootfs). Layout:

| Part | Size | Role |
|---|---|---|
| 1 | 512 MiB | ESP (vfat, GRUB + signed kernel/initrd) |
| 2 | 4 GiB | sita_root_a (active squashfs slot) |
| 3 | 4 GiB | sita_root_b (standby slot, empty) |
| 4 | 256 MiB | verity_a (Merkle tree) |
| 5 | 256 MiB | verity_b (empty) |
| 6 | rest | sita_data (LUKS2+ext4, created on first boot) |

**Direct flash**:

```bash
sudo dd if=out/sita-os-*-amd64.img of=/dev/sdX bs=4M status=progress conv=fsync
```

**AWS EC2 raw import**:

```bash
aws s3 cp out/sita-os-*-amd64.img s3://my-bucket/
aws ec2 import-image \
  --description "SITA OS v0.2.0" \
  --disk-containers Format=raw,UserBucket={S3Bucket=my-bucket,S3Key=sita-os-0.2.0-amd64.img}
```

**GCP Compute Engine raw import**:

```bash
gcloud compute images import sita-os-v0-2-0 \
  --source-file=out/sita-os-*-amd64.img \
  --os=ubuntu-2204
```

**Verification**: see `out/*.img.manifest.json` for sha256, verity root,
and the exact import commands per cloud.

## 5. OVA — VMware appliance

```bash
pnpm os:vmware:ova
```

Wraps the latest ISO (or built rootfs) into an OVF + VMDK + manifest +
SHA256, packaged as a single `.ova` tar.

**Import**:

- VMware Workstation: `File → Open → sita-os-*.ova`
- ESXi: `Deploy OVF Template`
- vSphere: `vCenter → Deploy OVF`

**Default VM specs**: 4 vCPU, 8 GB RAM, 60 GB thin-provisioned disk, vmxnet3.
Edit `os/vmware/build-ova.sh` to change.

## 6. Signing & integrity (all formats)

Every distribution artifact ships with:

| File | Purpose |
|---|---|
| `<artifact>.sha256` | integrity checksum (always present) |
| `<artifact>.manifest.json` | build metadata, format-specific layout |
| `<artifact>.sig` (bundle only) | detached MOK signature |

For ISO + IMG: the **kernel and initramfs inside** are sbsign-signed against
the project MOK. Verification: `sbverify --cert mok.crt <kernel>`.

The release pipeline (`os/scripts/release.sh`) refuses to publish if any
checksum or required signature is missing.

## 7. CI publication

`.github/workflows/os-build-iso.yml` uploads all three formats as artifacts
on every `main` build and tagged release:

```
out/*.iso        out/*.iso.sha256    out/*.iso.manifest.json
out/*.img        out/*.img.sha256    out/*.img.manifest.json
out/*.ova        out/*.ova.sha256
out/*.bundle     out/*.bundle.sig    out/channel-*.json
generated/os-build-attestation.json
generated/os-build-summary.md
```

Retention: 14 days for build artifacts, indefinite for tagged releases.

## 8. Cross-references

- [`SITA_OS_INSTALL.md`](./SITA_OS_INSTALL.md) — end-user install (ISO path)
- [`VMWARE_APPLIANCE_BUILD_PIPELINE.md`](./VMWARE_APPLIANCE_BUILD_PIPELINE.md) — OVA internals
- [`RELEASE_ARTIFACT_MODEL.md`](./RELEASE_ARTIFACT_MODEL.md) — full release gate
- [`TRUST_CHAIN_KEYS_AND_SIGNING.md`](./TRUST_CHAIN_KEYS_AND_SIGNING.md) — signing keys
