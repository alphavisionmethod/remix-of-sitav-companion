
The user wants Part 2 of the Ubuntu-Native reorientation: a comprehensive hardening sweep across service supervision, shell resilience, update safety, recovery, observability, app runtime, validation, and docs.

Let me audit existing state quickly to scope correctly without duplicating.

Already shipped (from context + visible files):
- `electron/` 15 .cjs hardening modules
- `os/scripts/` 19 scripts (build, sign, verity, TPM, SBOM, rollback, support bundle, release.sh)
- `os/runtime/shell-watchdog.sh` ✅ exists
- `os/scripts/generate-support-bundle.sh` ✅ exists with diagnostics/crashes/redaction
- `os/diagnostics/` collectors (boot/runtime/update/service-failures/heartbeat) ✅
- `os/recovery/` with recovery-entry, recovery-status, recovery-collect, safe-mode ✅
- `os/image-builder/services/` systemd units (sita-updated, sita-recovery-shell, etc.)
- `docs/os/` already has 18 docs including RECOVERY_MODE.md
- 8 native readiness checks + aggregator (Part 1)
- `.github/workflows/native-readiness.yml`, `os-build-iso.yml`
- `deploy/backup.sh` + `deploy/first-boot.sh`

Gaps to fill (real, non-duplicate):
1. Canonical service model doc + audit of existing units
2. Boot target validation script
3. Desktop session model doc (xinit/TTY7/fallback wiring is in memory but undocumented)
4. Shell health probe enhancements (only watchdog exists)
5. Writable state model doc
6. Backup/restore canonical doc (script exists, doc missing)
7. Logging model doc
8. Repair toolkit (4 scripts: shell, first-boot, update-state, runtime-services)
9. Validation matrix doc
10. Hardware support matrix doc
11. Release readiness aggregator script + report
12. Native runbooks (shell-crash-loop, failed-update, rollback-failure, recovery-usage, first-boot-failure, qemu-failure)
13. Operator control wrapper script (`sita-ops`)
14. Service health summary collector enhancement
15. Update CI to run release readiness

Plan structure: 6 phases, each independently deployable.

<lov-plan>

## Ubuntu-Native Part 2 — Stability, Recovery & Operability Hardening

### Phase 1 — Service Model & Boot Reliability (deploy-ready)
- `docs/os/SERVICE_MODEL.md` — canonical inventory of all `sita-*.service`/`.target`/`.timer` units (sita-firstboot, sita-runtime, sita-updated, sita-recovery, sita-recovery-shell, healthd, crashd, settingsd, timed, accessibilityd) with: purpose, deps, restart policy, log path, failure behavior.
- `os/diagnostics/check-boot-target.sh` — validates `graphical.target` reached, required units active, no critical failures; emits `/var/lib/sita/diagnostics/boot-target.json`.
- `os/diagnostics/collect-service-health.sh` — structured per-service health summary feeding support bundle.
- Wire both into `generate-support-bundle.sh`.

### Phase 2 — Desktop Session & Shell Resilience
- `docs/os/DESKTOP_SESSION_MODEL.md` — xinit on TTY7 → sita-runtime → Electron → watchdog → fallback to sita-recovery-shell. Document GPU `translate3d` window-drag perf path.
- `os/runtime/check-shell-health.sh` — one-shot probe (process alive, IPC responsive, renderer not white-screen via marker file from preload).
- Enhance `electron/preload.cjs` to write `/var/lib/sita/state/shell-heartbeat` every 5s (read by health probe).
- `docs/os/ELECTRON_PRELOAD_CONTRACT.md` — typed IPC surface, sandbox boundaries.

