

# Phases 0–8: OS End-State Implementation Plan

## Audit Summary

| Phase | Status | Gap |
|-------|--------|-----|
| 0: Validation baseline | **Missing** | No validation bundle script exists |
| 1: Base OS authority | **Missing** | No `infra/docs/`, no `ARQ_PLAN_FINAL.md` |
| 2: Generated truth for boot chain | **Missing** | 4 manifest files don't exist in `generated/` |
| 3: First-boot provisioning contracts | **Missing** | No first-boot envelope/network/trust/secrets contracts; no first-boot proof receipts |
| 4: Unified runtime contract | **Partial** | `os-unification-runtime.ts` exists but missing `"desktop"` surface type, no shared command/proof/approval/degraded semantics contract |
| 5: Desktop thin-host runtime | **Partial** | `electron-ipc.ts` exists but has no capability bridge to policy/proof/trust contracts |
| 6: Cross-surface degraded/proof parity | **Partial** | `DegradedModeConfig` exists in execution contracts but no per-surface degraded state map or proof-state parity enforcement |
| 7: Parity gates | **Missing** | No parity test files exist |
| 8: Registry + generated + docs sync | **Missing** | No sync script or lockstep validation |

## Implementation Plan

### Phase 0 — Validation baseline script
Create `scripts/validate-os-contracts.ts` that:
- Imports all contract barrels and checks parse/import success
- Validates runtime conformance manifest entries against actual service files
- Validates proof-model receipt types against receipt-service implementations
- Outputs classified failures: `parse-import`, `runtime-contract-drift`, `proof-receipt-drift`

### Phase 1 — Base OS authority docs
Create `infra/docs/ARQ_PLAN_FINAL.md` with:
- Base OS: Ubuntu 24.04 LTS, kernel 6.8+, systemd-boot
- Secure-boot posture: UEFI Secure Boot required, MOK for custom modules
- Hardware assumptions: TPM 2.0 preferred (software fallback), 4GB+ RAM, 64-bit
- Kernel/initramfs policy: immutable initramfs, dm-verity root, measured boot chain

### Phase 2 — Generated boot chain manifests (4 files)
- `generated/base-os-manifest.json` — OS version, kernel, packages, signing keys
- `generated/boot-chain-manifest.json` — UEFI → shim → bootloader → kernel → initramfs → systemd → SITA runtime stages with hashes
- `generated/first-boot-contract-manifest.json` — lists every contract type consumed during first boot
- `generated/first-boot-proof-receipts.json` — expected receipt types emitted during first boot with schema refs

### Phase 3 — First-boot provisioning contracts + proof emission
Create `src/packages/contracts/runtime/first-boot-provisioning.ts`:
- `FirstBootEnvelope` — wraps entire first-boot lifecycle (device ID, tenant binding, timestamps, outcome)
- `FirstBootNetworkContract` — network discovery, captive portal, connectivity proof
- `FirstBootTrustContract` — TPM attestation, secure-boot verification, trust baseline establishment
- `FirstBootSecretsContract` — key generation, vault initialization, recovery key derivation
- `FirstBootRuntimeBootstrap` — service startup order, capability loading, proof chain initialization

Create `src/packages/proof-model/receipts/first-boot-receipt.ts`:
- `FirstBootReceipt` extending `BaseReceipt` with `type: "first-boot"`, phase, attestation hash, trust baseline score

Wire into `receipt-service/receipts.service.ts`: add `createFirstBootReceipt()` factory.

Update `src/packages/proof-model/index.ts` to include `FirstBootReceipt` in `TypedReceipt` union.

### Phase 4 — Unified runtime contract
Create `src/packages/contracts/runtime/unified-surface-runtime.ts`:
- `SurfaceId` = `"web" | "admin" | "desktop" | "mobile"`
- `UnifiedCommand` — surface-agnostic command envelope (action, target, proof-required, approval-required, degraded-fallback)
- `UnifiedProofRequirement` — per-command proof emission rules
- `UnifiedApprovalRequirement` — per-command approval gate rules
- `UnifiedDegradedSemantics` — what each surface does when degraded (cache-only, queue, refuse, fallback)
- Imports and reuses `ShellFrame` from shell-grammar, `TrustFlag`/`ApprovalType` from scaffold, proof types from proof-model

Update `os-unification-runtime.ts`: add `"desktop"` to `SurfaceType`.

