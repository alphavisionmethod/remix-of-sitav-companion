
# SITA OS — Error, Gap & Wiring Fix Plan

## Issues Found

### 1. `device-telemetry` edge function: Body consumed twice
The function calls `req.json()` once in the validation block (line 15) and again in the main handler (line 30). In Deno, `Request.json()` can only be called once — the second call throws "Body already consumed". This is a **live production error** visible in edge function logs.

**Fix:** Parse body once, store result, reuse it.

### 2. `AIT04to08Boards.tsx` missing AITSubNav
All other AIT pages (01, 02, 03, 05, Setup) have `AITSubNav` wired in. AIT04to08Boards does not — breaking cross-navigation consistency.

**Fix:** Import and render `AITSubNav` at the top of each board section in AIT04to08Boards.

### 3. `CalmAssistantChat.tsx` duplicate import line
Lines 7 and 13 both import from `@/lib/ai` — they should be merged into a single import statement.

**Fix:** Merge into one import.

### 4. No other build errors
- 0 TypeScript errors in dev server logs
- No console errors reported
- Sidebar link already points to `/admin/ai-team` (Gap 2 from plan already fixed)
- AITSubNav component exists and is wired in 5/6 AIT pages

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/device-telemetry/index.ts` | Fix double body consumption — parse once, reuse |
| `src/pages/admin/AIT04to08Boards.tsx` | Add `AITSubNav` import and render |
| `src/pages/advisors/CalmAssistantChat.tsx` | Merge duplicate `@/lib/ai` imports |

## Technical Detail

**device-telemetry fix pattern:**
```text
// Before: req.json() called twice
const body = await req.json(); // validation
...
const body = await req.json(); // handler — BOOM

// After: parse once, pass through
let parsedBody: any;
if (req.method === "POST" || ...) {
  parsedBody = await req.json();
  // validate parsedBody
}
// use parsedBody in handler
```

No database changes. No new files. Deploy `device-telemetry` after fix.
