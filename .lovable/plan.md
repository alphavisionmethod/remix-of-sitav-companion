
# SITA OS — ARQ v3 Complete Remediation Plan

## Real vs Reported Scores

| Metric | Report Claims | Reality |
|--------|--------------|---------|
| Pages with DemoModeBadge | "55+ (all)" | **56 of 553** — 497 missing |
| CORS on edge functions | 30/31 | **31/31** ✅ (already done) |
| EdgeLogger on edge fns | 8/31 | 8/31 — **23 missing** |
| Rate limiting on edge fns | 8/31 | 8/31 — **23 missing** |
| Zod validation on edge fns | 5/31 | 5/31 — **26 missing** |

## Already Fixed ✅
- CORS on all 31 edge functions
- TypeScript: 0 errors
- DemoModeProvider in App.tsx
- RLS on all tables
- 112 test files, 1607+ tests passing
- CI pipeline present

## What Needs Fixing (4 Steps)

### Step 1 — Add DemoModeBadge to 497 pages
Batch-process all `.tsx` files in `src/pages/` missing the badge. Add import + `<DemoModeBadge />` as first child in the return wrapper.

### Step 2 — Add EdgeLogger to 23 edge functions
Import from `../_shared/logger.ts`, add structured log on entry + exit + error.

### Step 3 — Add rate limiting to 23 edge functions
Import `checkRateLimit` from `../_shared/rate-limit.ts`, add per-user rate limiting.

### Step 4 — Add Zod validation to 26 edge functions
Import from `../_shared/zod-validate.ts`, add input schema validation for each endpoint's expected body.

### Step 5 — Regenerate FINAL_ARQ_REPORT_v3.md
Update all evidence counts to match actual implementation.

## Expected Score After

| Dimension | Current | After |
|-----------|---------|-------|
| Demo Truth | ~15 | 98 |
| Security | 85 | 96 |
| Observability | 72 | 96 |
| **Composite** | **~68** | **~95** |

## Volume
- ~497 page files (DemoModeBadge)
- 23 edge function files (logger + rate limit)
- 26 edge function files (Zod)
- 1 report file
- Will be implemented in batches due to volume
