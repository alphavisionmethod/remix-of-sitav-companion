# Gate Hardening Plan

For every gate marked `structurallyGreenButShallow` or `conditionallyMeaningful` in `GATE_MEANINGFULNESS_AUDIT.md`, this plan declares a concrete strengthening action. The plan itself is consumed by `scripts/validation/check-gate-meaningfulness.ts`, which fails the master release if a shallow gate has no entry here.

## Hardening Tickets

### GH-001 — `mobile-store-readiness` → reclassify `informational`
**Why:** Mobile distribution is archived per `architecture/app-platform`. Holding this as a BLOCK gate creates false comfort.  
**Action:** Move to `INFORMATIONAL_GATES` array (separate from `REQUIRED_GATES`) once Phase 6 is opened. For now, keep BLOCK with explicit `mobile archived` caveat in claim-safety docs.  
**Owner:** platform / mobile-archive  
**Status:** declared; reclassification pending Phase 6 scope.

### GH-002 — `mobile-build-pipeline` → reclassify `informational`
Same rationale and disposition as GH-001.

### GH-003 — `mobile-capability-truth` → reclassify `informational`
Same rationale and disposition as GH-001.

### GH-004 — `native-shell-session-readiness` → add graphical handoff smoke
**Why:** Today this gate inspects shell-session manifest only; a broken GNOME-Shell handoff would still show green.  
**Action:** Add a `qemu-shell-handoff-smoke` step to `os:smoke` that boots the image, logs into the SITA shell session via auto-login, and asserts the user-profile root surface renders within N seconds. Emit `qemu-shell-handoff-smoke-report.json` and reference it from the existing gate.  
**Owner:** platform / runtime  
**Status:** declared; integration pending next runtime release window.

### GH-005 — `operator-readiness` → add operator-profile E2E smoke
**Why:** Operator-profile boot is asserted only at manifest level. The actual operator workspace shell mount is not exercised.  
**Action:** Add a Playwright spec that boots in operator profile and asserts `/admin/dashboard` + `/admin/alerts` render, mirroring the user-profile readiness probe.  
**Owner:** admin-platform  
**Status:** declared.

### GH-006 — `launch-honesty-alignment` → cross-link caveats to evidence
**Why:** Today the gate confirms an `## Active Caveats` block exists in 18 claim-bearing docs. It does not yet confirm each caveat references a real evidence file.  
**Action:** Strengthen `check-launch-honesty-alignment.ts` to parse caveat lines and assert each names either an existing `generated/*-report.json` or a known runbook/kill-switch ID.  
**Owner:** launch-honesty / claim-safety  
**Status:** declared.

## Acceptance

`check-gate-meaningfulness.ts` parses this file, extracts ticket IDs (`GH-NNN`), and verifies that every gate listed in `gate-meaningfulness-status.json` under `shallowGatesWithHardeningPlan` has at least one ticket here.
