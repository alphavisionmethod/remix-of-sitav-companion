

# Phase 2: Live AI Runtime Verification and Brain-Core Activation

## The Real Problem

SITA has three production AI edge functions (`brain-core`, `chat-advisor`, `ai-gateway`), an 8-section admin verification board, receipt/ledger tables, and budget enforcement — but **zero proven runtime invocations exist**. One critical bug blocks everything:

**`use-streaming-chat.ts` line 41 sends the anon key instead of the user's session token.** Every streaming chat call gets 401 because `chat-advisor` requires auth via `requireAuth()`. This means no user has ever gotten a real AI response through the advisor chat.

## Implementation Steps

### Step 1 — Fix streaming chat auth (critical, unblocks everything)

**File: `src/hooks/use-streaming-chat.ts`**

- Import `supabase` from `@/integrations/supabase/client`
- Before fetching, call `supabase.auth.getSession()` to get the access token
- Replace the Authorization header from `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` to `Bearer ${session.access_token}`
- Add `apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` as a separate header (required by Supabase edge function routing)
- If no session exists, set error "Not authenticated" and return early
- Map error status codes to premium messages: 429 rate limit, 402 credits, 503 warming up, 401 session expired

### Step 2 — Add data-testid attributes and degraded state to AdvisorChat

**File: `src/components/sita/AdvisorChat.tsx`**

- Add `data-testid="advisor-chat-input"` to the text input (line 338)
- Add `data-testid="advisor-chat-send"` to the send button (line 355)
- Add `data-testid="advisor-message-assistant"` to streaming assistant message divs (line 296)
- Add `data-testid="advisor-streaming-indicator"` to the bounce dots container (line 318)
- When `error` from `useStreamingChat` is set, render a degraded banner with `data-testid="advisor-degraded-banner"` showing the premium error message with an AlertTriangle icon

### Step 3 — Add receipt_written confirmation to brain-core response

**File: `supabase/functions/brain-core/index.ts`**

In the main response block (around line 725), after the `proof_records` insert succeeds, add `receipt_written: true` to the JSON response. On insert failure, set `receipt_written: false`. Also add `routing_source` (rules/ai/fallback/error) and `budget_checked: true` to the response envelope.

### Step 4 — Improve AIG09 admin board with latest receipt evidence

**File: `src/pages/admin/AIG09RuntimeVerification.tsx`**

- **AIR02 Provider Health** (line 96): After querying `ai_provider_registry`, also fetch the latest `ai_inference_receipts` row per provider to show last success/failure timestamp and latency
- **AIR06 Receipt Truth** (line 296): Add a "Latest Receipt" card showing the most recent `ai_receipt_records` row with timestamp, capability, decision class, and cost

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/use-streaming-chat.ts` | Fix auth: session token instead of anon key, premium error messages |
| `src/components/sita/AdvisorChat.tsx` | data-testid attributes + degraded banner with error display |
| `supabase/functions/brain-core/index.ts` | Add receipt_written, routing_source, budget_checked to response |
| `src/pages/admin/AIG09RuntimeVerification.tsx` | AIR02 latest receipt per provider, AIR06 latest receipt card |

## No Database Changes Required

All tables already exist: `ai_usage_ledger`, `ai_inference_receipts`, `ai_receipt_records`, `ai_token_usage`, `advisor_requests`, `advisor_responses`, `proof_records`.

## Success Criteria

1. Streaming chat returns real AI responses (not 401)
2. At least one `ai_usage_ledger` row with `status = 'success'`
3. At least one `ai_inference_receipts` row with real tokens/cost
4. Admin AIG09 board shows live verification data
5. Degraded states render gracefully with premium messaging
6. E2E selectors stable for Playwright proof

