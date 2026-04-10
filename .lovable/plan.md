

# SITA OS — AI Model Routing Matrix: Enhancement Plan

## Current State

The routing infrastructure is 95% built. Three layers exist:
1. **Edge gateway** (`ai-gateway/index.ts`) — 4-tier task class → model mapping with budget checks, fallback, and triple-table receipt logging
2. **Compute governance** (`model-routing-engine.ts`) — Cost class A/B/C/D routing with cache, budget downgrade, and approval logic
3. **Brain-core model router** (`brain-core/model-router.ts`) — Complexity/risk → tier routing with budget enforcement
4. **Seed service** (`ai-routing-seed-service.ts`) — 7 capability seeds with routing/budget/honesty metadata
5. **Types** (`ai-gateway/types.ts`) — All 5 routing classes defined: `premium_synthesis`, `balanced_assistant`, `economy_utility`, `fallback`, `internal_only`

## Gaps Found

### Gap 1 — Missing `memory.summarize` capability in seed data
The spec requires 6 canonical capability mappings. Only 5 of 6 are seeded. `memory.summarize` is absent.

### Gap 2 — Seed routing_class values don't match canonical types
Seeds use short names (`"balanced"`, `"premium"`, `"utility"`) but the canonical `RoutingClass` type uses `"balanced_assistant"`, `"premium_synthesis"`, `"economy_utility"`. This mismatch means admin dashboards filtering by canonical routing class won't find these seeds.

### Gap 3 — `admin.synthesis` should use `internal_only` routing class
The spec says admin.synthesis must be `internal_only` routing class, but the seed uses `"balanced"`. It should also allow premium/reasoning models per the spec.

### Gap 4 — No `internal_only` handling in the gateway
The gateway's `TASK_CLASS_MODELS` has no entry for `internal_only`. If an internal capability resolves to this class, it falls through to the default model instead of using a premium/reasoning model.

### Gap 5 — Seed models missing Google provider entry
The seed service has OpenAI, Anthropic, and Lovable providers but all Gemini models are only under `lovable` provider. A dedicated `google` provider entry is missing for direct Google API use.

## Implementation Plan

### Step 1 — Enhance seed service with full spec compliance
Update `src/lib/ai/ai-routing-seed-service.ts`:
- Add `memory.summarize` capability seed (balanced_assistant, medium budget, medium quality)
- Fix all `routing_class` values to use canonical names: `"balanced"` → `"balanced_assistant"`, `"premium"` → `"premium_synthesis"`, `"utility"` → `"economy_utility"`
- Change `admin.synthesis` routing_class to `"internal_only"`
- Add `google` provider seed entry
- Add more model seeds: `gemini-2.5-pro` (premium), `gemini-3-flash-preview` (balanced), `gpt-5` (premium OpenAI)

### Step 2 — Add `internal_only` task class to gateway
Update `supabase/functions/ai-gateway/index.ts`:
- Add `internal_only: "google/gemini-2.5-pro"` to `TASK_CLASS_MODELS` (premium model for internal ops)
- Add cost entry for `google/gemini-2.5-pro` in `COST_PER_1K` if missing

### Step 3 — Enhance seed launch honesty for new capability
Add `memory.summarize` to `LAUNCH_HONESTY_SEEDS` in the seed service.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/ai/ai-routing-seed-service.ts` | Add memory.summarize, fix routing_class names, add google provider, add models |
| `supabase/functions/ai-gateway/index.ts` | Add `internal_only` to TASK_CLASS_MODELS |

## What This Does NOT Change
- No new database tables or columns
- No new frontend pages (admin dashboards already display whatever is seeded)
- No changes to compute-governance or brain-core routers (different layer, already correct)
- No changes to client SDK or hooks
- No changes to shared budget/receipt utilities

## Summary
2 file enhancements. Aligns seed data with canonical types, adds missing capability, and ensures internal_only routing works end-to-end in the gateway.

