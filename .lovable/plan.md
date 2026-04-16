

## Phase 10 — Close the Reality Gap (make registries match disk truth)

### What I found in the audit

All 11 gates report green, but they only validate small hand-curated subsets:

| Surface | Registered | Real on disk | Coverage |
|---|---|---|---|
| Pages with state contracts | 17 | ~990 | **1.7%** |
| Edge functions in membership map | 0 | 85 | **0%** |
| Tables in membership map | 0 | 201 | **0%** |
| Routes in membership map | 18 | 25 in route-registry | 72% |
| Features classified | 19 | dozens of product surfaces | partial |
| Bounded contexts | 13 | (target: full domain coverage) | partial |

The gates are passing because they only assert "every *registered* item is internally consistent." None of them assert "every *real* item on disk is registered." That is the deployment lie this phase closes.

### Goal

Every page on disk, every edge function on disk, every table in the database, and every product feature shipped in code must be **classified** in the truth registries — and the CI gates must **fail** if any new file or table appears without a registry entry. This is what makes "100% reality" enforceable rather than aspirational.

### Sub-phase 10.1 — Auto-discovery + completeness gates (~600 LOC)

Add disk-walking gates that compare reality to registry:

1. `check-page-registry-completeness.ts` — walks `src/pages/**/*.tsx`, classifies each as `critical | secondary | dev-only` via path heuristic, and fails if any `critical` page is missing from `page-state-registry`.
2. `check-edge-function-membership-completeness.ts` — walks `supabase/functions/*/index.ts` and fails if any function isn't claimed in `context-membership-map`.
3. `check-table-membership-completeness.ts` — pulls the live table list via `get_db_truth_snapshot('schema')` (or reads `generated/db-schema-snapshot.json`) and fails on unclaimed tables.
4. `check-route-registry-completeness.ts` — diffs `route-registry.ts` against actual `<Route path=>` declarations in `src/routes/**`.

Each gate emits a typed report at `generated/<gate>-report.json` listing the orphans.

### Sub-phase 10.2 — Backfill the registries (~1,800 LOC across data files)

Use the orphan reports from 10.1 to backfill:

1. **Edge function membership** — add all 85 functions to `context-membership-map.ts`, mapping each to the correct bounded context using their existing topology classification (admin-bff, domain, runtime, connector-webhook, orchestration).
2. **Table membership** — add all 201 tables, grouped by domain (auth → identity, invoices → finance, leads → business, agent_* → ai-runtime, etc.).
3. **Page state coverage** — classify the ~990 pages into 4 buckets (critical product, admin, internal-execution, dev/preview). For all `critical` and `admin` pages, add `page-state-registry` entries with declared loading/empty/error/degraded states. Generate via a one-time script that scans for the existing `<LoadingState/>`, `<EmptyState/>`, `<ErrorState/>` markers and seeds the registry, then we manually patch gaps.
4. **Bounded contexts** — expand from 13 to the full set required to own every function/table (likely 18–22 contexts: identity, finance, business, concierge, communications, files, ai-runtime, observability, governance, integrations, mobile, desktop, appliance, admin-control, support-ops, releases, security, web-public, search, billing, notifications, marketplace).

### Sub-phase 10.3 — Wire completeness gates into the umbrella (~150 LOC)

1. Register the 4 new gates in `ci-gate-registry.ts` under a new phase: `phase-10-completeness`.
2. Add a `META05CompletenessMatrix.tsx` admin page at `/admin/meta/completeness` that shows live coverage per dimension (pages, fns, tables, routes) with drill-down to orphans.
3. Update `META04ProductReality` to surface the new completeness scores alongside the existing reality scores.

### Sub-phase 10.4 — CTA, mock-leak, and accessibility hardening at scale (~400 LOC)

The existing `check-cta-wiring`, `check-mock-leak`, and accessibility gates only scan registered pages. Re-scope them to scan **every page on disk** in the `critical` and `admin` buckets, not just registered ones. Then triage and fix every real violation surfaced.

### Deliverables Summary

| Sub-phase | New files | LOC | New CI gates |
|---|---|---|---|
| 10.1 Completeness gates | 4 scripts + 4 reports | ~600 | **4** |
| 10.2 Registry backfill | 4 lib data files updated | ~1,800 | — |
| 10.3 Umbrella + admin | 1 page + registry update | ~150 | — |
| 10.4 Re-scope existing gates | 3 script edits | ~400 | — |
| **Total** | ~12 files | **~2,950 LOC** | **4 new gates** |

### Acceptance Criteria (the real "100% ready")

- `check-page-registry-completeness` passes with **0 orphan critical pages**.
- `check-edge-function-membership-completeness` passes with **0 unclaimed functions** out of 85.
- `check-table-membership-completeness` passes with **0 unclaimed tables** out of 201.
- `check-route-registry-completeness` passes with **0 unregistered routes**.
- `META04ProductReality` and `META05CompletenessMatrix` both render green at runtime.
- The CI Umbrella reports **20 gates total, all green**, validated against disk truth — not against itself.

Only when all four completeness gates are green can the project honestly claim "100% reality, deployable."

