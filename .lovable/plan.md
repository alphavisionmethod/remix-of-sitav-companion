

# Implementation Truth Center — Gap Analysis & Completion Plan

## What's Already Built (6 of 10 layers)

| Layer | ITC Page | Status |
|-------|----------|--------|
| 1. Spec Registry | ITC02 | ✅ Full CRUD + seed |
| 3. Contract Registry | ITC03 | ✅ Shadow detection |
| 4. Wiring Graph | ITC04 | ✅ Per-spec chain |
| 8. Readiness Scorecards | ITC05 | ✅ 5-dimension scoring |
| 9. Prompt Traceability | ITC06 | ✅ Phase grouping |
| 10. Drift Radar | ITC06 | ✅ Severity-based |

Also built: 2 DB tables with RLS, data hooks, spec seeder, 6 routes in App.tsx.

## What's Missing (4 layers + sidebar)

| Gap | What's Needed | Existing Infra to Reuse |
|-----|---------------|------------------------|
| **Implementation Map** | Per-spec file/route/component mapping view | Spec registry data already has required_routes/components |
| **Architecture Compliance** | Surface architecture script results in ITC | `generated/architecture-compliance-report.json` exists |
| **Route & Component Inventory** | Unified route inventory with shell/component status | `generated/route-manifest.json`, `reality_classifications` table |
| **Runtime Evidence** | Aggregate runtime probes/evidence per spec | LT01-07 pages exist, `os_event_log`/`sita_receipts` tables |
| **Sidebar Navigation** | ITC entry in admin sidebar | No sidebar entry currently |

## Implementation Plan

### Step 1: Add 4 new ITC pages

**ITC07 — Implementation Map** (`/admin/implementation-truth/map`)
- Per-spec expandable view showing: required routes (present/missing check against route-manifest), required components, required services, required contracts
- Each artifact shows a checkmark if it exists in the codebase manifests
- Reuses `useSpecRegistry()` data — no new DB tables needed

**ITC08 — Architecture Compliance Board** (`/admin/implementation-truth/architecture`)
- Reads `generated/architecture-compliance-report.json` via fetch
- Shows pass/fail for each of the 17 architecture checks
- Score summary, failed check details, last-run timestamp
- Links to the existing architecture scripts

**ITC09 — Route & Component Inventory** (`/admin/implementation-truth/routes`)
- Reads `generated/route-manifest.json` for all routes
- Cross-references with `reality_classifications` table for reality state per route
- Shows: route path, component, domain, shell wrapper status, reality classification
- Highlights orphaned routes and missing components

**ITC10 — Runtime Evidence Center** (`/admin/implementation-truth/runtime`)
- Queries `os_event_log` (recent event count), `sita_receipts` (receipt count), `os_action_lineage` (action count), `os_memory_scoped` (memory count) per domain
- Shows per-spec: events emitted, receipts generated, actions tracked, memory persisted
- "Live" vs "no evidence" badges per spec
- Links to detailed LT01-07 pages for deeper inspection

### Step 2: Update ITC01 Overview
- Add the 4 new sub-pages to the SUB_PAGES navigation array
- Total: 9 sub-page links (specs, contracts, wiring, readiness, drift, map, architecture, routes, runtime)

### Step 3: Wire routes in App.tsx
- 4 new lazy imports + 4 new `<Route>` entries under AdminShellLayout

### Step 4: Add sidebar navigation entry
- Find the admin sidebar/navigation config and add an "Implementation Truth" group with link to `/admin/implementation-truth`

## Files Changed

| File | Action |
|------|--------|
| `src/pages/admin/implementation-truth/ITC07ImplementationMap.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC08ArchitectureCompliance.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC09RouteInventory.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC10RuntimeEvidence.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC01Overview.tsx` | **Edit** — add 4 new sub-page links |
| `src/App.tsx` | **Edit** — 4 lazy imports + 4 routes |
| Admin sidebar config (TBD location) | **Edit** — add ITC nav entry |

No new database tables or migrations needed. All 4 new pages consume existing data sources (spec registry, generated manifests, Supabase tables).

