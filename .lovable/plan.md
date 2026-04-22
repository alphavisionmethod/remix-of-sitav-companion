

# Complete Behavioral Test Suite — 5 Remaining Domains to 100/100

## Summary

Five system domains lack behavioral tests: Orchestration (1 test file), Release (0), Runtime/SDK (1), Connectors (1 integration test), and Observability (1 test file with partial coverage). This plan adds 10 new test files covering every exported function and class across all five domains.

---

## 1. Orchestration — Pipeline E2E and Receipt Chain Tests

### File: `src/platform/orchestration/__tests__/facade-e2e.test.ts`
- Test `OrchestrationFacade.processIntent()` end-to-end: Intent → Planning → Execution → Proof
- Test query intent produces completed result with receipt
- Test financial intent triggers elevated risk tier
- Test simulation mode skips execution layer
- Test approval-required flow returns `approval_pending`
- Test policy denial at intent gate returns `refused`
- Test error during execution still produces proof record
- Verify `getLastResult()` and `getLastTruthRecord()` return valid objects

### File: `src/platform/orchestration/__tests__/receipt-chain.test.ts`
- Test `buildReceipt()` produces all required fields from a completed envelope
- Test `buildAuditTrail()` captures full layer traversal
- Test `buildEventLineage()` produces valid parent-child chain
- Test `buildApprovalProof()` with approved and not-required states
- Test `buildReversibilityRecord()` with reversible and irreversible effects
- Test `buildTruthRecord()` composes all sub-records into unified truth object

### File: `src/platform/orchestration/__tests__/intent-orchestrator.test.ts`
- Test all 10 classification patterns map to correct intent type and domain
- Test fallback to "query"/"cross-domain" for unmatched input
- Test risk assessment: financial → elevated, approval → elevated, query → low
- Test envelope mutation: intentState populated with all fields

### File: `src/platform/orchestration/__tests__/planning-orchestrator.test.ts`
- Test plan construction from resolved intent
- Test approval determination based on risk tier
- Test simulation mode produces simulationResult
- Test dependency graph resolution

---

## 2. Release System — Gate Evidence and Policy Tests

### File: `src/lib/release/__tests__/release-system.test.ts`
- Test `ARTIFACT_PROOF_REGISTRY` contains entries for all target IDs
- Test `getArtifactProof()` returns valid record for known targets
- Test `getDesktopTargets()` and `getOsTargets()` return non-empty sets
- Test `getTargetsWithSigningBlockers()` identifies unsigned targets
- Test `getProductionReadyTargets()` vs `getDeferredTargets()` are disjoint
- Test `DESKTOP_SIGNING_POLICIES` covers all desktop platforms
- Test `isDesktopSigningFullyReady()` and `isDesktopNotarizationFullyReady()`
- Test `OS_BOOT_VALIDATION_MATRIX` covers ISO, OVA, RAW formats
- Test `getBootValidationForFormat()` returns valid entries
- Test `INSTALL_UPGRADE_ROLLBACK_MATRIX` lifecycle paths are complete
- Test `getUnvalidatedPaths()` returns expected unvalidated entries
- Test `RELEASE_CHANNEL_POLICIES` cover dev/internal/beta/production
- Test `CHECKSUM_PUBLICATION_REGISTRY` has entries for all artifacts

---

## 3. Runtime/SDK — Boot Sequence, Detection, and Context Tests

### File: `src/runtimes/__tests__/runtime-boot-and-detection.test.ts`
- Test `probeRuntimeTier()` returns valid `RuntimeTierProbe` with tier and evidence
- Test tier detection defaults to `WEB_APP` in jsdom/browser environment
- Test `RuntimeTierProvider` renders children and exposes context
- Test `resolveCapability()` returns valid `TierAvailability` for known IDs
- Test `resolveFeature()` delegates to `resolveFeatureTierAvailability()`
- Test `useRuntimeTier()` hook returns current tier string
- Test `getWebCapability()` returns entries for known web capabilities
- Test `getApplianceCapability()` returns entries for appliance capabilities
- Test `probeDesktopCapabilities()` returns a Map
- Test `FEATURE_RUNTIME_TIER_MAPPING` has unique IDs (already partially covered, extend)

---

## 4. Connectors — State Grammar, Registry, and Capability Tests

### File: `src/lib/connectors/__tests__/connector-system.test.ts`
- Test `CONNECTOR_STATE_GRAMMAR` has entries for all 6 states
- Test each state has valid label, tone, description, and nextAction
- Test state ordering: demo_simulated → manual → reauth_required → failing → degraded → connected
- Test `getConnector()` returns entry for each of 12 connectors (dropbox through twilio)
- Test `getConnector()` returns undefined for unknown ID
- Test `listConnectors()` returns 12 entries with capability and client
- Test each capability file exports valid `ConnectorCapability` shape
- Test `CONNECTOR_CAPABILITIES` array has no duplicate IDs
- Test `CONNECTOR_CLIENTS` map has entries for all declared capabilities

---

## 5. Observability — Logger, APM, and Cost Governance Tests

### File: `src/lib/observability/__tests__/observability-extended.test.ts`
- Test `StructuredLogger`: setMinLogLevel filters correctly, log buffer respects MAX_BUFFER
- Test `setCorrelationId` propagates to all log entries
- Test `clearLogBuffer` resets buffer
- Test `performanceBaselines`: baseline entries exist for critical paths
- Test `costGovernance`: cost model entries cover all AI capability classes
- Test `requestContext`: creates and retrieves valid context with correlation ID
- Test `runtimeErrorContext`: captures error with stack, domain, and surface
- Test `releaseTag`: returns valid semver-format tag
- Test `apm`: performance marks and measures work correctly
- Test `perfBudget`: budget definitions exist for key routes
- Test `uptimeTracker`: records and queries uptime samples

---

## Technical Details

All tests use Vitest with `describe`/`it`/`expect`. Component tests (RuntimeTierProvider) use `@testing-library/react`. Pure logic tests use direct imports. No database or edge function changes required.

### Files Created

| File | Domain | Test Count |
|---|---|---|
| `src/platform/orchestration/__tests__/facade-e2e.test.ts` | Orchestration | ~8 |
| `src/platform/orchestration/__tests__/receipt-chain.test.ts` | Orchestration | ~6 |
| `src/platform/orchestration/__tests__/intent-orchestrator.test.ts` | Orchestration | ~4 |
| `src/platform/orchestration/__tests__/planning-orchestrator.test.ts` | Orchestration | ~4 |
| `src/lib/release/__tests__/release-system.test.ts` | Release | ~13 |
| `src/runtimes/__tests__/runtime-boot-and-detection.test.ts` | Runtime/SDK | ~10 |
| `src/lib/connectors/__tests__/connector-system.test.ts` | Connectors | ~9 |
| `src/lib/observability/__tests__/observability-extended.test.ts` | Observability | ~11 |

**Total: 8 new test files, ~65 test cases**

After creation, each file will be run individually and any failures fixed until all pass.

### Expected Outcome

| Domain | Before (Behavioral) | After |
|---|---|---|
| Orchestration | 5% | 100% |
| Release System | 20% | 100% |
| Runtime/SDK | 5% | 100% |
| Connectors | 8% | 100% |
| Observability | 10% | 100% |

