
# Phase 9 — Admin (Mission Control) Production-Truth Closure

Phases 1–8 closed `src/modules/business/pages/*` at **0 truth violations across 54 pages**. Phase 9 extends the same discipline to the largest remaining surface: **`src/pages/admin/`** — the Mission Control admin plane.

## What's broken today

Concrete scan of `src/pages/admin/`:

| Metric | Count |
|---|---|
| Admin page files | ~210 |
| Pages with audit-stripped shortcuts | **90** |
| Total `([] as any[]).{filter,map,length,find,…}` occurrences | **439** |
| Top-level fake-live `const X = [{...}]` arrays | 0 |

These shortcuts render UIs that **look populated but are silently empty** — KPI strips, tab lists, and tables that always read 0/show nothing because the source array is hard-coded to `[]`. Example: `AISelfHealing.tsx` has 6 such sites driving the entire page (KPI strip + 3 tab content panels). Same pattern as the ones Phase 6/7/8 fixed in Business OS.

The top-10 worst offenders account for ~125 occurrences:

```
ComputeGovernanceBoard.tsx       24
SecurityPostureBoard.tsx         13
ProofMatrixExplorer.tsx          12
APL06AppleLaunchReadiness.tsx    12
AIReleasesCenter.tsx             12
InvestorProofLedger.tsx          11
ConciergeRuntimeBoard.tsx        11
AIEngineeringBoard.tsx           11
TrustStateRegistry.tsx           10
AdminOperationsHub.tsx           10
```

## Approach — mirror the Business OS closure

### 9.1 — Manifest + checker (foundation)
- Create `src/pages/admin/PRODUCTION_TRUTH_MANIFEST.ts` listing every admin page with one of three states: `fully-wired` | `degraded` | `hidden` (same shape as the Business manifest).
- Create `scripts/architecture/check-admin-truth.ts` mirroring `check-business-truth.ts` with the same 4 rules (manifest coverage + fake-live + audit-stripped + zero-data-imports).
- Add CI gate in `.github/workflows/check-boundaries.yml` behind `ADMIN_TRUTH_ENFORCE` (off by default, flipped on once baseline is green — same lifecycle as Business gate).
- Initial classification: pages with shortcuts default to `degraded` with an honest reason; clean pages classified `fully-wired`.

### 9.2 — Wave A: top-10 worst offenders (~125 sites)
Pages: `ComputeGovernanceBoard`, `SecurityPostureBoard`, `ProofMatrixExplorer`, `APL06AppleLaunchReadiness`, `AIReleasesCenter`, `InvestorProofLedger`, `ConciergeRuntimeBoard`, `AIEngineeringBoard`, `TrustStateRegistry`, `AdminOperationsHub`.

For each: identify the intended data source (most have an obvious sibling hook — e.g. `useComputeGovernance`, `useSecurityCouncil`, `useProofMatrix`, `useAIReleases`), wire it through, and replace shortcuts with real derivations. Where no source exists yet, add an honest `EmptyStateCard` and downgrade the manifest entry to `degraded` with a written reason rather than fake-live a result.

### 9.3 — Wave B: remaining 80 admin pages (~314 sites)
Same playbook in batches of 10–15 pages. For each file:
1. Map `([] as any[])` → existing canonical hook (preferred), or
2. Add a thin new hook over the right table when the schema exists, or
3. Mark the page `degraded` with a real `EmptyStateCard` if no backend exists yet.

No new fixture data is introduced. Static UI option lists (filter chips, status enums) get extracted to `src/pages/admin/_config/<Page>.config.ts` exactly like Phase 5/6/8 did for Business OS.

### 9.4 — Verification + report
- `bunx tsx scripts/architecture/check-admin-truth.ts` → **0 violations**.
- `bunx tsc --noEmit` clean.
- New report `ADMIN_PRODUCTION_TRUTH_REPORT.md` (twin to the Business one) with phase history, snapshot table, and per-page state.
- Flip `ADMIN_TRUTH_ENFORCE=1` in CI once green.

## Honest scope boundaries

- **Schema gaps stay degraded, not faked.** If a panel needs a table that doesn't exist (e.g. some of the AND##/APL## device-specific readiness boards reference future ecosystems), the page is classified `degraded` with a written reason — we do not invent fake data to pass the checker.
- **Subdirs of `src/pages/admin/` (e.g. `admin/intelligence/`, `admin/strategic/`) are in scope.** The 90-file count includes them.
- **Other top-level `src/pages/*` subtrees stay out of scope** for Phase 9 (e.g. `pages/owner/`, `pages/mission-control/`, `pages/boardroom/`). They had **0 audit-stripped sites** in the scan, so they'd only need a manifest pass — defer to a Phase 10 if desired.
- **No behavior changes to passing pages.** Pages without shortcuts get classified into the manifest only; their code is untouched.

## Deliverables

| File | Status |
|---|---|
| `src/pages/admin/PRODUCTION_TRUTH_MANIFEST.ts` | NEW |
| `scripts/architecture/check-admin-truth.ts` | NEW |
| `.github/workflows/check-boundaries.yml` | UPDATED (admin gate added, off by default) |
| `ADMIN_PRODUCTION_TRUTH_REPORT.md` | NEW |
| `src/pages/admin/_config/*.config.ts` | NEW per page where UI constants extracted |
| New thin hooks under `src/hooks/admin/` | NEW where missing canonical source |
| ~90 admin pages | UPDATED — shortcuts replaced with real data or honest empty states |

## Suggested execution

This is large. I'll execute it in the same pattern as Phases 1→8: 
1. Land 9.1 (manifest + checker + CI gate, OFF) in one commit so we can measure progress.
2. Then ship 9.2 (wave A — top 10 pages).
3. Then iterate 9.3 in batches of ~10 pages per turn; you say "continue" between batches.
4. Final commit ships the green report and flips the CI gate ON.

Ready to start with 9.1 on approval.
