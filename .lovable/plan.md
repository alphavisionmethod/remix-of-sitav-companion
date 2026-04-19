

## Audit Verdict — NOT 100% advanced (5 stub validators + 1 weak auth assertion)

**What IS real and wired (preserve, don't touch):**
- 11 audit markdowns + 6 JSON status files in `generated/admin-and-validation-closure/` ✓
- 10 hardware/operator markdowns + 4 JSON status files ✓
- 8 Admin/Validation validators (34-53 LOC, real registry/file scans): `check-no-museum-boards`, `check-admin-action-orientation`, `check-edge-function-contract-coverage`, `check-warn-ratchet-meaningfulness`, `check-evidence-freshness-blocking`, `check-behavioral-ci-coverage`, `check-gate-quality-classification`, `check-admin-top-task-discoverability` ✓
- 20 edge-function `contract_test.ts` files using shared template (real fetch, CORS + error-shape assertions) ✓
- Migration for `hardware_certification_runs` + `operator_drill_executions` tables w/ admin RLS ✓
- 2 truth panels mounted on AI Engineer hub ✓
- 15 BLOCK gates wired into `check-os-release-readiness.ts` ✓
- `record-hardware-certification-run.sh` + `runbook-drill` edge fn DB writes ✓

**What is STUB or WEAK (must be hardened to "fully advanced"):**

| Validator | Lines | Problem |
|---|---|---|
| `check-runbook-human-use-proof.ts` | 6 | Hard-coded WARN. Does NOT read `runbook-registry.ts` (19 runbooks) or `operator_drill_executions` table. |
| `check-kill-switch-drill-readiness.ts` | 6 | Hard-coded WARN. Does NOT read `kill-switch-registry.ts` (15+ KS) or DB. |
| `check-supportability-freshness.ts` | 6 | Hard-coded auto-pass with empty issues. Does NOT read `DRILL_CADENCE_AND_FRESHNESS_POLICY.md` or any cadence data. |
| `check-attestation-evidence-freshness.ts` | 11 | Reads only one count, no per-run timestamp window enforcement. |
| `check-operator-drill-execution.ts` | 11 | File-only; never queries the live DB it claims to validate. |
| `contract-test-template.ts` auth assertion | line 63 | Accepts `200` as valid auth-rejection — auth check is effectively cosmetic. |

**Plus 2 missing meta-deliverables** (per Part 5 spec) the audit noticed are still missing:
- `OPERATOR_TOP_TASK_PATHFINDING_MODEL.md` exists but no machine-readable `top-tasks-status.json` mate to feed `check-admin-top-task-discoverability`
- No emitter to (re)generate the hardware/operator `*-status.json` files from DB; the existing `emit-hardware-and-operator-artifacts.ts` doesn't query DB tables

---

## Closure Plan — Make every validator REAL, no stubs

### Phase 1 — Harden the 5 stub/weak validators (real registry + DB reads)

**1A. `check-runbook-human-use-proof.ts` → ~80 LOC, real**
- Import `RUNBOOK_REGISTRY` from `src/lib/support/runbook-registry.ts`
- Read DB rows from `operator_drill_executions` via `psql` env (or status-file fallback at `generated/hardware-and-operator-closure/operator-drill-executions.json` emitted by 1F)
- For each runbook ID: assert ≥1 execution row OR explicit `pending-human-use` classification in status file
- Emit per-runbook coverage report; WARN if <50% covered, INFO if all classified

**1B. `check-kill-switch-drill-readiness.ts` → ~70 LOC, real**
- Import `KILL_SWITCH_REGISTRY` from `src/lib/control-plane/kill-switch-registry.ts`
- Cross-reference `kill_switch_audit_log` (existing table) for drill-tagged entries
- Per-KS: assert ≥1 drill OR `pending-drill` classification
- Emit `generated/kill-switch-drill-readiness-report.json` with per-KS table

**1C. `check-supportability-freshness.ts` → ~60 LOC, real**
- Parse `generated/hardware-and-operator-closure/DRILL_CADENCE_AND_FRESHNESS_POLICY.md` for cadence windows (hardware: monthly, restore: weekly, runbook: quarterly, KS: monthly)
- Read `generated/final-hardening/drill-cadence-status.json` (9 drills already DB-backed)
- Per-category: compute days-since-last-execution, fail WARN if exceeded, BLOCK if 2× exceeded

**1D. `check-attestation-evidence-freshness.ts` → ~60 LOC, real**
- Read individual run files in `generated/hardware-and-operator-closure/runs/*.json` (created by `record-hardware-certification-run.sh`)
- Enforce 720h (30-day) window per device class
- Emit per-device-class freshness table; honest `partner-blocked` when zero runs

**1E. `check-operator-drill-execution.ts` → ~70 LOC, real**
- Add live DB query path: `psql -t -c "SELECT scenario, COUNT(*), MAX(signoff_at) FROM operator_drill_executions WHERE signoff_at > now() - interval '90 days' GROUP BY scenario"`
- Fallback to status file if `PGHOST` unset
- Assert ≥6 distinct scenarios with executions in last 90 days; classify the rest honestly

### Phase 2 — Harden the contract-test template (remove false-pass)

**2A. `contract-test-template.ts` auth assertion**
- Remove `200` from accepted no-auth response codes (only 401/403/400 acceptable)
- Add a 4th assertion: `success-shape contract` — when `validBody` is provided, POST it with valid auth and assert response is JSON with no leaked stack traces
- Update all 20 contract_test.ts files where appropriate to pass `validBody` (5 critical ones: `internal-agent-execute-action`, `release-artifact-signer`, `release-artifact-verifier`, `attestation-packet-builder`, `audit-export-bundler`)

### Phase 3 — Add missing emitter + status mate files

**3A. Create `scripts/validation/emit-operator-drill-status.ts`**
- Queries `operator_drill_executions` via PG env vars (graceful fallback)
- Emits `generated/hardware-and-operator-closure/operator-drill-executions.json` with: per-scenario count, MTTR/MTTD averages, latest signoff timestamps
- Wired into `closure:hardware-operator:emit` npm script

**3B. Create `generated/admin-and-validation-closure/top-tasks-status.json`**
- Machine-readable mate to `OPERATOR_TOP_TASK_PATHFINDING_MODEL.md`
- Lists 10 top tasks × `{name, route, expectedClicks, currentPath, idealPath, complete}`
- Consumed by `check-admin-top-task-discoverability.ts` (already reads `admin-usability-status.json` — extend it to also enforce ≤3 clicks from this new file)

**3C. Update `check-admin-top-task-discoverability.ts`** (~50 LOC) to also enforce per-task ≤3-click path via the new JSON

### Phase 4 — Re-run all 15 gates + verify final state

- Run each of the 15 hardened validators
- Confirm all emit honest status (real BLOCK where evidence supports, honest WARN-tier `partner-blocked` / `pending-human-execution` where real-world execution still required — no false greens)
- Update `ADMIN_AND_VALIDATION_FINAL_VERIFICATION.md` and `HARDWARE_AND_OPERATOR_FINAL_VERIFICATION.md` with live evidence tables
- Confirm `os-release-readiness-report.json` reflects 171 BLOCK gates, with an honest `YELLOW` overall status until real-device runs + first 6 human-use drill executions land

### Files touched (final)
- **EDITED (5 validators):** the 5 stubs/weak ones above → real implementations (320+ LOC total)
- **EDITED (1):** `contract-test-template.ts` → tightened + new success-shape assertion
- **EDITED (5):** the 5 priority `contract_test.ts` files to pass `validBody`
- **NEW (1):** `scripts/validation/emit-operator-drill-status.ts` (DB-backed emitter)
- **NEW (1):** `generated/admin-and-validation-closure/top-tasks-status.json` (10-task pathfinding data)
- **EDITED (1):** `check-admin-top-task-discoverability.ts` → enforces click-count
- **EDITED (1):** `package.json` → wire emitter into existing `closure:hardware-operator:emit`
- **EDITED (2):** the 2 final verification markdowns refreshed with live evidence
- **ZERO edits to:** other admin domains, mobile/AI runtime/connector closures, registries themselves

After this pass: every validator does **real work** against real registries / real DB rows / real freshness windows. No 6-line stubs. No `200` accepted as auth-pass. Honest `partner-blocked` / `pending-human-execution` classification preserved where truly externally blocked — but the validator that draws that conclusion now does so by **inspecting the real data**, not by hard-coding the WARN.

