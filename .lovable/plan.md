

## Re-Audit: Edge Function Checklist (10 items) — 2 Real Gaps

### Disk truth scorecard

| # | Item | Status | Evidence |
|---|---|---|---|
| 1.a-1.f | 6-class strict classification | ✅ ready | `edge-function-categories.ts` 85/85; counts: 1 ADMIN_BFF, 4 PUBLIC_BFF, 38 DOMAIN, 18 ORCHESTRATION, 12 CONNECTOR_WEBHOOK, 7 RUNTIME_SYSTEM, +4 migration verdicts |
| 2.a | owner | ✅ ready | `edge-function-owner-map.ts` 85/85 |
| 2.b | bounded context | ✅ ready | `edge-function-bounded-contexts.ts` 85/85 |
| 2.c | auth model | ✅ ready | `edge-function-auth-map.ts` 85/85 |
| 2.d | contract | ✅ ready | `edge-function-contract-map.ts` 85/85 (input + output + error schemas) |
| 2.e | side-effect class | ✅ ready | `edge-function-runtime-consequence-map.ts` 85/85 |
| 3 | no conflicting roles | ✅ ready | classification audit `activeAmbiguousCount: 0` |
| 4 | legacy ambiguous split/wrapped | ✅ ready | `admin-api`, `admin-gateway` → WRAPPER_ONLY; `main` → DEPRECATE_AND_REDIRECT; `ambient-os-operations` → SPLIT_REQUIRED |
| **5** | **function health/metrics in admin** | ⚠️ **partial** | Only AI 5-function panel + topology classifications surface — no per-function invocation/error/p95/health table for all 85 |
| **6** | **failure/replay paths for orchestration & connector** | ⚠️ **partial** | `cloud-worker-api` dead-letter + `WorkflowReplayEngine` + `api-gateway` command replay exist, but no per-function `failureReplayPath` registry; no CI gate proving every ORCHESTRATION/CONNECTOR_WEBHOOK function declares its path |

### Real gaps

**Gap A — Item 5: Function health/metrics not visible per-function for all 85.**
Current admin surfaces: `BackendTopologyDashboard` (classifications, owner counts, DB health — no invocation metrics), `AIRuntimeStatus` (5 hard-coded AI functions only), `ai-health` edge function (boots/probes 5 AI functions only). **No registry-driven health board covering all 85.** No `edge_function_invocations` table, no aggregator, no admin dashboard.

**Gap B — Item 6: Failure/replay paths not declared per function.**
Implementations exist (`cloud-worker-api` dead-letter, `WorkflowReplayEngine`, command replay in `api-gateway`) but they are **not mapped to functions**. There is no `EDGE_FUNCTION_REPLAY_MAP` declaring, for every ORCHESTRATION_FUNCTION + CONNECTOR_WEBHOOK_FUNCTION, *which* replay path applies (job-replay / command-replay / workflow-replay / webhook-redeliver / not-required-with-rationale). No CI gate enforces presence.

---

## Phase 17 — Edge Function Health & Replay Closure

### Plan (~7 files, ~550 LOC)

**17.1 — Replay path registry** — `src/lib/backend-topology/edge-function-replay-map.ts` (~180 LOC)
- `ReplayPathKind = "job-dead-letter" | "command-replay" | "workflow-replay" | "webhook-redelivery" | "idempotent-retry" | "not-applicable"`
- `EDGE_FUNCTION_REPLAY_MAP: Record<FunctionName, { kind: ReplayPathKind; mechanism: string; evidence: string; rationale?: string }>`
- Mandatory entry for every ORCHESTRATION_FUNCTION (18) + CONNECTOR_WEBHOOK_FUNCTION (12) = 30 required entries; optional for others.
- Auto-derived defaults: webhooks → `webhook-redelivery`; orchestrations writing `cloud_worker_jobs` → `job-dead-letter`; command-bus orchestrators → `command-replay`.

**17.2 — Health metrics adapter** — `src/lib/backend-topology/edge-function-health-source.ts` (~100 LOC)
- `useEdgeFunctionHealth()` hook that queries Supabase analytics (`function_edge_logs` view) for last-1h invocations, error rate, p50/p95/p99 latency, last-success, last-error per function name.
- Falls back to Supabase admin RPC `get_edge_function_metrics()` (read-only aggregate) for surfaces without analytics scope.
- Returns `{ name, invocations1h, errors1h, errorRate, p50ms, p95ms, lastSuccessAt, lastErrorAt, healthScore: 0-100 }` for all 85.

