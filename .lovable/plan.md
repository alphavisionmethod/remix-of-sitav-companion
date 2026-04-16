

## Re-Audit: Web Deployability Checklist (13/13)

I re-checked every item against disk truth. The Phase 13 closure is **mostly real** but 3 small gaps remain that would cause real production breakage.

### What's actually green ✅ (10 of 13 fully correct)

| # | Item | Disk evidence |
|---|---|---|
| 1 | Production build | `vite.config.ts` chunked vendor splits + `health.json` plugin ✅ |
| 2 | Env vars documented | `docs/web/env-vars.md` exists with full list ✅ |
| 3 | Auth/session in prod | `ProtectedRoute` + `onAuthStateChange` in `App.tsx` ✅ |
| 4 | PWA behavior | `manifest.webmanifest` valid, icons present ✅ |
| 5 | SW iframe guard | `src/main.tsx` lines 10-37 — iframe + preview-host check confirmed ✅ |
| 7 | Sandbox honesty | `web-runtime-contract.ts` declares prohibited capabilities ✅ |
| 8 | File handling | `web-fallbacks.ts` user-mediated picker only ✅ |
| 9 | Native gating | `WEB_RUNTIME_CONTRACT` enforced ✅ |
| 10 | Deep-link routing | `BrowserRouter` + nginx `try_files` ✅ |
| 12 | CSP headers | `index.html` meta + `nginx/default.conf` both pin project Supabase origin + ai.gateway ✅ |
| 13 | Error boundaries | `GlobalErrorBoundary` + `RouteErrorBoundary` + `WindowErrorBoundary` ✅ |

### Real residual gaps ❌

**Gap 1 — `public/sw.js` install handler will fail and abort SW activation.**
`STATIC_ASSETS` includes `'/manifest.webmanifest'`, `'/favicon.ico'`, `'/icons/icon-192.png'`, `'/icons/icon-512.png'`. All exist ✅. But `cache.addAll()` is **atomic** — if any single fetch returns non-200 the whole install rejects and the SW never activates. Need a tolerant install (`Promise.allSettled` per asset) so a single transient 404 doesn't kill the SW.

**Gap 2 — `public/sw-push.js` is orphaned in production.**
The push handler lives in `sw-push.js` but `main.tsx` registers `/sw.js`. The unified `sw.js` already contains its own push/notificationclick handlers (per the file I read earlier in this conversation). Two possibilities — both bad:
- If `sw-push.js` is dead code: registry says "push works via `sw-push.js`" — that's a lie. Web push actually flows through `sw.js`. Evidence string in `web-deployability-readiness.ts` is wrong.
- If a separate registration was intended: it never happens, so the file is dead weight shipped to production.

Need to either delete `sw-push.js` and update the registry evidence to point to `sw.js`, OR consolidate properly.

**Gap 3 — `web-seo-public-assets` is `partial` because robots.txt + sitemap.xml still hard-code `https://app.sita.os/`.**
The rewriter `scripts/release/web/rewrite-public-host.ts` exists but is **not wired into the build**. It's a script the user must remember to run with `WEB_PUBLIC_HOST=...`. For "100% ready for deployment" this should either:
- Run automatically in `npm run build` (preferred), or
- Be replaced with a Vite plugin that rewrites `__WEB_PUBLIC_HOST__` tokens at build time.

### Phase 13.1 — Plan (3 files, ~80 LOC)

**13.1.1 — Make SW install fault-tolerant (`public/sw.js`)**
Change `cache.addAll(STATIC_ASSETS)` to `Promise.allSettled(STATIC_ASSETS.map(a => cache.add(a).catch(() => null)))`. Single 404 no longer aborts SW activation. Production SW activates reliably.

**13.1.2 — Resolve sw-push.js orphan**
Delete `public/sw-push.js` (the unified `sw.js` already handles push correctly per my earlier read). Update `web-deployability-readiness.ts` evidence for `web-push-vapid` from "public/sw-push.js handles push" → "public/sw.js handles push + notificationclick + push-track callback". Update `check-web-deployability.ts` to assert `sw.js` push handler exists, not `sw-push.js`.

**13.1.3 — Auto-rewrite public host on build**
Add a Vite plugin in `vite.config.ts` that, during `build`, reads `process.env.WEB_PUBLIC_HOST` (default `https://app.sita.os`) and rewrites `robots.txt`, `sitemap.xml`, and `manifest.webmanifest` in the `dist/` output. When `WEB_PUBLIC_HOST` is set in a real deployment env, prod assets ship with the right host automatically. Item 11 flips from `partial` → `ready` (with a note: still `partial` only if env var missing at build time, which is honest).

**13.1.4 — Regenerate report + manifest**
- `generated/web-deployability-report.json` → 13 ready, 0 partial, 0 missing.
- `generated/ci-umbrella-manifest.json` → unchanged (still 24 gates, all green).
- `check-web-deployability.ts` now passes a stricter assertion set.

### Acceptance

- `sw.js` install no longer aborts on a single asset 404.
- No orphaned `sw-push.js` shipped to prod; registry evidence matches code.
- `npm run build` with `WEB_PUBLIC_HOST=https://real.domain` produces `dist/robots.txt`, `dist/sitemap.xml`, and `dist/manifest.webmanifest` with the real host.
- `web-deployability-report.json` shows **13 ready, 0 partial, 0 missing**.
- CI Umbrella stays at **24/24 green** with web checklist now fully ready (no honest defers).

### Files

| File | Change |
|---|---|
| `public/sw.js` | Tolerant install (allSettled) |
| `public/sw-push.js` | **Delete** (consolidated into sw.js) |
| `vite.config.ts` | Add public-host rewrite plugin |
| `src/lib/web-platform/release/web-deployability-readiness.ts` | Fix push evidence; flip SEO to ready when env set |
| `scripts/architecture/checks/check-web-deployability.ts` | Assert sw.js push handler, not sw-push.js |
| `generated/web-deployability-report.json` | Regenerate: 13 ready / 0 partial |

After this micro-phase, the Web Deployability Checklist is **truthfully 13/13 ready** — no orphan files, no atomic-install failure mode, no manual rewrite step before deploy.

