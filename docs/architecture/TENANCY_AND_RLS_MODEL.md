# Tenancy and RLS Model — SITA OS

> **Authority:** `src/lib/db/rls-policy-registry.ts` + `src/lib/db/tenancy-boundary-map.ts`
> **Source of truth:** live `pg_policies`

## 1. The 12 RLS Patterns

Every table in the public schema is classified into exactly one of these patterns:

| Pattern | Predicate | Use case |
|---|---|---|
| `user_id_match` | `auth.uid() = user_id` | Personal user data (default) |
| `actor_user_id_match` | `auth.uid() = actor_user_id` | Audit/action records authored by user |
| `owner_id_match` | `auth.uid() = owner_id` | Owned resources (orgs, tenants) |
| `org_membership` | `is_org_member(auth.uid(), org_id)` | Org-scoped data |
| `tenant_membership` | `is_tenant_member(auth.uid(), tenant_id)` | Cloud-tenant-scoped data |
| `admin_role` | `has_role(auth.uid(), 'admin')` | Admin-only access |
| `admin_permission` | `has_admin_permission(auth.uid(), 'perm')` | Fine-grained admin permission |
| `public_read` | `true` for SELECT, owner check for write | Public profiles |
| `authenticated_all` | `auth.role() = 'authenticated'` | Lookup tables visible to all logged-in users |
| `read_only` | SELECT only | Reference data |
| `append_only` | INSERT + SELECT, no UPDATE/DELETE | Audit/event logs |
| `service_role_only` | Service role bypasses RLS | System-internal tables |

## 2. Security Definer Functions

These functions encapsulate role/tenant checks and **prevent recursive RLS evaluation**:

```sql
public.has_role(_user_id uuid, _role app_role) -- user_roles lookup
public.has_admin_permission(_user_id uuid, _permission text) -- admin role permissions
public.is_org_member(_user_id uuid, _org_id uuid) -- org_members lookup
public.is_org_owner(_user_id uuid, _org_id uuid) -- organization owner
public.is_tenant_member(_user_id uuid, _tenant_id uuid) -- cloud_tenant_memberships
```

All are `SECURITY DEFINER`, `STABLE`, with `search_path='public'`.

## 3. Tenancy Models

Each table declares one tenancy model:

| Model | Tenant key | Cardinality |
|---|---|---|
| `user_id` | `user_id` | Per-user |
| `actor_user_id` | `actor_user_id` | Per-actor (audit) |
| `owner_id` | `owner_id` | Per-owner |
| `org_id` | `org_id` | Per-org |
| `tenant_id` | `tenant_id` | Per-cloud-tenant |
| `global` | (none) | System-wide config |

## 4. Admin & Service-Role Exceptions

For each tenant-scoped table, the registry declares:

- `adminException` — does an admin policy exist that bypasses tenant scoping?
- `serviceRoleException` — does the service role bypass RLS for system writes?
- `crossTenantPolicy` — `deny` (default), `admin-only`, or `service-role-only`

Audit/log tables (e.g., `tenant_firewall_logs`, `admin_action_audit`) typically have `serviceRoleException: true` so the platform can write events without per-row checks.

## 5. Drift Detection

`scripts/db/checks/check-rls-coverage.ts` queries live `pg_policies` and compares per-table policy counts against `rls-policy-registry.ts`. Any mismatch triggers a CI warning; missing tables trigger CI errors.

## 6. Anti-Patterns Forbidden

- Storing roles on `profiles` (use `user_roles` + `has_role`)
- Using direct `auth.users` foreign keys (use `profiles`)
- Recursive RLS (table A's policy queries table B's policy queries table A)
- Tables without RLS (every table must have `ENABLE ROW LEVEL SECURITY`)
- Service-role-only writes that bypass auditability
