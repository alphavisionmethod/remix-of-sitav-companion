# Hardware & Operator Closure — Final Verification

> Generated: 2026-04-19. Honest deployment posture.

## What this closure delivers

1. **2 NEW DB tables** (real, RLS-enforced, admin-only):
   - `hardware_certification_runs` — durable real-device evidence
   - `operator_drill_executions` — durable human-use drill evidence

2. **7 NEW validators** (all real, all wired):
   - check-real-hardware-proof (warn until first real-device run)
   - check-hardware-certification-matrix (warn until matrix populated)
   - check-attestation-evidence-freshness (30-day window when present)
   - check-operator-drill-execution (warn until first drill row)
   - check-runbook-human-use-proof
   - check-kill-switch-drill-readiness
   - check-supportability-freshness

3. **1 NEW Admin AI Engineer hub tab:** `HardwareAndOperatorTruthPanel`
   with live DB queries to both tables.

## Honest limits surfaced (no fake green)

- Hardware proof is **partner-blocked** until a real-device run is recorded.
- Operator drill execution is **pending-human-execution** until first drill.
- Validators stay WARN-tier with explicit promotion paths — no synthetic GREEN.

## How to record real evidence

- **Hardware:** `os/scripts/record-hardware-certification-run.sh <device-class>`
- **Operator drill:** invoke `runbook-drill` edge function (existing) which now
  writes into `operator_drill_executions` on completion.
