# Consolidated Execution Plan — Two Tracks, One Pass

You said "execute whatever is better and more advanced" and "build as specified" with all four enhancements. Here's exactly what I'll build, integrated, with no duplication of existing strong systems.

---

## TRACK A — `SITA_OS_SYSTEM_REPORT.md` (Implementation-Truth)

### A.1 Anchor file reading (parallel batches of 8–10)

I'll read these in 4 parallel batches to lock evidence before writing:

**Batch 1 — Frontend spine**
`src/App.tsx`, `src/main.tsx`, `src/pages/index.ts` (if present), `src/pages/DesktopPage.tsx`, `src/pages/Boardroom.tsx`, `src/pages/AdminCenter.tsx`, `src/pages/BusinessCenter.tsx`, `src/pages/MoneyCenter.tsx` (or equivalent)

**Batch 2 — Architecture & runtime**
`src/runtimes/runtime-index.ts`, `src/runtimes/feature-runtime-tier-registry.ts`, `src/runtimes/product-reality-tiers.ts`, `src/services/index.ts`, `src/features/index.ts`, `src/lib/orchestration/` (if present), `src/lib/policy/` index

**Batch 3 — AI / Advisor / Boardroom**
`src/lib/ai/index.ts`, `src/lib/ai/ai-capability-registry.ts`, `src/lib/ai/ai-fallback-policy.ts`, `src/lib/ai/ai-refusal-policy.ts`, `src/lib/advisors/index.ts`, `src/lib/advisors/advisor-identity-registry.ts`, `src/lib/advisors/advisor-debate-orchestrator.ts`, `src/lib/boardroom/index.ts`, `src/lib/boardroom/data-service.ts`

**Batch 4 — Contracts, packages, governance**
`src/packages/index.ts`, `src/packages/proof-model/`, `src/packages/release-contracts/`, `src/packages/shell-grammar/`, `src/packages/feature-governance/`, `supabase/functions/_shared/` index, `supabase/functions/_owners.json`

### A.2 Edge function bucketing (212 functions → 8 roles)

Deterministic categorization by name prefix + role tag from `_owners.json` if present:

| Bucket | Examples | Count (est.) |
|---|---|---|
| **BFF / Gateway** | `admin-bff-gateway`, `api-gateway`, `user-bff-gateway`, `tenant-self-service-bff`, `owner-copilot-bff`, `support-gateway` | ~10 |
| **AI Platform** | `ai-gateway`, `ai-health`, `chat-advisor`, `brain-core`, `personal-brain`, `check-ai-budget`, `prompt-versioning` | ~12 |
| **Advisor / Boardroom** | `advisor-*` (×5), `boardroom-*` (×4), `sita-council-prevote`, `sita-agent-planner` | ~14 |
| **Internal Agents / Workforce** | `internal-agent-*` (×16), `agent-*` (×4) | ~22 |
| **Connectors / Integrations** | `connector-*` (×11), `oauth-refresh-probe`, `crm-sync` | ~15 |
| **OS / App Platform / Cloud** | `app-*` (×9), `cloud-*` (×7), `os-*` (×5), `desktop-update-manifest` | ~25 |
| **Security / Trust / Recovery** | `kill-switch-*`, `security-*`, `recovery-*`, `runbook-drill`, `dr-drill-*`, `chaos-*`, `gdpr-*`, `account-delete`, `audit-*` | ~20 |
| **Domain (Business/Money/Concierge)** | `cashflow-*`, `tax-*`, `invoice-*`, `payment-*`, `revenue-caller`, `booking-*`, `tasks-workflow-api`, `communications-api`, `investment-portfolio-api` | ~15 |
| **Operations / Health / Telemetry** | `health-*` (×4), `apm-*`, `device-telemetry`, `error-ingest`, `trace-ingest`, `uptime-rollup`, `crash-report-ingest`, `cost-alert`, `sla-evaluator`, `escalation-engine`, `alert-*` | ~18 |
| **Release / Evidence / Compliance** | `release-*` (×4), `compliance-*` (×2), `evidence-graph-builder`, `verification-recorder`, `production-launch-attestor`, `attestation-packet-builder`, `mobile-deferral-attestor` | ~12 |
| **Webhooks / Workflows / Schedulers** | `webhook-*` (×4), `workflow-*` (×4), `event-processor`, `scheduler-dispatch`, `health-cron`, `*-cron` (×6) | ~22 |
| **Misc / Public / Marketing** | `waitlist-*`, `beta-apply`, `press-inquiry`, `investor-request`, `vapid-public-key`, `webauthn-challenge`, `get-weather` | ~10 |

