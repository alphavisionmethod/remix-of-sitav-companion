

# SITA OS — Final Deployment Readiness Fixes

## Current State
The codebase is in very strong shape. Security scan shows only 2 remaining findings. All prior fixes (forwardRef, hooks ordering, `/brain` redirect, admin-intelligence cleanup, prior RLS hardening) are confirmed in place.

---

## 1. RLS Policy Hardening — 3 More Tables (Security, HIGH)

The security scan found 3 additional tables with RLS policies targeting `{public}` instead of `{authenticated}`:

| Table | Policies to fix |
|-------|----------------|
| `implementation_spec_registry` | 4 (select, insert, update, delete) |
| `implementation_wiring_edges` | 4 (select, insert, update, delete) |
| `oauth_state_sessions` | 1 (manage own sessions) |

**Fix:** One migration with 9 `ALTER POLICY ... TO authenticated` statements.

---

## 2. Leaked Password Protection (Manual — Supabase Dashboard)

Still the only linter warning. Not a code fix.

**Action:** Supabase Dashboard → Auth → Settings → Enable "Leaked password protection"

---

## 3. CSP `connect-src` Missing `https://*.supabase.in` Domain

The `index.html` CSP `connect-src` includes `https://*.supabase.co` and `wss://*.supabase.co` but also includes `https://*.supabase.in`. The `nginx/default.conf` CSP does NOT include `*.supabase.in` — these should be consistent. Since `index.html` is the one that matters for the SPA (nginx serves static files, the meta tag is what the browser enforces), we should update `nginx/default.conf` to match.

**Fix:** Add `https://*.supabase.in` to `connect-src` in `nginx/default.conf`.

---

## 4. `deploy/nginx.conf` vs `nginx/default.conf` Divergence

Two nginx configs exist:
- `nginx/default.conf` — used by Dockerfile (production SPA)
- `deploy/nginx.conf` — used by docker-compose (self-hosted with API proxy)

`deploy/nginx.conf` is missing security headers present in `nginx/default.conf`: `Permissions-Policy`, `Strict-Transport-Security`. It should inherit these for parity.

**Fix:** Add missing security headers to `deploy/nginx.conf`.

---

## 5. Mark Security Findings as Fixed

After applying the migration, mark the `MISSING_RLS_PROTECTION` finding as fixed in the security scanner.

---

## Summary

| Item | Priority | Type | Effort |
|------|----------|------|--------|
| RLS `public` → `authenticated` (3 tables, 9 policies) | HIGH | Security | 1 migration |
| Leaked password protection | MEDIUM | Manual | Dashboard toggle |
| nginx config security header parity | LOW | Hardening | 2 min |
| nginx CSP `connect-src` alignment | LOW | Hardening | 1 min |

## Files Changed

| File | Change |
|------|--------|
| **New migration** | `ALTER POLICY` × 9 for 3 tables |
| `deploy/nginx.conf` | Add `Permissions-Policy`, `HSTS` headers |
| `nginx/default.conf` | Add `*.supabase.in` to `connect-src` (if needed) |
| **Security scanner** | Mark RLS finding as fixed after migration |

