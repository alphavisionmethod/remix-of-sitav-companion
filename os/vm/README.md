# SITA OS — Virtual Machine Validation

This directory contains **VM-profile validation** scripts. The goal is
not to package SITA for every hypervisor (that's `os/vmware/`), but to
verify that the produced ISO/IMG behaves correctly inside a given VM
profile.

| Script | Profile | Validates |
|---|---|---|
| `validate-vm-profile.sh qemu` | KVM/QEMU (UEFI) | wraps `os/qemu-validate.sh` |
| `validate-vm-profile.sh vmware` | VMware Workstation/ESXi | best-effort headless boot of OVA via `vmrun` if available |
| `validate-vm-profile.sh virtualbox` | VirtualBox | best-effort headless boot of OVA via `VBoxManage` if available |

Truthful matrix: see `docs/os/VM_VALIDATION_MATRIX.md`.
