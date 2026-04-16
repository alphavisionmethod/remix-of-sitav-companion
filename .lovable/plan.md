

## Markdown Audit & Refresh Plan

### Inventory (143 .md files, ~49k lines)

| Group | Count | Action |
|---|---|---|
| `generated/**` (audit reports) | 22 | **Regenerate stats** — counts are stale (75 EFs vs live 85, 161 migrations vs 164, 911 components vs 897, 4263 files vs 5170+) |
| `docs/architecture/**` (48) | 48 | **Update where stale**, keep as-is otherwise |
| `docs/refactor/**` (9) | 9 | **Mark as "Future Monorepo Target — Aspirational"** (they describe a migration that didn't happen; keep as reference) |
| `docs/REAL_VS_SIMULATED.md`, `docs/self-hosted-deployment.md`, `docs/vmware-deployment.md` | 3 | Spot-check + refresh |
| `infra/docs/**` (12) | 12 | OS architecture specs — review & refresh stats |
| `security/**` (8) | 8 | Threat models + policies — keep, verify dates |
| `src/planes/**` (7) | 7 | Manifests — verify directory references |
| `supabase/{docs,policies,schema,seed}/README.md` (4) | 4 | Refresh table/policy counts |
| `scripts/**/README.md` (24) | 24 | Mostly stub READMEs — keep concise, verify accurate |
| `src/lib/architecture/DIRECTORY_ORGANIZATION.md` | 1 | Refresh |
| Root `README.md` | 1 | **Currently empty TODO — write proper project README** |
| Root `description.md` | 1 | **DELETE — outdated 4511-file inventory, superseded by `generated/DEPLOYMENT_AUDIT.md`** |
| `.lovable/plan.md` | 1 | Auto-managed, skip |
| `scripts/legacy/archived-phase-scripts/RENAMING_MAP.md` | 1 | Historical record, keep |

### Authoritative Live Stats (to propagate everywhere)
- 201 tables · 4 views · 100% RLS coverage (358 policies)
- 85 edge functions · 164 migrations
- 1012 pages · 897 components · 158 hooks · 1665 lib modules
- 246 scripts · 94 generated artifacts · 34 packages · 27 contexts
- 7 SECURITY DEFINER functions (incl. new `get_db_truth_snapshot`)

### Files to DELETE (truly obsolete)
1. `description.md` — 4511-file snapshot from older audit, fully superseded by `generated/DEPLOYMENT_AUDIT.md` and `generated/FULL_MASTER_AUDIT.md`. **Delete.**
2. `generated/refactor/GLOBAL_REFACTOR_*.md` (6 files) — one-time global refactor verification logs from 2026-04-16, all "✅ PASS". **Consolidate into 1 archived `GLOBAL_REFACTOR_FINAL_REPORT.md`** under `generated/refactor/`.
3. `generated/remediation/REMEDIATION_*.md` (7 files) — same pattern, one-time remediation logs. **Consolidate into 1 `REMEDIATION_FINAL_REPORT.md`**.
4. `generated/deployment-readiness/SECONDARY_REFACTOR_DISCOVERIES.md` — superseded by `FULL_ISSUES_AND_FIXES.md`. **Delete.**

Net delete: 1 file. Net consolidate: 13 → 2.

### Files to UPDATE (stat refresh + content sync)

**Top priority — stale counts**
- `README.md` — write proper project README (currently 2 lines)
- `generated/FULL_MASTER_AUDIT.md` — refresh snapshot line + grades
- `generated/DEPLOYMENT_AUDIT.md` — refresh header counts
- `generated/FULL_ISSUES_AND_FIXES.md` — refresh codebase snapshot + reflect DB Truth completion (closes ~5 issues)
- `generated/COMPONENT_GOVERNANCE_REPORT.md` — refresh component count
- `generated/SERVICE_GOVERNANCE_REPORT.md` — verify file scan counts
- `generated/RUNTIME_TIER_GOVERNANCE_REPORT.md` — verify
- `generated/production-truth-dashboard.md` — refresh dates + add DB Truth Plane row
- `generated/drift-report.md` — refresh artifact count (49 → 94)

**Architecture docs needing DB Truth Plane mention**
- `docs/architecture/BACKEND_TOPOLOGY_MAP.md` — bump 84→85 EF count, add `db-truth-introspect`
- `docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md` — add `/admin/db-truth-explorer` to Health domain
- `docs/architecture/DATABASE_ARCHITECTURE.md` + 5 sibling DB docs — verify metadata & cross-link

**Refactor docs (mark aspirational)**
- Add banner to all 9 `docs/refactor/*.md`: *"Status: Future Monorepo Target — Reference design for post-Lovable migration. Current platform remains a single Vite SPA + Lovable Cloud."*

**Supabase READMEs**
- `supabase/docs/README.md`, `supabase/schema/README.md`, `supabase/policies/README.md`, `supabase/seed/README.md` — refresh table/policy/migration counts

**Plane manifests** (`src/planes/*.md`) — verify each listed directory still exists; minor refresh

### Approach
Use a single TypeScript script `scripts/docs/refresh-all-md.ts` that:
1. Reads live stats from filesystem + DB introspection
2. Applies sed-like in-place updates to known stat lines (regex patterns)
3. Adds banners to refactor docs
4. Writes a fresh root `README.md`
5. Deletes the obsolete files
6. Consolidates the 13 refactor/remediation reports into 2 archives
7. Emits a `generated/MARKDOWN_REFRESH_REPORT.md` summarizing what changed

Then manual targeted edits for the architecture docs that need narrative changes (not just counts).

### Deliverables
- 1 file deleted: `description.md`
- 11 files archived/consolidated: 6 refactor + 7 remediation + 1 secondary discoveries → 2 final reports
- ~30 files updated with live stats
- New proper root `README.md`
- New `generated/MARKDOWN_REFRESH_REPORT.md` audit trail
- All 143 → 132 .md files, every one current to live system as of 2026-04-16

### Non-Negotiable Rules
- No invented numbers — every stat sourced from filesystem or live DB introspection
- Refactor docs are kept (with aspirational banner) — they describe a real future plan
- No deletion of architecture spec docs — only redundant audit logs
- All changes preserve Manifest Truth Framework, Backend Topology, Admin Control Plane consolidation, and DB Truth Plane

