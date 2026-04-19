# Admin Visual Coherence Audit

_Generated as part of the Admin Coherence and Responsive Quality Closure pass._
_Scope: read-only inspection across the 12 admin domains. Source edits are tracked separately under Phase 3+._

## Scope

The 12 admin domains audited:

1. Overview          (`/admin/overview/*`)
2. Alerts            (`/admin/alerts/*`)
3. Approvals         (`/admin/approvals/*`)
4. Environments      (`/admin/environments/*`)
5. AI-Runtime        (`/admin/ai-runtime/*`)   — primary integration owner of this pass
6. Integrations      (`/admin/integrations/*`)
7. Trust-Security    (`/admin/trust-security/*`)
8. Health            (`/admin/health/*`)
9. Releases          (`/admin/releases/*`)
10. Verification     (`/admin/verification/*`)
11. Config           (`/admin/config/*`)
12. Support          (`/admin/support/*`)

## Method

For each domain hub the following surface-level patterns were inspected:

- **empty-state** primitive used (`PremiumEmptyState` / `EmptyState` / inline `<p>` text)
- **action-panel** ordering (primary / remediation / next / related / evidence)
- **status color** semantics (`StatusBadge` tone vs hardcoded Tailwind color)
- **microcopy tone** (calm / precise vs decorative / casual)
- **header pattern** (Card + CardHeader + CardTitle vs ad-hoc `<h2>`)

## Findings

### Empty-state inconsistencies (highest priority)

| Domain         | Pattern observed                                               | Recommendation                                                    |
|----------------|----------------------------------------------------------------|-------------------------------------------------------------------|
| Overview       | Mix of `EmptyState` + raw `<p className="text-muted-foreground">No …</p>` | Adopt `PremiumEmptyState` via `BoardSection`                      |
| Alerts         | `BoardSection` (canonical) — ✅ coherent                        | Maintain                                                          |
| Approvals      | `EmptyState` primitive — ✅ coherent                            | Maintain                                                          |
| Environments   | Some boards still emit raw "No environments configured" text   | Adopt `EmptyState` or `NeedsDataExplainer`                        |
| AI-Runtime     | `BoardSection` + `PremiumEmptyState` — ✅ canonical             | Reference implementation                                          |
| Integrations   | Canonical (uses `ConnectorStateBadge` + `EmptyState`) — ✅      | Maintain                                                          |
| Trust-Security | Mix; some boards inline text                                   | Migrate to `BoardSection`                                          |
| Health         | Mostly canonical after cost-spotlight pass                     | Continue migration on lower-traffic boards                        |
| Releases       | Canonical after sbom-history pass                              | Maintain                                                          |
| Verification   | Canonical after cross-domain-coherence pass                    | Maintain                                                          |
| Config         | Several boards inline empty text                               | Adopt `EmptyState`                                                 |
| Support        | `BoardSection` — ✅ coherent                                    | Maintain                                                          |

### Action-panel hierarchy

Most boards order actions ad hoc. The recommended canonical ordering (codified in `OperatorActionPanel`):

1. **primary** (the principal next operator action)
2. **remediation** (only when in degraded / failing state)
3. **next** (suggested next-step navigation)
4. **related** (sibling / lateral inspection links)
5. **evidence** (drilldown to receipts / proof bundles)

### Status semantics

- `StatusBadge` already enforces a fixed tone palette. Surfaces using inline `bg-yellow-500/10` or `text-red-400` instead of `<StatusBadge tone="warning">` were flagged.
- The `check-admin-status-semantics` validator (this pass) bans hardcoded `bg-yellow-*` / `bg-red-*` / `bg-green-*` outside `StatusBadge` in `src/pages/admin/**` and `src/components/admin/**`.

### Microcopy

Forbidden phrases detected on at least one admin surface in prior passes:

- "Coming soon"
- "Check back later"
- "Nothing here yet" (used as raw text instead of operator-grade copy)
- "Stay tuned"

The `check-admin-microcopy-rules` validator (this pass) flags any of these phrases in `src/pages/admin/**`.

## Verdict

The admin plane is **substantially coherent** after the prior empty-state-closure passes (3 surfaces shipped + 4 validators GREEN). The remaining gap is **adoption breadth** — a handful of lower-traffic boards still inline empty-state text or use ad-hoc status colors. This pass adds the canonical primitives + validators that future PRs will use to close that gap.

Reference implementation: **`src/pages/admin/ai-runtime/*`** uses the canonical pattern end-to-end and is the model for the rest of the admin plane.
