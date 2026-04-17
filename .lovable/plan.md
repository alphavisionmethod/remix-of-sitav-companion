

## Re-Audit — Checklist 18: 6/10 Truthful, 4 Real Gaps

Live evidence shows the **scaffolding is real** (12 canonical domains declared, 5 owner workflows defined, 136 routes registered, shell + palette wired off the registry) but **the workflows themselves are mostly aspirational**: their entry hubs and step routes are not mounted, the shell doesn't expose them, and the gate that's supposed to validate them does something else entirely.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Canonical owner workflow map exists | ✅ | `src/lib/architecture/owner-workflow-map.ts` declares all 5 (daily, weekly, support, release, trust-safety) |
| 2 | Daily workflow exists | ⚠️ | All 5 step paths declared; only 2 of 5 mounted (`/admin/overview`, `/admin/alerts`, `/admin/approvals` ✓ — `/admin/health/incidents`, `/admin/releases/launch-readiness` ✗) |
| 3 | Weekly workflow exists | ⚠️ | All 5 step paths declared; **0 of 5 mounted** (`/admin/overview/generated-truth`, `/admin/ai-runtime/intelligence/efficiency`, `/admin/integrations`, `/admin/verification/launch-honesty`, `/admin/ai-runtime/costs` all 404) |
| 4 | Support workflow exists | ⚠️ | 6 step paths declared; **0 of 6 mounted** |
| 5 | Admin route IA compressed | ✅ | 12-domain budget enforced (`MAX_ADMIN_DOMAINS=12`, `check-admin-top-level-domain-count` green) |
| 6 | Admin routes map to canonical domains | ⚠️ | 136 in registry but **14 mounted routes orphaned** (`/admin/meta/reality`, `/admin/ci/umbrella`, `/admin/db-truth-explorer`, `/admin/web/deployability`, `/admin/desktop/deployability`, `/admin/appliance/deployability`, `/admin/backend-api/deployability`, `/admin/mobile/store-readiness`, `/admin/edge-functions/health`, `/admin/meta-arch`, `/admin/meta-arch/atlas`, `/admin/meta-arch/control-plane`, `/admin/meta-arch/golden-paths`, `/admin/meta/completeness`) — `check-admin-route-registry-conformance` **failing** |
| 7 | Admin shell unified | ⚠️ | `AdminControlPlaneShell` exists but **only 12 of 526 admin pages** wrap with it (per `check-admin-ia` output); shell does **not** expose owner workflows in nav |
| 8 | Admin can inspect critical subsystems | ✅ | Mission Control + Backend Topology + 526 admin pages present |
| — | Owner-workflow gate honest | ❌ | `check-owner-workflow-map.ts` validates **service ownership**, not workflows — does nothing for the workflow map; reports green vacuously |
| — | Workflows surfaced in UI | ❌ | Neither `AdminControlPlaneShell` nor `AdminCommandPalette` imports `OWNER_WORKFLOWS` — operators cannot enter "Daily Command" / "Weekly Review" / "Support" as workflows |

### Concrete Gaps

