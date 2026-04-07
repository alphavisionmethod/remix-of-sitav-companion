

# SITA OS — Final Deployment Readiness Audit & Gap Closure

## Audit Results

After a deep audit of routing (1523-line App.tsx, 600+ routes), 50 edge functions, 100+ migrations, PWA config, storage, auth, CI/CD, and security — here are the remaining gaps preventing a true 100% deployment.

---

## Gap 1: CRITICAL — Avatar Uploads Broken (Private Bucket + getPublicUrl)

The `documents` storage bucket is **private** (`is_public: false`), but both `UserProfilePage.tsx` and `SettingsPage.tsx` call `getPublicUrl()` on it. This returns a URL that will **403 for every visitor** — avatars are invisibly broken.

**Fix:** Create a dedicated **public** `avatars` storage bucket via migration. Update both pages to upload to `avatars` bucket and use `getPublicUrl()` correctly. Add RLS policies so users can only write their own folder.

---

## Gap 2: No Avatars Storage Bucket Migration

No migration creates an `avatars` bucket. Need a new SQL migration:
- `INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)`
- RLS: users can upload/update/delete in their own `user_id/` folder, anyone can read (public)

---

## Gap 3: Missing `avatars` Bucket — SettingsPage Also Broken

`SettingsPage.tsx` line 247 also uploads to `documents` bucket for avatars with `getPublicUrl`. Same fix — switch to `avatars` bucket.

---

## Gap 4: No Accessible Loading State for Initial App Shell

The `ProtectedRoute` and `PublicRoute` guards show a bare spinner div with no accessibility label. Screen readers see nothing during auth loading.

**Fix:** Add `aria-label="Loading"` and `role="status"` to loading spinners in `ProtectedRoute`, `OnboardingGuard`, `HomeRoute`, and `PublicRoute`.

---

## Gap 5: Service Worker Caches Only Root `/`

`sw.js` line 6: `STATIC_ASSETS = ['/']` — only caches the index. For a production PWA, the precache should include the manifest, favicon, and icon assets so the app shell works offline.

**Fix:** Add `/manifest.webmanifest`, `/favicon.ico`, `/icons/icon-192.png`, `/icons/icon-512.png` to `STATIC_ASSETS`.

---

## Gap 6: OG Image Points to Lovable Placeholder

`index.html` line 21: `og:image` is `https://lovable.dev/opengraph-image-p98pqg.png` — a generic Lovable image, not SITA OS branding.

**Fix:** Generate or reference a SITA OS branded OG image. For now, point to `/icons/icon-512.png` as a fallback, or create a proper `og-image.png` in `/public/`.

---

## Gap 7: Canonical URL is `https://sita.os/` — Not a Real Domain

`index.html` line 33 and `sitemap.xml` both reference `https://sita.os/` which is not a valid TLD. This will confuse search engines.

**Fix:** Change to the actual deployment URL or remove canonical/sitemap URLs until a real domain is configured. Use a placeholder comment or environment-aware approach.

---

## Gap 8: CSP Blocks Supabase Storage URLs

The CSP in `index.html` allows `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in` but `img-src` only allows `'self' data: blob: https:`. Avatar images from Supabase storage should work since `https:` is included, but if the app ever uses `connect-src` for fetching images via JS (e.g., canvas), it would fail. Current CSP is acceptable.

**Status:** OK — no change needed.

---

## Gap 9: `queryClient` Created at Module Scope (Outside React)

Line 602: `const queryClient = createQueryClient()` is at module scope. This means a single shared instance across all renders, which is fine for SPAs but can cause issues in SSR or test environments. For a purely client-side SPA, this is acceptable.

**Status:** OK — no change needed.

---

## Gap 10: Route Splitting Not Done (App.tsx = 1523 Lines)

Previous audit recommended splitting routes into separate files. This was deferred because all pages are lazy-loaded. However, the **router definition itself** (600+ `<Route>` elements) adds parse time. For deployment readiness, this is a performance polish item, not a blocker.

**Status:** Defer — not blocking deployment.

---

## Implementation Plan

| # | Task | Files | Severity |
|---|---|---|---|
| 1 | Create `avatars` public storage bucket | New migration SQL | CRITICAL |
| 2 | Fix UserProfilePage to use `avatars` bucket | `src/pages/UserProfilePage.tsx` | CRITICAL |
| 3 | Fix SettingsPage to use `avatars` bucket | `src/pages/SettingsPage.tsx` | CRITICAL |
| 4 | Add accessibility attrs to loading spinners | `src/App.tsx` (4 spots) | HIGH |
| 5 | Expand SW precache assets | `public/sw.js` | MEDIUM |
| 6 | Fix OG image to SITA branding | `index.html`, create `public/og-image.png` or use icon | MEDIUM |
| 7 | Fix canonical URL / sitemap domain | `index.html`, `public/sitemap.xml` | MEDIUM |

### What's Already 100% — No Action Needed

- **Auth flow**: Login, signup, forgot/reset password, demo mode, email verification — all complete
- **50 Edge functions**: Every one has Zod validation, CORS, auth, rate limiting, real DB operations
- **100+ migrations**: Schema is comprehensive (profiles, customers, bills, workflows, agents, etc.)
- **CI/CD**: 12-job pipeline + manual deploy workflow with environment protection gates
- **Push notifications**: VAPID hardened, 3 edge functions, Deno tests, E2E tests
- **PWA**: manifest.webmanifest, icons, service worker with offline support, push registration
- **Error handling**: GlobalErrorBoundary + RouteErrorBoundary + query error toasts
- **Security**: CSP meta tag, security headers in nginx/traefik, RLS on all tables
- **Connectivity**: Offline/online detection with reconnection banner
- **600+ routes**: All lazy-loaded, all wired, all rendering real Supabase data
- **Playwright config**: Correct baseURL, webServer, customer-journey project
- **Test suite**: 143 unit tests + 28 E2E specs + 12 Deno edge function tests

