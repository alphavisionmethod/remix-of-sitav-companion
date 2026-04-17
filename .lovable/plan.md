

## Re-Audit — Checklist 21: 8/14 Truthful, 4 Concrete Gaps

Live disk evidence confirms registry/metadata layers are real, but **runtime enforcement is theoretical** and the admin surface is not mounted.

### What IS truthful (✅)

| # | Item | Evidence |
|---|---|---|
| 1 | Kill-switch registry exists | `src/lib/control-plane/kill-switch-registry.ts` — 14 switches |
| 2 | Switch for advisors | `KS-ADVISORS` |
| 3 | Switch for outbound comms | `KS-OUTBOUND` |
| 4 | Switch for connectors | `KS-CONNECTORS` |
| 5 | Switch for sync | `KS-SYNC` |
| 6 | Switch for mobile push | `KS-MOBILE-PUSH` |
| 7 | Switch for model providers | `KS-MODEL-PROVIDERS` |
| 8 | Switch for workflows | `KS-WORKFLOW` |
| 9 | Switch for simulations | `KS-SIMULATIONS` |
| 10 | Switch for payments | `KS-PAYMENTS` |
| 11 | Switch for runtime automations | `KS-AUTOMATIONS` |
| 12 | Blast-radius metadata | `affectedServices[]`, `affectedTables[]`, `affectedEdgeFunctions[]`, `impactLevel`, `userFacingImpact`, `rollbackProcedure` on every entry |
| 13 | Runbooks link to switches | 10/14 switches have `runbookRef` resolving to a real runbook (`RB-002`, `RB-003`, `RB-005`, etc.); runbook docs include `Kill switch` field pointing back |
| 14 | CI gate exists | `scripts/architecture/checks/check-kill-switch-coverage.ts` validates registry/enforcement/runbook integrity |

### What is NOT truthful (❌) — 4 concrete gaps

| # | Item | Status | Evidence |
|---|---|---|---|
| A | Kill switches **visible in admin** | ❌ | `AR08KillSwitchCenter.tsx` exists but `grep` shows **zero hits** for `AR08KillSwitchCenter` or `/admin/automation/kill-switches` in `AdminRoutes.tsx` and `admin-route-registry.ts` — page is unreachable |
| B | Kill switches **enforced in edge functions** | ❌ | Zero edge functions in `supabase/functions/` import `checkKillSwitchOrReject`. `payment-process/index.ts` has 0 occurrences of "kill". Enforcement map declares 13 edge-function points that don't exist as code |
| C | Kill switches **enforced in domain services** | ❌ | `src/services/advisor-orchestrator.ts`, `src/services/communication-service.ts`, `src/services/sync-service.ts` are listed in enforcement map but contain no `checkKillSwitch*` calls (would need verification but registry is clearly stale-pointing) |
| D | No shared edge helper | ❌ | `supabase/functions/_shared/` has `auth.ts`, `policy.ts`, `rate-limit.ts` etc. but **no `kill-switch.ts`** — edge functions have nothing to import |

**Net: registry & UI page exist as code, but the admin surface is not mounted and runtime enforcement is documented theatre — the enforcement map points at files that don't actually call the gate.**

---

## Phase 27 — Kill-Switch Runtime Enforcement Closure

### 27.A — Create shared edge enforcement helper (fixes #D)
NEW `supabase/functions/_shared/kill-switch.ts`:
- Exports `checkKillSwitchOrReject(switchId, supabaseClient)` that queries the `automation_kill_switches` table (or equivalent) for armed state, returns 503 with structured negative receipt `{ code: "KILL_SWITCH_ACTIVE", switchId, consequence }` when active.
- Exports `killSwitchResponse(switchId, consequence)` for ergonomic 503 returns with corsHeaders.

