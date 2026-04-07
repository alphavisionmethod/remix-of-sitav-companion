

# SITA OS — Full Deployment Readiness Audit & Gap Closure Plan

## Audit Summary

After a full codebase audit covering routing, database, edge functions, security, CI/CD, testing, and frontend, here are the gaps grouped by severity.

---

## Gap 1: Security — Leaked Password Protection (WARN)

**Issue:** Supabase linter reports leaked password protection is disabled. This is a Supabase Dashboard setting, not a code fix.

**Action:** Enable via Supabase Dashboard → Auth → Settings → Password Security. No code change needed. Already documented/ignored in security findings.

---

## Gap 2: No `robots.txt` or `sitemap.xml` for SEO/Production

**Issue:** No `public/robots.txt` or `public/sitemap.xml` exists. Crawlers will get 404s.

**Action:**
- Create `public/robots.txt` (allow all, point to sitemap)
- Create `public/sitemap.xml` with key public routes (`/`, `/login`, `/signup`)

---

## Gap 3: No PWA Manifest / `favicon.ico` Verification

**Issue:** No `manifest.json` or web app manifest for installability. Service worker `sw-push.js` exists but there's no manifest tying it together.

**Action:**
- Create `public/manifest.json` with SITA OS branding (name, icons, theme color, display: standalone)
- Verify `public/favicon.ico` exists and is linked in `index.html`
- Add manifest link to `index.html`

---

## Gap 4: Missing Error Boundary on Key Routes

**Issue:** `GlobalErrorBoundary` wraps the entire app, but individual route-level error boundaries don't exist. A single page crash takes down the whole shell.

**Action:**
- Create `RouteErrorBoundary` component that catches per-route errors with a "Go Home" recovery button
- Wrap the inner `<Routes>` inside ShellLayout with this boundary

---

## Gap 5: No `health.json` or Version Endpoint

**Issue:** The deploy workflow references `health.json` for smoke tests, but no such file is generated during build.

**Action:**
- Add a Vite plugin or post-build script that generates `dist/health.json` with `{ status: "ok", version: "<git-sha>", buildTime: "<iso>" }`

---

## Gap 6: Missing Meta Tags / Open Graph for Landing Page

**Issue:** `LandingPage.tsx` renders but `index.html` has no OG meta tags for social sharing.

**Action:**
- Add `<meta property="og:title">`, `og:description`, `og:image`, `twitter:card` to `index.html`

---

## Gap 7: No 404 Handling for API/Edge Function Calls

**Issue:** If an edge function returns an error, many pages silently fail. No global error toast for failed `supabase.functions.invoke()` calls.

**Action:**
- Add a global query error handler in `createQueryClient()` that shows a toast on network/API failures
- Verify `src/lib/query-config.ts` has `onError` callback

---

## Gap 8: Bundle Size — 600+ Pages Risk

**Issue:** 600+ lazy-loaded pages. While code-split, the initial JS chunk and router definition are massive (App.tsx is 1520 lines). This could cause slow initial parse.

**Action:**
- Split route definitions into separate files: `src/routes/admin-routes.tsx`, `src/routes/investment-routes.tsx`, `src/routes/revenue-routes.tsx`, etc.
- Import and spread them in App.tsx to reduce main bundle parse time

---

## Gap 9: No CSP (Content Security Policy) Headers

**Issue:** No Content-Security-Policy meta tag in `index.html`. XSS attack surface is unmitigated at the browser level.

**Action:**
- Add a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` with appropriate directives for Supabase URLs, self, and inline styles (required by Tailwind)

---

## Gap 10: Playwright E2E Config Verification

**Issue:** E2E tests exist (28 spec files) but need verification that `playwright.config.ts` is correctly configured with `baseURL`, timeouts, and the correct `webServer` command.

**Action:**
- Verify `playwright.config.ts` exists and has correct `baseURL` pointing to the local dev server
- Ensure `webServer` block starts Vite before tests run

---

## Implementation Plan (Ordered by Priority)

| # | Task | Files | Effort |
|---|---|---|---|
| 1 | Generate `health.json` at build time | `vite.config.ts` or `scripts/generate-health.ts` | Small |
| 2 | Add `robots.txt` + `sitemap.xml` | `public/robots.txt`, `public/sitemap.xml` | Small |
| 3 | Add PWA `manifest.json` + link in index.html | `public/manifest.json`, `index.html` | Small |
| 4 | Add OG meta tags to `index.html` | `index.html` | Small |
| 5 | Add CSP meta tag | `index.html` | Small |
| 6 | Add `RouteErrorBoundary` for per-route isolation | `src/components/sita/RouteErrorBoundary.tsx`, `src/App.tsx` | Medium |
| 7 | Add global query error handler (toast on API fail) | `src/lib/query-config.ts` | Small |
| 8 | Split route definitions out of App.tsx | `src/routes/*.tsx`, `src/App.tsx` | Medium |
| 9 | Verify Playwright config | `playwright.config.ts` | Small |

### What's Already Solid (No Action Needed)
- **Security scan**: Clean (1 warn, already ignored — Dashboard-only fix)
- **Database linter**: Clean (same 1 warn)
- **Edge functions**: All 50 fully implemented with Zod, CORS, auth, rate limiting
- **Auth flow**: Complete with signup, login, forgot/reset password, demo mode, email verification
- **RLS policies**: In place across tables
- **CI/CD**: 12-job pipeline with typecheck, lint, tests, build, security, architecture, E2E, Docker, launch gate
- **Deploy workflow**: Manual `workflow_dispatch` with environment protection gates
- **Onboarding**: 42 components wired into setup flow
- **Desktop Shell**: Routed as default home (`/`)
- **Push notifications**: Hardened VAPID + 3 edge functions + Deno tests + E2E
- **Profile page**: Full edit/save/avatar, linked from sidebar + top bar + command palette
- **Landing page**: Complete with hero, value prop, CTA
- **Test suite**: 143 unit test files + 28 E2E spec files
- **VAPID keys + secrets**: All configured

