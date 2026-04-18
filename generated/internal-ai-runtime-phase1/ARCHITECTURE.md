# Internal AI Workforce — Phase 1 Architecture

## Data model
- `internal_agent_definitions` — 40 seeded rows, idempotent (`ON CONFLICT (agent_id) DO UPDATE`), versioned by `spec_hash`.
- `internal_agent_runtime_state` — 1:1 with definitions (backfilled `idle` on seed).
- `internal_agent_actions` — per-run receipt; FK `invocation_id → ai_workforce_invocations`.
- `council_escalations` + `supervisor_decisions` — escalation lifecycle.

## Code surfaces
- Registry: `src/lib/internal-agents/agents/{6 council files}.ts` + `index.ts` (`ALL_DETAILED_AGENTS`).
- Supervisors: `src/lib/internal-agents/supervisors.ts` (`SUPERVISORS`).
- Councils: `src/lib/internal-agents/councils.ts` (`COUNCILS`).
- Runtime loop: `supabase/functions/internal-agent-loop/index.ts`.
- Admin UI: `src/pages/admin/ai-runtime/{InternalAgentsBoard,CouncilsBoard}.tsx`.
- Drilldown: `src/components/admin/ai-runtime/AIRuntimeDrilldownPanel.tsx`.

## Validators
6 BLOCK gates (registry, runtime-coverage, admin-pages, escalation-runtime, seed-integrity, runtime-loop).
