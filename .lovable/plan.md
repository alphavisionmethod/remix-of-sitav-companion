

# SITA OS — Final Audit: Remaining Gaps to 100%

## What's Already Solid (No Changes Needed)
- Landing page: Beautiful hero, value props, CTAs, mobile responsive
- Login page: Split-panel, Google OAuth, Demo mode, lock screen for returning users
- Signup page: Full flow with email verification confirmation
- Forgot password: Complete with reset link flow
- 50 edge functions: All substantive with Zod, CORS, auth, rate limiting
- 100+ migrations, RLS on all tables
- CI/CD: 12-job pipeline + manual deploy workflow
- Push notifications: VAPID hardened, 3 edge functions, Deno + E2E tests
- PWA: manifest, icons, service worker with offline + push
- Error handling: GlobalErrorBoundary + RouteErrorBoundary + query error toasts
- CSP meta tag, OG/Twitter meta tags, robots.txt, sitemap.xml
- Accessibility: Loading spinners have role="status" + aria-label
- Health.json generated at build time
- Desktop shell, Daily Pulse, Settings — all wired to Supabase
- Zero console errors, zero network errors

---

## Gap 1: CRITICAL — Avatar Upload Path Mismatches RLS Policy

**Bug:** Both `UserProfilePage.tsx` (line 90) and `SettingsPage.tsx` (line 246) upload to path `avatars/${user.id}.${ext}` within the `avatars` bucket. But the RLS policy checks `storage.foldername(name)[1] = auth.uid()`, which expects the path to be `${user.id}/filename.ext` (user ID as a folder).

Current path: `avatars/abc123.png` → foldername = `['avatars']` → **RLS denies upload**
Correct path: `abc123/avatar.png` → foldername = `['abc123']` → **RLS allows**

**Fix:** Change both pages' upload path from `avatars/${user.id}.${ext}` to `${user.id}/avatar.${ext}`.

---

## Gap 2: PublicRoute Returns `null` During Loading

**Issue:** `PublicRoute` (App.tsx line 644) returns `null` during auth loading — a blank flash. All other guards (`ProtectedRoute`, `OnboardingGuard`, `HomeRoute`) correctly show accessible loading spinners.

**Fix:** Replace `return null` with the same accessible spinner pattern used by `ProtectedRoute`.

---

## Gap 3: SW Push Icon Paths Reference Non-Existent Files

**Issue:** `sw.js` lines 88-89 reference `/pwa-192x192.png` and `/pwa-64x64.png` for notification icons/badges. These files don't exist — the actual icons are at `/icons/icon-192.png` and `/icons/icon-512.png`.

**Fix:** Update icon paths to `/icons/icon-192.png` and badge to `/icons/icon-192.png` (or create a 64px badge icon).

---

## Gap 4: ForgotPassword Imports Missing Logo File

**Issue:** `ForgotPassword.tsx` line 6 imports `@/assets/logo.jpeg`. If this file doesn't exist, the page will fail to render. The Login and Signup pages use inline SVG/icon components instead.

**Fix:** Verify `src/assets/logo.jpeg` exists. If not, replace with the inline Brain icon pattern used by Login/Signup pages.

---

## Implementation Plan

| # | Task | Files | Severity |
|---|---|---|---|
| 1 | Fix avatar upload path to match RLS | `UserProfilePage.tsx`, `SettingsPage.tsx` | CRITICAL |
| 2 | Fix PublicRoute loading state | `App.tsx` (1 line) | HIGH |
| 3 | Fix SW notification icon paths | `public/sw.js` (2 lines) | MEDIUM |
| 4 | Verify/fix ForgotPassword logo import | `src/pages/auth/ForgotPassword.tsx` | MEDIUM |

Total: 4 gaps, 5 files, all fixable in one pass.

