# Hook & Context Ownership Hardening — Final Report

_Closed 2026-04-27. Phases 0–8 complete; CI gate is BLOCKING for both hard import boundaries AND classification drift._

## 1. Outcome

| Metric                                  | Before  | After |
|-----------------------------------------|---------|-------|
| Files in `src/contexts/`                | 23      | 12    |
| Files in `src/hooks/`                   | 211     | 74    |
| Owner-misclassified hooks in `src/hooks/` | 141   | 0     |
| Hard ownership violations (rule #51)    | n/a     | 0     |
| Soft (classification drift)             | 152     | 0     |
| TypeScript errors                       | 0       | 0     |
| Scoped vitest pass rate                 | 99/99   | 99/99 |

CI gate: `HOOK_CONTEXT_OWNERSHIP_ENFORCE` defaults to `true`.

## 2. Migrations

- **Contexts** (Phase 2–3): 11 moved to `src/modules/<pillar>/contexts/` and `src/platform/<system>/contexts/`. ~110 importers rewired.
- **Hooks** (Phase 4–5): 139 moved across 5 modules + 16 platform systems. 649 import specifiers rewritten across 487 files. 4 colocated test files relocated.

## 3. Whitelisted exceptions (`generated/manifests/hook-context-ownership-exceptions.json`)

Five hooks remain in `src/hooks/` with documented `keep-shared` rationale:

| Hook | Heuristic said | Actual reason |
|------|----------------|---------------|
| `useRealityProvider`     | platform:runtime | Owner-neutral RealityModeContext wrapper used everywhere |
| `use-flagship-loop-proof`| platform:trust   | Records receipts for ALL 5 flagship customer journeys |
| `use-domain-data`        | module:business  | Catalog hook spanning 12 owner scopes (40 importers) |
| `use-cai-data` / `useCAIData` | module:business | CAI is platform-wide ambient intelligence (23 tables) |

## 4. Constitution & validation

- **Rule #51** in `docs/architecture/REPOSITORY_CONSTITUTION.md` defines hard rules (H1, H2) and classification rules (S1, S2).
- **`docs/architecture/HOOK_AND_CONTEXT_OWNERSHIP_MODEL.md`** defines doctrine.
- **`scripts/architecture/check-hook-context-ownership.ts`** — validator (honors `rationale` ledger).
- **`.github/workflows/check-boundaries.yml`** — gate enforcing by default.

## 5. Remaining future work

- 52 pre-existing platform→pillar violations surfaced by the migration (notably `platform/sita`, `platform/boardroom`, `platform/atlas/operations`, `platform/files` calling `useBusinessProfile`/`use-crm-data`/`use-store-analytics`). These are real coupling issues, not regressions; tracked under module-ownership `--warn` until those platform pages refactor through abstracted business surfaces. Out of scope for hook/context hardening.
- `src/modules/finance/hooks/use-investment-data.ts` re-exports from `src/modules/business/hooks/use-domain-data.ts` — pre-existing finance↔business leak, now visible.

## 6. Phase 6 closure — survivor verification

- `src/hooks/` survivors: **74 files**.
- Re-emitting `generated/manifests/hook-ownership-map.json` produces:
  `{"module:business":3,"platform:runtime":1,"platform:trust":1,"shared":69}`.
- All 5 non-`shared` entries are **filename-heuristic false positives** with zero pillar/platform imports. Each is recorded in the `rationale` ledger with `decision: "keep-shared"` and is honored by the validator's classification check.
- `src/contexts/` survivors: **12 files, 100% `app-shell`**.
- Validator (`--enforce --enforce-classification`): `Hard violations: 0 / Soft violations: 0 — clean`.

## 7. Phase 7 closure — full enforcement

- `.github/workflows/check-boundaries.yml`: validator step now runs with `--enforce-classification` and defaults `HOOK_CONTEXT_OWNERSHIP_ENFORCE` to `'true'`. Both hard rules (H1, H2) AND classification rules (S1, S2) are blocking.
- Exception ledger `shims[]`: **empty**. No transitional re-export shims remain — Phases 4–5 rewrote every importer inline.
- `rationale[]`: 5 documented `keep-shared` decisions (stable).
- Manifests regenerated and committed.
- `tsc --noEmit`: 0 errors.

## 8. Phase 8 closure — memory + constitution

- This report extended with Phases 6–8 closure.
- Memory updated: new `mem://architecture/hook-context-ownership` referenced from `mem://index.md`; Core summary line refreshed.
- Constitution rule #51 already references this doc + the validator.
- Plan file `.lovable/plan.md` marked Phases 6–8 DONE.
