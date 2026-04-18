
## Status: 95% Complete — One Wiring Gap

**What IS done (verified):**
- ✅ All 12 deliverables in `generated/claim-safety-hardening/`
- ✅ Canonical registry: `src/lib/claim-safety/demo-only-surface-registry.ts` (9 surfaces)
- ✅ UI components: `DemoOnlyBanner.tsx`, `FutureVisionBadge.tsx`
- ✅ All 9 DWE/UAO pages wired with `<DemoOnlyBanner surfaceId="…" />`
- ✅ All 9 validation scripts exist in `scripts/validation/`
- ✅ 18 claim-bearing docs carry `## Active Caveats` blocks

**What is MISSING (the only real gap):**
The 9 claim-safety validators are **orphaned** — they print pass/fail to console but:
1. Do NOT emit `generated/<gate>-report.json` artifacts (the aggregator's contract)
2. Are NOT listed in `REQUIRED_GATES` inside `scripts/architecture/checks/check-os-release-readiness.ts`

So they cannot block the master `release:readiness` gate. The plan called for them to be "BLOCK-level release gates" — currently they're advisory only.

### Single Phase — Wire Validators into Master Aggregator (BLOCK-level)

**Step 1 — Extract a shared report writer**
Create `scripts/validation/_lib/emit-gate-report.ts` — a tiny helper that writes `generated/<gate>-report.json` in the exact `GateReport` shape the aggregator expects (`gate`, `generatedAt`, `ok`, `errorCount`, `warningCount`, `issues[]`). No new deps; uses `node:fs`.

**Step 2 — Upgrade all 9 validators to emit reports**
Edit each of the 9 scripts so that in addition to its current console output it calls `emitGateReport({ gate, ok, issues })` at the end. Preserve existing exit codes and console messages — purely additive.

Gate names to register:
- `os-claim-safety`
- `track-b-language-boundaries`
- `no-prohibited-native-claims`
- `demo-only-surface-badging`
- `future-vision-route-containment`
- `device-surface-claim-safety`
- `deployment-wording-safety`
- `launch-honesty-alignment`
- `qualifier-required-claims`

**Step 3 — Register in master aggregator**
Append the 9 gate names to `REQUIRED_GATES` in `scripts/architecture/checks/check-os-release-readiness.ts` under a new `// Claim-Safety Hardening — 9 BLOCK gates` section. Total master gates becomes 36 → 45.

**Step 4 — Add npm script + CI orchestration**
Add to `package.json`:
- `"claim-safety:run-all"` — runs all 9 validators sequentially so reports get emitted before `release:readiness`.
- Update `release:readiness` chain (or document the order) so claim-safety reports exist before aggregation.

**Step 5 — Refresh verification artifacts**
- Update `generated/claim-safety-hardening/claim-safety-verification.json` with `aggregatorWired: true` + the 9 gate names.
- Append a "Master Aggregator Integration" section to `CLAIM_SAFETY_HARDENING_FINAL_VERIFICATION.md` documenting the wiring and how to run.

### What this delivers
- Claim-safety regressions become **BLOCK-level** — they fail the master release gate, not just a console line
- Single source of release truth: `generated/os-release-readiness-report.json` now reflects claim-safety health
- No stubs, no duplicates, no parallel truth system — uses the existing `GateReport`/`REQUIRED_GATES` contract
- Zero risk to existing surfaces (additive only)
