

# Phase 7: Launch Honesty Enforcement, Claim Safety, Truth Score Uplift & Launch Readiness Command Center

## Current State Assessment

SITA already has substantial launch truth infrastructure:

- **Truth Index Aggregator** (`truth-index-aggregator.ts`): Computes 9 truth indices (runtime, launch honesty, AI, connector, demo governance, surface portability, device readiness, observability, security/privacy) from real DB data
- **Launch Gate Service** (`launch-gate-service.ts`): Feature-level gates with `launch_gates` and `launch_gate_checks` DB tables
- **Flagship Loop Service** (`flagship-loop-service.ts`): 5 loops with truth_pct, structural/runtime/proof/ux scores, launch_claim_status, next_actions
- **AIT08 Launch Truth Board**: Shows overall truth score, 6 index cards, contradictions, risk areas, claim classification (launch-safe / qualified / internal-only)
- **V07 Launch Blocker Board**: Derives blockers from failed verification runs
- **CJ04 Launch Blocker View**: Journey-based blocker ranking
- **LaunchBlockerPanel component**: Reusable blocker UI
- **LaunchHonestyBadge component**: 7 honesty classes with icons/colors
- **SERV06 Flagship Traceability**: Per-loop trace scores with launch_claim_status badges

### What's Missing for Phase 7

1. **No unified Launch Readiness Command Center** — blocker/truth/claim data is scattered across AIT08, V07, CJ04, SERV06
2. **No Capability Claim Safety Matrix** — no single surface answering "what can we say publicly?"
3. **No Go/No-Go Decision Board** — no explicit launch-mode recommendation engine
4. **No Launch Narrative Board** — no safe/qualified/unsafe claim guidance for GTM
5. **Truth scores are partially hardcoded** — AI truth score returns 100% because all checks default to `true`
6. **No composite launch readiness score** combining all dimensions
7. **Flagship loop scores are static seeds** — not dynamically computed from DB evidence

## Implementation Steps

### Step 1 — Create the Launch Classification & Scoring Engine

Create `src/lib/services/launch-readiness/launch-readiness-engine.ts`:

- Define `LaunchMode` type: `"internal_only" | "pilot_ready" | "private_beta_ready" | "public_launch_qualified" | "public_launch_ready" | "not_launch_safe"`
- Define `CapabilityClassification` with: capability key, structural/runtime/proof/ux scores, claim safety (`"safe" | "qualify" | "unsafe"`), launch honesty class, evidence references, blocker count
- Define 20+ capability families (auth, dashboard, files, AI, boardroom, connectors, notifications, etc.) with static + DB-derived scoring
- Compute composite launch readiness score from truth indices + flagship loop scores + blocker severity
- Compute recommended launch mode from blocker analysis + flagship readiness
- Generate claim safety matrix from capability classifications
- Generate launch narrative recommendations (safe claims, qualified claims, unsafe claims)

### Step 2 — Fix AI Truth Score Inflation

In `truth-index-aggregator.ts`, the `computeAITruthScore()` function defaults all checks to `true`, inflating the score to ~100%. Fix by:

- Check actual row counts (not `|| true` fallback)
- Check for real `ai_inference_receipts` with `status = 'success'`
- Check for real `ai_usage_ledger` entries
- Weight infrastructure existence (~40%) vs runtime proof (~60%)

### Step 3 — Create LAUNCH01 — Launch Readiness Executive Board

Route: `/admin/launch/readiness`

Shows:
- Composite readiness score (large, prominent)
- Recommended launch mode badge
- Hard blockers / soft blockers / claim risks counts
- Flagship loop readiness cards (5 loops, each with scores + classification)
- Truth index summary (9 indices from aggregator)
- Last computed timestamp
- "Refresh Analysis" button

### Step 4 — Create LAUNCH02 — Flagship Loop Readiness Board

Route: `/admin/launch/flagship-loops`

Shows per-loop:
- 4 dimension scores (structural, runtime, proof, UX) with progress bars
- Launch classification badge
- Blocker list with severity
- Claim safety state
- Next critical fix actions
- Evidence references

### Step 5 — Create LAUNCH03 — Capability Claim Safety Matrix

Route: `/admin/launch/claim-safety`

