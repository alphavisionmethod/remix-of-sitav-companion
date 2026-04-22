

# Fix Build Error + Run All Tests to 100%

## Part 1: Fix InvestmentOffice.tsx Build Error (Line 279)

The `TS1128: Declaration or statement expected` at line 279 is caused by an invisible/hidden character on the blank line between `CommitteeView`'s closing `};` (line 278) and the `// ── NEW: Opportunities Tab` comment (line 280). The code structure itself is correct — all 10 sub-components and the main component are properly scoped and closed.

**Fix**: Rewrite lines 276–280 by deleting and re-typing the blank line to eliminate any non-printing characters. The content stays the same:

```typescript
);

};

// ── NEW: Opportunities Tab ──────────────────────────────────────
```

## Part 2: Run Full Vitest Suite (~70 test files)

After the build fix, run `npx vitest run` and fix failures in batches. The test files include:

- **55 unit tests** in `src/test/*.test.ts` (boardroom, policy, advisors, domain engines, governance, formulas, search, workflow, etc.)
- **8 contract tests** in `src/test/contracts/` (schema snapshots, edge function schemas)
- **14 integration tests** in `src/test/integration/` (auth flow, AI gateway, connectors, capability registry, etc.)
- **1 script-system test** in `src/test/script-system/`

For each failing test, apply one of:
- Add missing import/export to source modules
- Update mock data shapes to match current types
- Stub missing modules with minimal implementations
- Fix hook/context references (e.g. `isDemoMode` scoping)

## Part 3: Run Playwright E2E Suite (38 spec files)

Run `npx playwright test` covering auth journeys, demo mode, admin boards, business/money/advisor journeys, desktop shell, navigation, route health, and verification boards. Fix any route or render issues.

## Execution Order

1. Rewrite lines 276–280 of `InvestmentOffice.tsx` to clear hidden chars
2. Verify build passes (`npx vite build`)
3. Run `npx vitest run` — capture all failures
4. Fix failures in batches of 5–10 files per pass
5. Re-run Vitest until 100% pass
6. Run `npx playwright test` — capture failures
7. Fix route/render issues
8. Re-run Playwright until 100% pass
9. Final build verification

## Scope

- 1 file syntax fix (InvestmentOffice.tsx — hidden character removal)
- Estimated 10–30 test file fixes (imports, mocks, stubs)
- No database changes
- No new features — purely test infrastructure fixes