**17.3 — Admin dashboard** — `src/pages/admin/EFH01EdgeFunctionHealthCenter.tsx` (~220 LOC)
- Route `/admin/edge-functions/health`.
- Header: 85 functions · GREEN/AMBER/RED counts · last refresh.
- Per-category accordions (ADMIN_BFF, PUBLIC_BFF, DOMAIN, ORCHESTRATION, CONNECTOR_WEBHOOK, RUNTIME_SYSTEM).
- Per-function row: name · category · owner · auth · sideEffect · invocations1h · errorRate · p95 · health badge · replay-path badge · "view contract" link.
- Filter chips: category · owner · health (red/amber/green) · has-replay-path (yes/no/n/a).
- Wired into `AdminControlPlaneShell` → Trust/Health domain.

**17.4 — CI gate 28** — `scripts/architecture/checks/check-edge-function-health-replay.ts` (~120 LOC)
Asserts:
- Every ORCHESTRATION_FUNCTION has `EDGE_FUNCTION_REPLAY_MAP` entry with `kind !== "not-applicable"` OR explicit rationale.
- Every CONNECTOR_WEBHOOK_FUNCTION has `kind` in `["webhook-redelivery", "idempotent-retry"]`.
- Every entry references a real mechanism that exists on disk (matches one of: `cloud_worker_jobs` table, `WorkflowReplayEngine`, `api-gateway` command-replay route, `Idempotency-Key` header support).
- Health adapter file exists + dashboard route registered.
- Generates `generated/edge-function-health-replay-report.json`.

**17.5 — Backend topology barrel** — `src/lib/backend-topology/index.ts`
- Add `export * from "./edge-function-replay-map"`.
- Add `export * from "./edge-function-health-source"`.

**17.6 — Register CI gate 28** — `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts`
- New phase `phase-17-edge-function-health-replay`.
- Update `generated/ci-umbrella-manifest.json` → `gateCount: 28`.

**17.7 — Route + readiness** — `src/routes/AdminRoutes.tsx`
- Lazy-load `EFH01EdgeFunctionHealthCenter` at `/admin/edge-functions/health` gated by `maintenance.view`.
- Update `backend-api-deployability-readiness.ts` items `backend.health-visibility` (NEW) and `backend.replay-paths` (NEW).
- Regenerate `backend-api-deployability-report.json` (15 → 17 items, all ready).

### Acceptance

- 30 required functions (18 ORCHESTRATION + 12 CONNECTOR_WEBHOOK) all have `EDGE_FUNCTION_REPLAY_MAP` entries — CI gate 28 enforces.
- `/admin/edge-functions/health` lists all 85 functions with live invocations, error rate, p95, health badge, replay-path badge.
- CI Umbrella reads **28/28 green**.
- Edge Function Checklist truthfully **10/10 ready**, no honest partials remain.

### Files

| File | Change |
|---|---|
| `src/lib/backend-topology/edge-function-replay-map.ts` | New (~180 LOC) |
| `src/lib/backend-topology/edge-function-health-source.ts` | New (~100 LOC) |
| `src/lib/backend-topology/index.ts` | +2 barrel exports |
| `src/pages/admin/EFH01EdgeFunctionHealthCenter.tsx` | New admin surface (~220 LOC) |
| `scripts/architecture/checks/check-edge-function-health-replay.ts` | New CI gate 28 (~120 LOC) |
| `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts` | +phase-17 |
| `src/routes/AdminRoutes.tsx` | Route wiring |
| `src/lib/runtime/backend/release/backend-api-deployability-readiness.ts` | +2 items (health-visibility, replay-paths) |
| `generated/edge-function-health-replay-report.json` | New artifact |
| `generated/backend-api-deployability-report.json` | Regenerate (17 items) |
| `generated/ci-umbrella-manifest.json` | gateCount: 28 |
| `generated/production-truth-final.json` | +phase-17 |

After this phase the **Edge Function Checklist is truthfully 10/10 ready, fully wired, CI-enforced** — every function classified, fully metadata-mapped, and every orchestration/connector has a declared, code-backed replay path observable in the admin health board.

