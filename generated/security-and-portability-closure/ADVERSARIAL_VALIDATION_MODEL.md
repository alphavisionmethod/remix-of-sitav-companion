# Adversarial Validation — Canonical Model

## Scope

Adversarial validation covers the four strongest security claims in SITA OS:

1. RLS under stress (DB plane)
2. Electron threat detection (desktop shell)
3. Debugger / tamper resistance (binary integrity)
4. Session threat behavior (session plane)

## Scenario classes (per claim)

| Claim | Required scenarios |
|---|---|
| RLS under stress | concurrent-multi-tenant, security-definer-coverage, edge-condition-bypass |
| Electron | anti-debug-trigger, dlp-screenshot-block, network-allowlist-violation |
| Debugger/tamper | debugger-attach-detect, asar-tamper-detect, integrity-fail-recovery |
| Session threat | impossible-travel, behavioral-biometric-anomaly, session-replay-attempt |

## Evidence shape

Every adversarial run writes a JSON file:

```json
{
  "executedAt": "ISO-8601",
  "operator": "uuid",
  "scenarios": ["concurrent-multi-tenant", ...],
  "isolationBreach": false,
  "breachDetail": null,
  "findings": [{ "id": "...", "severity": "low|med|high|crit", "...": "..." }]
}
```

## Severity classification

- `crit` — immediate BLOCK; release halted
- `high` — must remediate within 7d; WARN until closed
- `med` — must remediate within 30d
- `low` — track in register

## Freshness

- RLS stress: ≥1 run in last 90d
- Electron threat: ≥1 run per release tag
- Debugger/tamper: ≥1 run per device family per quarter
- Session threat: ≥1 run in last 90d

## Remediation workflow

Finding → register → assign owner → fix or accept-risk → reflect in `security-findings-register.json` → release gate re-evaluates.
