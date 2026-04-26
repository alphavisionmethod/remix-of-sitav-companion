# Add Quatarly as primary AI provider (Lovable AI as fallback)

## Goal

Add your Quatarly API key as a backend secret and re-route the `ai-gateway` edge function so **Quatarly is the primary provider** and **Lovable AI is the automatic fallback**. Keep the existing budget enforcement, kill-switches, receipts, and routing tables intact — only the outbound call layer changes.

You paste your `QUATARLY_API_KEY` once into Lovable Cloud's secret prompt; nothing goes in `.env`, the codebase, or the frontend.

---

## Step 1 — Request the secret

Trigger the `add_secret` prompt for `QUATARLY_API_KEY`. You paste the key from `api.quatarly.cloud/api-key`. Stored encrypted, only readable inside edge functions via `Deno.env.get("QUATARLY_API_KEY")`.

`LOVABLE_API_KEY` is **not** touched — it stays as the safety net.

---

## Step 2 — Task-class → Quatarly model map (with a real budget plan)

Replace the current Lovable-only `TASK_CLASS_MODELS` in `supabase/functions/ai-gateway/index.ts` with a Quatarly-first map. Models picked to match each task's actual cost/quality need so heavy tasks don't blow your credits:

| Task class | Primary (Quatarly) | Why |
|---|---|---|
| `premium_synthesis` | `claude-opus-4-6-thinking` | Boardroom + deep RCA only. Highest quality, highest cost — already gated by `premium_synthesis` budget rule. |
| `balanced_assistant` | `gemini-3-flash` | Default for chat, advisor convo, general use. Fast + cheap. |
| `economy_utility` | `claude-haiku-4-5-20251001` | Background jobs, summarization, classification. |
| `cheap_utility` | `gemini-3-flash` | Cheapest viable model. |
| `internal_only` | `gpt-5.2` | Internal agent loop, planner, orchestrator. Strong reasoning. |
| `fallback` | `gemini-3-flash` | When primary degrades. |
| `fallback_degraded` | `gemini-3-flash` | Hard budget downgrade. |

**`COST_PER_1K` updated** to match Quatarly's relative pricing so the existing `checkAIBudget()` math stays accurate:
- `claude-opus-4-6-thinking`: ~$0.015
- `gpt-5.2`: ~$0.010
- `claude-sonnet-4-6-thinking`: ~$0.006
- `gemini-3.1-pro`: ~$0.005
- `claude-haiku-4-5-20251001`: ~$0.0008
- `gemini-3-flash`: ~$0.0003

Your existing budget policies (`user_hard_ceiling`, `premium_synthesis` cap, daily/monthly limits) **automatically protect against runaway spend** — no new logic needed.

---

## Step 3 — Provider routing layer

Single, surgical change to the outbound call:

```ts
const QUATARLY_URL = "https://api.quatarly.cloud/v1/chat/completions";
const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions"; // fallback only

async function callProvider(payload) {
  const QUATARLY_KEY = Deno.env.get("QUATARLY_API_KEY");
  const LOVABLE_KEY  = Deno.env.get("LOVABLE_API_KEY");

  if (QUATARLY_KEY) {
    const res = await fetch(QUATARLY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${QUATARLY_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // Fall back ONLY on infra/credit/rate failures — not on 4xx client errors
    if (res.ok || ![402, 429, 500, 502, 503, 504].includes(res.status)) {
      return { res, provider: "quatarly" };
    }
    console.warn(`[ai-gateway] Quatarly ${res.status} — falling back to Lovable AI`);
  }

  // Fallback: Lovable AI — translate Quatarly model name → Lovable equivalent
  const fallbackPayload = { ...payload, model: translateToLovableModel(payload.model) };
  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(fallbackPayload),
  });
  return { res, provider: "lovable" };
}
```

`translateToLovableModel()` maps Quatarly model IDs → nearest Lovable equivalent so fallback calls don't 400. Both APIs share the OpenAI Chat Completions schema, so messages/stream/tools/max_tokens/temperature flow through unchanged.

---

## Step 4 — Receipts & observability

Update `ai_inference_receipts` insert to record the actual `provider: "quatarly" | "lovable"` used. Then:

```sql
select provider, count(*), avg(latency_ms)
from ai_inference_receipts
where created_at > now() - interval '1 day'
group by 1;
```

…shows Quatarly vs Lovable split and confirms fallback isn't firing constantly.

---

## Step 5 — Streaming path

Quatarly is OpenAI-compatible for SSE, so the existing streaming branch works as-is. No frontend changes — `use-streaming-chat.ts`, advisor pages, etc. all keep working. URL, auth, SSE parsing are identical.

---

## Step 6 — Verify

1. Deploy the updated `ai-gateway` function (auto-deploys on save).
2. Hit the ping path (`body: { ping: true }`) to confirm the function still answers.
3. Send one real test prompt — confirm a row lands in `ai_inference_receipts` with `provider = 'quatarly'`.
4. Watch logs to confirm the fallback path is wired (warn line fires only on real failures).

---

## What I will NOT touch

- `LOVABLE_API_KEY` (kept as fallback)
- Frontend code (`use-streaming-chat.ts`, advisor pages) — same SSE shape
- Budget / kill-switch / RLS logic
- `src/integrations/supabase/client.ts` or `.env`
- Any of the 200 admin pages still in the Phase 9 backlog

## Files that will change
- `supabase/functions/ai-gateway/index.ts` (model map, COST_PER_1K, callProvider helper, receipt provider field)
- New secret: `QUATARLY_API_KEY` (via the secret prompt — not a file)

After approval: I request the secret, make the edits, and deploy. Total change ≈ 80 lines in one file.