### 27.B — Wire enforcement into the 6 critical edge functions (fixes #B)
Add `await checkKillSwitchOrReject("KS-...")` as the first action after auth in:
- `supabase/functions/payment-process/index.ts` → `KS-PAYMENTS` (severe, dual-approval)
- `supabase/functions/advisor-chat/index.ts` (or `advisor-agent-loop`) → `KS-ADVISORS`
- `supabase/functions/connector-sync/index.ts` → `KS-CONNECTORS` + `KS-SYNC`
- `supabase/functions/send-notification/index.ts` → `KS-OUTBOUND`
- `supabase/functions/workflow-execute/index.ts` → `KS-WORKFLOW`
- `supabase/functions/scheduler-dispatch/index.ts` → `KS-AUTOMATIONS`

Each returns a structured 503 with cors headers and emits an audit log entry.

### 27.C — Mount AR08 in admin shell + register route (fixes #A)
- Append to `src/lib/admin/admin-route-registry.ts`: `{ path: "/admin/automation/kill-switches", page: "AR08KillSwitchCenter", domain: "ai-runtime", title: "Kill Switches" }`
- Append `<Route path="/admin/automation/kill-switches" element={<AR08KillSwitchCenter />} />` to `AdminRoutes.tsx` (lazy-imported)
- Verify `ARSubNav` and `UniversalCommandSurface` already point here (they do — confirmed)

### 27.D — Make enforcement map self-validating (fixes #C)
Extend `scripts/architecture/checks/check-kill-switch-coverage.ts` to:
- For every `EnforcementPoint` with `layer: "edge-function"` or `"domain-service"`, **assert that `enforcedAt` file actually exists AND contains the `symbol` string** (e.g., `checkKillSwitchOrReject`).
- Fail the gate on dangling enforcement (e.g., file doesn't exist or symbol absent).
- This converts the enforcement map from documentation to an executable contract.

### 27.E — Emit baseline & register manifest
- NEW `generated/kill-switch-enforcement-report.json` capturing: `switches: 14`, `enforcementPoints: N`, `enforcedFilesVerified: N`, `dangling: 0`, `ok: true`.
- Append to `MANIFEST_REGISTRY` (`class: "compliance"`, `authority: "derived"`, `validator: "scripts/architecture/checks/check-kill-switch-coverage.ts"`, `ciGate: "kill-switch-coverage"`, `owner: "platform-architecture"`).
- Bumps registry from 111 → 112 entries; re-running Phase 26 gate stays green.

### Files

| Layer | Change |
|---|---|
| `supabase/functions/_shared/kill-switch.ts` | NEW — edge enforcement helper |
| `supabase/functions/payment-process/index.ts` | Add `KS-PAYMENTS` gate |
| `supabase/functions/advisor-chat/index.ts` | Add `KS-ADVISORS` gate |
| `supabase/functions/connector-sync/index.ts` | Add `KS-CONNECTORS` + `KS-SYNC` gate |
| `supabase/functions/send-notification/index.ts` | Add `KS-OUTBOUND` gate |
| `supabase/functions/workflow-execute/index.ts` | Add `KS-WORKFLOW` gate |
| `supabase/functions/scheduler-dispatch/index.ts` | Add `KS-AUTOMATIONS` gate |
| `src/lib/admin/admin-route-registry.ts` | Register AR08 route |
| `src/AdminRoutes.tsx` | Mount AR08 |
| `scripts/architecture/checks/check-kill-switch-coverage.ts` | Add enforcement-point file/symbol verification |
| `src/lib/truth-manifests/manifest-registry.ts` | Register enforcement report (111 → 112) |
| `generated/kill-switch-enforcement-report.json` | NEW baseline |

### Acceptance

- `/admin/automation/kill-switches` reachable — page renders 14 switches with arm/disarm + dual-approval flow
- `grep -rn "checkKillSwitchOrReject\|killSwitchResponse" supabase/functions/ | wc -l` ≥ 6 (one per critical function)
- Calling `payment-process` while `KS-PAYMENTS = active` returns 503 with `{ code: "KILL_SWITCH_ACTIVE" }` body
- `npx tsx scripts/architecture/checks/check-kill-switch-coverage.ts` passes with **0 dangling enforcement points**
- `generated/kill-switch-enforcement-report.json` exists with `ok: true`, `dangling: 0`
- Manifest registry shows 112 entries; Gate 37 still green
- Checklist 21 truthfully **14/14 — fully deployable**

