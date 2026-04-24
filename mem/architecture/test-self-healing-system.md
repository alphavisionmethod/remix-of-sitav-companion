---
name: Test Self-Healing System
description: 5-tier (T0–T5) failure triage and bounded auto-heal for the test suite
type: feature
---
# Test Self-Healing System

5-tier ladder; each tier more autonomous AND more strictly gated. Heals
the **environment**, not the assertions. Never auto-commits, never
auto-deletes tests, never relaxes thresholds.

## Tiers
| Tier | Action | Default |
|---|---|---|
| **T0** Triage | Re-run + classify failures into 12 classes; emit RCA | ON |
| **T1** Quarantine | Tag flakes, retry; separate flakes from stable failures | ON |
| **T2** Env heal | Clear `.vite`/cache, re-run global setup, refresh Playwright auth | ON |
| **T3** Patch propose | Write `.diff` to `coverage/triage/proposed-patches/`; optional `--pr` draft | ON (propose only) |
| **T4** Auto-apply | Whitelisted classes only; **2-person CODEOWNER attestation required**; `SITA_HEAL_T4=1` | OFF |
| **T5** LLM RCA | Lovable AI gateway narrative + suggested diff; advisory only | OFF (`--llm`) |

## Hard refusal (NEVER auto-touched)
- `src/__tests__/security/`, `__tests__/deployment/`, `__tests__/ci/`
- `edge-function-contracts.spec.ts`
- Anything matching `*rls*`, `*policy*`, `*kill-switch*`, `*compliance*`
- `tests/e2e/customer-journey/{advisor,boardroom,auth}/`

## Files
- `scripts/test-triage.mjs` — T0+T1 orchestrator
- `scripts/test-self-heal.mjs` — full T0–T4 loop
- `scripts/test-llm-rca.mjs` — T5 advisor (calls `ai-gateway`)
- `scripts/lib/failure-classifier.mjs` — pure 12-class rule engine (+ tests)
- `scripts/lib/heal-strategies/index.mjs` — pluggable strategies
- `scripts/lib/heal-receipt.mjs` — audit trail per heal
- `.github/workflows/test-self-heal.yml` — auto on `test-sequential` failure
- npm scripts: `test:triage`, `test:heal`, `test:heal:dry`, `test:heal:full`, `test:heal:pr`, `test:heal:t4`, `test:heal:llm`, `test:classifier`

## Rules
- Heal the environment, not the assertions.
- Every action emits `coverage/triage/heal-receipts/<id>.json`.
- T4 requires `SITA_HEAL_T4=1` AND 2-person CODEOWNER attestation.
- T5 outputs are advisory only — humans decide what (if anything) becomes a PR.
- Refusal-path failures bypass heal entirely and surface as `real-bug`.
