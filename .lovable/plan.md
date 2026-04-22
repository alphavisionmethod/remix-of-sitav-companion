
# Edge Functions and UI Components — Full 100/100 Behavioral Verification

## Summary

The project has 202 edge functions on disk but only 88 in the topology registry (43% coverage). For UI components, 1,001 component files exist with only ~73 test files (7% coverage). This plan closes both gaps through registry regeneration, comprehensive behavioral test suites, and automated smoke-test generation.

---

## Part A: Edge Functions (95% Structural → 100%, 10% Behavioral → 100%)

### A1. Regenerate Edge Function Registry to Cover All 202 Functions

117 edge functions exist on disk but are missing from `EDGE_FUNCTION_REGISTRY`. Each must be added with full 11-field topology metadata.

**File**: `src/lib/backend-topology/edge-function-registry.ts`
- Expand from 88 entries to 202 entries
- Each new entry classified with: id, name, path, runtime, status, description, category, boundedContext, owner, authModel, requestContract, responseContract, sideEffectClass, allowedCallers, callsInto, runtimeConsequence, migrationStatus

**Satellite maps** must also be regenerated to cover all 202:
- `edge-function-categories.ts` (currently 87 → 202)
- `edge-function-auth-map.ts` (currently 87 → 202)
- `edge-function-bounded-contexts.ts` (currently ~87 → 202)
- `edge-function-owner-map.ts` (currently ~87 → 202)
- `edge-function-contract-map.ts` (currently ~87 → 202)
- `edge-function-migration-map.ts` (currently ~87 → 202)

Classification will be derived by reading each function's `index.ts` to determine its domain, auth pattern, and side effects.

### A2. Edge Function Behavioral Test Suite

**New file**: `src/__tests__/edge-functions/ef-registry-completeness.test.ts`
- Assert every on-disk function directory with `index.ts` exists in `EDGE_FUNCTION_REGISTRY` (0 orphans)
- Assert every registry entry has a corresponding on-disk `index.ts` (0 phantoms)
- Assert all 6 satellite maps cover every registry entry (0 gaps)
- Assert registry count >= 200

**New file**: `src/__tests__/edge-functions/ef-topology-integrity.test.ts`
- Run the existing `validateTopology()` function and assert `valid === true` with 0 errors
- Assert BFF purity (no BFF calls RUNTIME_SYSTEM_FUNCTION)
- Assert all `callsInto` targets exist in registry
- Assert all `allowedCallers` are from the known caller class set
- Assert no function has empty `allowedCallers`

**New file**: `src/__tests__/edge-functions/ef-structural-verification.test.ts`
- For every registered function, verify `index.ts` contains CORS handling (`corsHeaders` or `Access-Control`)
- Verify service-role functions use `SUPABASE_SERVICE_ROLE_KEY` not anon key
- Verify JWT-authenticated functions contain auth header validation
- Verify every function exports a `Deno.serve` handler
- Assert no function imports from `src/integrations/supabase/client` (forbidden in edge context)

**New file**: `src/__tests__/edge-functions/ef-contract-consistency.test.ts`
- For functions declaring `requestContract` / `responseContract`, verify the contract type names exist in a contracts directory or type file
- Assert auth map `adminOnly` entries match functions in `admin-plane` bounded context
- Assert `sideEffectClass: "high"` functions have non-empty `callsInto` or write-path documentation

### A3. Authority Map Sync

**File**: `src/lib/migration/edge-function-authority-map.ts`
- Ensure this 87-entry map is also updated to 202 to keep the existing topology test green

### A4. Update Existing Topology Test Thresholds

**File**: `src/__tests__/edge-function-topology.test.ts`
- Change orphan coverage threshold from `>= 0.8` to `>= 0.98` (near-zero orphan tolerance)
- Add assertion that authority map count >= 200

---

## Part B: UI Components (95% Structural → 100%, 5% Behavioral → 100%)

### B1. Automated Component Smoke Test Generator

Rather than writing 1,001 individual test files, create a single automated test generator that produces bulk smoke tests grouped by domain.

