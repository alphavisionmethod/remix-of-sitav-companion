

## Audit findings (live)

**Already in place — DO NOT duplicate:**
- Admin AI Engineer hub at `src/pages/admin/ai-runtime/AIRuntimeHome.tsx` — 19 modules already including 4 truth panels (Nightly Truth, Connector Truth, Mobile Scope Truth, Frontend Polish Truth)
- `BoardSection.tsx` shared helper in `_shared/`
- `check-admin-operator-coherence.ts` (12-domain check) — GREEN
- `check-human-use-operational-readiness.ts` (6 scenarios, KS+RB linkage) — GREEN
- `check-drill-cadence-freshness.ts` (9 drills DB-backed) — GREEN
- `check-supportability-review-cadence.ts` — GREEN
- `check-evidence-freshness.ts` (WARN-tier today)
- `check-final-gate-meaningfulness.ts`
- 30+ behavioral validators (AI live-provider nightly, OAuth refresh nightly, connector streak)
- `os/scripts/build-verity-root.sh`, `seal-verity-to-tpm.sh`, `verify-tpm-seal.sh`, `verify-verity-metadata.sh`
- `os/image-builder/preflight/hardware-check.sh`
- 21 edge function `_test.ts` files (out of 158 functions = ~13% coverage today)
- `generated/final-hardening/drill-cadence-status.json` with 9 drills
- 156 BLOCK gates already wired into `check-os-release-readiness.ts`

**Real gaps (not yet implemented):**

*Admin & Validation closure:*
- 0 of 8 closure validators exist (museum-board, action-orientation, edge-function-contract-coverage, warn-ratchet-meaningfulness, evidence-freshness-blocking, behavioral-ci-coverage, gate-quality-classification, admin-top-task-discoverability)
- 0 of 16 closure deliverables exist in `generated/admin-and-validation-closure/`
- Edge-function contract coverage measured at ~13% (21/158) — needs honest baseline + path to >50%
- Evidence freshness is WARN-only — needs policy + observation-window → BLOCK promotion

*Hardware & Operator closure:*
- 0 of 7 closure validators exist (real-hardware-proof, hardware-certification-matrix, attestation-evidence-freshness, operator-drill-execution, runbook-human-use-proof, kill-switch-drill-readiness, supportability-freshness)
- 0 of 14 closure deliverables exist in `generated/hardware-and-operator-closure/`
- No hardware certification matrix — only emulation/QEMU proof
- No durable attestation evidence model
- No operator MTTR/signoff capture model

**Scope rule (per user):** All NEW UI surfacing lives on the **Admin AI Engineer hub** (`src/pages/admin/ai-runtime/AIRuntimeHome.tsx`) as 2 new truth-panel tabs. Validators live in the canonical `scripts/validation/` (platform-wide by definition). Generated evidence lives in canonical `generated/` paths. **Zero edits to other admin domains.**

---

## Phase 1 — Admin & Validation Truth Closure (10 deliverables)

### 1A. Generate the 16 audit/status documents
Create `generated/admin-and-validation-closure/` with all 11 markdown audits + 4 JSON status files + 1 final verification — using LIVE evidence from existing reports (read `admin-operator-coherence-report.json`, `human-use-operational-readiness-report.json`, `evidence-freshness-report.json`, etc.):
- `ADMIN_CONTROL_PLANE_USABILITY_AUDIT.md` (12 domains × 9 criteria from existing status)
- `OPERATOR_TOP_TASK_PATHFINDING_MODEL.md` (10 critical operator tasks: AI failure triage, connector reauth, Boardroom stuck, kill-switch decision, restore/recovery, incident drilldown, release verification, receipts lookup, env remediation, secret rotation)
- `ADMIN_DOMAIN_CONSOLIDATION_AND_LINKAGE_PLAN.md` (no new domains; cross-link plan)
- `OPERATOR_STRESS_TEST_REPORT.md` (8 scenario × find/interpret/action timing)
- `MUSEUM_BOARD_AUDIT.md` (scan AI Engineer hub: classify each board on action-orientation + remediation)
- `EDGE_FUNCTION_CONTRACT_COVERAGE_AUDIT.md` (live count: 21/158 covered today; gap list)
- `EDGE_FUNCTION_CONTRACT_EXPANSION_PLAN.md` (priority list to reach 80/158 = >50%)
- `WARN_GATE_AND_RATCHET_AUDIT.md` (read `per-bucket-warn-ratchet-report.json` + classify each WARN)
- `EVIDENCE_FRESHNESS_POLICY.md` (define 9 freshness windows, 30-day clean-window observation policy)
- `CI_BEHAVIORAL_TRUTH_AUDIT.md` (classify all 156 gates: structural / smoke / behavioral / E2E)
- `GATE_TAXONOMY_AND_QUALITY_MODEL.md` (5-class taxonomy, per-gate classification table)
- `ADMIN_AND_VALIDATION_FINAL_VERIFICATION.md`
- 4 JSON status files (admin-usability, gate-quality, warn-ratchet, admin-and-validation-verification)

