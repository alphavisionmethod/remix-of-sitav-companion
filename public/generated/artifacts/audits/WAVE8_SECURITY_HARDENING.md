# Wave 8 — Security Hardening Report

> **Date:** 2026-04-20
> **Scope:** RLS policy tightening, realtime exposure removal, field validation, console.log cleanup

## 8.1 CRITICAL Fix: `cloud_worker_jobs`

**Before:** User-facing policy used `USING (user_id = auth.uid() OR user_id IS NULL)`, allowing any authenticated user to read/update/delete system-level background jobs.

**After:** Policy changed to `USING (auth.uid() = user_id)`. System jobs (NULL user_id) are only accessible via the existing admin policy or service role.

## 8.2 Admin-Internal Table Lockdown (11 tables)

The following tables had `USING (true)` SELECT policies replaced with `USING (public.has_role(auth.uid(), 'admin'))`:

| Table | Previous | Now |
|---|---|---|
| `cloud_admin_roles` | All authenticated | Admin only |
| `admin_role_permissions` | All authenticated | Admin only |
| `service_identity_registry` | All authenticated | Admin only |
| `ai_provider_registry` | All authenticated | Admin only |
| `environment_configs` | All authenticated | Admin only |
| `incident_classifications` | All authenticated | Admin only |
| `domain_ownership_registry` | All authenticated | Admin only |
| `platform_planes` | All authenticated | Admin only |
| `plane_service_assignments` | All authenticated | Admin only |
| `api_gateway_routes` | All authenticated | Admin only |
| `release_compatibility_matrix` | All authenticated | Admin only |

## 8.3 Public Form Field Validation (5 tables)

| Table | Validation added |
|---|---|
| `waitlist_signups` | `email IS NOT NULL AND email ~* '^.+@.+\..+$'` |
| `beta_applications` | Email validation + `full_name` non-empty |
| `investor_requests` | Email validation + `contact_name` non-empty |
| `donations` | `donor_email` validated if provided |
| `press_inquiries` | Email validation + `contact_name` non-empty |

## 8.4 Realtime Exposure Removal

Removed from `supabase_realtime` publication:
- `hardware_certification_runs` (firmware versions, TPM states)
- `secret_rotation_log` (secret names, rotation results)
- `operator_drill_executions` (runbook/kill-switch drill results)

## 8.6 Console.log Cleanup

- Removed debug `console.log` from `DesktopQuickActionsWidget.tsx`
- Platform SDK logs (nova-sdk, sync-engine) retained as legitimate telemetry

## Remaining Linter Warnings

5 pre-existing `WITH CHECK (true)` warnings remain on non-security-critical tables. These are intentional permissive policies for public marketing forms (now validated via field checks above).

## BLOCK Gate Status

- **248/248 GREEN** — no new errors introduced
- Security scan findings reduced from 25 → near-zero