

## What's actually still broken

The previous wave physically deleted the 5 shim folders, but **3 stale references** were missed and would surface as runtime/CI failures:

1. **`tests/integration/service-flows.test.ts:63`** — `await import("@/lib/seed/index")` — folder is deleted; test will throw at runtime.
2. **`src/lib/detection/reality-detection-engine.ts`** — `KNOWN_MOCK_SOURCES` registry hard-codes 9 string paths to `src/lib/mock-data/*.ts` files that no longer exist. Detection engine reports phantoms; downstream Reality dashboards show ghost violations.
3. **`generated/plane-ownership.json`** — `internal-tools` plane lists 4 deleted directories (`src/lib/{simulation,demo-data,mock-data,seed}`). Plane boundary checks will mis-attribute ownership.

## Fix plan (3 surgical edits + audit truth-up)

### Step 1 — Repoint the broken test
`tests/integration/service-flows.test.ts:63` → change `@/lib/seed/index` to `@/data/fixtures/seed/index` (the canonical home).

### Step 2 — Update the detection registry to canonical paths
`src/lib/detection/reality-detection-engine.ts` lines 92–100: rewrite the 9 string-literal `path` fields:
- `src/lib/mock-data/<name>.ts` → `src/data/fixtures/mock-data/<name>.ts`

This is a registry of *paths to scan*, not imports — but the strings must match real files for the detection engine to be honest.

### Step 3 — Refresh `generated/plane-ownership.json`
Update the `internal-tools.directories` array:
- Remove: `src/lib/simulation`, `src/lib/demo-data`, `src/lib/mock-data`, `src/lib/seed`
- Add: `src/domains/simulation`, `src/data/fixtures/demo-data`, `src/data/fixtures/mock-data`, `src/data/fixtures/seed`

Keep the remaining (still-existing) entries: `src/lib/fip`, `src/lib/dual-reality`, `src/lib/reality-records`, `src/lib/demo-scenarios`.

### Step 4 — Add a CI gate to prevent stale-path regression
New script `scripts/architecture/checks/check-stale-deleted-paths.ts` (BLOCK-composite under `lib-ownership-drift`, no count change): scans `src/`, `tests/`, `generated/*.json`, and `docs/` for any string literal matching `src/lib/(canonical-backend|simulation|mock-data|demo-data|seed)/`. Allowlist: archived migration scripts under `scripts/architecture/perform-real-migration-wave*.ts` (historical record).

### Step 5 — Cosmetic doc cleanup
`docs/REAL_VS_SIMULATED.md` line 688: change `src/lib/simulation/` → `src/domains/simulation/`.

### Step 6 — Truth-up `PROJECT_TREE_AUDIT.md`
Append a "Wave 2 Residual Cleanup (2026-04-20)" section under the Physical Resolution Log:
- Repointed 1 test import (`service-flows.test.ts`)
- Migrated 9 detection-registry path literals to canonical homes
- Synced `plane-ownership.json` to canonical directories
- Added `check-stale-deleted-paths` CI gate
- Verdict line stays: **0 open, 0 tracked, 21/21 BLOCK GREEN** (honest now — no stale string refs anywhere except archived migration history).

Mirror to `/mnt/documents/PROJECT_TREE_AUDIT.md`.

## What this does NOT touch

- No edits to `src/lib/core-services/`, `src/packages/`, business logic, DB, edge functions, auth.
- No new folders under `src/lib/`.
- No change to the 21 BLOCK gate count.
- Migration scripts (`perform-real-migration-wave2/3.ts`) preserved as historical record (allowlisted).

## Verification after approval

```bash
grep -rE "src/lib/(canonical-backend|simulation|mock-data|demo-data|seed)/" src tests generated docs   # only archived scripts
npx tsc --noEmit                                                                                       # 0 errors
npx tsx scripts/architecture/checks/check-stale-deleted-paths.ts                                       # PASS
npx tsx scripts/architecture/checks/check-cosmetic-debt-closure.ts                                     # 14/14 PASS
npm run release:readiness                                                                              # 21/21 BLOCK GREEN
npm test -- service-flows                                                                              # passes (seed import resolved)
```

