

# SITA OS — Full Deployment Readiness Assessment

## Executive Summary

After thorough inspection of the entire codebase (1547-line App.tsx, 51 edge functions, 111 migrations, 660+ pages, 41 core services, Docker/nginx/systemd infrastructure), SITA OS is **structurally complete** but has specific gaps preventing a production-grade deployment.

---

## What Is Already Done (100%)

| Layer | Status | Evidence |
|-------|--------|---------|
| Frontend SPA | Complete | 660+ pages, all routed, lazy-loaded, code-split |
| Auth (email/password) | Complete | Login, signup, forgot/reset password, protected routes |
| Google OAuth (identity) | Complete | `GoogleSignInButton`, `signInWithOAuth`, Supabase provider |
| Database schema | Complete | 111 migrations, 150+ tables, RLS on all tables |
| Edge functions | Complete | 51 functions deployed and booting |
| Service worker / PWA | Complete | Offline caching, push notifications, manifest, icons |
| Docker/Compose | Complete | Multi-container stack, Traefik TLS, health checks |
| Admin system | Complete | 200+ admin pages across 20+ domains |
| Demo mode | Complete | Full demo data seeding, dual-reality system |
| Mobile views | Complete | 9 mobile-optimized pages |
| Core service layer | Complete | 41 core services in `core-services/`, boundary-compliant |
| Architecture validation | Complete | 17 architecture check scripts |

---

## What Is Missing — Gaps to Fix

### P0 — Blocking Production Deployment

#### 1. Google OAuth Not Configured in Supabase Dashboard
The code calls `signInWithOAuth({ provider: "google" })` but Google provider must be enabled in the Supabase Auth dashboard with real OAuth client credentials. Without this, the Google Sign-In button will fail silently.

**Action**: User must go to Supabase Dashboard → Auth → Providers → Enable Google → Add client ID/secret from Google Cloud Console. This is a manual dashboard step, not a code change.

#### 2. `sitemap.xml` Uses Placeholder Domain
Currently references `https://app.example.com/` — needs real domain. Also only lists 3 URLs when there are 20+ public-facing routes.

**Action**: Update `public/sitemap.xml` with the actual production domain and all crawlable routes (landing, login, signup, and any public marketing pages).

#### 3. `robots.txt` Uses Placeholder Domain
References `https://sita.os/sitemap.xml` — not a real domain.

**Action**: Update the sitemap URL in `robots.txt` to match the actual production domain.

#### 4. `supabase/config.toml` Is Minimal
Contains only `project_id`. No function-level config for `verify_jwt`, import maps, or environment settings. While Lovable auto-deploys with defaults, self-hosted deployments need complete config.

**Action**: Expand `supabase/config.toml` with function configs, auth settings, and API rate limits for self-hosted scenarios.

#### 5. `.env.production.example` Missing Keys
Only has 3 vars. Production deployment needs VAPID keys, AI gateway URL, update channel URL, and other runtime config documented.

**Action**: Add all production-required environment variables to the example file.

### P1 — Important for Launch Quality

#### 6. Edge Function JWT Validation
No `verify_jwt` config in `config.toml`. While Lovable managed deployments auto-handle this, self-hosted deployments could expose functions without auth. Most functions do validate JWT in-code, but this should be documented/enforced.

**Action**: Add explicit `[functions.<name>]` blocks in `config.toml` or document the in-code validation approach.

#### 7. Database Triggers Not Deployed
The `db-triggers` context shows "There are no triggers in the database" yet migrations create 12+ triggers (`on_auth_user_created`, `update_*_updated_at`, `check_notification_dedup`, `dispatch_push_notification`, `audit_sensitive_change`, etc.). This suggests migrations may not have been fully applied.

**Action**: Verify all migrations have been applied by checking `supabase_migrations.schema_migrations` table. If triggers are missing, re-run the relevant migrations.

#### 8. Sitemap Coverage
Only 3 URLs in sitemap. For SEO, all public-accessible routes should be listed. For an SPA behind auth, at minimum the landing page, login, signup, and any marketing content should be included.

**Action**: Generate a complete sitemap with proper `lastmod` dates and priorities.

### P2 — Polish & Hardening

#### 9. CSP Header in Nginx
The CSP includes `'unsafe-inline' 'unsafe-eval'` for scripts. While needed for Vite dev, production builds should tighten this.

**Action**: Generate nonces or use hashes for inline scripts, remove `unsafe-eval` in production.

#### 10. Self-Hosted Docker Stack Not Tested
Docker Compose references `deploy/api-gateway/` and `deploy/brain-core/` which have server stubs but no real logic. The API gateway and brain-core containers are placeholder scaffolds.

**Action**: These are OK for MVP if all real logic runs via Supabase edge functions. Document this clearly in deployment docs.

---

## Implementation Plan

### Step 1: Fix SEO Files (sitemap.xml, robots.txt)
- Update `public/sitemap.xml` with production domain and all public routes
- Update `public/robots.txt` with correct sitemap URL
- Add proper meta tags for OG/social sharing on landing page

### Step 2: Expand .env.production.example
Add all required production vars:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- `SITA_UPDATE_URL`, `SITA_UPDATE_CHANNEL`
- `ACME_EMAIL` (for Traefik TLS)
- Documentation comments for each

### Step 3: Expand supabase/config.toml
Add auth config, function-level settings, API rate limits, and SMTP config blocks.

### Step 4: Verify Database Triggers
Run a query against the live database to confirm all triggers from migrations are present. If missing, create a repair migration.

### Step 5: Tighten Nginx CSP for Production
Remove `unsafe-eval`, minimize `unsafe-inline` where possible.

---

## Files Changed
- `public/sitemap.xml` — complete rewrite with all public routes
- `public/robots.txt` — fix sitemap URL
- `.env.production.example` — expand with all production vars
- `supabase/config.toml` — expand with auth and function config
- `nginx/default.conf` — tighten CSP header

## What Cannot Be Fixed in Code
- **Google OAuth setup** — requires manual Supabase Dashboard configuration
- **Custom domain** — requires DNS and Lovable publish settings
- **VAPID key generation** — already configured as secrets

