

## Current State Assessment

After a comprehensive scan of the project, here is every remaining error, missing piece, and risk area organized by severity.

---

## Category 1: Security Findings (25 issues from security scan)

### CRITICAL (1 finding -- must fix before deployment)

| Table | Issue |
|---|---|
| `cloud_worker_jobs` | RLS policy allows any authenticated user to read/update/delete all jobs where `user_id IS NULL` (system-level background jobs). Attacker can tamper with system job payloads. |

### WARN -- Overly Permissive RLS (5 linter hits + 15 scan findings)

**Public insert tables with `WITH CHECK (true)` and no rate limiting:**
- `waitlist_signups` -- anon INSERT of email + IP data, no rate limit
- `beta_applications` -- anon INSERT of full_name, email, country, no validation
- `investor_requests` -- anon INSERT of contact_name, email, fund_name, no validation
- `donations` -- anon INSERT of donor_email, amount, no validation
- `press_inquiries` -- anon INSERT of contact_name, email, no validation

**Admin-only tables readable by ALL authenticated users (privilege model leak):**
- `cloud_admin_roles` -- exposes complete role + permission arrays
- `admin_role_permissions` -- exposes role-to-permission mappings
- `service_identity_registry` -- exposes service_key, scopes, trust_level
- `ai_provider_registry` -- exposes provider base URLs and auth_kind
- `environment_configs` -- exposes env_key, api_base_url, feature flags
- `incident_classifications` -- exposes runbook IDs, kill switch IDs
- `domain_ownership_registry` -- exposes API surfaces and dependencies
- `platform_planes` + `plane_service_assignments` -- exposes service topology
- `release_compatibility_matrix` -- exposes breaking changes and rollout state
- `api_gateway_routes` -- exposes full API surface, permissions, rate limits

**Realtime broadcast to non-admin subscribers:**
- `hardware_certification_runs` -- firmware versions, TPM states
- `secret_rotation_log` -- secret names, rotation results
- `operator_drill_executions` -- runbook/kill-switch drill results

### Fix plan
1. **Migration**: Tighten `cloud_worker_jobs` policy -- remove `OR (user_id IS NULL)` from user-facing policy; add a separate service-role-only policy for NULL user_id jobs.
2. **Migration**: Restrict SELECT on 10 admin-internal tables to users with admin role via `public.has_role(auth.uid(), 'admin')`.
3. **Migration**: Remove the 3 sensitive tables from `supabase_realtime` publication (or scope channel subscriptions).
4. **Application-layer**: The 5 public-insert tables are intentionally public (marketing forms) -- add field validation in `WITH CHECK` (e.g., `email IS NOT NULL AND email ~* '^.+@.+$'`) rather than blocking anon access entirely.

---

## Category 2: Demo/Data Mode Wiring Drift (28 hooks)

Wave 7 fixed all **pages**, but 28 data-fetching hooks in `src/hooks/` still import `useDataMode()` from `DataModeContext`. This is **architecturally acceptable** for now because `DataModeContext` is a shim that bridges to `RealityModeProvider`. However, it creates two sources of truth:
- Pages use `useAuth().isDemo` (canonical)
- Hooks use `useDataMode().isDemoMode` (shim)

### Fix plan
Leave hooks on `useDataMode()` for now -- the shim is working correctly and both resolve to the same underlying `RealityModeProvider`. Migrating 28 hooks is a low-risk cleanup that can be done post-launch. No functional bug exists.

---

## Category 3: Remaining "Coming Soon" Stub (1 page)

| File | Issue |
|---|---|
| `src/pages/marketing/Donate.tsx` | Donation buttons say "Coming soon" and are disabled. The page itself notes "Stripe checkout activates as soon as Lovable Payments is enabled." |

### Fix plan
Wire the Donate page to a real payment provider (Stripe via Lovable Payments connector). The `donations` table and webhook plumbing already exist in the database.

---

## Category 4: Console.log Statements in Production Code (46 files, ~556 hits)

Most are in platform/SDK layers (`nova-sdk`, `sync-engine`, `crash-resilience`) which are legitimate runtime telemetry. However, some are in UI components (`DesktopQuickActionsWidget.tsx`) and should be cleaned up or replaced with proper logging.

### Fix plan
- Replace `console.log` in UI components with a no-op in production (or remove).
- Platform SDK logs are acceptable (they simulate kernel-level telemetry).

---

## Recommended Wave 8 Implementation (Priority Order)

### 8.1 Fix the CRITICAL RLS vulnerability on `cloud_worker_jobs`
- Migration: Drop the `OR (user_id IS NULL)` clause from the user-facing policy
- Add a new policy for service_role only to handle system jobs

### 8.2 Tighten 10 admin-internal table SELECT policies
- Migration: Replace `USING (true)` with `USING (public.has_role(auth.uid(), 'admin'))` on: `cloud_admin_roles`, `admin_role_permissions`, `service_identity_registry`, `ai_provider_registry`, `environment_configs`, `incident_classifications`, `domain_ownership_registry`, `platform_planes`, `plane_service_assignments`, `api_gateway_routes`, `release_compatibility_matrix`

### 8.3 Add field validation to 5 public-insert tables
- Migration: Replace `WITH CHECK (true)` with `WITH CHECK (email IS NOT NULL AND length(email) > 3)` or equivalent on: `waitlist_signups`, `beta_applications`, `investor_requests`, `donations`, `press_inquiries`

### 8.4 Remove 3 sensitive tables from Realtime publication
- Migration: `ALTER PUBLICATION supabase_realtime DROP TABLE hardware_certification_runs, secret_rotation_log, operator_drill_executions;`

### 8.5 Wire Donate page to payments (optional, depends on business readiness)
- Enable Stripe/Paddle connector and replace "Coming soon" buttons with live checkout

### 8.6 Clean up UI console.log statements
- Remove or gate debug logs in `src/components/` files

### 8.7 Update MASTER_AUDIT.md and security scan findings
- Mark resolved findings as fixed
- Document the RLS hardening in a Wave 8 operator note

## Files to be created
- `WAVE8_SECURITY_HARDENING.md`

## Files to be edited
- 1 new database migration (RLS policy tightening + realtime publication change)
- `src/pages/marketing/Donate.tsx` (if wiring payments)
- `src/components/sita/shell/desktop/DesktopQuickActionsWidget.tsx` (console.log cleanup)
- `public/generated/MASTER_AUDIT.md` (truth refresh)

## What this delivers
- The only CRITICAL security finding (`cloud_worker_jobs`) is closed
- 10 admin-internal tables stop leaking privilege model to regular users
- 5 public forms get basic field validation against spam/abuse
- 3 sensitive tables stop broadcasting to non-admin Realtime subscribers
- Security scan drops from 25 findings to near-zero

