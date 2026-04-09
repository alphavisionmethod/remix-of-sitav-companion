

# Fix Service Family Layer — Deduplicate 7 DUP Services

## Current State

The first 6 services (brain-core, model-router, inference-gateway, conscience-gate, trust-governor, mnemosyne) are **already correctly canonical** in `core-services/` with real implementations and reverse shims in `lib/services/`. No action needed.

The 7 DUP services have a split-brain problem:
- `core-services/X/index.ts` re-exports from a **flat file** (`core-services/X.ts`) — the main engine
- `lib/services/X/` has **additional implementation files** (sub-services) NOT available through core-services

| Service | Flat file (core) | Extra files in lib/services | Total exports split |
|---------|-----------------|----------------------------|-------------------|
| memory-service | 357 lines | 7 files (profile, workflow, boardroom, correction, preference, trust) | Split |
| executor-service | 380 lines | 3 files (action, connector-action, workflow-step) | Split |
| event-bus | 251 lines | 4 files (envelope, publish, subscribe, unified) | Split |
| receipt-service | 285 lines | 4 files (receipts, proof-bundles, approval, execution) | Split |
| policy-engine | 252 lines | 4 files (truth-boundaries, approval-req, sensitive-doc, outbound-comm) | Split |
| capability-router | 131 lines | 3 files (registry, pack-enablement, shell-space) | Split |
| verification-engine | 231 lines | 5 files (verification, rollback, postcondition, receipt-verify, replay) | Split |

Only 5 remaining imports go through `lib/services/` (all in test files) — the reverse shims handle them.

## Fix

For each of the 7 DUP services, update `core-services/X/index.ts` to re-export **both** the flat canonical file AND all `lib/services/X/` sub-services. Then convert `lib/services/X/index.ts` to a pure reverse shim.

### Per-service changes (14 files total)

**For each service:**
1. `core-services/X/index.ts` — add `export * from "@/lib/services/X/sub-service"` lines for each sub-service file
2. `lib/services/X/index.ts` — replace with `export * from "@/lib/core-services/X"` reverse shim

This makes `core-services/` the single canonical source while keeping `lib/services/` as a compatibility shim.

### Verification
- Run `npx tsc --noEmit` to confirm 0 errors
- Grep to confirm no remaining split exports

## Files Changed
- 7 `core-services/*/index.ts` — expanded to include all sub-service exports
- 7 `lib/services/*/index.ts` — converted to reverse shims
- 0 consumer changes needed (shims maintain compatibility)

## Risk
Low — reverse shims ensure all existing imports continue to resolve. Build verification catches any missing re-exports.

