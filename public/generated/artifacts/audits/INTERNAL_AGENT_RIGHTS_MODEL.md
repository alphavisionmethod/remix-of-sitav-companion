# SITA OS — Internal Agent Rights Model

## Autonomy Levels

Every internal agent operates at a defined autonomy level:

| Level | Name | Can Do | Cannot Do |
|-------|------|--------|-----------|
| L0 | Observe | Read system metrics, logs | Modify anything |
| L1 | Diagnose | Classify issues, correlate events | Take action |
| L2 | Recommend | Suggest fixes to humans/supervisors | Execute fixes |
| L3 | Draft | Prepare action plans, write proposals | Execute without review |
| L4 | Simulate | Run what-if scenarios safely | Affect production state |
| L5 | Approval Ready | Queue actions for human approval | Auto-execute |
| L6 | Constrained Action | Execute within defined boundaries | Exceed boundary |

## Upgrade Path

Agents earn higher autonomy through:
1. Track record of accurate recommendations
2. Low false-positive rate
3. Successful simulation outcomes
4. Human trust signal (explicit upgrade)

## Downgrade Triggers

Agents lose autonomy when:
1. False positive rate exceeds threshold
2. Cost budget exceeded
3. Policy violation detected
4. Human override (explicit downgrade)
5. Incident attributed to agent action

## Confidence Rules

Each agent defines:
- `minConfidenceToAct` — below this, refuse action
- `minConfidenceToRecommend` — below this, only observe

## Escalation Chain

```
Agent → Council Supervisor → Meta Supervisor → Human Owner
```

Each escalation generates a proof receipt.

## Memory Boundaries

Each agent has a defined `memoryScope`:
- What data it can read
- What context it retains
- What it must forget after action

## Rollback Authority

Per-agent rollback definitions:
- `automatic` — agent can self-rollback
- `supervisor` — requires supervisor approval
- `human` — requires human approval
- `none` — no rollback possible
