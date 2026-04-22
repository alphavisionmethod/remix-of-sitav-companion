

# Phase-by-Phase Deployment-Readiness Verification System

This plan adds only the missing or materially insufficient tests identified after a full inventory of the existing 360 test files, 695 check-* validators, 32 assert-* scripts, and 66 E2E specs. No duplication of existing strong coverage.

---

## Phase 1: Edge Function Coverage Expansion

**Problem**: Only 7 of 203 edge functions have tests (3.4%). This is the single largest coverage gap.

**Files to create:**
- `src/__tests__/edge-functions/ef-critical-smoke.test.ts` — Smoke-level structural tests for the 20 highest-priority edge functions (ai-gateway, boardroom-session, brain-core, admin-gateway, agent-executor, advisor-conversation, webhook-retry-processor, alert-router, app-store-api, cashflow-calculate, etc.). Validates: index.ts exists, has Deno.serve, has CORS, has error handling try/catch, has input validation patterns, has proper createClient usage.
- `src/__tests__/edge-functions/ef-cron-schedule-verification.test.ts` — Validates all cron-wired edge functions (referenced in `_owners.json` or function names ending in `-cron`, `-nightly`) actually exist on disk and have proper scheduling metadata.
- `src/__tests__/edge-functions/ef-auth-model-verification.test.ts` — Cross-references the edge function registry's authModel field against actual code: service-role functions use SERVICE_ROLE_KEY, anon functions don't require auth headers, jwt-verified functions check Authorization.
- `src/__tests__/edge-functions/ef-receipt-emission.test.ts` — Validates that functions tagged with `emitsReceipt: true` in the registry actually import and call receipt emission helpers from `_shared/`.

**Existing coverage retained**: ef-structural-verification.test.ts, ef-contract-consistency.test.ts, ef-registry-completeness.test.ts, ef-topology-integrity.test.ts — all strong, not duplicated.

---

## Phase 2: Page Completeness and Route Truth

**Problem**: 1092 pages exist but no test validates they all export a valid default React component. Existing page tests cover specific batches but not universal export validation.

**Files to create:**
- `src/__tests__/pages/page-export-completeness.test.ts` — Scans all `src/pages/**/*.tsx` files, dynamically imports each, asserts `module.default` is a function. Uses tolerance for known exceptions (index re-exports, layout wrappers). This is the "no stub/dead page" gate.
- `src/__tests__/routes/route-page-alignment.test.ts` — Cross-references all route definitions in `src/routes/*.tsx` against actual page files to detect orphan routes (route with no page) and orphan pages (page with no route). Improves on existing `check-orphan-pages.sh` by running in Vitest with structured output.

**Existing coverage retained**: route-truth.test.ts, route-coverage.test.ts, pages-structure.test.ts, all admin-pages-batch*.test.tsx — strong, not duplicated.

---

## Phase 3: Deployment Meta-Gate Test

**Problem**: No single test aggregates all deployment gates (build, typecheck, validators, architecture, security) into a unified pass/fail with structured output.

**Files to create:**
- `src/__tests__/deployment/deployment-readiness-gate.test.ts` — Master aggregation test that:
  1. Validates `generated/deployment-readiness-report.json` exists and has `deploymentReady: true`
  2. Validates all required generated artifacts exist (service-manifest.json, route-manifest.json, capability-index.json, validation-summary.json)
  3. Validates no generated artifact is older than 7 days (staleness gate)
  4. Checks package.json has all required CI scripts (build, test, typecheck, lint, ci, pre-deploy)
  5. Validates tsconfig.json/tsconfig.app.json exist and have strict mode
  6. Validates vite.config.ts exists
  7. Validates all CI workflow files are valid YAML (parse test)

**Existing coverage retained**: check-deployment-readiness.ts script, pre-deploy.sh — retained as runtime validators. This test adds Vitest-level CI-gate verification.

---

## Phase 4: Environment and Configuration Contract Tests

**Problem**: No Vitest test validates the env contract (required VITE_ variables, .env structure, config.toml integrity).

**Files to create:**
- `src/__tests__/config/env-config-contract.test.ts` — Validates:
  1. All `import.meta.env.VITE_*` references across src/ resolve to declared variables
  2. supabase/config.toml exists and has valid project_id
  3. No hardcoded Supabase URLs or keys in source (except test fixtures)
  4. package.json engine field and Node version alignment
  5. TypeScript strict mode is enabled
  6. All `tsconfig*.json` files parse correctly

**Existing coverage retained**: check-env-contract-completeness.ts — script-level validator retained. This adds Vitest gate.

---

## Phase 5: Migration and Database Contract Tests

**Problem**: Existing migration tests check sequence and ownership but not rollback safety or naming convention enforcement.

**Files to create:**
- `src/__tests__/db/migration-safety.test.ts` — Validates:
  1. No migration contains `DROP TABLE` without `IF EXISTS`
  2. No migration contains `ALTER DATABASE`
  3. No migration modifies reserved schemas (auth, storage, realtime, supabase_functions, vault)
  4. All migrations follow timestamp naming convention
  5. No duplicate migration timestamps
  6. No migration references tables not yet created (forward-reference detection via ordered scan)

**Existing coverage improved**: migration-sequence-integrity.test.ts and migration-ownership-integrity.test.ts remain. This adds safety-specific checks they lack.

---

## Phase 6: Connector and Provider Behavioral Tests

**Problem**: No Vitest test validates OAuth token structures, refresh patterns, or degraded provider handling.

**Files to create:**
- `src/__tests__/connectors/connector-behavioral.test.ts` — Validates:
  1. Connector registry exports have required fields (id, name, provider, authType, status)
  2. OAuth connectors declare refreshEndpoint and tokenExpiryField
  3. All connectors have a degraded/offline fallback mode declared
  4. Connector client registry aligns with connector catalog (no orphan clients)
  5. Webhook-capable connectors declare ingest endpoint and retry policy

