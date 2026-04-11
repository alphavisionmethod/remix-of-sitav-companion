

# SITA OS — Full Deployment Readiness Audit

## Status: 95% Ready

Only 2 security findings remain from the scanner. Infrastructure, PWA, Docker, edge functions, and service worker are all in place.

---

## Remaining Issues

### 1. `customer_journey_status` RLS Too Permissive (Security, HIGH)

The SELECT policy `"auth read status"` uses `USING (true)` — any authenticated user can read all rows, exposing internal product quality data like `recommended_fix` and `launch_impact`.

**Fix:** One migration to replace the blanket `true` policy with an admin-only or owner-scoped policy:
```sql
DROP POLICY "auth read status" ON public.customer_journey_status;
CREATE POLICY "admin read status" ON public.customer_journey_status
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

---

### 2. CSP Mismatch: `index.html` Missing `ai.gateway.lovable.dev` (Medium)

`nginx/default.conf` includes `https://ai.gateway.lovable.dev` in `connect-src`, but `index.html` (the CSP the browser actually enforces for the SPA) does NOT. AI gateway calls will be blocked by the browser CSP.

**Fix:** Add `https://ai.gateway.lovable.dev` to the `connect-src` in `index.html` line 15.

---

### 3. Leaked Password Protection (Manual, MEDIUM)

Still disabled. Not a code fix.

**Action:** Supabase Dashboard → Auth → Settings → Enable "Leaked password protection"

---

### 4. Canonical URL Placeholder (Low)

`index.html` line 34 has `<link rel="canonical" href="/" />` with a comment "update to real domain before production." Should be set to the actual production domain once known, or removed if not publishing to a custom domain.

**Fix:** Update to actual domain or leave as-is if using `*.lovable.app`.

---

## What's Already Good (Confirmed)

- All RLS policies on `public` role → fixed (30+ tables migrated in prior rounds)
- PWA: manifest, icons (192+512), service worker with caching + push — all present
- Docker: multi-stage Dockerfile, nginx config with security headers, compose file — all present
- Edge functions: deployed and healthy
- Security headers: HSTS, X-Frame-Options, CSP, Permissions-Policy — all in both nginx configs
- Service worker: cache-first for assets, stale-while-revalidate for API, push handlers
- `.env.production.example`: comprehensive with all required vars documented
- OG/Twitter meta tags: present
- robots.txt, sitemap.xml, favicon: present

---

## Summary

| Item | Priority | Type | Effort |
|------|----------|------|--------|
| `customer_journey_status` RLS tighten | HIGH | Security | 1 migration |
| CSP add `ai.gateway.lovable.dev` to `index.html` | MEDIUM | Bug fix | 1 line |
| Leaked password protection | MEDIUM | Manual | Dashboard toggle |
| Canonical URL placeholder | LOW | Polish | 1 line |

## Files Changed

| File | Change |
|------|--------|
| **New migration** | Drop/recreate `customer_journey_status` SELECT policy to admin-only |
| `index.html` | Add `https://ai.gateway.lovable.dev` to CSP `connect-src` |

