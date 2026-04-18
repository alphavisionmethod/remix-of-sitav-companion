# Supportability & Operator Readiness

_Generated: 2026-04-18T13:11:51.571Z_

## Runbook system (7 files)
- `src/lib/support/index.ts`
- `src/lib/support/runbook-drill-status.ts`
- `src/lib/support/runbook-loader.ts`
- `src/lib/support/runbook-registry.ts`
- `src/lib/support/runbook-resolver.ts`
- `src/lib/support/runbook-subsystem-map.ts`
- `src/lib/support/runbook-types.ts`

## Supporting components
- Incident classifier: ✅
- Kill-switch registry: ✅
- Diagnostic bundle script: ✅

## Capabilities
- Alert ↔ runbook linkage via incident-classifier
- Operator golden paths via runbook-resolver
- Diagnostic bundle via ops-build-diagnostic-bundle.ts
- Kill-switch arming with dual-approval and 20-char justification
- TTL auto-expiration via pg_cron

## Classification
**OPERATIONALLY MATURE**

