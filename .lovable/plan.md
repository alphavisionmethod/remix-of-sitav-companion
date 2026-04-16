

## Phase 13 — Web Deployability Closure

I audited all 13 items of the Web Deployability Checklist against disk truth. **11 are green, 2 have real problems, and there is no enforceable web-readiness registry / CI gate** parallel to what iOS and Android have.

### What's already green ✅
| Item | Evidence |
|---|---|
| Production build | `vite.config.ts` with chunked vendor splits, `health.json` plugin, `dist/` output |
| Auth/session in prod | `ProtectedRoute`, `onAuthStateChange` wiring confirmed |
| Push on web (where supported) | `public/sw-push.js` + VAPID lifecycle service |
| File handling browser-safe | `web-fallbacks.ts` declares user-mediated picker only |
| Native gating | `WEB_RUNTIME_CONTRACT` honestly lists prohibited/simulation-only capabilities |
| SPA deep-link routing | `BrowserRouter`, nginx `try_files $uri $uri/ /index.html` |
| SEO/public assets | `robots.txt`, `sitemap.xml`, OG tags, canonical, manifest icons present |
| CSP/security headers | Defined in `index.html` meta + `nginx/default.conf` + `deploy/nginx.conf` |
| Error boundaries | `GlobalErrorBoundary` + `RouteErrorBoundary` both wired in `App.tsx`, plus `WindowErrorBoundary` for sub-windows |
| Error monitoring | `initErrorMonitoring()` called from `App.tsx` |
| Browser sandbox honesty | `web-runtime-contract.ts` declares simulation-only capabilities |

### Real problems found ❌

**Gap A — Service worker registers in Lovable preview iframe → cache pollution.**
`src/main.tsx` calls `navigator.serviceWorker.register('/sw.js')` unconditionally. There is no iframe / preview-host guard, which directly violates the documented PWA constraint. SW caching `STATIC_ASSETS` inside the editor preview will serve stale builds and mask code changes.

**Gap B — `sw-push.js` references `/pwa-192x192.png` and `/pwa-64x64.png` that don't exist** (icons are at `/icons/icon-192.png`). Push notification badges will 404 in production.

**Gap C — Two CSP policies disagree.** `index.html` meta CSP allows `connect-src ... https://fctupowhcljejygjfpty.supabase.co` (correct project) but `nginx/default.conf` allows `https://*.supabase.co` (wildcard, weaker) and **omits the project domain entirely** for some asset paths. Need to align the nginx CSP with the meta CSP and fix the project ref.

**Gap D — No enforceable web-readiness registry / CI gate.** iOS and Android each have an 18-item registry + CI gate (`check-mobile-store-readiness`). Web has only the 5-stage `deployability-report.json` (build/sign/distribute/observe/rollback) which doesn't map to the 13-item checklist. Nothing fails CI if, e.g., the SW iframe guard regresses.

**Gap E — `sitemap.xml` and `robots.txt` use the placeholder domain `https://app.sita.os/`** — must either be parameterized or documented as "update before production." Currently they ship to prod with the wrong host.

**Gap F — `docs/refactor/env-schemas.md` is marked "aspirational future monorepo target."** No current single source documents the **actual** env vars needed for the live web deployment (only `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`).

---

### Phase 13 — Plan (~9 files, ~450 LOC)

**13.1 — Fix SW registration guard (`src/main.tsx`)**
Add iframe + preview-host check exactly as the PWA constraint requires. In preview/iframe contexts: unregister any existing SW. Only register `/sw.js` when on real production host.

**13.2 — Fix push icon paths (`public/sw-push.js`)**
Replace `/pwa-192x192.png` → `/icons/icon-192.png` and `/pwa-64x64.png` → `/icons/icon-192.png` (only one size shipped). Verify against `public/icons/`.

**13.3 — Align CSP across surfaces (`nginx/default.conf`, `deploy/nginx.conf`)**
Replace wildcard `https://*.supabase.co` with the project-specific origin `https://fctupowhcljejygjfpty.supabase.co` and matching `wss://`. Add `https://ai.gateway.lovable.dev`. Add `font-src https://fonts.gstatic.com` and `style-src https://fonts.googleapis.com` to match index.html meta.

