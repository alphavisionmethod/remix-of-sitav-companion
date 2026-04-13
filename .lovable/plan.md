

# Fix AI Gateway Chain — Full Advanced Wiring

## What's Happening

The AI gateway edge function (`ai-gateway`) and chat advisor (`chat-advisor`) are both deployed and functional. The client-side infrastructure (`ai-capability-client.ts`, `callable.ts`) already correctly invokes them via `supabase.functions.invoke()`. 

However, there are **3 gaps** to fix:

1. **Missing `invoke.ts` convenience wrapper** — The plan calls for a clean `src/lib/services/ai-gateway/invoke.ts` that provides a simple `invokeAI()` function. While `callable.ts` already has `callAIGateway()`, it uses `supabase as any` casting and doesn't pass `task_key`/`role_key` for workforce tracking.

2. **`useStreamingChat` bypasses the gateway** — It calls `chat-advisor` directly via raw `fetch()` instead of going through the canonical `invokeAI` path. This means streaming calls don't get tracked in `ai_workforce_invocations`.

3. **`useAdvisorChat` doesn't log to `ai_workforce_invocations`** — It goes through `invokeAICapability` which logs to `ai_inference_receipts` (via the edge function), but not to `ai_workforce_invocations` for workforce tracking.

## Fix Plan

### Step 1: Create `src/lib/services/ai-gateway/invoke.ts`
Clean typed wrapper around `supabase.functions.invoke("ai-gateway")`:
- Accepts `messages`, `model`, `task_key`, `role_key`, `capabilityId`, `taskClass`
- Returns typed response with content, model, tokens, cost
- Logs to `ai_workforce_invocations` client-side after successful call
- Re-export from `src/lib/services/ai-gateway/index.ts`

### Step 2: Update `callable.ts` — remove `as any` cast
Replace `const db = supabase as any` with proper typed usage.

### Step 3: Wire `useAdvisorChat` to log workforce invocations
After each successful `invokeAICapability` call, insert a row into `ai_workforce_invocations` with the advisor's `role_key` and `task_key`.

### Step 4: Verify end-to-end via edge function ping
Test `ai-gateway` with `{ ping: true }` once user is authenticated. Confirm the response includes `hasApiKey: true` and `userId`.

### Step 5: Update barrel export
Add `invokeAI` to `src/lib/services/ai-gateway/index.ts`.

## Files Changed
- **Create**: `src/lib/services/ai-gateway/invoke.ts` (~40 lines)
- **Edit**: `src/lib/services/ai-gateway/callable.ts` (remove `as any`)
- **Edit**: `src/lib/services/ai-gateway/index.ts` (add export)
- **Edit**: `src/lib/ai/hooks/use-advisor-chat.ts` (add workforce logging)

## Verification
After implementation, we'll test the `ai-gateway` ping endpoint. For a full live AI call, you'll need to sign in first — the gateway requires authentication.

