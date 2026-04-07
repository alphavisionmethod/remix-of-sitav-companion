

# Enhanced GitHub Actions: CI/CD with TSC + Vitest + Deploy Gate

## Current State

The existing `ci.yml` is already production-grade (418 lines, 12 jobs). However, it lacks:
1. **Coverage thresholds** — Vitest runs without `--coverage` or fail-on-threshold
2. **Bundle size tracking** — no check for regressions
3. **PR comment summary** — results only in artifacts, not visible on the PR
4. **Manual deploy workflow** — no `workflow_dispatch` deploy trigger (since auto-deploy is not possible)
5. **Vitest coverage config** — `vitest.config.ts` has no coverage settings

## Plan

### 1. Add coverage to `vitest.config.ts`

Add `coverage` block with `v8` provider, thresholds (lines: 40, branches: 30, functions: 35 — realistic for current codebase), and `reporter: ['text', 'json-summary', 'lcov']`.

### 2. Enhance `ci.yml` — unit-tests job

- Add `--coverage` flag to vitest run
- Upload `coverage/coverage-summary.json` as artifact

### 3. Add bundle size check job to `ci.yml`

New job `bundle-size` after `build`:
- Download the `dist` artifact
- Calculate total JS/CSS size
- Fail if total JS exceeds 5MB (configurable)
- Write size report to `$GITHUB_STEP_SUMMARY`

### 4. Add PR comment job to `ci.yml`

New job `pr-summary` (runs on PRs only, after launch-gate):
- Collects all job results
- Posts a formatted GitHub Step Summary with: typecheck status, test count, coverage %, bundle size, architecture score, launch gate status
- Uses `$GITHUB_STEP_SUMMARY` (no token needed)

### 5. Create `deploy.yml` — Manual Deploy Workflow

New workflow file `.github/workflows/deploy.yml`:
- Trigger: `workflow_dispatch` with environment input (`staging` / `production`)
- Requires all CI checks to have passed on the selected branch
- Jobs:
  1. **verify-ci** — checks that the latest CI run on the branch passed
  2. **build-deploy-artifact** — builds, generates health.json, packages dist + Docker image
  3. **deploy-staging** — (if staging) builds Docker, tags `sita-os:staging-{sha}`, pushes to registry
  4. **deploy-production** — (if production) requires manual approval via `environment: production`, builds Docker, tags `sita-os:prod-{sha}`
  5. **post-deploy-smoke** — hits health endpoint, runs quick sanity check
  6. **notify** — posts deploy summary to Step Summary

Since Lovable handles frontend publishing, the deploy workflow focuses on **Docker image builds and push to container registry** for self-hosted/VMware deployments. The `environment: production` gate ensures no accidental production deploys.

### Files

| Action | File |
|---|---|
| Modify | `vitest.config.ts` — add coverage config |
| Modify | `.github/workflows/ci.yml` — coverage flag, bundle-size job, PR summary |
| Create | `.github/workflows/deploy.yml` — manual deploy with approval gates |

