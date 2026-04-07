
# Phase 2: Live AI Runtime Verification and Brain-Core Activation

## The Real Problem

SITA has a structurally impressive AI layer — three edge functions (`brain-core`, `chat-advisor`, `ai-gateway`), 8-section admin verification board, receipt/ledger tables, budget enforcement — but **zero proven runtime invocations exist**. The system is architecture-first, not proof-first.

Two critical bugs block live AI truth:

1. **`use-streaming-chat.ts` sends anon key instead of user session token** (line 41) — every streaming chat call hits 401 because `chat-advisor` requires auth. This means no user has ever gotten a real AI chat response.
2. **No live invocation has ever been triggered from the admin verification board** — the "Run Verification" button calls `ai-health` but that also requires auth and has never been tested with a logged-in user from the frontend.

## Implementation Steps

### Step 1 — Fix streaming chat auth (critical bug)

**File: `src/hooks/use-streaming-chat.ts`**

Replace the hardcoded anon key with the user's actual session token. The hook must get the session from Supabase auth and pass `Bearer <access_token>` plus the `apikey` header.

```
Authorization: Bearer ${session.access_token}
apikey: ${VITE_SUPABASE_PUBLISHABLE_KEY}
```

This single fix unblocks all advisor chat, making Loop 2 (Files + AI Assist) and the advisor journey provable.

### Step 2 — Verify brain-core and chat-advisor edge functions deploy and respond

Use curl to test both functions with a valid auth token after the fix. Confirm:
- `brain-core` returns structured `AdvisorResult` with correlation ID, source, confidence
- `chat-advisor` returns SSE stream with `data:` chunks
- Both write to `ai_token_usage` / `ai_usage_ledger` / `ai_inference_receipts`

### Step 3 — Consolidate AI architecture clarity

The three AI edge functions currently have overlapping roles:
- `ai-gateway`: generic AI invocation (used by `ai-capability-client.ts`)
- `brain-core`: structured advisor with rules engine + LLM escalation  
- `chat-advisor`: streaming chat with personality prompts + memory

**No code duplication removal needed** — their roles are distinct. But add a clear comment header to each and ensure the frontend hooks call the right one:
- `useStreamingChat` → `chat-advisor` (streaming conversations)
- `useBrainCore` → `brain-core` (structured intent-based queries)
- `useAICapability` → `ai-gateway` (generic AI capability invocation)

### Step 4 — Wire invocation normalization to brain-core

Update `brain-core` edge function to include in every response:
- `invocation_id` (use the existing correlation_id)
- `routing_source` (rules/ai/fallback/error)
- `budget_class` checked
- `fallback_used` flag
- `receipt_written` confirmation

The response already has most of this — just ensure `receipt_written: true` is included after the proof_records insert succeeds.

### Step 5 — Improve degraded-state behavior in AdvisorChat

**File: `src/components/sita/AdvisorChat.tsx`**

When the streaming chat returns an error (401, 429, 402, 503), display a premium degraded state instead of just the error string:
- 503/provider missing → "AI advisor is warming up. Your request will be processed when available."
- 429/rate limit → "You're asking great questions. Give me a moment to catch up."
- 402/credits → "AI credits need attention. Visit Settings to continue."
- Generic error → "Something unexpected happened. Try again in a moment."

Add `data-testid="advisor-degraded-banner"` for E2E testability.

### Step 6 — Wire AIG09 admin board to real invocation data

**File: `src/pages/admin/AIG09RuntimeVerification.tsx`**

The board already queries `ai_usage_ledger`, `ai_provider_registry`, `ai_model_registry`, and `ai_inference_receipts`. The data will start flowing once Steps 1-2 are complete. However, improve:

- **AIR02 Provider Health**: After querying `ai_provider_registry`, also check the latest `ai_inference_receipts` for actual success/failure per provider
- **AIR06 Receipt Truth**: Add "last receipt" timestamp and link to latest receipt row

### Step 7 — Update customer journey classifications

After proving at least one live AI response, update the relevant journey status entries:
- `assistant.chat` → from `inferred` to `partial` (proven once live AI responds)
- Update `customer_journey_status` for advisor chat journey with evidence

### Step 8 — Add Playwright testability for AI responses

**File: `src/components/sita/AdvisorChat.tsx`**

Add `data-testid` attributes:
- `data-testid="advisor-chat-input"` on the text input
- `data-testid="advisor-chat-send"` on the send button
- `data-testid="advisor-message-assistant"` on assistant message bubbles
- `data-testid="advisor-streaming-indicator"` on the streaming dots

This makes the existing E2E spec `assistant-chat-primary.spec.ts` able to detect real responses.

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/use-streaming-chat.ts` | Fix auth: use session token instead of anon key |
| `src/components/sita/AdvisorChat.tsx` | Premium degraded states + data-testid attributes |
| `supabase/functions/brain-core/index.ts` | Add `receipt_written` flag to response |
| `src/pages/admin/AIG09RuntimeVerification.tsx` | Improve AIR02/AIR06 with latest receipt data |

## No Database Changes Required

All tables exist: `ai_usage_ledger`, `ai_inference_receipts`, `ai_receipt_records`, `ai_token_usage`, `advisor_requests`, `advisor_responses`, `proof_records`.

## Success Criteria

1. Streaming chat returns real AI responses (not 401)
2. At least one `ai_usage_ledger` row with `status = 'success'` exists
3. At least one `ai_inference_receipts` row exists with real tokens/cost
4. Admin AIG09 board shows live verification data
5. Degraded states render gracefully in advisor chat
6. E2E selectors are stable for Playwright proof
