

## Re-Audit: Backend / API Reality Checklist (15 items)

I checked every item against disk truth. **Most of the heavy lifting is done — but the existing governance report is RED, the readiness is not enforced as a single gate, and 3 items have real gaps.**

### What's actually green ✅

| # | Item | Disk evidence |
|---|---|---|
| 1 | Backend action is real | 85 functions on disk = 85 in registry (0 orphans, 0 ghosts per `edge-function-membership-report.json`) ✅ |
| 2 | API inventory exists | `src/lib/backend-topology/edge-function-registry.ts` — 85 entries with 14-field strict topology ✅ |
| 4 | Request schema | `EDGE_FUNCTION_CONTRACT_MAP` — 85 entries (`inputSchema`/`outputSchema`/`errorSchema`) ✅ |
| 4 | Response schema | same ✅ |
| 4 | Auth model | `EDGE_FUNCTION_AUTH_MAP` — 85 entries (jwt/anon/service-role/webhook-secret/api-key) ✅ |
| 4 | Permission model | `adminOnly` flag in auth map + `has_admin_permission()` SQL function ✅ |
| 4 | Error model | Standardised `errorSchema: "StandardError"` across all 85 ✅ |
| 7 | Topology map exists | 8-file `src/lib/backend-topology/` package + dashboard at `/admin/backend-topology` ✅ |
| 8 | One function = one role | `BackendCategory` enum (6 classes), validator enforces exactly-one ✅ |
| 9 | No duplicate gateway/BFF — *partial* | `admin-bff-gateway` is canonical singleton; `admin-api` + `admin-gateway` correctly marked `WRAPPER_ONLY` ✅ |
| 14 | Audit/proof logging utility | `supabase/functions/_shared/audit-logger.ts` + `ai-receipt-logger.ts` exist ✅ |

### Real gaps ❌

**Gap A — Governance report is RED (`auth alignment: FAIL`)**, but no CI gate fails on this. `generated/edge-function-governance-report.json` says `overallStatus: "RED"`, `passed: 3, failed: 1`, yet umbrella reports 26/26 green. The report is generated but **not wired** to a blocker gate.

**Gap B — 11 ambiguous functions still flagged in `edge-function-classification-audit.json`** including `admin-api`, `admin-gateway`, `agent-intelligence`, `ambient-os-operations`, `api-gateway`, `brain-core`, `cloud-admin-api`, `main`. **No CI gate enforces ambiguityCount ≤ 0** for active (non-wrapper, non-deprecated) functions — item 6 ("no catch-all ambiguous endpoints") is therefore unproven.

**Gap C — Frontend-action → backend-API map does not exist.** Item 3 ("Every frontend action maps to an API or local runtime capability") has no readiness artifact. 32 files reference action maps, but none is a typed registry that proves coverage.

**Gap D — Rate-limit / idempotency / audit-logging usage not enforced.** The shared utilities exist (`_shared/rate-limit.ts`, `audit-logger.ts`, `zod-validate.ts`) but **only 44/85 functions import rate-limit, only 2/85 import audit-logger, 0 functions reference Idempotency-Key** (only `cloud-worker-api` mentions it). Items 12, 13, 14 are partially honest but unenforced.

**Gap E — Items 11 ("All critical APIs integration tested")** — only 6 `*test*.ts` files exist for 85 functions ⇒ 7% coverage. Critical APIs (ai-gateway, agent-executor, payment-process, gdpr-delete) need explicit integration-test claims with CI assertion.

**Gap F — No backend-API readiness registry / CI gate / admin dashboard** parallel to Mobile / Web / Desktop / Appliance. Umbrella has phases 12-15 but no `phase-16-backend-api-deployability`. The 15-item checklist is not a single enforceable artifact.

---

## Phase 16 — Backend / API Deployability Closure

### Plan (~9 files, ~600 LOC)

**16.1 — Frontend-action → API map** — `src/lib/backend-topology/frontend-action-api-map.ts`
- `FRONTEND_ACTION_API_MAP: Record<ActionId, { kind: "edge-function"|"local-capability"|"realtime-channel"; target: string; surface: "user"|"admin"; criticality: "P0"|"P1"|"P2" }>`
- Seed from existing route registry critical actions (~60 entries: signup, login, payment-process, invoice-generate, ai-invoke, push-subscribe, gdpr-export, kill-switch, etc.).

**16.2 — Rate-limit + idempotency + audit-log policy registry** — `src/lib/backend-topology/edge-function-policy-map.ts`
- For each function: `{ rateLimit: "strict"|"standard"|"none"; idempotency: "required"|"optional"|"n/a"; auditLog: "required"|"optional"|"none" }`
- Auto-derive baseline: `sideEffectClass: "high"` ⇒ `rateLimit: strict, idempotency: required, auditLog: required`.

