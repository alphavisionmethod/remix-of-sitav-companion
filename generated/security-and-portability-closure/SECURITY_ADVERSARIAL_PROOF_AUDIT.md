# Security Adversarial Proof — Audit

**Generated:** 2026-04-19

## Claim ↔ Proof matrix

| Claim | Structural proof | Adversarial proof | Status |
|---|---|---|---|
| RLS isolates tenants under hostile load | 323 RLS policies, `has_role` SECURITY DEFINER | `check-rls-under-stress` + `os/scripts/run-rls-stress-probe.sh` | ✅ validator wired; ⏳ first run pending |
| Electron blocks anti-debug + DLP | 7-layer Electron fabric (`runtime-shield.cjs`, `dlp-guard.cjs`, `network-sentinel.cjs`) | `check-electron-threat-detection-proof` + `electron/__threat_drills__/*.json` | ✅ validator; ⏳ partner-blocked until Electron build env runs drills |
| Debugger / tamper resistance fires | `runtime-shield.cjs` debugger detection + `integrity-check.cjs` ASAR hash | `check-debugger-tamper-proof` | ✅ validator; ⏳ pending real-device drill |
| Session threat detector flags anomalies | `src/lib/security/session-threat-detector.ts` + `os-security/sessiond` | `check-session-threat-behavior` + `session-threat-runs/*.json` | ✅ validator; ⏳ first run pending |

## Closure principle

Each strong claim now has:
1. A validator that does **real work** (registry scan + evidence file inspection)
2. A documented evidence file path
3. An honest classification when execution is externally blocked

No "red-team looked good" hand-waving. No green without evidence files.

## Findings register

See `SECURITY_FINDINGS_REGISTER.md` and `security-findings-register.json`. All adversarial-test findings flow into this register with status `open | closed | accepted-risk | blocked-externally | pending-remediation`.
