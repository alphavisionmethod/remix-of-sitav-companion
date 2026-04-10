

# SITA OS — AI Provider Gateway: Integration Gaps & Enhancement Plan

## Audit Summary

The core AI gateway architecture is 100% built: edge function, client SDK, hooks, admin pages, database tables, budget policies, receipts, routing, and fallback logic are all in place and wired.

**However, 5 edge functions bypass the canonical receipt/usage ledger**, creating a traceability gap. They call the Lovable AI Gateway directly (correct for server-side) but only log to the legacy `ai_token_usage` table — not to the canonical `ai_usage_ledger` or `ai_inference_receipts` tables that the AIG admin dashboards query.

## Gaps Found

### Gap 1 — Edge functions missing canonical receipt logging (5 functions)

| Function | Budget Check | Logs to `ai_usage_ledger` | Logs to `ai_inference_receipts` |
|----------|-------------|---------------------------|--------------------------------|
| `chat-advisor` | Yes (custom) | No — only `ai_token_usage` | No |
| `personal-brain` | Yes (legacy) | No — only `ai_token_usage` | No |
| `brain-core` | No | No | No |
| `agent-executor` | No | No | No |
| `file-ingestion` | No | No | No |

**Impact**: The AIG04 Budget Center and AIG05 Receipts Explorer show incomplete data because these 5 functions account for a significant portion of AI usage but their invocations are invisible to the canonical governance layer.

### Gap 2 — No budget policy check in 3 functions

`brain-core`, `agent-executor`, and `file-ingestion` have no budget enforcement at all. They call the AI gateway without checking `check_ai_budget_policies`, meaning they can exceed budget ceilings silently.

## Implementation Plan

### Step 1 — Create shared AI receipt logging utility

Create `supabase/functions/_shared/ai-receipt-logger.ts` with a reusable function that logs to both `ai_usage_ledger` and `ai_inference_receipts` in one call. All 5 functions will import this instead of duplicating logging code.

```text
logAIReceipt(serviceClient, {
  userId, capabilityKey, model, provider,
  inputTokens, outputTokens, costUsd,
  latencyMs, mode, status
})
```

### Step 2 — Create shared budget check utility

Create `supabase/functions/_shared/ai-budget-check.ts` wrapping the `check_ai_budget_policies` RPC call. Returns allow/block/downgrade decision with fallback model. All functions import this instead of ad-hoc budget logic.

### Step 3 — Enhance `chat-advisor` (already has budget, needs canonical receipts)

Add `ai_usage_ledger` and `ai_inference_receipts` logging after the streaming response is initiated. Keep existing `ai_token_usage` logging for backward compatibility.

### Step 4 — Enhance `personal-brain` (has legacy budget, needs canonical receipts)

Replace legacy budget check with canonical `check_ai_budget_policies`. Add receipt logging to both canonical tables.

### Step 5 — Enhance `brain-core` (no budget, no receipts)

Add budget policy check before AI call. Add canonical receipt logging. Add fallback/degraded handling when budget exceeded.

### Step 6 — Enhance `agent-executor` (no budget, no receipts)

Add budget policy check. Add canonical receipt logging. The function already handles AI unavailability gracefully.

### Step 7 — Enhance `file-ingestion` (no budget, no receipts)

Add budget policy check. Add canonical receipt logging. Already handles missing API key gracefully.

### Step 8 — Deploy all enhanced functions

Deploy all 5 updated functions plus the 2 new shared utilities.

## What This Does NOT Do

- No new database tables (all canonical tables already exist)
- No frontend changes (admin dashboards already query the right tables)
- No changes to the central `ai-gateway` edge function (already complete)
- No changes to client SDK or hooks (already fully wired)
- No changes to admin pages (AIG01-AIG09 already complete)

## Summary

2 new shared utilities + 5 edge function enhancements. Zero new tables, zero frontend changes. Closes the last traceability gap so every AI invocation across the entire platform is visible in the canonical governance layer.