### 1B. Implement the 8 NEW validators
Each is real (not stub), exits non-zero on real violations, emits via `_lib/emit-gate-report.ts`:
1. `check-admin-top-task-discoverability.ts` — asserts `admin-and-validation-closure/admin-usability-status.json` declares ≥10 top tasks each with ≤3-click path
2. `check-no-museum-boards.ts` — scans `src/pages/admin/ai-runtime/**` requiring every Card with status display to also link to `useNavigate(...)` or `<Link>` to a remediation/drilldown route
3. `check-admin-action-orientation.ts` — every AI Engineer board must contain ≥1 actionable element (Button, Link to remediation, refresh, etc.)
4. `check-edge-function-contract-coverage.ts` — counts real `_test.ts` files in `supabase/functions/`, asserts ≥50% (≥80 of 158); emits coverage delta
5. `check-warn-ratchet-meaningfulness.ts` — reads `per-bucket-warn-ratchet-report.json`; asserts every WARN bucket is either trending down OR explicitly classified `noncritical-acknowledged` in `gate-quality-status.json`
6. `check-evidence-freshness-blocking.ts` — promotes `evidence-freshness-report.json` to BLOCK after 30-day clean observation window proven by `observation-window-status.json`
7. `check-behavioral-ci-coverage.ts` — asserts every deployment-critical runtime-truth area (AI live-provider, OAuth refresh G/M/S, Boardroom L7, restore drill) has a behavioral validator (not synthetic)
8. `check-gate-quality-classification.ts` — asserts every of 156 gates has explicit classification in `gate-quality-status.json` (`structural | smoke | behavioral | e2e | warn-only`)

### 1C. Wire into release readiness
Add 8 new BLOCK gates to `scripts/architecture/checks/check-os-release-readiness.ts` REQUIRED_GATES array.

### 1D. AI Engineer hub UI (1 new tab)
- New `src/components/admin/ai-runtime/AdminValidationTruthPanel.tsx` — reads `generated/admin-and-validation-closure/admin-and-validation-verification.json` + per-gate classification; same shape as existing 4 truth panels
- Insert as new `admin-validation-truth` module in `AIRuntimeHome.tsx` (after `frontend-polish-truth`)

### 1E. Edge-function contract coverage hardening
Add **20 new contract `_test.ts` files** prioritized by deployment-criticality (going from 21 to 41 → on path to 80; the validator fails warning-only at <50% but emits a clear roadmap). Targets: `internal-agent-execute-action`, `internal-agent-loop`, `internal-agent-reflect`, `internal-agent-policy-architect`, `internal-agent-trust-evaluator`, `internal-agent-self-healer`, `internal-agent-suggestion-generator`, `internal-agent-weekly-digest`, `internal-agent-dependency-scanner`, `internal-agent-cost-optimizer`, `internal-agent-slo-evaluator`, `internal-agent-consensus-engine`, `internal-agent-tenant-federation`, `security-council-tick`, `boardroom-followthrough-dispatch`, `boardroom-outcome-record`, `release-artifact-signer`, `release-artifact-verifier`, `attestation-packet-builder`, `audit-export-bundler`. Each test asserts: CORS, JWT validation, error-shape contract, success-shape contract.

---

## Phase 2 — Hardware & Operator Readiness Closure (24 deliverables)

### 2A. Generate the 14 hardware/operator documents
Create `generated/hardware-and-operator-closure/`:
- `HARDWARE_PROOF_CURRENT_STATE_AUDIT.md` (honest: QEMU/OVMF only today; no real-device runs recorded)
- `HARDWARE_PROOF_MODEL.md` (4 capabilities × 4 device classes proof matrix)
- `HARDWARE_ATTESTATION_EVIDENCE_MODEL.md` (durable evidence schema: run_id, device_class, firmware, phase, pass/fail, attestation_quote, log_refs, timestamps, runner_id)
- `HARDWARE_CERTIFICATION_MATRIX.md` (4 device classes × 5 capability columns; ALL marked `partner-blocked` honestly today)
- `OPERATOR_READINESS_CURRENT_STATE_AUDIT.md` (existing 6 scenarios reviewed; 0 real-human-use logs to date)
- `OPERATOR_DRILL_MODEL.md` (8 drill categories × 6 dimensions: detect, select-runbook, kill-switch, evidence, rollback, confirm)
- `HUMAN_USE_DRILL_EXECUTION_REPORT.md` (initial template with `pending-execution` scenarios)
- `OPERATOR_SIGNOFF_AND_MTTR_MODEL.md` (record schema: scenario, runner, MTTD, MTTR, friction)
- `DRILL_CADENCE_AND_FRESHNESS_POLICY.md` (per-drill cadence: hardware monthly, restore weekly, runbook quarterly, kill-switch monthly)
- `HARDWARE_AND_OPERATOR_FINAL_VERIFICATION.md`
- 4 JSON status files (hardware-proof, hardware-certification, operator-readiness, hardware-and-operator-verification)

