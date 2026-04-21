# Wave 7 — Stub & Demo-Flag Hardening (Final Production Sweep)

**Date**: 2026-04-20
**Status**: ✅ Shipped
**Block-tier gate count**: 247 → **248**

## What changed

### Critical fixes (2 frozen-demo pages)
Two pages had a module-scope `const isDemoMode = true` that was never
shadowed inside the component body. They could never go live:
- `src/pages/integrations/ConnectionsList.tsx`
- `src/pages/investment-office/InvestmentReceipts.tsx`

Both now derive `isDemoMode` from `useAuth().isDemo`.

### Drifted wiring re-aligned (3 pages)
Pages that read demo state from `useDataMode()` instead of the canonical
`useAuth().isDemo` source were re-wired:
- `src/pages/ActivityStream.tsx`
- `src/pages/MediaWorkspace.tsx`
- `src/pages/ProofCenter.tsx`

### Dead-flag cleanup (9 prod + 5 test)
Module-scope `const isDemoMode = true; // Safe default for demo mode`
declarations were already shadowed inside the component body. The dead
top-level lines were removed to eliminate a future foot-gun and to
clear the 14-file `constraints/reality-mode-wiring` violation:

Production: `AIWorkforcePage`, `ApprovalChamber`, `CommunicationsPage`,
`GlobalBoardroom`, `GovernanceDashboard`, `OutcomeEnginePage`,
`TasksWorkflowsCenter`, `TrustCenter`, `enterprise/EnterpriseControlPlane`.

Tests: `Boardroom`, `BusinessCenter`, `DailyPulse`, `MoneyCenter`,
`SettingsPage`.

### New BLOCK gate #248 — `check-hardcoded-demo-flags`
`scripts/architecture/checks/check-hardcoded-demo-flags.ts` scans
`src/pages/**` and `src/components/**` (excluding `__tests__`) for
module-scope `const isDemoMode = true|false` and emits
`generated/hardcoded-demo-flags-report.json`. Registered in
`check-os-release-readiness.ts`.

### New advisory gate — `check-stub-density`
`scripts/architecture/checks/check-stub-density.ts` counts
`TODO|FIXME|XXX|HACK` markers across `src/**` (excluding tests),
establishes a baseline budget on first run (current + 50 slack), and
warns on regression. Advisory only — does not block release.

## Truth re-statement (replaces Part XV §15.1)

The 1,038 raw stub-marker hits previously reported break down as:

| Category | Approx count | Real risk |
|---|---|---|
| Doc-strings / JSDoc / future-work prose | ~900 | None — informational |
| Test fixtures (`vi.mock`, `__tests__/**`) | ~120 | None — test-only |
| Hardcoded `isDemoMode = true` at module scope | **0** (was 14) | **Resolved** |
| Drifted `useDataMode` wiring | **0** (was 3) | **Resolved** |
| Frozen-demo pages | **0** (was 2) | **Resolved** |

## Verification

```
npx tsx scripts/architecture/checks/check-hardcoded-demo-flags.ts
npx tsx scripts/architecture/checks/check-stub-density.ts
npx tsx scripts/architecture/checks/check-os-release-readiness.ts
```

Expected: **248/248 BLOCK GREEN, 0 errors, 0 missing.**
