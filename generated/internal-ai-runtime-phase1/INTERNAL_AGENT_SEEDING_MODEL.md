# Internal Agent Seeding Model

**Source of truth:** `src/packages/internal-agent-config/agents/*.ts` (40 agent definitions across 6 councils)  
**Seed payload:** `generated/internal-ai-runtime-phase1/seed-payload.json`  
**Seed RPC:** `public.seed_internal_agents_from_json(_agents jsonb)` (SECURITY DEFINER, admin-gated)

## Pipeline

```
src/packages/internal-agent-config/agents/*.ts
              │
              │  build step (deterministic)
              ▼
generated/internal-ai-runtime-phase1/seed-payload.json
              │
              │  admin invokes RPC (or service role on deploy)
              ▼
seed_internal_agents_from_json(payload)
              │
              ├─► UPSERT internal_agent_definitions  (40 rows)
              └─► INSERT MISSING internal_agent_runtime_state rows
                   (one per agent, defaults: status='idle', trust_score=0.5)
```

## Idempotency

Each agent in the payload carries a `spec_hash` field — a SHA over the canonical fields (mission, council, autonomy ceilings, allowed/forbidden tools, memory scope, thresholds, schedule). The seed RPC stores it in `internal_agent_definitions.spec_hash`.

- Re-seeding with **identical payload** → 40 UPDATEs but `spec_hash` unchanged → seed-integrity validator (`check-internal-agent-seed-integrity.ts`) sees zero diff.
- Re-seeding with **changed agent** → `spec_hash` changes → operator can audit which agent's spec moved.

## Operator-preserving fields

The seed RPC intentionally **does not overwrite**:
- `current_autonomy_level` — operators may downgrade an agent below `max_autonomy_level`.
- `is_active` — operators may pause an agent without removing the spec.
- `internal_agent_runtime_state.*` — runtime state is never reset by re-seed.

This ensures re-seeding is safe to run on every deploy.

## Council coverage (verified)

| Council | Agent count |
|---|---|
| `architecture-governance` | 7 |
| `knowledge-coordination` | 6 |
| `product-build` | 7 |
| `reliability-ops` | 7 |
| `runtime-cost` | 6 |
| `security-trust` | 7 |
| **Total** | **40** |

## Validator coverage

- `check-internal-agent-registry.ts` — definition count == 40, no orphan `agent_id`s.
- `check-internal-agent-seed-integrity.ts` — payload hash matches DB `spec_hash`; idempotent re-seed produces zero schema diff.
- `check-internal-agent-runtime-coverage.ts` — every definition has a runtime_state row.
