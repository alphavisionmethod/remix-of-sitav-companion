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
| `recovery-evidence-collect.sh` | Capture real recovery-boot evidence + POST to ingest | append-only `recovery_boot_evidence` table |
| `recovery-menu.sh` | Alias of `recovery-entry.sh` (compat) | → `recovery-entry.sh` |

There is **one** recovery implementation. These wrappers exist so the
operator-facing path (`sudo os/recovery/recovery-entry.sh`) and the
boot-menu path (`sita-recovery.target`) converge on the same code.

## Real recovery-boot evidence loop

Every real recovery boot produces append-only forensic evidence:

1. `sita-recovery.service` runs `ExecStartPre=/usr/sbin/sita-recovery-evidence-collect`
2. `recovery-evidence-collect.sh` captures device_id, slot, kernel,
   verity/bless state, failed units, shell-crash count, TPM PCRs and
   writes `recovery-mode-evidence.json` (SHA-256 hashed)
3. POSTs to `recovery-evidence-ingest` edge function with the device JWT
   (or queues to `/var/lib/sita/queue/recovery-evidence/` when offline)
4. Edge function recomputes the hash, signs as
   `sha256(device_id|slot|reason|hash|user.id)` and inserts into
   `public.recovery_boot_evidence` (append-only — `UPDATE`/`DELETE`
   blocked by `block_recovery_boot_evidence_mutation()` triggers)
5. **BLOCK gate #29** `check-recovery-boot-evidence` enforces all six
   substrates (table, RLS, triggers, edge fn, collector, service wiring).
