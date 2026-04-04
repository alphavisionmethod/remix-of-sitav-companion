
# OS Lifecycle & Recovery Full Closure — Implementation Plan

## Current State Audit

| Phase | Status | Gap |
|-------|--------|-----|
| 0: Validation baseline | **Partial** | Script exists but doesn't cover lifecycle contracts |
| 1: Lifecycle authority | **Missing** | No lifecycle registry, no restart/quarantine/crash-loop contracts |
| 2: Host supervision | **Missing** | No supervision execution, no crash-loop governance |
| 3: Lifecycle receipts | **Missing** | Replay-recovery exists but no lifecycle-specific receipts |
| 4: Install/update/recovery | **Partial** | ARQ_PLAN has update policy, first-boot exists, but no installer profiles, ISO contracts, recovery outcome manifests |
| 5: Mission-control lifecycle | **Partial** | Mission-control exists but no lifecycle diagnostics |
| 6: Generated truth sync | **Partial** | Sync script exists but doesn't cover lifecycle artifacts |
| 7: Release-readiness gates | **Partial** | Parity gates exist but no lifecycle-specific gates |

## Implementation Steps

### 1. Phase 1: Create lifecycle authority contracts
**File**: `src/packages/contracts/runtime/lifecycle-authority.ts`
- `BootTargetPolicy`, `RestartStrategy`, `RetryBudget`, `QuarantineBehavior`, `CrashLoopTrigger`, `DependencyPressureTrigger`, `ReplayPacketRequirement`
- `LifecycleTransitionRecord`, `RestartDecision`, `QuarantineAction`, `LifecycleProofReceipt`
- Canonical registry constant `LIFECYCLE_AUTHORITY`

### 2. Phase 2: Create host supervision engine
**File**: `src/packages/contracts/runtime/host-supervision.ts`
- `HostSupervisionState`, `BootTargetProgression`, `RestartBackoffPolicy`, `CumulativeRetryBudgetState`
- `QuarantinePolicy`, `DependencyPressureDetection`, `CrashLoopGovernance`, `OperatorInterventionThreshold`
- `LifecycleGovernanceEvent` for diagnostics channel wiring

### 3. Phase 3: Create lifecycle receipt types
**File**: `src/packages/contracts/runtime/lifecycle-receipts.ts`
- Receipt types for: first-boot, restart, quarantine-entry/exit, rollback-decision, rollback-execution, rollback-verification
- Canonical chain semantic compliance
- Support-safe replay packet generation contract

### 4. Phase 4: Create install/update/recovery contracts
**File**: `src/packages/contracts/runtime/install-recovery.ts`
- **Appliance lane**: `ApplianceInstallerProfile`, `PreflightGate`, `RollbackInvariant`, `PostUpdateOutcome`
- **ISO lane**: `ISOInstallerProfile`, `HardwareSupportTier`, `SecureBootAssumption`, `FirstBootHandoff`, `RecoveryPrerequisite`
- `RecoveryOutcomeManifest`, strict failure semantics

### 5. Phase 5: Extend mission-control with lifecycle diagnostics
**File**: Update `src/packages/contracts/domain-types/mission-control.ts`
- Add crash-loop, dependency-pressure, quarantine, restart/rollback evidence views
- Add `LifecycleDiagnosticsView`, `DegradedLifecycleState`

### 6. Phase 6: Generate lifecycle manifests + update sync script
**Files**: `generated/lifecycle-authority-manifest.json`, `generated/recovery-outcome-manifest.json`
- Update `scripts/sync-registry-manifests.ts` to cover lifecycle artifacts
- Update `scripts/validate-os-contracts.ts` to import lifecycle modules

### 7. Phase 7: Add lifecycle gate tests
**File**: `src/test/lifecycle-gates.test.ts`
- Integration tests for supervision, restart budgets, quarantine, replay, rollback evidence, appliance+ISO recovery

### 8. Update barrel exports + verify build

## Order
1 → 2 → 3 → 4 (parallel after 1) → 5 → 6 → 7 → 8 (verify)