### 2B. Create canonical hardware proof DB tables (real, RLS-enforced)
New migration creating:
- `hardware_certification_runs` (run_id, device_class, firmware, secure_boot_pass, tpm_pass, dm_verity_pass, ab_rollback_pass, recovery_pass, attestation_quote_b64, log_refs JSONB, runner_id uuid, run_at timestamptz)
- `operator_drill_executions` (drill_id, scenario, operator_id uuid, mttd_seconds, mttr_seconds, detect_pass, select_runbook_pass, kill_switch_pass, evidence_pass, rollback_pass, confirm_pass, friction_notes, signoff_at)
- RLS: only `has_role(auth.uid(),'admin')` can SELECT/INSERT (uses existing `has_role` helper)
- Both tables `ALTER PUBLICATION supabase_realtime ADD TABLE` for live AI Engineer hub updates

### 2C. Create real hardware proof emitter scripts
- `os/scripts/record-hardware-certification-run.sh` (real: takes device-class arg, runs `verify-tpm-seal.sh` + `verify-verity-metadata.sh` locally, dumps JSON evidence into `generated/hardware-and-operator-closure/runs/<run-id>.json` AND inserts into DB if `PGHOST` available)
- `scripts/validation/emit-hardware-and-operator-artifacts.ts` (regenerates the 4 JSON status files from DB rows + run files)

### 2D. Implement the 7 NEW validators
1. `check-real-hardware-proof.ts` — reads `hardware-proof-status.json`; honestly classifies state as `partner-blocked` (warn) until real evidence rows present, then promotes to BLOCK
2. `check-hardware-certification-matrix.ts` — asserts matrix is current (per cadence policy); emits `partner-blocked` reason if no rows
3. `check-attestation-evidence-freshness.ts` — asserts attestation runs within 30-day window when present
4. `check-operator-drill-execution.ts` — reads DB rows from `operator_drill_executions` (or status file fallback); asserts ≥6 scenarios with executions in last 90 days
5. `check-runbook-human-use-proof.ts` — every runbook in `runbook-registry.ts` must have ≥1 execution row OR explicit `pending-human-use` classification
6. `check-kill-switch-drill-readiness.ts` — every KS in registry must have ≥1 drill execution OR `pending-drill` classification
7. `check-supportability-freshness.ts` — extends existing cadence freshness check to enforce per-category staleness windows from policy

### 2E. Wire into release readiness
Add 7 hardware/operator gates to `check-os-release-readiness.ts` REQUIRED_GATES (15 new BLOCK gates total when combined with Phase 1).

### 2F. AI Engineer hub UI (1 new tab)
- New `src/components/admin/ai-runtime/HardwareAndOperatorTruthPanel.tsx` — reads `hardware-and-operator-verification.json` + queries `hardware_certification_runs` and `operator_drill_executions` tables live
- Three sections: Hardware certification matrix table | Operator drill log (latest 20 with MTTR) | Cadence freshness summary
- Insert as new `hardware-operator-truth` module in `AIRuntimeHome.tsx`

### 2G. Wire drill execution recording from existing surfaces
- Edge function `runbook-drill` (already exists): extend to write into `operator_drill_executions` on completion
- `dr-drill-runner` (already exists): extend to write certification rows when run with `--hardware` flag

---

## Phase 3 — npm scripts + final integration

- Add `closure:admin-validation:emit`, `closure:admin-validation:run-all`, `closure:hardware-operator:emit`, `closure:hardware-operator:run-all` to `package.json`
- Update `final:closure:run-all` to include both new closures
- Run all 15 new gates → expect: Admin/Validation 8/8 GREEN, Hardware/Operator 4/7 GREEN + 3 honestly classified `partner-blocked` WARN (until real-device evidence is captured by operator)

### Honest limits surfaced (no fake green)
- `check-real-hardware-proof` and `check-hardware-certification-matrix` will return `partner-blocked` warn-tier until real-device runs are recorded (no synthetic proof)
- `check-operator-drill-execution` will return `pending-human-execution` warn until human operator runs first drill (the runbook-drill function is wired and ready)
- `check-edge-function-contract-coverage` returns warning at 41/158 (~26%) initially; gate explicitly flags target=>50% with named expansion plan
- `check-evidence-freshness-blocking` stays WARN until 30-day clean observation window completes (no false BLOCK promotion)

### Files touched (final summary)
- **NEW (49):** 16 admin-validation deliverables + 14 hardware-operator deliverables + 8 admin validators + 7 hardware validators + 2 emitters + 2 truth panels (UI) + 20 contract tests + 1 hardware run script + 1 SQL migration
- **EDITED (4):** `AIRuntimeHome.tsx` (+2 tabs), `check-os-release-readiness.ts` (+15 BLOCK gates), `package.json` (+4 scripts), `runbook-drill` and `dr-drill-runner` edge functions (+real DB writes)
- **ZERO edits to:** any other admin domain, any user-facing surface, mobile/connector/AI runtime closures (preserved GREEN)

After this pass: 171 BLOCK gates total (was 156), 2 new live truth panels on AI Engineer hub, real hardware/operator evidence schema in DB, honest WARN-tier classification for everything blocked by real-world execution (no synthetic green).

