# Production Restore — Operator Runbook

## Trigger
- Monthly cadence (1st Monday)
- After major schema migration
- After incident in DR domain

## Steps
1. **Preflight**
   ```bash
   npx tsx scripts/db/restore/production-shape-restore-drill.ts --preflight
   ```
2. **Run drill**
   ```bash
   npx tsx scripts/db/restore/production-shape-restore-drill.ts --run --snapshot=prod-shape-latest
   ```
3. **Verify**
   ```bash
   npx tsx scripts/validation/check-production-restore-drill.ts
   npx tsx scripts/validation/check-post-restore-rls-integrity.ts
   npx tsx scripts/validation/check-post-restore-critical-routes.ts
   npx tsx scripts/validation/check-restore-verification-matrix.ts
   ```
4. **Inspect** the receipt at `/admin/health` → Drill Cadence Board.
5. **On failure** — see Failure Modes below.

## Failure modes
| Symptom | Action |
|---|---|
| Restore exits non-zero | inspect `phase_durations.restore.error`, re-run with `--verbose` |
| RLS regression | diff `policies` snapshot pre/post; open incident `IR-RLS-DRIFT` |
| Critical route 500 | check edge function logs; if migration drift, rollback |
| Stale receipt (>35d) | cadence breach — block release until rerun |

## Owner
Primary: DR lead. Backup: Platform on-call.

## Evidence
All runs persisted in `restore_drill_receipts` and surfaced in the Drill Cadence Board. Latest summary: `generated/restore-and-oauth-hardening/production-restore-status.json`.
