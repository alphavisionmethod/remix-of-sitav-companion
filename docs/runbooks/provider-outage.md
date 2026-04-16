# RB-002 — AI Provider Outage

| Field | Value |
|---|---|
| Severity | **high** |
| Bounded Context | `runtime-kernel` |
| Subsystem | ai-providers |
| Owner | ai |
| Estimated MTTR | 10 min |
| Kill switch | `KS-MODEL-PROVIDERS` |
| Message code | `AI-003` |

## Trigger

AI Gateway returns 3+ consecutive errors from the same provider.

## Steps

1. **Activate fallback model chain** — route traffic to secondary provider.
2. **Enable cached output serving** — recent identical queries served from cache.
3. **Reduce AI budget posture to conservative** — only critical AI calls processed.
4. **If total outage** — activate `KS-MODEL-PROVIDERS`.
5. **Monitor and restore** — test connectivity, then re-enable primary chain.

## Rollback

Restore primary provider, disable cache serving, restore normal budget posture, disarm kill switch.

## Evidence

- Provider error logs by family
- Fallback chain hit rate
- Kill-switch activation receipt (if used)

## Escalation

Unresolved in 10 minutes → `admin`.
