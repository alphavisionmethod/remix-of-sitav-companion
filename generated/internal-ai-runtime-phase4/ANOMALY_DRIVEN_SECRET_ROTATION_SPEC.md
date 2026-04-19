# Anomaly-Driven Secret Rotation Spec

## Principle

AI **detects** the anomaly and **dry-runs** the rotation. Humans **execute** the rotation.

## Flow

```
security agent detects credential anomaly
  (e.g., burst of failed connector auth, suspicious provider behavior)
        │
        ▼
record_security_finding (severity ≥ medium)
        │
        ▼
calls security-anomaly-rotation-trigger  (POST)
        │
        │ rejects severity=low (noise floor)
        │ requires non-empty anomaly_evidence
        ▼
fetch  secret-rotation-orchestrator   { dryRun: true }
        │                                    ▲
        │ orchestrator computes rotation     │ EXISTING canonical orchestrator —
        │ plan WITHOUT executing             │ Phase 4 reuses, does not duplicate
        ▼
trigger_anomaly_secret_rotation RPC
        │
        │ persists trigger packet + dry-run result
        │ status: dryrun_succeeded | dryrun_failed
        ▼
/admin/ai-runtime/anomaly-rotations  (board)
        │
        │ admin reviews dry-run plan + evidence
        ▼
RB-SECRET-ROTATION  (operator runbook, dual-admin required)
        │
        ▼
secret-rotation-orchestrator   { dryRun: false }   ← MANUAL execution
```

## Why dry-run only in Phase 4

- Live rotation invalidates downstream connectors, agents, and integrations.
- Recovery requires coordinated reissue across services.
- Mistaken rotation = self-inflicted outage.
- Therefore: AI proposes, dry-run validates feasibility, humans pull the trigger.

## Trigger packet

| Field | Type | Purpose |
|---|---|---|
| `source_finding_id` | uuid? | Link to originating finding |
| `source_agent_id` | text | Proposer agent |
| `secret_scope` | text | Scope key (e.g., `connector:gmail:user:{id}`) |
| `provider_key` | text? | Provider registry key |
| `anomaly_type` | text | Classification (e.g., `auth_burst`, `provider_instability`) |
| `severity` | enum | medium/high/critical (low rejected) |
| `anomaly_evidence` | jsonb | Triggering evidence |
| `orchestrator_dryrun_result` | jsonb | Full orchestrator response |
| `status` | enum | proposed → dryrun_succeeded \| dryrun_failed → superseded |
| `receipt_id` | text? | Optional receipt hash |

## Hard guardrails (CI-enforced)

| Gate | What it forbids |
|---|---|
| `anomaly-driven-secret-rotation` | `dryRun: false` in trigger function |
| `anomaly-driven-secret-rotation` | Bypassing `secret-rotation-orchestrator` |
| `no-direct-security-auto-apply` | All other auto-apply patterns |

## Idempotency

`(source_finding_id, secret_scope)` is the dedup key. Replays of the same anomaly
do not produce duplicate triggers.

## Failure handling

- Orchestrator unreachable → trigger row created with `orchestrator_dryrun_result.error`, status `dryrun_failed`.
- Operator visibility preserved — admin sees the failure in the board.
- No partial state in production secrets (we never wrote anything).
