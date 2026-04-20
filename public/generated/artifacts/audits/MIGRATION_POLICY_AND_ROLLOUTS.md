# Migration Policy and Rollouts — SITA OS

> **Authority:** `src/lib/db/migration-registry.ts`
> **Source of truth:** `supabase/migrations/*.sql`

## 1. Naming Convention

```
<14-digit-timestamp>_<uuid>.sql
```

Example: `20260416152158_5825aa76-69c4-4e00-b434-ecfe3669746a.sql`

The timestamp ensures lexical sort matches application order. **Never rename a migration that has been applied.**

## 2. Header Comment Template

Every new migration **MUST** start with:

```sql
-- ═══════════════════════════════════════════════════════════════
-- Migration: <short title>
-- Domain: <bounded-context-key>     (e.g. ai-workforce, finance)
-- Owner: <team-name>
-- Risk: <low|medium|high|critical>
-- Reversible: <yes|no|partial>
-- ═══════════════════════════════════════════════════════════════
```

## 3. Categories (auto-detected by generator)

| Category | Detection rule |
|---|---|
| `table-creation` | `CREATE TABLE` |
| `rls-policy` | `CREATE POLICY` (no functions) |
| `function-trigger` | `CREATE FUNCTION` / `CREATE TRIGGER` |
| `view` | `CREATE VIEW` |
| `enum` | `CREATE TYPE ... AS ENUM` |
| `index` | `CREATE INDEX` (no ALTER) |
| `seed-data` | `INSERT INTO` |
| `extension` | `CREATE EXTENSION` |
| `destructive` | `DROP` or `TRUNCATE` |
| `schema-alteration` | `ALTER TABLE` (default fallback) |

## 4. Risk Tiers

| Tier | Triggers | Required gates |
|---|---|---|
| `low` | Additive (new tables, indexes, functions) | PR review |
| `medium` | Mutative (column type changes) | PR review + staging soak |
| `high` | ALTER TABLE on populated tables | PR review + staging soak + DBA sign-off |
| `critical` | DROP / TRUNCATE / data loss risk | All gates + executive sign-off + backup proof |

## 5. Release Consequences

- `additive` — Safe to roll forward; backward compatible
- `mutative` — May break older code paths; coordinate with deploy
- `policy-only` — RLS-only change; can hot-fix
- `destructive` — Irreversible; requires rollback plan + backup verification

## 6. Rollback Policy

- **Additive migrations**: rollback by reverse migration if needed
- **Mutative migrations**: forward-fix preferred over rollback
- **Destructive migrations**: NO rollback; restore from backup
- Every `destructive` or `high`-risk migration MUST include a paired `_rollback.sql` template in PR description

## 7. Forbidden Patterns

- `ALTER DATABASE` statements (Supabase-managed)
- Modifying `auth.*`, `storage.*`, `realtime.*`, `supabase_functions.*`, `vault.*` schemas
- `CHECK` constraints with non-immutable expressions (use validation triggers)
- Migrations without RLS for new tables holding user data
- Cross-tenant data backfills without explicit `policy-only` migration first

## 8. Validation

```bash
npx tsx scripts/db/generate/generate-migration-registry.ts  # rebuild
npx tsx scripts/db/checks/check-migration-ownership.ts      # CI gate
npx tsx scripts/db/migrations/data-migration-validation.ts  # destructive check
```

CI fails when: a migration file exists that is not in the registry, or the registry references a missing file.