1. **8 of 12 domain hubs unmounted** — `/admin/releases`, `/admin/support`, `/admin/health`, `/admin/trust-security`, `/admin/verification`, `/admin/ai-runtime`, `/admin/integrations`, `/admin/config` all 404. Registry declares them as `PRIMARY_DOMAIN_ENTRY` but `AdminRoutes.tsx` never mounts them.
2. **Workflow step routes missing** — 14 of 24 step routes across the 5 workflows (overview/generated-truth, ai-runtime/intelligence/efficiency, environments/users, environments/devices, environments/integration-state, environments/workflow-state, support/cases, support/replay, support/recovery, releases/launch-readiness, releases/mobile-parity, releases/deployment-rings, releases/rollback, trust-security/* etc.) are not mounted.
3. **14 mounted routes missing from registry** — registry conformance gate fails today.
4. **Owner-workflow gate is a no-op** — checks services, not the workflow map. Allows the above to pass silently.
5. **No workflow surface in shell/palette** — operators have no UI affordance to enter Daily/Weekly/Support workflows; they only see the 12-domain primary nav.

---

## Phase 25 — Admin Control Plane Reality Closure

### 25.A — Mount the 8 missing canonical domain hubs (fixes #1)
Add `<Route>` entries in `src/routes/AdminRoutes.tsx` for `/admin/{releases,support,health,trust-security,verification,ai-runtime,integrations,config}` rendering domain-hub pages. For each missing hub, create a thin `src/pages/admin/{Domain}Home.tsx` that wraps `AdminControlPlaneShell` and lists the domain's sub-routes (read straight from `ADMIN_ROUTE_REGISTRY` filtered by domain). Existing `OverviewHome`, `AlertsHome`, `ApprovalsHome`, `EnvironmentsHome` are the template.

### 25.B — Mount the workflow step routes (fixes #2)
For every `OwnerWorkflowStep.route` not currently in `AdminRoutes.tsx`, do one of:
- **Mount real page** if the underlying admin page exists (e.g., `/admin/health/incidents` → reuse `MCIncidents`, `/admin/releases/launch-readiness` → reuse `LaunchReadinessHome`).
- **Mount alias redirect** if a canonical equivalent already lives elsewhere (e.g., `/admin/ai-runtime/costs` → `<Navigate to="/admin/ai-team/cost" replace />`).
- **Mount stub hub** wrapping `AdminControlPlaneShell` with a `<DomainHubIndex domain="…" filter="…" />` that shows declared but-not-yet-built drill explorers.

Result: every workflow step resolves to a real page (no 404).

### 25.C — Register the 14 orphan routes (fixes #3)
Add registry entries in `src/lib/architecture/admin-route-registry.ts` for each orphan route mapped to its rightful canonical domain (e.g., `/admin/ci/umbrella` → `verification`, `/admin/db-truth-explorer` → `verification`, `/admin/edge-functions/health` → `health`, `/admin/web|desktop|appliance|backend-api|mobile/deployability` → `releases`, `/admin/meta-arch*` → `verification`). Tag each with the appropriate `workflows: [...]`.

### 25.D — Make the owner-workflow gate honest (fixes #4)
Rewrite `scripts/architecture/checks/check-owner-workflow-map.ts` to actually validate the workflow map:
- Parse `src/routes/AdminRoutes.tsx` → set of mounted paths
- Import `OWNER_WORKFLOWS` and assert: every `entry` and every `steps[].route` is mounted (or has a registry entry with `replacedBy` resolving to a mounted path).
- Assert each of the 5 workflow keys is present and has ≥4 steps.
- Assert every workflow domain appears in `ADMIN_DOMAINS`.
- Emit `generated/owner-workflow-reality-report.json` with per-workflow `mounted/total` step counts.
- Fail loudly when any step is unmounted.

Promote to **Gate 36** in `src/lib/ci/ci-gate-registry.ts` + bump `gateCount: 36` in `generated/ci-umbrella-manifest.json` and `CI01CIUmbrellaCenter.tsx`.

### 25.E — Surface workflows in the admin shell (fixes #5)
- New component `src/components/admin/shells/OwnerWorkflowSwitcher.tsx` — dropdown / chip group above the primary nav offering the 5 workflows; selecting one navigates to its `entry` and pins a sticky "Workflow: Daily" badge with a "Next step" mini-stepper that walks through `OwnerWorkflow.steps`.
- Mount it inside `AdminControlPlaneShell` between the degraded banner and `AdminPrimaryNav`.
- Extend `AdminCommandPalette` with a top-level "Workflows" `<CommandGroup>` driven by `getAllWorkflows()` so Cmd-K can jump straight into a workflow entry.
- Persist the active workflow in `sessionStorage` so traversal across pages keeps the stepper context.

### Files

| Layer | Change |
|---|---|
| `src/routes/AdminRoutes.tsx` | Mount 8 hub routes + ~14 workflow-step routes/aliases |
| `src/pages/admin/{Releases,Support,Health,TrustSecurity,Verification,AIRuntime,Integrations,Config}Home.tsx` | NEW — hub pages |
| `src/components/admin/shells/DomainHubIndex.tsx` | NEW — reusable hub index sourced from registry |
| `src/lib/architecture/admin-route-registry.ts` | Register 14 orphan routes + workflow tags |
| `scripts/architecture/checks/check-owner-workflow-map.ts` | REWRITE — real workflow map validation |
| `generated/owner-workflow-reality-report.json` | NEW — emitted by gate |
| `src/lib/ci/ci-gate-registry.ts` + `ci-gate-types.ts` | Add Gate 36 |
| `generated/ci-umbrella-manifest.json` | Bump to `gateCount: 36`, `phase25: registered` |
| `src/pages/admin/CI01CIUmbrellaCenter.tsx` | Reflect new gate |
| `src/components/admin/shells/OwnerWorkflowSwitcher.tsx` | NEW — workflow chooser + stepper |
| `src/components/admin/shells/AdminControlPlaneShell.tsx` | Mount switcher; persist active workflow |
| `src/components/admin/AdminCommandPalette.tsx` | Add "Workflows" group sourced from `OWNER_WORKFLOWS` |

### Acceptance

- `curl /admin/{releases,support,health,trust-security,verification,ai-runtime,integrations,config}` all render the canonical hub (no React Router NotFound).
- Every `OwnerWorkflow.steps[].route` resolves (no 404 across all 5 workflows × ≥4 steps).
- `npx tsx scripts/architecture/checks/check-admin-route-registry-conformance.ts` → **0 violations**.
- `npx tsx scripts/architecture/checks/check-owner-workflow-map.ts` (rewritten) → asserts mounted-step coverage; passes with new mounts.
- `generated/owner-workflow-reality-report.json` shows `daily: 5/5`, `weekly: 5/5`, `support: 6/6`, `release: 6/6`, `trust-safety: 6/6`, `ok: true`.
- `AdminControlPlaneShell` shows `OwnerWorkflowSwitcher`; selecting "Daily Command" navigates to `/admin/overview` and exposes a 5-step stepper.
- `AdminCommandPalette` Cmd-K shows top "Workflows" group with all 5 entries.
- Gate 36 green; `gateCount: 36` in CI umbrella.
- Checklist 18 truthfully **10/10 — fully deployable**.

