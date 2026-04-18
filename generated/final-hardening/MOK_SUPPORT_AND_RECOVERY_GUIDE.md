# MOK Support & Recovery Guide

## Common failure modes

### 1. MOK enrollment prompt not shown
- **Symptom:** kernel module fails to load, no shim prompt
- **Cause:** Secure Boot disabled OR shim not installed
- **Fix:** Verify `mokutil --sb-state`; reinstall `shim-signed`

### 2. MOK password forgotten
- **Symptom:** can't complete enrollment after reboot
- **Fix:** `mokutil --reset` → reboot → re-enroll with new password

### 3. Signed module rejected after kernel update
- **Symptom:** module load fails after `dnf/apt upgrade`
- **Cause:** kernel signature changed
- **Fix:** Re-run `os/secure-boot/sign-modules.sh`; reboot

### 4. Arch — no shim by default
- **Fix:** install `shim-signed` from AUR; follow Arch wiki Secure Boot guide

### 5. Boot fails after enrollment
- **Recovery:** boot rescue media → chroot → restore `/boot/efi/EFI/<distro>/grubx64.efi.bak`

## Escalation
After 2 failed recovery attempts → escalate to platform-support with `sita-ops support-bundle` output.

## Honesty preservation
Never claim Secure Boot is "guaranteed working" on a distro that hasn't been tested. Reflect actual matrix state in support replies.
