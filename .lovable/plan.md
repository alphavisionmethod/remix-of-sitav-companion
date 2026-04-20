

## Diagnosis (verified on disk)

You want the three Section A items physically eliminated, not just attested. Current real state:

- **#3 Legacy mirrors** — Already gone. `src/legacy/` is empty. ✅ truly fixed.
- **#2 No `src/services/`** — `src/services/index.ts` exists and re-exports core/data/platform. ✅ truly fixed (one gap: it omits `os-services`).
- **#1 `src/lib/` sprawl** — Still real. `src/lib/` has **75 top-level entries**. The five "relocated" folders (`canonical-backend`, `simulation`, `demo-data`, `mock-data`, `seed`) still physically exist as ~38 shim files in `src/lib/` because **48 consumers across 138 files still import via `@/lib/...`**. Until consumers migrate, the shims stay and `src/lib` doesn't actually shrink.

So the only honest "100% fix" left is: **rewrite the consumer imports**, then **delete the shims**.

## Plan — Real shrinkage of `src/lib/` + complete `src/services/` façade

### Step 1 — Codemod consumer imports to canonical paths
Run a project-wide search-and-replace across `src/`, `scripts/`, and tests:

| From | To |
|---|---|
| `from "@/lib/canonical-backend"` | `from "@/integrations/canonical-backend"` |
| `from "@/lib/simulation/...` | `from "@/domains/simulation/...` |
| `from "@/lib/mock-data/...` | `from "@/data/fixtures/mock-data/...` |
| `from "@/lib/demo-data` | `from "@/data/fixtures/demo-data` |
| `from "@/lib/seed` | `from "@/data/fixtures/seed` |

Estimated reach: ~48 files, ~285 import lines. Pure path rewrites — no logic changes.

### Step 2 — Delete the shim folders
Once Step 1 is complete and `npx tsc --noEmit` is green, physically delete:
- `src/lib/canonical-backend/` (1 shim file)
- `src/lib/simulation/` (3 shim files)
- `src/lib/mock-data/` (~28 shim files)
- `src/lib/demo-data/` (2 shim files)
- `src/lib/seed/` (4 shim files)

`src/lib/` drops from **75 → 70 top-level entries**, ~38 fewer files. Real shrinkage.

### Step 3 — Complete the `src/services/` façade (all layers)
Update `src/services/index.ts` to add the missing OS-services layer so it's the single navigable root:

```ts
export * from "@/lib/core-services";       // Layer 2 — Domain
export * from "@/lib/data-services";       // Layer 4 — Data
export * as OS from "@/lib/os-services";   // Layer 3 — OS daemons (namespaced)
export * as Platform from "@/packages";    // Layer 1 — Core Platform
```

(OS and Platform are namespaced to prevent name collisions across ~33 OS daemons.)

### Step 4 — Update validators to assert physical deletion (not shim-presence)
Rewrite `scripts/architecture/checks/check-cosmetic-debt-closure.ts` so the A1 assertions invert:
- **mustExist:false** for `src/lib/canonical-backend`, `src/lib/simulation`, `src/lib/mock-data`, `src/lib/demo-data`, `src/lib/seed`
- **mustExist:true** for the canonical homes (already verified)
- A2 assertion expanded to require the four-layer façade

This makes "shims still around" a CI failure instead of a passing state.

### Step 5 — Re-baseline `lib-canonicality-baseline.json`
After deletions land, regenerate the baseline so the new (smaller) `src/lib/` becomes the locked ceiling. Future regressions blocked by `check-residual-lib-canonicality`.

### Step 6 — Update `PROJECT_TREE_AUDIT.md`
Section A → all 3 items "✅ Physically Eliminated" with concrete deltas:
- "src/lib/ subdirs: 75 → 70 (5 service-shaped folders deleted, not shimmed)"
- "src/services/ façade now spans all 4 layers (core, data, os, platform)"
- "src/legacy/ empty (verified)"

Appendix: corrected counts. Mirror to `/mnt/documents/PROJECT_TREE_AUDIT.md`.

## What this does NOT change

- No edits to `src/lib/core-services/`, `src/lib/services/`, `src/packages/`, or any business logic
- No DB migrations, edge functions, or auth changes
- No change to the 21 BLOCK gate count (cosmetic-debt-closure remains a composite under `lib-ownership-drift`)
- No edits to `src/integrations/supabase/{client,types}.ts`

## Verification after approval

```bash
ls src/lib/canonical-backend src/lib/simulation src/lib/mock-data src/lib/demo-data src/lib/seed 2>&1   # all "No such file"
ls src/lib | wc -l                                                                                       # 70
grep -r "@/lib/canonical-backend\|@/lib/simulation\|@/lib/mock-data\|@/lib/demo-data\|@/lib/seed" src    # 0 hits
npx tsc --noEmit                                                                                          # 0 errors
npx tsx scripts/architecture/checks/check-cosmetic-debt-closure.ts                                        # PHYSICAL deletions verified
npm run release:readiness                                                                                 # 21/21 BLOCK GREEN
```

Audit document then matches disk: **5 folders deleted, façade complete, 0 open items**.

