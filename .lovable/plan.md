

# Platform Truth & Implementation Verification System — Implementation Plan

## Existing Infrastructure Audit

The project already has significant verification infrastructure that must NOT be duplicated:

| Existing System | Location | What It Does |
|---|---|---|
| Reality Classification Matrix | `RealityClassificationMatrix.tsx` + `reality_classifications` table | Classifies routes as presentational/simulated/persisted/proven |
| Route Reality Heatmap | `RouteRealityHeatmap.tsx` | Visual route-level reality state |
| Domain Reality Board | `DomainRealityBoard.tsx` | Per-domain implementation truth |
| Mock Elimination Center | `MockEliminationCenter.tsx` | Tracks mock→real migration |
| Mock Replacement Program | `MockReplacementProgram.tsx` | Detailed mock replacement tracking |
| Platform Truth Dashboard | `PlatformTruthDashboard.tsx` (Mission Control tab) | Projections, degraded states, launch gates, registries |
| Validation Command Center | `ValidationCommandCenter.tsx` (Atlas) | Coverage, architecture, readiness scoring |
| Truth Index Dashboard | `TruthIndexDashboard.tsx` | Real-time truth indices from DB |
| Generated Truth Dashboard | `GeneratedTruthDashboard.tsx` | JSON manifest validation |
| SERV01-06 | Service ownership, domain ownership, route trace, duplication, canonical actions, flagship trace |
| FIP system (14 screens) | Feature intake, specs, compliance, readiness, rollout, deprecation, memory graph, observability |
| Persistence Drift Radar | `PersistenceDriftRadar.tsx` | Persistence gap detection |
| LT01-07 | Behavioral truth, CI pipeline, E2E journeys, runtime probes, launch gates, route interaction, regression radar |
| Architecture scripts (17) | `scripts/architecture/` | Boundary, contract, event, policy, proof checks |

**What is genuinely missing (the 10-layer gap analysis):**

1. **Spec-to-Implementation Registry** — No unified registry mapping every major system to its required routes/components/services/contracts/tests with completion status
2. **Feature Verification Manifests** — No machine-readable manifest per feature declaring expected artifacts
3. **Wiring Graph** — No end-to-end trace visualization (spec → route → hook → contract → service → event → projection → proof)
4. **Contract Verification Dashboard** — No unified view of contract existence, consumer/implementer alignment, shadow detection
5. **Prompt-to-Build Traceability** — No tracking of which prompts created which features
6. **Implementation Truth Center** — No unified hub aggregating all verification layers into one command surface

---

## Implementation Plan

### Database: 2 New Tables

**`implementation_spec_registry`** — Canonical record of every major system/feature
- `id`, `user_id`, `spec_id` (unique key like `money-office`), `canonical_name`, `owning_module`, `description`
- `required_routes text[]`, `required_components text[]`, `required_services text[]`, `required_contracts text[]`, `required_events text[]`, `required_tests text[]`, `required_proofs text[]`
- `implementation_status` (enum: not_started, scaffolded, partial, advanced_unwired, wired_unproven, proven, launch_ready)
- `prompt_origin text`, `acceptance_criteria text[]`, `dependencies text[]`
- `spec_score int`, `ui_score int`, `contract_score int`, `wiring_score int`, `runtime_score int`, `overall_readiness int`
- `last_verified_at`, `created_at`, `updated_at`
- RLS: user-scoped CRUD

**`implementation_wiring_edges`** — Directed graph edges for wiring visualization
- `id`, `user_id`, `spec_id`, `source_type` (route/component/hook/contract/service/event/projection/proof), `source_name`, `target_type`, `target_name`
- `status` (connected/broken/missing), `evidence text`, `verified_at`
- RLS: user-scoped CRUD

### New Hook: `src/hooks/use-implementation-truth.ts`
- `useSpecRegistry()` — CRUD for spec registry records
- `useWiringEdges(specId)` — fetch/create wiring edges
- `useImplementationStats()` — aggregate readiness scores
- `useContractVerification()` — cross-references `contract-manifest.json` + `reality_classifications` + spec registry
- `useDriftDetection()` — compares spec requirements vs actual route/component existence
- All with demo data fallback via `useDataMode()`

### New Hook: `src/hooks/use-spec-seed.ts`
- Seeds ~20 canonical spec registry entries (money-office, revenue-office, digital-presence, ai-engineering-board, compute-governance, intelligence-architecture, admin-control-plane, onboarding-ceremony, etc.) on first use
- Each entry has accurate `required_routes`, `required_components`, `required_services` from the actual codebase

