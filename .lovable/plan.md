

Continuing the Admin AI Engineering closure pass. Two remaining buckets from the approved plan: (1) finish wiring the drilldown panel + refactor remaining surfaces to canonical primitives, (2) Phase 5 — validators, deliverables, aggregator bump.

### Phase A — Mount drilldowns + refactor stragglers

**A1. Mount `AIRuntimeDrilldownPanel` in `InternalAgentsBoard` drawer**
- Replace the inline "recent actions" list in the agent drilldown drawer with the canonical `AIRuntimeDrilldownPanel` (Actions / Budget / Health tabs). Keep header summary + supervisor actions.
- Add the `NightlyProofBadge` to the board header so the nightly proof timestamp is visible at a glance.

**A2. Refactor remaining color-map surfaces to `ConnectorStateBadge`**
- `src/pages/admin/connectors/CN01ConnectorRealityOverview.tsx` — replace local `getStatusColor` with `<ConnectorStateBadge state={...} />`.
- `src/pages/admin/connectors/CN05ConnectorHealthBoard.tsx` — same.
- `src/pages/admin/cloud-backbone/CloudBackboneAdmin.tsx` — only the connector-state column.
- `src/pages/admin/integrations/IntegrationsHome.tsx` — switch the per-provider chip to canonical badge using `connector_effective_state` view results.
- Delete the now-dead local color maps in those files (zero duplicates).

**A3. Wire `IntegrationStreakPanel` + `IntegrationReceiptDrawer` into `IntegrationsHome`**
- Add streak panel as the 5th module of the Integrations hub.
- Open the receipt drawer from any row in `OAuthRefreshHealthBoard` (already imported; just wire the row-click handler).

### Phase B — Phase 5: Validators + deliverables + aggregator

**B1. Eight BLOCK validators** (each emits `GateReport` via existing `emitGateReport`):
| Script | What it asserts |
|---|---|
| `scripts/validation/check-internal-agent-registry.ts` | DB definition count == spec count (40); no orphan `agent_id`s |
| `scripts/validation/check-internal-agent-runtime-coverage.ts` | every definition has a runtime_state row |
| `scripts/validation/check-internal-agent-admin-pages.ts` | `AIRuntimeHome` includes `internal-agents` + `councils` modules; routes registered |
| `scripts/validation/check-internal-agent-escalation-runtime.ts` | escalation FK targets resolve; supervisor keys exist in `SUPERVISORS` |
| `scripts/validation/check-internal-agent-seed-integrity.ts` | seed payload hash matches DB `spec_hash`; idempotent re-seed produces zero diff |
| `scripts/validation/check-internal-agent-runtime-loop.ts` | `internal-agent-loop/index.ts` exists; references budget/kill-switch/receipt patterns |
| `scripts/validation/check-admin-ai-runtime-drilldowns.ts` | `InternalAgentsBoard` imports `AIRuntimeDrilldownPanel` + `NightlyProofBadge` |
| `scripts/validation/check-admin-integrations-health-visibility.ts` | `IntegrationsHome` uses streak panel + receipt drawer + `ConnectorStateBadge`; greps for forbidden local color maps in connector pages |

**B2. Deliverables (14 files)** under `generated/flagship-surface-closure/` and `generated/internal-ai-runtime-phase1/`:
- 8 markdown specs (`ONBOARDING_…`, `BOARDROOM_…`, `CONCIERGE_…`, `COMMS_…`, `ADMIN_AI_RUNTIME_CLOSURE_SPEC.md`, `ADMIN_INTEGRATIONS_CLOSURE_SPEC.md`, `SHARED_STATE_AND_TRUST_ALIGNMENT.md`, `FLAGSHIP_SURFACE_FINAL_VERIFICATION.md`).
- 6 status JSONs. The 4 user-surface JSONs explicitly carry `status: "deferred"` with the operator-scoping note (no fake completion).
- 4 missing Phase-1 docs in `generated/internal-ai-runtime-phase1/` (architecture, runtime loop, supervisor model, validators index).

**B3. Aggregator bump 50 → 58**
- Update `scripts/architecture/checks/check-os-release-readiness.ts` to ingest the 8 new gate reports.
- Update `package.json` `release:readiness:full` to invoke them.
- Add `internal-agents:run-all` script bundling the 6 internal-agent validators.

### Cross-cutting (kept identical to approved plan)
- Zero new tables, zero stubs, no fake-live states.
- Drilldown deep-links use existing `/admin/ai-gateway/receipts/:id` and `/admin/integrations/oauth-refresh-health` routes — no new routes.
- All new validators are read-only; aggregator gate count only bumps when all 8 pass.
- 4 deferred user-surface JSONs are honest: `status: "deferred", reason: "operator-scoped to admin AI engineering team per directive"`.

