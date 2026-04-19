# Security Policy Proposal Path Spec

## Principle

**Detect → Propose → Approve → Apply** — never **Detect → Apply**.

## Flow

```
st-policy-review (or other security agent)
        │
        │ detects gap (e.g., RLS-enabled table with no policies)
        ▼
record_security_finding RPC
        │
        │ if severity ∈ {high, critical} AND routeToSuggestion present
        ▼
propose_implementation_suggestion RPC (Phase 3)
        │
        │ creates ai_implementation_suggestions row, status=proposed
        ▼
/admin/ai-runtime/suggestions  (Phase 3 board)
        │
        │ admin reviews, sets status=under_review → accepted | rejected
        ▼
internal-agent-policy-architect  (existing Phase 4 policy drafts)
        │
        │ generates SQL draft (NEVER auto-applies)
        ▼
admin reviews draft → manual SQL execution via migration tool
```

## Required suggestion fields (enforced)

| Field | Source |
|---|---|
| `source_agent_id` | originating security agent |
| `source_council` | `"security-trust"` |
| `source_signal_type` | `"security_finding:{type}"` |
| `source_signal_ref` | unique signal ref (idempotency) |
| `proposed_change_type` | `"security"` |
| `evidence_refs` | `[{kind: "security_finding", id, agent}]` |
| `priority` | `"high"` for high severity, `"urgent"` for critical |
| `expected_value` | `"high"` or `"critical"` |

## Hard guardrails (CI-enforced)

| Gate | What it forbids |
|---|---|
| `security-policy-proposal-path` | Direct DDL in tick function |
| `no-direct-security-auto-apply` | `execute_sql`, `CREATE POLICY`, `ALTER TABLE` |
| `policy-draft-never-auto-apply` (existing) | Policy architect must remain draft-only |

## Approval & dry-run

- **Approval:** Phase 3 review surface (`/admin/ai-runtime/suggestions`).
- **Dry-run:** existing `internal-agent-policy-architect` enforces dry-run + dual-admin per its own gate.
- Phase 4 does not introduce a parallel approval surface.
