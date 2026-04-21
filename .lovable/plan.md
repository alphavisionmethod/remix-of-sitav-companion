

## Wave 16 — Edge Function Canonical Reduction and Proof Closure

### Summary

The project already has a strong edge function governance layer in `src/lib/backend-topology/` (14 files: registry with 11-field topology for ~193 functions, auth-map, contract-map, table-io-map, replay-map, policy-map, owner-map with kill-switch/runbook refs, runtime-consequence-map, migration-map, frontend-action-api-map, bounded-contexts, categories, topology-validator). Shared helpers exist in `supabase/functions/_shared/` (19 files: function-role-contract, auth, cors, logger, policy, rate-limit, kill-switch, tracing, validate, zod-validate, audit-logger, ai-budget-check, etc.).

What is missing: caller-class contract in `_shared/`, support-diagnostics hook, contract-test registry, and 11 generated proof artifacts plus 7 validators that enforce closure across role purity, caller matrix, backend mapping, proof coverage, kill-switch/retry/fallback, auth patterns, and contract tests.

This wave extends the existing canonical system. No second governance platform.

---

### Phase A — Caller, Support, and Test Contracts in _shared (3 files)

**1. `supabase/functions/_shared/function-caller-contract.ts`**
- Imports `CallerClass` type from the registry (duplicated locally for Deno runtime since _shared cannot import from src/)
- Declares canonical caller-class taxonomy (12 classes matching `CallerClass` in registry)
- Exports `validateCallerClass(req, allowedCallers)` helper that checks request origin headers and JWT claims against allowed callers
- Returns structured rejection with caller-class mismatch diagnostics

**2. `supabase/functions/_shared/function-support-diagnostics.ts`**
- Exports `emitSupportDiagnostic(functionName, correlationId, input, output, duration, error?)` helper
- Applies redaction rules (strips PII, tokens, secrets from input/output snapshots)
- Produces structured diagnostic envelope with trace linkage, timestamp, and incident-ready format
- Exports `SUPPORT_DIAGNOSTIC_FUNCTIONS` set listing the ~30 critical functions that must always emit diagnostics

**3. `supabase/functions/_shared/function-contract-test-registry.ts`**
- Declares contract-test families: `bff-contract`, `admin-gateway-contract`, `orchestration-step-contract`, `webhook-validation`, `runtime-system`, `verifier-output`, `support-tool`, `domain-function`
- Maps each function to its test family
- Exports `getContractTestFamily(functionName)` and `CONTRACT_TEST_FAMILIES` registry
- Used by validator to check coverage

### Phase B — Generated Proof Artifacts (1 generator script)

**4. `scripts/edge-functions/generate-edge-function-proof-artifacts.ts`**
- Single generator that imports from `src/lib/backend-topology/` (registry, auth-map, contract-map, table-io-map, replay-map, policy-map, owner-map, runtime-consequence-map, frontend-action-api-map)
- Generates 11 artifacts into `generated/`:

  - `edge-function-topology-v2.json` -- REPLACE existing stub with real topology from registry (role distribution, receipt coverage, per-function entries)
  - `function-caller-matrix.json` -- per-function: allowed callers, auth pattern, admin-only flag, source routes (from frontend-action-api-map)
  - `function-proof-coverage.json` -- per-function: has receipts, has logging, has support diagnostics, has kill-switch ref, has retry policy, has fallback, has contract test family
  - `function-domain-map.json` -- per-function: bounded context, owner team, dependent tables (reads/writes)
  - `function-dependent-table-map.json` -- inverse: per-table, which functions read/write it
  - `function-kill-switch-coverage.json` -- per-function: kill-switch ref from owner-map, coverage status
  - `function-retry-fallback-audit.json` -- per-function: replay-map entry, fallback available from runtime-consequence-map
  - `function-supportability-report.json` -- per-function: has support diagnostics, has runbook ref, has on-call, blast radius
  - `function-contract-test-coverage.json` -- per-function: test family assignment, has on-disk test file
  - `function-auth-pattern-audit.json` -- per-function: auth model, requires user context, admin-only, consistency check
  - `function-logging-receipt-audit.json` -- per-function: audit-log policy from policy-map, side-effect class, receipt expectations

