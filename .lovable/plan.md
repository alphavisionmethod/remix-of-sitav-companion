

## Wave 14 — Workflow Proof Closure and Provider Truth Closure

### Summary

The project has a strong canonical workflow engine (`src/lib/core-services/workflow-engine.ts`, 749 lines, 11-state machine with replay, recovery, timeout, verification hooks) and a canonical connector system (12 providers in `src/lib/connectors/providers.ts`, 6-state grammar, auth/health/truth services). What is missing: workflow proof registry mapping workflow families to evidence/owners/rollback, provider contract registry with lifecycle/diagnostics/security closure, and all associated validators and generated proof artifacts. Two existing validator stubs (`scripts/integrations/check-oauth-security-closure.ts`, `check-provider-refresh-closure.ts`) only check file existence.

This wave creates the workflow and integration governance layers by extending existing systems, not duplicating them.

---

### Phase A — Workflow Proof Registry and Contracts (6 files)

**1. `src/lib/workflows/workflow-proof-registry.ts`**
- Registry of 12 workflow families (auth, onboarding, app-lifecycle, advisor, boardroom, payment, CRM/connector, file, desktop-recovery, OS-recovery, operator-incident, support-bundle)
- Each entry: `familyId`, `owner`, `intent`, `scope`, `stepIds[]`, `evidenceSources[]`, `replayable`, `rollbackSemantics`, `failureInjectionPoints[]`, `dashboardRoute`, `runbookRef`, `killSwitchBinding`, `goldenPathRef`
- Cross-references existing golden path IDs and kill-switch IDs

**2. `src/lib/workflows/workflow-step-contracts.ts`**
- Typed step contract interface: `stepId`, `sourceState`, `targetState`, `requiredInputs[]`, `sideEffects[]`, `persistenceReqs`, `evidenceReqs`, `rollbackEligible`, `failureModes[]`, `retryPolicy`, `operatorVisible`
- Pre-defined step contracts for all 12 families (~60 steps total)
- Maps to `ServiceWorkflowState` from existing workflow engine

**3. `src/lib/workflows/workflow-evidence-builder.ts`**
- `buildWorkflowEvidenceBundle(familyId, run)` function
- Produces `WorkflowEvidenceBundle` containing: metadata, execution lineage, receipts, decision points, retries, failures, rollback outcomes, proof of final state
- Leverages existing `WorkflowInstance.eventLog` from core-services engine

**4. `src/lib/workflows/workflow-replay-engine.ts`**
- Thin wrapper around existing `WorkflowReplayEngine` from `core-services/workflow-engine.ts`
- Adds family-level replay declarations: which families are replayable, replay safety rules, non-replayable sensitive paths
- No duplication — imports and extends existing replay engine

**5. `src/lib/workflows/workflow-failure-injection.ts`**
- Declares per-family failure injection points
- `InjectionPoint` type: `familyId`, `stepId`, `faultType` (timeout, error, partial, permission-denied), `severity`
- `injectFault(familyId, stepId, faultType)` function for test harnesses

**6. `src/lib/workflows/workflow-rollback-map.ts`**
- Per-family rollback semantics: reversible steps, irreversible steps, compensating actions, escalation rules, runbook linkage
- Cross-references existing runbook registry IDs

### Phase B — Provider Contract Registry and Lifecycle (7 files)

**7. `src/lib/integrations/provider-contract-registry.ts`**
- Registry of all 12 catalog providers (gmail, google-calendar, google-drive, plaid, stripe, quickbooks, twilio, sendgrid, instacart, hubspot, slack, dropbox) plus 3 system providers (AI-gateway, storage, auth)
- Each entry: `providerId`, `providerType`, `owner`, `credentialModel`, `environments[]`, `refreshPolicy`, `retryPolicy`, `rateLimitPolicy`, `outagePolicy`, `degradedUxBehavior`, `killSwitchBinding`, `runbookRef`, `webhookBehavior`, `retentionPolicy`, `diagnosticsSupport`
- Extends existing `CONNECTOR_PROVIDER_REGISTRY` — does not replace it

**8. `src/lib/integrations/provider-lifecycle-manager.ts`**
- Canonical lifecycle state machine: `initial-connect → auth-issued → active → refresh → expiring → expired → reauth → disabled → recovered`
- `advanceProviderLifecycle(providerId, event)` function
- Integrates with existing `ConnectorAuthState` from `connector-auth.service.ts`
- Extends existing `ConnectorState` from `connector-state-grammar.ts`

**9. `src/lib/integrations/provider-health-model.ts`**
- Canonical health model: `healthy | degraded | partial-outage | full-outage | maintenance | unknown`
- `assessProviderHealth(providerId, signals)` function
- Integrates with existing `fetchConnectorHealth()` from `connector-health-service.ts`

**10. `src/lib/integrations/provider-diagnostics.ts`**
- `generateProviderDiagnostics(providerId)` — returns structured diagnostic bundle
- Covers: credential status, last refresh, error history, latency, rate-limit state, webhook delivery status
- Integrates with existing `getOAuthFlows()` and `getSyncJobs()` from `connector-truth-service.ts`

