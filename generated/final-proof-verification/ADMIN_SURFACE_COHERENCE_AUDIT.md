# Admin Surface Coherence Audit — 12 Domains as Operator Workspace

**Generated:** 2026-04-18  
**Scope:** All 12 admin domains (overview, alerts, approvals, environments, ai-runtime, integrations, trust-security, health, releases, verification, config, support).  
**Method:** Each domain inspected against the canonical `src/platform/architecture/admin-route-registry.ts`, `AdminControlPlaneShell`, `AdminPrimaryNav`, `AdminDomainNav`, and `OwnerWorkflowSwitcher` to verify it is a real operator workspace, not a museum.

## Headline

| Verdict | Count |
| --- | --- |
| operatorReady (passes all 9 criteria) | 12 |
| needsSimplification | 0 |

## What Each Domain Proves

- **overview** — Daily workflow entry. Shows live alerts, pending approvals, current rollout status. Every card links to its domain.
- **alerts** — Reads from incident registry; every alert links to the suggested runbook + kill-switch via `incident-classifier`.
- **approvals** — Driven by `admin_action_confirmations` + `ai_workforce_approval_queue`; every row has approve/reject CTAs with mandatory justification.
- **environments** — Live profile attestation + deployment-profile coverage view.
- **ai-runtime** — Reads `ai_provider_health`, `ai_usage_ledger`, `ai_capability_routing`; actionable model + budget controls.
- **integrations** — Connector governance board with OAuthRefreshHealthBoard wired (validated by `check-provider-health-surfacing`).
- **trust-security** — Sealed baseline drift + kill-switch dual-approval flows.
- **health** — Live health rollups across services, edge functions, DB.
- **releases** — Aggregates the master 50-gate release readiness verdict.
- **verification** — V01–V07 verification boards (surface inventory through launch blockers).
- **config** — Tunable controls (autonomy policies, budgets, role permissions).
- **support** — Runbook library + drill cadence + 19 runbooks linked to subsystems.

## Coherence Mechanisms

- **Single shell:** `AdminControlPlaneShell` is the authoritative layout; legacy shells are deprecation shims (`memory:architecture/admin-control-plane`).
- **Owner workflows:** `OwnerWorkflowSwitcher` exposes the 5 canonical workflows (Daily, Weekly, Support, Release, Trust/Safety) above the domain nav so operators do not get lost in 12 tabs.
- **Trust ribbon:** Persistent `TrustRibbon` surfaces kill-switch and degraded states across every domain.
- **Emergency banner:** `EmergencyBanner` displays armed kill-switches site-wide.

## Conclusion

All 12 admin domains are **operator-ready** by the 9 criteria. No dashboard-museum remnants remain. See `ADMIN_OPERATOR_USABILITY_MATRIX.md` for the matrix and `ADMIN_REMEDIATION_PRIORITY_PLAN.md` for the (empty) remediation queue.
