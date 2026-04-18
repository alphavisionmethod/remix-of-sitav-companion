# MOK Per-Distro Tested Matrix

> **Owner:** platform-sre · **Cadence:** verified per release

| Distro | Version | Secure Boot | MOK Enrollment | Recovery | Status | Notes |
|---|---|---|---|---|---|---|
| Ubuntu | 24.04 LTS | ✅ verified | ✅ `mokutil --import` + reboot prompt | re-enroll via TTY7 fallback | **GREEN** | Primary target. shim + GRUB chain works as documented in `docs/os/TRUST_CHAIN_KEYS_AND_SIGNING.md`. |
| Fedora | 40 | ✅ verified | ✅ identical mokutil flow | re-enroll via dracut emergency | **GREEN** | Shim chain identical to Ubuntu; SELinux requires no extra tuning. |
| Arch Linux | rolling (2026.04) | ✅ verified-with-caveat | ✅ via `sbctl` | re-sign via `sbctl sign-all` | **AMBER** | Requires manual `sbctl` setup. Documented in `MOK_SUPPORT_AND_RECOVERY_GUIDE.md`. |

## Test procedure (per distro)

1. Boot with Secure Boot **enabled** in firmware.
2. Run installer; observe MOK enrollment prompt at first reboot.
3. Enter MOK password; verify auto-prompt clears.
4. Reboot a second time; verify dm-verity rootfs check passes.
5. Simulate failed enrollment (cancel prompt); verify recovery path.

## Failure classes observed

| Symptom | Root cause | Fix |
|---|---|---|
| Boot to firmware menu after MOK password | wrong password or 60s timeout | re-trigger via `mokutil --import` |
| `Verification failed` at GRUB | shim does not trust SITA MOK | re-enroll, then `update-grub` |
| Black screen post-enrollment | NVIDIA module unsigned | `mokutil --import /var/lib/dkms/mok.pub` |

## Caveats

- ARM64 and other distros (openSUSE, Debian stable) are **not** in this matrix and should be classified as "untested" until verified.
- Test evidence for each distro is captured per release in `generated/release-mok-evidence/<release>/`.
