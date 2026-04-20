
## Diagnosis

The audit gap: `recovery-mode-evidence.json` only exists as a **synthetic QEMU/CI manifest** (`generated/recovery-outcome-manifest.json`) describing recovery *checks* — it carries no evidence that a real recovery boot ever happened on a device. There is:
- ✅ Recovery TUI (`os/image-builder/recovery/sita-recovery.sh`)
- ✅ Recovery status snapshotter (`os/recovery/recovery-status.sh` → `recovery-status.json`)
- ✅ Recovery readiness gate (`check-os-recovery-readiness.ts`) — but it only checks dirs/docs exist
- ❌ **No on-device collector that emits `recovery-mode-evidence.json` from a real recovery boot**
- ❌ **No persistence path (DB table + edge function) so the evidence survives the device**
- ❌ **No BLOCK gate asserting the loop is wired**

Same shape as `production-launch-attestations` and `dr-drill-executions` — append-only DB table + signed edge ingest + BLOCK gate validator.

## Plan — wire real recovery boot evidence end-to-end

### 1. On-device collector (runs inside recovery boot)
Create `os/recovery/recovery-evidence-collect.sh`:
- Detects recovery mode via `systemctl is-active sita-recovery.target` + `/proc/cmdline` `sita.recovery=1` marker
- Captures: device_id, slot (a/b), kernel version, verity state, bless state, boot reason (auto vs menu), tpm PCR snapshot (best-effort), failed units, shell crash count, timestamp
- Computes SHA-256 evidence hash over canonicalized payload
- Writes `recovery-mode-evidence.json` to `/var/lib/sita/diagnostics/` (or `/tmp` if read-only)
- POSTs to `recovery-evidence-ingest` edge function with device JWT (best-effort; queues to `/var/lib/sita/queue/recovery-evidence/` if offline)

Wire into `os/image-builder/recovery/sita-recovery.service` via `ExecStartPre=/usr/sbin/sita-recovery-evidence-collect` so every real recovery boot produces evidence automatically.

### 2. Append-only DB table
New migration `recovery_boot_evidence`:
- Columns: `id uuid PK`, `device_id text NOT NULL`, `recovery_reason text NOT NULL` (auto-fallback / operator-menu / boot-failure / first-boot), `slot text NOT NULL` (a/b), `kernel_version text`, `verity_state text`, `bless_state text`, `failed_units jsonb`, `shell_crash_count int`, `tpm_pcr_snapshot jsonb`, `evidence_hash text NOT NULL`, `signature text NOT NULL`, `collected_at timestamptz NOT NULL`, `inserted_at timestamptz default now()`, `inserted_by uuid`
- RLS enabled: admin-read, service-role-insert
- Append-only triggers: `recovery_boot_evidence_no_update`, `recovery_boot_evidence_no_delete` → `block_recovery_boot_evidence_mutation()`
- Indexes: `(device_id, collected_at desc)`, `(recovery_reason, collected_at desc)`

### 3. Edge function `recovery-evidence-ingest`
`supabase/functions/recovery-evidence-ingest/index.ts`:
- Accepts POST with the collected payload
- Validates JWT (device or admin), recomputes `evidence_hash`, signs as `sha256(device_id|slot|recovery_reason|evidence_hash|user.id)`
- Inserts into `recovery_boot_evidence`
- Mirrors latest row to `generated/recovery-mode-evidence.json` shape via `release-evidence-graph-snapshot` consumer (already exists)
- `verify_jwt = true` (default)

### 4. BLOCK gate #29 `check-recovery-boot-evidence`
`scripts/architecture/checks/check-recovery-boot-evidence.ts` asserts:
- `recovery_boot_evidence` table declared in migrations with required columns + RLS + append-only triggers
- `block_recovery_boot_evidence_mutation` trigger function present
- Edge function `supabase/functions/recovery-evidence-ingest/index.ts` exists
- On-device collector `os/recovery/recovery-evidence-collect.sh` exists + executable bit
- Service unit wires `ExecStartPre` to the collector
- `os/recovery/README.md` documents the loop

Emits `generated/recovery-boot-evidence-report.json`. Wire into `MANDATORY_BLOCK_GATES` (`REQUIRED_GATES` list line 315) of `check-os-release-readiness.ts` as gate #29 right after `admin-runbook-surface-wiring`.

### 5. Strengthen `check-os-recovery-readiness.ts`
Extend existing gate to additionally assert:
- `os/recovery/recovery-evidence-collect.sh` present
- `supabase/functions/recovery-evidence-ingest/index.ts` present
- Service unit `ExecStartPre` line references the collector

(Additive — does not loosen existing checks.)

### 6. Audit doc update (all 4 mirrors)
Patch row 80 in:
- `public/generated/MISSING_AUDIT.md`
- `public/generated/MISSING_AUDIT_v2.md`
- `/mnt/documents/MISSING_AUDIT.md`
- `/mnt/documents/MISSING_AUDIT_v2.md`

Replace P3 status with **RESOLVED 2026-04-20** marker citing the table, edge function, collector, service wiring, and BLOCK gate #29. Verify byte-identical via md5sum.

## Files

**Created (5):**
- `supabase/migrations/<timestamp>_recovery_boot_evidence.sql`
- `supabase/functions/recovery-evidence-ingest/index.ts`
- `os/recovery/recovery-evidence-collect.sh`
- `scripts/architecture/checks/check-recovery-boot-evidence.ts`
- `generated/recovery-boot-evidence-report.json` (auto-emitted on first run)

**Edited (4):**
- `os/image-builder/recovery/sita-recovery.service` (+ `ExecStartPre`)
- `os/recovery/README.md` (document the loop)
- `scripts/architecture/checks/check-os-recovery-readiness.ts` (+ collector + ingest assertions)
- `scripts/architecture/checks/check-os-release-readiness.ts` (+ gate #29)
- 4× audit mirrors

## What this does NOT touch

- Zero changes to existing 28 BLOCK gates
- Zero changes to recovery TUI (`sita-recovery.sh`) command flow
- Zero changes to `recovery-status.sh` snapshot format
- Zero changes to `recovery-outcome-manifest.json` (kept as static contract spec)
- No schema changes to other evidence tables