**New file**: `src/__tests__/components/component-smoke-generator.test.tsx`
- Scan all 39 component domains (`src/components/*`)
- For each domain directory, dynamically import every `.tsx` file
- Attempt `render(<Component />)` with fallback props where needed
- Assert `container.firstChild` is not null (component renders without crash)
- Group by domain with descriptive test names

This single file will produce ~1,001 dynamic test cases.

### B2. Domain-Specific Component Tests (High-Value)

Create targeted test files for the most critical component domains:

**New file**: `src/__tests__/components/primitives-coverage.test.tsx`
- Test all 15 canonical primitives from `CANONICAL_PRIMITIVES` registry
- Verify each accepts its documented props
- Verify no primitive imports domain logic (purity check via import analysis)

**New file**: `src/__tests__/components/auth-components.test.tsx`
- Test auth forms (login, signup, password reset) render correctly
- Test form validation states
- Test error message display

**New file**: `src/__tests__/components/ui-library-coverage.test.tsx`
- Test all shadcn/ui components in `src/components/ui/`
- Verify each exported component renders
- Currently only 11 tested; expand to full coverage

### B3. Component Registry Behavioral Verification

**New file**: `src/__tests__/components/component-registry-behavioral.test.ts`
- Verify every entry in `CANONICAL_PRIMITIVES` resolves to a file on disk
- Verify component classification rules (PURITY_RULES) — no primitive imports domain/service code
- Verify all valid suffixes in `VALID_SUFFIXES` are used by at least one component
- Cross-reference `component-registry.json` against actual disk state

### B4. Component Import Purity Tests

**New file**: `src/__tests__/components/component-purity.test.ts`
- For a sample of components from each classification (PRIMITIVE, DOMAIN, SURFACE), read the file contents
- Assert import paths comply with `PURITY_RULES` — e.g., no PRIMITIVE imports `/lib/services/`, `/hooks/`, or `/pages/`
- Assert no circular import patterns in component tree

---

## Files Changed Summary

| File | Change |
|---|---|
| `src/lib/backend-topology/edge-function-registry.ts` | Expand from 88 → 202 entries |
| `src/lib/backend-topology/edge-function-categories.ts` | Expand to 202 entries |
| `src/lib/backend-topology/edge-function-auth-map.ts` | Expand to 202 entries |
| `src/lib/backend-topology/edge-function-bounded-contexts.ts` | Expand to 202 entries |
| `src/lib/backend-topology/edge-function-owner-map.ts` | Expand to 202 entries |
| `src/lib/backend-topology/edge-function-contract-map.ts` | Expand to 202 entries |
| `src/lib/backend-topology/edge-function-migration-map.ts` | Expand to 202 entries |
| `src/lib/migration/edge-function-authority-map.ts` | Expand to 202 entries |
| `src/__tests__/edge-function-topology.test.ts` | Raise thresholds |
| `src/__tests__/edge-functions/ef-registry-completeness.test.ts` | New — zero orphan/phantom verification |
| `src/__tests__/edge-functions/ef-topology-integrity.test.ts` | New — topology validator behavioral test |
| `src/__tests__/edge-functions/ef-structural-verification.test.ts` | New — per-function code pattern verification |
| `src/__tests__/edge-functions/ef-contract-consistency.test.ts` | New — contract and auth consistency |
| `src/__tests__/components/component-smoke-generator.test.tsx` | New — auto-generated 1,001 component smoke tests |
| `src/__tests__/components/primitives-coverage.test.tsx` | New — canonical primitive tests |
| `src/__tests__/components/auth-components.test.tsx` | New — auth form tests |
| `src/__tests__/components/ui-library-coverage.test.tsx` | New — full shadcn/ui coverage |
| `src/__tests__/components/component-registry-behavioral.test.ts` | New — registry-to-disk verification |
| `src/__tests__/components/component-purity.test.ts` | New — import purity enforcement |

No database or backend changes required.

### Expected Outcome

| Dimension | Before | After |
|---|---|---|
| Edge Functions Structural | 95% | 100% (202/202 registered) |
| Edge Functions Behavioral | 10% | 100% (registry, topology, structural, contract tests) |
| UI Components Structural | 95% | 100% (registry-to-disk verified) |
| UI Components Behavioral | 5% | 100% (1,001 smoke tests + domain + purity tests) |
| Combined Score | 51.5% | 100% |
