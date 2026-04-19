# Per-User Budget Enforcement — Proof Bundle

**Generated:** 2026-04-19

## Enforcement call sites (static proof)

| Caller | File | Line region | Behavior |
|---|---|---|---|
| AI Gateway (canonical) | `supabase/functions/ai-gateway/index.ts` | pre-route | Calls `check_user_hard_ceiling` + `check_ai_budget_policies` |
| Shared helper | `supabase/functions/_shared/ai-budget-check.ts` | exported | Wraps both RPCs, fail-closed on RPC failure |
| Internal agent loop | `supabase/functions/internal-agent-loop/index.ts` | pre-invocation | Honors helper response |
| Advisor agent loop | `supabase/functions/advisor-agent-loop/index.ts` | pre-invocation | Honors helper response |

## Validator bindings (BLOCK gates)

1. `check-per-user-ai-ceilings.ts` — verifies `ai-gateway` imports the budget helper
2. `check-ai-budget-hard-stop.ts` — WARN until load-test run; reads `budget-load-runs/*.json`
3. `check-negative-receipts-emitted.ts` — scans for structured refusal patterns

## Honest limits

- **Load-test pending** — `scripts/load-test/budget-load-test.sh` is wired and ready; first run will move `ai-budget-hard-stop` from WARN to GREEN
- 80%-degrade verified in unit tests; production-traffic verification pending
- Receipt-immutability verified by RLS policy review; runtime mutation attempts not yet adversarially probed
