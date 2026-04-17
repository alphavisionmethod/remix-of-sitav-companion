
The user wants a new master audit file based on the v6.0 template they uploaded, but populated with the **current live state** of the project. They want it saved as a downloadable artifact (in /mnt/documents/ or similar — they said "on files or documents").

I already refreshed `generated/SITA_MASTER_AUDIT.md` to v6.2 in a prior turn with all live metrics. The user now wants that same content delivered as a standalone downloadable artifact named "master audit.md".

Since the v6.2 already exists in the repo with verified live metrics (1,040 pages, 922 components, 303 tables, 652 RLS policies, 128 edge functions, 189 migrations, Phase 32 verdict, ISS-020 resolved, 40/40 canonical backend tables verified), I just need to:

1. Re-verify the headline counts are still current (TS files, pages, components, tables, RLS, edge functions, migrations) — quick live check
2. Pull the latest v6.2 content from `generated/SITA_MASTER_AUDIT.md` as the base
3. Add the **brand new fact** from the most recent turns: all 40 canonical backend tables verified (15 added in migration `20260417223827_*.sql`, type-safe SDK at `src/lib/canonical-backend/index.ts`)
4. Write the result to `/mnt/documents/master-audit.md` as a downloadable artifact
5. Emit a `<lov-artifact>` tag

### Plan

**Output**: `/mnt/documents/master-audit.md` (downloadable)

**Content basis**: Full v6.2 structure from `generated/SITA_MASTER_AUDIT.md` (preserves all 1,200+ lines, all 13 Parts, all tables) + new section for the canonical backend truth layer milestone.

**Live re-verification before writing** (parallel reads):
- `find src -name '*.ts' -o -name '*.tsx' | wc -l`
- `find src/pages -name '*.tsx' | wc -l`
- `find src/components -name '*.tsx' | wc -l`
- `ls supabase/functions/ | wc -l`, `ls supabase/migrations/ | wc -l`, `ls generated/ | wc -l`
- DB: `pg_tables`, `pg_policies`, `pg_views` counts
- Confirm `src/lib/canonical-backend/index.ts` exists

**New section to inject (Part XIV)**: Canonical Backend Truth Layer (40/40)
- All 40 tables verified present
- 15 added in latest migration
- Type-safe SDK barrel at `src/lib/canonical-backend/index.ts`
- Zero duplicates, zero `as any`
- Full table-by-table mapping (canonical name → live table name)

**Bump**: Header → v6.3, date 2026-04-17, method "live-verified + canonical-truth-layer milestone"

**Guardrails**: No section deletions, no invented numbers, every count from live source.

### Acceptance

| Check | Target |
|---|---|
| File exists at `/mnt/documents/master-audit.md` | ✅ |
| All v6.2 sections preserved | ✅ |
| New Part XIV documents 40/40 canonical tables | ✅ |
| Every count re-verified live | ✅ |
| `<lov-artifact>` tag emitted for download | ✅ |