### Phase 5 — Desktop thin-host runtime closure
Expand `src/packages/contracts/native/electron-ipc.ts`:
- Add channels: `"trust-attestation"`, `"proof-emit"`, `"capability-query"`, `"degraded-mode"`, `"policy-check"`
- Add `NativeCapabilityBridge` interface mapping IPC channels to contract types
- Add `DesktopHostConfig` — what the native host owns vs what the renderer owns (no policy/execution in surfaces)

Create `src/packages/contracts/native/desktop-host-runtime.ts`:
- `DesktopHostCapabilities` — file system, biometrics, notifications, tray, auto-update, deep-link
- `DesktopProofRelay` — how the host relays proofs to the canonical proof chain
- `DesktopDegradedMode` — offline, no-cloud, limited-trust modes

### Phase 6 — Cross-surface degraded/proof parity
Create `src/packages/contracts/runtime/surface-parity.ts`:
- `SurfaceDegradedStateMap` — per-surface × per-capability degraded behavior matrix
- `SurfaceProofStateMap` — per-surface proof emission requirements (identical across surfaces)
- `ParityViolation` — type for detected divergences
- `SurfaceCapabilityMatrix` — what each surface can/cannot do, with explicit "not supported" vs "degraded"

### Phase 7 — Parity gates (test contracts)
Create `src/packages/contracts/runtime/parity-gates.ts`:
- `ParityTestCase` — command + expected proof + expected approval + expected degraded behavior
- `PARITY_TEST_CASES: ParityTestCase[]` — canonical test cases proving equivalence
- `ParityGateResult` — pass/fail per surface per test case

### Phase 8 — Registry + generated + docs sync
Create `scripts/sync-registry-manifests.ts`:
- Reads all contract barrels, generates updated `contract-manifest.json`
- Reads boot chain contracts, generates boot chain manifests
- Reads `ARQ_PLAN_FINAL.md`, validates consistency with generated manifests
- Outputs sync report: in-sync / drift-detected per artifact

Update `generated/` barrel: add 4 new manifest files to the set.

## Files to Create (14)

| File | Purpose |
|---|---|
| `scripts/validate-os-contracts.ts` | Phase 0 validation runner |
| `infra/docs/ARQ_PLAN_FINAL.md` | Phase 1 base OS authority |
| `generated/base-os-manifest.json` | Phase 2 OS manifest |
| `generated/boot-chain-manifest.json` | Phase 2 boot chain |
| `generated/first-boot-contract-manifest.json` | Phase 2 first-boot contracts index |
| `generated/first-boot-proof-receipts.json` | Phase 2 first-boot receipts index |
| `src/packages/contracts/runtime/first-boot-provisioning.ts` | Phase 3 contracts |
| `src/packages/proof-model/receipts/first-boot-receipt.ts` | Phase 3 receipt type |
| `src/packages/contracts/runtime/unified-surface-runtime.ts` | Phase 4 unified contract |
| `src/packages/contracts/native/desktop-host-runtime.ts` | Phase 5 desktop host |
| `src/packages/contracts/runtime/surface-parity.ts` | Phase 6 parity contracts |
| `src/packages/contracts/runtime/parity-gates.ts` | Phase 7 test contracts |
| `scripts/sync-registry-manifests.ts` | Phase 8 sync script |
| `src/packages/contracts/native/index.ts` | Barrel for native contracts |

## Files to Modify (5)

| File | Change |
|---|---|
| `src/packages/contracts/runtime/os-unification-runtime.ts` | Add `"desktop"` to `SurfaceType` |
| `src/packages/contracts/runtime/index.ts` | Add exports for 4 new runtime files |
| `src/packages/contracts/native/electron-ipc.ts` | Add 5 new IPC channels + `NativeCapabilityBridge` |
| `src/packages/proof-model/index.ts` | Add `FirstBootReceipt` to `TypedReceipt` union |
| `src/lib/services/receipt-service/receipts.service.ts` | Add `createFirstBootReceipt()` |

## Implementation Order

1. Phase 1: Create `ARQ_PLAN_FINAL.md`
2. Phase 3: Create first-boot contracts + receipt type + wire into proof model and receipt service
3. Phase 4: Create unified surface runtime, update `SurfaceType`
4. Phase 5: Expand electron-ipc, create desktop-host-runtime + native barrel
5. Phase 6: Create surface-parity contracts
6. Phase 7: Create parity-gates test contracts
7. Phase 2: Generate 4 manifest files (depends on Phase 3 contracts existing)
8. Phase 0: Create validation script (depends on all contracts existing)
9. Phase 8: Create sync script
10. Verify with `tsc --noEmit`

