# Shared State & Trust Alignment

## Canonical primitives introduced
- `StatusBadge` — universal status chip (existed; reused).
- `ConnectorStateBadge` — composes `StatusBadge` with the 6-state connector grammar.
- `connector-state-grammar.ts` — `connected | degraded | reauth_required | failing | manual | demo_simulated`, each with `tone`, `label`, `description`, `nextAction` (none / retry / reauth / diagnose / ack).

## Drift eliminated
- Removed local `statusColors` color maps in `CN01ConnectorRealityOverview` and `CN05ConnectorHealthBoard`.
- All 4 admin connector surfaces (OAuth board, CN01, CN05, IntegrationsHome) now share one badge.

## Trust copy guardrails
- "Connected" never shown when token expired or provider unhealthy (worst-of-three view).
- "Demo (simulated)" tone is `info`, never `success`.
- Nightly proof badge shows real timestamp or "never run" — no green-by-default.
