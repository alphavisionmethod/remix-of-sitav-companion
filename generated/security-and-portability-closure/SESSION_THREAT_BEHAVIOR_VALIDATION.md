# Session Threat Behavior — Validation

**Validator:** `scripts/validation/check-session-threat-behavior.ts`  
**Modules under test:** `src/lib/security/session-threat-detector.ts`, `os-security/sessiond`  
**Evidence dir:** `generated/security-and-portability-closure/session-threat-runs/`

## Scenarios

1. **Impossible travel** — two sessions for the same user from geographically incompatible IPs within Δt; assert anomaly event + admin visibility
2. **Behavioral biometric anomaly** — synthetic keystroke/mouse pattern that diverges from baseline; assert detector flags low-confidence
3. **Session replay attempt** — replay captured session token; assert detector + RLS combined deny

## Pass criteria

- Each scenario produces an evidence row with `expected==observed`
- False-positive rate <5% on synthetic baseline traffic
- Admin visibility: anomaly events visible on AI Engineer hub via existing `kill_switch_audit_log` linkage

## Honest current status

⏳ **pending-execution** — detector + sessiond are wired and statically verified. First run will produce inaugural evidence file. Validator currently returns WARN-tier.

## Wired surfaces (verified static)

- `session-threat-detector.ts` exposes `evaluate()` and `recordOutcome()`
- `os-security/sessiond` consumes evaluations and pushes to `kill_switch_audit_log`
- Admin visibility surface already exists on `/admin/health/error-patrol`
