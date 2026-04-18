# SITA OS — Recovery Entrypoints

Canonical user-facing wrappers for the recovery subsystem. The actual
recovery TUI, systemd unit, and safe-mode launcher live in
`os/image-builder/recovery/` (they are baked into the ISO at build
time). The scripts in **this** directory are thin entrypoints that
operators or support engineers invoke from a running system or from the
recovery boot entry.

| Script | Purpose | Canonical implementation |
|---|---|---|
| `recovery-entry.sh` | Open the recovery menu (TUI) | `os/image-builder/recovery/sita-recovery.sh menu` |
| `recovery-status.sh` | Inspect boot/update/verity/shell state | reads `/etc/sita/`, `/var/lib/sita/`, `journalctl` |
| `recovery-collect.sh` | Generate a support bundle from recovery | `os/scripts/generate-support-bundle.sh` |
| `recovery-menu.sh` | Alias of `recovery-entry.sh` (compat) | → `recovery-entry.sh` |

There is **one** recovery implementation. These wrappers exist so the
operator-facing path (`sudo os/recovery/recovery-entry.sh`) and the
boot-menu path (`sita-recovery.target`) converge on the same code.
