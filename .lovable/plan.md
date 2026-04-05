

# SITA OS — Comprehensive Gap Closure Implementation Plan

## Audit Summary

After deep inspection of the codebase, database (70 tables), services (60+ service modules), pages (80+ surfaces), and mock/demo data layers, here is the gap analysis mapped to the 8 requirements:

```text
Requirement                          Status      Gap Severity
─────────────────────────────────────────────────────────────
1. Admin durability gaps             PARTIAL     HIGH
2. Projection/read-model truth       PARTIAL     HIGH
3. Execution-chain proof expansion   PARTIAL     MEDIUM
4. Deterministic runtime closure     SCAFFOLDED  HIGH
5. Deployment truth gates            N/A*        LOW
6. VMware promotion gating           N/A*        LOW
7. Documentation drift reduction     PARTIAL     MEDIUM
8. Noncritical surface scoping       DONE        LOW

* Items 5-6 are infrastructure/DevOps concerns outside this
  Lovable frontend+Supabase project scope. Plan covers what
  CAN be done here (admin visibility surfaces).
```

---

## Phase 1: Admin Durability & Persistence Closure (Priority: CRITICAL)

**Problem**: Admin mutations (incidents, policies, connector configs, trust changes) use in-memory services or mock data. Operator actions are not persistence-backed or audit-visible.

### Step 1.1 — Wire Admin Surfaces to Supabase

**Files to modify**: `MissionControlPage.tsx`, `GovernanceDashboard.tsx`, `SystemStatus.tsx`, `PolicyEditor.tsx`, `ConnectorHub.tsx`, `ObservabilityPage.tsx`

**Work**:
- Replace all hardcoded/mock governance data (`DEFAULT_READINESS_INPUT` etc.) with Supabase queries from `incidents`, `policies`, `audit_logs`, `connector_configs`, `trust_state`, `proof_records`
- Add `useMutation` hooks for: create/update incident, update policy, update connector config, change trust posture
- Every mutation must write to `audit_logs` via DB trigger (trigger already exists: `audit_sensitive_change`)
- Add optimistic UI updates with rollback on error

### Step 1.2 — Add Missing Admin Persistence Tables

**New migration**:
- `policy_versions` — version history for policy changes (id, policy_id, version, diff_json, changed_by, created_at)
- `connector_sync_history` — sync attempt log (id, connector_id, status, error, started_at, completed_at, records_synced)
- `operator_actions` — explicit operator action log separate from audit_logs (id, user_id, action_type, target_table, target_id, payload, result, created_at)

### Step 1.3 — Admin Action Receipt Generation

**Work**:
- After every admin mutation (policy change, incident resolution, connector toggle), insert a row into `proof_records` with `proof_type: 'admin_action'`
- Wire `ProofCenter.tsx` to display admin-origin proofs with operator badge
- Add "Admin Actions" filter tab to Activity Stream

**Estimated effort**: 3-4 implementation messages

---

## Phase 2: Projection & Read-Model Materialization (Priority: CRITICAL)

**Problem**: The `ProjectionService` class exists with LRU cache and reducers but runs entirely in-memory (client-side). The `projections` table in Supabase exists but surfaces don't read from it. 34 pages use Supabase, but boardroom/governance/trust surfaces still use mock data or in-memory engines.

### Step 2.1 — Materialize Projections to Supabase

**Work**:
- Create edge function `sync-projections` that:
  - Reads from `events`, `workflow_runs`, `approval_queue`, `incidents`, `proof_records`
  - Computes 6 projection types: boardroom-health, finance-summary, business-pipeline, trust-posture, workflow-status, household-pulse
  - Upserts results into `projections` table (keyed by type + user_id)
  - Called on page load via `supabase.functions.invoke()` or on-demand

### Step 2.2 — Replace Mock Data in Critical Surfaces

**Files**: `Boardroom.tsx`, `DailyPulse.tsx`, `GovernanceDashboard.tsx`, `TrustCenter.tsx`, `MissionControlPage.tsx`