**Existing coverage retained**: connector-system.test.ts, check-connector-catalog.ts, check-connector-reality.ts — retained and not duplicated. This adds behavioral contract validation they lack.

---

## Phase 7: Security and Trust Behavioral Tests

**Problem**: Existing security tests cover RLS and auth contracts but lack kill-switch toggle behavioral validation and admin boundary enforcement testing.

**Files to create:**
- `src/__tests__/security/security-fabric-behavioral.test.ts` — Validates:
  1. All kill-switch IDs are unique and have valid enforcement layer references
  2. Admin-only routes are wrapped in PermissionGatedRoute (import scan)
  3. No page in src/pages/admin/ is accessible without auth guard (import pattern check)
  4. All storage bucket references use the hardened 'app-assets' bucket name
  5. No `as any` assertions exist in src/pages/ (reinforces type-safety gate)
  6. No localStorage/sessionStorage used for role/permission checks

**Existing coverage retained**: kill-switch-enforcement.test.ts, auth-contracts.test.ts, rls-policy-behavioral.test.ts — all retained. This adds fabric-level behavioral checks.

---

## Phase 8: AI, Advisor, and Boardroom Behavioral Tests

**Problem**: Existing tests cover advisor identity and escalation but lack AI budget enforcement behavioral testing and advisor fallback/degraded mode testing.

**Files to create:**
- `src/__tests__/ai/ai-behavioral-safety.test.ts` — Validates:
  1. AI refusal policy registry covers all 15 declared capabilities
  2. Budget enforcement config has valid cost caps per tier
  3. Model router has fallback chains for every primary model
  4. Advisor identity registry has all 34 advisors with required fields
  5. Boardroom consensus requires minimum quorum (configurable, default 3)
  6. Receipt/provenance emission is declared for all AI action types
  7. Degraded AI runtime has honest "limited capability" messaging

**Existing coverage retained**: advisor-council-protocol.test.ts, advisor-escalation.test.ts, boardroom.test.ts, model-router.test.ts, refusal-receipts.test.ts, no-hallucination*.test.ts — all retained. This adds budget and degraded-mode gaps.

---

## Phase 9: CI Workflow Integrity Tests

**Problem**: No test validates that all 21 CI workflow YAML files parse correctly and reference existing scripts.

**Files to create:**
- `src/__tests__/ci/workflow-integrity.test.ts` — Validates:
  1. All `.github/workflows/*.yml` files parse as valid YAML
  2. Referenced npm scripts exist in package.json
  3. No workflow references a Node version below 20
  4. All workflows have timeout-minutes set (no runaway jobs)
  5. All workflows have concurrency groups (no duplicate runs)
  6. Composite actions in `.github/actions/` parse correctly

**No existing equivalent**: check-workflow-governance.ts is advisory-only and doesn't validate YAML parsing or script references.

---

## Phase 10: Wiring and Meta-Regression Prevention

**Problem**: Need validators to prevent regressions on test coverage itself and generated artifact drift.

**Files to create:**
- `src/__tests__/meta/test-coverage-regression.test.ts` — Validates:
  1. Minimum test file count baseline (currently 360, gate at 350)
  2. Minimum E2E spec count baseline (currently 66, gate at 60)
  3. Minimum check-* validator count baseline (currently 695, gate at 680)
  4. All test directories have at least 1 test file (no empty __tests__ dirs)
  5. No test file is empty (>10 lines each)
  6. Generated artifacts directory exists with minimum file count

- `src/__tests__/meta/generated-artifact-freshness.test.ts` — Validates:
  1. All JSON files in generated/ parse correctly
  2. No generated file has `ok: false` (aggregated truth gate)
  3. Key artifacts exist: deployment-readiness-report.json, service-manifest.json

**Wiring**: Add a `test:deployment-readiness` script to package.json:
```
"test:deployment-readiness": "vitest run src/__tests__/deployment/ src/__tests__/meta/ src/__tests__/ci/ src/__tests__/security/security-fabric-behavioral.test.ts"
```

---

## Summary: What Gets Added

| Phase | Files | Purpose |
|-------|-------|---------|
| 1 | 4 test files | Edge function coverage from 3.4% to ~15% structural |
| 2 | 2 test files | Universal page export + route alignment validation |
| 3 | 1 test file | Deployment meta-gate aggregation |
| 4 | 1 test file | Env/config contract in Vitest |
| 5 | 1 test file | Migration safety checks |
| 6 | 1 test file | Connector behavioral contracts |
| 7 | 1 test file | Security fabric behavioral validation |
| 8 | 1 test file | AI/advisor behavioral safety |
| 9 | 1 test file | CI workflow YAML integrity |
| 10 | 2 test files + 1 script | Meta-regression prevention + wiring |

**Total**: 15 new test files, 1 new npm script. Zero duplication of existing strong coverage.

## Externally Blocked Coverage

- **Live RLS policy testing**: Requires running database — verified structurally via registry, not at runtime
- **Edge function HTTP smoke tests**: Require deployed functions with valid credentials — deferred to Playwright E2E
- **OAuth token refresh**: Requires real provider credentials — connector registry contract tested structurally
- **Desktop/mobile native builds**: Require platform toolchains — readiness gates exist as script validators
- **SAST/DAST scanning**: Requires external security tooling — npm audit and RLS checks serve as proxy

## How to Run

```bash
# Full deployment readiness (new)
npm run test:deployment-readiness

# Existing full suite (unchanged)
npm run ci
npm run validate:all
npm run release:readiness:full
npm run pre-deploy
```

