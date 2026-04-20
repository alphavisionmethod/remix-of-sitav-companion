# Admin Information Architecture

> **Status:** Phase 1 (truth artifacts established). Phase 2 mounts canonical hubs.
> **Source of truth:** `src/lib/architecture/admin-route-registry.ts`

## The 12 Canonical Domains

The admin control plane is organized around **exactly 12 top-level domains**. This budget is enforced in CI by `scripts/architecture/checks/check-admin-domain-budget.ts`.

| # | Domain          | Path                    | Purpose |
|---|-----------------|-------------------------|---------|
| 1 | Overview        | `/admin/overview`       | Daily executive command — alerts, approvals, incidents, release blockers at a glance. |
| 2 | Alerts          | `/admin/alerts`         | Single triage center for critical, degraded, AI, integration and incident-linked alerts. |
| 3 | Approvals       | `/admin/approvals`      | All owner approvals, history, risky actions, approval policy review. |
| 4 | Environments    | `/admin/environments`   | User / device / session / setup-state lookup, repair and recovery actions. |
| 5 | AI Runtime      | `/admin/ai-runtime`     | Advisors, models, providers, routing, prompts, costs, AI workforce health. |
| 6 | Integrations    | `/admin/integrations`   | Connectors, providers, OAuth, sync, webhooks, consent graph. |
| 7 | Trust & Security| `/admin/trust-security` | Trust state, policy editors, identity, proofs, audit, sensitive actions. |
| 8 | Health          | `/admin/health`         | Observability, runtime continuity, fleet, storage, self-healing, incidents, performance. |
| 9 | Releases        | `/admin/releases`       | Launch readiness, deployment rings, rollback, VMware, mobile releases, artifacts. |
| 10| Verification    | `/admin/verification`   | Implementation truth, launch honesty, reality audit, customer journeys, conformance. |
| 11| Config          | `/admin/config`         | Feature flags, templates, content, registries, environment config. |
| 12| Support         | `/admin/support`        | Cases, diagnostics, replay, recovery, maintenance mode, stuck-workflow repair. |

## Naming Rules

1. Every admin URL MUST start with `/admin/<domain>/...`.
2. Every domain hub MUST own exactly one PRIMARY_DOMAIN_ENTRY page.
3. Sub-pages are SECONDARY_SUBVIEW (sub-nav) or DETAIL_EXPLORER (drill-down).
4. Workflow surfaces (approve, replay, recover) are WORKFLOW_TOOL or SUPPORT_TOOL.
5. No new top-level admin slug may be added without a registry entry and a budget check.

## Page Classification

Every admin page is classified by `AdminPageClass`:

- `PRIMARY_DOMAIN_ENTRY` — the canonical hub (12 total, one per domain).
- `SECONDARY_SUBVIEW` — first-class sub-page in the hub's sub-nav.
- `DETAIL_EXPLORER` — drill-down explorer reachable from a sub-view.
- `WORKFLOW_TOOL` — operator action surface (approve / triage / replay).
- `SUPPORT_TOOL` — diagnostics / recovery / maintenance.
- `DUPLICATE_MERGE_REQUIRED` — conceptually duplicates another page.
- `DEPRECATE_WITH_REDIRECT` — kept for back-compat; redirects to canonical.
- `REMOVE_AFTER_SAFE_MIGRATION` — Phase 7 cleanup target.

## Deprecated Route Handling

Every legacy route stays mounted until Phase 7. During Phases 2–6:

- `DEPRECATE_WITH_REDIRECT` routes return `<Navigate to={replacedBy} replace />`.
- `DUPLICATE_MERGE_REQUIRED` routes render a thin wrapper that mounts the canonical page with a "Moved to …" banner.

This guarantees zero broken bookmarks during the migration.

## Governance Checks

| Script | Purpose |
|--------|---------|
| `check-admin-domain-budget.ts` | Top-level domain count ≤ 12. |
| `check-admin-route-registry-conformance.ts` | Every route in `AdminRoutes.tsx` exists in the registry. |
| `check-admin-page-classification-coverage.ts` | Every page on disk has a classification (curated or inferred). |
| `check-admin-ia.ts` | Admin pages live under canonical shells. |
| `check-admin-route-coherence.ts` | No duplicate or overlapping admin paths. |
| `check-owner-workflow-map.ts` | Workflow entries resolve to known domain hubs. |