### Phase 3 — Update Safety, Writable State & Backup Canonicalization
- `docs/os/WRITABLE_STATE_MODEL.md` — partition policy: `/` read-only (verity), `/var/lib/sita` writable, `/home` LUKS2, `/etc/sita` config overlay; what survives update vs rollback.
- `docs/os/BACKUP_AND_RESTORE.md` — canonicalizes `deploy/backup.sh` (scope, retention, restore flow, support-bundle inclusion).
- `os/scripts/check-update-state.sh` — detects partial/failed updates, emits `update-state.json`.
- Wire update-state into `check-os-update-readiness.ts`.

### Phase 4 — Repair Toolkit & Recovery Hardening
- `os/recovery/repair-shell.sh` — clear safe-mode marker, reset crash counter, restart sita-runtime.
- `os/recovery/repair-first-boot.sh` — re-run first-boot.sh idempotently, validate marker.
- `os/recovery/repair-update-state.sh` — abort stuck update, mark slot bad, prepare rollback.
- `os/recovery/repair-runtime-services.sh` — restart failed sita-* units in dependency order.
- `os/bin/sita-ops` — single operator entrypoint wrapping: status, restart-shell, support-bundle, rollback, recovery, repair-*.
- Update `docs/os/RECOVERY_MODE.md` to reference repair toolkit.

### Phase 5 — Observability, Logging & Runbooks
- `docs/os/LOGGING_MODEL.md` — journalctl-first policy, file-based exceptions (`/var/log/sita/crashes/`), rotation, redaction, support-bundle inclusion rules.
- `docs/os/OBSERVABILITY_AND_DIAGNOSTICS.md` — refresh to reference all collectors + sita-ops.
- `docs/os/runbooks/` — 6 new runbooks:
  - `shell-crash-loop.md`
  - `failed-update.md`
  - `rollback-failure.md`
  - `recovery-mode-usage.md`
  - `first-boot-failure.md`
  - `qemu-boot-failure.md`
- Each runbook references real scripts/outputs, no fluff.

### Phase 6 — Validation Matrix, Release Readiness & CI
- `docs/os/VALIDATION_MATRIX.md` — canonical pass/fail grid (ISO build, trust, dm-verity, QEMU boot, first-boot, shell start, services, support bundle, update metadata, recovery entry, backup smoke, diagnostics).
- `docs/os/HARDWARE_SUPPORT_MATRIX.md` — honest tested/expected/experimental/unsupported tiers.
- `scripts/architecture/checks/check-os-release-readiness.ts` — aggregates all 8 Part-1 readiness reports + Phase 1–5 outputs into `generated/os-release-readiness-report.json` + `.md` summary.
- Update `.github/workflows/native-readiness.yml` to run release-readiness aggregator and upload summary.

### Constraints enforced
- No new backup/recovery/logging/watchdog systems — all phases extend `deploy/backup.sh`, `os/recovery/`, `os/diagnostics/`, `os/runtime/shell-watchdog.sh`.
- Every new script is executable and inspects real state.
- Every doc references real scripts/units/paths.
- `sita-ops` is a thin wrapper, not a duplicate command tree.
- All new diagnostics flow into the existing `generate-support-bundle.sh`.

### Files (scope summary)
- **Create scripts (8):** check-boot-target.sh, collect-service-health.sh, check-shell-health.sh, check-update-state.sh, repair-{shell,first-boot,update-state,runtime-services}.sh, sita-ops, check-os-release-readiness.ts
- **Create docs (11):** SERVICE_MODEL, DESKTOP_SESSION_MODEL, ELECTRON_PRELOAD_CONTRACT, WRITABLE_STATE_MODEL, BACKUP_AND_RESTORE, LOGGING_MODEL, VALIDATION_MATRIX, HARDWARE_SUPPORT_MATRIX + 6 runbooks (under `docs/os/runbooks/`)
- **Update (5):** preload.cjs (heartbeat), generate-support-bundle.sh (new collectors), check-os-update-readiness.ts (update-state wiring), RECOVERY_MODE.md (repair refs), native-readiness.yml (release aggregator)
- **Generated:** os-release-readiness-report.json + .md