### 6 New Pages (Implementation Truth Center)

All under `/admin/implementation-truth/*`, inside existing `AdminShellLayout`:

**ITC01 — Implementation Truth Overview** (`/admin/implementation-truth`)
- Hero band: total specs, average readiness %, specs by status tier
- Readiness heatmap by module/domain
- Top gaps list, recent drift alerts
- Links to all sub-pages

**ITC02 — Spec Registry** (`/admin/implementation-truth/specs`)
- Full CRUD table of all registered features/systems
- Per-spec: name, module, status, readiness scores (spec/UI/contract/wiring/runtime)
- Inline scoring, search/filter by domain, expandable detail with required artifacts checklist
- Auto-seed button for canonical specs

**ITC03 — Contract Verification Board** (`/admin/implementation-truth/contracts`)
- Reads from `generated/contract-manifest.json` + spec registry + reality classifications
- Shows: all contracts, their package, consumers, implementers, alignment status
- Detects: missing contracts, shadow/duplicate contracts, unused contracts
- Per-spec contract checklist

**ITC04 — Wiring Graph Explorer** (`/admin/implementation-truth/wiring`)
- Per-spec directed graph: spec → routes → components → hooks → contracts → services → events → projections → proofs
- Each node shows status (present/missing/broken)
- Edge evidence and verification timestamps
- Broken chain highlighting

**ITC05 — Readiness Scorecards** (`/admin/implementation-truth/readiness`)
- Per-feature scorecard: 10 dimensions (spec, UI, contract, backend, wiring, test, runtime, policy/proof, docs, production)
- Status tiers: not_started → scaffolded → partial → advanced_unwired → wired_unproven → proven → launch_ready
- Overall platform readiness composite
- Comparison view across all features

**ITC06 — Drift & Traceability Radar** (`/admin/implementation-truth/drift`)
- Spec says X routes exist → checks if routes are in App.tsx
- Spec says Y components exist → checks if component files exist
- Prompt-to-build traceability: which prompt origin maps to which spec, what's missing
- Cross-references with reality_classifications for reality state
- Drift timeline showing when gaps were detected

### Integration Points (no stubs)

- **Existing Reality Classification system**: ITC reads from `reality_classifications` table for route-level reality state
- **Existing FIP system**: ITC links to feature specs/compliance records where applicable
- **Generated manifests**: ITC reads `route-manifest.json`, `service-manifest.json`, `contract-manifest.json` for verification
- **Architecture scripts**: ITC surfaces results from `architecture-compliance-report.json`
- **Persistence layer**: ITC reads from `os_event_log`, `os_action_lineage`, `sita_receipts` for runtime evidence
- **Truth Index**: ITC incorporates truth index scores as runtime evidence

### Route Registration in App.tsx

6 new routes under `AdminShellLayout`:
```
/admin/implementation-truth
/admin/implementation-truth/specs
/admin/implementation-truth/contracts
/admin/implementation-truth/wiring
/admin/implementation-truth/readiness
/admin/implementation-truth/drift
```

### Sidebar Integration

Add "Implementation Truth" entry under the existing admin navigation group.

### Files Created/Modified

| File | Action |
|------|--------|
| `src/hooks/use-implementation-truth.ts` | **New** — all data hooks |
| `src/hooks/use-spec-seed.ts` | **New** — canonical spec seeder |
| `src/pages/admin/implementation-truth/ITC01Overview.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC02SpecRegistry.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC03ContractVerification.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC04WiringGraph.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC05ReadinessScoreboard.tsx` | **New** |
| `src/pages/admin/implementation-truth/ITC06DriftRadar.tsx` | **New** |
| `src/App.tsx` | **Edit** — add 6 routes + lazy imports |
| Migration SQL | **New** — 2 tables + RLS |

### What This Does NOT Duplicate

- Does NOT recreate route reality heatmap (references existing `reality_classifications`)
- Does NOT recreate mock elimination (links to existing)
- Does NOT recreate architecture scripts (reads their output)
- Does NOT recreate FIP (complementary — FIP = feature lifecycle, ITC = implementation verification)
- Does NOT recreate truth indices (consumes them as evidence)
- Does NOT recreate SERV01-06 (references their data)
- Does NOT recreate persistence drift radar (different scope — ITC is spec-to-implementation, CPS09 is persistence gaps)

