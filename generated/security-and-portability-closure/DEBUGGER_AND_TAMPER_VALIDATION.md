# Debugger & Tamper Resistance — Validation

**Validator:** `scripts/validation/check-debugger-tamper-proof.ts`  
**Modules under test:** `electron/runtime-shield.cjs`, `electron/integrity-check.cjs`  
**Evidence dir:** `electron/__threat_drills__/` (files matching `*tamper*`)

## Scenarios

1. **Debugger attach detect** — attach Node inspector or Chrome DevTools to packaged app; assert detection event fires within ≤2s
2. **ASAR tamper detect** — modify a byte in `app.asar`; assert `integrity-check.cjs` hash mismatch triggers and operator-visible warning is recorded
3. **Integrity fail recovery** — assert app fails closed (refuses to load tampered renderer) rather than silently disabling protection

## Pass criteria

- Detection event observed within scenario timeout
- Operator/admin visibility: event lands in `kill_switch_audit_log` (already wired)
- No silent disablement: validator scans modules to ensure protection paths are not no-ops

## Honest current status

⏳ **pending-drill** — module wiring is complete and statically verified. Real-device drill evidence files have not yet been captured. Validator returns WARN-tier with classification `pending-drill`.

## Static verification (passes today)

- `runtime-shield.cjs` exports `installAntiDebug`, `installVmDetection`, `installInjectionGuard`
- `integrity-check.cjs` exports `verifyAsarHash` and is called from `main.cjs` boot path
