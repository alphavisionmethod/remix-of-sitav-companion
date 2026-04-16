# SITA OS — Deprecated Paths

> Generated: 2026-04-16

## Deprecated Script Paths

These paths no longer exist after the global refactor. All consumers have been updated.

| Old Path | New Canonical Path | Consumers Updated |
|----------|-------------------|-------------------|
| `scripts/validation/validate-service-contracts.ts` | `scripts/contracts/validate/validate-service-contracts.ts` | platform-law-registry |
| `scripts/validation/validate-event-types.ts` | `scripts/contracts/validate/validate-event-types.ts` | platform-law-registry |
| `scripts/validation/check-proof-coverage.ts` | `scripts/architecture/checks/check-proof-coverage.ts` | platform-law-registry |
| `scripts/validation/check-policy-coverage.ts` | `scripts/architecture/checks/check-policy-coverage.ts` | platform-law-registry |
| `scripts/validation/check-capability-families.ts` | `scripts/architecture/checks/check-capability-families.ts` | platform-law-registry |
| `scripts/validation/check-event-catalog.ts` | `scripts/architecture/checks/check-event-catalog.ts` | platform-law-registry |
| `scripts/validation/check-contract-registry.ts` | `scripts/architecture/checks/check-contract-registry.ts` | platform-law-registry |
| `scripts/validation/check-contract-family-completeness.ts` | `scripts/architecture/checks/check-contract-family-completeness.ts` | platform-law-registry |
| `scripts/validation/check-module-count.ts` | `scripts/architecture/checks/check-module-count.ts` | platform-law-registry |
| `scripts/validation/check-service-sprawl.ts` | `scripts/architecture/checks/check-service-sprawl.ts` | platform-law-registry |
| `scripts/validation/check-status-truth-tags.ts` | `scripts/architecture/checks/check-status-truth-tags.ts` | platform-law-registry |
| `scripts/validation/check-surface-ownership.ts` | `scripts/architecture/checks/check-surface-ownership.ts` | platform-law-registry |
| `scripts/validation/check-workflow-state-usage.ts` | `scripts/architecture/checks/check-workflow-state-usage.ts` | platform-law-registry |
| `scripts/validation/check-outbound-communication-policy.ts` | `scripts/architecture/checks/check-outbound-communication-policy.ts` | platform-law-registry |
| `scripts/validation/check-sensitive-document-privacy.ts` | `scripts/architecture/checks/check-sensitive-document-privacy.ts` | platform-law-registry |
| `scripts/validation/check-event-receipt-linkage.ts` | `scripts/architecture/checks/check-event-receipt-linkage.ts` | platform-law-registry |
| `scripts/validation/check-advisor-registry.ts` | `scripts/architecture/checks/check-advisor-registry.ts` | platform-law-registry |
| `scripts/validation/check-connector-catalog.ts` | `scripts/architecture/checks/check-connector-catalog.ts` | platform-law-registry |
| `scripts/generate-service-manifest.ts` | `scripts/manifests/generate/generate-service-manifest.ts` | platform-law-registry |
| `scripts/generate-route-manifest.ts` | `scripts/manifests/generate/generate-route-manifest.ts` | platform-law-registry |
| `scripts/generate-capability-index.ts` | `scripts/manifests/generate/generate-capability-index.ts` | platform-law-registry |
| `scripts/generate-security-manifest.ts` | `scripts/manifests/generate/generate-security-manifest.ts` | platform-law-registry |
| `scripts/generate-integration-map.ts` | `scripts/manifests/generate/generate-integration-map.ts` | platform-law-registry |
| `scripts/generate-boot-chain.ts` | `scripts/manifests/generate/generate-boot-chain.ts` | platform-law-registry |
| `scripts/architecture/boundary-check.ts` | `scripts/architecture/checks/boundary-check.ts` | platform-law-registry |

## Deprecated Directories

| Old Directory | Status | Notes |
|---------------|--------|-------|
| `scripts/validation/` | REMOVED | All scripts migrated to `scripts/architecture/checks/` and `scripts/contracts/validate/` |
| `scripts/legacy/` | ARCHIVED | 2 files, pre-refactor artifacts, safe to remove |

---

*No deprecated path references remain in active source code. Verified via grep scan.*