Table/grid showing 20+ capabilities:
- Capability name and domain
- Current classification (live_verified / partial / blocked / planned)
- Safe to claim? / Qualify carefully? / Not safe to claim?
- Evidence strength indicator
- Notes column
- Filterable by domain/safety level

### Step 6 — Create LAUNCH04 — Blocker Command Board

Route: `/admin/launch/blockers`

Shows all blockers ranked by severity and launch impact:
- Blocker ID, title, severity, domain
- Flagship loop impact
- Evidence/source
- Recommended fix
- Expected score uplift if resolved
- Owner assignment

Data sourced from: `FLAGSHIP_LOOP_SEEDS.launch_blockers`, verification run failures, journey blockers, and the new engine's analysis.

### Step 7 — Create LAUNCH06 — Launch Narrative & Claim Guide

Route: `/admin/launch/narrative`

Three sections:
- **Safe to Say**: Claims backed by runtime + proof evidence
- **Qualify Carefully**: Claims that need caveats (e.g., "web push only", "Google Drive only")
- **Do Not Claim**: Features that are planned/blocked/internal-only

Plus launch-mode-specific narrative templates:
- Pilot narrative constraints
- Private beta narrative constraints
- Public launch narrative constraints

### Step 8 — Create LAUNCH07 — Go/No-Go Decision Board

Route: `/admin/launch/go-no-go`

Shows:
- Current recommendation with rationale
- Required conditions for each launch mode (checklist)
- Blockers preventing upgrade to next mode
- Readiness by dimension (radar/grid)
- Last review timestamp
- Sign-off placeholder

### Step 9 — Wire Routes and Navigation

Add all 7 LAUNCH routes to `App.tsx`. Add `data-testid` attributes to all boards.

## Technical Details

### Scoring Formula
```
compositeScore = avg(
  truthIndices.overallScore,          // from truth-index-aggregator
  flagshipAvg,                         // avg of 5 loop truth_pct values
  100 - (hardBlockerCount * 15),       // penalty per hard blocker
  claimSafetyPct                       // % of capabilities that are claim-safe
)

launchMode = 
  compositeScore >= 85 && hardBlockers == 0 → "public_launch_ready"
  compositeScore >= 75 && hardBlockers == 0 → "public_launch_qualified"
  compositeScore >= 60 && hardBlockers <= 2 → "private_beta_ready"
  compositeScore >= 45 → "pilot_ready"
  compositeScore >= 25 → "internal_only"
  else → "not_launch_safe"
```

### Files Created
| File | Purpose |
|------|---------|
| `src/lib/services/launch-readiness/launch-readiness-engine.ts` | Classification model, scoring, claim safety, narrative generation |
| `src/pages/admin/launch/LAUNCH01ReadinessExecutive.tsx` | Executive command center |
| `src/pages/admin/launch/LAUNCH02FlagshipReadiness.tsx` | Per-loop readiness detail |
| `src/pages/admin/launch/LAUNCH03ClaimSafetyMatrix.tsx` | Capability claim safety grid |
| `src/pages/admin/launch/LAUNCH04BlockerCommand.tsx` | Ranked blocker board |
| `src/pages/admin/launch/LAUNCH06NarrativeGuide.tsx` | GTM-safe claim guidance |
| `src/pages/admin/launch/LAUNCH07GoNoGo.tsx` | Final decision board |

### Files Modified
| File | Change |
|------|---------|
| `src/lib/services/truth-indices/truth-index-aggregator.ts` | Fix AI truth score inflation |
| `src/App.tsx` | Add 6 LAUNCH routes |

### No Database Changes Required
All data derives from existing tables (`launch_gates`, `launch_gate_checks`, `journey_verification_runs`, `ai_usage_ledger`, `ai_inference_receipts`, `notification_delivery_receipts`, `device_push_tokens`, `connector_oauth_flows`, `connector_sync_jobs`) plus static registry data.

## Success Criteria
1. Composite launch readiness score computed from real evidence
2. AI truth score no longer inflated to 100%
3. 20+ capabilities classified with claim safety
4. 5 flagship loops have final readiness states
5. Blockers ranked by severity and launch impact
6. Launch mode recommendation generated automatically
7. Narrative guide distinguishes safe/qualified/unsafe claims
8. Go/No-Go board provides defensible decision framework
9. All boards have `data-testid` attributes