Total ≈ 212 (allowing for cross-counting on a few). Each bucket gets a paragraph in the report explaining role, sample functions, and shared helpers (`_shared/`).

### A.3 Report sections (21, written end-to-end in one pass)

1. Executive Overview
2. What SITA OS Is (30s / 2m / deep)
3. Audience & Surfaces (Desktop OS, Mobile, Admin, Marketing)
4. Core Product Domains (Business, Finance, Concierge, Revenue Office, Investment, Mission Control, Atlas, App Store, Owner Mode, Settings, Files, Boardroom, Admin)
5. Frontend / Shell / App / Window Architecture
6. Backend / Services / Edge Functions / Runtime Architecture (with bucket table)
7. Database & RLS Truth Layer (420 tables, 934 policies, 257 migrations)
8. Security / Trust / Safety (7-layer fabric, epistemic firewall, kill switches, anti-piracy)
9. AI Platform (gateway, budget, refusal/fallback, receipts, providers)
10. Advisor System (34 identities, debate orchestrator, override model, persona boundaries)
11. Boardroom & Decision Systems
12. Business OS (onboarding archetypes, profile engine, signals)
13. Finance / Money / Revenue / Investment Systems
14. Concierge / Household / Life Systems
15. Admin / Atlas / Mission Control / Operational Truth
16. Release / Workflows / Proof / Supportability (CI gates, drills, attestation)
17. Key Packages / Contracts / Shared Foundations (~36 packages)
18. Maturity Matrix — Complete vs Partial vs Blocked (5-grade scheme)
19. How To Explain SITA OS To Someone New (3 layers)
20. Key Files & Where To Start Reading (annotated entry points)
21. Final Truth Summary (strongest / weakest / next-most-valuable closure)

### A.4 Maturity grading scheme (5 grades)

- ✅ **Behaviorally proven** — has tests + persistence + runtime exercise
- 🟢 **Wired** — UI ↔ service ↔ DB connected, used in flows
- 🟡 **Partially wired** — works with documented gaps
- 🟠 **Structural** — types/contracts/scaffolding only
- 🔴 **Blocked / external** — depends on hardware/OS/external execution

### A.5 Companion artifact

`generated/sita-os-system-report.json` — machine-readable matrix:
```json
{
  "generatedAt": "...",
  "totals": { "edgeFunctions": 212, "migrations": 257, "packages": 36, "pages": ~120 },
  "buckets": { "ai-platform": { "count": 12, "functions": [...], "maturity": "🟢" }, ... },
  "domains": [ { "id": "business-os", "maturity": "🟢", "evidence": [...], "gaps": [...] }, ... ],
  "subsystems": [ { "id": "advisor-debate", "maturity": "🟡", "anchorFiles": [...], "notes": "..." }, ... ]
}
```

---

## TRACK B — Failure Triage + Self-Healing Test Platform (T0–T5)

Building all 5 tiers, with the four refinements you named:

### B.1 Refinement decisions (from your 4 questions)

1. **T4 tightened** → 2-person approval required. Auto-apply only if (a) failure class is in whitelist AND (b) commit message contains a signed `Heal-Approved-By:` trailer from a CODEOWNER **plus** a second CODEOWNER's GitHub review approval recorded via `gh api`. In CI, T4 is OFF by default and behind `SITA_HEAL_T4=1` env flag.
2. **T3 loosened** → patches written to disk **and** optionally pushed as a draft PR via `gh pr create --draft` when `--open-pr` flag is passed. PR body includes RCA, classifier confidence, and explicit "DO NOT MERGE WITHOUT REVIEW" header.
3. **T5 added** → LLM-backed RCA narrative + patch suggester via Lovable AI Gateway (`google/gemini-2.5-pro` for narrative, `openai/gpt-5` for patch diff). Outputs go to `coverage/triage/llm-suggestions/<file>.md` and `.diff`. **Never auto-applied. Never commits. Never opens a PR by itself.** Human pulls them into a T3 PR if useful.
4. **CI workflow shipped** — non-negotiable for value. New `.github/workflows/test-self-heal.yml` runs T0–T2 on every `test-sequential.yml` failure and posts the markdown report as a job summary + PR comment. T3/T4/T5 remain manual `workflow_dispatch`.

