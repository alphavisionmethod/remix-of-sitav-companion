# CI Behavioral Truth — Audit

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.

## Methodology

Every required release-readiness gate is classified into one of 5 quality classes:

- **structural** — checks file presence / syntactic shape only
- **smoke** — runs a minimal happy-path check
- **behavioral** — exercises real runtime path with assertions
- **e2e** — full end-to-end multi-system verification
- **warn-only** — informational, never blocks release

## Aggregate counts (post-closure)

| Class | Count | % of 171 |
|---|---|---|
| structural | 56 | 33% |
| smoke | 27 | 16% |
| behavioral | 71 | 41% |
| e2e | 12 | 7% |
| warn-only | 5 | 3% |

## Behavioral coverage by deployment-critical area

| Area | Behavioral validator | Status |
|---|---|---|
| AI live-provider invocation | `check-ai-live-provider-nightly` | ✅ behavioral (nightly cron, real provider) |
| AI receipt persistence | `check-ai-receipt-persistence` | ✅ behavioral (DB write proof) |
| AI ledger write | `check-ai-ledger-write-verification` | ✅ behavioral |
| AI fallback chain | `check-ai-fallback-verification` | ✅ behavioral |
| AI budget under load | `check-ai-budget-enforcement-under-load` | ✅ behavioral |
| OAuth refresh — Google | `check-google-refresh-nightly` (via connector-refresh-streak) | ✅ behavioral |
| OAuth refresh — Microsoft | `check-microsoft-refresh-nightly` (via connector-refresh-streak) | ✅ behavioral |
| OAuth refresh — Slack | `check-slack-refresh-nightly` (via connector-refresh-streak) | ✅ behavioral |
| Boardroom L7 full loop | `check-boardroom-layer7-e2e` | ✅ e2e |
| Restore drill | `check-drill-cadence-freshness` (DB-backed dr-drill-runner) | ✅ behavioral |
| Hardware proof | `check-real-hardware-proof` (NEW, this closure) | ⚠ partner-blocked (WARN until first real-device run) |
| Operator drill execution | `check-operator-drill-execution` (NEW, this closure) | ⚠ pending-human-execution (WARN until first drill row) |

## Result

Every deployment-critical runtime-truth area has a **behavioral** or **e2e**
validator. The only WARN-tier areas are those legitimately blocked by external
real-world execution (real-device runs and human drill execution), and those
have explicit promotion paths.
