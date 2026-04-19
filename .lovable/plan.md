

## Scope check (read before planning)

User explicitly says: **"only on the admin ai engineer team"**. The prompt body is a repo-wide structural refactor — that scope contradicts the user's instruction. I must obey the user constraint, not the prompt body.

So the actual scope = **structural hardening of the Admin AI Engineering surface only** (not a repo-wide plane refactor, not Electron restructure, not backend plane re-org). That surface = the AI Engineer hub (`/admin/ai-runtime` + 22 tabs + supporting modules).

I'll do enough exploration to confirm current state, then plan a phased, deployment-ready hardening pass scoped to that team's code.

## Exploration needed first

1. Inventory the AI Engineer hub: tabs, panels, hooks, services, edge functions, tables.
2. Identify duplicates/stubs/placeholders inside that scope.
3. Identify wiring gaps (UI → service → edge function → DB → realtime).
4. Verify the 6/6 Section-D primitive adoption across all 22 tabs (not just Tab #22).
5. Check Security Council, autonomous advisor, and cron paths surfaced in this hub.

## Files to inspect

- `src/components/admin/ai-runtime/**` (all 22 tab panels + shared)
- `src/pages/admin/AIRuntime*.tsx` and any `AIEngineer*` route pages
- `src/lib/ai/**`, `src/lib/services/ai-gateway/**`
- `src/hooks/useAI*`, `useAdvisor*`, `useSecurityCouncil*`
- `supabase/functions/ai-*`, `advisor-*`, `*-nightly-verify*`
- Tables: `ai_*`, `advisor_*`, `kill_switch_*`, `sita_security_council_*`

## Proposed phases (each phase = independently deployable)

### Phase 1 — Inventory & duplicate audit (no code changes)
- Generate `generated/admin-ai-engineer-team/INVENTORY.md` listing every tab, panel, hook, service, edge function, table touching this hub.
- Detect duplicates: any two panels showing the same data, any two hooks calling the same RPC, any orphaned `*Panel.tsx` not mounted in the 22-tab registry.
- Output: `duplicate-report.json`, `orphan-report.json`, `wiring-gap-report.json`.
- **Deployment-ready criterion:** report-only; zero behavior change.

### Phase 2 — Canonical 22-tab registry + single source of truth
- Create `src/lib/admin/ai-engineer-hub/tab-registry.ts` — typed manifest of all 22 tabs (id, label, panel ref, capability, owner, evidence path).
- Refactor `AIEngineerHubPage.tsx` to render from registry (no hardcoded tab arrays).
- Add CI gate `scripts/validation/check-ai-engineer-tab-registry.ts` — every panel file under `ai-runtime/` must be either registered or explicitly archived.
- Delete confirmed-duplicate panels from Phase 1; collapse near-duplicates into one canonical panel.
- **Deployment-ready criterion:** all 22 tabs render identically; registry-driven; zero orphaned panels.

### Phase 3 — Wiring closure (UI → service → edge function → DB → realtime)
For each of the 22 tabs, prove the full wiring chain is real:
- **Models / Providers / Capabilities / Routing** → `ai_model_registry`, `ai_provider_registry`, `ai_capability_routing`
- **Invocations / Receipts / Cost / Budgets / Fallbacks** → `ai_usage_ledger`, `ai_invocation_receipts`, `ai_budget_*`
- **Health / Drift** → `ai_provider_health`, nightly drift detector
- **Suggestions / Approvals** → `ai_implementation_suggestions`, `kill_switch_approvals`
- **Security Council** → `sita_security_council_findings`, hourly `pg_cron`
- **Advisors / Boardroom / REX** → `advisor_*`, `boardroom_*` tables
- **Runbooks / Kill Switches** → `kill_switch_audit_log`, runbook registry
- **Tab #22 Frontend Truth-Backing** → existing closure bundle

Replace any `useState`-only or mock-prop panels with real hooks calling real services. Add realtime subscriptions where the underlying table supports it (`ai_usage_ledger`, `kill_switch_audit_log`, etc.). Generate `generated/admin-ai-engineer-team/WIRING_PROOF_MATRIX.md`.
- **Deployment-ready criterion:** every tab consumes real DB/edge-function data with realtime where applicable; zero `as any`; zero mock arrays in shipping code.

### Phase 4 — 6/6 Section-D primitive coverage across all 22 tabs
Currently only Tab #22 strictly enforces `AITruthDisclosure` + `trust-copy-map`. Extend to all 22:
- Replace ad-hoc status text/badges with `StatusBadge` + `StatusTone`.
- Replace AI-state language with `AITruthDisclosure` (live-gateway / degraded / structural / preview / archived).
- Replace trust labels with `formatTrustLabel()` from `trust-copy-map`.
- Add `ProvenanceChip` + `EvidenceLink` where evidence rows exist.
- New CI gate `check-ai-engineer-primitive-coverage.ts` (BLOCK-tier).
- **Deployment-ready criterion:** 100% canonical primitive adoption inside `src/components/admin/ai-runtime/**`; CI gate green.

### Phase 5 — Operator action panels + remediation paths
Every tab must answer "what do I do next?":
- Adopt `OperatorActionPanel` (D5) on every degraded/error/empty state.
- Wire each Security Council finding → suggested runbook + suggested kill switch (uses existing Incident Classifier).
- Wire each provider-health drop → reauth/escalation CTA.
- Wire each budget alert → ledger drilldown + kill-switch link.
- **Deployment-ready criterion:** every non-green state has an actionable next step backed by a real handler.

### Phase 6 — Validation, observability, and final closure
- Add `scripts/validation/check-ai-engineer-no-mocks.ts` (mock governance scoped to this surface).
- Add `scripts/validation/check-ai-engineer-realtime-coverage.ts` (asserts realtime subscriptions for streaming tabs).
- Wire all 4 new gates into the 124-gate Release Aggregator.
- Generate the closure bundle in `generated/admin-ai-engineer-team/`:
  - `INVENTORY.md` · `WIRING_PROOF_MATRIX.md` · `PRIMITIVE_COVERAGE.md` · `REMEDIATION_COVERAGE.md` · `FINAL_CLOSURE.md`
  - Mirror to `public/generated/admin-ai-engineer-team/` for in-app inspection.
- Update Tab #22 to surface this team's closure status alongside frontend truth-backing.
- **Deployment-ready criterion:** all 4 new gates pass; closure bundle complete; Tab #22 shows 6/6 + 22/22 green.

## Discipline guarantees

- **Scope locked** to `src/components/admin/ai-runtime/**`, `src/pages/admin/AI*Page.tsx`, related hooks/services, related edge functions, related validators, related generated artifacts. Zero changes outside this surface.
- **No edits** to `/desktop`, user-plane apps, Electron, OS image-builder, or backend planes outside AI runtime.
- **No new component families** — composes existing primitives (`StatusBadge`, `ProvenanceChip`, `EvidenceLink`, `AITruthDisclosure`, `OperatorActionPanel`, `trust-copy-map`).
- **No deletions** of working assets; only proven-duplicate panels (Phase 1 → Phase 2) and only after reference check.
- **No App.tsx / route-table changes** (registry is internal to the hub page).
- **No migrations** unless a tab requires a missing index for realtime; if so, additive only.
- **L3 autonomy ceiling preserved** — Security Council remains advisory; no auto-apply.
- **Sovereign AI Gateway preserved** — every AI call still goes through `invokeAICapability`.
- Each phase is independently shippable and rollback-safe.

## Files touched (estimate)

- ~30 panel files in `src/components/admin/ai-runtime/`
- 1 hub page (`AIEngineerHubPage.tsx`)
- 1 new registry (`tab-registry.ts`)
- 4 new validators
- 5 new generated artifacts (+ public mirror)
- ~5 hooks consolidated into canonical service-facade calls
- 1 update to release-readiness-aggregator gate list

