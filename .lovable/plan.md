

# SITA OS — Deployment Readiness Audit & Fix Plan

## Issues Found

### CRITICAL: Edge Function Double Body Consumption (3 functions)

These functions call `req.json()` twice in different code paths that CAN both execute in a single request, causing "Body already consumed" crashes:

| Function | Issue |
|----------|-------|
| `event-processor` | Line 16: validation parse, Line 38: handler parse — both fire for POST |
| `revenue-caller` | Line 38: validation parse, Line 73: handler parse — both fire for POST |
| `system-updates` | Line 14: validation parse, Line 58: handler parse — both fire for POST |

**Fix pattern:** Parse body once at the top, store in variable, reuse throughout.

### CRITICAL: `agent-signal` stale `body` reference

Line 118 references `body` (undefined) instead of `parsedBody`. This crashes the "process" path.

**Fix:** Change `const { signal_ids } = body;` to `const { signal_ids } = parsedBody;`

### No Other Issues Found

- All 9 AIG boards have `AIGSubNav` wired
- All AIT boards have `AITSubNav` (directly or via delegation to `AIT04to08Boards`)
- `intelligence-api` has 8 `req.json()` calls but in mutually exclusive route branches — safe
- No double-parse in `ai-gateway`, `os-status`, `connector-oauth`, `admin-api`, `ambient-os-operations`, `connector-operations`, `connector-proxy`, `agent-intelligence`
- No invalid cross-boundary imports in edge functions
- `CalmAssistantChat.tsx` imports are clean (previously fixed)
- Deployment artifacts (Dockerfile, docker-compose, nginx, PWA manifest, icons) all present
- DB linter clean (1 low-priority warning: leaked password protection disabled)
- Dev server logs clean (only a benign Tailwind ambiguity warning)
- Security headers properly applied via shared module

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/event-processor/index.ts` | Parse body once, remove duplicate `req.json()` |
| `supabase/functions/revenue-caller/index.ts` | Parse body once, remove duplicate `req.json()` |
| `supabase/functions/system-updates/index.ts` | Parse body once, remove duplicate `req.json()` |
| `supabase/functions/agent-signal/index.ts` | Line 118: `body` → `parsedBody` |

All 4 functions will be redeployed after fixes.

## Technical Detail

**event-processor fix:**
```text
// Before: req.json() at line 16 (validation) AND line 38 (handler)
// After: parse once before validation block, use stored variable
```

**revenue-caller fix:**
```text
// Before: req.json() at line 38 (validation) AND line 73 (handler)
// After: parse once, store in parsedBody, alias as body in handler
```

**system-updates fix:**
```text
// Before: req.json() at line 14 (validation) AND line 58 (POST handler)
// After: parse once at top for POST, reuse in handler
```

**agent-signal fix:**
```text
// Line 118: const { signal_ids } = body → const { signal_ids } = parsedBody
```

No database changes. No new files. 4 edge function redeploys.

