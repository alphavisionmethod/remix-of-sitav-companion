

# SITA OS — Production Readiness Audit

## Status: Nearly Complete

The codebase is in strong shape. Most prior issues (forwardRef wrappers, `/brain` redirect, hooks ordering) have been fixed. Here is what remains:

---

## 1. RLS Policy Hardening — 3 Tables (Security, HIGH priority)

11 RLS policies across `app_default_associations`, `calibration_checkpoints`, and `installed_apps` apply to `{public}` instead of `{authenticated}`. No data leaks today (auth.uid() returns NULL for anon), but this violates least-privilege.

**Fix:** One migration with 11 `ALTER POLICY ... TO authenticated` statements.

---

## 2. Leaked Password Protection — Supabase Dashboard (Security, MEDIUM priority)

Still disabled. This is a manual toggle, not a code fix.

**Action:** Supabase Dashboard → Auth → Settings → Enable "Leaked password protection"

---

## 3. `admin-intelligence` Wasteful Body Parse (Cosmetic, LOW priority)

Lines 43-53: parses `req.json()` for Zod validation, then discards the result. The body is re-parsed later in the switch cases. The parsed body should be passed through or the pre-validation removed.

**Fix:** Store the parsed body in a variable and pass it to the handler logic, or remove the early parse block entirely since individual handlers parse separately.

---

## 4. `as any` Type Casts in 13 Page Files (Code Quality, LOW priority)

142 occurrences of `as any` across 13 files. Most are in admin panels and select elements. Not blocking but reduces type safety. Key files:
- `CampaignOrchestrator.tsx` — 6 casts on inline data
- `ITC04WiringGraph.tsx` — 6 casts on edge data
- `PLT05ViolationTriage.tsx`, `PLT10DriftRadar.tsx` — select onChange casts
- `AppLibraryPage.tsx` — sort select cast

**Fix:** Define proper TypeScript interfaces for each data shape. Low urgency.

---

## 5. Console Logging in 8 Page Files (Code Quality, LOW priority)

40 console.log/warn/error calls in page files. Most are appropriate error logging in catch blocks. One debug log in `CalmAssistantChat.tsx` line 48 should be removed for production.

**Fix:** Remove the debug `console.log` in `CalmAssistantChat.tsx`. The rest are acceptable error-path logging.

---

## Summary

| Item | Priority | Type | Effort |
|------|----------|------|--------|
| RLS `public` → `authenticated` migration | HIGH | Security | 1 migration, ~15 min |
| Leaked password protection toggle | MEDIUM | Security | Manual, 1 min |
| admin-intelligence body parse cleanup | LOW | Code quality | 5 min |
| Remove `as any` casts (13 files) | LOW | Type safety | 1-2 hours |
| Remove debug console.log | LOW | Cleanup | 2 min |

## Recommendation

Items 1 and 3 and 5 can be done in code right now. Item 2 requires you to toggle in the Supabase Dashboard. Item 4 is optional polish.

## Files to Change

| File | Change |
|------|--------|
| **New migration** | `ALTER POLICY` × 11 for 3 tables |
| `supabase/functions/admin-intelligence/index.ts` | Remove or wire up the early body parse |
| `src/pages/advisors/CalmAssistantChat.tsx` | Remove debug console.log on line 48 |

