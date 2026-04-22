

# Plan: Honest Audit Rewrite v4.0 + Fix All Identified Gaps

## Summary

Full rewrite of `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` to v4.0 based on the PM's 10-concern assessment. The document will split confidence scores by surface (Web/Electron vs OS Native vs Operational Proof), eliminate self-scored inflation, and mark structural-only coverage honestly. Additionally, fix the code-level gaps the PM identified that are actionable now.

## Part 1 — Document Rewrite (v4.0)

Single file: `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` (~750 lines)

### Verdict Block — Honest Layered Assessment
Replace the single "🟢 97% PRODUCTION-READY" with the PM's recommended layered format:
- 🟢 **WEB APP + ELECTRON SHELL: PRODUCTION-READY** — 11/11 pre-deploy gates, 49 E2E specs, 934 RLS policies, visual regression CI
- 🟡 **OS NATIVE: CANDIDATE, NOT PROVEN** — 22 scripts complete, 0/22 executed on hardware, hardware validation pending
- 🟡 **OPERATIONAL PROOF: PARTIAL** — kill-switch registry tests pass, 0 production-shape drills executed; receipt emission 0% live
- 🔵 **Confidence: Web/Electron 96% | OS Native ~40% | Operational Proof ~35%**

### New Section: Coverage Type Legend (§1.1)
Define three coverage types used throughout:
- **Behavioral** — function invoked, response validated, side effects checked
- **Structural** — file scanned for patterns (grep-based), no invocation
- **Contract** — schema/shape validated against fixture data, no live system

Every "Test Verified" cell will now specify which type.

### §1 Platform Scale — Add Honest Context
Keep the metrics table. Add a new column "What This Means":
- "1,092 page files" → add note: "593 are admin pages — consolidation to ~80 canonical surfaces is P1"
- "202 edge functions" → add note: "0 have behavioral integration tests; 15 structural assertions cover all 202 via grep"
- "934 RLS policies" → keep as-is (this is genuinely strong)

### §2.1 OS Scripts — Relabel Coverage Type
All 22 scripts change from "✅" to "✅ contract" with explicit note: "Contract tests validate output schemas and script structure. No script has been executed end-to-end in CI or on hardware."

### §4 Edge Functions — Honest Assessment
- Change "✅ structural" labels to explicitly state: "grep-based pattern matching, not behavioral"
- Add a new subsection "Behavioral Coverage Gap" with: "0/204 functions have integration tests that invoke the function and validate response + side effects"
- Add top-20 priority list for behavioral tests (auth, AI gateway, payment, receipt emission, admin-bff)
- Receipt emission: infrastructure exists (`ai-receipt-logger.ts`, `ai-budget-check.ts` in `_shared/`), 0% live emission confirmed

### §6 Database — Unchanged (genuinely strong)

### §9 Design Token Audit — Relabel
Change "3,196 HSL warnings baselined, cosmetic only" to "3,196 HSL warnings — deferred design debt, will require manual fixes for brand refresh/dark mode/white-label"

### §13 Pre-Flight Checklist — Add Drill Status
- Row 18 "Kill-switches operational": Change to "✅ registry structural | ❌ no production drill executed"
- Add new row 21: "Kill-switch drill executed in staging" → ❌
- Add new row 22: "Production-shape restore drill executed" → ❌

### §14 Active Caveats — Elevate Severity
Rename section to "Active Caveats — These Qualify All Claims Above"
Add opening statement: "The verdict at the top of this document is **conditional** on these items. Do not cite the verdict without this section."

### §15 Confidence Score — Split by Surface
Replace single 97% with:

| Surface | Score | Method | Gap |
|---|---|---|---|
| Web App (build, types, lint, RLS, E2E) | 96% | Behavioral + structural | 5 missing E2E specs |
| Electron Shell (security fabric) | 90% | Behavioral (5/11 modules) | auto-updater, crash-reporter, fs-bridge untested |
| Edge Functions | 30% | Structural only | 0/204 behavioral tests, 0% receipt emission |
| OS Native | 40% | Contract only | 0/22 scripts executed, 0 hardware proofs |
| Operational Proof | 25% | Registry structural | 0 drills, 0 restore tests, 0 7-day probes |
| **Weighted Overall** | **62%** | — | See gaps above |

### New Section: Service & Page Sprawl Status (§17)
- 593 admin pages vs 80 target = 7.4x over target
- Service directories: current count vs 45 target
- 204 edge functions, growing (was 193 six days ago, now 204)
- Recommendation: freeze additions, consolidate

### New Section: PM Corrective Actions Tracker (§18)
| # | Action | Owner | Deadline | Status |
Immediate (this week):
1. Verdict rewrite — this document — ✅ done in v4.0
2. Freeze edge function additions — PR gate — 🟡 needs enforcement
3. Execute 1 kill-switch drill — staging — ❌ not started
4. Close 1 P1 caveat (OAuth 7-day probe) — connectors — ❌ not started

30-day:
5. Behavioral tests for top 20 edge functions
6. Wire receipt emission on those 20
7. Consolidate 34 duplicated service pairs
8. Execute production-shape restore drill
9. Ship MOK signing CI secret injection

90-day:
10. TPM hardware seal/verify on reference device
11. Second reproducibility host in CI
12. Expand hardware matrix to 3 platforms
13. Consolidate 593 admin pages to ~80

## Part 2 — Code Fixes (Actionable Now)

### Fix 1: Kill-switch test — add drill readiness check
File: `src/__tests__/kill-switch-enforcement.test.ts`
Add test case that checks for a `drills/` directory or drill log file, and explicitly marks "0 drills executed" as a tracked metric rather than silently passing.

### Fix 2: Service boundary test — add sprawl metric
File: `src/__tests__/service-boundary-truth.test.ts`
Add test case that counts service directories and reports the count, with a warning threshold (e.g., > 100 directories = warning in output).

### Fix 3: Edge function freeze gate
New file: `src/__tests__/edge-function-freeze-gate.test.ts`
Test that asserts: if edge function count > 204, at least 1 new integration test must exist per new function. This is the PR-level gate the PM demanded.

### Fix 4: Admin page sprawl tracker
New file: `src/__tests__/admin-page-sprawl.test.ts`
Test that counts admin pages (`src/pages/**/admin*` + `src/pages/**/Admin*`) and reports the count. Sets a ratchet: count must not increase above current (593) without a consolidation plan reference.

### Fix 5: Receipt emission coverage gate
New file: `src/__tests__/edge-functions/receipt-emission-coverage.test.ts`
Test that checks how many of the 204 edge functions actually call `logAIReceipt`, `writeDecisionReceipt`, `emitActionReceipt`, or insert into receipt/audit tables. Reports percentage. Current expected: ~5-10%.

## Part 3 — Updated Downloadable Artifact

Regenerate `/mnt/documents/SITA_OS_OSAUDIT_v4.0.md` with the honest scoring.

## Files Changed/Created

1. `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` — full rewrite to v4.0
2. `src/__tests__/kill-switch-enforcement.test.ts` — add drill readiness check
3. `src/__tests__/service-boundary-truth.test.ts` — add sprawl metric
4. `src/__tests__/edge-function-freeze-gate.test.ts` — new
5. `src/__tests__/admin-page-sprawl.test.ts` — new
6. `src/__tests__/edge-functions/receipt-emission-coverage.test.ts` — new
7. `/mnt/documents/SITA_OS_OSAUDIT_v4.0.md` — downloadable artifact

