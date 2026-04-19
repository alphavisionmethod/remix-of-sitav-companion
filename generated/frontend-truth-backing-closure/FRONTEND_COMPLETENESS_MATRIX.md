# Frontend Completeness Matrix

> Per-surface scorecard: provenance visible / evidence drilldowns / canonical
> chips / canonical empty-state. Snapshot taken **after** this closure pass.

| Surface | Provenance | Evidence drilldowns | Canonical chips | Canonical empty-state | Notes |
|---|---|---|---|---|---|
| Boardroom briefing (ConciergeBoardroom) | ✅ ProvenanceChip "AI gateway · live" | ✅ Connector truth + nightly truth | ✅ existing | n/a (always populated) | Additive header row |
| Concierge boardroom | ✅ same as above | ✅ same | ✅ | n/a | Same page |
| Communications | ✅ via ConnectorStateBadge | ✅ via /admin/integrations drilldown | ✅ | ✅ | No flagship page in build; canonical chips already present |
| Admin AI Runtime nightly truth | ✅ ProvenanceChip "ai_runtime_nightly_runs" | ✅ 4 EvidenceLinks (receipts, ledger, fallback events, providers) | ✅ | ✅ NeedsHistoricalReleasesExplainer | New "Evidence sources" card |
| Admin Integrations streak panel | ✅ ProvenanceChip "oauth_refresh_probe_results" | ✅ /admin/integrations remediation | ✅ | ✅ thin "no data" preserved (≤ 7d window) | New OperatorActionPanel for reauth |
| Connector truth summary (AI Engineer hub) | ✅ per-provider ProvenanceChip | ✅ per-provider EvidenceLink Drilldown | ✅ | ✅ NeedsHistoricalReleasesExplainer | Bonus surface — same primitives |

## Validator coverage map

| Validator | Scope | First-run result |
|---|---|---|
| `check-thin-admin-empty-states` | `src/pages/admin`, `src/components/admin` | ok=true, 0 warnings |
| `check-no-dead-cta-on-production-surfaces` | 4 in-scope surface files | ok=true, 0 warnings |
| `check-qualified-surface-copy` | 4 in-scope surface files | ok=true, 0 warnings |
| `check-provider-state-chip-consistency` | admin / integrations / ai-runtime / communications | ok=true, 582 warnings (adoption tracker — see report below) |
| `check-responsive-admin-layout-integrity` | `src/pages/admin` | ok=true, 0 warnings |
| `check-simulation-disclosure-coverage` | ai-runtime / integrations / pages/admin | ok=true, 47 warnings (adoption tracker) |

All gates classified as **WARN-tier adoption trackers**: errorCount=0 is the
ship criterion; warning counts surface real adoption debt without blocking.

## Primitive adoption snapshot

| Primitive | Class | Files using it (post-pass) |
|---|---|---|
| `ProvenanceChip` | NEW (composes StatusBadge + Link) | 4 surfaces |
| `EvidenceLink` | NEW (composes Button asChild + Link) | 4 surfaces |
| `OperatorActionPanel` | existing canonical | + 1 new adoption (IntegrationStreakPanel remediation) |
| `ConnectorStateBadge` | existing canonical | unchanged — already canonical everywhere in scope |
| `StatusBadge` | existing canonical | unchanged |

Zero new component families. Both new primitives are thin compositions.
