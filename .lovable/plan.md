

# SITA OS — Service Layer Consolidation & Authority Hardening

## Current State (Audited)

| Layer | Files | Role |
|-------|-------|------|
| `core-services/` | 220 files (47 root `.ts` + 25 subdirs) | Mix of canonical implementations + orchestration infra |
| `services/` | 479 files (170+ subdirs) | Mix of canonical services + 15 thin wrappers re-exporting core-services |
| `data-services/` | 33 files | Mode-aware Supabase CRUD + demo data (read-model clients) |
| `engines/` | 60 files | Domain logic engines (scoring, planning, intelligence) |
| `boardroom/` | 6 files | Boardroom packet generation + types |
| `ai/` | 16 files | AI capability client + routing |
| `advisor-intelligence/` | 11 files | Advisor evaluation + recommendation |
| `domain-engines/` | 9 files | Domain OS adapters |

**Key findings:**
- **38 duplicate directory names** between `core-services/` and `services/` (approval-engine, brain-core, model-router, event-bus, etc.)
- **15 services/ subdirs** are pure 2-line re-exports from core-services (brain-core, model-router, trust-governor, etc.)
- `core-services/index.ts` does `export * from "@/lib/services"` then re-exports its own local files — creating circular authority
- `data-services/` are actually well-structured mode-aware Supabase clients — these are **Layer 5 clients**, not services
- **141 files** import directly from `core-services/`, **183** from `services/`, **34** from `data-services/`, **143** from `engines/`

## Plan

### Phase 1 — Service Authority Map & Governance Docs (no file moves)

**Create governance infrastructure:**
1. `src/lib/migration/service-authority-map.ts` — machine-readable classification of every service file into one of 5 layers
2. `src/lib/migration/duplicate-service-map.ts` — mapping of all 38 duplicate families with canonical winner + merge strategy
3. `src/lib/migration/deprecation-map.ts` — tracking wrapper lifecycle
4. `docs/architecture/SERVICE_LAYER_CONSTITUTION.md` — the 5-layer rules
5. Run audit script to classify all ~830 service files

### Phase 2 — Collapse 15 Pure Wrapper Directories

The 15 `services/` subdirs that are 2-3 line re-exports of `core-services/` (brain-core, model-router, trust-governor, conscience-gate, inference-gateway, lease-manager, mnemosyne, approval-engine, constitution-compiler, fleet-health, fraud-sentinel, governance-simulator, immune-controller, search-fabric, self-healing) will be:
- Kept as-is (thin wrappers) — they're already correct compatibility shims
- Marked `@deprecated` with canonical path comments pointing to `core-services/`
- Registered in deprecation-map

### Phase 3 — Fix Authority Inversion in `core-services/index.ts`

Currently `core-services/index.ts` line 25 does `export * from "@/lib/services"` — this inverts the intended hierarchy. Fix:
- Remove the `export * from "@/lib/services"` from `core-services/index.ts`
- Make `core-services/index.ts` export ONLY its own local files (platform infrastructure)
- Make `services/index.ts` the canonical barrel for domain + extended services
- Create a new top-level `src/lib/service-facade.ts` that composes both barrels for consumers that need everything

### Phase 4 — Reclassify `data-services/` as Clients

`data-services/` files are mode-aware Supabase CRUD clients (fetchCustomers, fetchInvestments, etc.). They belong in Layer 5 (UI Clients):
- Rename barrel path: `src/lib/data-services/` → keep in place but add classification header
- Add `@layer client` doc comments to every file
- Register in authority map as `UI_CLIENT`
- No file moves needed — they're already well-isolated

### Phase 5 — Classify `engines/` as Domain Services

The 60 files in `engines/` are domain logic (lead scoring, business profiling, strategic planning, revenue opportunity, etc.):
- Add `@layer domain` classification headers
- Register in authority map as `DOMAIN_CANONICAL`
- No file moves needed — they're already well-separated

### Phase 6 — Enforcement Tests

Add to `scripts/architecture/checks/`:
1. `check-service-layer-boundaries.ts` — assert no forbidden cross-layer imports:
   - Domain services cannot import UI hooks or pages
   - Projections cannot import execution/mutation logic
   - Clients cannot import deep platform internals
   - Hooks cannot contain domain business logic (>50 lines of non-React code = violation)
2. `check-service-authority-unique.ts` — assert each service family has exactly one canonical owner
3. `check-wrapper-purity.ts` — assert wrapper files contain only re-exports
4. `check-projection-purity.ts` — assert projection services don't mutate state
5. Wire all into `scripts/architecture/run-service-governance.ts`

### Phase 7 — Import Hygiene Sweep

Update all 141 files that import directly from `core-services/` subdirs:
- Test files → leave (test imports are acceptable)
- `services/*/index.ts` wrappers → leave (that's their job)
- `persistence/` bridges → update to import from canonical barrel
- `demo-data/` → update to import from canonical barrel
- `orchestration-pipeline/` → update to import from canonical barrel
- All others → point to the correct layer barrel

### Phase 8 — Generated Artifacts & Verification

1. Generate `generated/service-authority-report.json` with full classification
2. Update `generated/COMPONENT_GOVERNANCE_REPORT.md` → add service governance section
3. Register new manifests in `manifest-registry.ts`
4. Run `tsc --noEmit` + `bun run build` → zero errors
5. Run all 5 new governance checks → all green

## What This Does NOT Do (Intentionally)

- **No file moves** for working services — classification-in-place is safer than mass reorganization
- **No folder restructuring** to `platform/domains/integrations/projections/clients/` — the existing `core-services/` + `services/` + `data-services/` + `engines/` structure already maps cleanly to the 5-layer model once authority is fixed
- **No behavioral changes** — only governance, classification, import hygiene, and enforcement

## Deliverables

- Service Authority Map (machine-readable)
- Duplicate Service Map (38 families classified)
- Deprecation Map (15 wrappers tracked)
- Service Layer Constitution doc
- 5 enforcement test scripts
- Fixed authority inversion in core-services barrel
- Import hygiene across 141+ files
- Zero breaking changes, green build