**11. `src/lib/integrations/provider-kill-switch-map.ts`**
- Maps providers to kill-switch IDs from existing `KILL_SWITCH_REGISTRY`
- Maps providers to runbook IDs from existing `RUNBOOK_REGISTRY`
- E.g. `stripe → KS-PAYMENTS`, `gmail → KS-CONNECTORS`

**12. `src/lib/integrations/provider-retention-policy.ts`**
- Per-provider data retention rules: token TTL, sync data retention, audit log retention, replay data policy, environment separation (sandbox vs prod)

**13. `src/lib/integrations/oauth-security-closure.ts`**
- Declares OAuth token encryption-at-rest policy
- Token access auditing requirements
- Key rotation compatibility declarations
- Expiry/indexing coverage
- Support-safe redaction rules
- Generates `generated/oauth-security-closure.json`

### Phase C — Supporting Provider Policies (4 files)

**14. `src/lib/integrations/provider-refresh-policy.ts`**
- Per-provider refresh cadence, retry backoff, max retries, refresh window

**15. `src/lib/integrations/provider-rate-limit-policy.ts`**
- Per-provider rate limits, backoff strategy, burst handling, queue behavior

**16. `src/lib/integrations/provider-webhook-replay-policy.ts`**
- Webhook replay rules, deduplication, idempotency keys, DLQ behavior

**17. `src/lib/integrations/provider-conflict-resolution-policy.ts`**
- CRM/sync conflict detection, resolution strategy (last-write-wins, merge, manual), operator escalation

### Phase D — Validators (10 scripts)

Replace the 2 existing stubs and add 8 new validators:

**18. `scripts/workflows/check-workflow-proof-closure.ts`** — BLOCK. Verify all 12 families registered, step contracts defined, evidence sources declared.

**19. `scripts/workflows/check-workflow-step-contracts.ts`** — ADVISORY. Verify step contracts cover all declared steps.

**20. `scripts/workflows/check-workflow-replayability.ts`** — ADVISORY. Verify replayable families have replay safety rules.

**21. `scripts/workflows/check-workflow-failure-injection.ts`** — ADVISORY. Verify injection points declared for critical families.

**22. `scripts/workflows/check-workflow-rollback-coverage.ts`** — ADVISORY. Verify rollback semantics declared for reversible families.

**23. `scripts/integrations/check-provider-contract-closure.ts`** — BLOCK. Verify all 15 providers registered with full contracts.

**24. `scripts/integrations/check-oauth-security-closure.ts`** — REPLACE existing stub. Real validation: check oauth-security-closure.json completeness.

**25. `scripts/integrations/check-provider-refresh-closure.ts`** — REPLACE existing stub. Real validation: check all providers have refresh policies.

**26. `scripts/integrations/check-provider-diagnostics-closure.ts`** — ADVISORY. Verify diagnostics coverage.

**27. `scripts/integrations/check-provider-webhook-replay.ts`** — ADVISORY. Verify webhook replay policy exists for webhook providers.

### Phase E — Generated Proof Artifacts

- `generated/workflow-proof-bundles/workflow-closure-matrix.json` — all 12 families with step/evidence/replay/rollback coverage
- `generated/workflow-proof-bundles/workflow-replayability-report.json`
- `generated/workflow-proof-bundles/workflow-rollback-coverage.json`
- `generated/integration-proof-bundles/provider-contract-closure.json` — all 15 providers with lifecycle/health/diagnostics coverage
- `generated/oauth-security-closure.json` — OAuth token security posture
- `generated/token-encryption-rotation-proof.json` — encryption-at-rest + rotation evidence
- `generated/provider-refresh-closure.json` — refresh policy coverage
- `generated/provider-rate-limit-coverage.json`
- `generated/provider-webhook-replay-audit.json`
- `generated/provider-conflict-resolution-report.json`

### Phase F — Gate Registration and Verification

- Register `workflow-proof-closure` as BLOCK gate in `check-os-release-readiness.ts`
- Register `provider-contract-closure` as BLOCK gate
- Register 8 ADVISORY gates for remaining validators
- `npx tsc --noEmit` — zero errors
- Run all 10 new validators — all green

### No-Duplication Enforcement

- Workflow proof registry imports from existing `WorkflowEngine`, `WorkflowReplayEngine`, `WorkflowRecoveryManager` in `core-services/workflow-engine.ts` — no second engine
- Provider contract registry extends existing `CONNECTOR_PROVIDER_REGISTRY` and `CONNECTOR_STATE_GRAMMAR` — no second connector system
- Provider lifecycle manager extends existing `ConnectorAuthState` — no second auth model
- Provider health model wraps existing `fetchConnectorHealth()` — no second health service

### Deployment Closure Checklist

- [ ] 12 workflow families registered with proof closure
- [ ] ~60 step contracts defined across all families
- [ ] Evidence builder, replay declarations, failure injection, rollback map complete
- [ ] 15 providers registered with full contract
- [ ] OAuth security closure artifact generated
- [ ] Token encryption rotation proof generated
- [ ] 10 validator scripts passing
- [ ] 2 BLOCK gates + 8 ADVISORY gates registered
- [ ] TypeScript builds with 0 errors
- [ ] No duplicate workflow or integration systems

