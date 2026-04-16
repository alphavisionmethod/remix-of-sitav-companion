

# Admin Control Plane Consolidation — Phased Plan

## Goal
Collapse 507 admin pages / 136 routes / 22 SubNavs into **12 canonical owner-workflow domains** with zero functional loss, zero broken deep links, and a green build at every phase boundary.

## Final Information Architecture (12 domains)
```
/admin
  overview · alerts · approvals · environments
  ai-runtime · integrations · trust-security · health
  releases · verification · config · support
```

## Phase Sequencing (each phase is independently deployable)

### Phase 1 — Audit & Truth Registries (read-only, zero risk)
Build the foundation before moving any page.
- `src/lib/architecture/admin-page-consolidation-map.ts` — every current admin page classified: `PRIMARY_DOMAIN_ENTRY | SECONDARY_SUBVIEW | DETAIL_EXPLORER | WORKFLOW_TOOL | SUPPORT_TOOL | DUPLICATE_MERGE_REQUIRED | DEPRECATE_WITH_REDIRECT`, with target domain + new route + unique-functionality notes.
- `src/lib/architecture/admin-route-registry.ts` — single source of truth: route, owner domain, page class, nav visibility, breadcrumb chain, deprecated aliases.
- `src/lib/architecture/owner-workflow-map.ts` — daily / weekly / support / release / trust-safety workflows with entry pages, key metrics, escalation paths.
- Docs: `docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md`, `docs/architecture/OWNER_WORKFLOW_MAP.md`.
- New governance checks: `check-admin-domain-budget.ts` (≤12), `check-admin-route-registry-conformance.ts`, `check-admin-page-classification-coverage.ts`. Wire into the existing aggregator.
- **Deployable**: pure additive truth artifacts, no UI/route changes.

### Phase 2 — Canonical Shell + 12-Domain Nav
- Promote `AdminControlPlaneShell` as the **only** admin shell. Wrap `AdminShell`, `OwnerWorkspaceShell`, `FounderControlShell` as deprecation-shimmed re-exports calling the canonical shell.
- Rewrite `AdminPrimaryNav.tsx` to the 12 canonical domains driven by `admin-route-registry`.
- Rebuild `AdminDomainNav` + `AdminBreadcrumbs` from the registry.
- Rewire `AdminCommandPalette` to read **only** registry-listed routes.
- **Deployable**: nav points to the new 12 entries, but every existing route still resolves to its current page.

### Phase 3 — Domain Hubs (Overview, Alerts, Approvals, Environments)
Create the four daily-workflow hubs. Each hub composes existing pages as **modules/tabs/explorers**, not new content.
- `overview/OverviewHome` ← merges `AdminDashboard`, `AdminOperationsHub`, `MissionControlHome`, `SystemHealthDashboard`, `LaunchReadinessBoard`, `LaunchHonestyBoard`, `GeneratedTruthDashboard` as widgets.
- `alerts/AlertsHome` ← unifies `AlertTriageBoard`, `NoSilentFailureAlerts`, AI/integration/degraded streams.
- `approvals/ApprovalsHome` ← merges `AIApprovalDesk`, `AdvisorActionApprovalAdmin`, `HQApprovalQueue`, `AIT07ApprovalQueue`.
- `environments/EnvironmentsHome` ← combines `UserManagement`, `TeamManagement`, cloud user/device pages, session/setup state.
- Old routes redirect (or wrap) to new hubs via the registry.

### Phase 4 — Domain Hubs (AI Runtime, Integrations, Trust/Security, Health)
- `ai-runtime/*` ← merges all `AIG*`, `AIT*`, `SAG*`, advisor pages, prompt/model/provider pages.
- `integrations/*` ← merges all `CN*`, `PFA*`, Google/cloud sync, OAuth pages.
- `trust-security/*` ← merges security command, policy editors, identity, proofs, audit, sensitive actions.
- `health/*` ← merges fleet health, observability, runtime continuity, self-healing, incidents, performance budgets.
- Each old `*SubNav` collapses into its target domain’s sub-nav (driven by registry).

### Phase 5 — Domain Hubs (Releases, Verification, Config, Support)
- `releases/*` ← launch readiness, deployment rings, rollback, VMware, mobile releases, artifacts.
- `verification/*` ← implementation truth, launch honesty, reality audit, customer journeys, route conformance, manifest explorer.
- `config/*` ← feature flags, templates, content, registries.
- `support/*` ← cases, diagnostics, replay, recovery, maintenance mode, stuck-workflow repair.
- Verification surfaces explicitly demoted from “executive landing page” status — they live under Verification only.

### Phase 6 — Canonical Admin Component Family
Build shared primitives so every hub uses the same grammar:
`AdminSummaryCard`, `AdminAlertCard`, `AdminQueueTable`, `AdminExplorerPanel`, `AdminDiagnosticsPanel`, `AdminDetailDrawer`, `AdminActionBar`, `AdminHealthWidget`, `AdminProofRow`, `AdminIncidentCard`. Migrate hubs from Phase 3–5 onto these primitives.

### Phase 7 — Tests, Manifests, Cleanup
- Tests: top-level domain budget, registry conformance, owner-workflow navigation resolves, no duplicate primary concept, single shell hierarchy, deprecated-route redirect, command-palette coherence, e2e for each daily workflow.
- Update truth manifests: `manifest-registry.ts`, route manifests, customer-journey route refs, `docs/architecture/ADMIN_*`.
- Remove pages **only** after `admin-page-consolidation-map.ts` shows zero remaining inbound references.

## Deliverables
- 12-domain canonical IA + shell + nav
- `admin-page-consolidation-map.ts` covering all 507 pages
- `admin-route-registry.ts` (single source of truth)
- `owner-workflow-map.ts` + 2 architecture docs
- 12 domain hubs with merged-but-preserved functionality
- Canonical admin component family
- 8 new governance checks + e2e tests
- Redirects/wrappers for every legacy route — zero broken bookmarks

## Non-Negotiable Rules
- No blind deletion. Every page is classified before it moves.
- Every legacy route resolves (redirect or wrapper) until Phase 7 cleanup.
- Each phase ends with: `tsc --noEmit` clean, all governance checks green, app boots, daily/support/release workflows resolve.

Starting with **Phase 1** in the next message.

