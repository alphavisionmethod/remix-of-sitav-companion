

# Platform Law & Truth Enforcement System — Implementation Plan

## What Already Exists (will NOT be rebuilt)
- Constitution compiler + editor (personal financial/behavioral rules)
- 14 Implementation Truth pages (ITC01-14)
- 14+ Journey Verification pages (JVC01-14)
- 50+ architecture validation scripts
- Launch gate boards, service ownership, audit compliance
- Architecture compliance board (ITC08)

## What's Missing: The Enforcement Umbrella

The existing systems **verify** truth but don't **enforce** it as law. We need the unified enforcement layer that:
- Codifies platform architecture rules as enforceable laws
- Tracks scaffold/generator compliance
- Monitors CI/PR gate enforcement
- Enforces manifest requirements before "done"
- Shows ownership accountability
- Provides a compliance mode dashboard

## New Pages (7 screens under `/admin/platform-law/`)

### PLE01 — Platform Law Overview
Executive enforcement dashboard. Shows: total laws, enforcement coverage, violation count, blocked merges/launches, compliance score by domain, top violators, recently triggered laws, enforcement mode distribution. Wires to all sub-pages.

### PLE02 — Architecture Law Registry
Browse all platform architecture laws (the 10 hardcore rules + extended set). Each law: ID, name, category, enforcement mode (block/warn/log), scope, violation count, last triggered, linked validation script, linked CI gate. Categories: route-ownership, shell-requirement, contract-ownership, import-boundary, manifest-requirement, interaction-requirement, proof-requirement, naming-convention, test-id-convention, prompt-traceability. Seed with ~30 canonical laws derived from existing architecture rules in `mem://constraints/architecture-rules`.

### PLE03 — Scaffold & Generator Registry  
Catalog of all feature scaffolds/generators. Shows: generator name, what it produces (route, manifest, contract stub, test stub, probe placeholder, command palette registration), last used, compliance coverage. Links to existing `scripts/generate-*.ts` files. Tracks which generators exist vs which are needed.

### PLE04 — CI & PR Gate Monitor
Shows: all CI validation scripts (the 50+ in `scripts/architecture/` and `scripts/validation/`), last run status, pass/fail, blocking vs advisory, affected domains. PR template requirements checklist. Gate enforcement timeline showing recent blocks. Links to existing `CILaunchGateWidget`.

### PLE05 — Manifest Requirement Enforcer
Tracks: which features have manifests, which are missing. Required manifests: feature manifest, interaction registry entries, journey manifests (for P0), contract declarations, route inventory, ownership mapping. Shows % complete per domain. Cross-references ITC02 Spec Registry and V01 Surface Inventory.

### PLE06 — Ownership Accountability Board
Shows: every domain/shell/contract/route/probe owner. Unresolved violations per owner. Drift by owner. Missing manifests by owner. Compliance score per owner. Aggregates data from SERV01/SERV02 ownership registries + ITC spec registry `owning_module`.

### PLE07 — Compliance Mode Dashboard
Unified compliance status across all 7 enforcement layers: Law (PLE02), Scaffolding (PLE03), Static enforcement (CI gates — PLE04), Behavioral enforcement (JVC pages), Runtime enforcement (ITC10, LT04), Release enforcement (ITC13, JVC14, LT05), Governance visibility (this dashboard). Shows layer-by-layer health, overall platform compliance score, and enforcement mode toggle (strict/advisory/learning).

## Data Source: In-Memory Registry (No New DB Tables)

All 7 pages use a single new TypeScript registry file:

**`src/lib/platform-law/platform-law-registry.ts`**
- `PLATFORM_LAWS[]` — ~30 architecture laws with enforcement rules
- `SCAFFOLD_REGISTRY[]` — catalog of generators
- `CI_GATE_REGISTRY[]` — catalog of validation scripts  
- `MANIFEST_REQUIREMENTS[]` — required manifest types per feature class
- `OWNERSHIP_REGISTRY[]` — domain/area owners
- Types: `PlatformLaw`, `ScaffoldEntry`, `CIGateEntry`, `ManifestRequirement`, `OwnershipEntry`

Cross-references existing registries:
- `SURFACE_REGISTRY` from surface-registry.ts
- `CUSTOMER_JOURNEY_REGISTRY` from journey-registry.ts
- `SERVICE_OWNERSHIP_REGISTRY` from service-ownership-registry.ts
- `useSpecRegistry()` for implementation truth data

## Files to Create

| File | Purpose |
|---|---|
| `src/lib/platform-law/platform-law-registry.ts` | Core registry with ~30 laws, scaffolds, CI gates, manifest requirements, ownership |
| `src/pages/admin/platform-law/PLE01Overview.tsx` | Enforcement overview dashboard |
| `src/pages/admin/platform-law/PLE02LawRegistry.tsx` | Architecture law browser with seed, search, filter |
| `src/pages/admin/platform-law/PLE03ScaffoldRegistry.tsx` | Generator/scaffold catalog |
| `src/pages/admin/platform-law/PLE04CIGateMonitor.tsx` | CI/PR gate enforcement monitor |
| `src/pages/admin/platform-law/PLE05ManifestEnforcer.tsx` | Manifest requirement tracking |
| `src/pages/admin/platform-law/PLE06OwnershipBoard.tsx` | Owner accountability with violation counts |
| `src/pages/admin/platform-law/PLE07ComplianceDashboard.tsx` | 7-layer compliance mode view |

## Files to Edit

| File | Change |
|---|---|
| `src/App.tsx` | 7 lazy imports + 7 routes under `/admin/platform-law/*` |
| `src/components/admin/AdminCommandPalette.tsx` | 7 new navigation entries |

## Technical Approach

- Each page ~150-250 lines, fully advanced with KPI bands, tables, filters, badges, drill-downs
- Dark theme, premium styling consistent with existing ITC/JVC pages
- All data from in-memory registries — no DB needed
- Cross-links to existing truth pages (ITC, JVC, LT05)
- Touch-friendly, mobile-responsive grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)