**Work**:
- Replace `mockLeads`, `mockInvoices`, `mockCashFlow` etc. (from `src/lib/mock-data/legacy-display-mocks.ts`) with real Supabase queries
- Boardroom: query `leads` (count by stage), `invoices` (outstanding total), `bills` (due this week), `incidents` (open count), `approval_queue` (pending count)
- DailyPulse: query `events` (today's count), `tasks` (due today), `workflow_runs` (active/failed)
- TrustCenter: query `trust_state` + `proof_records` (verification rate) + `audit_logs` (recent sensitive changes)

### Step 2.3 — Add Staleness Indicators

**Work**:
- Add `updated_at` tracking to projection queries
- If data older than 30 seconds, show amber "Refreshing..." indicator
- If data older than 5 minutes, show "Degraded — last updated X ago" banner
- Never show mock data as if it were real — show explicit "Demo Mode" badge when `useDataMode().isDemo`

### Step 2.4 — Deprecate Legacy Mock Imports

**Work**:
- Audit all imports from `@/lib/mock-data/legacy-display-mocks` and `@/lib/mocks/`
- Replace with Supabase queries or explicit demo-mode fallbacks
- Mark mock-data modules as `@deprecated` with clear "DEMO ONLY" comments

**Estimated effort**: 4-5 implementation messages

---

## Phase 3: Execution-Chain Proof Expansion (Priority: HIGH)

**Problem**: The canonical execution path is well-defined (`canonical-execution-path.ts` — 13 stages). Verification, replay, and rollback services exist as working in-memory classes. But proof generation only covers the "happy path" — missing: approval branches, replay proofs, rollback proofs, multi-step workflow proofs.

### Step 3.1 — Proof Chain Persistence

**Work**:
- Every execution through `CanonicalChainOrchestrator` must write stage-by-stage proof to `proof_records`:
  - `proof_type`: `execution_stage`
  - `metadata`: `{ stage, correlationId, input_hash, output_hash, duration_ms }`
- Add `correlation_id` column to `proof_records` table (migration)
- Add `parent_proof_id` column for chain linking

### Step 3.2 — Approval Branch Proofs

**Work**:
- When approval is requested → insert `proof_records` row with `proof_type: 'approval_requested'`
- When approved/rejected → insert with `proof_type: 'approval_decision'`, link to request proof via `parent_proof_id`
- When execution follows approval → link execution proof to approval proof
- Wire `ApprovalChamber.tsx` and `ApprovalsCenter.tsx` to show proof chain per approval

### Step 3.3 — Replay & Rollback Proof Generation

**Work**:
- `ReplayVerificationService.verifyReplay()` → on completion, write `ReplayVerificationResult` to `proof_records` with `proof_type: 'replay_verification'`
- `detectRollbackCondition()` → when `shouldRollback: true`, write to `proof_records` with `proof_type: 'rollback_signal'`
- Wire `WorkflowReplayHub.tsx` to read replay proofs from Supabase instead of `MOCK_REPLAYABLE_WORKFLOWS`

### Step 3.4 — Proof Bundle Export

**Work**:
- Add "Export Proof Bundle" button to `ProofCenter.tsx` receipt detail panel
- Collects all `proof_records` for a given `correlation_id`
- Generates downloadable JSON with hash verification
- Add proof bundle integrity check (hash chain verification)

**Estimated effort**: 3-4 implementation messages

---

## Phase 4: Deterministic Runtime Closure in Domain Engines (Priority: HIGH)

**Problem**: Finance OS has 28 service files (reserve engine, safe-to-spend, subscription detector, etc.), Business OS has 26 files, Concierge OS has 20 files. These are all well-typed service classes but they operate on in-memory data. None persist results to Supabase or emit events that projections consume.

### Step 4.1 — Finance OS Persistence Layer

**Work**:
- `safe-to-spend.service.ts` → compute from real `bills` + `invoices` + `reserves` Supabase data
- `reserve-engine.service.ts` → read/write `reserves` table
- `subscription-detector.service.ts` → read `subscriptions` table, write detection results to `events`
- `bill-calendar.service.ts` → read `bills` table, compute upcoming obligations
- Create `useFinanceProjection()` hook that calls these services with real Supabase data

### Step 4.2 — Business OS Persistence Layer

**Work**:
- `lead-scoring.service.ts` → compute scores from real `leads` table data
- `stale-lead-detector.service.ts` → query `leads` where last_contact > 14 days
- `opportunity-engine.service.ts` → read `opportunities` table
- `follow-up.service.ts` → query `communications` + `leads` for overdue follow-ups
- Create `useBusinessProjection()` hook

### Step 4.3 — Concierge OS Persistence Layer

**Work**:
- `household-ops.service.ts` → read `household_tasks` + `household_members`
- `travel-continuity.service.ts` → read `bookings` table
- `grocery-continuity.service.ts` → read `household_shared_items`
- Create `useConciergeProjection()` hook

### Step 4.4 — Event Emission from Engines

**Work**:
- Each domain engine computation that changes state → insert into `events` table
- Events table acts as the source for projection materialization
- Add event types: `finance.safe_to_spend_updated`, `business.lead_scored`, `concierge.task_completed`, etc.

**Estimated effort**: 4-5 implementation messages

---

## Phase 5: Deployment Truth Visibility (Priority: MEDIUM)

**Problem**: Items 5-6 (K8s, GitHub workflows, VMware promotion) are infrastructure concerns outside this Lovable project. But the ADMIN SURFACES should display deployment/system truth clearly.

### Step 5.1 — System Health Dashboard Enhancement

**Work**:
- `MissionControlPage.tsx` → show real data from:
  - `incidents` table (open/resolved counts, MTTR)
  - `connector_configs` (connected/failed counts)
  - `sync_logs` (recent sync successes/failures)
  - `workflow_runs` (success rate, failure rate)
- Add "Deployment Info" card showing app version from `package.json`

### Step 5.2 — Connector Health Real-Time View

**Work**:
- `ConnectorHub.tsx` → read `connector_configs` + `sync_logs` from Supabase
- Show per-connector: last sync time, success rate, error count
- Add manual "Test Connection" button that inserts a sync_log entry

### Step 5.3 — Smoke Test Surface

**Work**:
- Add `/admin/system-check` route
- On load, runs client-side checks: Supabase connectivity, auth state, table accessibility, edge function reachability
- Displays pass/fail for each check
- Writes results to `events` table for audit trail

**Estimated effort**: 2-3 implementation messages

---

## Phase 6: Documentation Drift Reduction (Priority: MEDIUM)

### Step 6.1 — Generated Truth Dashboard Enhancement

**Work**:
- Enhance `GeneratedTruthDashboard.tsx` to show:
  - Table count from Supabase (real query)
  - Service module count (from service registry)
  - Page/route count (from router config)
  - Mock data usage count (grep results displayed)
  - Proof records count
  - Last audit timestamp

### Step 6.2 — Runtime Evidence Collection

**Work**:
- Add edge function `collect-system-manifest` that queries:
  - All table names + row counts
  - All RLS policy counts
  - Trigger counts
  - Returns JSON manifest
- Display in admin dashboard as "System Manifest"

### Step 6.3 — Data Mode Clarity

**Work**:
- Ensure `useDataMode()` context is used consistently across ALL surfaces
- When in demo mode: show persistent "DEMO DATA" ribbon at top
- When in live mode with no data: show "No data yet — connect your first service" empty state
- Never mix demo data with real data in the same view

**Estimated effort**: 2 implementation messages

---

## Phase 7: Noncritical Surface Scoping (Priority: LOW — already handled)

**Current state**: Desktop, device UI, spatial, holodeck surfaces are already separate routes (`/desktop`, `/mobile/*`) and clearly scoped outside core launch surfaces. No changes needed — just ensure they show "Coming Soon" or "Preview" badges.

**Estimated effort**: 1 implementation message (badge additions only)

---

## Implementation Order (Recommended)

```text
Message 1-2:  Phase 1 (Admin durability — migrations + wiring)
Message 3-4:  Phase 2.1-2.2 (Projection materialization + mock replacement)
Message 5:    Phase 2.3-2.4 (Staleness + deprecation)
Message 6-7:  Phase 3 (Proof chain expansion)
Message 8-9:  Phase 4.1-4.2 (Finance + Business engine persistence)
Message 10:   Phase 4.3-4.4 (Concierge + event emission)
Message 11:   Phase 5 (Deployment truth surfaces)
Message 12:   Phase 6 (Documentation drift + manifest)
Message 13:   Phase 7 (Noncritical scoping badges)
```

## Technical Details

**Database changes needed**:
- Add `correlation_id` and `parent_proof_id` columns to `proof_records`
- Create `policy_versions` table
- Create `connector_sync_history` table  
- Create `operator_actions` table

**Edge functions needed**:
- `sync-projections` — materialize read-models from event data
- `collect-system-manifest` — generate runtime truth snapshot

**Mock data to replace**: 23 mock-data files in `src/lib/mock-data/` currently feeding boardroom, governance, workflows, and admin surfaces with fake data instead of Supabase queries.

**Key hooks to create**:
- `useFinanceProjection()` — real finance engine backed by Supabase
- `useBusinessProjection()` — real business engine backed by Supabase  
- `useConciergeProjection()` — real concierge engine backed by Supabase
- `useAdminDurableState()` — admin mutations with audit trail

