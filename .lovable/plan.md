

# Fix Build Error + Run All Tests to 100%

## Part 1: Fix InvestmentOffice.tsx Build Error (Line 279)

The `TS1128: Declaration or statement expected` at line 279 is caused by a stale artifact — the code structure is syntactically correct (`CommitteeView` closes properly at line 278, `OpportunitiesView` starts at line 282). The fix is to rewrite lines 276–280 cleanly to eliminate any hidden/invisible characters:

```
);
};

// ── NEW: Opportunities Tab ──────────────────────────────────────
```

## Part 2: Run All Vitest Unit Tests (70+ files)

Run the full Vitest suite (`npx vitest run`) and fix failures in batches. The test files span:

- **`src/test/*.test.ts`** — ~55 unit test files covering boardroom, core-services, policy engine, advisors, domain engines, governance, financial formulas, search fabric, workflow, etc.
- **`src/test/contracts/*.test.ts`** — 8 contract/schema snapshot tests
- **`src/test/integration/*.test.ts`** — 14 integration tests (auth flow, AI gateway, connectors, etc.)
- **`src/test/script-system/`** — script validation tests
- **`tests/e2e/degraded-mode.spec.ts`** — runs via Vitest (not Playwright)

Common failure patterns to fix:
1. **Missing exports** — test imports functions/classes that were renamed or moved during consolidation
2. **isDemoMode scoping** — test files importing from modules that still have broken scope
3. **Mock data shape mismatches** — types changed but test fixtures not updated
4. **Missing modules** — tests import files that don't exist yet

For each failing test file, the fix will be one of:
- Add missing import/export
- Update mock data to match current type shapes
- Stub missing modules with minimal implementations
- Fix hook/context references

## Part 3: Run All Playwright E2E Tests (38 spec files)

Run `npx playwright test` for the 38 E2E spec files covering:
- Auth journeys, demo mode, admin boards
- Business/money/advisor/concierge/files/settings journeys
- Desktop shell, navigation, responsive, route health
- Customer journey boards, verification boards

These are primarily auth-redirect tests (verify unauthenticated users redirect to `/login`) and basic page-render smoke tests. Failures here typically mean:
- Route path changed but test not updated
- Page crashes on render (missing component/hook)

## Execution Order

1. Fix `InvestmentOffice.tsx` line 279 (clean rewrite of the blank line area)
2. Run `npx vitest run` — capture all failures
3. Fix failures in batches of 5–10 files per pass
4. Re-run until 100% pass
5. Run `npx playwright test` — capture failures
6. Fix any route/render issues
7. Re-run until 100% pass
8. Final `bun run build:dev` to confirm clean build

## Scope

- ~1 file syntax fix (InvestmentOffice.tsx)
- Estimated 10–30 test files needing import/mock/stub fixes
- No new database changes
- No new features — purely fixing existing test infrastructure

