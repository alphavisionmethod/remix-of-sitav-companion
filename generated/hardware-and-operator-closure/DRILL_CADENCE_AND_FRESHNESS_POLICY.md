# Drill Cadence and Freshness Policy

## Per-category cadence

| Category | Cadence | Owner | Validator |
|---|---|---|---|
| Hardware certification | Every 30 days per device class | Release Eng | `check-attestation-evidence-freshness.ts` |
| Restore/PITR drill | Weekly | DB Eng | `check-restore-drill-readiness.ts` |
| Runbook drill (per RB) | Quarterly | Owning team | `check-runbook-human-use-proof.ts` |
| Kill-switch drill (per KS) | Monthly | Security | `check-kill-switch-drill-readiness.ts` |
| Operator golden path | Monthly | Support | `check-operator-drill-execution.ts` |
| Supportability review | Monthly | Support | `check-supportability-freshness.ts` |

## Freshness windows

| Evidence type | Fresh | Stale | Expired |
|---|---|---|---|
| Hardware run | < 30d | 30-60d | > 60d |
| Drill execution | < 90d | 90-180d | > 180d |
| Restore drill | < 7d | 7-14d | > 14d |

## Promotion to BLOCK

Each validator promotes from WARN → BLOCK once:
1. ≥1 fresh evidence row exists
2. Cadence has been met for ≥1 full cycle (clean observation window)
3. Policy explicitly enables BLOCK promotion (this file)

## Stale handling

Stale evidence triggers WARN; expired triggers BLOCK regression. Operators are notified via the Admin AI Engineer hub Hardware & Operator Truth panel.
