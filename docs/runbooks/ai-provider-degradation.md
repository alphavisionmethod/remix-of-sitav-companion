# RB-010 — AI Provider Degradation

| Field | Value |
|---|---|
| Severity | **high** |
| Bounded Context | `runtime-kernel` |
| Subsystem | ai-degradation |
| Owner | ai |
| Estimated MTTR | 15 min |
| Kill switch | `KS-MODEL-PROVIDERS` |
| Message code | `AI-002` |

## Trigger

AI quality scores drop below threshold or AI budget is exhausted.

## Steps

1. **Assess scope** — single model vs all providers.
2. **Switch UI to degraded-mode indicators**.
3. **Reduce advisor autonomy to 0** (approval-only).
4. **Serve cached recommendations** where available.
5. **Monitor for restoration**, then gradually increase autonomy.

## Rollback

Restore autonomy levels and remove degraded badges once metrics are healthy for 30 minutes.

## Evidence

- AI quality score history
- Budget utilization
- Autonomy reduction receipts
