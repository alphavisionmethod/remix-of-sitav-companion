
This is a massive verification + remediation prompt with 5 sections (A–E), 14 deliverable docs, 5 status JSONs, and 5 new validation scripts. Let me design a phased approach that is each-phase deployable.

Scope check:
- 19 deliverables in `generated/final-proof-verification/` (14 .md + 5 .json + 1 summary)
- 5 new validators in `scripts/validation/`
- Integration into master release aggregator (BLOCK-level, mirrors prior claim-safety wiring)
- Prior memory confirms: 35 master gates currently green, App Store has 7 edge functions + DB-backed install, 12 admin domains, 19 runbooks, 15 kill-switches, Boardroom L7 follow-through complete

Existing infra to leverage:
- `scripts/validation/_lib/emit-gate-report.ts` (built last phase) — reuse for all 5 new gates
- `check-os-release-readiness.ts` REQUIRED_GATES (currently 45) — append 5 → 50
- `generated/app-install-truth-map.json` already exists (App Store evidence)
- `generated/golden-paths-coverage.json`, runbook registries, kill-switch registry

Each phase = atomic deployable unit (audit + remediation + validator + aggregator wiring per section).

### Phase 1 — Section A: Gate Meaningfulness (deployable)
Audit all 45 currently-green master gates, classify each as meaningful / shallow / structural-only. Build:
- `GATE_MEANINGFULNESS_AUDIT.md` — every gate × evidence × risk-coverage × verdict
- `GATE_HARDENING_PLAN.md` — concrete strengthening for ≥3 weak gates (e.g., adopt deeper assertions in any "presence-only" check)
- `gate-meaningfulness-status.json`
- `scripts/validation/check-gate-meaningfulness.ts` — fails if any gate marked `shallow` lacks a hardening ticket
- Wire into REQUIRED_GATES (46 total)

### Phase 2 — Section B: App Store Lifecycle Reality (deployable)
Independent verification of install/uninstall/update/launcher/profile/entitlements across Type A/B/C/D. Reuses existing `app-install-truth-map.json` as evidence, walks edge functions (`app-install`, `app-uninstall`, `app-update-check`, `app-manifest-sync`, `app-launch-resolve`), inspects `installed_apps` consumers.
- `APP_STORE_REALITY_AUDIT.md`
- `APP_STORE_TYPE_MATRIX.md` (4 types × 7 lifecycle steps)
- `APP_STORE_REMEDIATION_AND_STATUS.md`
- `app-store-reality-status.json`
- `scripts/validation/check-app-store-lifecycle-reality.ts` — verifies all 5 edge functions exist, all 4 type handlers wired, ≥8 consumers of install state (matches existing baseline)
- REQUIRED_GATES (47 total)

### Phase 3 — Section C: Frontend Polish (deployable)
Programmatic + manifest-driven completeness audit across flagship surfaces (Auth/Pulse, Files/AI, Boardroom, Connectors, App Store, key admin). No claim weakening — just exposure.
- `FRONTEND_REALITY_AND_POLISH_AUDIT.md`
- `FRONTEND_COMPLETENESS_MATRIX.md` (per-surface × 9 dimensions)
- `FRONTEND_POLISH_GAP_REGISTER.md`
- `frontend-completeness-status.json`
- `scripts/validation/check-frontend-polish-coverage.ts` — every flagship surface declared in matrix must classify all 9 dimensions; fails if any `unknown`
- REQUIRED_GATES (48 total)

### Phase 4 — Section D: Admin Coherence (deployable)
Audit 12 admin domains as operator workspace using existing `admin-route-registry`, `admin-domain-nav`, `OwnerWorkflowSwitcher`. Classify registry-backed vs museum, actionable vs informational.
- `ADMIN_SURFACE_COHERENCE_AUDIT.md`
- `ADMIN_OPERATOR_USABILITY_MATRIX.md` (12 domains × 9 criteria)
- `ADMIN_REMEDIATION_PRIORITY_PLAN.md`
- `admin-operator-coherence-status.json`
- `scripts/validation/check-admin-operator-coherence.ts` — every domain must have ≥1 actionable surface + registry binding
- REQUIRED_GATES (49 total)

### Phase 5 — Section E: Human-Use Operational + Final Summary (deployable)
Walk operator scenarios against current incident-classifier + runbook registry + kill-switch flows. Validates alert→runbook linkage, kill-switch execution path, evidence visibility, recovery confirmation.
- `HUMAN_USE_OPERATIONAL_SCENARIOS.md` (6 scenario types)
- `OPERATOR_FLOW_VALIDATION_REPORT.md`
- `OPERATIONAL_FRICTION_AND_GAP_REGISTER.md`
- `operational-readiness-status.json`
- `FINAL_PROOF_VERIFICATION_SUMMARY.md` — rolls up all 5 sections
- `scripts/validation/check-human-use-operational-readiness.ts` — every kill-switch must link to ≥1 runbook + every runbook must declare detection signal + recovery confirmation step
- REQUIRED_GATES (50 total)
- Refresh `generated/os-release-readiness-report.json` with full 50/50

### Cross-cutting rules
- Reuse `emit-gate-report.ts` shared helper — no duplication
- No new components, no DB changes, no UI changes (this is governance + evidence)
- All 5 new gates use BLOCK severity, mirror existing claim-safety wiring pattern
- All status JSONs are machine-readable for the aggregator
- No stubs: every audit doc enumerates every item in its scope (no "etc." placeholders)
- No duplication: scans `generated/` first, refuses to recreate existing reality artifacts; if `app-install-truth-map.json` exists, the new App Store audit references it instead of forking

### Technical notes
- All deliverables land under exact path: `generated/final-proof-verification/`
- Each validator follows the established `scripts/validation/check-*.ts` pattern: scan → emit `GateReport` → exit 0/1
- Master aggregator gate count: 45 → 46 → 47 → 48 → 49 → 50 (one per phase, each phase deployable on its own)
- No changes to runtime code paths, no DB migrations, no edge function changes
