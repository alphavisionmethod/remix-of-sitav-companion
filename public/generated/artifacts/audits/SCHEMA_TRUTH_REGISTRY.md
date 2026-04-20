# Schema Truth Registry — SITA OS

> **Authority:** `src/lib/db/schema-registry.ts`
> **Source of truth:** live `pg_tables` + `information_schema.columns`
> **Generator:** `scripts/db/generate/generate-schema-registry.ts`

## 1. Purpose

The Schema Truth Registry is the **canonical inventory of every database table** in SITA OS. It is the single source from which all DB-derived artifacts (RLS registry, tenancy map, ownership map, dependency graph, runtime consequence map) are computed.

## 2. Entry Shape

```ts
interface TableRegistryEntry {
  name: string;                    // e.g. "advisor_agents"
  domain: DbDomain;                // bounded context (14 domains)
  schemaClass: SchemaClass;        // write | read | log | config | system
  hasRls: boolean;                 // true for 100% of tables
  policyCount: number;             // live policy count from pg_policies
  tenancyColumn: string | null;    // user_id | actor_user_id | owner_id | org_id | tenant_id | null
  sensitiveData: boolean;          // contains tokens/credentials/PII
}
```

## 3. Current Inventory

- **Total tables:** 201
- **Total policies:** 358
- **RLS coverage:** 100% (zero unprotected tables)
- **Tenancy-scoped:** 160 tables
- **Sensitive-data tables:** 8

## 4. Regeneration

```bash
# Rebuild from live PG (requires PGHOST)
npx tsx scripts/db/generate/generate-schema-registry.ts

# Validate registry vs live PG
npx tsx scripts/db/checks/check-schema-registry.ts
```

## 5. CI Enforcement

`check-schema-registry.ts` fails the build when:
- A live table exists that is NOT in the registry (regenerate)
- A registry entry references a table that does NOT exist (phantom)
- A required metadata field is missing from any entry

## 6. Consumers

The registry is consumed by:
- `rls-policy-registry.ts` — pulls table list
- `tenancy-boundary-map.ts` — pulls table list + tenancy column
- `table-ownership-map.ts` — assigns canonical writers/readers
- `db-truth-registry.ts` — aggregates everything
- All admin DB visibility pages (Schema Explorer, Drift Radar, etc.)
- The persistence audit (`generate-persistence-audit.ts`)

## 7. Anti-Patterns Forbidden

- Hand-editing the registry (always regenerate from live PG)
- Adding tables to migrations without regenerating the registry
- Marking `hasRls: true` without an actual `ENABLE ROW LEVEL SECURITY` migration
