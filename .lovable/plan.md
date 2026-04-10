

# SITA OS — Frontend AI Integration: Final Completion Plan

## Audit Result

The frontend AI integration is **95% built**. All major layers exist: canonical client, response normalizer, state taxonomy (16 states), surface grammar, 6 hooks, 6 components, workforce executor, launch honesty reclassifier, and runtime verification. The architecture is correct and non-duplicated.

## Gaps Found

### Gap 1 — Missing `useMemorySummary` hook
The `memory.summarize` capability is seeded in routing data but has no dedicated frontend hook. All other canonical capabilities have one.

### Gap 2 — Client doesn't forward `surface`, `intent`, `traceRequested` to edge function
`AICapabilityRequest` accepts these fields but `invokeAICapability()` strips them — only sends `capabilityId`, `taskClass`, `messages`, `stream`, `maxTokens`, `temperature`. The gateway can't use surface/intent metadata for routing or receipts.

### Gap 3 — `AICapabilityRequest` missing `receiptRequested` field
Spec Part 5 requires `receiptRequested` in the request contract.

### Gap 4 — Barrel index incomplete
`src/lib/ai/index.ts` doesn't export: `reclassifyAIFeatures`, `useAIRuntimeVerification`, or the new `useMemorySummary` hook. Components in `src/components/ai/` have no barrel.

### Gap 5 — No AI components barrel
`src/components/ai/` has 6 components but no `index.ts` for clean imports.

## Implementation

### Step 1 — Add `receiptRequested` to request type + forward all fields in client
**File: `src/lib/ai/ai-state-types.ts`** — Add `receiptRequested?: boolean` to `AICapabilityRequest`.

**File: `src/lib/ai/ai-capability-client.ts`** — Forward `surface`, `intent`, `traceRequested`, `receiptRequested` in the edge function body.

### Step 2 — Create `useMemorySummary` hook
**New file: `src/lib/ai/hooks/use-memory-summary.ts`** — Thin hook wrapping `useAICapability` with `capabilityKey: "memory.summarize"`, `taskClass: "balanced_assistant"`, `surface: "web.utility"`, `intent: "summarize"`.

### Step 3 — Create AI components barrel
**New file: `src/components/ai/index.ts`** — Re-exports all 6 components.

### Step 4 — Complete AI lib barrel
**File: `src/lib/ai/index.ts`** — Add exports for `reclassifyAIFeatures`, `useAIRuntimeVerification`, `useMemorySummary`.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/ai/ai-state-types.ts` | Add `receiptRequested` to `AICapabilityRequest` |
| `src/lib/ai/ai-capability-client.ts` | Forward surface/intent/trace/receipt fields to gateway |
| `src/lib/ai/hooks/use-memory-summary.ts` | **New** — Memory summarization hook |
| `src/components/ai/index.ts` | **New** — Components barrel |
| `src/lib/ai/index.ts` | Add missing exports |

## What This Does NOT Change
- No database changes
- No edge function changes
- No new admin pages
- No component redesigns (all 6 components are spec-complete)
- No hook rewrites (all existing hooks are correctly thin + capability-driven)

## Summary
2 new files (hook + barrel), 3 enhancements. After this, the frontend AI integration is 100% spec-complete across all 16 parts of the prompt.

