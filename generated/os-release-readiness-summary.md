# SITA OS — Release Readiness Report

> Generated: 2026-04-20T17:06:18.712Z
> Verdict: **YELLOW** ⚠️

## Summary

| Metric | Value |
|---|---|
| Gates required | 244 |
| Gates present  | 367 |
| Gates missing  | 0 |
| Total errors   | 0 |
| Total warnings | 4252 |
| Advisory gates surfaced | 119 |
| Validator-map coverage | 100% (187 validators) |

## Per-gate results

| Gate | OK | Errors | Warnings |
|---|---|---|---|
| `os-build-pipeline` | ✅ | 0 | 0 |
| `os-trust-chain-readiness` | ✅ | 0 | 0 |
| `os-update-readiness` | ✅ | 0 | 0 |
| `os-recovery-readiness` | ✅ | 0 | 0 |
| `native-shell-session-readiness` | ✅ | 0 | 0 |
| `qemu-vm-readiness` | ✅ | 0 | 0 |
| `os-support-bundle-readiness` | ✅ | 0 | 0 |
| `native-observability-readiness` | ✅ | 0 | 0 |
| `deployment-profile-coverage` | ✅ | 0 | 0 |
| `route-plane-coverage` | ✅ | 0 | 0 |
| `5-plane-boundaries` | ✅ | 0 | 0 |
| `app-plane-map` | ✅ | 0 | 0 |
| `user-profile-readiness` | ✅ | 0 | 0 |
| `operator-readiness` | ✅ | 0 | 0 |
| `mobile-store-readiness` | ✅ | 0 | 0 |
| `mobile-build-pipeline` | ✅ | 0 | 5 |
| `ks-payments-auth-readiness` | ✅ | 0 | 0 |
| `ci-artifacts-proof` | ✅ | 0 | 0 |
| `electron-signing-readiness` | ✅ | 0 | 0 |
| `lib-decomposition-readiness` | ✅ | 0 | 1731 |
| `lib-ownership-drift` | ✅ | 0 | 82 |
| `misplaced-runtime-logic` | ✅ | 0 | 0 |
| `misplaced-data-logic` | ✅ | 0 | 0 |
| `misplaced-domain-logic` | ✅ | 0 | 0 |
| `legacy-wrapper-usage` | ✅ | 0 | 1518 |
| `profile-runtime-hardening` | ✅ | 0 | 0 |
| `launcher-registry-completeness` | ✅ | 0 | 0 |
| `app-profile-matrix` | ✅ | 0 | 0 |
| `hidden-app-routes` | ✅ | 0 | 0 |
| `mobile-capability-truth` | ✅ | 0 | 5 |
| `profile-route-coverage` | ✅ | 0 | 0 |
| `command-palette-profile-leakage` | ✅ | 0 | 0 |
| `shared-component-profile-pollution` | ✅ | 0 | 0 |
| `route-guard-coverage` | ✅ | 0 | 0 |
| `profile-runtime-baseline-drift` | ✅ | 0 | 0 |
| `boardroom-layer7-closure` | ✅ | 0 | 0 |
| `os-claim-safety` | ✅ | 0 | 0 |
| `track-b-language-boundaries` | ✅ | 0 | 0 |
| `no-prohibited-native-claims` | ✅ | 0 | 0 |
| `demo-only-surface-badging` | ✅ | 0 | 0 |
| `future-vision-route-containment` | ✅ | 0 | 0 |
| `device-surface-claim-safety` | ✅ | 0 | 0 |
| `deployment-wording-safety` | ✅ | 0 | 0 |
| `launch-honesty-alignment` | ✅ | 0 | 0 |
| `qualifier-required-claims` | ✅ | 0 | 0 |
| `gate-meaningfulness` | ✅ | 0 | 0 |
| `app-store-lifecycle-reality` | ✅ | 0 | 0 |
| `frontend-polish-coverage` | ✅ | 0 | 0 |
| `admin-operator-coherence` | ✅ | 0 | 0 |
| `human-use-operational-readiness` | ✅ | 0 | 0 |
| `internal-agent-registry` | ✅ | 0 | 0 |
| `internal-agent-runtime-coverage` | ✅ | 0 | 0 |
| `internal-agent-admin-pages` | ✅ | 0 | 0 |
| `internal-agent-escalation-runtime` | ✅ | 0 | 0 |
| `internal-agent-seed-integrity` | ✅ | 0 | 0 |
| `internal-agent-runtime-loop` | ✅ | 0 | 0 |
| `admin-ai-runtime-drilldowns` | ✅ | 0 | 0 |
| `admin-integrations-health-visibility` | ✅ | 0 | 0 |
| `onboarding-simulated-persona-disclosure` | ✅ | 0 | 2 |
| `boardroom-briefing-truth-alignment` | ✅ | 0 | 2 |
| `concierge-ai-state-handling` | ✅ | 0 | 1 |
| `communications-connector-state-alignment` | ✅ | 0 | 2 |
| `flagship-surface-trust-copy` | ✅ | 0 | 4 |
| `flagship-surface-responsive-quality` | ✅ | 0 | 6 |
| `admin-empty-state-patterns` | ✅ | 0 | 3 |
| `cross-domain-coherence-empty-state` | ✅ | 0 | 0 |
| `cost-spotlight-empty-state` | ✅ | 0 | 0 |
| `sbom-history-empty-state` | ✅ | 0 | 0 |
| `internal-agent-execute-action` | ✅ | 0 | 0 |
| `autonomous-action-safety-gates` | ✅ | 0 | 0 |
| `autonomous-action-receipts` | ✅ | 0 | 0 |
| `autonomous-action-rollback-coverage` | ✅ | 0 | 0 |
| `error-patrol-triage-page` | ✅ | 0 | 0 |
| `agent-primitive-wiring` | ✅ | 0 | 0 |
| `priority-bridge-wiring` | ✅ | 0 | 0 |
| `kill-switch-backfill` | ✅ | 0 | 0 |
| `bridge-status-contract` | ✅ | 0 | 0 |
| `internal-agent-reflection-table` | ✅ | 0 | 0 |
| `internal-agent-reflect-function` | ✅ | 0 | 0 |
| `reflection-board-page` | ✅ | 0 | 0 |
| `implementation-suggestions-pipeline` | ✅ | 0 | 0 |
| `suggestion-generator-function` | ✅ | 0 | 0 |
| `weekly-digest-generation` | ✅ | 0 | 0 |
| `dependency-upgrade-proposer` | ✅ | 0 | 0 |
| `trust-score-update-logic` | ✅ | 0 | 0 |
| `reflection-to-action-linkage` | ✅ | 0 | 0 |
| `internal-agent-policy-drafts-table` | ✅ | 0 | 0 |
| `internal-agent-policy-architect-function` | ✅ | 0 | 0 |
| `policy-draft-review-page` | ✅ | 0 | 0 |
| `policy-draft-never-auto-apply` | ✅ | 0 | 0 |
| `internal-agent-trust-ladder-table` | ✅ | 0 | 0 |
| `internal-agent-trust-evaluator-function` | ✅ | 0 | 0 |
| `trust-ladder-board-page` | ✅ | 0 | 0 |
| `trust-ladder-never-self-promote` | ✅ | 0 | 0 |
| `knowledge-bus-write-discipline` | ✅ | 0 | 0 |
| `trust-ladder-supervisor-readout` | ✅ | 0 | 0 |
| `internal-agent-consensus-tables` | ✅ | 0 | 0 |
| `internal-agent-cost-proposals-table` | ✅ | 0 | 0 |
| `internal-agent-runbook-tables` | ✅ | 0 | 0 |
| `cross-council-l3-ceiling` | ✅ | 0 | 0 |
| `cost-proposals-never-auto-apply` | ✅ | 0 | 0 |
| `self-healer-safe-catalogue` | ✅ | 0 | 0 |
| `cross-council-board-page` | ✅ | 0 | 0 |
| `internal-agent-phase7-tables` | ✅ | 0 | 0 |
| `tenant-l3-ceiling` | ✅ | 0 | 0 |
| `owner-copilot-bff-readonly` | ✅ | 0 | 0 |
| `tenant-kill-switch-justification` | ✅ | 0 | 0 |
| `slo-evaluator-function` | ✅ | 0 | 0 |
| `phase7-admin-pages` | ✅ | 0 | 0 |
| `internal-agent-phase8-tables` | ✅ | 0 | 0 |
| `assurance-l3-ceiling` | ✅ | 0 | 0 |
| `chaos-safe-catalogue` | ✅ | 0 | 0 |
| `external-workforce-api-readonly` | ✅ | 0 | 0 |
| `webhook-hmac-signing` | ✅ | 0 | 0 |
| `federation-optin-required` | ✅ | 0 | 0 |
| `dp-noise-floor` | ✅ | 0 | 0 |
| `knowledge-anonymization` | ✅ | 0 | 0 |
| `phase8-admin-pages` | ✅ | 0 | 0 |
| `internal-agent-phase9-tables` | ✅ | 0 | 0 |
| `dr-l3-ceiling` | ✅ | 0 | 0 |
| `signed-release-artifacts` | ✅ | 0 | 0 |
| `audit-export-immutable` | ✅ | 0 | 0 |
| `tenant-self-service-isolation` | ✅ | 0 | 0 |
| `tenant-quota-hard-ceiling` | ✅ | 0 | 0 |
| `compliance-evidence-allowlisted` | ✅ | 0 | 0 |
| `attestation-packet-signed` | ✅ | 0 | 0 |
| `phase9-admin-pages` | ✅ | 0 | 0 |
| `tenant-admin-role-gate` | ✅ | 0 | 0 |
| `dp-epsilon-budget-ledger` | ✅ | 0 | 0 |
| `webhook-retry-queue` | ✅ | 0 | 0 |
| `compliance-collector-allowlist` | ✅ | 0 | 0 |
| `pg-cron-schedules` | ✅ | 0 | 0 |
| `pg-extensions-enabled` | ✅ | 0 | 0 |
| `release-artifact-signer` | ✅ | 0 | 0 |
| `final-deployment-readiness` | ✅ | 0 | 0 |
| `final-runtime-proof` | ✅ | 0 | 0 |
| `final-mobile-truth` | ✅ | 0 | 0 |
| `final-ai-workforce-readiness` | ✅ | 0 | 0 |
| `final-launch-honesty` | ✅ | 0 | 0 |
| `final-supportability-readiness` | ✅ | 0 | 0 |
| `final-gate-meaningfulness` | ✅ | 0 | 0 |
| `ai-live-provider-nightly` | ✅ | 0 | 0 |
| `ai-receipt-persistence` | ✅ | 0 | 0 |
| `ai-ledger-write-verification` | ✅ | 0 | 0 |
| `ai-fallback-verification` | ✅ | 0 | 0 |
| `ai-budget-enforcement-under-load` | ✅ | 0 | 0 |
| `ai-runtime-streak-health` | ✅ | 0 | 0 |
| `google-refresh-nightly` | ✅ | 0 | 1 |
| `microsoft-refresh-nightly` | ✅ | 0 | 1 |
| `slack-refresh-nightly` | ✅ | 0 | 1 |
| `connector-health-state-consistency` | ✅ | 0 | 1 |
| `no-ambiguous-connected-state` | ✅ | 0 | 0 |
| `long-tail-provider-classification` | ✅ | 0 | 1 |
| `connector-refresh-streak` | ✅ | 0 | 1 |
| `mobile-native-out-of-scope-truth` | ✅ | 0 | 0 |
| `no-active-native-mobile-claims` | ✅ | 0 | 0 |
| `install-page-mobile-honesty` | ✅ | 0 | 0 |
| `mobile-manifest-archive-classification` | ✅ | 0 | 0 |
| `generated-mobile-truth-consistency` | ✅ | 0 | 0 |
| `empty-state-coverage` | ✅ | 0 | 0 |
| `cta-integrity` | ✅ | 0 | 0 |
| `no-shell-only-production-pages` | ✅ | 0 | 0 |
| `state-handling-consistency` | ✅ | 0 | 0 |
| `admin-board-polish` | ✅ | 0 | 0 |
| `trust-copy-quality` | ✅ | 0 | 0 |
| `responsive-surface-integrity` | ✅ | 0 | 0 |
| `admin-top-task-discoverability` | ✅ | 0 | 0 |
| `no-museum-boards` | ✅ | 0 | 0 |
| `admin-action-orientation` | ✅ | 0 | 0 |
| `edge-function-contract-coverage` | ✅ | 0 | 1 |
| `warn-ratchet-meaningfulness` | ✅ | 0 | 0 |
| `evidence-freshness-blocking` | ✅ | 0 | 1 |
| `behavioral-ci-coverage` | ✅ | 0 | 0 |
| `gate-quality-classification` | ✅ | 0 | 0 |
| `real-hardware-proof` | ✅ | 0 | 1 |
| `hardware-certification-matrix` | ✅ | 0 | 1 |
| `attestation-evidence-freshness` | ✅ | 0 | 1 |
| `operator-drill-execution` | ✅ | 0 | 1 |
| `runbook-human-use-proof` | ✅ | 0 | 1 |
| `kill-switch-drill-readiness` | ✅ | 0 | 1 |
| `supportability-freshness` | ✅ | 0 | 1 |
| `secret-rotation-cadence` | ✅ | 0 | 0 |
| `secret-rotation-freshness` | ✅ | 0 | 8 |
| `security-adversarial-proof` | ✅ | 0 | 4 |
| `rls-under-stress` | ✅ | 0 | 1 |
| `electron-threat-detection-proof` | ✅ | 0 | 3 |
| `debugger-tamper-proof` | ✅ | 0 | 1 |
| `session-threat-behavior` | ✅ | 0 | 1 |
| `no-browser-trapped-shared-hooks` | ✅ | 0 | 0 |
| `runtime-host-abstraction` | ✅ | 0 | 0 |
| `portability-boundaries` | ✅ | 0 | 0 |
| `no-browser-globals-in-portable-code` | ✅ | 0 | 0 |
| `edge-function-structured-logging` | ✅ | 0 | 1 |
| `no-duplicate-truth-manifests` | ✅ | 0 | 0 |
| `no-stale-canonical-docs` | ✅ | 0 | 1 |
| `safe-cleanup-regressions` | ✅ | 0 | 0 |
| `per-user-ai-ceilings` | ✅ | 0 | 0 |
| `ai-budget-hard-stop` | ✅ | 0 | 1 |
| `calm-mode-default-posture` | ✅ | 0 | 0 |
| `agency-wording-lockdown` | ✅ | 0 | 0 |
| `future-surfaces-registered` | ✅ | 0 | 0 |
| `negative-receipts-emitted` | ✅ | 0 | 0 |
| `economic-trust-future-closure` | ✅ | 0 | 0 |
| `runtime-host-boundaries` | ✅ | 0 | 0 |
| `shell-runtime-portability` | ✅ | 0 | 0 |
| `edge-function-log-shape` | ✅ | 0 | 38 |
| `mobile-archived-scope` | ✅ | 0 | 0 |
| `no-kernel-overclaim` | ✅ | 0 | 0 |
| `doc-canonicality` | ✅ | 0 | 0 |
| `canonical-paths` | ✅ | 0 | 6 |
| `5-plane-boundaries` | ✅ | 0 | 0 |
| `evidence-graph-completeness` | ✅ | 0 | 1 |
| `cron-execution-evidence` | ✅ | 0 | 12 |
| `release-decision-persistence` | ✅ | 0 | 1 |
| `ai-receipt-completeness` | ✅ | 0 | 0 |
| `connector-reauth-telemetry` | ✅ | 0 | 0 |
| `security-fabric-probes` | ✅ | 0 | 0 |
| `app-sdk-extension-registry` | ✅ | 0 | 0 |
| `boardroom-cockpit-telemetry` | ✅ | 0 | 0 |
| `onboarding-branch-telemetry` | ✅ | 0 | 0 |
| `mobile-deferral-attestation` | ✅ | 0 | 0 |
| `app-sdk-extension-events` | ✅ | 0 | 0 |
| `release-evidence-graph-snapshot` | ✅ | 0 | 0 |
| `owner-copilot-readonly` | ✅ | 0 | 0 |
| `federation-optin-append-only` | ✅ | 0 | 0 |
| `dr-drill-evidence` | ✅ | 0 | 0 |
| `chaos-drill-classification` | ✅ | 0 | 0 |
| `production-launch-attestation` | ✅ | 0 | 0 |
| `electron-domain-layout` | ✅ | 0 | 0 |
| `os-ci-end-to-end` | ✅ | 0 | 0 |
| `public-artifact-mirror` | ✅ | 0 | 0 |
| `onboarding-components-folder` | ✅ | 0 | 0 |
| `artifact-index-traceability` | ✅ | 0 | 0 |
| `runbook-coverage` | ✅ | 0 | 0 |
| `edge-function-ownership-completeness` | ✅ | 0 | 0 |
| `connector-client-registry-completeness` | ✅ | 0 | 0 |
| `admin-runbook-surface-wiring` | ✅ | 0 | 0 |
| `recovery-boot-evidence` | ✅ | 0 | 0 |
| `artifact-ownership-graph` | ✅ | 0 | 3 |
| `cross-tier-capability-matrix` | ✅ | 0 | 0 |
| `first-use-spec-coverage` | ✅ | 0 | 0 |
| `internal-agent-deferred-set-explicitness` | ✅ | 0 | 0 |
| `cluster-readme-coverage` | ✅ | 0 | 0 |
| `ai-shim-integrity` | ✅ | 0 | 0 |
| `ai-engineer-tab-registry (warn)` | ✅ | 0 | 0 |
| `ai-engineer-wiring-coverage (warn)` | ✅ | 0 | 68 |
| `ai-engineer-primitive-coverage (warn)` | ✅ | 0 | 72 |
| `ai-engineer-action-coverage (warn)` | ✅ | 0 | 18 |
| `action-envelope-boundary (advisory)` | ✅ | 0 | 0 |
| `admin-command-palette-coherence (advisory)` | ✅ | 0 | 0 |
| `admin-domain-budget (advisory)` | ✅ | 0 | 0 |
| `admin-ia (advisory)` | ✅ | 0 | 0 |
| `admin-page-classification-coverage (advisory)` | ✅ | 0 | 0 |
| `admin-route-coherence (advisory)` | ✅ | 0 | 0 |
| `admin-route-registry-conformance (advisory)` | ❌ | 0 | 29 |
| `admin-shell-consistency (advisory)` | ✅ | 0 | 0 |
| `admin-top-level-domain-count (advisory)` | ✅ | 0 | 0 |
| `advisor-registry (advisory)` | ✅ | 0 | 0 |
| `ai-advisor-reality (advisory)` | ✅ | 0 | 0 |
| `app-plane-coverage (advisory)` | ✅ | 0 | 0 |
| `appliance-deployability (advisory)` | ✅ | 0 | 0 |
| `artifact-ownership-coverage (advisory)` | ✅ | 0 | 0 |
| `backend-api-deployability (advisory)` | ✅ | 0 | 0 |
| `boot-chain (advisory)` | ❌ | 0 | 1 |
| `bounded-context-coverage (advisory)` | ❌ | 0 | 4 |
| `capability-families (advisory)` | ✅ | 0 | 0 |
| `ci-umbrella-integrity (advisory)` | ✅ | 0 | 0 |
| `component-classification (advisory)` | ✅ | 0 | 0 |
| `connector-catalog (advisory)` | ✅ | 0 | 0 |
| `connector-reality (advisory)` | ✅ | 0 | 0 |
| `context-membership (advisory)` | ❌ | 0 | 1 |
| `contract-family-completeness (advisory)` | ✅ | 0 | 0 |
| `contract-registry (advisory)` | ✅ | 0 | 0 |
| `contract-topology (advisory)` | ✅ | 0 | 0 |
| `cosmetic-debt-closure (advisory)` | ✅ | 0 | 0 |
| `cta-wiring (advisory)` | ✅ | 0 | 0 |
| `db-reality (advisory)` | ✅ | 0 | 0 |
| `dead-pages (advisory)` | ✅ | 0 | 0 |
| `delegation-receipts (advisory)` | ❌ | 0 | 1 |
| `demo-data-imports (advisory)` | ✅ | 0 | 0 |
| `deployability-coverage (advisory)` | ❌ | 0 | 1 |
| `deployable-plane-isolation (advisory)` | ✅ | 0 | 0 |
| `deprecated-wrappers (advisory)` | ✅ | 0 | 0 |
| `desktop-deployability (advisory)` | ✅ | 0 | 0 |
| `domain-purity (advisory)` | ✅ | 0 | 0 |
| `domain-reality (advisory)` | ✅ | 0 | 0 |
| `drift (advisory)` | ❌ | 0 | 1 |
| `duplicate-families (advisory)` | ✅ | 0 | 0 |
| `edge-function-health-replay (advisory)` | ✅ | 0 | 0 |
| `edge-function-membership-completeness (advisory)` | ❌ | 0 | 1 |
| `electron-shell-session-readiness (advisory)` | ✅ | 0 | 0 |
| `engine-no-io (advisory)` | ✅ | 0 | 0 |
| `error-boundaries (advisory)` | ✅ | 0 | 0 |
| `event-catalog (advisory)` | ✅ | 0 | 0 |
| `event-receipt-linkage (advisory)` | ✅ | 0 | 0 |
| `experimental-isolation (advisory)` | ✅ | 0 | 0 |
| `feature-governance (advisory)` | ✅ | 0 | 0 |
| `feature-integration-completeness (advisory)` | ✅ | 0 | 0 |
| `feature-reality-coverage (advisory)` | ✅ | 0 | 0 |
| `golden-path-coverage (advisory)` | ❌ | 0 | 7 |
| `hook-purity (advisory)` | ✅ | 0 | 0 |
| `ia-coherence (advisory)` | ❌ | 0 | 1 |
| `inline-mocks (advisory)` | ✅ | 0 | 0 |
| `integration-map (advisory)` | ✅ | 0 | 0 |
| `its-real-gate (advisory)` | ✅ | 0 | 0 |
| `kill-switch-coverage (advisory)` | ❌ | 0 | 1 |
| `layer-boundaries (advisory)` | ✅ | 0 | 0 |
| `mock-leak (advisory)` | ✅ | 0 | 0 |
| `module-count (advisory)` | ❌ | 0 | 2 |
| `no-backend-in-ui (advisory)` | ✅ | 0 | 0 |
| `no-duplicate-primary-concept (advisory)` | ✅ | 0 | 0 |
| `no-hidden-executor (advisory)` | ✅ | 0 | 0 |
| `no-inline-empty-states (advisory)` | ✅ | 0 | 0 |
| `no-page-mocks (advisory)` | ✅ | 0 | 0 |
| `no-runtime-in-shared (advisory)` | ✅ | 0 | 0 |
| `no-ui-in-backend (advisory)` | ❌ | 0 | 3 |
| `no-workflow-bypass (advisory)` | ❌ | 0 | 1 |
| `observability-reality (advisory)` | ❌ | 0 | 1 |
| `onboarding-surface-truth (advisory)` | ✅ | 0 | 0 |
| `orchestration-authority (advisory)` | ❌ | 0 | 1 |
| `os-release-readiness (advisory)` | ✅ | 0 | 0 |
| `outbound-communication-policy (advisory)` | ✅ | 0 | 0 |
| `owner-workflow-map (advisory)` | ✅ | 0 | 0 |
| `page-registry-completeness (advisory)` | ✅ | 0 | 0 |
| `page-state-coverage (advisory)` | ✅ | 0 | 0 |
| `plane-import-graph (advisory)` | ✅ | 0 | 0 |
| `plane-transitive (advisory)` | ✅ | 0 | 0 |
| `platform-anti-patterns (advisory)` | ❌ | 0 | 9 |
| `platform-readiness (advisory)` | ✅ | 0 | 0 |
| `policy-coverage (advisory)` | ❌ | 0 | 334 |
| `policy-mapping (advisory)` | ✅ | 0 | 0 |
| `policy-resolver-coverage (advisory)` | ✅ | 0 | 0 |
| `primitive-purity (advisory)` | ✅ | 0 | 0 |
| `production-operations (advisory)` | ✅ | 0 | 0 |
| `projection-purity (advisory)` | ✅ | 0 | 0 |
| `proof-coverage (advisory)` | ✅ | 0 | 0 |
| `protocol-purity (advisory)` | ✅ | 0 | 0 |
| `receipt-coverage (advisory)` | ✅ | 0 | 0 |
| `redirect-coverage (advisory)` | ✅ | 0 | 0 |
| `registry-integrity (advisory)` | ✅ | 0 | 0 |
| `residual-lib-canonicality (advisory)` | ✅ | 0 | 0 |
| `route-drift (advisory)` | ✅ | 0 | 0 |
| `route-page-contract-layer-usage (advisory)` | ✅ | 0 | 0 |
| `route-registry-completeness (advisory)` | ✅ | 0 | 0 |
| `route-truth (advisory)` | ✅ | 0 | 0 |
| `route-wrapper-usage (advisory)` | ✅ | 0 | 0 |
| `runbook-coverage (advisory)` | ✅ | 0 | 0 |
| `runtime-foundations (advisory)` | ✅ | 0 | 0 |
| `sensitive-document-privacy (advisory)` | ✅ | 0 | 0 |
| `service-authority-unique (advisory)` | ✅ | 0 | 0 |
| `service-consolidation-alignment (advisory)` | ✅ | 0 | 0 |
| `service-layer-boundaries (advisory)` | ✅ | 0 | 0 |
| `service-registry-sync (advisory)` | ✅ | 0 | 0 |
| `service-sprawl (advisory)` | ✅ | 0 | 0 |
| `service-topology (advisory)` | ✅ | 0 | 0 |
| `services-structure-hygiene (advisory)` | ✅ | 0 | 0 |
| `stale-deleted-paths (advisory)` | ✅ | 0 | 0 |
| `status-truth-tags (advisory)` | ❌ | 0 | 235 |
| `surface-ownership (advisory)` | ✅ | 0 | 0 |
| `system-stack (advisory)` | ❌ | 0 | 1 |
| `table-membership-completeness (advisory)` | ❌ | 0 | 1 |
| `validator-gate-coverage (advisory)` | ✅ | 0 | 0 |
| `web-deployability (advisory)` | ✅ | 0 | 0 |
| `workflow-reality (advisory)` | ✅ | 0 | 0 |
| `workflow-state-usage (advisory)` | ✅ | 0 | 0 |
| `workflow-states (advisory)` | ✅ | 0 | 0 |
| `wrapper-purity (advisory)` | ✅ | 0 | 0 |

## Verdict

⚠️ All required gates passed, but 4252 warning(s) present. Release is cuttable but review warnings.

## Related

- `docs/os/VALIDATION_MATRIX.md` — full pre-release matrix
- `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md` — deployment verdict
