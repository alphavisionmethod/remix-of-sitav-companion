# Supervisor Model

7 supervisors (1 meta + 6 per-council) defined in `src/lib/internal-agents/supervisors.ts`.

## Capabilities
- Override agent decisions
- Suspend / resume agents
- Downgrade autonomy
- Receive council escalations

## Operator UI
`InternalAgentsBoard` agent drawer surfaces the 3 supervisor actions (Run now / Suspend / Resume / Downgrade) with rationale capture (≥10 chars enforced for suspend & downgrade).

## Validator
`check-internal-agent-escalation-runtime` asserts every agent's `escalationTargets` references a supervisor key present in `SUPERVISORS`.
