# File Removal Safety Policy

**Status:** Active — enforced by `check-safe-cleanup-regressions.ts`
**Pass:** Audit-only (zero removals); policy applies to any future removal pass.

## The 9-check policy

A file may be removed **only if all 9 checks return zero references**:

1. **Static ESM imports** — `grep -r "from .*<basename>" src/ scripts/ supabase/`
2. **Dynamic imports** — `grep -r "import(.*<basename>)" src/ scripts/`
3. **Route registry** — file path absent from `src/router/*` and any route truth manifest
4. **CI workflow refs** — file path absent from `.github/workflows/*.yml`
5. **npm script refs** — file path absent from `package.json` `scripts` block
6. **Validator/generator refs** — file path absent from `scripts/validation/`, `scripts/architecture/`
7. **Documentation refs** — file path absent from `docs/**` and root `*.md`
8. **Generated manifest refs** — file path absent from `generated/**/*.json` consumers
9. **Edge-function invocation refs** — for edge fns: name absent from `supabase.functions.invoke(...)` call sites

## What "removal" means

- Hard deletion of source files is **not permitted** in audit passes.
- "Archive" is the safe equivalent: move to `archive/<area>/<date>/` and update generators to skip the new path.
- Relabeling (e.g. mark canonical vs noncanonical) is preferred over either deletion or archiving.

## Override procedure

1. Open a removal proposal that lists each of the 9 checks with current evidence.
2. Run `check-safe-cleanup-regressions.ts` and confirm green.
3. Build + render smoke + edge-function contract tests must pass post-removal.
4. Update this policy with the precedent.

## Rationale

Mass-deletion based on naming or folder placement is the single largest source of deployment regressions in large surfaces. This policy makes removal expensive on purpose so that **architectural canonicalization** (consolidation, relabeling, archiving) becomes the default, and removal becomes a deliberate, evidence-backed decision.
