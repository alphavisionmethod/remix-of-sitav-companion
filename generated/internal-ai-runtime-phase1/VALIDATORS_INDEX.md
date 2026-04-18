# Internal Agent Phase-1 Validators Index

| Gate | Asserts |
|---|---|
| `internal-agent-registry` | 40 agents, no duplicate `agentId`, mission/escalation present |
| `internal-agent-runtime-coverage` | Migration backfills `internal_agent_runtime_state` for every definition |
| `internal-agent-admin-pages` | `AIRuntimeHome` mounts Internal Agents + Councils tabs |
| `internal-agent-escalation-runtime` | Every escalation target resolves to a supervisor key |
| `internal-agent-seed-integrity` | Seed migration is idempotent + writes `spec_hash` |
| `internal-agent-runtime-loop` | Edge function uses canonical gateway, budget guard, kill-switch |

Bundle: `npm run internal-agents:run-all`
