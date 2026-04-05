
# SITA OS — Persistence Wiring Plan (Hybrid Approach)

## Phase 1: Foundation — Generic Persistence Adapter + Key Tables Migration

### 1A. Database Migration — Create dedicated tables for high-value data
- `engine_state` — generic key-value store for serialized engine state (per user, per engine)
- `engine_events` — append-only event log for engine actions
- `intelligence_assets` — dedicated table for intelligence reuse assets
- `intelligence_efficiency_scores` — dedicated table for AI efficiency metrics
- `quality_floor_configs` — dedicated table for quality floor rules
- `compute_budget_snapshots` — dedicated table for compute governance snapshots
- `operator_taste_profiles` — dedicated table for operator preference memory
- All with RLS (user_id = auth.uid())

### 1B. Create `src/lib/persistence/engine-persistence-adapter.ts`
- Generic `persistEngineState(engineName, userId, state)` → upsert to `engine_state`
- Generic `loadEngineState(engineName, userId)` → select from `engine_state`
- Generic `appendEngineEvent(engineName, userId, event)` → insert to `engine_events`
- Debounced auto-save (500ms) to avoid write spam

### 1C. Create dedicated persistence modules
- `src/lib/persistence/intelligence-asset-persistence.ts` — CRUD for `intelligence_assets`
- `src/lib/persistence/efficiency-persistence.ts` — CRUD for `intelligence_efficiency_scores`
- `src/lib/persistence/quality-floor-persistence.ts` — CRUD for `quality_floor_configs`
- `src/lib/persistence/compute-governance-persistence.ts` — CRUD for `compute_budget_snapshots`
- `src/lib/persistence/operator-taste-persistence.ts` — CRUD for `operator_taste_profiles`

## Phase 2: Wire Core Services (42 files)
- Wire `EventBus` to persist events to `engine_events`
- Wire `MemoryGovernanceEngine` to persist/load from `engine_state`
- Wire `PolicyDepthEngine` state persistence
- Wire `ActionStateMachine` to log transitions to `engine_events`
- Wire `AdvisorOrchestrationEngine`, `EntityRoleGraph`, `DigitalTwinEngine`, etc.
- Update `useOSRuntime` to load persisted state on mount and auto-save on changes

## Phase 3: Wire Strategic Intelligence (13 files)
- Wire `IntelligenceCapitalIndex` computations to persist snapshots
- Wire `QualityFloorEngine` rules to `quality_floor_configs`
- Wire `OperatorTasteMemory` to `operator_taste_profiles`
- Wire `BenchmarkLab` results to `engine_events`
- Wire remaining 9 modules via generic adapter

## Phase 4: Wire Compute Governance (7 files)
- Wire `TaskClassifier`, `ModelRouter`, `BudgetPolicyEngine` state to dedicated + generic tables
- Wire `MarginProtection`, `MissionCostTracker` metrics to `compute_budget_snapshots`

## Phase 5: Wire Intelligence Architecture (12 files)
- Wire `IntelligenceAssetLibrary` to `intelligence_assets` table
- Wire `DifferentialReasoningEngine` outputs to `engine_events`
- Wire `EfficiencyScoreboard` to `intelligence_efficiency_scores`
- Wire remaining modules via generic adapter

## Validation
- Build passes (`tsc --noEmit`)
- Data persists across page refresh
- RLS prevents cross-user data access