### B.2 The 5 tiers

| Tier | Action | Autonomy | Default |
|---|---|---|---|
| **T0** Triage | Re-run failed specs in fresh env, classify, emit RCA per file | Full auto | ON |
| **T1** Quarantine | Retry N×; separate flakes from stable failures; tag in report | Full auto | ON |
| **T2** Env heal | Clear `.vite`, `node_modules/.cache`, fresh `/tmp/sita-test-*`, re-run global setup, refresh Playwright auth state | Full auto | ON |
| **T3** Patch propose | Write `.diff` to `coverage/triage/proposed-patches/` + optional `--open-pr` draft PR | Auto-propose, **human apply** | ON (propose only) |
| **T4** Auto-apply | Apply whitelisted patch classes (snapshot updates, codemod renames) only with 2-person CODEOWNER attestation | Strict gated | **OFF** by default |
| **T5** LLM RCA | Lovable AI generates narrative RCA + suggested diff for `real-bug` class | Advisory only | OFF (opt-in via `--llm`) |

### B.3 Files to create

```
scripts/
├── test-triage.mjs                       # T0+T1 orchestrator
├── test-self-heal.mjs                    # Full T0→T4 loop coordinator
├── test-llm-rca.mjs                      # T5 LLM advisor (calls ai-gateway edge fn)
├── lib/
│   ├── failure-classifier.mjs            # Pure rule engine (12 classes)
│   ├── failure-classifier.test.mjs       # Unit tests with fixture stdouts
│   ├── heal-strategies/
│   │   ├── clear-vite-cache.mjs
│   │   ├── rerun-fresh-env.mjs
│   │   ├── update-snapshots.mjs          # Gated: --allow-snapshot-updates
│   │   ├── rerun-global-setup.mjs
│   │   ├── refresh-playwright-auth.mjs
│   │   └── index.mjs                     # Strategy registry
│   ├── heal-attestation.mjs              # 2-person approval verifier (T4)
│   ├── heal-receipt.mjs                  # Emits coverage/triage/heal-receipts/<id>.json
│   ├── github-pr-helper.mjs              # gh CLI wrapper for --open-pr
│   └── refusal-classes.mjs               # Hard-refusal list (security, RLS, contracts, deploy gates)
└── triage/
    └── fixtures/                         # Synthetic stdout corpus for classifier tests
        ├── flake-timing.txt
        ├── stale-snapshot.txt
        ├── stale-vite-cache.txt
        ├── expired-auth.txt
        ├── missing-mock.txt
        ├── import-rename.txt
        └── real-bug.txt

.github/workflows/
└── test-self-heal.yml                    # T0–T2 auto on failure; T3–T5 manual dispatch

mem://architecture/test-self-healing-system.md   # New memory rule

package.json scripts:
├── test:triage           → analyze last sequential run
├── test:heal             → T0–T2 only (safe default)
├── test:heal:dry         → propose only, no writes
├── test:heal:full        → T0–T3 with patch proposals to disk
├── test:heal:pr          → T0–T3 + open draft PR
├── test:heal:t4          → T0–T4 (requires SITA_HEAL_T4=1 + attestation)
└── test:heal:llm         → T0–T2 + T5 LLM RCA narratives
```

### B.4 Failure classifier rule table (12 classes)

