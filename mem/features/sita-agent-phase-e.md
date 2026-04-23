---
name: sita-agent-phase-e
description: Phase E of Sita-as-Jarvis — agentic execution. Voice/text intents become typed Action Plans (planner edge fn) routed through the kernel. Per-domain L0–L4 autonomy (business/finance/concierge). Persisted in `sita_agent_plans`.
type: feature
---

## Sita Agent (Phase E)

- **Skill registry** lives in `src/lib/sita-agent/skills/{business,finance,concierge}-skills.ts` and is mirrored inside `supabase/functions/sita-agent-planner/index.ts` (CATALOG). Keep both in sync — the edge function rejects any skillId not in its catalog.
- **Planner** uses Lovable AI Gateway with `google/gemini-2.5-pro` + tool-calling (`emit_action_plan`). Server forces `requiresApproval=true` whenever a step is high-risk or irreversible regardless of model output.
- **Execution** routes through `useCanonicalAction()` — never call kernel/Supabase directly from the agent.
- **Autonomy tiers** are stored in `localStorage["sita_autonomy_tiers_v1"]` and synced to `sita_autonomy_preferences`. Tiers: 0 manual, 1 suggest, 2 assist, 3 execute, 4 autopilot. `canAutoRunStep` is the single decision function.
- **UI**: `SitaActionPlanCard` (HUD modal), `SitaAutonomyControls` (Control Center row), `SitaAgentMount` (event bridge).
- **Voice integration**: `voice-intent-router` emits `kind: "agent_plan"` for action-y utterances; Whisper actions starting with `do:` dispatch `sita-agent-intent`.
- **Tables**: `sita_agent_plans` (RLS by `auth.uid()=user_id`), `sita_autonomy_preferences` (RLS by user). Both 90-day TTL via `expires_at`.