# Phase 7 — Architecture Guards (Domain Barrels, Investment Namespace, Shell Mount)

**Operating rule reaffirmed:** no duplicates, no stubs. Every new artifact extends an existing canonical system (`scripts/architecture/audits/`, `src/__tests__/`, `.github/workflows/check-boundaries.yml`) — no parallel guard infrastructure.

---

## 🎯 Goal
Lock in the Phase 1–6 invariants as **machine-enforced gates** so future regressions fail loudly:

1. No domain barrel may regress to `export {};` / empty.
2. No `/investments/*` (plural) path may re-appear in `src/routes/families/`.
3. The Investment Office shell-mount (`<InvestmentShellPage>` parent → `<Outlet/>` children) must remain the single composition path for both investment route families.

All three are enforceable from existing infrastructure — no new directories, no new CI workflow files.

---

## ✅ Pre-flight verification (already confirmed via read-only inspection)

| Item | State |
|---|---|
| `scripts/architecture/audits/` | ✅ exists (canonical home for new audit scripts) |
| `src/__tests__/architecture/` | ❌ does not yet exist — will be created (canonical pattern: siblings like `routes/`, `services/`, `platform/` already exist under `src/__tests__/`) |
| `.github/workflows/check-boundaries.yml` | ✅ canonical CI surface for architecture gates — extend, do not fork |
| `src/domains/{concierge,finance,investment,business}/index.ts` | ✅ all populated (Phases 1–3) — guard codifies that state |
| `src/routes/families/{investment-routes,investment-office-routes,experimental-routes}.tsx` | ✅ no plural `/investments` path remains (Phase 5) — guard locks it in |
| `src/App.tsx` shell-mount block | ✅ wraps both families under `<Route element={<InvestmentShellPage />}>` (Phase 6) — test asserts it |

---

## 📐 Deliverables

### A. Three new audit scripts (under existing `scripts/architecture/audits/`)

#### A.1 `scripts/architecture/audits/check-no-empty-domain-barrels.ts`
- Walk `src/domains/*/index.ts` (one level deep — engines/contracts subfolders excluded; only top-level domain barrels).
- For each barrel: parse with `ts.createSourceFile`, count `ExportDeclaration` / `ExportAssignment` / re-export nodes after stripping comments.
- **Fail (exit 1)** if a barrel has zero real exports OR matches the literal pattern `^\s*export\s*\{\s*\}\s*;?\s*$` after stripping comments.
- Emit a JSON report to `generated/empty-domain-barrels-report.json` (matches the convention already used by other audits — see `generated/boundary-check-report.json`).

#### A.2 `scripts/architecture/audits/check-investment-route-namespace.ts`
- `rg`-equivalent scan (using `fs` + glob over `src/routes/families/*.tsx`).
- **Fail (exit 1)** if any line matches `path=["']/investments(/|["'])` (plural). Singular `/investment` is the canonical namespace.
- Also scan `src/App.tsx` and `src/routes/registry/route-family-registry.ts` for the same pattern (defense-in-depth — Phase 5 cleanup touched these).
- Emit `generated/investment-route-namespace-report.json` with violation list.

#### A.3 No third script needed — Phase 4 already has `check-engine-purity.ts`. The plan originally listed a third audit for shell-mount but a **Vitest spec is the correct tool** for that (renders React tree); see B.3. Documented here so we do not invent a parallel runtime check.

### B. Three new Vitest specs (under new dir `src/__tests__/architecture/`)

#### B.1 `src/__tests__/architecture/domain-barrels.test.ts`
- Dynamic `import("@/domains/concierge")`, `@/domains/finance`, `@/domains/investment`, `@/domains/business`.
- Assert each module's exported keys count is `> 0`.
- Also: invoke the audit script in-process via `execSync("npx tsx scripts/architecture/audits/check-no-empty-domain-barrels.ts")` and assert exit code `0` — same pattern used by `service-boundary-truth.test.ts`.

#### B.2 `src/__tests__/architecture/investment-route-namespace.test.ts`
- Read every `src/routes/families/*.tsx` via `fs.readFileSync`.
- Assert no occurrence of regex `/path=["']\/investments(\/|["'])/`.
- Also assert exit `0` from `check-investment-route-namespace.ts`.

#### B.3 `src/__tests__/architecture/investment-shell-mount.test.ts`
- Pure source-level assertion (avoids React Router test rig overhead, matches conventions in `route-family-completeness.test.ts`):
  - Read `src/App.tsx`.
  - Assert it contains a `<Route element={<InvestmentShellPage` opening tag.
  - Assert that within that block both `getInvestmentRoutes()` and `getInvestmentOfficeRoutes()` are invoked as children.
  - Assert `InvestmentShellPage` source contains `<Outlet`.
- This guarantees the App-in-OS pattern from Phase 6 cannot be silently flattened.

> Note: `.test.ts` (not `.tsx`) because we are doing static source assertions, not JSX rendering — keeps the test fast and avoids pulling in the full router context.

### C. CI wiring (extend, do not fork)

Edit `.github/workflows/check-boundaries.yml` and add two new steps **inside the existing `boundary-check` job**, immediately after the engine-purity step:

```yaml
- name: Run domain barrel non-empty checker
  run: npx tsx scripts/architecture/audits/check-no-empty-domain-barrels.ts

- name: Run investment route namespace checker
  run: npx tsx scripts/architecture/audits/check-investment-route-namespace.ts
```

Also extend the artifact upload block to include the two new JSON reports (single additional `actions/upload-artifact` step or expanded `path:`).

No new workflow file. No new job. No parallel CI surface.

### D. Plan documentation

- Update `.lovable/plan.md` Phase 7 section to ✅ COMPLETE with the artifact list above.

---

## 🚦 Phase 7 Gate (must all pass before Phase 8)

| Check | Pass criterion |
|---|---|
| `npx tsc --noEmit` | 0 new errors |
| `npx tsx scripts/architecture/check-engine-purity.ts` | exit 0 |
| `npx tsx scripts/architecture/audits/check-no-empty-domain-barrels.ts` | exit 0 |
| `npx tsx scripts/architecture/audits/check-investment-route-namespace.ts` | exit 0 |
| `npx vitest run src/__tests__/architecture/` | all 3 specs green |
| `.github/workflows/check-boundaries.yml` | parses (`yamllint`-equivalent / GitHub schema OK), 2 new steps present |
| Anti-duplication audit | no new directory under `scripts/architecture/`, no new workflow file, no new test top-level dir beyond the single `architecture/` subfolder under existing `src/__tests__/` |

---

## 📦 Exact File Inventory

**Created (5 files, all in canonical existing dirs):**
- `scripts/architecture/audits/check-no-empty-domain-barrels.ts`
- `scripts/architecture/audits/check-investment-route-namespace.ts`
- `src/__tests__/architecture/domain-barrels.test.ts`
- `src/__tests__/architecture/investment-route-namespace.test.ts`
- `src/__tests__/architecture/investment-shell-mount.test.ts`

**Modified (2 files):**
- `.github/workflows/check-boundaries.yml` (2 new steps + report upload)
- `.lovable/plan.md` (mark Phase 7 ✅ COMPLETE)

**Removed:** none.

**Not created (intentionally — would have been duplicates):**
- ❌ No new GitHub workflow file (extend `check-boundaries.yml`).
- ❌ No new top-level `scripts/guards/` or `scripts/architecture/guards/` directory (use existing `audits/`).
- ❌ No third "shell-mount audit script" (the Vitest spec covers it correctly).

---

Phase 7 will be fully wired and green before Phase 8 (Documentation + Deployment Readiness) begins.
