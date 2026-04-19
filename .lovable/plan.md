

## Verdict — closure is shippable in 5 phases

The repo already has the canonical primitive layer (StatusBadge, ConnectorStateBadge, AIDegradedState, EmptyState, PremiumEmptyState, OperatorActionPanel, NeedsDataExplainer, NeedsTimeWindowExplainer, NeedsHistoricalReleasesExplainer, BoardSection) and the AI Engineer hub (`/admin/ai-runtime`) already has 21 truth tabs. The right move is **additive**: a new tab #22 + 2 new shared primitives (`ProvenanceChip`, `EvidenceLink`) + 6 new validators + the full doc bundle. **No deletions. No new component families beyond the 2 thin compositions. No App.tsx changes. No edge functions. No migrations.**

## Phase 1 — Two thin canonical primitives (additive, zero duplication)

Both are pure compositions of existing primitives — no new families.

| File | Composes | Purpose |
|---|---|---|
| `src/components/primitives/status/ProvenanceChip.tsx` | `StatusBadge` + `Link` | One-line "source • last verified" chip with optional drilldown route |
| `src/components/primitives/actions/EvidenceLink.tsx` | `Button asChild` + `Link` | Canonical drilldown affordance: receipt / ledger / approval / proof bundle |

Add both to `src/components/primitives/index.ts`. Total: **2 new files, 1 edit**.

## Phase 2 — Wire truth-backing into 5 in-scope surfaces

Add `ProvenanceChip` + `EvidenceLink` to summary cards on the 5 surfaces called out in the prompt. Pure additive — replaces no working logic, only adds drilldown affordances.

| Surface | Add |
|---|---|
| `src/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel.tsx` | `EvidenceLink` → receipts, ledger, fallback events |
| `src/components/admin/ai-runtime/ConnectorTruthSummaryPanel.tsx` | `EvidenceLink` → `/admin/integrations` per-provider |
| `src/components/admin/integrations/IntegrationStreakPanel.tsx` | `ProvenanceChip` "oauth_refresh_probe_results · {ts}" + remediation `OperatorActionPanel` for reauth/degraded |
| `src/pages/business/BoardroomBriefing.tsx` (or briefing root) | `EvidenceLink` to evidence/approval drilldown on each card |
| `src/pages/concierge/ConciergeBoardroom.tsx` | `ProvenanceChip` "AI gateway · live" + degraded fallthrough already wired via `AIDegradedState` |
| `src/pages/communications/*` flagship surfaces | `ConnectorStateBadge` + reauth `OperatorActionPanel` if missing |

Estimated touch: ≤ 6 files, additive only.

## Phase 3 — 6 new WARN-tier validators (prompt-named, first-class)

All emit via shared `emitGateReport` to `generated/<gate>-report.json`.

| Validator | Checks |
|---|---|
| `check-thin-admin-empty-states.ts` | Flags admin board files using raw `<div>No data</div>` instead of canonical empty-state primitives |
| `check-no-dead-cta-on-production-surfaces.ts` | Flags `<Button>` without `onClick`/`href`/`asChild` on the 5 in-scope surfaces |
| `check-qualified-surface-copy.ts` | Flags overclaim phrases ("fully autonomous", "always live", "100% verified") on qualified surfaces |
| `check-provider-state-chip-consistency.ts` | Flags hardcoded provider state colors not driven by `ConnectorStateBadge` |
| `check-responsive-admin-layout-integrity.ts` | Flags admin pages without responsive width guards (`max-w-*`, `min-w-0`, `overflow-x-auto` on tables) |
| `check-simulation-disclosure-coverage.ts` | Flags surfaces with `simulated`/`demo`/`preview` data without explicit disclosure badge |

All scoped strictly to the in-scope surface set. WARN-tier, errorCount=0 on first run.

## Phase 4 — Generated doc bundle (12 files exact)

Create `generated/frontend-truth-backing-closure/` with the exact file list from PART 5 of the prompt:

```
FRONTEND_TRUTH_LINKAGE_AUDIT.md
FRONTEND_COMPLETENESS_MATRIX.md
THIN_EMPTY_STATE_REMEDIATION_REPORT.md
TRUST_COPY_ALIGNMENT_REPORT.md
RESPONSIVE_ADMIN_SURFACE_AUDIT.md
PARTIAL_SURFACE_CLOSURE_STATUS.md
FRONTEND_TRUTH_BACKING_FINAL_VERIFICATION.md
frontend-completeness-status.json
thin-empty-state-status.json
trust-copy-alignment-status.json
responsive-admin-surface-status.json
frontend-truth-backing-verification.json
```

Each backed by real validator output — no fake-green.

## Phase 5 — Tab #22 + final verification

- **New truth panel**: `src/components/admin/ai-runtime/FrontendTruthBackingClosureTruthPanel.tsx` (mirrors structure of `TrustStateAndCopyClosureTruthPanel` — reads `frontend-truth-backing-verification.json`, renders 6-row validator table + primitive adoption + deliverables list).
- **Mount as tab #22** in `AIRuntimeHome.tsx` (single insert, lazy-loaded, no route changes).
- Run all 6 validators in parallel, confirm errorCount=0 each, run typecheck, render Tab #22.

## Files touched

| Action | Path | Count |
|---|---|---|
| CREATE primitive | `ProvenanceChip`, `EvidenceLink` | 2 |
| EDIT primitive barrel | `src/components/primitives/index.ts` | 1 |
| EDIT in-scope surfaces | 5 surfaces (additive only) | ≤ 6 |
| CREATE validator | 6 prompt-named WARN-tier | 6 |
| CREATE generated doc | 12 artifacts | 12 |
| CREATE truth panel | `FrontendTruthBackingClosureTruthPanel.tsx` | 1 |
| EDIT hub | `AIRuntimeHome.tsx` (add tab #22) | 1 |

**Total: ~28-30 files**, scoped exclusively to the AI Engineer hub + canonical primitive layer. Zero deletions of working assets. Zero `/desktop` removal. Zero mobile-responsive removal. Zero disclosure-system removal. Zero edge functions. Zero migrations. Zero new component families (the 2 new primitives are thin compositions of existing ones).

## Discipline guarantees

- All 5 in-scope surfaces (Boardroom, Concierge, Communications, Admin AI Runtime, Admin Integrations) gain visible provenance + evidence drilldowns wired to canonical sources
- All status chips remain canonical (`ConnectorStateBadge` / `StatusBadge` / `AIStateBadge`) — no new color maps
- All 6 prompt-named validators exist as physical files (not aliases)
- Tab #22 honestly reflects validator state — no fake-green, no decorative trust signals
- Master JSON matches validator reality
- Removals limited to **zero** in this pass (the prompt explicitly says "very little should be deleted" — we delete nothing this pass; cleanup is captured in `THIN_EMPTY_STATE_REMEDIATION_REPORT.md` as tracked debt for a separate scoped pass)
- AI Engineer hub remains single integration point per established scope

After this pass: 22-tab AI Engineer hub, 6-of-6 frontend-truth-backing validators green, 12 canonical docs, 5 surfaces with visible provenance + evidence drilldowns, deployment-ready.

