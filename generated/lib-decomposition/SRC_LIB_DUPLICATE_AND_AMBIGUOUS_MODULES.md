# SITA OS — src/lib Duplicate & Ambiguous Modules (Wave 0)

Generated: 2026-04-18T02:42:31.489Z

Detected 14 fingerprint groups with >1 file (heuristic: identical export shape + identical byte length).

> Note: This is a heuristic. Manual review required before merging — files with the same export names may have different implementations.

## Duplicate groups

### Fingerprint `bb7d389e6e2a`
- `src/lib/core-services/approval-engine/approval-history.service.ts`
- `src/lib/services/approval-engine/approval-history.service.ts`

### Fingerprint `a18d52ccb045`
- `src/lib/core-services/approval-engine/approval-routing.service.ts`
- `src/lib/services/approval-engine/approval-routing.service.ts`

### Fingerprint `ab7a3637fe90`
- `src/lib/core-services/approval-engine/escalation-rules.service.ts`
- `src/lib/services/approval-engine/escalation-rules.service.ts`

### Fingerprint `5a6407006bca`
- `src/lib/core-services/brain-core/build-approval-package.ts`
- `src/lib/services/brain-core/build-approval-package.ts`

### Fingerprint `b8fcb0dce40c`
- `src/lib/core-services/brain-core/build-boardroom-request.ts`
- `src/lib/services/brain-core/build-boardroom-request.ts`

### Fingerprint `3024ba206e92`
- `src/lib/core-services/brain-core/build-explanation.ts`
- `src/lib/services/brain-core/build-explanation.ts`

### Fingerprint `4a4ecb2981e5`
- `src/lib/core-services/brain-core/build-simulation-request.ts`
- `src/lib/services/brain-core/build-simulation-request.ts`

### Fingerprint `bead0362a135`
- `src/lib/core-services/brain-core/choose-advisors.ts`
- `src/lib/services/brain-core/choose-advisors.ts`

### Fingerprint `60031ab0fd30`
- `src/lib/core-services/brain-core/choose-execution-mode.ts`
- `src/lib/services/brain-core/choose-execution-mode.ts`

### Fingerprint `14f17e5a645e`
- `src/lib/core-services/brain-core/councils.ts`
- `src/lib/services/brain-core/councils.ts`

### Fingerprint `73680c48aef6`
- `src/lib/core-services/brain-core/model-router.ts`
- `src/lib/services/brain-core/model-router.ts`

### Fingerprint `4a83048285ac`
- `src/lib/core-services/brain-core/orchestrate-intent.ts`
- `src/lib/services/brain-core/orchestrate-intent.ts`

### Fingerprint `4fe30fb97bcd`
- `src/lib/core-services/conscience-gate/conscience-gate.ts`
- `src/lib/services/conscience-gate/conscience-gate.ts`

### Fingerprint `32755ff41cc3`
- `src/lib/core-services/conscience-gate/critique-loop.ts`
- `src/lib/services/conscience-gate/critique-loop.ts`