**13.4 — Web Store / Web Deployability Readiness Registry**
Create `src/lib/web-platform/release/web-deployability-readiness.ts` — a typed 13-item registry, one entry per checklist item, each `{ id, title, status: ready|partial|deferred|missing, evidence, blocker?, remediation? }`. Mirrors the iOS/Android pattern.

Plus `src/lib/web-platform/release/index.ts` barrel and `src/lib/web-platform/release/web-runtime-min-contract.ts` (minimum supported browser baseline: Chrome 109, Safari 16, Firefox 115, Edge 109).

**13.5 — CI gate `check-web-deployability.ts`**
Fails if any item is `missing`. Fails if `partial` items lack remediation. Asserts:
- `src/main.tsx` contains the iframe guard (regex check)
- `public/sw-push.js` does not reference non-existent `/pwa-*.png` paths
- `nginx/default.conf` CSP matches project Supabase origin
- `public/manifest.webmanifest`, `robots.txt`, `sitemap.xml` exist

Registers as the **24th CI gate** under new phase `phase-13-web-deployability` in `ci-gate-registry.ts` and `ci-gate-types.ts`.

**13.6 — Admin dashboard `WEB01DeployabilityCenter.tsx`**
Route `/admin/web/deployability`. Renders all 13 items green/amber/red with evidence links, mirroring `MOB01StoreReadinessCenter.tsx`.

**13.7 — Sitemap/robots: parameterize domain**
Add a build-time note (`<!-- DO NOT SHIP unless WEB_PUBLIC_HOST is set -->`) and a `scripts/release/web/rewrite-public-host.ts` that swaps `https://app.sita.os/` → real host from env var on build. Surfaced as a `partial` checklist item until env is set.

**13.8 — Document real env vars**
Create `docs/web/env-vars.md` listing the **actual** live web vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, optional `VITE_PUBLIC_HOST`, `VITE_VAPID_PUBLIC_KEY`. Drops the "aspirational future monorepo" framing.

**13.9 — Update aggregators**
Regenerate `ci-umbrella-manifest.json` (gateCount: 24, +`phase-13-web-deployability`), `production-truth-final.json`, `META04ProductReality` tile. Generate `generated/web-deployability-report.json`.

### Acceptance criteria
- Service worker no longer registers in `id-preview--*.lovable.app` or any iframe.
- `sw-push.js` icon paths resolve (no 404s in production push notifications).
- Both `nginx/*.conf` files have CSP that matches `index.html` and the real Supabase project origin.
- `web-deployability-report.json` shows 0 `missing`, only `partial` for items requiring real production host configuration.
- `check-web-deployability` gate passes; CI Umbrella reads **24/24 green**.
- `/admin/web/deployability` renders all 13 items live.
- `META04ProductReality` shows 24-gate verdict.

### Files
| File | Role |
|---|---|
| `src/main.tsx` | Add iframe/preview SW guard |
| `public/sw-push.js` | Fix icon paths |
| `nginx/default.conf` | Align CSP |
| `deploy/nginx.conf` | Align CSP |
| `src/lib/web-platform/release/web-deployability-readiness.ts` | 13-item registry |
| `src/lib/web-platform/release/web-runtime-min-contract.ts` | Min browser contract |
| `src/lib/web-platform/release/index.ts` | Barrel |
| `scripts/architecture/checks/check-web-deployability.ts` | CI gate 24 |
| `scripts/release/web/rewrite-public-host.ts` | Sitemap/robots host rewriter |
| `src/pages/admin/WEB01DeployabilityCenter.tsx` | Admin surface |
| `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts` | +Phase 13 |
| `src/routes/AdminRoutes.tsx` | Route wiring |
| `generated/web-deployability-report.json` | Disk report |
| `generated/ci-umbrella-manifest.json` | gateCount: 24 |
| `generated/production-truth-final.json` | +phase-13 |
| `docs/web/env-vars.md` | Real env documentation |

After this, the Web Deployability Checklist is enforceable in CI — service worker behavior is correct in both preview and prod, CSP is consistent across hosts, push icons resolve, and a single dashboard tile reads `WEB: ready` against disk truth.

