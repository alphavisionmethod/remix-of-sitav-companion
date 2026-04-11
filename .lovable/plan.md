

# SITA OS — Remaining Fixes, Wiring & Connections

## What's Left

Six items remain across security, routing, and component wiring. Nothing is a blocker, but all should be addressed for production quality.

---

## 1. RLS Policies: `public` → `authenticated` (Security Hardening)

Three tables have RLS policies applied to the `public` role instead of `authenticated`. While no data leaks (because `auth.uid()` returns NULL for anon), this violates least-privilege.

**Tables:** `app_default_associations`, `calibration_checkpoints`, `installed_apps`

**Fix:** One migration that runs `ALTER POLICY ... TO authenticated` on all policies for these 3 tables (~9-12 policy alterations).

---

## 2. Broken `/brain` Route (Navigation Dead Link)

Two components navigate to `/brain` which does not exist as a route:
- `CopilotBar.tsx` line 59: `navigate("/brain")`
- `UniversalCommandSurface.tsx` line 740: `navigate("/brain")`

The actual route is `/personal-brain`. The sidebar already links correctly.

**Fix:** Either add a redirect route `<Route path="/brain" element={<Navigate to="/personal-brain" replace />} />` in App.tsx, or change both `navigate` calls to `/personal-brain`.

---

## 3. forwardRef Warnings (3 Components)

Three function components trigger "Function components cannot be given refs" console warnings when rendered by React Router:

| Component | File | Fix |
|-----------|------|-----|
| `RuntimeTruthProbe` | `src/components/sita/RuntimeTruthProbe.tsx` | Wrap with `React.forwardRef` |
| `AdminCommandPaletteWrapper` | `src/App.tsx` line 36 | Wrap with `React.forwardRef` |
| `AdminKeyboardShortcutsWrapper` | `src/App.tsx` line 37 | Wrap with `React.forwardRef` |

---

## 4. Leaked Password Protection (Manual — Supabase Dashboard)

Still disabled. This is a dashboard toggle, not a code fix.

**Action:** Go to Supabase Dashboard → Auth → Providers → Email → Enable "Leaked password protection (HaveIBeenPwned)"

---

## 5. `admin-intelligence` Wasteful Body Parse (Cosmetic)

Line 46 in `supabase/functions/admin-intelligence/index.ts` parses `req.json()` for validation then discards the result. Not a bug, just wasteful. Optional cleanup.

---

## Files Changed

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/brain` → `/personal-brain` redirect route; wrap 2 wrapper components with `forwardRef` |
| `src/components/sita/RuntimeTruthProbe.tsx` | Wrap with `React.forwardRef` |
| **New migration** | `ALTER POLICY` for 3 tables to change role from `public` to `authenticated` |
| `supabase/functions/admin-intelligence/index.ts` | Optional: remove wasteful body parse |
| **Supabase Dashboard** | Enable leaked password protection (manual) |

No new dependencies. No database schema changes. No breaking changes.

