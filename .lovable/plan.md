

# Fix CI Pipeline — Full Production-Grade GitHub Actions

## Current State

A `.github/workflows/ci.yml` exists with 9 jobs (typecheck, lint, unit-tests, security-scan, build, architecture-validation, e2e-p0, ring-promotion, launch-gate, nightly). However it has critical issues that make it non-functional for real deploys.

## Issues to Fix

1. **`|| true` on every step** — silently swallows all failures; nothing actually blocks a merge
2. **Invalid env syntax** — `${{ secrets.X || 'fallback' }}` is not valid GitHub Actions syntax; needs ternary or default env
3. **Integration tests missing** — `test:integration` suite (12 files, 79 tests) not in pipeline
4. **E2E needs a server** — CI sets `webServer: undefined` but downloads `dist/` artifact without serving it; tests will fail because no server is running
5. **No Docker build job** — Dockerfile exists but CI never builds/validates the container
6. **No deploy step** — no Lovable/Vercel/container registry push
7. **No concurrency control** — parallel runs on same branch can conflict
8. **No PR status checks** — no required status checks guidance

## Plan

### 1. Rewrite `.github/workflows/ci.yml`

**Remove `|| true`** from critical jobs (typecheck, build, unit-tests, integration-tests). Keep `|| true` only on advisory/non-blocking steps (architecture validators, nightly).

**Fix env var syntax** — replace `${{ secrets.X || 'fallback' }}` with proper defaults:
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL || '' }}
```
Use shell-level defaults: `${VITE_SUPABASE_URL:-http://localhost:8000}`

**Add integration tests job** between unit-tests and e2e:
```yaml
integration-tests:
  needs: typecheck
  steps:
    - npm ci
    - npm run test:integration
```

**Fix E2E server** — serve the `dist/` artifact with `npx serve` or `npx vite preview`:
```yaml
e2e-p0:
  steps:
    - download dist/
    - npx serve dist -l 8080 &
    - wait for server
    - PLAYWRIGHT_BASE_URL=http://localhost:8080 npx playwright test
```

**Add Docker build validation** job:
```yaml
docker-build:
  needs: build
  steps:
    - docker build -t sita-os:ci .
    - docker run --rm sita-os:ci cat /usr/share/nginx/html/health.json
```

**Add concurrency control**:
```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

**Update launch-gate** — include integration-tests in required jobs list.

### 2. Update `package.json` (no change needed — scripts already exist)

### 3. Update `playwright.config.ts` (no change needed — already handles CI)

## Jobs After Fix

| Job | Blocks merge? | Fails silently? |
|---|---|---|
| typecheck | Yes | No |
| lint | No (warning) | Yes |
| unit-tests | Yes | No |
| integration-tests | Yes | No |
| build | Yes | No |
| security-scan | Yes | No |
| e2e-p0 | No (advisory) | No |
| docker-build | No (advisory) | No |
| architecture-validation | No (advisory) | Yes |
| ring-promotion | No (main only) | Yes |
| launch-gate | Final report | No |
| nightly | Schedule only | Yes |

## Files Changed

| File | Change |
|---|---|
| `.github/workflows/ci.yml` | Full rewrite: fix env syntax, remove false `|| true`, add integration-tests + docker-build jobs, fix E2E server, add concurrency |

