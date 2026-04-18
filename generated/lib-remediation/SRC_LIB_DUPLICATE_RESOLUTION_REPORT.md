# SITA OS — Duplicate Resolution Report (Wave 4)

Generated: 2026-04-18

All 14 duplicate fingerprint groups identified in `SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md` were processed.

**Decision rule:** When two paths held byte-identical implementations, the `core-services/` location was kept canonical (per the Service Constitution memory: core-services is the documented authority layer). The `services/` counterpart was replaced with a `// @lovable:migrated-wrapper` thin re-export.

| Domain | Canonical | Retired (now wrapper) | Status |
|---|---|---|---|
| approval-engine | `src/lib/core-services/approval-engine/approval-history.service.ts` | `src/lib/services/approval-engine/approval-history.service.ts` | wrapped |
| approval-engine | `src/lib/core-services/approval-engine/approval-routing.service.ts` | `src/lib/services/approval-engine/approval-routing.service.ts` | wrapped |
| approval-engine | `src/lib/core-services/approval-engine/escalation-rules.service.ts` | `src/lib/services/approval-engine/escalation-rules.service.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/build-approval-package.ts` | `src/lib/services/brain-core/build-approval-package.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/build-boardroom-request.ts` | `src/lib/services/brain-core/build-boardroom-request.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/build-explanation.ts` | `src/lib/services/brain-core/build-explanation.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/build-simulation-request.ts` | `src/lib/services/brain-core/build-simulation-request.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/choose-advisors.ts` | `src/lib/services/brain-core/choose-advisors.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/choose-execution-mode.ts` | `src/lib/services/brain-core/choose-execution-mode.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/councils.ts` | `src/lib/services/brain-core/councils.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/model-router.ts` | `src/lib/services/brain-core/model-router.ts` | wrapped |
| brain-core | `src/lib/core-services/brain-core/orchestrate-intent.ts` | `src/lib/services/brain-core/orchestrate-intent.ts` | wrapped |
| conscience-gate | `src/lib/core-services/conscience-gate/conscience-gate.ts` | `src/lib/services/conscience-gate/conscience-gate.ts` | wrapped |
| conscience-gate | `src/lib/core-services/conscience-gate/critique-loop.ts` | `src/lib/services/conscience-gate/critique-loop.ts` | wrapped |

Machine-readable: `generated/lib-remediation/duplicate-resolution.json`.
