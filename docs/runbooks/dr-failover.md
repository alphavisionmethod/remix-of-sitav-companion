# Runbook: DR Failover

**Risk tier:** R5 (highest)  
**Autonomy ceiling:** L3 — failover is **always** staged for human approval.  
**Owner:** Platform / SRE

## When to invoke

- Primary region health probe (`dr-drill-cron`) fails 3 consecutive runs.
- Manual incident: primary region degraded, RPO/RTO at risk.
- Quarterly tabletop exercise.

## Pre-flight checklist

1. Confirm `DR_FAILOVER_TARGET_URL` secret resolves to a live secondary.
2. Last successful drill ≤ 7 days old (check `/admin/ai-runtime/dr` board).
3. Two on-call engineers acknowledge.
4. Customer-status page draft prepared.

## Procedure

1. Open `/admin/ai-runtime/dr` → **Stage failover**.
2. Provide ≥ 20-char justification.
3. Trigger automated drill in `simulation` mode first; verify probe latency < 500ms.
4. Promote to `live` mode — requires **dual approval** (KS-DR-FAILOVER trigger).
5. Edge function `dr-drill-runner` updates DNS / load-balancer (manual confirmation step).
6. Watch real-time graph for 15 min.
7. Post-mortem within 48h.

## Rollback

- Failover drills are reversible: re-stage in opposite direction.
- Live failovers require explicit "fail-back" with the same dual-approval gate.

## Evidence captured

- `dr_drills` row (probe result, latency, mode).
- `compliance_evidence` (collector `dr_drill_recency` ticks down).
- `admin_action_audit` row (justification + actor).
