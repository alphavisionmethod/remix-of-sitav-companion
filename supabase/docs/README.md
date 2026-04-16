# Supabase Database Documentation

This directory contains database documentation for SITA OS.

## Architecture

- **201 tables** across 14 domains
- **332 RLS policies** with 100% coverage
- **7 database functions** (security definers for RBAC)
- **4 views** for aggregated reporting
- **164 migrations** tracking schema evolution

## Key References

| Resource | Location |
|----------|----------|
| Schema Registry | `src/lib/db/schema-registry.ts` |
| Table Ownership | `src/lib/db/table-ownership-map.ts` |
| Tenancy Boundaries | `src/lib/db/tenancy-boundary-map.ts` |
| RLS Policies | `src/lib/db/rls-policy-registry.ts` |
| Migration Registry | `src/lib/db/migration-registry.ts` |
| Truth Assertions | `src/lib/db/db-truth-registry.ts` |
| Dependency Graph | `src/lib/db/db-dependency-map.ts` |
| Audit Requirements | `src/lib/db/db-audit-registry.ts` |
| Health Engine | `src/lib/db/db-health-engine.ts` |

## Database Functions

| Function | Type | Purpose |
|----------|------|---------|
| `handle_new_user()` | Trigger | Auto-creates profile on signup |
| `has_role()` | Security Definer | Checks user role without RLS recursion |
| `has_admin_permission()` | Security Definer | Checks admin permissions |
| `is_org_member()` | Security Definer | Checks org membership |
| `is_org_owner()` | Security Definer | Checks org ownership |
| `is_tenant_member()` | Security Definer | Checks tenant membership |
| `update_updated_at_column()` | Trigger | Auto-updates updated_at timestamp |
