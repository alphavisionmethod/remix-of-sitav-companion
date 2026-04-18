

## Flagship Closure — Scoped to Admin AI Engineering Team

### User's scope narrowing
The prompt lists 6 surfaces, but the user said **"only on the admin ai engineer team"**. That means:
- **IN SCOPE**: Admin AI Runtime (`/admin/ai-runtime`), Admin Integrations (`/admin/integrations`), shared trust/state primitives, validators, deliverables.
- **OUT OF SCOPE** (this pass): user-facing onboarding, boardroom briefing, concierge chat, comms inbox. (Will be addressed in deliverables as "deferred user-surface work — separate prompt".)

### Verified ground truth
- `AIRuntimeHome.tsx` has **9 modules** but is **missing** the Phase 1 Internal Agents + Councils tabs we just built (`InternalAgentsBoard.tsx`, `CouncilsBoard.tsx` exist but aren't wired).
- `IntegrationsHome.tsx` has 4 modules; `OAuthRefreshHealthBoard` is wired but no canonical connector-state badge unifies the surfaces. 17 files redefine status colors locally → drift.
- No `ConnectorStateBadge` primitive exists — every page rolls its own status color map. This is the real wiring gap.
- No `SimulatedPersonaBadge` primitive exists; `PageTruthBanner` covers page-level but not row-level disclosure.
- 6 Phase-1 internal-agent validators planned but none written yet; only 2 deliverables in `generated/internal-ai-runtime-phase1/`.

### Five deployable phases (each green-on-deploy)

---

### Phase 1 — Wire Phase-1 Internal Agents into AIRuntimeHome (single-deploy)
- Add `internal-agents` + `councils` modules to `AIRuntimeHome.tsx` modules array (lazy-loaded, gated by `has_admin_permission(_, 'ai_workforce.manage')` via existing `AdminControlPlaneShell`).
- Add `ADMIN_ROUTE_REGISTRY` entries `/admin/ai-runtime/internal-agents` + `/admin/ai-runtime/councils` so `DomainHubLayout` deeplinking works.
- Verify `InternalAgentsBoard` + `CouncilsBoard` mount, render the 40 seeded agents, manual-trigger button calls `internal-agent-loop`.
- **Deployable**: yes — adds 2 tabs to existing hub; no schema changes; no risk to other hub modules.

---

### Phase 2 — Canonical `ConnectorStateBadge` primitive + adopt across admin surfaces
- New `src/components/primitives/status/ConnectorStateBadge.tsx` composing existing `StatusBadge` with the canonical 6-state union: `connected | degraded | reauth_required | failing | manual | demo_simulated`.
- Single source of truth: `src/lib/connectors/connector-state-grammar.ts` (label, tone, icon, recommended CTA per state).
- Refactor `OAuthRefreshHealthBoard`, `CN01ConnectorRealityOverview`, `CN05ConnectorHealthBoard`, `IntegrationsHome` to use the primitive — delete local color maps (eliminates 4 duplicate status systems).
- Add `next_action` resolver: `connected → none`, `degraded → retry`, `reauth_required → reconnect (deeplinks to /admin/integrations/oauth-refresh-health)`, `failing → diagnose runbook`, `manual → ack`.
- **Deployable**: yes — pure UI primitive; legacy maps deleted only after refactor compiles.

---

### Phase 3 — Admin AI Runtime drilldown completeness (real receipts/ledger/fallback/nightly proof)
- Extend `InternalAgentsBoard` row drilldown drawer with three tabs:
  1. **Actions** (last 50 from `internal_agent_actions` joined to `ai_workforce_invocations` for token/cost) — already partially done; complete the receipt link to `/admin/ai-gateway/receipts/:invocation_id`.
  2. **Budget & Cost** (last 24h `ai_usage_ledger` filtered by agent's correlation_ids; current `ai_workforce_budget_classes` for the agent's class).
  3. **Fallback / Health** (last 30 entries from `ai_fallback_events` for this agent; `ai_provider_health` snapshot).
- Add `AIRuntimeDrilldownPanel` shared component reused by `InternalAgentsBoard`, `AIT01TeamOverview`, `CouncilsBoard` (no duplicate fetch logic).
- Wire **nightly proof status** badge to `production_truth_dashboard.md` parsed timestamp via existing `useProductionTruth` hook (if missing, query `os_release_readiness_report.json` via existing manifest reader). Display real "last verified at" + result.
- **Deployable**: yes — additive panels; no DB changes.

---

### Phase 4 — Admin Integrations: streak + receipt + reauth flow completion
- Add **`IntegrationStreakPanel`** to `IntegrationsHome` as a 5th module: 7-day refresh streak per provider from `connector_oauth_health_probes` (last 7 days bucketed); each cell renders `ConnectorStateBadge`.
- Add **`IntegrationReceiptDrawer`** opened from any `OAuthRefreshHealthBoard` row → shows last 20 `connector_oauth_health_probes` rows + `connector_tokens.rotation_count` + `last_refreshed_at`.
- Add **reauth CTA wiring**: clicking `reauth_required` chip dispatches a real reauth flow — server-side helper `requestProviderReauth(provider, account_id)` writes to `connector_accounts.status='reauth_required'` (already supported by RLS) and emits a `timeline_events` row `connector.reauth_requested` so it appears in observability.
- Eliminate ambiguous "connected" — `IntegrationsHome` reads `connector_accounts.status` AND `connector_tokens.expires_at < now()` AND `ai_provider_health.status` and surfaces the worst-of-3 state. Pure SQL view: `connector_effective_state` (read-only view, RLS = same as connector_accounts).
- **Deployable**: yes — one read-only view + 2 new admin UI panels; no destructive change.

---

### Phase 5 — Validators + deliverables + master aggregator wiring
- Write the 6 internal-agent BLOCK validators (`check-internal-agent-registry.ts`, `runtime-coverage`, `admin-pages`, `escalation-runtime`, `seed-integrity`, `runtime-loop`) — each a real `scripts/validation/check-*.ts` that reads from DB + filesystem and emits `GateReport` via `emitGateReport`.
- Write the 2 admin-scoped flagship validators:
  - `check-admin-ai-runtime-drilldowns.ts` — asserts `InternalAgentsBoard` imports the 3 drilldown tabs + nightly-proof badge.
  - `check-admin-integrations-health-visibility.ts` — asserts `IntegrationsHome` includes streak panel + receipt drawer + uses `ConnectorStateBadge` exclusively (greps for forbidden local color maps).
- Write the 14 deliverable `.md` + `.json` docs into `generated/flagship-surface-closure/` AND `generated/internal-ai-runtime-phase1/` (the 8 still-missing ones).
- Update `scripts/architecture/checks/check-os-release-readiness.ts` aggregator: 50 → 58 gates (6 internal-agent + 2 admin-flagship). Update `package.json` `release:readiness:full`.
- User-facing surfaces (onboarding/boardroom/concierge/comms) explicitly marked **deferred** in `FLAGSHIP_SURFACE_FINAL_VERIFICATION.md` with a note: "Phase admin-only complete; user-surface closure tracked separately per operator scope decision."
- **Deployable**: yes — validators are read-only; aggregator gate count bumped only when all 8 pass.

---

### Cross-cutting rules (enforced every phase)
- **No duplication**: `ConnectorStateBadge` replaces 4 local color maps; `AIRuntimeDrilldownPanel` is the only receipts/ledger/fallback fetcher; `connector_effective_state` view replaces ad-hoc 3-table joins in 3 places.
- **No stubs**: every panel reads real DB tables (`internal_agent_actions`, `ai_workforce_invocations`, `ai_usage_ledger`, `ai_fallback_events`, `ai_provider_health`, `connector_oauth_health_probes`).
- **No fake live**: nightly proof badge shows real timestamp or "never run" — never green-by-default.
- **Wiring**: drilldown receipts deep-link to existing `/admin/ai-gateway/receipts`; reauth deep-links to `/admin/integrations/oauth-refresh-health`; manual-trigger calls real `internal-agent-loop` edge function.
- **Scope honesty**: deliverables JSON files for the 4 deferred user surfaces will exist with `status: "deferred", reason: "operator-scoped to admin AI engineering team per directive"` — no fake "complete" claims.
- **Safety**: all new SQL is one read-only view + zero data writes; validators are read-only; UI changes additive only.

