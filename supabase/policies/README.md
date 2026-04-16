# Supabase RLS Policy Documentation

This directory contains documentation for Row-Level Security policies.

## Coverage

All 201 tables have RLS enabled with 332 total policies.

## Policy Patterns

| Pattern | Description | Tables |
|---------|-------------|--------|
| `user_id_match` | `auth.uid() = user_id` | ~180 tables |
| `owner_id_match` | `auth.uid() = owner_id` | organizations, cloud_tenants |
| `actor_user_id_match` | `auth.uid() = actor_user_id` | admin_action_audit, admin_action_confirmations |
| `public_read` | Public SELECT, authenticated write | profiles |
| `read_only` | SELECT only | capabilities |
| `append_only` | INSERT + SELECT only | audit_logs, tenant_firewall_logs |
| `admin_role` | Requires admin role | user_roles |

## Registry

The programmatic RLS registry is at `src/lib/db/rls-policy-registry.ts`.

## Security Functions

- `has_role(user_id, role)` — SECURITY DEFINER role check
- `has_admin_permission(user_id, permission)` — SECURITY DEFINER permission check
- `is_org_member(user_id, org_id)` — SECURITY DEFINER org membership check
- `is_tenant_member(user_id, tenant_id)` — SECURITY DEFINER tenant membership check
