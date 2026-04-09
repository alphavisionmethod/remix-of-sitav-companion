

# SITA OS — Fix Everything for 100% Production Readiness

## Current State (Verified)

| Metric | Status |
|--------|--------|
| TypeScript errors | **0** (tsc clean) |
| `as any` in pages | **0** |
| `as unknown as` in pages | **0** |
| TODO/FIXME markers | **0** |
| Pages | **658** |
| Edge functions | **51** |
| Security scan | **1 warning** (leaked password — already ignored, Supabase Dashboard action) |
| OTA agent | Exists |
| Backup scripts | Exist |

## Remaining Gaps (5 categories)

### 1. Type Safety: 963 `: any)` callbacks across 230 page files
The biggest remaining gap. Every `.filter((x: any) => ...)` and `.map((r: any) => ...)` is operating on untyped query results. Fix by creating row-type interfaces and replacing `: any)` with typed parameters.

**Approach:** Process by domain cluster (top 20 worst files first, then sweep remaining):
- **Batch 1** — OwnerCenter (40), ConciergeOverview (25), CN01 (25), MSA01 (18), InvoicesCollections (16) = 124 fixes
- **Batch 2** — MSA05 (15), OpportunitiesCenter (14), ISA07 (14), ConnectorHub (14), BusinessBoardroom (12) = 69 fixes
- **Batch 3** — NSS04 (11), APL01 (11), AND01 (11), QuotesWorkspace (10), NOT01 (10), AR01 (10) = 63 fixes
- **Batch 4** — Remaining 210 files (~706 fixes), processed in groups of 10-15 files

**For each file:** Extract query result shapes into typed interfaces (e.g., `interface ConnectorRow { id: string; name: string; status: string; ... }`), then replace `(x: any)` with `(x: ConnectorRow)`.

### 2. Dead/duplicate route cleanup in App.tsx
- Audit all 579 lazy imports against actual route usage
- Remove any imports with no corresponding `<Route>` entry
- Deduplicate any routes pointing to the same component unnecessarily

### 3. Edge function test coverage
- Currently only `brain-core` has integration tests
- Add `_test.ts` files for the top 10 critical edge functions: `event-processor`, `connector-proxy`, `admin-api`, `invoice-generate`, `payment-process`, `crm-sync`, `cashflow-calculate`, `push-dispatch`, `ai-gateway`, `booking-manage`

### 4. E2E smoke tests for critical user journeys
- Create Vitest-based integration tests for: login → desktop → business center → create lead → proof receipt
- Create tests for: money center → create bill → approval flow
- Create tests for: concierge → create task → workflow trigger

### 5. Deployment manifest validation
- Update `scripts/validate-deployment.sh` to check all new scripts (metrics agent, first-boot)
- Update `scripts/check-edge-function-health.ts` to include all 51 functions (currently only checks 17)
- Ensure `generated/service-manifest.json` reflects current service count

## Technical Details

**Type safety pattern** (applied to every file):
```typescript
// BEFORE
const pending = approvals.filter((a: any) => a.status === "pending");

// AFTER  
interface ApprovalRow {
  id: string;
  status: string;
  action_type: string;
  proposed_action?: { amount?: number };
}
const pending = approvals.filter((a: ApprovalRow) => a.status === "pending");
```

**Edge function test pattern:**
```typescript
import "https://deno.land/std@0.224.0/dotenv/load.ts";
Deno.test("returns 401 without auth", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/event-processor`, { method: "POST" });
  await res.text();
  assertEquals(res.status, 401);
});
```

## Execution Order

1. Type safety batches 1-4 (largest impact, ~963 fixes across 230 files)
2. Dead import/route cleanup in App.tsx
3. Edge function tests (10 new test files)
4. E2E smoke tests (3 journey files)
5. Deployment manifest updates (3 scripts)

## Files Changed

- **~230 page files** — type annotations replacing `: any)`
- **~10 new test files** — `supabase/functions/*/index_test.ts`
- **3 new E2E test files** — `src/test/e2e-*.test.ts`
- **1 updated** — `src/App.tsx` (dead import cleanup)
- **3 updated** — deployment validation scripts

