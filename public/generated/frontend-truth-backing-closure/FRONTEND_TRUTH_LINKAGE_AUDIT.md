# Frontend Truth-Linkage Audit

> Pre-implementation audit of truth linkage across the 5 in-scope surfaces of the
> "Frontend Instrumentation, Truth Backing, Safe Cleanup, and Shared System
> Additions" closure. Scoped strictly to the AI Engineer hub (`/admin/ai-runtime`)
> + canonical primitive layer.

## Method

For each surface we recorded:

1. **Runtime sources consumed today** — DB tables / functions / lib loaders.
2. **Summary states shown** — which cards / chips render derived state.
3. **Provenance visible today** — what the operator can see about *where* the
   truth comes from, *without* opening dev-tools.
4. **Evidence drilldowns missing** — which canonical evidence sources are *not*
   reachable in one click.
5. **Status-chip integrity** — chips that are visually meaningful but
   data-empty (cosmetic) vs. chips wired to canonical state grammar.
6. **Empty-state integrity** — empty states that route the operator vs. dead
   ends.

## Surface 1 — Boardroom briefing (`src/pages/concierge/ConciergeBoardroom.tsx`)

| Dimension | Pre-pass observation |
|---|---|
| Runtime sources | `weeklyStats` (in-component constants) + `DomainAdvisorBoard` (live) |
| Summary states | HeroCard, SummaryCard, QueueCard, TimelineCard, ProofCard |
| Provenance visible | `<PageTruthBanner />` only — no per-card source labels |
| Drilldowns missing | No links from cards to the AI runtime nightly truth nor connector truth |
| Chips | ProofCard chips driven by static `verified` flags |
| Empty states | Not currently exercised on this page — operator-grade copy on cards |

**Action this pass:** add `ProvenanceChip` + `EvidenceLink` row at the top
linking to **AI runtime nightly truth** and **connector truth**. No hype copy,
no autonomous claims. Existing `ProofCard` chain is preserved.

## Surface 2 — Concierge (operator-side, same file)

The Concierge surface is the operator-facing boardroom for life ops. Truth
linkage requirements are identical to Surface 1 above — handled in the same
edit. AI runtime truth lives at `/admin/ai-runtime/nightly-truth`; we now link
to it directly from the Concierge boardroom header.

## Surface 3 — Communications

Communications has no flagship `/pages/communications/*` page in the current
build. Connector health for Comms is fully exposed via the canonical
`ConnectorStateBadge` and `IntegrationStreakPanel` (see Surface 5).

**Action this pass:** none in `pages/communications/*` (does not exist).
`ConnectorStateBadge` already canonical for Comms truth.

## Surface 4 — Admin AI Runtime
(`src/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel.tsx`)

| Dimension | Pre-pass observation |
|---|---|
| Runtime sources | `ai_runtime_nightly_runs`, `ai_runtime_failure_alerts`, streak view |
| Summary states | Streak / Classification / Last Pass / Last Fail cards |
| Provenance visible | Only inline footnote prose ("regenerated nightly … last DB observation") |
| Drilldowns missing | No one-click links to `ai_inference_receipts`, `ai_usage_ledger`, `ai_fallback_events`, provider health |
| Chips | All chips driven by canonical `StatusBadge` with grammar-mapped tones |
| Empty states | Canonical `NeedsHistoricalReleasesExplainer` |

**Action this pass:** add an `Evidence sources` card with a `ProvenanceChip`
for `ai_runtime_nightly_runs` + 4 `EvidenceLink`s (receipts / ledger /
fallback events / provider health). All routes already exist on the hub.

## Surface 5 — Admin Integrations
(`src/components/admin/integrations/IntegrationStreakPanel.tsx`)

| Dimension | Pre-pass observation |
|---|---|
| Runtime sources | `oauth_refresh_probe_results` |
| Summary states | Per-provider 7-day grid driven by canonical `ConnectorStateBadge` |
| Provenance visible | Only header subtitle naming the source table |
| Drilldowns missing | No remediation panel for reauth-required / failing providers |
| Chips | Canonical `ConnectorStateBadge` everywhere |
| Empty states | "No probe data in the last 7 days" — adequate but not actionable |

**Action this pass:** add `ProvenanceChip` for `oauth_refresh_probe_results`
in the header. When the worst-of-now state is `reauth_required`, `degraded`,
or `failing`, render a canonical `OperatorActionPanel` with a remediation
button → `/admin/integrations`.

## Bonus surface — Connector Truth Summary (`ConnectorTruthSummaryPanel`)

`ConnectorTruthSummaryPanel` is the AI Engineer team's read-only mirror of
connector truth. Per-provider tile gets a `ProvenanceChip` for
`oauth_refresh_probe_results` + an `EvidenceLink` Drilldown to
`/admin/integrations?provider=…` so operators can pivot from the AI Engineer
hub directly to the canonical control surface in one click.

## Out of scope (explicitly preserved)

- `/desktop` route: preserved (per closure prompt).
- Mobile-responsive web UI: preserved.
- Simulation/disclosure components: preserved.
- All asset libraries: preserved.

Zero deletions in this pass.
