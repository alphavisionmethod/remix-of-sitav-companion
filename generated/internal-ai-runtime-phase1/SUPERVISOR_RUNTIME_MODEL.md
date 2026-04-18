# Supervisor Runtime Model

**Source:** `src/packages/internal-agent-config/supervisors.ts`  
**Persistence:** `public.supervisor_decisions`  
**Visibility:** `/admin/ai-runtime/councils` + per-agent drilldown drawer

## 7 supervisors

| Supervisor key | Council | Max concurrent escalations | Can override | Can suspend |
|---|---|---|---|---|
| `meta-supervisor` | `all` | 50 | ✅ | ✅ |
| `product-build-supervisor` | `product-build` | 10 | ✅ | ✅ |
| `reliability-ops-supervisor` | `reliability-ops` | 10 | ✅ | ✅ |
| `security-trust-supervisor` | `security-trust` | 10 | ✅ | ✅ |
| `runtime-cost-supervisor` | `runtime-cost` | 10 | ✅ | ✅ |
| `architecture-governance-supervisor` | `architecture-governance` | 10 | ✅ | ✅ |
| `knowledge-coordination-supervisor` | `knowledge-coordination` | 10 | ✅ | ✅ |

## Decision types

Persisted in `supervisor_decisions.decision_type`:

| Decision | Effect |
|---|---|
| `approve` | Releases an `approval_ready` action; loop re-runs the action with autonomy permitted. |
| `reject` | Marks the action `failed`; agent gets `consecutive_failures += 1`. |
| `override` | Forces a specific outcome on an escalation regardless of agent confidence. |
| `suspend` | Sets `internal_agent_runtime_state.current_status = 'suspended'`, populates `suspension_reason` + `suspended_by`. |
| `downgrade` | Lowers `current_autonomy_level` (e.g. L4 → L2); persists rationale. |
| `escalate_to_meta` | Sets `council_escalations.status = 'escalated_to_meta'` and routes to `meta-supervisor`. |

Every decision row carries a non-null `rationale` and optional `evidence_refs` jsonb (canonical receipt IDs, action IDs, log refs).

## Escalation routing

```
agent fails / low confidence / budget block
          │
          ▼
  council_escalations  (status=open, target=council supervisor)
          │
          │  council supervisor reviews
          ▼
   supervisor_decisions  (approve | reject | override | suspend | downgrade)
          │
          ├─► resolved → council_escalations.status='resolved'
          │
          └─► unresolved + critical
                       │
                       ▼
              escalate_to_meta decision
                       │
                       ▼
              council_escalations.status='escalated_to_meta'
              target_supervisor='meta-supervisor'
```

## Operator-as-supervisor

The admin UI lets operators take supervisor actions directly. When an admin clicks "Suspend agent" or "Downgrade autonomy" in `InternalAgentsBoard`, the row written to `supervisor_decisions` carries `supervisor_key='meta-supervisor'` and `evidence_refs={"actor_user_id": "..."}` — preserving full audit lineage.

## Meta-supervisor path

`meta-supervisor` is the canonical fall-through. It:
- Receives any escalation marked `escalate_to_meta`.
- Has authority across all 6 councils.
- Has the highest concurrent escalation cap (50).
- Its decisions cannot be further escalated (terminal).

## Validator coverage

- `check-internal-agent-escalation-runtime.ts` — every `escalation_targets` entry in `internal_agent_definitions` resolves to a real supervisor key in the canonical `SUPERVISORS` registry.
