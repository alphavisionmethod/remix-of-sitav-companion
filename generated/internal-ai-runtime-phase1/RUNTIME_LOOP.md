# Internal Agent Runtime Loop

`supabase/functions/internal-agent-loop/index.ts`

## Modes
- `scheduled` — pg_cron driven; evaluates all `is_active = true` agents past their cooldown.
- `manual` + `agentId` — operator-triggered single-agent run from `InternalAgentsBoard` row drawer.

## Per-agent execution path
1. Guard: `is_active`, `current_status != 'suspended'`, `cooldown_until < now()`.
2. Budget: `checkAIBudget` (canonical shared guard).
3. AI call: `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY`.
4. Persist: row in `internal_agent_actions` (FK → `ai_workforce_invocations`).
5. Update: `internal_agent_runtime_state` (success/failure counts, trust delta, cooldown).
6. Escalate (if applicable): row in `council_escalations` for the agent's `primary_escalation_target`.

## Validator
`check-internal-agent-runtime-loop` asserts presence of `checkAIBudget`, gateway URL, action persistence, and at least one kill-switch / cooldown / suspension guard.