### Phase C — Validators (7 scripts)

**5. `scripts/edge-functions/checks/check-edge-function-role-purity.ts`** -- BLOCK
- Verifies every active function in registry has exactly one canonical category
- Flags deprecated/wrapper functions that still receive direct traffic
- Checks role matches allowed-callers consistency (e.g., PUBLIC_BFF must allow frontend-user)

**6. `scripts/edge-functions/checks/check-edge-function-caller-matrix.ts`** -- ADVISORY
- Verifies every active function declares at least one allowed caller
- Flags functions with overly permissive "any-authenticated" without justification
- Cross-references frontend-action-api-map to ensure UI actions target real functions

**7. `scripts/edge-functions/checks/check-edge-function-backend-mapping.ts`** -- ADVISORY
- Verifies every active function has bounded-context and owner in registry
- Verifies table-io-map coverage for non-wrapper functions
- Flags orphan functions (on-disk but not in registry)

**8. `scripts/edge-functions/checks/check-edge-function-proof-coverage.ts`** -- BLOCK
- Verifies high-side-effect and critical functions have: receipt expectations, replay entry, kill-switch ref where applicable
- Computes proof coverage percentage; blocks if below 80% for critical functions

**9. `scripts/edge-functions/checks/check-edge-function-kill-switch-retry.ts`** -- ADVISORY
- Verifies orchestration and webhook functions have replay-map entries
- Verifies critical functions have kill-switch refs
- Flags functions with `fallbackAvailable: false` and no retry mechanism

**10. `scripts/edge-functions/checks/check-edge-function-auth-patterns.ts`** -- ADVISORY
- Verifies auth-map coverage matches registry (every active function has auth entry)
- Flags admin functions without `adminOnly: true`
- Flags anon functions that write to sensitive tables

**11. `scripts/edge-functions/checks/check-edge-function-contract-tests.ts`** -- ADVISORY
- Scans `supabase/functions/*/` for `*_test.ts` or `*.test.ts` files
- Cross-references contract-test-registry for family coverage
- Reports per-family coverage percentage

### Phase D — Barrel, Gate Registration, and Verification

- Create `scripts/edge-functions/checks/` directory structure
- Register `edge-function-role-purity` and `edge-function-proof-coverage` as BLOCK gates in release readiness
- Register 5 ADVISORY gates
- Run `npx tsc --noEmit` -- zero errors
- Run all 7 validators -- all green
- Verify 11 generated artifacts are structurally complete

### No-Duplication Enforcement

- All generators import from existing `src/lib/backend-topology/` registries -- no second registry
- `function-caller-contract.ts` in `_shared/` mirrors `CallerClass` from registry for Deno runtime but is the canonical runtime enforcer
- `edge-function-topology-v2.json` replaces existing stub in `public/generated/`
- No new maps duplicate existing `edge-function-auth-map`, `edge-function-policy-map`, `edge-function-replay-map`, or `edge-function-owner-map`
- Validators consume the same registries used by existing `edge-function-topology-validator.ts`

### Deployment Closure Checklist

- [ ] ~193 functions have canonical role in registry (already done)
- [ ] Caller-class contract helper in `_shared/`
- [ ] Support diagnostics helper in `_shared/`
- [ ] Contract-test registry in `_shared/`
- [ ] 11 generated proof artifacts covering role, caller, domain, tables, kill-switch, retry, auth, receipts, support, tests
- [ ] 7 validator scripts (2 BLOCK + 5 ADVISORY) all green
- [ ] TypeScript builds with 0 errors
- [ ] No duplicate edge function governance systems

