# Concierge Chat Closure Spec — Honest Deferral

**Scope:** Admin AI Engineering closure pass
**Verdict:** DEFERRED — out of admin AI engineering scope
**Cross-references:** [ADMIN_AI_RUNTIME_CLOSURE_SPEC.md](./ADMIN_AI_RUNTIME_CLOSURE_SPEC.md)
**Validator:** `scripts/validation/check-concierge-ai-state-handling.ts` (WARN-tier)

## Spec compliance verdict

Concierge Chat is listed in the spec but its UX surface (`src/pages/concierge/*`) is a **user surface**. Per **"integrate it correctly only on the admin AI engineer team"**, concierge chat UX polish is **out-of-admin-AI-scope**. The runtime backbone the concierge depends on IS in scope and IS green.

## What IS in admin AI scope (already done)

The concierge's AI runtime backbone is fully proven through the AI Engineer hub:
- `AIRuntimeNightlyTruthPanel` — live-provider verification, receipts, ledger, fallback, budget.
- `ConnectorTruthSummaryPanel` — live OAuth refresh truth.
- 7-day streak model + nightly verifier (`ai-runtime-nightly-verify` edge function).
- Provider-unavailable / budget-exceeded / degraded-fallback states are tracked at runtime via `ai_provider_health`, `ai_usage_ledger`, `ai_fallback_events`, `ai_budget_decision_receipts`.
- Receipts are persisted in `ai_action_receipts` and `ai_inference_receipts`.

## What is NOT in admin AI scope

- The user-facing chat composer, message rendering, status chip readability on narrow widths, retry/error callouts on small viewports — **user-flagship-pass-required**.
- AI agency wording in chat-facing copy and the canonical AI trust disclosure block on the concierge surface — **user-flagship-pass-required**.
- Touch ergonomics for composer on small screens — **user-flagship-pass-required**.

## Canonical evidence locations

| Concern | Source of truth |
|---|---|
| Live AI runtime proof | `generated/ai-runtime-nightly-status.json` |
| Provider health | `ai_provider_health` table |
| Budget enforcement | `ai_budget_decision_receipts` table |
| Receipts | `ai_action_receipts`, `ai_inference_receipts` |
| Fallback events | `ai_fallback_events` table |

## Honest WARN-tier classification

The runtime IS proven. The chat UX polish is honestly deferred. The validator emits WARN-tier with cross-reference to this spec.

## Required for green

A future user-flagship-pass must:
1. Wire `/concierge/*` to the canonical runtime status surfaces above.
2. Add chat-specific degraded/budget/error treatments using shared state primitives.
3. Tighten chat copy to match runtime proof level (no over-claiming autonomy).
4. Add canonical AI trust disclosure block.

Until then, this gate stays honest WARN.
