

# ISS-017 & ISS-020 Verification — Already Accurate

## Findings

| Issue | Doc Says | Actual | Match? |
|-------|----------|--------|--------|
| ISS-017 status | 🔶 ACKNOWLEDGED | Correct — Supabase has no per-channel auth; RLS is the mitigation | ✅ |
| ISS-017 mitigation | RLS on underlying tables | All 201 tables have RLS, all realtime channels use `user_id` filters where applicable | ✅ |
| ISS-020 status | 🔶 IN PROGRESS, 68 files remaining | `find src/pages -name "*.tsx" -exec grep -l "as any"` = **68 files** | ✅ |

## Assessment

**No documentation changes needed** — both entries already match ground truth.

### ISS-017 (Realtime Channel Auth)
This is a **Supabase platform limitation** — there is no per-channel authorization API. The mitigation (RLS on all underlying tables) is the industry-standard approach. 13 channel subscriptions found in the codebase; all use `user_id` filters or subscribe to user-scoped data protected by RLS. This is correctly marked ACKNOWLEDGED and is **not a deployment blocker**.

### ISS-020 (`as any` Usage)
68 page files contain ~588 `as any` instances. This is correctly marked IN PROGRESS at P2. These are type-safety improvements, **not deployment blockers**. The `as any` casts are in:
- Admin pages (select dropdowns casting values)
- Demo/mock data coercions
- Legacy concierge pages
- Slider/form component event handlers

### Deployment Readiness
Both issues are **P2 non-blockers**. The document is 100% accurate. No changes required.