| Class | Detection signal | Heal tier |
|---|---|---|
| `flake-timing` | passes on rerun | T1 quarantine |
| `flake-network` | `ECONNREFUSED`, `fetch failed`, `MSW handler missing` | T1 + log |
| `stale-snapshot` | `toMatchSnapshot` mismatch | T2 (gated) |
| `stale-vite-cache` | `Failed to resolve import` for known-good path | T2 auto |
| `dirty-jsdom` | `localStorage`/`window` leak between tests | T3 propose `vi.unstubAllGlobals()` |
| `expired-auth` | Playwright storage state 401/redirect to /login | T2 re-run global setup |
| `missing-mock` | `is not a function` on supabase/fetch client | T3 propose mock patch |
| `import-rename` | TS error matches known codemod table | T4 (gated) codemod |
| `port-collision` | `EADDRINUSE` | T2 auto (random port + retry) |
| `oom-worker` | `Worker terminated`, `JavaScript heap out of memory` | T2 (lower concurrency, rerun) |
| `db-rls-denied` | RLS policy denial | **REFUSAL** — never heal |
| `real-bug` | none of the above | T0 surface + optional T5 LLM RCA |

### B.5 Hard-refusal list (NEVER auto-touched)

- Anything under `src/__tests__/security/`
- `src/__tests__/deployment/`
- `src/__tests__/ci/`
- `tests/e2e/edge-function-contracts.spec.ts`
- Any test matching `*rls*`, `*policy*`, `*kill-switch*`, `*compliance*`
- Any test in `tests/e2e/customer-journey/` core paths (advisor, boardroom, auth)

These bypass heal entirely and surface as `real-bug` for human review.

### B.6 Receipt emission

Every heal action emits `coverage/triage/heal-receipts/<uuid>.json`:
```json
{
  "id": "heal_...",
  "file": "src/...",
  "failureClass": "stale-vite-cache",
  "tier": "T2",
  "action": "clear-vite-cache",
  "before": { "exitCode": 1, "snippet": "..." },
  "after": { "exitCode": 0, "duration": 4321 },
  "attestation": "auto",
  "approvers": [],
  "timestamp": "..."
}
```

T4 receipts additionally require `approvers: ["@user1", "@user2"]` and a verified GitHub review reference.

### B.7 LLM-backed T5 (Lovable AI)

- Calls `supabase/functions/ai-gateway` with the failed file's source + test source + stdout/stderr
- Uses `google/gemini-2.5-pro` for RCA narrative (better long-context reasoning over multiple files)
- Uses `openai/gpt-5` for diff suggestion (stronger structured-output discipline)
- Outputs:
  - `coverage/triage/llm-suggestions/<file>.rca.md` — human RCA narrative
  - `coverage/triage/llm-suggestions/<file>.suggested.diff` — never applied
- Token budget capped per file (8k input, 2k output) and per run (50k total)
- Falls back gracefully if `LOVABLE_API_KEY` missing — emits placeholder, doesn't fail the run

### B.8 What I am NOT doing (explicit non-goals)

- ❌ No auto-commit, ever
- ❌ No silent test deletion or `.skip()` injection
- ❌ No coverage threshold relaxation
- ❌ No changes to existing `test-sequential.mjs`, `pre-deploy.sh`, or any current test
- ❌ No LLM diff auto-application — T5 is advisory only
- ❌ No T4 enabled by default in CI

---

## Execution order (single pass)

1. Read 4 parallel anchor batches (Track A.1)
2. Generate `SITA_OS_SYSTEM_REPORT.md` (21 sections)
3. Generate `generated/sita-os-system-report.json`
4. Build classifier + strategies + receipt system (Track B core)
5. Build orchestrator scripts (`test-triage.mjs`, `test-self-heal.mjs`, `test-llm-rca.mjs`)
6. Build classifier unit tests with fixtures
7. Add `package.json` scripts (7 new)
8. Add `.github/workflows/test-self-heal.yml`
9. Write `mem://architecture/test-self-healing-system.md`
10. Run classifier unit tests to prove the rule engine works
11. Dry-run `test:heal:dry` against the existing `coverage/sequential-report.json` (if present) or a synthetic fixture to prove end-to-end wiring
12. Return Parts 1–4 summary

---

## Estimated scope

- Track A: 2 files (~2,500 LOC report + ~400 LOC JSON)
- Track B: ~14 new files (~1,200 LOC), 1 workflow, 7 package scripts, 1 memory rule
- Zero changes to existing source, tests, or pre-deploy
- All gates default-safe; T4 + T5 opt-in only

Approve and I'll execute end-to-end in one pass.