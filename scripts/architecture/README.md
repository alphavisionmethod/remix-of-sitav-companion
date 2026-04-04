# Architecture Validation Scripts

This directory contains scripts that enforce SITA OS constitutional architecture boundaries.

## Running

```bash
# Run all architecture checks
npx tsx scripts/architecture/architecture-report.ts

# Run a single check
npx tsx scripts/architecture/check-module-count.ts
```

## Checks

| Script | Purpose |
|--------|---------|
| `boundary-check.ts` | One-brain, three-domain boundary enforcement |
| `check-advisor-registry.ts` | Advisor registry ↔ source sync |
| `check-capability-families.ts` | Capability family completeness |
| `check-connector-catalog.ts` | Connector catalog ↔ source sync |
| `check-contract-family-completeness.ts` | Contract barrel exports |
| `check-contract-registry.ts` | Contract manifest ↔ source sync |
| `check-event-catalog.ts` | Event type barrel completeness |
| `check-event-receipt-linkage.ts` | Event → receipt pairing |
| `check-module-count.ts` | Service count budget |
| `check-outbound-communication-policy.ts` | No raw HTTP in domain code |
| `check-policy-coverage.ts` | Capability → policy binding |
| `check-proof-coverage.ts` | Mutation → receipt binding |
| `check-sensitive-document-privacy.ts` | No PII in generated artifacts |
| `check-service-sprawl.ts` | Service sprawl detection |
| `check-status-truth-tags.ts` | Canonical status tags |
| `check-surface-ownership.ts` | Route → owner mapping |
| `check-workflow-state-usage.ts` | Workflow state machine usage |

## Shared Utilities

`lib/utils.ts` provides: `scanDir()`, `readJsonSafe()`, `extractExports()`, `extractImports()`, `ViolationCollector`, domain classifiers, and manifest loaders.