**16.3 — Integration-test claims** — extend `EdgeFunctionEntry` with optional `integrationTested: boolean` (default false), set true only where `*test*.ts` actually exists. Backed by glob check.

**16.4 — Backend-API deployability readiness registry** — `src/lib/runtime/backend/release/backend-api-deployability-readiness.ts`
- 15-item typed registry (mirrors mobile/web/desktop/appliance pattern) with `id`, `claim`, `status: "ready"|"partial"|"missing"`, `evidence[]`.

**16.5 — CI gate `check-backend-api-deployability.ts`** asserts:
- 15-item registry has zero `missing`.
- `edge-function-membership-report.json.ok === true` (already does).
- `edge-function-governance-report.json.summary.overallStatus !== "RED"` (this currently fails — must fix or downgrade).
- `edge-function-classification-audit.json.ambiguousCount === 0` for **active, non-wrapper** functions (allows legacy `WRAPPER_ONLY` + `DEPRECATE_AND_REDIRECT` to remain).
- Every active function has: contract entry, auth entry, owner entry, bounded-context entry, registry entry.
- Every `sideEffectClass: "high"` function has policy-map entry with `rateLimit !== "none"` and `auditLog: "required"`.
- Every P0 frontend action in `FRONTEND_ACTION_API_MAP` has a real target.
- Every P0 critical API has `integrationTested: true` (or honest partial with remediation).
- Generates `generated/backend-api-deployability-report.json`.

**16.6 — Fix the RED governance report** — rerun governance generator and align auth-alignment expectations (the FAIL is a false positive from the 84↔85 count drift; report says 84 totalFunctions while disk has 85). Either regenerate or accept ⇒ pin to disk truth (85).

**16.7 — Register CI gate 27** under new phase `phase-16-backend-api-deployability` in `ci-gate-types.ts` + `ci-gate-registry.ts`.

**16.8 — Admin dashboard `BAP01BackendApiDeployabilityCenter.tsx`** at `/admin/backend-api/deployability`, rendering all 15 items green/amber/red with evidence, ambiguity heat-map, policy-map coverage bars. Mirrors `APP01ApplianceDeployabilityCenter.tsx`.

**16.9 — Update aggregators**
- `generated/ci-umbrella-manifest.json` → `gateCount: 27`, `+phase-16-backend-api-deployability`.
- `generated/production-truth-final.json` → `+phase-16`.

### Acceptance

- `frontend-action-api-map.ts` covers all P0 user/admin actions (≥40 entries).
- `edge-function-policy-map.ts` covers all 85 functions with rate-limit + idempotency + audit-log decisions.
- `edge-function-governance-report.json.summary.overallStatus === "GREEN"` (no longer RED).
- `edge-function-classification-audit.json.ambiguousCount` for `status === "active"` non-wrapper functions: **0** (the 11 ambiguous targets are either restored to a strict category, marked `wrapper`, or moved to roadmap).
- `backend-api-deployability-report.json` shows **15 items, 13 ready + 2 honest partials** (full integration-test coverage requires Deno test infra + real Supabase test keys).
- New `check-backend-api-deployability` gate passes.
- CI Umbrella reads **27/27 green**.
- `/admin/backend-api/deployability` renders all 15 items.

### Files

| File | Change |
|---|---|
| `src/lib/backend-topology/frontend-action-api-map.ts` | New (~200 LOC) |
| `src/lib/backend-topology/edge-function-policy-map.ts` | New (~150 LOC) |
| `src/lib/backend-topology/index.ts` | Add 2 barrel exports |
| `src/lib/runtime/backend/release/backend-api-deployability-readiness.ts` | New 15-item registry (~120 LOC) |
| `src/lib/runtime/backend/release/index.ts` | New barrel |
| `scripts/architecture/checks/check-backend-api-deployability.ts` | New CI gate 27 (~150 LOC) |
| `src/pages/admin/BAP01BackendApiDeployabilityCenter.tsx` | New admin surface (~200 LOC) |
| `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts` | +phase-16 entry |
| `src/routes/AdminRoutes.tsx` | Route wiring |
| `generated/edge-function-governance-report.json` | Regenerate truthfully (84→85, GREEN) |
| `generated/backend-api-deployability-report.json` | New artifact |
| `generated/ci-umbrella-manifest.json` | gateCount: 27 |
| `generated/production-truth-final.json` | +phase-16 |

After this phase, the Backend/API Reality Checklist is **truthfully 15/15 enforceable in CI**, with the only outstanding work being broader integration-test coverage (which requires running Deno tests against a real Supabase test project — already documented as the remaining honest partial).

